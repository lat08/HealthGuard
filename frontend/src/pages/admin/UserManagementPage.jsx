import { useState, useMemo } from 'react';
import { 
  Plus, Search, X, ChevronLeft, ChevronRight, 
  ChevronsLeft, ChevronsRight, Filter, ChevronDown,
  Pencil, Lock, Unlock, Trash2, UserPlus, ShieldCheck, Activity
} from 'lucide-react';
import UserFormModal from '../../components/users/UserFormModal';
import LockConfirmModal from '../../components/users/LockConfirmModal';
import DeleteConfirmModal from '../../components/users/DeleteConfirmModal';


const INITIAL_USERS = [
  { id: 1, fullName: 'Nguyễn Văn An', email: 'an.nguyen@email.com', phone: '0901234567', gender: 'male', role: 'patient', status: 'active', isVerified: true, bloodType: 'A+', heightCm: 170, weightKg: 68, dateOfBirth: '1958-05-15', medicalConditions: ['hypertension', 'diabetes'], createdAt: '2026-01-15' },
  { id: 2, fullName: 'Trần Thị Bình', email: 'binh.tran@email.com', phone: '0912345678', gender: 'female', role: 'patient', status: 'active', isVerified: true, bloodType: 'O+', heightCm: 155, weightKg: 52, dateOfBirth: '1965-08-22', medicalConditions: ['heart_disease'], createdAt: '2026-01-18' },
  { id: 3, fullName: 'Lê Minh Cường', email: 'cuong.le@email.com', phone: '0923456789', gender: 'male', role: 'patient', status: 'active', isVerified: false, bloodType: 'B+', heightCm: 175, weightKg: 80, dateOfBirth: '1970-11-03', medicalConditions: [], createdAt: '2026-01-20' },
  { id: 4, fullName: 'Phạm Thị Dung', email: 'dung.pham@email.com', phone: '0934567890', gender: 'female', role: 'patient', status: 'locked', isVerified: true, bloodType: 'AB-', heightCm: 160, weightKg: 55, dateOfBirth: '1972-02-28', medicalConditions: ['diabetes'], createdAt: '2026-02-01' },
  { id: 5, fullName: 'Hoàng Văn Em', email: 'em.hoang@email.com', phone: '0945678901', gender: 'male', role: 'caregiver', status: 'active', isVerified: true, bloodType: null, heightCm: null, weightKg: null, dateOfBirth: '1985-07-10', medicalConditions: [], createdAt: '2026-02-05' },
  { id: 6, fullName: 'Vũ Thị Hoa', email: 'hoa.vu@email.com', phone: '0956789012', gender: 'female', role: 'caregiver', status: 'active', isVerified: true, bloodType: null, heightCm: null, weightKg: null, dateOfBirth: '1988-12-01', medicalConditions: [], createdAt: '2026-02-08' },
  { id: 7, fullName: 'Đỗ Quang Huy', email: 'huy.do@email.com', phone: '0967890123', gender: 'male', role: 'admin', status: 'active', isVerified: true, bloodType: null, heightCm: 180, weightKg: 75, dateOfBirth: '1990-04-16', medicalConditions: [], createdAt: '2026-01-10' },
  { id: 8, fullName: 'Ngô Thị Lan', email: 'lan.ngo@email.com', phone: '0978901234', gender: 'female', role: 'patient', status: 'active', isVerified: true, bloodType: 'O-', heightCm: 158, weightKg: 48, dateOfBirth: '1960-09-25', medicalConditions: ['hypertension'], createdAt: '2026-02-12' },
  { id: 9, fullName: 'Bùi Đức Mạnh', email: 'manh.bui@email.com', phone: '0989012345', gender: 'male', role: 'patient', status: 'active', isVerified: false, bloodType: 'B-', heightCm: 168, weightKg: 72, dateOfBirth: '1975-06-08', medicalConditions: ['obesity'], createdAt: '2026-02-15' },
  { id: 10, fullName: 'Lý Thùy Trang', email: 'trang.ly@email.com', phone: '0990123456', gender: 'female', role: 'caregiver', status: 'locked', isVerified: true, bloodType: null, heightCm: null, weightKg: null, dateOfBirth: '1992-03-14', medicalConditions: [], createdAt: '2026-02-18' },
  { id: 11, fullName: 'Trương Văn Phúc', email: 'phuc.truong@email.com', phone: '0901122334', gender: 'male', role: 'patient', status: 'active', isVerified: true, bloodType: 'A-', heightCm: 165, weightKg: 62, dateOfBirth: '1968-01-20', medicalConditions: ['heart_disease', 'diabetes'], createdAt: '2026-02-20' },
  { id: 12, fullName: 'Đinh Thị Quỳnh', email: 'quynh.dinh@email.com', phone: '0912233445', gender: 'female', role: 'patient', status: 'active', isVerified: true, bloodType: 'AB+', heightCm: 162, weightKg: 58, dateOfBirth: '1956-11-30', medicalConditions: ['hypertension', 'arthritis'], createdAt: '2026-02-22' },
];

const PAGE_SIZE = 20;

const ROLE_OPTIONS = [
  { value: '', label: 'Tất cả vai trò' },
  { value: 'patient', label: 'Bệnh nhân' },
  { value: 'caregiver', label: 'Người chăm sóc' },
  { value: 'admin', label: 'Quản trị viên' },
];
const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Hoạt động' },
  { value: 'locked', label: 'Đã khóa' },
];
const ROLE_LABELS = { patient: 'Bệnh nhân', caregiver: 'Người chăm sóc', admin: 'Quản trị viên' };
const ROLE_COLORS = { patient: 'bg-blue-50 text-blue-600 border-blue-100', caregiver: 'bg-emerald-50 text-emerald-600 border-emerald-100', admin: 'bg-indigo-50 text-indigo-600 border-indigo-100' };
const STATUS_LABELS = { active: 'Hoạt động', locked: 'Đã khóa' };
const STATUS_COLORS = { active: 'text-emerald-600 bg-emerald-50/50', locked: 'text-rose-600 bg-rose-50/50' };
const GENDER_LABELS = { male: 'Nam', female: 'Nữ', other: 'Khác' };

const UserManagementPage = () => {

  const [allUsers, setAllUsers] = useState(INITIAL_USERS);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: '', role: '', status: '' });
  const [searchInput, setSearchInput] = useState('');


  const [formModal, setFormModal] = useState({ open: false, mode: 'add', user: null });
  const [lockModal, setLockModal] = useState({ open: false, user: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null });
  const [isSubmitting, setIsSubmitting] = useState(false);


  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      if (filters.role && u.role !== filters.role) return false;
      if (filters.status && u.status !== filters.status) return false;
      if (filters.search) {
        const s = filters.search.toLowerCase();
        if (!u.fullName.toLowerCase().includes(s) && !u.email.toLowerCase().includes(s) && !u.phone.includes(s)) return false;
      }
      return true;
    });
  }, [filters, allUsers]);

  const total = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const users = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearchChange = (value) => {
    setSearchInput(value);
    clearTimeout(window.__searchTimer);
    window.__searchTimer = setTimeout(() => {
      setFilters((f) => ({ ...f, search: value }));
      setPage(1);
    }, 300);
  };

  const handleFilterChange = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };


  const handleFormSubmit = (formData) => {
    setIsSubmitting(true);
    // Simulate API delay
    setTimeout(() => {
      if (formModal.mode === 'add') {
        const newUser = {
          ...formData,
          id: Math.max(...allUsers.map(u => u.id)) + 1,
          status: 'active',
          isVerified: false,
          heightCm: formData.heightCm ? parseInt(formData.heightCm) : null,
          weightKg: formData.weightKg ? parseFloat(formData.weightKg) : null,
          medicalConditions: formData.medicalConditions ? formData.medicalConditions.split(',').map(s => s.trim()).filter(Boolean) : [],
          createdAt: new Date().toISOString().split('T')[0],
        };
        setAllUsers(prev => [newUser, ...prev]);
      } else {
        setAllUsers(prev => prev.map(u =>
          u.id === formModal.user.id
            ? { ...u, fullName: formData.fullName, phone: formData.phone, role: formData.role, gender: formData.gender, dateOfBirth: formData.dateOfBirth, bloodType: formData.bloodType, heightCm: formData.heightCm ? parseInt(formData.heightCm) : u.heightCm, weightKg: formData.weightKg ? parseFloat(formData.weightKg) : u.weightKg }
            : u
        ));
      }
      setIsSubmitting(false);
      setFormModal({ open: false, mode: 'add', user: null });
    }, 600);
  };

  const handleToggleLock = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setAllUsers(prev => prev.map(u =>
        u.id === lockModal.user.id
          ? { ...u, status: u.status === 'active' ? 'locked' : 'active' }
          : u
      ));
      setIsSubmitting(false);
      setLockModal({ open: false, user: null });
    }, 500);
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setAllUsers(prev => prev.filter(u => u.id !== deleteModal.user.id));
      setIsSubmitting(false);
      setDeleteModal({ open: false, user: null });
    }, 500);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Quản lý tài khoản</h2>
          <p className="text-slate-500 font-medium mt-2">
            Hệ thống hiện đang vận hành với {allUsers.length} người dùng.
          </p>
        </div>
        <button
          onClick={() => setFormModal({ open: true, mode: 'add', user: null })}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <Plus size={18} />
          Thêm người dùng mới
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={searchInput} onChange={(e) => handleSearchChange(e.target.value)} placeholder="Tìm theo tên hoặc email người dùng..."
              className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 transition-all placeholder:text-slate-400 font-medium" />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative group min-w-[160px]">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none"><Filter size={14} /></div>
              <select value={filters.role} onChange={(e) => handleFilterChange('role', e.target.value)} className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 appearance-none focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 transition-all cursor-pointer">
                {ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><ChevronDown size={14} /></div>
            </div>
            <div className="relative group min-w-[160px]">
              <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className="w-full px-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 appearance-none focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 transition-all cursor-pointer">
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><ChevronDown size={14} /></div>
            </div>
            {(filters.search || filters.role || filters.status) && (
              <button onClick={() => { setSearchInput(''); setFilters({ search: '', role: '', status: '' }); setPage(1); }}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer whitespace-nowrap">
                <X size={16} /> Làm mới
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-16 text-center">ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest min-w-[240px]">Người dùng</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center w-24">Giới tính</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-48">Chỉ số sức khỏe</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center w-36">Vai trò</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center w-36">Trạng thái</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-36 text-center sticky right-0 bg-slate-50/90 backdrop-blur-sm z-10 border-l border-slate-100">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200"><UserPlus size={32} /></div>
                      <div className="space-y-1">
                        <p className="font-bold text-slate-800">Không tìm thấy người dùng phù hợp</p>
                        <p className="text-xs text-slate-400 max-w-[280px] mx-auto">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/30 transition-all duration-200 group">
                    <td className="px-6 py-4 text-center"><span className="text-[11px] font-bold text-slate-300 font-mono">#{user.id}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 text-xs font-bold shadow-sm shrink-0">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-slate-800 text-sm truncate">{user.fullName}</p>
                            {user.isVerified && <span title="Đã xác thực" className="flex items-center shrink-0"><ShieldCheck size={14} className="text-blue-500" /></span>}
                          </div>
                          <p className="text-[11px] text-slate-400 font-medium mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                            {user.phone}<span className="mx-1.5 text-slate-200">|</span>{user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold whitespace-nowrap ${user.gender === 'male' ? 'bg-blue-50 text-blue-500' : user.gender === 'female' ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-500'}`}>
                        {user.gender ? GENDER_LABELS[user.gender] : '---'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 whitespace-nowrap">
                        <Activity size={12} className="text-slate-300 shrink-0" />
                        <span className="text-slate-800">{user.bloodType ?? '---'}</span>
                        <span className="text-slate-200">|</span>
                        <span>{user.heightCm ? `${user.heightCm}cm` : '---'}</span>
                        <span className="text-slate-200">|</span>
                        <span>{user.weightKg ? `${user.weightKg}kg` : '---'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap ${ROLE_COLORS[user.role]}`}>
                        {ROLE_LABELS[user.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap ${STATUS_COLORS[user.status]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></span>
                        {STATUS_LABELS[user.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center sticky right-0 bg-white/90 backdrop-blur-sm z-10 border-l border-slate-50 group-hover:bg-slate-50/90 transition-colors shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.05)]">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setFormModal({ open: true, mode: 'edit', user })}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 rounded-xl transition-all active:scale-90"
                          title="Chỉnh sửa"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setLockModal({ open: true, user })}
                          className={`p-2 rounded-xl transition-all active:scale-90 border border-transparent hover:shadow-sm hover:bg-white ${user.status === 'active' ? 'text-slate-400 hover:text-amber-500 hover:border-amber-100' : 'text-slate-400 hover:text-emerald-500 hover:border-emerald-100'}`}
                          title={user.status === 'active' ? 'Khóa' : 'Kích hoạt'}
                        >
                          {user.status === 'active' ? <Lock size={16} /> : <Unlock size={16} />}
                        </button>
                        <button
                          onClick={() => setDeleteModal({ open: true, user })}
                          className="p-2 text-slate-300 hover:text-rose-500 hover:bg-white hover:border-rose-100 border border-transparent hover:shadow-sm rounded-xl transition-all active:scale-90"
                          title="Xóa bỏ"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 px-2">
          <p className="text-[13px] font-medium text-slate-500">
            Hiển thị <span className="text-slate-900 font-bold">{Math.min((page - 1) * PAGE_SIZE + 1, total)}</span>
            –<span className="text-slate-900 font-bold">{Math.min(page * PAGE_SIZE, total)}</span>
            {' '}trong <span className="text-slate-900 font-bold">{total}</span> kết quả
          </p>
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-slate-200 rounded-xl bg-white p-1 shadow-sm">
              <button onClick={() => setPage(1)} disabled={page === 1} className="p-2 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"><ChevronsLeft size={16} /></button>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"><ChevronLeft size={16} /></button>
              <div className="h-4 w-px bg-slate-200 mx-1"></div>
              <div className="flex items-center px-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${p === page ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-slate-600 hover:bg-slate-50'}`}>{p}</button>
                ))}
              </div>
              <div className="h-4 w-px bg-slate-200 mx-1"></div>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"><ChevronRight size={16} /></button>
              <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="p-2 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"><ChevronsRight size={16} /></button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modals ─── */}
      {formModal.open && (
        <UserFormModal
          key={formModal.user?.id || 'add'}
          isOpen={formModal.open}
          onClose={() => setFormModal({ open: false, mode: 'add', user: null })}
          mode={formModal.mode}
          user={formModal.user}
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
        />
      )}

      <LockConfirmModal
        isOpen={lockModal.open}
        onClose={() => setLockModal({ open: false, user: null })}
        user={lockModal.user}
        onConfirm={handleToggleLock}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, user: null })}
        user={deleteModal.user}
        onConfirm={handleDelete}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default UserManagementPage;
