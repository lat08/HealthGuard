const ApiError = require('../utils/ApiError');

/**
 * Global error handler middleware.
 * Express 5 auto-catches async errors, but this formats them.
 *
 * Must be registered LAST with: app.use(errorHandler);
 */
const errorHandler = (err, req, res, _next) => {
  // ── Default values ───────────────────────────────────
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Lỗi hệ thống';
  let errors = err.errors || [];

  // ── Prisma known errors ──────────────────────────────
  if (err.code === 'P2002') {
    statusCode = 409;
    const target = err.meta?.target?.join(', ') || 'field';
    message = `Giá trị ${target} đã tồn tại`;
  }
  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Không tìm thấy bản ghi';
  }

  // ── Log in development ──────────────────────────────
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', {
      statusCode,
      message,
      stack: err.stack,
      ...(errors.length && { errors }),
    });
  }

  // ── Response ─────────────────────────────────────────
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(errors.length && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
