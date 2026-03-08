const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');

/**
 * User Service — Business logic cho quản lý users
 */
const userService = {
  /**
   * Lấy danh sách users có phân trang
   */
  async findAll({ page = 1, limit = 20, role, is_active, search }) {
    const skip = (page - 1) * limit;
    const where = { deleted_at: null };

    if (role) where.role = role;
    if (is_active !== undefined) where.is_active = is_active;
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
        select: {
          id: true,
          uuid: true,
          email: true,
          full_name: true,
          phone: true,
          role: true,
          is_active: true,
          is_verified: true,
          created_at: true,
          last_login_at: true,
        },
      }),
      prisma.users.count({ where }),
    ]);

    return { data, total, page, limit };
  },

  /**
   * Lấy chi tiết 1 user theo ID
   */
  async findById(id) {
    const user = await prisma.users.findFirst({
      where: { id: Number(id), deleted_at: null },
    });

    if (!user) throw ApiError.notFound('User không tồn tại');
    return user;
  },

  /**
   * Tạo user mới
   */
  async create(data) {
    return prisma.users.create({ data });
  },

  /**
   * Cập nhật toàn bộ (PUT) — thay thế tất cả fields
   */
  async replace(id, data) {
    await this.findById(id); // Check exists
    return prisma.users.update({
      where: { id: Number(id) },
      data,
    });
  },

  /**
   * Cập nhật một phần (PATCH) — chỉ update fields được gửi
   */
  async update(id, data) {
    await this.findById(id);
    return prisma.users.update({
      where: { id: Number(id) },
      data,
    });
  },

  /**
   * Soft delete user
   */
  async softDelete(id) {
    await this.findById(id);
    return prisma.users.update({
      where: { id: Number(id) },
      data: { deleted_at: new Date(), is_active: false },
    });
  },
};

module.exports = userService;
