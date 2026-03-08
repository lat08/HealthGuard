import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, ArrowLeft, ArrowRight, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { forgotPassword } from '../services/authService';

function validateEmail(email) {
  if (!email.trim()) return 'Vui lòng nhập email.';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'Email không đúng định dạng.';
  return null;
}

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const eErr = validateEmail(email);
    setEmailError(eErr);
    if (eErr) return;

    setApiError(null);
    setIsLoading(true);

    try {
      const result = await forgotPassword(email);
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
            Khôi phục<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-300">Mật khẩu</span>
          </h2>
          <p className="text-slate-300/90 text-xl leading-relaxed max-w-lg font-medium">
            Nhập email đã đăng ký để nhận link đặt lại mật khẩu. Link sẽ hết hạn sau 15 phút.
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

          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors mb-8 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Quay lại đăng nhập
          </Link>

          <div className="mb-10">
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Quên mật khẩu</h1>
            <p className="text-slate-500 mt-3 text-lg font-medium">
              Nhập email để nhận link đặt lại mật khẩu
            </p>
          </div>

          {/* Success state */}
          {success ? (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle size={24} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-bold text-emerald-900 text-sm">Email đã được gửi!</p>
                    <p className="text-emerald-700/80 text-sm mt-1.5 leading-relaxed">
                      Nếu email <strong>{email}</strong> tồn tại trong hệ thống, bạn sẽ nhận được link đặt lại mật khẩu. 
                      Vui lòng kiểm tra email (bao gồm cả thư mục spam).
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100">
                <p className="text-amber-800 text-sm font-medium">
                  ⏰ Link sẽ hết hạn sau <strong>15 phút</strong>. Nếu không nhận được email, hãy thử lại.
                </p>
              </div>

              <div className="flex gap-3">
                <Link 
                  to="/login" 
                  className="flex-1 text-center bg-slate-900 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl text-sm transition-all"
                >
                  Quay lại đăng nhập
                </Link>
                <button
                  onClick={() => { setSuccess(false); setEmail(''); }}
                  className="px-6 text-slate-600 hover:text-slate-900 font-bold py-4 rounded-2xl text-sm border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Gửi lại
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* API Error */}
              {apiError && (
                <div className="p-5 rounded-2xl border bg-rose-50 border-rose-100 text-rose-900 flex items-start gap-4">
                  <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                  <p className="text-sm font-bold">{apiError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div className="space-y-2">
                  <label htmlFor="forgot-email" className="block text-sm font-bold text-slate-700 uppercase tracking-widest ml-1">
                    Email đã đăng ký
                  </label>
                  <div className="relative">
                    <Mail size={20} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${emailError ? 'text-rose-400' : 'text-slate-400'}`} />
                    <input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(null); }}
                      onBlur={() => setEmailError(validateEmail(email))}
                      placeholder="admin@healthguard.vn"
                      autoFocus
                      className={`w-full pl-12 pr-4 py-4 border rounded-2xl text-sm font-bold bg-slate-50 border-slate-200 focus:bg-white focus:outline-none focus:ring-4 transition-all placeholder:text-slate-400 shadow-sm ${
                        emailError ? 'border-rose-300 focus:ring-rose-500/5 focus:border-rose-500' : 'focus:ring-indigo-500/5 focus:border-indigo-500'
                      }`}
                    />
                  </div>
                  {emailError && (
                    <p className="text-[12px] font-bold text-rose-500 flex items-center gap-1.5 mt-2 ml-1 uppercase tracking-tight">
                      <AlertTriangle size={14} />
                      {emailError}
                    </p>
                  )}
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
                      Gửi link đặt lại
                      <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
