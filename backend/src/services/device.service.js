const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');

const DEVICE_SELECT_FIELDS = {
  id: true,
  uuid: true,
  user_id: true,
  device_name: true,
  device_type: true,
  model: true,
  firmware_version: true,
  mac_address: true,
  serial_number: true,
  is_active: true,
  battery_level: true,
  signal_strength: true,
  last_seen_at: true,
  last_sync_at: true,
  calibration_data: true,
  registered_at: true,
  updated_at: true,
  users: {
    select: {
      id: true,
      full_name: true,
      email: true,
    },
  },
};

/**
 * Device Service — Business logic cho quản lý thiết bị IoT (UC025)
 */
const deviceService = {
  /**
   * Lấy danh sách thiết bị có phân trang, filter, search
   */
  async findAll({ page = 1, limit = 20, is_active, has_owner, search, device_type }) {
    const skip = (page - 1) * limit;
    const where = { deleted_at: null };

    if (is_active !== undefined) where.is_active = is_active;
    if (device_type) where.device_type = device_type;
    
    // Filter: Có chủ / Chưa có chủ (BR-025-01)
    if (has_owner === 'true') {
      where.user_id = { not: null };
    } else if (has_owner === 'false') {
      where.user_id = null;
    }

    // Search theo tên thiết bị, serial, MAC, hoặc tên user
    if (search) {
      where.OR = [
        { device_name: { contains: search, mode: 'insensitive' } },
        { serial_number: { contains: search, mode: 'insensitive' } },
        { mac_address: { contains: search, mode: 'insensitive' } },
        { users: { full_name: { contains: search, mode: 'insensitive' } } },
        { users: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.devices.findMany({
        where,
        skip,
        take: limit,
        orderBy: { registered_at: 'desc' },
        select: DEVICE_SELECT_FIELDS,
      }),
      prisma.devices.count({ where }),
    ]);

    return { data, total, page, limit };
  },

  /**
   * Lấy chi tiết 1 thiết bị theo ID
   */
  async findById(id) {
    const device = await prisma.devices.findFirst({
      where: { id: Number(id), deleted_at: null },
      select: DEVICE_SELECT_FIELDS,
    });

    if (!device) throw ApiError.notFound('Thiết bị không tồn tại');
    return device;
  },

  /**
   * Gán thiết bị cho người dùng (UC 4.a)
   * BR-025-01: Một thiết bị chỉ có thể gán cho tối đa một user tại một thời điểm
   */
  async assignToUser(deviceId, userId, adminId) {
    const device = await this.findById(deviceId);

    // Kiểm tra thiết bị đã có chủ chưa
    if (device.user_id) {
      throw ApiError.badRequest('Thiết bị đã được gán cho người dùng khác');
    }

    // Kiểm tra user tồn tại
    const user = await prisma.users.findFirst({
      where: { id: Number(userId), deleted_at: null },
    });
    if (!user) throw ApiError.notFound('Người dùng không tồn tại');

    // Gán thiết bị
    const updated = await prisma.devices.update({
      where: { id: Number(deviceId) },
      data: {
        user_id: Number(userId),
        updated_at: new Date(),
      },
      select: DEVICE_SELECT_FIELDS,
    });

    // Ghi audit log (BR-025-03)
    await this._writeAuditLog(adminId, 'ASSIGN_DEVICE', 'device', Number(deviceId), {
      device_name: device.device_name,
      serial_number: device.serial_number,
      assigned_to_user_id: Number(userId),
      assigned_to_user_name: user.full_name,
    });

    return updated;
  },

  /**
   * Bỏ gán thiết bị (unassign)
   */
  async unassignFromUser(deviceId, adminId) {
    const device = await this.findById(deviceId);

    if (!device.user_id) {
      throw ApiError.badRequest('Thiết bị chưa được gán cho người dùng nào');
    }

    const previousUserId = device.user_id;
    const previousUserName = device.users ? device.users.full_name : 'Unknown';

    // Sử dụng disconnect để bỏ relation thay vì set user_id: null
    const updated = await prisma.devices.update({
      where: { id: Number(deviceId) },
      data: {
        users: {
          disconnect: true,
        },
        updated_at: new Date(),
      },
      select: DEVICE_SELECT_FIELDS,
    });

    // Ghi audit log (BR-025-03)
    await this._writeAuditLog(adminId, 'UNASSIGN_DEVICE', 'device', Number(deviceId), {
      device_name: device.device_name,
      serial_number: device.serial_number,
      unassigned_from_user_id: previousUserId,
      unassigned_from_user_name: previousUserName,
    });

    return updated;
  },

  /**
   * Khóa / Mở khóa thiết bị (UC 4.b)
   */
  async toggleLock(deviceId, adminId) {
    const device = await this.findById(deviceId);
    const isLocking = device.is_active === true;

    const updated = await prisma.devices.update({
      where: { id: Number(deviceId) },
      data: {
        is_active: !isLocking,
        updated_at: new Date(),
      },
      select: DEVICE_SELECT_FIELDS,
    });

    // Ghi audit log (BR-025-03)
    const action = isLocking ? 'LOCK_DEVICE' : 'UNLOCK_DEVICE';
    await this._writeAuditLog(adminId, action, 'device', Number(deviceId), {
      device_name: device.device_name,
      serial_number: device.serial_number,
      new_status: updated.is_active ? 'active' : 'inactive',
    });

    return updated;
  },

  /**
   * Cập nhật thông tin thiết bị
   */
  async update(deviceId, data, adminId) {
    const device = await this.findById(deviceId);

    const updateData = {};
    if (data.device_name !== undefined) updateData.device_name = data.device_name;
    if (data.device_type !== undefined) updateData.device_type = data.device_type;
    if (data.model !== undefined) updateData.model = data.model;
    if (data.firmware_version !== undefined) updateData.firmware_version = data.firmware_version;
    if (data.calibration_data !== undefined) updateData.calibration_data = data.calibration_data;

    updateData.updated_at = new Date();

    const updated = await prisma.devices.update({
      where: { id: Number(deviceId) },
      data: updateData,
      select: DEVICE_SELECT_FIELDS,
    });

    // Ghi audit log
    await this._writeAuditLog(adminId, 'UPDATE_DEVICE', 'device', Number(deviceId), {
      device_name: device.device_name,
      changes: Object.keys(updateData).filter(k => k !== 'updated_at'),
    });

    return updated;
  },

  /**
   * Ghi audit log — helper nội bộ
   */
  async _writeAuditLog(userId, action, resourceType, resourceId, details) {
    try {
      await prisma.audit_logs.create({
        data: {
          user_id: userId || null,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          details: details || {},
          status: 'success',
        },
      });
    } catch (err) {
      console.warn(`[WARN] Audit log write failed for user ${userId}:`, err.message);
    }
  },
};

module.exports = deviceService;
