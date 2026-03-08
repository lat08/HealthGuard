import { useState } from 'react';
import { Bell, LogOut, Search, Lock } from 'lucide-react';
import { getUser } from '../../services/authService';
import ChangePasswordModal from './ChangePasswordModal';

const AdminHeader = ({ pageTitle, onLogout }) => {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const user = getUser();

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 h-12 flex items-center justify-between shadow-sm shadow-slate-200/50">

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Trang</span>
          <span className="text-slate-300">/</span>
          <h1 className="text-sm font-bold text-slate-800">{pageTitle}</h1>
        </div>


        <div className="flex items-center gap-6">

          <div className="hidden md:flex items-center relative text-slate-400 focus-within:text-indigo-500 transition-colors">
            <Search size={16} className="absolute left-2.5" />
            <input 
              type="text" 
              placeholder="Tìm nhanh..." 
              className="bg-slate-100/50 border-none rounded-lg py-1.5 pl-9 pr-4 text-xs font-medium focus:ring-1 focus:ring-indigo-500/20 w-48 transition-all"
            />
          </div>


          <div className="flex items-center gap-1">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer relative group">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Thông báo
              </div>
            </button>

            <button 
              onClick={() => setShowChangePassword(true)}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer relative group"
            >
              <Lock size={18} />
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Đổi mật khẩu
              </div>
            </button>
          </div>

          <div className="w-px h-6 bg-slate-200"></div>


          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="text-right hidden sm:block">
                <p className="text-[12px] font-bold text-slate-800 leading-none">{user?.full_name || 'Admin User'}</p>
                <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-tighter">{user?.role === 'admin' ? 'Quản trị viên' : user?.role || 'Quản trị viên'}</p>
              </div>
              <div className="w-9 h-9 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs shadow-sm">
                {user?.full_name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer group"
              title="Đăng xuất"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <ChangePasswordModal 
        isOpen={showChangePassword} 
        onClose={() => setShowChangePassword(false)} 
      />
    </>
  );
};

export default AdminHeader;
