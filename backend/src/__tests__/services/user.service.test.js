jest.mock('../../utils/prisma');
jest.mock('../../utils/email');
jest.mock('bcryptjs');

const prisma = require('../../utils/prisma');
const bcrypt = require('bcryptjs');
const userService = require('../../services/user.service');
const ApiError = require('../../utils/ApiError');
const { sendAccountLockedEmail } = require('../../utils/email');

describe('userService', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════
  // findAll
  // ═══════════════════════════════════════════════════════
  describe('findAll', () => {
    it('should return paginated data with defaults', async () => {
      prisma.users.findMany.mockResolvedValue([{ id: 1, email: 'a@a.com' }]);
      prisma.users.count.mockResolvedValue(1);

      const result = await userService.findAll({});
      expect(result).toEqual({ data: [{ id: 1, email: 'a@a.com' }], total: 1, page: 1, limit: 20 });
    });

    it('should apply role filter', async () => {
      prisma.users.findMany.mockResolvedValue([]);
      prisma.users.count.mockResolvedValue(0);

      await userService.findAll({ role: 'admin' });
      expect(prisma.users.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ role: 'admin' }) })
      );
    });

    it('should apply is_active filter', async () => {
      prisma.users.findMany.mockResolvedValue([]);
      prisma.users.count.mockResolvedValue(0);

      await userService.findAll({ is_active: true });
      expect(prisma.users.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ is_active: true }) })
      );
    });

    it('should apply search filter on full_name and email', async () => {
      prisma.users.findMany.mockResolvedValue([]);
      prisma.users.count.mockResolvedValue(0);

      await userService.findAll({ search: 'test' });
      expect(prisma.users.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ full_name: expect.objectContaining({ contains: 'test' }) }),
            ]),
          }),
        })
      );
    });

    it('should apply gender filter', async () => {
      prisma.users.findMany.mockResolvedValue([]);
      prisma.users.count.mockResolvedValue(0);

      await userService.findAll({ gender: 'male' });
      expect(prisma.users.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ gender: 'male' }) })
      );
    });

    it('should apply blood_type filter', async () => {
      prisma.users.findMany.mockResolvedValue([]);
      prisma.users.count.mockResolvedValue(0);

      await userService.findAll({ blood_type: 'O+' });
      expect(prisma.users.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ blood_type: 'O+' }) })
      );
    });

    it('should apply is_verified filter', async () => {
      prisma.users.findMany.mockResolvedValue([]);
      prisma.users.count.mockResolvedValue(0);

      await userService.findAll({ is_verified: true });
      expect(prisma.users.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ is_verified: true }) })
      );
    });

    it('should handle custom pagination', async () => {
      prisma.users.findMany.mockResolvedValue([]);
      prisma.users.count.mockResolvedValue(0);

      await userService.findAll({ page: 3, limit: 10 });
      expect(prisma.users.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 })
      );
    });
  });

  // ═══════════════════════════════════════════════════════
  // findById
  // ═══════════════════════════════════════════════════════
  describe('findById', () => {
    it('should return user if found', async () => {
      const user = { id: 1, email: 'u@u.com' };
      prisma.users.findFirst.mockResolvedValue(user);

      const result = await userService.findById(1);
      expect(result).toEqual(user);
    });

    it('should throw 404 if user not found', async () => {
      prisma.users.findFirst.mockResolvedValue(null);

      await expect(userService.findById(999)).rejects.toThrow('User không tồn tại');
    });
  });

  // ═══════════════════════════════════════════════════════
  // create — email uniqueness, password hashing, audit log
  // ═══════════════════════════════════════════════════════
  describe('create', () => {
    const createData = {
      email: 'new@test.com',
      password: 'Secret@123!',
      full_name: 'New User',
      phone: '0901234567',
      role: 'patient',
    };

    it('should throw 409 if email already exists', async () => {
      prisma.users.findUnique.mockResolvedValue({ id: 1, email: 'new@test.com' });

      await expect(userService.create(createData, 1)).rejects.toThrow('Email đã được sử dụng');
    });

    it('should hash password and create user', async () => {
      prisma.users.findUnique.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('$hashed_password$');
      prisma.users.create.mockResolvedValue({ id: 5, email: 'new@test.com', full_name: 'New User', role: 'patient' });
      prisma.audit_logs = { create: jest.fn().mockResolvedValue({}) };

      const result = await userService.create(createData, 1);

      expect(bcrypt.hash).toHaveBeenCalledWith('Secret@123!', 10);
      expect(prisma.users.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'new@test.com',
            password_hash: '$hashed_password$',
            full_name: 'New User',
          }),
        })
      );
      expect(result.email).toBe('new@test.com');
    });

    it('should write audit log after creating user', async () => {
      prisma.users.findUnique.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('$hashed$');
      prisma.users.create.mockResolvedValue({ id: 5, email: 'x@x.com', full_name: 'X', role: 'patient' });
      prisma.audit_logs = { create: jest.fn().mockResolvedValue({}) };

      await userService.create(createData, 1);

      expect(prisma.audit_logs.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            user_id: 1,
            action: 'CREATE_USER',
            resource_type: 'user',
            resource_id: 5,
          }),
        })
      );
    });
  });

  // ═══════════════════════════════════════════════════════
  // update — không cho sửa email, audit log
  // ═══════════════════════════════════════════════════════
  describe('update', () => {
    it('should throw 404 if user not found', async () => {
      prisma.users.findFirst.mockResolvedValue(null);
      await expect(userService.update(999, {}, 1)).rejects.toThrow('User không tồn tại');
    });

    it('should update allowed fields only', async () => {
      prisma.users.findFirst.mockResolvedValue({ id: 1, email: 'u@u.com', is_active: true });
      prisma.users.update.mockResolvedValue({ id: 1, full_name: 'Updated Name' });
      prisma.audit_logs = { create: jest.fn().mockResolvedValue({}) };

      const result = await userService.update(1, { full_name: 'Updated Name', email: 'hack@evil.com' }, 1);

      // Email should NOT be in data
      expect(prisma.users.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.not.objectContaining({ email: 'hack@evil.com' }),
        })
      );
      expect(result.full_name).toBe('Updated Name');
    });
  });

  // ═══════════════════════════════════════════════════════
  // toggleLock — token version increment, email notification
  // ═══════════════════════════════════════════════════════
  describe('toggleLock', () => {
    it('should throw 404 if user not found', async () => {
      prisma.users.findFirst.mockResolvedValue(null);
      await expect(userService.toggleLock(999, 1, '127.0.0.1')).rejects.toThrow('User không tồn tại');
    });

    it('should throw error when locking self', async () => {
      prisma.users.findFirst.mockResolvedValue({ id: 1, is_active: true });
      await expect(userService.toggleLock(1, 1, '127.0.0.1')).rejects.toThrow('Không thể khóa tài khoản của chính mình');
    });

    it('should lock user and increment token_version', async () => {
      prisma.users.findFirst.mockResolvedValue({ id: 2, email: 'u@u.com', full_name: 'User', is_active: true });
      prisma.users.update.mockResolvedValue({ id: 2, email: 'u@u.com', full_name: 'User', is_active: false, role: 'patient' });
      prisma.audit_logs = { create: jest.fn().mockResolvedValue({}) };
      sendAccountLockedEmail.mockResolvedValue();

      const result = await userService.toggleLock(2, 1, '127.0.0.1');

      expect(prisma.users.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            is_active: false,
            token_version: { increment: 1 },
          }),
        })
      );
      expect(sendAccountLockedEmail).toHaveBeenCalledWith('u@u.com', 'User');
      expect(result.is_active).toBe(false);
    });

    it('should unlock user without sending email', async () => {
      prisma.users.findFirst.mockResolvedValue({ id: 2, email: 'u@u.com', full_name: 'User', is_active: false });
      prisma.users.update.mockResolvedValue({ id: 2, email: 'u@u.com', full_name: 'User', is_active: true, role: 'patient' });
      prisma.audit_logs = { create: jest.fn().mockResolvedValue({}) };

      const result = await userService.toggleLock(2, 1, '127.0.0.1');

      expect(result.is_active).toBe(true);
      expect(sendAccountLockedEmail).not.toHaveBeenCalled();
    });
  });

  // ═══════════════════════════════════════════════════════
  // softDelete — admin password verification, soft delete
  // ═══════════════════════════════════════════════════════
  describe('softDelete', () => {
    it('should throw 404 if user not found', async () => {
      prisma.users.findFirst.mockResolvedValue(null);
      await expect(userService.softDelete(999, 'pass', 1)).rejects.toThrow('User không tồn tại');
    });

    it('should throw error when deleting self', async () => {
      prisma.users.findFirst.mockResolvedValue({ id: 1, email: 'a@a.com', is_active: true });
      await expect(userService.softDelete(1, 'pass', 1)).rejects.toThrow('Không thể xóa tài khoản của chính mình');
    });

    it('should throw 403 if wrong admin password', async () => {
      prisma.users.findFirst.mockResolvedValue({ id: 2, email: 'u@u.com', is_active: true });
      prisma.users.findUnique.mockResolvedValue({ password_hash: '$hash$' });
      bcrypt.compare.mockResolvedValue(false);

      await expect(userService.softDelete(2, 'wrongpass', 1)).rejects.toThrow('Mật khẩu quản trị không chính xác');
    });

    it('should soft delete user with correct admin password', async () => {
      prisma.users.findFirst.mockResolvedValue({ id: 2, email: 'u@u.com', full_name: 'User', role: 'patient', is_active: true });
      prisma.users.findUnique.mockResolvedValue({ password_hash: '$hash$' });
      bcrypt.compare.mockResolvedValue(true);
      prisma.users.update.mockResolvedValue({ id: 2, deleted_at: new Date(), is_active: false });
      prisma.audit_logs = { create: jest.fn().mockResolvedValue({}) };

      const result = await userService.softDelete(2, 'Admin@123!', 1);

      expect(bcrypt.compare).toHaveBeenCalledWith('Admin@123!', '$hash$');
      expect(prisma.users.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            deleted_at: expect.any(Date),
            is_active: false,
            token_version: { increment: 1 },
          }),
        })
      );
      expect(result.message).toBe('Đã xóa người dùng');
    });

    it('should write audit log after deleting', async () => {
      prisma.users.findFirst.mockResolvedValue({ id: 2, email: 'u@u.com', full_name: 'User', role: 'patient', is_active: true });
      prisma.users.findUnique.mockResolvedValue({ password_hash: '$hash$' });
      bcrypt.compare.mockResolvedValue(true);
      prisma.users.update.mockResolvedValue({});
      prisma.audit_logs = { create: jest.fn().mockResolvedValue({}) };

      await userService.softDelete(2, 'pass', 1);

      expect(prisma.audit_logs.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            user_id: 1,
            action: 'DELETE_USER',
            resource_type: 'user',
            resource_id: 2,
          }),
        })
      );
    });
  });
});
