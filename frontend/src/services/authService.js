import { apiFetch } from './api';

const USER_KEY = 'hg_user';

// ── Đăng nhập ──────────────────────────────────────────
export async function login(payload) {
  const result = await apiFetch('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (result.success && result.data && result.data.user) {
    localStorage.setItem(USER_KEY, JSON.stringify(result.data.user));
  }

  return result;
}

// ── Đăng xuất ──────────────────────────────────────────
export async function logout() {
  try {
    await apiFetch('/api/v1/auth/logout', { method: 'POST' });
  } catch {
    // ignore backend error if network fail
  }
  localStorage.removeItem(USER_KEY);
}

// ── Token / User helpers ───────────────────────────────
export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function isAuthenticated() {
  return !!getUser();
}

// ── Verify token (check session on page load) ──────────
export async function verifyToken() {
  try {
    if (!getUser()) {
      return { success: false };
    }
    const res = await apiFetch('/api/v1/auth/me', { method: 'GET' });
    if (res.success) {
      return { success: true };
    }
    logout();
    return { success: false };
  } catch {
    logout();
    return { success: false };
  }
}

// ── Quên mật khẩu ──────────────────────────────────────
export async function forgotPassword(email) {
  return apiFetch('/api/v1/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

// ── Đặt lại mật khẩu (từ link token) ──────────────────
export async function resetPassword({ token, newPassword, confirmPassword }) {
  return apiFetch('/api/v1/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword, confirmPassword }),
  });
}

// ── Đổi mật khẩu (khi đang đăng nhập) ─────────────────
export async function changePassword({ currentPassword, newPassword, confirmPassword }) {
  return apiFetch('/api/v1/auth/password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
  });
}

// ── Admin tạo user ─────────────────────────────────────
export async function adminCreateUser(userData) {
  return apiFetch('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

// ── Error message helper ───────────────────────────────
export function getErrorMessage(error) {
  if (typeof error === 'string') return error;
  const map = {
    VALIDATION_ERROR: 'Vui lòng nhập đầy đủ thông tin.',
    INVALID_EMAIL_FORMAT: 'Email không đúng định dạng.',
    INVALID_CREDENTIALS: 'Email hoặc mật khẩu không chính xác.',
    ACCOUNT_LOCKED: 'Tài khoản đã bị khóa. Vui lòng liên hệ hỗ trợ.',
    ACCOUNT_NOT_VERIFIED: 'Tài khoản chưa được xác thực. Vui lòng kiểm tra email.',
    INTERNAL_ERROR: 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.',
    TOO_MANY_REQUESTS: 'Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau.',
  };
  return map[error?.code] ?? error?.message ?? 'Có lỗi xảy ra.';
}
