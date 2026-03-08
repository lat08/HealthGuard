jest.mock('../../utils/prisma');

const prisma = require('../../utils/prisma');
const userService = require('../../services/user.service');
const ApiError = require('../../utils/ApiError');

describe('userService', () => {

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
  // create
  // ═══════════════════════════════════════════════════════
  describe('create', () => {
    it('should create user and return result', async () => {
      const data = { email: 'new@test.com', full_name: 'New User' };
      prisma.users.create.mockResolvedValue({ id: 5, ...data });

      const result = await userService.create(data);
      expect(result).toEqual({ id: 5, ...data });
      expect(prisma.users.create).toHaveBeenCalledWith({ data });
    });
  });

  // ═══════════════════════════════════════════════════════
  // replace (PUT)
  // ═══════════════════════════════════════════════════════
  describe('replace', () => {
    it('should throw 404 if user not found', async () => {
      prisma.users.findFirst.mockResolvedValue(null);
      await expect(userService.replace(999, {})).rejects.toThrow('User không tồn tại');
    });

    it('should update user on success', async () => {
      prisma.users.findFirst.mockResolvedValue({ id: 1 });
      prisma.users.update.mockResolvedValue({ id: 1, email: 'updated@test.com' });

      const result = await userService.replace(1, { email: 'updated@test.com' });
      expect(result.email).toBe('updated@test.com');
    });
  });

  // ═══════════════════════════════════════════════════════
  // update (PATCH)
  // ═══════════════════════════════════════════════════════
  describe('update', () => {
    it('should throw 404 if user not found', async () => {
      prisma.users.findFirst.mockResolvedValue(null);
      await expect(userService.update(999, {})).rejects.toThrow('User không tồn tại');
    });

    it('should partial-update user on success', async () => {
      prisma.users.findFirst.mockResolvedValue({ id: 1 });
      prisma.users.update.mockResolvedValue({ id: 1, full_name: 'New Name' });

      const result = await userService.update(1, { full_name: 'New Name' });
      expect(result.full_name).toBe('New Name');
    });
  });

  // ═══════════════════════════════════════════════════════
  // softDelete
  // ═══════════════════════════════════════════════════════
  describe('softDelete', () => {
    it('should throw 404 if user not found', async () => {
      prisma.users.findFirst.mockResolvedValue(null);
      await expect(userService.softDelete(999)).rejects.toThrow('User không tồn tại');
    });

    it('should set deleted_at and is_active=false', async () => {
      prisma.users.findFirst.mockResolvedValue({ id: 1 });
      prisma.users.update.mockResolvedValue({ id: 1, deleted_at: new Date(), is_active: false });

      await userService.softDelete(1);
      expect(prisma.users.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ is_active: false, deleted_at: expect.any(Date) }),
        })
      );
    });
  });
});
