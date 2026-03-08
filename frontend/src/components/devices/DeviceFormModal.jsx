import { useState, useEffect } from 'react';
import { AlertCircle, Loader2, Smartphone, Tag, Cpu, Wifi } from 'lucide-react';
import Modal from '../ui/Modal';
import { DEVICE_TYPE_OPTIONS } from './DevicesConstants';

const FieldError = ({ error }) =>
  error ? (
    <p className="text-[11px] text-rose-500 font-bold mt-1.5 flex items-center gap-1.5 uppercase tracking-wide">
      <AlertCircle size={12} />
      {error}
    </p>
  ) : null;

const inputClass = (hasError) =>
  `w-full px-4 py-3 border rounded-xl text-sm font-semibold transition-all duration-200 ${
    hasError
      ? 'bg-rose-50 border-rose-200 text-rose-900 focus:ring-4 focus:ring-rose-500/10'
      : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400'
  }`;

const DeviceFormModal = ({ isOpen, onClose, device, onSubmit, mode = 'edit' }) => {
  const [formData, setFormData] = useState({
    device_name: '',
    device_type: 'smartwatch',
    model: '',
    firmware_version: '',
    serial_number: '',
    mac_address: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && device) {
      setFormData({
        device_name: device.device_name || '',
        device_type: device.device_type || 'smartwatch',
        model: device.model || '',
        firmware_version: device.firmware_version || '',
        serial_number: device.serial_number || '',
        mac_address: device.mac_address || '',
      });
    } else {
      setFormData({
        device_name: '',
        device_type: 'smartwatch',
        model: '',
        firmware_version: '',
        serial_number: '',
        mac_address: '',
      });
    }
    setErrors({});
    setIsSubmitting(false);
  }, [device, isOpen, mode]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.device_name.trim()) {
      newErrors.device_name = 'Vui lòng nhập tên thiết bị.';
    }
    
    if (mode === 'add') {
      if (!formData.serial_number.trim()) {
        newErrors.serial_number = 'Vui lòng nhập số serial.';
      }
      if (!formData.mac_address.trim()) {
        newErrors.mac_address = 'Vui lòng nhập địa chỉ MAC.';
      } else if (!/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(formData.mac_address)) {
        newErrors.mac_address = 'Địa chỉ MAC không hợp lệ (VD: 00:1B:44:11:3A:B7).';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'add' ? 'Thiết bị mới' : 'Cập nhật thiết bị'}
      size="xl"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Device Name */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[12px] font-bold text-slate-500 uppercase tracking-widest">
              <Smartphone size={14} className="text-slate-400" /> Tên thiết bị{' '}
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.device_name}
              onChange={(e) => handleChange('device_name', e.target.value)}
              placeholder="Apple Watch Series 8"
              className={inputClass(errors.device_name)}
            />
            <FieldError error={errors.device_name} />
          </div>

          {/* Device Type */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[12px] font-bold text-slate-500 uppercase tracking-widest">
              <Tag size={14} className="text-slate-400" /> Loại thiết bị
            </label>
            <select
              value={formData.device_type}
              onChange={(e) => handleChange('device_type', e.target.value)}
              className={inputClass(errors.device_type)}
            >
              {DEVICE_TYPE_OPTIONS.filter((opt) => opt.value).map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Model */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[12px] font-bold text-slate-500 uppercase tracking-widest">
              <Cpu size={14} className="text-slate-400" /> Model
            </label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => handleChange('model', e.target.value)}
              placeholder="Apple Watch S8"
              className={inputClass(errors.model)}
            />
          </div>

          {/* Firmware Version */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[12px] font-bold text-slate-500 uppercase tracking-widest">
              <Wifi size={14} className="text-slate-400" /> Phiên bản firmware
            </label>
            <input
              type="text"
              value={formData.firmware_version}
              onChange={(e) => handleChange('firmware_version', e.target.value)}
              placeholder="VD: 1.0.5"
              className={inputClass(errors.firmware_version)}
            />
          </div>

          {/* Serial Number */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[12px] font-bold text-slate-500 uppercase tracking-widest">
              <Tag size={14} className="text-slate-400" /> Số Serial{' '}
              {mode === 'add' && <span className="text-rose-500">*</span>}
            </label>
            <input
              type="text"
              value={formData.serial_number}
              onChange={(e) => handleChange('serial_number', e.target.value)}
              disabled={mode === 'edit'}
              placeholder="SN001234567"
              className={
                mode === 'edit'
                  ? 'w-full px-4 py-3 border rounded-xl text-sm font-semibold bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-75'
                  : inputClass(errors.serial_number)
              }
            />
            {mode === 'edit' && (
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1.5 ml-1">
                Định danh cố định
              </p>
            )}
            <FieldError error={errors.serial_number} />
          </div>

          {/* MAC Address */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[12px] font-bold text-slate-500 uppercase tracking-widest">
              <Wifi size={14} className="text-slate-400" /> Địa chỉ MAC{' '}
              {mode === 'add' && <span className="text-rose-500">*</span>}
            </label>
            <input
              type="text"
              value={formData.mac_address}
              onChange={(e) => handleChange('mac_address', e.target.value)}
              disabled={mode === 'edit'}
              placeholder="00:1B:44:11:3A:B7"
              className={
                mode === 'edit'
                  ? 'w-full px-4 py-3 border rounded-xl text-sm font-semibold bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-75'
                  : inputClass(errors.mac_address)
              }
            />
            {mode === 'edit' && (
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1.5 ml-1">
                Định danh cố định
              </p>
            )}
            <FieldError error={errors.mac_address} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            {mode === 'add' ? 'Thêm thiết bị' : 'Cập nhật'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default DeviceFormModal;
