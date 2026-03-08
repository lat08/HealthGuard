# Frontend Development Guide - HealthGuard Admin v2

---

## 1. Cấu trúc Module chuẩn
Mọi module mới nên được chia nhỏ để dễ tái sử dụng và bảo trì:

- **`pages/admin/[ModuleName]Page.jsx`**: Container quản lý State chính, gọi API và điều phối các Modal.
- **`components/[module]/[Module]Toolbar.jsx`**: Thanh tìm kiếm, bộ lọc Export/Import.
- **`components/[module]/[Module]Table.jsx`**: Grids hiển thị dữ liệu (View).
- **`components/[module]/[Module]Pagination.jsx`**: Điều hướng phân trang.
- **`components/[module]/[Module]Constants.js`**: Chứa `OPTIONS`, `LABELS`, `COLORS`.

---

## 2. Tiêu chuẩn Tìm kiếm & Sanitization (Xử lý chuỗi)

### 2.1. Escaping Regex trong Search (Sanitization cho hiển thị)
Khi dùng từ khóa tìm kiếm để Highlight văn bản (thông qua `HighlightText`), bắt buộc phải **Escape** các ký tự đặc biệt của Regex để tránh crash ứng dụng (VD: người dùng nhập `[` hoặc `*`).

**Sử dụng helper chuẩn:**
```javascript
const HighlightText = ({ text, keyword }) => {
  if (!keyword || !text) return <>{text}</>;
  
  // SANITIZATION: Escape các ký tự đặc biệt của Regex (\ ^ $ * + ? . ( ) | { } [ ])
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = String(text).split(regex);
  
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === keyword.toLowerCase()
          ? <mark key={i} className="bg-yellow-200/80 text-yellow-900 rounded-sm px-0.5 font-bold">{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </>
  );
};
```

### 2.2. Debounce Search Input
Không gọi API liên tục mỗi khi nhấn phím. Sử dụng `useRef` để tạo timer (400ms):
```javascript
const searchTimer = useRef(null);

const handleSearchChange = (value) => {
  setSearchInput(value);
  if (searchTimer.current) clearTimeout(searchTimer.current);
  searchTimer.current = setTimeout(() => {
    setFilters((f) => ({ ...f, search: value }));
    setPage(1);
  }, 400);
};
```

---

## 3. UI/UX Đồng bộ (Lucide Icons & Tailwind)

### Status Chips (Trạng thái)
Dùng cùng một kiểu component `span` cho các trạng thái hoạt động:
- **Active**: `text-emerald-600 bg-emerald-50/50` + Dot xanh.
- **Locked/Inactive**: `text-rose-600 bg-rose-50/50` + Dot đỏ (animate-pulse).

### Table Actions
Luôn đặt cột "Thao tác" ở chế độ `sticky right` để dễ tiếp cận trên màn hình nhỏ:
```jsx
<td className="sticky right-0 bg-white/90 backdrop-blur-sm z-10 border-l border-slate-50 group-hover:bg-slate-50/90 transition-colors shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.05)]">
  {/* Pencil (Indigo), Lock (Amber/Emerald), Trash (Rose) */}
</td>
```

---

## 4. Mapping Dữ liệu (API <-> UI)

Luôn tách biệt logic Mapping để Controller/Component không bị "ngập" trong việc xử lý format (VD: đổi `full_name` thành `fullName` trên UI).

- **`mapUser` (API -> UI)**: Format ngày tháng, chuẩn hóa số (`heightCm`, `weightKg`).
- **`mapFormToApi` (UI -> API)**: Parse kiểu dữ liệu (`parseInt`, `parseFloat`), gộp mảng `medicalConditions`.

---

## 5. Optimistic UI Updates
Khi thực hiện CRUD (Add/Edit/Delete), hãy cập nhật State trực tiếp ngay sau khi API trả về thành công thay vì gọi lại `fetchData()` (giúp app cực kỳ mượt mà):

- **Add**: `setUsers(prev => [mapUser(res.data), ...prev])`
- **Update**: `setUsers(prev => prev.map(u => u.id === updated.id ? updated : u))`
- **Delete**: `setUsers(prev => prev.filter(u => u.id !== deletedId))`

---

## 6. Token Invalidation (Backend Sync)
Khi Admin khóa một tài khoản (`toggleLock`), Frontend phải hiển thị thông báo rõ ràng. Backend sẽ tự động tăng `token_version` để đăng xuất tài khoản bị khóa ở mọi phiên đăng nhập khác.

---
*Cập nhật lần cuối: 2026-03-08*
