jest.mock('../../services/user.service');

const userService = require('../../services/user.service');
const userController = require('../../controllers/user.controller');

// Helper: mock req, res, next
const mockReq = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  user: { id: 1 },
  ...overrides,
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe('userController', () => {

  // ═══════════════════════════════════════════════════════
  // getAll
  // ═══════════════════════════════════════════════════════
  describe('getAll', () => {
    it('should call service.findAll and return paginated response', async () => {
      userService.findAll.mockResolvedValue({
        data: [{ id: 1, email: 'a@a.com' }], total: 1, page: 1, limit: 20,
      });

      const req = mockReq({ query: {} });
      const res = mockRes();
      const next = jest.fn();

      await userController.getAll(req, res, next);
      expect(userService.findAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ pagination: expect.any(Object) })
      );
    });

    it('should pass query params to service', async () => {
      userService.findAll.mockResolvedValue({ data: [], total: 0, page: 2, limit: 10 });

      const req = mockReq({ query: { page: '2', limit: '10', role: 'admin', is_active: 'true', search: 'test' } });
      const res = mockRes();
      const next = jest.fn();

      await userController.getAll(req, res, next);
      expect(userService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, limit: 10, role: 'admin', is_active: true, search: 'test' })
      );
    });
  });

  // ═══════════════════════════════════════════════════════
  // getById
  // ═══════════════════════════════════════════════════════
  describe('getById', () => {
    it('should return user by id', async () => {
      userService.findById.mockResolvedValue({ id: 1, email: 'a@a.com' });
      const req = mockReq({ params: { id: '1' } });
      const res = mockRes();
      const next = jest.fn();

      await userController.getById(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  // ═══════════════════════════════════════════════════════
  // create
  // ═══════════════════════════════════════════════════════
  describe('create', () => {
    it('should create user and return 201', async () => {
      userService.create.mockResolvedValue({ id: 5, email: 'new@test.com' });
      const req = mockReq({ body: { email: 'new@test.com' } });
      const res = mockRes();
      const next = jest.fn();

      await userController.create(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });



  // ═══════════════════════════════════════════════════════
  // update (PATCH)
  // ═══════════════════════════════════════════════════════
  describe('update', () => {
    it('should partial update user', async () => {
      userService.update.mockResolvedValue({ id: 1, full_name: 'Updated' });
      const req = mockReq({ params: { id: '1' }, body: { full_name: 'Updated' } });
      const res = mockRes();
      const next = jest.fn();

      await userController.update(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  // ═══════════════════════════════════════════════════════
  // delete (soft)
  // ═══════════════════════════════════════════════════════
  describe('delete', () => {
    it('should soft delete user and return 200', async () => {
      userService.softDelete.mockResolvedValue({});
      const req = mockReq({ params: { id: '1' } });
      const res = mockRes();
      const next = jest.fn();

      await userController.delete(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
