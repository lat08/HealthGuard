# HealthGuard - Hệ Thống Quản Lý Sức Khỏe Thông Minh

HealthGuard là một ứng dụng quản lý sức khỏe toàn diện, được xây dựng với kiến trúc hiện đại, khả năng mở rộng cao và bảo mật. Dự án bao gồm hai phần chính: **Backend (API)** và **Frontend (Giao diện người dùng)**.

---

## Công Nghệ Sử Dụng

### Backend
- **Node.js & Express**: Framework phía server.
- **Prisma**: ORM mạnh mẽ để tương tác với cơ sở dữ liệu.
- **PostgreSQL**: Cơ sở dữ liệu quan hệ.
- **JWT (JSON Web Token)**: Xác thực và phân quyền người dùng.
- **Jest**: Unit testing.
- **Nodemailer**: Gửi email thông báo và đặt lại mật khẩu.

### Frontend
- **React**: Thư viện UI.
- **Vite**: Công cụ build nhanh chóng.
- **Tailwind CSS v4**: Framework CSS hiện đại.
- **React Query (TanStack Query)**: Quản lý trạng thái server.
- **Lucide React**: Bộ icon đẹp mắt.

---

## Hướng Dẫn Cài Đặt và Chạy Project

### 1. Yêu cầu hệ thống
- **Node.js** (v18 trở lên)
- **npm** hoặc **yarn**
- **PostgreSQL** (đã cài đặt và đang chạy)

### 2. Pull mã nguồn
```bash
git clone <url_cua_repo>
cd HealthGuard
```

### 3. Thiết lập Backend
```bash
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env từ file mẫu
cp .env.example .env
```
*Lưu ý: Mở file `.env` và cập nhật thông tin `DATABASE_URL` (PostgreSQL) và các thông số Email của bạn.*

Tiếp theo, cơ sở dữ liệu:
```bash
# Tạo Prisma Client
npx prisma db pull

# Đẩy schema lên database (hoặc chạy migration)
npx prisma generate
```

Chạy backend ở chế độ lập trình:
```bash
npm run dev
```
Backend sẽ mặc định chạy tại: `http://localhost:3000`

### 4. Thiết lập Frontend
Mở một terminal mới tại thư mục gốc của project:
```bash
cd frontend

# Cài đặt dependencies
npm install

# Chạy frontend
npm run dev
```
Giao diện sẽ mặc định chạy tại: `http://localhost:5173` (Vite sẽ tự động proxy các request `/api` sang backend).

---

## Kiểm Thử (Testing)

Dự án sử dụng Jest để thực hiện Unit Test cho Backend.
```bash
cd backend
npm test
```

---

## Cấu Trúc Thư Mục Chính

- `backend/src/controllers`: Xử lý logic các endpoint API.
- `backend/src/services`: Xử lý logic nghiệp vụ và tương tác DB (Prisma).
- `backend/src/routes`: Định nghĩa các đường dẫn API.
- `backend/prisma/schema.prisma`: Định nghĩa cấu trúc database.
- `frontend/src/pages`: Các trang chính của ứng dụng.
- `frontend/src/components`: Các thành phần giao diện dùng chung.
- `frontend/src/hooks`: Custom hooks xử lý logic frontend.

---

## Tài Liệu Tham Khảo Thêm
- [Hướng dẫn phát triển Backend & API Module](./backend/API_GUIDE.md)

---
