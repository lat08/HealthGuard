import { useState } from 'react';
import { Eye, EyeOff, AlertCircle, Loader2, Mail, User as UserIcon, Phone, ShieldCheck, Calendar, Users } from 'lucide-react';
import Modal from '../ui/Modal';

const ROLE_OPTIONS = [
  { value: 'patient', label: 'Bệnh nhân' },
  { value: 'caregiver', label: 'Người chăm sóc' },
  { value: 'admin', label: 'Quản trị viên' },
];

const GENDER_OPTIONS = [
  { value: '', label: 'Chưa xác định' },
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
];

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

const UserFormModal = ({ isOpen, onClose, mode, user, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState(() => {
    if (mode === 'edit' && user) {
      return {
        fullName: user.fullName || '', email: user.email || '', phone: user.phone || '', password: '',
        role: user.role || 'patient', gender: user.gender || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        bloodType: user.bloodType || '',
        heightCm: user.heightCm ? user.heightCm.toString() : '',
        weightKg: user.weightKg ? user.weightKg.toString() : '',
        medicalConditions: user.medicalConditions ? user.medicalConditions.join(', ') : '',
      };
    }
    return { fullName: '', email: '', phone: '', password: '', role: 'patient', gender: '', dateOfBirth: '', bloodType: '', heightCm: '', weightKg: '', medicalConditions: '' };
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên.';
    if (mode === 'add') {
      if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email không đúng định dạng.';
      if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu.';
      else if (formData.password.length < 6) newErrors.password = 'Mật khẩu tối thiểu 6 ký tự.';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại.';
    else if (!/^(0[35789])[0-9]{8}$/.test(formData.phone)) newErrors.phone = 'Số điện thoại không hợp lệ.';
    if (formData.heightCm) { const h = parseInt(formData.heightCm); if (isNaN(h) || h < 30 || h > 300) newErrors.heightCm = 'Chiều cao phải từ 30-300 cm.'; }
    if (formData.weightKg) { const w = parseFloat(formData.weightKg); if (isNaN(w) || w < 1 || w > 500) newErrors.weightKg = 'Cân nặng phải từ 1-500 kg.'; }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'add' ? 'Người dùng mới' : 'Cập nhật tài khoản'} size="xl">
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Full name */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[12px] font-bold text-slate-500 uppercase tracking-widest">
              <UserIcon size={14} className="text-slate-400" /> Họ và tên <span className="text-rose-500">*</span>
            </label>
            <input type="text" value={formData.fullName} onChange={(e) => handleChange('fullName', e.target.value)} placeholder="Nguyễn Văn An" className={inputClass(errors.fullName)} />
            <FieldError error={errors.fullName} />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[12px] font-bold text-slate-500 uppercase tracking-widest">
              <Mail size={14} className="text-slate-400" /> Địa chỉ Email <span className="text-rose-500">*</span>
            </label>
            <input type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} disabled={mode === 'edit'} placeholder="patient@healthguard.vn"
              className={mode === 'edit' ? 'w-full px-4 py-3 border rounded-xl text-sm font-semibold bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-75' : inputClass(errors.email)} />
            {mode === 'edit' && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1.5 ml-1">Định danh cố định</p>}
            <FieldError error={errors.email} />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[12px] font-bold text-slate-500 uppercase tracking-widest">
              <Phone size={14} className="text-slate-400" /> Số điện thoại <span className="text-rose-500">*</span>
            </label>
            <input type="tel" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="0901234567" className={inputClass(errors.phone)} />
            <FieldError error={errors.phone} />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[12px] font-bold text-slate-500 uppercase tracking-widest">
              <ShieldCheck size={14} className="text-slate-400" /> Vai trò
            </label>
            <select value={formData.role} onChange={(e) => handleChange('role', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all cursor-pointer">
              {ROLE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[12px] font-bold text-slate-500 uppercase tracking-widest">
              <Users size={14} className="text-slate-400" /> Giới tính
            </label>
            <select value={formData.gender} onChange={(e) => handleChange('gender', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all cursor-pointer">
              {GENDER_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[12px] font-bold text-slate-500 uppercase tracking-widest">
              <Calendar size={14} className="text-slate-400" /> Ngày sinh
            </label>
            <input type="date" value={formData.dateOfBirth} onChange={(e) => handleChange('dateOfBirth', e.target.value)} max={new Date().toISOString().split('T')[0]} className={inputClass(errors.dateOfBirth)} />
            <FieldError error={errors.dateOfBirth} />
          </div>

          {/* Password (add only) */}
          {mode === 'add' && (
            <div className="space-y-2 md:col-span-2">
              <label className="flex items-center gap-2 text-[12px] font-bold text-slate-500 uppercase tracking-widest">
                Mật khẩu ban đầu <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => handleChange('password', e.target.value)} placeholder="Bảo mật tối thiểu 6 ký tự" className={`pr-12 ${inputClass(errors.password)}`} />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer active:scale-95">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <FieldError error={errors.password} />
            </div>
          )}

          {/* Medical info (patient only) */}
          {formData.role === 'patient' && (
            <div className="pt-4 border-t border-slate-100 md:col-span-2">
              <h4 className="text-sm font-bold text-slate-700 mb-4">Chỉ số sức khỏe (Tùy chọn)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Nhóm máu</label>
                  <select value={formData.bloodType} onChange={(e) => handleChange('bloodType', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all cursor-pointer">
                    <option value="">Không rõ</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Chiều cao (cm)</label>
                  <input type="number" value={formData.heightCm} onChange={(e) => handleChange('heightCm', e.target.value)} placeholder="VD: 170" min={30} max={300} className={inputClass(errors.heightCm)} />
                  <FieldError error={errors.heightCm} />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Cân nặng (kg)</label>
                  <input type="number" step="0.1" value={formData.weightKg} onChange={(e) => handleChange('weightKg', e.target.value)} placeholder="VD: 65.5" min={1} max={500} className={inputClass(errors.weightKg)} />
                  <FieldError error={errors.weightKg} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Bệnh lý nền (Cách nhau bằng dấu phẩy)</label>
                <input type="text" value={formData.medicalConditions} onChange={(e) => handleChange('medicalConditions', e.target.value)} placeholder="VD: Tiểu đường, Cao huyết áp..." className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all" />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer active:scale-95">Hủy bỏ</button>
          <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95 cursor-pointer flex items-center justify-center min-w-[140px]">
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : mode === 'add' ? 'Thêm mới' : 'Lưu cập nhật'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UserFormModal;
