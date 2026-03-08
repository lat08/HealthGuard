import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import Modal from '../ui/Modal';
import { DEVICE_TYPE_OPTIONS } from './DevicesConstants';

const DeviceFormModal = ({ isOpen, onClose, device, onSubmit }) => {
  const [formData, setFormData] = useState({
    device_name: '',
    device_type: 'smartwatch',
    model: '',
    firmware_version: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (device) {
      setFormData({
        device_name: device.device_name || '',
        device_type: device.device_type || 'smartwatch',
        model: device.model || '',
        firmware_version: device.firmware_version || '',
      });
    } else {
      setFormData({
        device_name: '',
        device_type: 'smartwatch',
        model: '',
        firmware_version: '',
      });
    }
    setErrors({});
  }, [device, isOpen]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.device_name.trim()) {
      newErrors.device_name = 'Tên thiết bị không được để trống';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">
            {device ? 'Chỉnh sửa thiết bị' : 'Thêm thiết bị mới'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Device Name */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Tên thiết bị <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.device_name}
              onChange={(e) => handleChange('device_name', e.target.value)}
              className={`w-full px-4 py-3 bg-slate-50/50 border rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                errors.device_name ? 'border-rose-300 focus:border-rose-300' : 'border-slate-200 focus:border-indigo-300'
              }`}
              placeholder="VD: Smartwatch của Nguyễn Văn A"
            />
            {errors.device_name && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.device_name}</p>}
          </div>

          {/* Device Type */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Loại thiết bị</label>
            <select
              value={formData.device_type}
              onChange={(e) => handleChange('device_type', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
            >
              {DEVICE_TYPE_OPTIONS.filter((opt) => opt.value).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Model */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Model</label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => handleChange('model', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
              placeholder="VD: Apple Watch Series 8"
            />
          </div>

          {/* Firmware Version */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Phiên bản firmware</label>
            <input
              type="text"
              value={formData.firmware_version}
              onChange={(e) => handleChange('firmware_version', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
              placeholder="VD: 1.0.5"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all active:scale-95"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-indigo-500 text-white text-sm font-bold rounded-xl hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center gap-2"
            >
              <Save size={16} />
              {isSubmitting ? 'Đang lưu...' : device ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default DeviceFormModal;
