const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');
const { sendPasswordResetEmail, sendPasswordChangedEmail } = require('../utils/email');
const crypto = require('crypto');

// ── Regex patterns ──────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^0\d{9,10}$/;
const VIETNAMESE_NAME_REGEX = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼẾỀỂỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỲỴÝỶỸưăạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ\s]{1,100}$/;

/**
 * Auth Service — Business logic cho xác thực
 */
const authService = {

  // ═══════════════════════════════════════════════════════
  // 1. ĐĂNG NHẬP
  // ═══════════════════════════════════════════════════════
  async loginUser({ email, password }, ipAddress, userAgent) {
    // 1. Validate email format
    if (!EMAIL_REGEX.test(email)) {
      throw ApiError.badRequest('Email không đúng định dạng');
    }

    // 2. Tìm user bằng email
    const user = await prisma.users.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      // Log audit: LOGIN_FAILED — user not found
      await this._logAudit({
        action: 'LOGIN_FAILED',
        details: { reason: 'USER_NOT_FOUND', email },
        ip_address: ipAddress,
        user_agent: userAgent,
        status: 'failure',
      });
      throw ApiError.unauthorized('Email hoặc mật khẩu không đúng');
    }

    // 3. Kiểm tra tài khoản bị khoá
    if (user.is_active === false) {
      await this._logAudit({
        user_id: user.id,
        action: 'LOGIN_FAILED',
        details: { reason: 'ACCOUNT_LOCKED' },
        ip_address: ipAddress,
        user_agent: userAgent,
        status: 'failure',
      });
      throw ApiError.locked('Tài khoản đã bị khoá');
    }

    if (user.locked_until && new Date() < user.locked_until) {
      throw ApiError.locked('Tài khoản đang bị tạm khóa do nhập sai mật khẩu nhiều lần. Vui lòng thử lại sau.');
    }

    // 4. Kiểm tra email đã verify chưa
    if (user.is_verified === false) {
      throw ApiError.unauthorized('Tài khoản chưa được xác thực email');
    }

    // 5. So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      const attempts = (user.failed_login_attempts || 0) + 1;
      let updateData = { failed_login_attempts: attempts };
      if (attempts >= 5) {
        updateData.locked_until = new Date(Date.now() + 15 * 60 * 1000); // 15 phút
      }
      await prisma.users.update({
        where: { id: user.id },
        data: updateData,
      });

      await this._logAudit({
        user_id: user.id,
        action: 'LOGIN_FAILED',
        details: { reason: 'INVALID_CREDENTIALS', attempts },
        ip_address: ipAddress,
        user_agent: userAgent,
        status: 'failure',
      });
      throw ApiError.unauthorized('Email hoặc mật khẩu không đúng');
    }

    // 6. Cập nhật lastLoginAt và reset lockout
    await prisma.users.update({
      where: { id: user.id },
      data: { 
        last_login_at: new Date(),
        failed_login_attempts: 0,
        locked_until: null,
      },
    });

    // 7. Log audit: LOGIN_SUCCESS
    await this._logAudit({
      user_id: user.id,
      action: 'LOGIN_SUCCESS',
      ip_address: ipAddress,
      user_agent: userAgent,
      status: 'success',
    });

    // 8. Tạo JWT token với token_version
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, tokenVersion: user.token_version },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    };
  },

  // ═══════════════════════════════════════════════════════
  // 2. ADMIN TẠO USER
  // ═══════════════════════════════════════════════════════
  async registerUser({ email, password, fullName, phone, dateOfBirth, role }, adminId) {
    // 1. Validate email format
    if (!EMAIL_REGEX.test(email)) {
      throw ApiError.badRequest('Email không đúng định dạng');
    }

    // 2. Kiểm tra email đã tồn tại
    const existing = await prisma.users.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existing) {
      throw ApiError.conflict('Email đã được sử dụng');
    }

    // 3. Validate password (≥ 8 ký tự theo SRS)
    if (!password || password.length < 8) {
      throw ApiError.badRequest('Mật khẩu phải có ít nhất 8 ký tự');
    }

    // 4. Validate fullName (1-100 ký tự, regex tiếng Việt)
    if (!fullName || !VIETNAMESE_NAME_REGEX.test(fullName.trim())) {
      throw ApiError.badRequest('Họ tên không hợp lệ (1-100 ký tự, chỉ chữ cái và khoảng trắng)');
    }

    // 5. Validate phone (bắt đầu bằng 0, 10-11 số)
    if (!phone || !PHONE_REGEX.test(phone)) {
      throw ApiError.badRequest('Số điện thoại không hợp lệ (bắt đầu bằng 0, 10-11 chữ số)');
    }

    // 6. Validate dateOfBirth (≥ 13 tuổi, không tương lai)
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) {
      throw ApiError.badRequest('Ngày sinh không hợp lệ');
    }
    const now = new Date();
    if (dob > now) {
      throw ApiError.badRequest('Ngày sinh không được ở tương lai');
    }
    const age = Math.floor((now - dob) / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 13) {
      throw ApiError.badRequest('Người dùng phải từ 13 tuổi trở lên');
    }

    // 7. Validate role (chỉ "patient" hoặc "caregiver")
    const allowedRoles = ['patient', 'caregiver'];
    if (!allowedRoles.includes(role)) {
      throw ApiError.badRequest('Role phải là "patient" hoặc "caregiver"');
    }

    // 8. Hash password (bcrypt, salt 10)
    const passwordHash = await bcrypt.hash(password, 10);

    // 9. Tạo user (isVerified = true vì admin tạo)
    const newUser = await prisma.users.create({
      data: {
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        full_name: fullName.trim(),
        phone,
        date_of_birth: dob,
        role,
        is_verified: true,
        is_active: true,
      },
    });

    // 10. Log audit: ADMIN_CREATE_USER
    await this._logAudit({
      user_id: adminId,
      action: 'ADMIN_CREATE_USER',
      resource_type: 'user',
      resource_id: newUser.id,
      details: { created_email: newUser.email, role },
      status: 'success',
    });

    // 11. Trả kết quả — KHÔNG gửi email verify
    return { userId: newUser.id, email: newUser.email };
  },

  // ═══════════════════════════════════════════════════════
  // 3. QUÊN MẬT KHẨU
  // ═══════════════════════════════════════════════════════
  async requestPasswordReset({ email }) {
    // 1. Validate email format
    if (!EMAIL_REGEX.test(email)) {
      throw ApiError.badRequest('Email không đúng định dạng');
    }

    // 2. Tìm user bằng email
    const user = await prisma.users.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Không tìm thấy → vẫn trả SUCCESS (chống enumeration attack)
    if (!user) {
      return { message: 'Nếu email tồn tại, bạn sẽ nhận được email đặt lại mật khẩu' };
    }

    // 3. Tạo reset token (JWT, hết hạn 15 phút)
    const resetToken = jwt.sign(
      { userId: user.id, email: user.email, type: 'password_reset' },
      env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // 3.5. Lưu token hash vào database flag tracking record
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await prisma.password_reset_tokens.create({
      data: {
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
      }
    });

    // 4. Log audit
    await this._logAudit({
      user_id: user.id,
      action: 'PASSWORD_RESET_REQUESTED',
      status: 'success',
    });

    // 5. Gửi email chứa link reset
    const resetLink = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(user.email, resetLink);

    return { message: 'Nếu email tồn tại, bạn sẽ nhận được email đặt lại mật khẩu' };
  },

  // ═══════════════════════════════════════════════════════
  // 4. ĐẶT LẠI MẬT KHẨU
  // ═══════════════════════════════════════════════════════
  async resetPassword({ token, newPassword, confirmPassword }) {
    // 1. Kiểm tra newPassword === confirmPassword
    if (newPassword !== confirmPassword) {
      throw ApiError.badRequest('Mật khẩu xác nhận không khớp');
    }

    // 2. Validate password strength (≥ 8 ký tự theo SRS)
    if (!newPassword || newPassword.length < 8) {
      throw ApiError.badRequest('Mật khẩu phải có ít nhất 8 ký tự');
    }

    // 3. jwt.verify(token) — kiểm tra hết hạn / hợp lệ
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw ApiError.badRequest('Link đặt lại mật khẩu đã hết hạn');
      }
      throw ApiError.badRequest('Link đặt lại mật khẩu không hợp lệ');
    }

    // 4. Kiểm tra token.type === "password_reset"
    if (decoded.type !== 'password_reset') {
      throw ApiError.badRequest('Token không phải loại reset password');
    }

    // 4.5. Kiểm tra token đã được theo dõi trong DB và chưa sử dụng
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const resetTokenRecord = await prisma.password_reset_tokens.findFirst({
      where: {
        user_id: decoded.userId,
        token_hash: tokenHash,
      }
    });

    if (!resetTokenRecord || resetTokenRecord.used_at) {
      throw ApiError.badRequest('Link đặt lại mật khẩu không hợp lệ hoặc đã được sử dụng');
    }

    // 5. Tìm user theo decoded.userId
    const user = await prisma.users.findFirst({
      where: { id: decoded.userId, deleted_at: null },
    });
    if (!user) {
      throw ApiError.notFound('Người dùng không tồn tại');
    }

    // 6. Kiểm tra mật khẩu mới ≠ mật khẩu cũ
    const isSamePassword = await bcrypt.compare(newPassword, user.password_hash);
    if (isSamePassword) {
      throw ApiError.badRequest('Mật khẩu mới không được trùng với mật khẩu cũ');
    }

    // 7. Hash mật khẩu mới (bcrypt, salt 10)
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // 8. Cập nhật passwordHash và invalidate old sessions, mark token as used
    await prisma.$transaction([
      prisma.users.update({
        where: { id: user.id },
        data: { 
          password_hash: passwordHash,
          token_version: { increment: 1 } 
        },
      }),
      prisma.password_reset_tokens.update({
        where: { id: resetTokenRecord.id },
        data: { used_at: new Date() }
      })
    ]);

    // 9. Log audit: PASSWORD_RESET_COMPLETED
    await this._logAudit({
      user_id: user.id,
      action: 'PASSWORD_RESET_COMPLETED',
      status: 'success',
    });

    return { message: 'Đặt lại mật khẩu thành công' };
  },

  // ═══════════════════════════════════════════════════════
  // 5. ĐỔI MẬT KHẨU KHI ĐĂNG NHẬP
  // ═══════════════════════════════════════════════════════
  async changePassword({ userId, currentPassword, newPassword, confirmPassword }) {
    // 1. Kiểm tra newPassword === confirmPassword
    if (newPassword !== confirmPassword) {
      throw ApiError.badRequest('Mật khẩu xác nhận không khớp');
    }

    // 2. Validate password strength (≥ 8 ký tự theo SRS)
    if (!newPassword || newPassword.length < 8) {
      throw ApiError.badRequest('Mật khẩu phải có ít nhất 8 ký tự');
    }

    // 3. Tìm user theo userId (từ JWT token)
    const user = await prisma.users.findFirst({
      where: { id: userId, deleted_at: null },
    });
    if (!user) {
      throw ApiError.notFound('Người dùng không tồn tại');
    }

    // 4. Verify currentPassword (bcrypt.compare)
    const isCurrentValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isCurrentValid) {
      await this._logAudit({
        user_id: user.id,
        action: 'PASSWORD_CHANGE_FAILED',
        details: { reason: 'INVALID_CURRENT_PASSWORD' },
        status: 'failure',
      });
      throw ApiError.unauthorized('Mật khẩu hiện tại không đúng');
    }

    // 5. Kiểm tra mật khẩu mới ≠ mật khẩu cũ
    const isSamePassword = await bcrypt.compare(newPassword, user.password_hash);
    if (isSamePassword) {
      throw ApiError.badRequest('Mật khẩu mới không được trùng với mật khẩu cũ');
    }

    // 6. Hash mật khẩu mới
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // 7. Cập nhật DB và invalidate sessions
    await prisma.users.update({
      where: { id: user.id },
      data: { 
        password_hash: passwordHash,
        token_version: { increment: 1 } 
      },
    });

    // 8. Log audit: PASSWORD_CHANGED
    await this._logAudit({
      user_id: user.id,
      action: 'PASSWORD_CHANGED',
      status: 'success',
    });

    // 9. Gửi email thông báo đổi mật khẩu thành công
    await sendPasswordChangedEmail(user.email, user.full_name);

    return { message: 'Đổi mật khẩu thành công' };
  },

  // ═══════════════════════════════════════════════════════
  // Helper: Ghi Audit Log
  // ═══════════════════════════════════════════════════════
  async _logAudit({ user_id, action, resource_type, resource_id, details, ip_address, user_agent, status }) {
    try {
      await prisma.audit_logs.create({
        data: {
          user_id: user_id || null,
          action,
          resource_type: resource_type || null,
          resource_id: resource_id || null,
          details: details || null,
          ip_address: ip_address || null,
          user_agent: user_agent || null,
          status: status || null,
        },
      });
    } catch (err) {
      // Không throw — audit log failure không nên block flow chính
      console.error('⚠️  Audit log error:', err.message);
    }
  },
};

module.exports = authService;
