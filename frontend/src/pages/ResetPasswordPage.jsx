import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Heart, Lock, Eye, EyeOff, ArrowLeft, ArrowRight, Loader2, AlertTriangle, CheckCircle, ShieldCheck } from 'lucide-react';
import { resetPassword } from '../services/authService';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!newPassword) e.newPassword = 'Vui lòng nhập mật khẩu mới.';
    else if (newPassword.length < 6) e.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự.';
    if (!confirmPassword) e.confirmPassword = 'Vui lòng xác nhận mật khẩu.';
    else if (newPassword !== confirmPassword) e.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setApiError(null);
    setIsLoading(true);

    try {
      const result = await resetPassword({ token, newPassword, confirmPassword });
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

  // Không có token trong URL
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-[440px] text-center">
          <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-100">
            <AlertTriangle size={36} className="text-amber-500" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">Link không hợp lệ</h1>
          <p className="text-slate-500 font-medium mb-8">
            Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu link mới.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/forgot-password"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-2xl text-sm transition-all"
            >
              Yêu cầu link mới
            </Link>
            <Link
              to="/login"
              className="text-slate-600 hover:text-slate-900 font-bold py-3 px-6 rounded-2xl text-sm border border-slate-200 hover:bg-slate-50 transition-all"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex selection:bg-indigo-100">

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 relative overflow-hidden bg-slate-900 border-r border-slate-800">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] hover:scale-110" 
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=2000&q=80")' }} 
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/95 via-slate-900/90 to-slate-900/95" />

        <div className="relative flex items-center gap-4 z-10">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 border border-white/10">
            <Heart size={32} className="text-white fill-white/20" />
          </div>
          <span className="text-white font-bold text-3xl tracking-tight">HealthGuard Admin</span>
        </div>

        <div className="relative z-10 w-full max-w-xl pb-10">
          <h2 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 tracking-tight">
            Đặt lại<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-300">Mật khẩu mới</span>
          </h2>
          <p className="text-slate-300/90 text-xl leading-relaxed max-w-lg font-medium">
            Tạo mật khẩu mới cho tài khoản của bạn. Mật khẩu phải có ít nhất 6 ký tự.
          </p>
        </div>

        <div className="relative z-10 text-slate-500 text-sm font-bold uppercase tracking-widest">
          <p>© 2026 HealthGuard System Core</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-white p-8 relative overflow-y-auto">
        <div className="w-full max-w-[440px]">

          <div className="flex lg:hidden items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Heart size={24} className="text-white fill-white/20" />
            </div>
            <span className="text-slate-900 font-bold text-3xl tracking-tight">HealthGuard Admin</span>
          </div>

          {/* Success state */}
          {success ? (
            <div className="space-y-6">
              <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
                <ShieldCheck size={40} className="text-emerald-600" />
              </div>

              <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">Đặt lại thành công!</h1>
                <p className="text-slate-500 font-medium">
                  Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập bằng mật khẩu mới.
                </p>
              </div>

              <button
                onClick={() => navigate('/login')}
                className="w-full bg-slate-900 hover:bg-indigo-700 text-white font-bold py-5 rounded-2xl text-base transition-all duration-300 cursor-pointer shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 group"
              >
                Đăng nhập ngay
                <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
              </button>
            </div>
          ) : (
            <>
              <Link 
                to="/login" 
                className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors mb-8 group"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Quay lại đăng nhập
              </Link>

              <div className="mb-10">
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Đặt lại mật khẩu</h1>
                <p className="text-slate-500 mt-3 text-lg font-medium">Nhập mật khẩu mới cho tài khoản</p>
              </div>

              {/* API Error */}
              {apiError && (
                <div className="mb-8 p-5 rounded-2xl border bg-rose-50 border-rose-100 text-rose-900 flex items-start gap-4">
                  <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm">Lỗi</p>
                    <p className="text-sm font-medium opacity-80 mt-1">{apiError}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* New Password */}
                <div className="space-y-2">
                  <label htmlFor="new-password" className="block text-sm font-bold text-slate-700 uppercase tracking-widest ml-1">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <Lock size={20} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.newPassword ? 'text-rose-400' : 'text-slate-400'}`} />
                    <input
                      id="new-password"
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); if (errors.newPassword) setErrors(prev => ({...prev, newPassword: null})); }}
                      placeholder="Ít nhất 6 ký tự"
                      autoFocus
                      className={`w-full pl-12 pr-12 py-4 border rounded-2xl text-sm font-bold bg-slate-50 border-slate-200 focus:bg-white focus:outline-none focus:ring-4 transition-all placeholder:text-slate-400 shadow-sm ${
                        errors.newPassword ? 'border-rose-300 focus:ring-rose-500/5 focus:border-rose-500' : 'focus:ring-indigo-500/5 focus:border-indigo-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors p-1 active:scale-95"
                    >
                      {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-[12px] font-bold text-rose-500 flex items-center gap-1.5 mt-2 ml-1 uppercase tracking-tight">
                      <AlertTriangle size={14} />
                      {errors.newPassword}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label htmlFor="confirm-password" className="block text-sm font-bold text-slate-700 uppercase tracking-widest ml-1">
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <Lock size={20} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.confirmPassword ? 'text-rose-400' : 'text-slate-400'}`} />
                    <input
                      id="confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors(prev => ({...prev, confirmPassword: null})); }}
                      placeholder="Nhập lại mật khẩu"
                      className={`w-full pl-12 pr-12 py-4 border rounded-2xl text-sm font-bold bg-slate-50 border-slate-200 focus:bg-white focus:outline-none focus:ring-4 transition-all placeholder:text-slate-400 shadow-sm ${
                        errors.confirmPassword ? 'border-rose-300 focus:ring-rose-500/5 focus:border-rose-500' : 'focus:ring-indigo-500/5 focus:border-indigo-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors p-1 active:scale-95"
                    >
                      {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-[12px] font-bold text-rose-500 flex items-center gap-1.5 mt-2 ml-1 uppercase tracking-tight">
                      <AlertTriangle size={14} />
                      {errors.confirmPassword}
                    </p>
                  )}
                  {/* Password match indicator */}
                  {confirmPassword && !errors.confirmPassword && newPassword === confirmPassword && (
                    <p className="text-[12px] font-bold text-emerald-500 flex items-center gap-1.5 mt-2 ml-1 uppercase tracking-tight">
                      <CheckCircle size={14} />
                      Mật khẩu khớp
                    </p>
                  )}
                </div>

                {/* Password requirements */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Yêu cầu mật khẩu</p>
                  <div className="space-y-1.5">
                    <div className={`flex items-center gap-2 text-xs font-medium ${newPassword.length >= 6 ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <CheckCircle size={14} />
                      Ít nhất 6 ký tự
                    </div>
                    <div className={`flex items-center gap-2 text-xs font-medium ${newPassword && confirmPassword && newPassword === confirmPassword ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <CheckCircle size={14} />
                      Mật khẩu xác nhận khớp
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-slate-900 hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 text-white font-bold py-5 rounded-2xl text-base transition-all duration-300 cursor-pointer shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 group"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      Đặt lại mật khẩu
                      <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
