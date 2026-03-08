import { useState } from 'react';
import { Lock, Eye, EyeOff, X, Loader2, AlertTriangle, CheckCircle, ShieldCheck } from 'lucide-react';
import { changePassword } from '../../services/authService';

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!currentPassword) e.currentPassword = 'Vui lòng nhập mật khẩu hiện tại.';
    if (!newPassword) e.newPassword = 'Vui lòng nhập mật khẩu mới.';
    else if (newPassword.length < 6) e.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự.';
    if (!confirmPassword) e.confirmPassword = 'Vui lòng xác nhận mật khẩu.';
    else if (newPassword !== confirmPassword) e.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    setErrors({});
    setApiError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setApiError(null);
    setIsLoading(true);

    try {
      const result = await changePassword({ currentPassword, newPassword, confirmPassword });
      if (result.success) {
        setSuccess(true);
      } else {
        setApiError(result.message || 'Có lỗi xảy ra.');
      }
    } catch {
      setApiError('Không thể kết nối đến máy chủ.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Lock size={20} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Đổi mật khẩu</h2>
              <p className="text-xs text-slate-500 font-medium">Cập nhật mật khẩu tài khoản</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {success ? (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
                <ShieldCheck size={32} className="text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-lg">Đổi mật khẩu thành công!</p>
                <p className="text-slate-500 text-sm mt-2">Mật khẩu đã được cập nhật. Email thông báo đã được gửi.</p>
              </div>
              <button
                onClick={handleClose}
                className="w-full bg-slate-900 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl text-sm transition-all cursor-pointer"
              >
                Đóng
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* API Error */}
              {apiError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-900 flex items-start gap-3">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                  <p className="text-sm font-bold">{apiError}</p>
                </div>
              )}

              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest ml-1">
                  Mật khẩu hiện tại
                </label>
                <div className="relative">
                  <Lock size={18} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${errors.currentPassword ? 'text-rose-400' : 'text-slate-400'}`} />
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => { setCurrentPassword(e.target.value); if (errors.currentPassword) setErrors(p => ({...p, currentPassword: null})); }}
                    placeholder="Nhập mật khẩu hiện tại"
                    className={`w-full pl-11 pr-11 py-3.5 border rounded-xl text-sm font-bold bg-slate-50 focus:bg-white focus:outline-none focus:ring-3 transition-all placeholder:text-slate-400 ${
                      errors.currentPassword ? 'border-rose-300 focus:ring-rose-500/5 focus:border-rose-500' : 'border-slate-200 focus:ring-indigo-500/5 focus:border-indigo-500'
                    }`}
                  />
                  <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors">
                    {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-[11px] font-bold text-rose-500 flex items-center gap-1 ml-1">
                    <AlertTriangle size={12} /> {errors.currentPassword}
                  </p>
                )}
              </div>

              <div className="border-t border-slate-100" />

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest ml-1">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <Lock size={18} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${errors.newPassword ? 'text-rose-400' : 'text-slate-400'}`} />
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); if (errors.newPassword) setErrors(p => ({...p, newPassword: null})); }}
                    placeholder="Ít nhất 6 ký tự"
                    className={`w-full pl-11 pr-11 py-3.5 border rounded-xl text-sm font-bold bg-slate-50 focus:bg-white focus:outline-none focus:ring-3 transition-all placeholder:text-slate-400 ${
                      errors.newPassword ? 'border-rose-300 focus:ring-rose-500/5 focus:border-rose-500' : 'border-slate-200 focus:ring-indigo-500/5 focus:border-indigo-500'
                    }`}
                  />
                  <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors">
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-[11px] font-bold text-rose-500 flex items-center gap-1 ml-1">
                    <AlertTriangle size={12} /> {errors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest ml-1">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <Lock size={18} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${errors.confirmPassword ? 'text-rose-400' : 'text-slate-400'}`} />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors(p => ({...p, confirmPassword: null})); }}
                    placeholder="Nhập lại mật khẩu mới"
                    className={`w-full pl-11 pr-11 py-3.5 border rounded-xl text-sm font-bold bg-slate-50 focus:bg-white focus:outline-none focus:ring-3 transition-all placeholder:text-slate-400 ${
                      errors.confirmPassword ? 'border-rose-300 focus:ring-rose-500/5 focus:border-rose-500' : 'border-slate-200 focus:ring-indigo-500/5 focus:border-indigo-500'
                    }`}
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors">
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-[11px] font-bold text-rose-500 flex items-center gap-1 ml-1">
                    <AlertTriangle size={12} /> {errors.confirmPassword}
                  </p>
                )}
                {confirmPassword && !errors.confirmPassword && newPassword === confirmPassword && (
                  <p className="text-[11px] font-bold text-emerald-500 flex items-center gap-1 ml-1">
                    <CheckCircle size={12} /> Mật khẩu khớp
                  </p>
                )}
              </div>

              {/* Requirements */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="space-y-1">
                  <div className={`flex items-center gap-2 text-[11px] font-medium ${newPassword.length >= 6 ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <CheckCircle size={12} /> Ít nhất 6 ký tự
                  </div>
                  <div className={`flex items-center gap-2 text-[11px] font-medium ${newPassword && confirmPassword && newPassword === confirmPassword ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <CheckCircle size={12} /> Xác nhận khớp
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-3.5 rounded-xl text-sm font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3.5 rounded-xl text-sm font-bold bg-slate-900 hover:bg-indigo-700 text-white transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Xác nhận'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
