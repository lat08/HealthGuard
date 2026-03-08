const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const prisma = require('../utils/prisma');

/**
 * Middleware xác thực JWT token
 * Gắn req.user = { id, email, role }
 */
const authenticate = async (req, _res, next) => {
  try {
    // 1. Lấy token từ cookies hoặc header
    let token = req.cookies.hg_token;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      throw ApiError.unauthorized('Vui lòng đăng nhập lại');
    }

    // 2. Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // 3. Kiểm tra user còn tồn tại và active
    const user = await prisma.users.findFirst({
      where: { id: decoded.id, deleted_at: null },
      select: { id: true, email: true, role: true, is_active: true, full_name: true, token_version: true },
    });

    if (!user) {
      throw ApiError.unauthorized('Token không hợp lệ — user không tồn tại');
    }

    if (!user.is_active) {
      throw ApiError.locked('Tài khoản đã bị khoá');
    }

    if (decoded.tokenVersion !== undefined && decoded.tokenVersion !== user.token_version) {
      throw ApiError.unauthorized('Phiên đăng nhập đã hết hạn hoặc mật khẩu đã bị thay đổi');
    }

    // 4. Gắn user info vào request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    if (error.name === 'JsonWebTokenError') {
      return next(ApiError.unauthorized('Token không hợp lệ'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Token đã hết hạn'));
    }
    next(error);
  }
};

/**
 * Middleware kiểm tra quyền admin
 * Phải đặt sau authenticate middleware
 */
const requireAdmin = (req, _res, next) => {
  if (req.user.role !== 'admin') {
    return next(ApiError.forbidden('Chỉ admin mới có quyền thực hiện'));
  }
  next();
};

/**
 * Rate limiter cho đổi mật khẩu: 5 lần / 15 phút / IP
 */
const changePasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5,
  message: {
    success: false,
    statusCode: 429,
    message: 'Quá nhiều yêu cầu đổi mật khẩu. Vui lòng thử lại sau 15 phút.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5,
  message: {
    success: false,
    statusCode: 429,
    message: 'Quá nhiều yêu cầu đăng nhập. Vui lòng thử lại sau 15 phút.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 3,
  message: {
    success: false,
    statusCode: 429,
    message: 'Quá nhiều yêu cầu quên mật khẩu. Vui lòng thử lại sau 15 phút.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authenticate, requireAdmin, changePasswordLimiter, loginLimiter, forgotPasswordLimiter };
