import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Mail, 
  Lock, 
  AlertTriangle, 
  Clock, 
  X, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Loader2
} from 'lucide-react';
import { login, getErrorMessage } from '../services/authService';


function validateEmail(email) {
  if (!email.trim()) return 'Vui lòng nhập email.';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'Email không đúng định dạng.';
  return null;
}
function validatePassword(password) {
  if (!password) return 'Vui lòng nhập mật khẩu.';
  return null;
}


const ERROR_ICONS = {
  ACCOUNT_LOCKED: ({ size }) => <Lock size={size ?? 20} />,
  ACCOUNT_NOT_VERIFIED: ({ size }) => <Mail size={size ?? 20} />,
  INVALID_CREDENTIALS: ({ size }) => <AlertTriangle size={size ?? 20} />,
  TOO_MANY_REQUESTS: ({ size }) => <Clock size={size ?? 20} />,
};

const LoginPage = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);


  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);


  const [apiError, setApiError] = useState(null);

  const handleEmailBlur = () => setEmailError(validateEmail(email));
  const handlePasswordBlur = () => setPasswordError(validatePassword(password));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) return;

    setApiError(null);
    setIsLoading(true);

    try {
      const result = await login({ email, password });
      if (result.success) {
        onLoginSuccess();
      } else {
        // Map backend response { success, statusCode, message } → UI error { code, message }
        const code =
          result.statusCode === 423 ? 'ACCOUNT_LOCKED' :
          result.statusCode === 429 ? 'TOO_MANY_REQUESTS' :
          result.statusCode === 401 ? 'INVALID_CREDENTIALS' :
          result.statusCode === 403 ? 'ACCOUNT_NOT_VERIFIED' :
          'INTERNAL_ERROR';
        setApiError({ code, message: result.message || 'Có lỗi xảy ra' });
      }
    } catch {
      setApiError({
        code: 'NETWORK_ERROR',
        message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex selection:bg-indigo-100">

      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 relative overflow-hidden bg-slate-900 border-r border-slate-800">

        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] hover:scale-110" 
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=2000&q=80")' }} 
        />

        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/95 via-slate-900/90 to-slate-900/95" />
        

        <div className="relative flex items-center gap-4 z-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 border border-white/10">
            <Heart size={32} className="text-white fill-white/20" />
          </div>
          <span className="text-white font-bold text-3xl tracking-tight">HealthGuard Admin</span>
        </div>


        <div className="relative z-10 w-full max-w-xl pb-10 animate-in fade-in slide-in-from-left-4 duration-1000">
          <h2 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 tracking-tight">
            Nền tảng Quản lý<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-300">Sức khỏe</span>
          </h2>
          <p className="text-slate-300/90 text-xl leading-relaxed max-w-lg font-medium">
            Phân tích dữ liệu sinh tồn thời gian thực, cảnh báo sớm nguy cơ đột quỵ và hỗ trợ phản ứng khẩn cấp 24/7.
          </p>
        </div>


        <div className="relative z-10 text-slate-500 text-sm font-bold uppercase tracking-widest animate-in fade-in duration-1000">
          <p>© 2026 HealthGuard System Core</p>
        </div>
      </div>


      <div className="flex-1 flex items-center justify-center bg-white p-8 relative overflow-y-auto">
        <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-700">

          <div className="flex lg:hidden items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Heart size={24} className="text-white fill-white/20" />
            </div>
            <span className="text-slate-900 font-bold text-3xl tracking-tight">HealthGuard Admin</span>
          </div>

          <div className="mb-10">
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Đăng nhập</h1>
            <p className="text-slate-500 mt-3 text-lg font-medium">Truy cập bảng điều khiển trung tâm</p>
          </div>


          {apiError && (
            <div className={`mb-8 p-5 rounded-2xl border flex items-start gap-4 animate-in slide-in-from-top-4 duration-300 ${
              apiError.code === 'ACCOUNT_LOCKED'
                ? 'bg-amber-50 border-amber-100 text-amber-900'
                : apiError.code === 'TOO_MANY_REQUESTS'
                ? 'bg-orange-50 border-orange-100 text-orange-900'
                : 'bg-rose-50 border-rose-100 text-rose-900'
            }`}>
              <div className="shrink-0 mt-0.5">
                {(() => {
                  const IconComponent = ERROR_ICONS[apiError.code];
                  return IconComponent ? <IconComponent size={20} /> : <AlertTriangle size={20} />;
                })()}
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm tracking-tight">{
                  apiError.code === 'ACCOUNT_LOCKED' ? 'Tài khoản đã bị khóa' :
                  apiError.code === 'TOO_MANY_REQUESTS' ? 'Yêu cầu quá giới hạn' :
                  apiError.code === 'INVALID_CREDENTIALS' ? 'Đăng nhập thất bại' :
                  apiError.code === 'ACCOUNT_NOT_VERIFIED' ? 'Tài khoản chưa xác thực' :
                  'Có lỗi xảy ra'
                }</p>
                <p className="mt-1 text-sm font-medium opacity-80 leading-relaxed">{getErrorMessage(apiError)}</p>
              </div>
              <button onClick={() => setApiError(null)} className="p-1 hover:bg-black/5 rounded-lg transition-colors cursor-pointer active:scale-95">
                <X size={18} />
              </button>
            </div>
          )}

          <div className="space-y-8">
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-bold text-slate-700 uppercase tracking-widest ml-1">
                  Email Quản trị
                </label>
                <div className="relative">
                  <Mail size={20} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${emailError ? 'text-rose-400' : 'text-slate-400'}`} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(null); }}
                    onBlur={handleEmailBlur}
                    placeholder="admin@healthguard.vn"
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


              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label htmlFor="password" className="block text-sm font-bold text-slate-700 uppercase tracking-widest">
                    Mật khẩu
                  </label>
                  <Link to="/forgot-password" tabIndex={-1} className="text-xs text-indigo-600 hover:text-indigo-800 font-bold uppercase tracking-wider transition-colors">
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={20} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${passwordError ? 'text-rose-400' : 'text-slate-400'}`} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (passwordError) setPasswordError(null); }}
                    onBlur={handlePasswordBlur}
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-12 py-4 border rounded-2xl text-sm font-bold bg-slate-50 border-slate-200 focus:bg-white focus:outline-none focus:ring-4 transition-all placeholder:text-slate-400 shadow-sm ${
                      passwordError ? 'border-rose-300 focus:ring-rose-500/5 focus:border-rose-500' : 'focus:ring-indigo-500/5 focus:border-indigo-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors p-1 active:scale-95"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-[12px] font-bold text-rose-500 flex items-center gap-1.5 mt-2 ml-1 uppercase tracking-tight">
                    <AlertTriangle size={14} />
                    {passwordError}
                  </p>
                )}
              </div>


              <div className="flex items-center gap-3 py-1">
                <div className="relative flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500/20 cursor-pointer accent-indigo-600"
                  />
                </div>
                <label htmlFor="remember" className="text-sm font-bold text-slate-500 cursor-pointer select-none">
                  Duy trì đăng nhập
                </label>
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
                    Xác nhận Đăng nhập
                    <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
