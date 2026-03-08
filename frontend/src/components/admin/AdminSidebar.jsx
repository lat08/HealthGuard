import { LayoutDashboard, Users, Heart, Smartphone } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/admin/overview', label: 'Tổng quan', icon: <LayoutDashboard size={20} /> },
  { path: '/admin/users', label: 'Quản lý người dùng', icon: <Users size={20} /> },
  { path: '/admin/devices', label: 'Quản lý thiết bị', icon: <Smartphone size={20} /> },
];

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed inset-y-0 left-0 flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 z-50">

      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
          <Heart size={22} className="text-white fill-white/20" />
        </div>
        <div>
          <span className="text-white font-bold text-lg tracking-tight leading-none block">HealthGuard</span>
          <span className="text-indigo-400 text-[10px] font-bold tracking-[0.2em] uppercase mt-1 block">Admin Center</span>
        </div>
      </div>


      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <p className="px-3 mb-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Hệ thống</p>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer text-left group ${
                isActive
                  ? 'bg-indigo-600/10 text-white'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className={`transition-colors duration-200 ${
                isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
              }`}>
                {item.icon}
              </span>
              {item.label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
              )}
            </Link>
          );
        })}
      </nav>


      <div className="px-6 py-6 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400">
            v1.0
          </div>
          <p className="text-[11px] text-slate-500 font-medium">© 2026 Admin Dashboard</p>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
