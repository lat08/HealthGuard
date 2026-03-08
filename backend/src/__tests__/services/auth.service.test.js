jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../utils/prisma');
jest.mock('../../utils/email');
jest.mock('../../config/env', () => ({
  JWT_SECRET: 'test-secret',
  JWT_EXPIRES_IN: '24h',
  FRONTEND_URL: 'http://localhost:5173',
}));

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../utils/prisma');
const { sendPasswordResetEmail, sendPasswordChangedEmail } = require('../../utils/email');
const authService = require('../../services/auth.service');
const ApiError = require('../../utils/ApiError');

prisma.password_reset_tokens = {
  create: jest.fn(),
  findFirst: jest.fn(),
  update: jest.fn(),
};
prisma.$transaction = jest.fn(async (args) => {
  const results = [];
  for (const query of args) {
    results.push(await query);
  }
  return results;
});

describe('authService', () => {

  // ═══════════════════════════════════════════════════════
  // loginUser
  // ═══════════════════════════════════════════════════════
  describe('loginUser', () => {
    const validLogin = { email: 'test@test.com', password: 'password123' };

    it('should throw 400 for invalid email format', async () => {
      await expect(authService.loginUser({ email: 'not-email', password: '123' }))
        .rejects.toThrow('Email không đúng định dạng');
    });

    it('should throw 401 if user not found', async () => {
      prisma.users.findUnique.mockResolvedValue(null);
      prisma.audit_logs.create.mockResolvedValue({});

      await expect(authService.loginUser(validLogin, '127.0.0.1', 'Mozilla'))
        .rejects.toThrow('Email hoặc mật khẩu không đúng');
    });

    it('should throw 423 if account is inactive (is_active=false)', async () => {
      prisma.users.findUnique.mockResolvedValue({ id: 1, email: 'test@test.com', is_active: false });
      prisma.audit_logs.create.mockResolvedValue({});

      await expect(authService.loginUser(validLogin, '127.0.0.1', 'Mozilla'))
        .rejects.toThrow('Tài khoản đã bị khoá');
    });

    it('should throw 423 if account is temporarily locked', async () => {
      prisma.users.findUnique.mockResolvedValue({
        id: 1, email: 'test@test.com', is_active: true,
        locked_until: new Date(Date.now() + 60000), // locked 1 min in future
      });

      await expect(authService.loginUser(validLogin, '127.0.0.1', 'Mozilla'))
        .rejects.toThrow('Tài khoản đang bị tạm khóa');
    });

    it('should throw 401 if email not verified', async () => {
      prisma.users.findUnique.mockResolvedValue({
        id: 1, email: 'test@test.com', is_active: true, is_verified: false, locked_until: null,
      });

      await expect(authService.loginUser(validLogin, '127.0.0.1', 'Mozilla'))
        .rejects.toThrow('Tài khoản chưa được xác thực email');
    });

    it('should throw 401 and increment failed_login_attempts on wrong password', async () => {
      prisma.users.findUnique.mockResolvedValue({
        id: 1, email: 'test@test.com', is_active: true, is_verified: true,
        locked_until: null, password_hash: 'hashed', failed_login_attempts: 0,
      });
      bcrypt.compare.mockResolvedValue(false);
      prisma.users.update.mockResolvedValue({});
      prisma.audit_logs.create.mockResolvedValue({});

      await expect(authService.loginUser(validLogin, '127.0.0.1', 'Mozilla'))
        .rejects.toThrow('Email hoặc mật khẩu không đúng');

      expect(prisma.users.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ failed_login_attempts: 1 }),
        })
      );
    });

    it('should lock account after 5 failed attempts', async () => {
      prisma.users.findUnique.mockResolvedValue({
        id: 1, email: 'test@test.com', is_active: true, is_verified: true,
        locked_until: null, password_hash: 'hashed', failed_login_attempts: 4,
      });
      bcrypt.compare.mockResolvedValue(false);
      prisma.users.update.mockResolvedValue({});
      prisma.audit_logs.create.mockResolvedValue({});

      await expect(authService.loginUser(validLogin, '127.0.0.1', 'Mozilla')).rejects.toThrow();

      expect(prisma.users.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            failed_login_attempts: 5,
            locked_until: expect.any(Date),
          }),
        })
      );
    });

    it('should return token and user on successful login', async () => {
      const mockUser = {
        id: 1, email: 'test@test.com', full_name: 'Test User', role: 'admin',
        is_active: true, is_verified: true, locked_until: null,
        password_hash: 'hashed', failed_login_attempts: 0, token_version: 0,
      };
      prisma.users.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      prisma.users.update.mockResolvedValue({});
      prisma.audit_logs.create.mockResolvedValue({});
      jwt.sign.mockReturnValue('jwt-token-123');

      const result = await authService.loginUser(validLogin, '127.0.0.1', 'Mozilla');

      expect(result.token).toBe('jwt-token-123');
      expect(result.user).toEqual({
        id: 1, email: 'test@test.com', full_name: 'Test User', role: 'admin',
      });
      // Should reset failed_login_attempts
      expect(prisma.users.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ failed_login_attempts: 0, locked_until: null }),
        })
      );
    });
  });

  // ═══════════════════════════════════════════════════════
  // registerUser
  // ═══════════════════════════════════════════════════════
  describe('registerUser', () => {
    const validData = {
      email: 'new@test.com',
      password: 'password123',
      fullName: 'Nguyễn Văn A',
      phone: '0912345678',
      dateOfBirth: '2000-01-01',
      role: 'patient',
    };

    it('should throw 400 for invalid email', async () => {
      await expect(authService.registerUser({ ...validData, email: 'bad' }, 1))
        .rejects.toThrow('Email không đúng định dạng');
    });

    it('should throw 409 if email already exists', async () => {
      prisma.users.findUnique.mockResolvedValue({ id: 99 });
      await expect(authService.registerUser(validData, 1))
        .rejects.toThrow('Email đã được sử dụng');
    });

    it('should throw 400 for password too short', async () => {
      prisma.users.findUnique.mockResolvedValue(null);
      await expect(authService.registerUser({ ...validData, password: '123' }, 1))
        .rejects.toThrow('Mật khẩu phải có ít nhất 8 ký tự');
    });

    it('should throw 400 for invalid fullName', async () => {
      prisma.users.findUnique.mockResolvedValue(null);
      await expect(authService.registerUser({ ...validData, fullName: '123@#$' }, 1))
        .rejects.toThrow('Họ tên không hợp lệ');
    });

    it('should throw 400 for invalid phone', async () => {
      prisma.users.findUnique.mockResolvedValue(null);
      await expect(authService.registerUser({ ...validData, phone: '12345' }, 1))
        .rejects.toThrow('Số điện thoại không hợp lệ');
    });

    it('should throw 400 for age < 13', async () => {
      prisma.users.findUnique.mockResolvedValue(null);
      const recentDate = new Date();
      recentDate.setFullYear(recentDate.getFullYear() - 10);
      await expect(authService.registerUser({ ...validData, dateOfBirth: recentDate.toISOString() }, 1))
        .rejects.toThrow('Người dùng phải từ 13 tuổi trở lên');
    });

    it('should throw 400 for invalid role', async () => {
      prisma.users.findUnique.mockResolvedValue(null);
      await expect(authService.registerUser({ ...validData, role: 'admin' }, 1))
        .rejects.toThrow('Role phải là "patient" hoặc "caregiver"');
    });

    it('should create user successfully', async () => {
      prisma.users.findUnique.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed-password');
      prisma.users.create.mockResolvedValue({ id: 10, email: 'new@test.com' });
      prisma.audit_logs.create.mockResolvedValue({});

      const result = await authService.registerUser(validData, 1);
      expect(result).toEqual({ userId: 10, email: 'new@test.com' });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });
  });

  // ═══════════════════════════════════════════════════════
  // requestPasswordReset
  // ═══════════════════════════════════════════════════════
  describe('requestPasswordReset', () => {
    it('should throw 400 for invalid email format', async () => {
      await expect(authService.requestPasswordReset({ email: 'bad' }))
        .rejects.toThrow('Email không đúng định dạng');
    });

    it('should return success message even if user not found (anti-enumeration)', async () => {
      prisma.users.findUnique.mockResolvedValue(null);
      const result = await authService.requestPasswordReset({ email: 'nobody@test.com' });
      expect(result.message).toContain('Nếu email tồn tại');
    });

    it('should send reset email if user found', async () => {
      prisma.users.findUnique.mockResolvedValue({ id: 1, email: 'u@test.com' });
      jwt.sign.mockReturnValue('reset-token');
      prisma.password_reset_tokens.create.mockResolvedValue({});
      prisma.audit_logs.create.mockResolvedValue({});
      sendPasswordResetEmail.mockResolvedValue(undefined);

      const result = await authService.requestPasswordReset({ email: 'u@test.com' });
      expect(sendPasswordResetEmail).toHaveBeenCalledWith('u@test.com', expect.stringContaining('reset-token'));
      expect(result.message).toContain('Nếu email tồn tại');
    });
  });

  // ═══════════════════════════════════════════════════════
  // resetPassword
  // ═══════════════════════════════════════════════════════
  describe('resetPassword', () => {
    it('should throw 400 if passwords do not match', async () => {
      await expect(authService.resetPassword({ token: 't', newPassword: 'password1', confirmPassword: 'password2' }))
        .rejects.toThrow('Mật khẩu xác nhận không khớp');
    });

    it('should throw 400 if password too short', async () => {
      await expect(authService.resetPassword({ token: 't', newPassword: '123', confirmPassword: '123' }))
        .rejects.toThrow('Mật khẩu phải có ít nhất 8 ký tự');
    });

    it('should throw 400 if token expired', async () => {
      const expErr = new Error('expired');
      expErr.name = 'TokenExpiredError';
      jwt.verify.mockImplementation(() => { throw expErr; });

      await expect(authService.resetPassword({ token: 't', newPassword: '12345678', confirmPassword: '12345678' }))
        .rejects.toThrow('Link đặt lại mật khẩu đã hết hạn');
    });

    it('should throw 400 if token type is not password_reset', async () => {
      jwt.verify.mockReturnValue({ userId: 1, type: 'auth' });

      await expect(authService.resetPassword({ token: 't', newPassword: '12345678', confirmPassword: '12345678' }))
        .rejects.toThrow('Token không phải loại reset password');
    });

    it('should throw 400 if token not found or already used in DB', async () => {
      jwt.verify.mockReturnValue({ userId: 1, type: 'password_reset' });
      prisma.password_reset_tokens.findFirst.mockResolvedValue(null);

      await expect(authService.resetPassword({ token: 't', newPassword: '12345678', confirmPassword: '12345678' }))
        .rejects.toThrow('Link đặt lại mật khẩu không hợp lệ hoặc đã được sử dụng');
    });

    it('should throw 404 if user not found', async () => {
      jwt.verify.mockReturnValue({ userId: 1, type: 'password_reset' });
      prisma.password_reset_tokens.findFirst.mockResolvedValue({ id: 1, used_at: null });
      prisma.users.findFirst.mockResolvedValue(null);

      await expect(authService.resetPassword({ token: 't', newPassword: '12345678', confirmPassword: '12345678' }))
        .rejects.toThrow('Người dùng không tồn tại');
    });

    it('should throw 400 if new password same as old', async () => {
      jwt.verify.mockReturnValue({ userId: 1, type: 'password_reset' });
      prisma.password_reset_tokens.findFirst.mockResolvedValue({ id: 1, used_at: null });
      prisma.users.findFirst.mockResolvedValue({ id: 1, password_hash: 'old-hash' });
      bcrypt.compare.mockResolvedValue(true); // same password

      await expect(authService.resetPassword({ token: 't', newPassword: '12345678', confirmPassword: '12345678' }))
        .rejects.toThrow('Mật khẩu mới không được trùng với mật khẩu cũ');
    });

    it('should reset password successfully', async () => {
      jwt.verify.mockReturnValue({ userId: 1, type: 'password_reset' });
      prisma.password_reset_tokens.findFirst.mockResolvedValue({ id: 1, used_at: null });
      prisma.users.findFirst.mockResolvedValue({ id: 1, password_hash: 'old-hash' });
      bcrypt.compare.mockResolvedValue(false); // different password
      bcrypt.hash.mockResolvedValue('new-hash');
      prisma.users.update.mockResolvedValue({});
      prisma.password_reset_tokens.update.mockResolvedValue({});
      prisma.audit_logs.create.mockResolvedValue({});

      const result = await authService.resetPassword({ token: 't', newPassword: '12345678', confirmPassword: '12345678' });
      expect(result.message).toBe('Đặt lại mật khẩu thành công');
      expect(prisma.users.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ password_hash: 'new-hash', token_version: { increment: 1 } }),
        })
      );
      expect(prisma.password_reset_tokens.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ used_at: expect.any(Date) }),
        })
      );
    });
  });

  // ═══════════════════════════════════════════════════════
  // changePassword
  // ═══════════════════════════════════════════════════════
  describe('changePassword', () => {
    const validChange = {
      userId: 1, currentPassword: 'oldPass123', newPassword: 'newPass123', confirmPassword: 'newPass123',
    };

    it('should throw 400 if passwords do not match', async () => {
      await expect(authService.changePassword({ ...validChange, confirmPassword: 'wrong' }))
        .rejects.toThrow('Mật khẩu xác nhận không khớp');
    });

    it('should throw 400 if new password too short', async () => {
      await expect(authService.changePassword({ ...validChange, newPassword: '123', confirmPassword: '123' }))
        .rejects.toThrow('Mật khẩu phải có ít nhất 8 ký tự');
    });

    it('should throw 404 if user not found', async () => {
      prisma.users.findFirst.mockResolvedValue(null);
      await expect(authService.changePassword(validChange))
        .rejects.toThrow('Người dùng không tồn tại');
    });

    it('should throw 401 if current password is wrong', async () => {
      prisma.users.findFirst.mockResolvedValue({ id: 1, password_hash: 'hashed' });
      bcrypt.compare.mockResolvedValueOnce(false); // currentPassword wrong
      prisma.audit_logs.create.mockResolvedValue({});

      await expect(authService.changePassword(validChange))
        .rejects.toThrow('Mật khẩu hiện tại không đúng');
    });

    it('should throw 400 if new password same as old', async () => {
      prisma.users.findFirst.mockResolvedValue({ id: 1, password_hash: 'hashed' });
      bcrypt.compare.mockResolvedValueOnce(true);  // currentPassword correct
      bcrypt.compare.mockResolvedValueOnce(true);  // newPassword same as old
      prisma.audit_logs.create.mockResolvedValue({});

      await expect(authService.changePassword(validChange))
        .rejects.toThrow('Mật khẩu mới không được trùng với mật khẩu cũ');
    });

    it('should change password successfully', async () => {
      prisma.users.findFirst.mockResolvedValue({ id: 1, password_hash: 'hashed', email: 'u@u.com', full_name: 'User' });
      bcrypt.compare.mockResolvedValueOnce(true);   // currentPassword correct
      bcrypt.compare.mockResolvedValueOnce(false);   // newPassword different
      bcrypt.hash.mockResolvedValue('new-hash');
      prisma.users.update.mockResolvedValue({});
      prisma.audit_logs.create.mockResolvedValue({});
      sendPasswordChangedEmail.mockResolvedValue(undefined);

      const result = await authService.changePassword(validChange);
      expect(result.message).toBe('Đổi mật khẩu thành công');
      expect(sendPasswordChangedEmail).toHaveBeenCalledWith('u@u.com', 'User');
    });
  });

  // ═══════════════════════════════════════════════════════
  // _logAudit
  // ═══════════════════════════════════════════════════════
  describe('_logAudit', () => {
    it('should not throw even if audit log fails', async () => {
      prisma.audit_logs.create.mockRejectedValue(new Error('DB error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(authService._logAudit({ action: 'TEST' })).resolves.toBeUndefined();
      consoleSpy.mockRestore();
    });
  });
});
