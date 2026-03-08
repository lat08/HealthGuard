import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { Outlet, useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  '/admin/overview': 'Tổng quan hệ thống',
  '/admin/users': 'Quản lý người dùng',
  '/admin/devices': 'Quản lý thiết bị',
};

const AdminLayout = ({ onLogout }) => {
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] || 'Admin Center';

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <AdminSidebar />
      <div className="flex flex-col flex-1 min-w-0 pl-64">
        <AdminHeader pageTitle={pageTitle} onLogout={onLogout} />
        <main className="flex-1 p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
