const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const authService = require('../services/auth.service');

/**
 * Auth Controller — Xử lý HTTP request/response cho xác thực
 */
const authController = {

  // POST /api/v1/auth/login
  login: catchAsync(async (req, res) => {
    const { email, password } = req.body;

    // Validate: email & password không rỗng
    if (!email || !password) {
      throw ApiError.badRequest('Email và mật khẩu là bắt buộc');
    }

    const result = await authService.loginUser(
      { email, password },
      req.ip,
      req.headers['user-agent']
    );

    // Set HttpOnly Cookie
    res.cookie('hg_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days (7d in JWT)
    });

    // Remove token from response body
    const responseData = { user: result.user };
    ApiResponse.success(res, responseData, 'Đăng nhập thành công');
  }),

  // POST /api/v1/auth/register (Admin only)
  register: catchAsync(async (req, res) => {
    const { email, password, fullName, phone, dateOfBirth, role } = req.body;

    // Validate: tất cả fields bắt buộc
    const requiredFields = { email, password, fullName, phone, dateOfBirth, role };
    const missing = Object.entries(requiredFields)
      .filter(([_, v]) => !v)
      .map(([k]) => k);

    if (missing.length > 0) {
      throw ApiError.badRequest(`Các trường bắt buộc: ${missing.join(', ')}`);
    }

    // Không cho tạo role "admin" qua API
    if (role === 'admin') {
      throw ApiError.forbidden('Không thể tạo tài khoản admin qua API');
    }

    const result = await authService.registerUser(
      { email, password, fullName, phone, dateOfBirth, role },
      req.user.id // adminId từ authenticate middleware
    );

    ApiResponse.created(res, result, 'Tạo tài khoản thành công');
  }),

  // POST /api/v1/auth/forgot-password
  forgotPassword: catchAsync(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      throw ApiError.badRequest('Email là bắt buộc');
    }

    const result = await authService.requestPasswordReset({ email });
    ApiResponse.success(res, result);
  }),

  // POST /api/v1/auth/reset-password
  resetPassword: catchAsync(async (req, res) => {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      throw ApiError.badRequest('Token, mật khẩu mới và xác nhận mật khẩu là bắt buộc');
    }

    const result = await authService.resetPassword({ token, newPassword, confirmPassword });
    ApiResponse.success(res, result, 'Đặt lại mật khẩu thành công');
  }),

  // PUT /api/v1/auth/password
  changePassword: catchAsync(async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      throw ApiError.badRequest('Mật khẩu hiện tại, mật khẩu mới và xác nhận là bắt buộc');
    }

    const result = await authService.changePassword({
      userId: req.user.id, // từ authenticate middleware
      currentPassword,
      newPassword,
      confirmPassword,
    });

    ApiResponse.success(res, result, 'Đổi mật khẩu thành công');
  }),

  // POST /api/v1/auth/logout
  logout: catchAsync(async (req, res) => {
    res.clearCookie('hg_token');
    ApiResponse.success(res, null, 'Đăng xuất thành công');
  }),

  // GET /api/v1/auth/me
  getMe: catchAsync(async (req, res) => {
    ApiResponse.success(res, req.user, 'Lấy thông tin user hiện tại thành công');
  }),
};

module.exports = authController;
