/**
 * Device Management Constants (UC025)
 */

export const DEVICE_TYPE_LABELS = {
  smartwatch: 'Đồng hồ thông minh',
  fitness_band: 'Vòng đeo tay',
  medical_device: 'Thiết bị y tế',
};

export const DEVICE_TYPE_COLORS = {
  smartwatch: 'bg-blue-50 text-blue-600 border-blue-100',
  fitness_band: 'bg-purple-50 text-purple-600 border-purple-100',
  medical_device: 'bg-emerald-50 text-emerald-600 border-emerald-100',
};

export const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'true', label: 'Hoạt động' },
  { value: 'false', label: 'Đã khóa' },
];

export const OWNER_OPTIONS = [
  { value: '', label: 'Tất cả thiết bị' },
  { value: 'true', label: 'Đã có chủ' },
  { value: 'false', label: 'Chưa có chủ' },
];

export const DEVICE_TYPE_OPTIONS = [
  { value: '', label: 'Tất cả loại' },
  { value: 'smartwatch', label: 'Đồng hồ thông minh' },
  { value: 'fitness_band', label: 'Vòng đeo tay' },
  { value: 'medical_device', label: 'Thiết bị y tế' },
];

/**
 * Format battery level with color
 */
export const getBatteryColor = (level) => {
  if (level >= 60) return 'text-emerald-600';
  if (level >= 30) return 'text-amber-600';
  return 'text-rose-600';
};

/**
 * Format signal strength with color
 */
export const getSignalColor = (strength) => {
  if (strength >= 70) return 'text-emerald-600';
  if (strength >= 40) return 'text-amber-600';
  return 'text-rose-600';
};
