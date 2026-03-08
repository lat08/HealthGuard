const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');
const { sendAccountLockedEmail } = require('../utils/email');

const SALT_ROUNDS = 10;
const USER_SELECT_FIELDS = {
  id: true,
  uuid: true,
  email: true,
  full_name: true,
  phone: true,
  role: true,
  is_active: true,
  is_verified: true,
  gender: true,
  date_of_birth: true,
  blood_type: true,
  height_cm: true,
  weight_kg: true,
  medical_conditions: true,
  created_at: true,
  updated_at: true,
  last_login_at: true,
};

/**
 * User Service — Business logic cho quản lý users (UC022)
 */
const userService = {
  /**
   * Lấy danh sách users có phân trang, filter, search
   */
  async findAll({ page = 1, limit = 20, role, is_active, search, gender, blood_type, is_verified }) {
    const skip = (page - 1) * limit;
    const where = { deleted_at: null };

    if (role) where.role = role;
    if (is_active !== undefined) where.is_active = is_active;
    if (gender) where.gender = gender;
    if (blood_type) where.blood_type = blood_type;
    if (is_verified !== undefined) where.is_verified = is_verified;
    if (search) {
      where.OR = [
        { full_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.users.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        select: USER_SELECT_FIELDS,
      }),
      prisma.users.count({ where }),
    ]);

    return { data, total, page, limit };
  },

  /**
   * Lấy chi tiết 1 user theo ID (không trả password_hash)
   */
  async findById(id) {
    const user = await prisma.users.findFirst({
      where: { id: Number(id), deleted_at: null },
      select: {
        ...USER_SELECT_FIELDS,
        medications: true,
        allergies: true,
      },
    });

    if (!user) throw ApiError.notFound('User không tồn tại');
    return user;
  },

  /**
   * Tạo user mới (BR-022-05: email chưa tồn tại)
   */
  async create(data, adminId) {
    // 1. Kiểm tra email đã tồn tại
    const existing = await prisma.users.findUnique({
      where: { email: data.email },
    });
    if (existing) throw ApiError.conflict('Email đã được sử dụng');

    // 2. Hash password
    const password_hash = await bcrypt.hash(data.password, SALT_ROUNDS);

    // 3. Tạo user mới
    const newUser = await prisma.users.create({
      data: {
        email: data.email,
        password_hash,
        full_name: data.full_name,
        phone: data.phone || null,
        role: data.role || 'patient',
        gender: data.gender || null,
        date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : null,
        blood_type: data.blood_type || null,
        height_cm: data.height_cm ? parseInt(data.height_cm) : null,
        weight_kg: data.weight_kg ? parseFloat(data.weight_kg) : null,
        medical_conditions: data.medical_conditions || [],
        is_active: true,
        is_verified: false,
      },
      select: USER_SELECT_FIELDS,
    });

    // 4. Ghi audit log (BR-022-04)
    await this._writeAuditLog(adminId, 'CREATE_USER', 'user', newUser.id, {
      email: newUser.email,
      full_name: newUser.full_name,
      role: newUser.role,
    });

    return newUser;
  },

  /**
   * Cập nhật thông tin user (UC 5.b — không được sửa email)
   */
  async update(id, data, adminId) {
    const user = await this.findById(id);

    // Không cho phép sửa email
    const updateData = {};
    if (data.full_name !== undefined) updateData.full_name = data.full_name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.date_of_birth !== undefined) updateData.date_of_birth = data.date_of_birth ? new Date(data.date_of_birth) : null;
    if (data.blood_type !== undefined) updateData.blood_type = data.blood_type || null;
    if (data.height_cm !== undefined) updateData.height_cm = data.height_cm ? parseInt(data.height_cm) : null;
    if (data.weight_kg !== undefined) updateData.weight_kg = data.weight_kg ? parseFloat(data.weight_kg) : null;
    if (data.medical_conditions !== undefined) updateData.medical_conditions = data.medical_conditions;

    updateData.updated_at = new Date();

    const updated = await prisma.users.update({
      where: { id: Number(id) },
      data: updateData,
      select: USER_SELECT_FIELDS,
    });

    // Ghi audit log (BR-022-04)
    await this._writeAuditLog(adminId, 'UPDATE_USER', 'user', Number(id), {
      changes: Object.keys(updateData).filter(k => k !== 'updated_at'),
    });

    return updated;
  },

  /**
   * Khóa / Mở khóa tài khoản (UC 5.c)
   */
  async toggleLock(id, adminId, ipAddress) {
    const user = await this.findById(id);

    // Admin không thể tự khóa chính mình
    if (Number(id) === adminId) {
      throw ApiError.badRequest('Không thể khóa tài khoản của chính mình');
    }

    const isLocking = user.is_active === true;

    const updateData = {
      is_active: !isLocking,
      updated_at: new Date(),
    };

    // Nếu khóa → tăng token_version để invalidate tất cả sessions
    if (isLocking) {
      updateData.token_version = { increment: 1 };
    }

    const updated = await prisma.users.update({
      where: { id: Number(id) },
      data: updateData,
      select: {
        id: true,
        uuid: true,
        email: true,
        full_name: true,
        is_active: true,
        role: true,
      },
    });

    // Gửi email thông báo khi khóa tài khoản (UC 5.c.4)
    if (isLocking) {
      try {
        await sendAccountLockedEmail(updated.email, updated.full_name);
      } catch (err) {
        console.warn(`[WARN] Failed to send lock notification email to ${updated.email}:`, err.message);
      }
    }

    // Ghi audit log (BR-022-04)
    const action = isLocking ? 'LOCK_USER' : 'UNLOCK_USER';
    await this._writeAuditLog(adminId, action, 'user', Number(id), {
      email: updated.email,
      full_name: updated.full_name,
      new_status: updated.is_active ? 'active' : 'locked',
    }, ipAddress);

    return updated;
  },

  /**
   * Soft delete user (UC 5.d — cần xác thực mật khẩu admin)
   * BR-022-02: Xóa người dùng cần xác thực mật khẩu admin
   * BR-022-03: Sử dụng soft delete
   */
  async softDelete(id, adminPassword, adminId) {
    const user = await this.findById(id);

    // Admin không thể tự xóa chính mình
    if (Number(id) === adminId) {
      throw ApiError.badRequest('Không thể xóa tài khoản của chính mình');
    }

    // Xác thực mật khẩu admin (BR-022-02)
    const admin = await prisma.users.findUnique({
      where: { id: adminId },
      select: { password_hash: true },
    });

    if (!admin) throw ApiError.unauthorized('Không tìm thấy tài khoản admin');

    const isPasswordValid = await bcrypt.compare(adminPassword, admin.password_hash);
    if (!isPasswordValid) {
      throw ApiError.forbidden('Mật khẩu quản trị không chính xác');
    }

    // Backup dữ liệu vào bảng users_archive trước khi xóa (UC 5.d.5)
    await prisma.users_archive.create({
      data: {
        original_id: user.id,
        uuid: user.uuid,
        email: user.email,
        user_data: user,
        archived_by: adminId,
      },
    });

    // Soft delete (BR-022-03)
    await prisma.users.update({
      where: { id: Number(id) },
      data: {
        deleted_at: new Date(),
        is_active: false,
        token_version: { increment: 1 },
        updated_at: new Date(),
      },
    });

    // Ghi audit log (BR-022-04)
    await this._writeAuditLog(adminId, 'DELETE_USER', 'user', Number(id), {
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      soft_deleted: true,
    });

    return { message: 'Đã xóa người dùng' };
  },

  /**
   * Ghi audit log — helper nội bộ
   */
  async _writeAuditLog(userId, action, resourceType, resourceId, details, ipAddress) {
    try {
      await prisma.audit_logs.create({
        data: {
          user_id: userId || null,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          details: details || {},
          ip_address: ipAddress || null,
          status: 'success',
        },
      });
    } catch (err) {
      console.warn(`[WARN] Audit log write failed for user ${userId}:`, err.message);
    }
  },
};

module.exports = userService;
