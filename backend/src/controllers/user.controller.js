const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const userService = require('../services/user.service');

/**
 * User Controller — Xử lý HTTP request/response
 * Gọi service → trả ApiResponse
 */
const userController = {
  // GET /api/v1/users
  getAll: catchAsync(async (req, res) => {
    const { page, limit, role, is_active, search } = req.query;
    const result = await userService.findAll({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      role,
      is_active: is_active !== undefined ? is_active === 'true' : undefined,
      search,
    });
    ApiResponse.paginated(res, result.data, result.total, result.page, result.limit);
  }),

  // GET /api/v1/users/:id
  getById: catchAsync(async (req, res) => {
    const user = await userService.findById(req.params.id);
    ApiResponse.success(res, user);
  }),

  // POST /api/v1/users
  create: catchAsync(async (req, res) => {
    const user = await userService.create(req.body);
    ApiResponse.created(res, user);
  }),

  // PUT /api/v1/users/:id
  replace: catchAsync(async (req, res) => {
    const user = await userService.replace(req.params.id, req.body);
    ApiResponse.success(res, user, 'Cập nhật thành công');
  }),

  // PATCH /api/v1/users/:id
  update: catchAsync(async (req, res) => {
    const user = await userService.update(req.params.id, req.body);
    ApiResponse.success(res, user, 'Cập nhật thành công');
  }),

  // DELETE /api/v1/users/:id
  delete: catchAsync(async (req, res) => {
    await userService.softDelete(req.params.id);
    ApiResponse.noContent(res);
  }),
};

module.exports = userController;
