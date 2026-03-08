const express = require('express');
const { authenticate, requireAdmin } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const rateLimit = require('express-rate-limit');

const deviceController = require('../controllers/device.controller');

// Rate limiting (100 req/min) for Device API
const devicesLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu, vui lòng thử lại sau 1 phút',
  },
});

const router = express.Router();

// ┌──────────────────────────────────────────────────────┐
// │  Devices API  —  /api/v1/devices                     │
// │                                                      │
// │  GET    /              Danh sách thiết bị (paginated)│
// │  GET    /:id           Chi tiết 1 thiết bị            │
// │  PATCH  /:id           Cập nhật thông tin thiết bị    │
// │  PATCH  /:id/assign    Gán thiết bị cho user         │
// │  PATCH  /:id/unassign  Bỏ gán thiết bị               │
// │  PATCH  /:id/lock      Khóa / Mở khóa thiết bị       │
// └──────────────────────────────────────────────────────┘

// ── Validation Rules ──────────────────────────────────────
const assignDeviceRules = {
  body: {
    userId: { required: true, type: 'number' },
  },
};

const updateDeviceRules = {
  body: {
    device_name: { type: 'string', sanitize: true },
    device_type: { type: 'string', sanitize: true },
    model: { type: 'string', sanitize: true },
    firmware_version: { type: 'string', sanitize: true },
    calibration_data: { type: 'object' },
  },
};

// ── Routes ────────────────────────────────────────────────
// Protect all device routes with auth & admin role & rate limit
router.use(authenticate, requireAdmin, devicesLimiter);

router.get('/', deviceController.getAll);
router.get('/:id', deviceController.getById);
router.patch('/:id', validate(updateDeviceRules), deviceController.update);
router.patch('/:id/assign', validate(assignDeviceRules), deviceController.assignToUser);
router.patch('/:id/unassign', deviceController.unassignFromUser);
router.patch('/:id/lock', deviceController.toggleLock);

module.exports = router;
