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
          id: { type: 'string' },
          email: { type: 'string' },
          name: { type: 'string' },
          role: { type: 'string' },
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
                  email: { type: 'string', example: 'admin@example.com' },
                  password: { type: 'string', example: 'password123' },
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
        summary: 'Admin tạo user',
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
                  role: { type: 'string', example: 'USER' },
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

    // ── Users API ───────────────────────────────────────────
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'Danh sách users (paginated)',
        responses: { 200: { description: 'List of users' } },
      },
      post: {
        tags: ['Users'],
        summary: 'Tạo mới user',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/User' } },
          },
        },
        responses: { 201: { description: 'Created' } },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Chi tiết 1 user',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'User info' } },
      },
      put: {
        tags: ['Users'],
        summary: 'Cập nhật toàn bộ user',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
        },
        responses: { 200: { description: 'Success' } },
      },
      patch: {
        tags: ['Users'],
        summary: 'Cập nhật một phần user',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
        },
        responses: { 200: { description: 'Success' } },
      },
      delete: {
        tags: ['Users'],
        summary: 'Xoá user (soft delete)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Success' } },
      },
    },
  },
};

module.exports = swaggerDocument;
