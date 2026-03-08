const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'HealthGuard-v2 API',
    version: '1.0.0',
    description: `API documentation for HealthGuard-v2 Backend

### Auth
- **POST** \`/auth/login\` - Đăng nhập
- **POST** \`/auth/forgot-password\` - Quên mật khẩu
- **POST** \`/auth/reset-password\` - Đặt lại mật khẩu
- **POST** \`/auth/register\` - Admin tạo user
- **GET** \`/auth/me\` - Lấy thông tin user hiện tại
- **POST** \`/auth/logout\` - Đăng xuất
- **PUT** \`/auth/password\` - Đổi mật khẩu

### Users (UC022) - Quản lý người dùng
- **GET** \`/users\` - Danh sách users (phân trang + lọc nâng cao)
- **GET** \`/users/{id}\` - Chi tiết user
- **POST** \`/users\` - Tạo mới user
- **PATCH** \`/users/{id}\` - Cập nhật thông tin
- **PATCH** \`/users/{id}/lock\` - Khóa/Mở khóa tài khoản
- **DELETE** \`/users/{id}\` - Xóa user (cần mật khẩu admin)
`,
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API v1',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          uuid: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          full_name: { type: 'string' },
          phone: { type: 'string', nullable: true },
          role: { type: 'string', enum: ['patient', 'caregiver', 'admin'] },
          is_active: { type: 'boolean' },
          is_verified: { type: 'boolean' },
          gender: { type: 'string', enum: ['male', 'female', 'other'], nullable: true },
          blood_type: { type: 'string', nullable: true },
          height_cm: { type: 'integer', nullable: true },
          weight_kg: { type: 'number', nullable: true },
          medical_conditions: { type: 'array', items: { type: 'string' } },
          created_at: { type: 'string', format: 'date-time' },
          last_login_at: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      UserCreate: {
        type: 'object',
        required: ['email', 'password', 'full_name'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          full_name: { type: 'string' },
          phone: { type: 'string' },
          role: { type: 'string', enum: ['patient', 'caregiver', 'admin'] },
          gender: { type: 'string', enum: ['male', 'female', 'other'] },
          date_of_birth: { type: 'string', format: 'date' },
          blood_type: { type: 'string' },
          height_cm: { type: 'integer' },
          weight_kg: { type: 'number' },
          medical_conditions: { type: 'array', items: { type: 'string' } },
        },
      },
      UserUpdate: {
        type: 'object',
        properties: {
          full_name: { type: 'string' },
          phone: { type: 'string' },
          role: { type: 'string', enum: ['patient', 'caregiver', 'admin'] },
          gender: { type: 'string', enum: ['male', 'female', 'other'] },
          date_of_birth: { type: 'string', format: 'date' },
          blood_type: { type: 'string' },
          height_cm: { type: 'integer' },
          weight_kg: { type: 'number' },
          medical_conditions: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  paths: {
    // ── Auth Routes ─────────────────────────────────────────

    // POST /auth/login - Đăng nhập
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Đăng nhập',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'admin@healthguard.vn' },
                  password: { type: 'string', example: 'Admin@123!' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Success' } },
      },
    },
    // POST /auth/forgot-password - Quên mật khẩu
    '/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Quên mật khẩu',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { type: 'object', properties: { email: { type: 'string' } } } },
          },
        },
        responses: { 200: { description: 'Success' } },
      },
    },
    // POST /auth/reset-password - Đặt lại mật khẩu
    '/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Đặt lại mật khẩu',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  token: { type: 'string' },
                  newPassword: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Success' } },
      },
    },
    // POST /auth/register - Admin tạo user
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: '[ADMIN ONLY] Admin tạo user (Register)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                  name: { type: 'string' },
                  role: { type: 'string', enum: ['patient', 'caregiver', 'admin'], default: 'patient' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Created' } },
      },
    },
    // GET /auth/me - Lấy thông tin user hiện tại
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Lấy thông tin user hiện tại',
        responses: { 200: { description: 'Thông tin user' } },
      },
    },
    // POST /auth/logout - Đăng xuất
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Đăng xuất',
        responses: { 200: { description: 'Đăng xuất thành công' } },
      },
    },
    // PUT /auth/password - Đổi mật khẩu
    '/auth/password': {
      put: {
        tags: ['Auth'],
        summary: 'Đổi mật khẩu',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  currentPassword: { type: 'string' },
                  newPassword: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Success' } },
      },
    },

    // ── Users API (UC022) ───────────────────────────────────
    '/users': {
      get: {
        tags: ['Users'],
        summary: '[ADMIN ONLY] Danh sách users (phân trang + lọc nâng cao)',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'role', in: 'query', schema: { type: 'string', enum: ['patient', 'caregiver', 'admin'] } },
          { name: 'is_active', in: 'query', schema: { type: 'boolean' } },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Tìm theo họ tên hoặc email' },
          { name: 'gender', in: 'query', schema: { type: 'string', enum: ['male', 'female', 'other'] } },
          { name: 'blood_type', in: 'query', schema: { type: 'string' } },
          { name: 'is_verified', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                    pagination: {
                      type: 'object',
                      properties: {
                        total: { type: 'integer' },
                        page: { type: 'integer' },
                        limit: { type: 'integer' },
                        totalPages: { type: 'integer' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Users'],
        summary: '[ADMIN ONLY] Tạo mới user',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UserCreate' } },
          },
        },
        responses: { 201: { description: 'Created' } },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: '[ADMIN ONLY] Chi tiết 1 user',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'User info' } },
      },
      patch: {
        tags: ['Users'],
        summary: '[ADMIN ONLY] Cập nhật thông tin user',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UserUpdate' } } },
        },
        responses: { 200: { description: 'Success' } },
      },
      delete: {
        tags: ['Users'],
        summary: '[ADMIN ONLY] Xoá user (soft delete)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['password'],
                properties: { password: { type: 'string', description: 'Mật khẩu admin để xác nhận xóa' } },
              },
            },
          },
        },
        responses: { 200: { description: 'Success' } },
      },
    },
    '/users/{id}/lock': {
      patch: {
        tags: ['Users'],
        summary: '[ADMIN ONLY] Khóa / Mở khóa tài khoản',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Success' } },
      },
    },
  },
};

module.exports = swaggerDocument;
