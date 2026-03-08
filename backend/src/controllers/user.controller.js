const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const userService = require('../services/user.service');

/**
 * User Controller — Xử lý HTTP request/response cho UC022
 * Gọi service → trả ApiResponse
 */
const userController = {
  // GET /api/v1/users — Danh sách users (paginated, filtered)
  getAll: catchAsync(async (req, res) => {
    const { page, limit, role, is_active, search, gender, blood_type, is_verified } = req.query;
    const result = await userService.findAll({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      role,
      is_active: is_active !== undefined ? is_active === 'true' : undefined,
      search,
      gender,
      blood_type,
      is_verified: is_verified !== undefined ? is_verified === 'true' : undefined,
    });
    ApiResponse.paginated(res, result.data, result.total, result.page, result.limit);
  }),

  // GET /api/v1/users/:id — Chi tiết 1 user
  getById: catchAsync(async (req, res) => {
    const user = await userService.findById(req.params.id);
    ApiResponse.success(res, user);
  }),

  // POST /api/v1/users — Tạo mới user
  create: catchAsync(async (req, res) => {
    const user = await userService.create(req.body, req.user.id);
    ApiResponse.created(res, user, 'Thêm người dùng thành công');
  }),

  // PATCH /api/v1/users/:id — Cập nhật thông tin user
  update: catchAsync(async (req, res) => {
    const user = await userService.update(req.params.id, req.body, req.user.id);
    ApiResponse.success(res, user, 'Cập nhật thành công');
  }),

  // PATCH /api/v1/users/:id/lock — Khóa/Mở khóa tài khoản
  toggleLock: catchAsync(async (req, res) => {
    const ipAddress = req.ip || req.connection?.remoteAddress;
    const user = await userService.toggleLock(req.params.id, req.user.id, ipAddress);
    const message = user.is_active ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản';
    ApiResponse.success(res, user, message);
  }),

  // DELETE /api/v1/users/:id — Xóa user (soft delete, cần password admin)
  delete: catchAsync(async (req, res) => {
    const { password } = req.body;
    const result = await userService.softDelete(req.params.id, password, req.user.id);
    ApiResponse.success(res, result, 'Đã xóa người dùng');
  }),
};

module.exports = userController;
