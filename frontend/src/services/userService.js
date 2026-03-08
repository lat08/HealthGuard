import { apiFetch } from './api';

/**
 * User Management API Service (UC022)
 */
const userService = {
  /**
   * Lấy danh sách users có phân trang, filter, search
   * @param {{ page, limit, role, status, search }} params
   */
  async getUsers({ page = 1, limit = 20, role = '', status = '', search = '', gender = '', bloodType = '', isVerified = '' } = {}) {
    const params = new URLSearchParams();
    params.set('page', page);
    params.set('limit', limit);
    if (role) params.set('role', role);
    if (status === 'active') params.set('is_active', 'true');
    if (status === 'locked') params.set('is_active', 'false');
    if (search) params.set('search', search);
    if (gender) params.set('gender', gender);
    if (bloodType) params.set('blood_type', bloodType);
    if (isVerified === 'true') params.set('is_verified', 'true');
    if (isVerified === 'false') params.set('is_verified', 'false');

    return apiFetch(`/api/v1/users?${params.toString()}`);
  },

  /**
   * Lấy chi tiết 1 user
   * @param {number} id
   */
  async getUserById(id) {
    return apiFetch(`/api/v1/users/${id}`);
  },

  /**
   * Tạo user mới
   * @param {object} data - { email, password, full_name, phone, role, gender, ... }
   */
  async createUser(data) {
    return apiFetch('/api/v1/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Cập nhật thông tin user
   * @param {number} id
   * @param {object} data - { full_name, phone, role, gender, ... }
   */
  async updateUser(id, data) {
    return apiFetch(`/api/v1/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Khóa / Mở khóa tài khoản
   * @param {number} id
   */
  async toggleLockUser(id) {
    return apiFetch(`/api/v1/users/${id}/lock`, {
      method: 'PATCH',
    });
  },

  /**
   * Xóa user (soft delete — cần mật khẩu admin)
   * @param {number} id
   * @param {string} password - Mật khẩu admin để xác thực
   */
  async deleteUser(id, password) {
    return apiFetch(`/api/v1/users/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    });
  },
};

export default userService;
