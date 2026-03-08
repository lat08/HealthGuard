import { apiFetch } from './api';

/**
 * Device Management API Service (UC025)
 */
const deviceService = {
  /**
   * Lấy danh sách thiết bị có phân trang, filter, search
   * @param {{ page, limit, is_active, has_owner, search, device_type }} params
   */
  async getDevices({ page = 1, limit = 20, is_active = '', has_owner = '', search = '', device_type = '' } = {}) {
    const params = new URLSearchParams();
    params.set('page', page);
    params.set('limit', limit);
    if (is_active === 'true') params.set('is_active', 'true');
    if (is_active === 'false') params.set('is_active', 'false');
    if (has_owner) params.set('has_owner', has_owner);
    if (search) params.set('search', search);
    if (device_type) params.set('device_type', device_type);

    return apiFetch(`/api/v1/devices?${params.toString()}`);
  },

  /**
   * Lấy chi tiết 1 thiết bị
   * @param {number} id
   */
  async getDeviceById(id) {
    return apiFetch(`/api/v1/devices/${id}`);
  },

  /**
   * Gán thiết bị cho người dùng
   * @param {number} deviceId
   * @param {number} userId
   */
  async assignDevice(deviceId, userId) {
    return apiFetch(`/api/v1/devices/${deviceId}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ userId }),
    });
  },

  /**
   * Bỏ gán thiết bị
   * @param {number} deviceId
   */
  async unassignDevice(deviceId) {
    return apiFetch(`/api/v1/devices/${deviceId}/unassign`, {
      method: 'PATCH',
    });
  },

  /**
   * Khóa / Mở khóa thiết bị
   * @param {number} deviceId
   */
  async toggleLockDevice(deviceId) {
    return apiFetch(`/api/v1/devices/${deviceId}/lock`, {
      method: 'PATCH',
    });
  },

  /**
   * Cập nhật thông tin thiết bị
   * @param {number} deviceId
   * @param {object} data - { device_name, device_type, model, firmware_version, calibration_data }
   */
  async updateDevice(deviceId, data) {
    return apiFetch(`/api/v1/devices/${deviceId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

export default deviceService;
