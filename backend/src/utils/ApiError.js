/**
 * Custom API Error
 *
 * Usage:
 *   throw ApiError.notFound('User không tồn tại');
 *   throw ApiError.badRequest('Email đã được sử dụng');
 *   throw new ApiError(403, 'Không có quyền truy cập');
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;       // Validation errors array
    this.isOperational = true;  // Distinguish from programming errors

    Error.captureStackTrace(this, this.constructor);
  }

  // ── Factory Methods ─────────────────────────────────────
  static badRequest(message = 'Yêu cầu không hợp lệ', errors = []) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Chưa xác thực') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Không có quyền truy cập') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Không tìm thấy tài nguyên') {
    return new ApiError(404, message);
  }

  static conflict(message = 'Tài nguyên bị trùng lặp') {
    return new ApiError(409, message);
  }

  static locked(message = 'Tài khoản đã bị khoá') {
    return new ApiError(423, message);
  }

  static internal(message = 'Lỗi hệ thống') {
    return new ApiError(500, message);
  }
}

module.exports = ApiError;
