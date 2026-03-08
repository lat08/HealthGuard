const nodemailer = require('nodemailer');
const env = require('../config/env');

// ── Nodemailer transporter (Gmail SMTP) ──────────────────
const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

/**
 * Gửi email reset password
 * @param {string} to - Email người nhận
 * @param {string} resetLink - Link reset password
 */
async function sendPasswordResetEmail(to, resetLink) {
  // Nếu chưa config email → log warning và skip
  if (!env.EMAIL_USER || !env.EMAIL_PASS) {
    console.warn('⚠️  Email chưa được cấu hình. Reset link:', resetLink);
    return;
  }

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject: 'HealthGuard — Đặt lại mật khẩu',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">HealthGuard</h2>
        <p>Xin chào,</p>
        <p>Bạn đã yêu cầu đặt lại mật khẩu. Nhấn nút bên dưới để tiếp tục:</p>
        <a href="${resetLink}" 
           style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; 
                  text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Đặt lại mật khẩu
        </a>
        <p style="color: #6b7280; font-size: 14px;">
          Link này sẽ hết hạn sau 15 phút.<br>
          Nếu bạn không yêu cầu, hãy bỏ qua email này.
        </p>
      </div>
    `,
  });
}

/**
 * Gửi email thông báo đổi mật khẩu thành công
 * @param {string} to - Email người nhận
 * @param {string} userName - Tên người dùng
 */
async function sendPasswordChangedEmail(to, userName) {
  if (!env.EMAIL_USER || !env.EMAIL_PASS) {
    console.warn('⚠️  Email chưa được cấu hình. Skipping password changed notification.');
    return;
  }

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject: 'HealthGuard — Mật khẩu đã được thay đổi',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">HealthGuard</h2>
        <p>Xin chào ${userName},</p>
        <p>Mật khẩu tài khoản của bạn đã được thay đổi thành công.</p>
        <p style="color: #dc2626;">
          Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ quản trị viên ngay lập tức.
        </p>
        <p style="color: #6b7280; font-size: 14px;">
          Thời gian: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
        </p>
      </div>
    `,
  });
}

module.exports = { sendPasswordResetEmail, sendPasswordChangedEmail };
