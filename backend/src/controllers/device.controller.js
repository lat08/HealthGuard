const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const deviceService = require('../services/device.service');

/**
 * Device Controller — Xử lý HTTP request/response cho UC025
 * Gọi service → trả ApiResponse
 */
const deviceController = {
  // POST /api/v1/devices — Tạo thiết bị mới
  create: catchAsync(async (req, res) => {
    const device = await deviceService.create(req.body);
    ApiResponse.success(res, device, 'Tạo thiết bị thành công', 201);
  }),

  // GET /api/v1/devices — Danh sách thiết bị (paginated, filtered)
  getAll: catchAsync(async (req, res) => {
    const { page, limit, is_active, has_owner, search, device_type } = req.query;
    const result = await deviceService.findAll({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      is_active: is_active !== undefined ? is_active === 'true' : undefined,
      has_owner,
      search,
      device_type,
    });
    ApiResponse.paginated(res, result.data, result.total, result.page, result.limit);
  }),

  // GET /api/v1/devices/:id — Chi tiết 1 thiết bị
  getById: catchAsync(async (req, res) => {
    const device = await deviceService.findById(req.params.id);
    ApiResponse.success(res, device);
  }),

  // PATCH /api/v1/devices/:id/assign — Gán thiết bị cho user
  assignToUser: catchAsync(async (req, res) => {
    const { userId } = req.body;
    const device = await deviceService.assignToUser(req.params.id, userId, req.user.id);
    ApiResponse.success(res, device, 'Đã gán thiết bị cho người dùng');
  }),

  // PATCH /api/v1/devices/:id/unassign — Bỏ gán thiết bị
  unassignFromUser: catchAsync(async (req, res) => {
    const device = await deviceService.unassignFromUser(req.params.id, req.user.id);
    ApiResponse.success(res, device, 'Đã bỏ gán thiết bị');
  }),

  // PATCH /api/v1/devices/:id/lock — Khóa/Mở khóa thiết bị
  toggleLock: catchAsync(async (req, res) => {
    const device = await deviceService.toggleLock(req.params.id, req.user.id);
    const message = device.is_active ? 'Đã mở khóa thiết bị' : 'Đã khóa thiết bị';
    ApiResponse.success(res, device, message);
  }),

  // PATCH /api/v1/devices/:id — Cập nhật thông tin thiết bị
  update: catchAsync(async (req, res) => {
    const device = await deviceService.update(req.params.id, req.body, req.user.id);
    ApiResponse.success(res, device, 'Cập nhật thiết bị thành công');
  }),
};

module.exports = deviceController;
