const express = require('express'); // Changed from { Router } to express
const { authenticate, requireAdmin } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const rateLimit = require('express-rate-limit');

const userController = require('../controllers/user.controller');

// Rate limiting (100 req/min) for User API
const usersLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu, vui lòng thử lại sau 1 phút',
  },
});

const router = express.Router(); // Changed to express.Router()

// ── Tất cả routes yêu cầu đăng nhập + quyền ADMIN (BR-022-01) ──
// router.use(authenticate, requireAdmin); // This line is moved and combined below

// ┌──────────────────────────────────────────────────────┐
// │  Users API  —  /api/v1/users                         │
// │                                                      │
// │  GET    /              Danh sách users (paginated)    │
// │  GET    /:id           Chi tiết 1 user                │
// │  POST   /              Tạo mới user                   │
// │  PATCH  /:id           Cập nhật thông tin             │
// │  PATCH  /:id/lock      Khóa / Mở khóa tài khoản      │
// │  DELETE /:id           Xoá user (soft delete)         │
// └──────────────────────────────────────────────────────┘

// ── Validation Rules ──────────────────────────────────────
const createUserRules = {
  body: {
    email: { required: true, type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    password: {
      required: true,
      type: 'string',
      minLength: 8,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    },
    full_name: { required: true, type: 'string', sanitize: true },
    phone: { type: 'string', sanitize: true },
    role: { type: 'string', enum: ['patient', 'caregiver', 'admin'] },
    gender: { type: 'string', enum: ['male', 'female', 'other'] },
    date_of_birth: { type: 'string' }, // yyyy-mm-dd format in theory
    blood_type: { type: 'string', sanitize: true },
    height_cm: { type: 'number' },
    weight_kg: { type: 'number' },
  },
};

const updateUserRules = {
  body: {
    full_name: { type: 'string', sanitize: true },
    phone: { type: 'string', sanitize: true },
    role: { type: 'string', enum: ['patient', 'caregiver', 'admin'] },
    gender: { type: 'string', enum: ['male', 'female', 'other'] },
    date_of_birth: { type: 'string' },
    blood_type: { type: 'string', sanitize: true },
    height_cm: { type: 'number' },
    weight_kg: { type: 'number' },
  },
};

const deleteUserRules = {
  body: {
    password: { required: true, type: 'string' },
  },
};

// ── Routes ────────────────────────────────────────────────
// Protect all user routes with auth & admin role & rate limit
router.use(authenticate, requireAdmin, usersLimiter);

// Lấy danh sách + Tìm kiếm + Filter + Phân trang
router.get('/', userController.getAll); // Changed from getUsers to getAll to match original
router.get('/:id', userController.getById);
router.post('/',         validate(createUserRules), userController.create);
router.patch('/:id',     validate(updateUserRules), userController.update);
router.patch('/:id/lock', userController.toggleLock);
router.delete('/:id',   validate(deleteUserRules), userController.delete);

module.exports = router;
