export const PAGE_SIZE = 20;

export const ROLE_OPTIONS = [
  { value: '', label: 'Tất cả vai trò' },
  { value: 'patient', label: 'Bệnh nhân' },
  { value: 'caregiver', label: 'Người chăm sóc' },
  { value: 'admin', label: 'Quản trị viên' },
];
export const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Hoạt động' },
  { value: 'locked', label: 'Đã khóa' },
];
export const ROLE_LABELS = { patient: 'Bệnh nhân', caregiver: 'Người chăm sóc', admin: 'Quản trị viên' };
export const ROLE_COLORS = { patient: 'bg-blue-50 text-blue-600 border-blue-100', caregiver: 'bg-emerald-50 text-emerald-600 border-emerald-100', admin: 'bg-indigo-50 text-indigo-600 border-indigo-100' };
export const GENDER_LABELS = { male: 'Nam', female: 'Nữ', other: 'Khác' };

export const GENDER_OPTIONS = [
  { value: '', label: 'Tất cả giới tính' },
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
];
export const BLOOD_OPTIONS = [
  { value: '', label: 'Tất cả nhóm máu' },
  { value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' },
  { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' },
  { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' },
];
export const VERIFIED_OPTIONS = [
  { value: '', label: 'Tất cả xác thực' },
  { value: 'true', label: 'Đã xác thực' },
  { value: 'false', label: 'Chưa xác thực' },
];
