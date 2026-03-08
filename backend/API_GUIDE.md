# HƯỚNG DẪN TẠO API MODULE & UNIT TEST HOÀN CHỈNH

Tài liệu này hướng dẫn từng bước (Step-by-step) để xây dựng một API module chuẩn chỉnh trong dự án backend HealthGuard-v2, bao gồm từ việc định nghĩa routes, viết logic cho service, đến test tự động hóa (Unit test) bằng Jest.

---

## PHẦN 1: XÂY DỰNG API MODULE

Kiến trúc chuẩn của hệ thống chia API thành 3 Layers chính để đảm bảo Clean Code và Separation of Concerns:
**`Route` (Điều hướng/Validate) -> `Controller` (Nhận/Tranh luồng) -> `Service` (Business Logic/DB).**

Ví dụ chúng ta cần tạo module Quản lý Cài đặt: `settings`.

### Bước 1: Tạo tệp Validation & Route (Routes Layer)
**File**: `src/routes/settings.routes.js`

Validation giúp chặn các input không đúng chuẩn ngay tại cổng, trước khi lọt vào logic của hệ thống.

```javascript
const express = require('express');
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const { requireAuth, requireRole } = require('../middlewares/auth');
const settingsController = require('../controllers/settings.controller');

const router = express.Router();

// 1. Validation schema
const updateSettingValidation = [
  body('theme').optional().isIn(['light', 'dark']).withMessage('Theme phải là light hoặc dark'),
  body('notificationsEnabled').optional().isBoolean().withMessage('Chỉ nhận giá trị boolean'),
];

// 2. Định nghĩa Route theo chuẩn RESTful
// GET /api/v1/settings -> Lấy settings của user
router.get(
  '/',
  requireAuth, // Chặn nếu chưa login
  settingsController.getSettings
);

// PUT /api/v1/settings -> Cập nhật settings
router.put(
  '/',
  requireAuth,
  validate(updateSettingValidation), // Chạy xác thực dữ liệu
  settingsController.updateSettings
);

module.exports = router;
```

### Bước 2: Tạo Controller (API Endpoint Layer)
**File**: `src/controllers/settings.controller.js`

Controller Cấm không được chứa business logic xử lý Database. Nó chỉ có nhiệm vụ GỌI `req`, NÉM qua cho Service, rồi TRẢ LẠI json `res`.

```javascript
const settingsService = require('../services/settings.service');
const ApiResponse = require('../utils/ApiResponse');

const settingsController = {
  getSettings: async (req, res, next) => {
    try {
      // req.user được middleware auth set vào
      const userId = req.user.userId;
      
      const settings = await settingsService.getSettings(userId);
      
      // Sử dụng ApiResponse format để tạo đồng nhất
      res.status(200).json(ApiResponse.success(settings, 'Lấy cấu hình thành công'));
    } catch (error) {
      next(error); // Chuyển sang global error handler
    }
  },

  updateSettings: async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const updateData = req.body;
      
      const updated = await settingsService.updateSettings(userId, updateData);
      res.status(200).json(ApiResponse.success(updated, 'Cập nhật thành công'));
    } catch (error) {
      next(error);
    }
  }
};

module.exports = settingsController;
```

### Bước 3: Tạo Service (Business Logic & DB Layer)
**File**: `src/services/settings.service.js`

Service là trái tim của hệ thống. Nó chịu trách nhiệm gọi DB qua `Prisma` và quăng `ApiError` nếu có lỗi nghiệp vụ (Vd: Không lừa được dữ liệu, Cấm truy cập...).

```javascript
const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');

const settingsService = {
  getSettings: async (userId) => {
    // Luôn xài try/catch hay không tuỳ vào bạn, lỗi sẽ tự trôi sang Controller
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { theme: true, notifications_enabled: true } // Lấy vừa đủ
    });

    if (!user) throw ApiError.notFound('Người dùng không tồn tại');
    return user;
  },

  updateSettings: async (userId, payload) => {
    // 1. Kiểm tra logic / ràng buộc (Nếu có)
    
    // 2. Thực thi update DB
    const updated = await prisma.users.update({
      where: { id: userId },
      data: {
        ...(payload.theme && { theme: payload.theme }),
        ...(payload.notificationsEnabled !== undefined && { notifications_enabled: payload.notificationsEnabled })
      },
      select: { theme: true, notifications_enabled: true }
    });

    return updated;
  }
};

module.exports = settingsService;
```

### Bước 4: Đăng ký Router lên Express App
**File**: `src/app.js`

```javascript
const settingsRoutes = require('./routes/settings.routes');

// ...
app.use('/api/v1/auth', authRoutes);
// Thêm Router của bạn vào đây
app.use('/api/v1/settings', settingsRoutes);
```

---

## PHẦN 2: VIẾT JEST UNIT TEST
Unit Test trong Node.js (với Jest) giúp đảm bảo Backend không bị vỡ logic mỗi lần bạn chỉnh sửa code. Hệ thống chúng ta sẽ **Mock hoàn toàn Prisma DB**, không tạo kết nối DB thật.

**File test tạo ở**: `src/__tests__/services/settings.service.test.js`

### Cấu Trúc File Unit Test

```javascript
// 1. Khai báo Mock cho Prisma 
jest.mock('../../utils/prisma');

const prisma = require('../../utils/prisma');
const ApiError = require('../../utils/ApiError');
const settingsService = require('../../services/settings.service');

describe('Settings Service', () => {
    
  // Don dep Mock sau moi test case
  afterEach(() => {
    jest.clearAllMocks();
  });

  // =======================================================
  // Test suite cho getSettings()
  // =======================================================
  describe('getSettings', () => {
      
    // Trường hợp 1: Lỗi do Không tìm thấy
    it('should throw 404 error if user not found', async () => {
      // Bước chuẩn bị (Arrange): Giả lập database trả về rỗng (null)
      prisma.users.findUnique.mockResolvedValue(null);

      // Bước hành động (Act) và đánh giá (Assert)
      await expect(settingsService.getSettings(999))
        .rejects.toThrow('Người dùng không tồn tại'); // Chữ báo lỗi phải khớp %100

      // Khẳng định DB đã được gọi với ID đúng
      expect(prisma.users.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
        select: expect.any(Object)
      });
    });

    // Trường hợp 2: Happy Path - Trả về thành công
    it('should return user settings successfully', async () => {
      // Mock db trả về object
      const mockResult = { theme: 'dark', notifications_enabled: true };
      prisma.users.findUnique.mockResolvedValue(mockResult);

      const result = await settingsService.getSettings(1);
      
      expect(result).toEqual(mockResult); // Trả ra khớp API
    });
  });

  // =======================================================
  // Test suite cho updateSettings()
  // =======================================================
  describe('updateSettings', () => {
    it('should update and return new settings', async () => {
      const updatePayload = { theme: 'light' };
      const updatedUser = { theme: 'light', notifications_enabled: false };
      
      // Mock Prisma return object 
      prisma.users.update.mockResolvedValue(updatedUser);

      const result = await settingsService.updateSettings(1, updatePayload);

      // Assert data return
      expect(result).toEqual(updatedUser);
      
      // Kiểm tra xem query Prisma.update có nhận tham số đúng form không
      expect(prisma.users.update).toHaveBeenCalledWith(
        expect.objectContaining({    // Chỉ test data thay đổi có chuẩn hay không
          where: { id: 1 },
          data: expect.objectContaining({ theme: 'light' }) 
        })
      );
    });
  });

});
```

### Chạy Test
Chạy duy nhất file test của bạn thông qua lệnh sau:
```bash
npm run test -- settings.service.test.js
```
*Tip:* Thêm `--watch` vào sau lệnh nếu muốn hot-reload bộ test liên tục mỗi khi save.

---

## PHẦN 3: CẬP NHẬT CẤU TRÚC DATABASE (PRISMA MIGRATIONS)

Khi tạo một module mới mà cần **thêm bảng mới** hoặc **thêm cột** vào bảng cũ, bạn cần thực hiện theo các bước sau để đảm bảo dự án đồng bộ:

### Bước 1: Cập nhật Schema
Chỉnh sửa file `backend/prisma/schema.prisma` để thêm Model hoặc Field mới.

### Bước 2: Tạo Migration
Chạy lệnh sau để Prisma tự động so sánh và tạo file SQL thay đổi:
```bash
npx prisma migrate dev --name add_new_table_or_column
```
*Lệnh này sẽ:*
1. Tạo file SQL trong thư mục `prisma/migrations`.
2. Cập nhật database local của bạn.
3. Cập nhật Prisma Client để bạn có thể code với các trường mới ngay lập tức.

### Bước 3: Đồng bộ SQL Script sang PM_REVIEW (Quy trình bắt buộc)
Để đảm bảo PM và AI Reviewer có thể kiểm soát thay đổi Database, mọi thay đổi cấu trúc từ Prisma **PHẢI** được copy sang thư mục quản lý tập trung trong workspace `PM_REVIEW`:

1. **Lấy nội dung SQL**: Sau khi chạy lệnh migrate ở Bước 2, hãy mở file vừa sinh ra tại: `SQL_SCRIPTS/<stt>_<tên_migration>.sql`.
2. **Xác định số thứ tự**: Truy cập vào thư mục `PM_REVIEW/SQL SCRIPTS/` để kiểm tra số thứ tự lớn nhất hiện tại (Ví dụ hiện tại đang là `11_...`).
3. **Tạo file script mới**: 
   - Tạo file mới với định dạng: `XX_tên_mô_tả_ngắn_gọn.sql`.
   - *Ví dụ:* `12_create_module_settings.sql` hoặc `13_add_column_to_users.sql`.
4. **Lưu nội dung**: Dán toàn bộ mã SQL từ file `migration.sql` vào file mới này. Điều này giúp hệ thống Review tự động nắm bắt được sự thay đổi của bảng và cột.

---

## DANH SÁCH KIỂM TRA (CHECKLIST) KHI VIẾT API CỦA TEAM:

- [ ] Cổng nhận liệu (`req.body`, `req.query`, `req.params`) đã có Validator chặn rác.
- [ ] Tất cả Response gửi đi phải qua wrapper JSON chứa format: `{ success: true, data: ..., message: ... }` (dùng `ApiResponse`).
- [ ] Các thông báo báo lỗi (HTTP 400, 403, 404) KHÔNG dùng `res.status().send()` ở Service, mà phải `throw ApiError.xyz("Lỗi");`
- [ ] Mọi Error có bị lọt `try {} catch (er)` đều gọi `next(er)` chuyển đi.
- [ ] Nếu sửa DB nhiều bảng cùng lúc, phải bao lại bởi transaction: `await prisma.$transaction([...])`.
- [ ] Đối với Test: Test Service logic phải cover mọi chướng ngại vật (if null, reject fail) -> đạt coverage > 85%.
