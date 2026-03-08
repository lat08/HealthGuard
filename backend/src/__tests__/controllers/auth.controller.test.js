jest.mock('../../services/auth.service');

const authService = require('../../services/auth.service');
const authController = require('../../controllers/auth.controller');

// Helper: mock req, res, next
const mockReq = (body = {}, overrides = {}) => ({
  body,
  ip: '127.0.0.1',
  headers: { 'user-agent': 'Jest' },
  user: { id: 1 },
  ...overrides,
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe('authController', () => {

  // ═══════════════════════════════════════════════════════
  // login
  // ═══════════════════════════════════════════════════════
  describe('login', () => {
    it('should throw 400 if email missing', async () => {
      const req = mockReq({ password: '123' });
      const res = mockRes();
      const next = jest.fn();

      await authController.login(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('should throw 400 if password missing', async () => {
      const req = mockReq({ email: 'a@a.com' });
      const res = mockRes();
      const next = jest.fn();

      await authController.login(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('should set cookie and return user on success', async () => {
      authService.loginUser.mockResolvedValue({
        token: 'jwt-123',
        user: { id: 1, email: 'a@a.com', full_name: 'Test', role: 'admin' },
      });

      const req = mockReq({ email: 'a@a.com', password: 'password123' });
      const res = mockRes();
      const next = jest.fn();

      await authController.login(req, res, next);

      expect(res.cookie).toHaveBeenCalledWith('hg_token', 'jwt-123', expect.objectContaining({ httpOnly: true }));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ user: expect.objectContaining({ email: 'a@a.com' }) }),
        })
      );
    });
  });

  // ═══════════════════════════════════════════════════════
  // register
  // ═══════════════════════════════════════════════════════
  describe('register', () => {
    it('should throw 400 if required fields missing', async () => {
      const req = mockReq({ email: 'a@a.com' }); // missing other fields
      const res = mockRes();
      const next = jest.fn();

      await authController.register(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('should throw 403 if role is admin', async () => {
      const req = mockReq({
        email: 'a@a.com', password: '12345678', fullName: 'Test', phone: '0912345678',
        dateOfBirth: '2000-01-01', role: 'admin',
      });
      const res = mockRes();
      const next = jest.fn();

      await authController.register(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
    });

    it('should return 201 on success', async () => {
      authService.registerUser.mockResolvedValue({ userId: 10, email: 'new@test.com' });
      const req = mockReq({
        email: 'new@test.com', password: '12345678', fullName: 'Test', phone: '0912345678',
        dateOfBirth: '2000-01-01', role: 'patient',
      });
      const res = mockRes();
      const next = jest.fn();

      await authController.register(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  // ═══════════════════════════════════════════════════════
  // forgotPassword
  // ═══════════════════════════════════════════════════════
  describe('forgotPassword', () => {
    it('should throw 400 if email missing', async () => {
      const req = mockReq({});
      const res = mockRes();
      const next = jest.fn();

      await authController.forgotPassword(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('should return 200 on success', async () => {
      authService.requestPasswordReset.mockResolvedValue({ message: 'OK' });
      const req = mockReq({ email: 'a@a.com' });
      const res = mockRes();
      const next = jest.fn();

      await authController.forgotPassword(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  // ═══════════════════════════════════════════════════════
  // resetPassword
  // ═══════════════════════════════════════════════════════
  describe('resetPassword', () => {
    it('should throw 400 if fields missing', async () => {
      const req = mockReq({ token: 'tok' });
      const res = mockRes();
      const next = jest.fn();

      await authController.resetPassword(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('should return 200 on success', async () => {
      authService.resetPassword.mockResolvedValue({ message: 'OK' });
      const req = mockReq({ token: 't', newPassword: 'p', confirmPassword: 'p' });
      const res = mockRes();
      const next = jest.fn();

      await authController.resetPassword(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  // ═══════════════════════════════════════════════════════
  // changePassword
  // ═══════════════════════════════════════════════════════
  describe('changePassword', () => {
    it('should throw 400 if fields missing', async () => {
      const req = mockReq({ currentPassword: 'old' });
      const res = mockRes();
      const next = jest.fn();

      await authController.changePassword(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('should return 200 on success', async () => {
      authService.changePassword.mockResolvedValue({ message: 'OK' });
      const req = mockReq({ currentPassword: 'old', newPassword: 'new', confirmPassword: 'new' });
      const res = mockRes();
      const next = jest.fn();

      await authController.changePassword(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  // ═══════════════════════════════════════════════════════
  // logout
  // ═══════════════════════════════════════════════════════
  describe('logout', () => {
    it('should clear cookie and return success', async () => {
      const req = mockReq();
      const res = mockRes();
      const next = jest.fn();

      await authController.logout(req, res, next);
      expect(res.clearCookie).toHaveBeenCalledWith('hg_token');
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  // ═══════════════════════════════════════════════════════
  // getMe
  // ═══════════════════════════════════════════════════════
  describe('getMe', () => {
    it('should return req.user', async () => {
      const user = { id: 1, email: 'a@a.com', role: 'admin', full_name: 'Admin' };
      const req = mockReq({}, { user });
      const res = mockRes();
      const next = jest.fn();

      await authController.getMe(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ data: user })
      );
    });
  });
});
