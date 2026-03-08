const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate, requireAdmin, changePasswordLimiter, loginLimiter, forgotPasswordLimiter } = require('../middlewares/auth');

const router = Router();

// ┌──────────────────────────────────────────────────────────┐
// │  Auth API  —  /api/v1/auth                                │
// │                                                           │
// │  POST   /login            Đăng nhập                       │
// │  POST   /register         Admin tạo user                  │
// │  POST   /forgot-password  Quên mật khẩu                   │
// │  POST   /reset-password   Đặt lại mật khẩu               │
// │  PUT    /password          Đổi mật khẩu (khi đăng nhập)   │
// └──────────────────────────────────────────────────────────┘

// ── Public routes ────────────────────────────────────────────
router.post('/login', loginLimiter, authController.login);
router.post('/forgot-password', forgotPasswordLimiter, authController.forgotPassword);
router.post('/reset-password',  authController.resetPassword);

// ── Admin only ───────────────────────────────────────────────
router.post('/register', authenticate, requireAdmin, authController.register);

// ── Authenticated + Rate limited ─────────────────────────────
router.get('/me', authenticate, authController.getMe);
router.post('/logout', authenticate, authController.logout);
router.put('/password', authenticate, changePasswordLimiter, authController.changePassword);

module.exports = router;
