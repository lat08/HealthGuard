import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, X, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import UserFormModal from '../../components/users/UserFormModal';
import LockConfirmModal from '../../components/users/LockConfirmModal';
import DeleteConfirmModal from '../../components/users/DeleteConfirmModal';
import userService from '../../services/userService';
import UsersToolbar from '../../components/users/UsersToolbar';
import UsersTable from '../../components/users/UsersTable';
import UsersPagination from '../../components/users/UsersPagination';
import { PAGE_SIZE } from '../../components/users/UsersConstants';

/**
 * Map API user → UI user format
 */
const mapUser = (u) => ({
  id: u.id,
  uuid: u.uuid,
  fullName: u.full_name,
  email: u.email,
  phone: u.phone || '',
  gender: u.gender || null,
  role: u.role,
  status: u.is_active ? 'active' : 'locked',
  isVerified: u.is_verified || false,
  bloodType: u.blood_type || null,
  heightCm: u.height_cm || null,
  weightKg: u.weight_kg ? Number(u.weight_kg) : null,
  dateOfBirth: u.date_of_birth ? u.date_of_birth.split('T')[0] : '',
  medicalConditions: u.medical_conditions || [],
  createdAt: u.created_at ? new Date(u.created_at).toISOString().split('T')[0] : '',
});

/**
 * Map UI form → API payload
 */
const mapFormToApi = (formData, mode) => {
  const payload = {
    full_name: formData.fullName,
    phone: formData.phone || null,
    role: formData.role,
    gender: formData.gender || null,
    date_of_birth: formData.dateOfBirth || null,
    blood_type: formData.bloodType || null,
    height_cm: formData.heightCm ? parseInt(formData.heightCm) : null,
    weight_kg: formData.weightKg ? parseFloat(formData.weightKg) : null,
    medical_conditions: formData.medicalConditions
      ? (typeof formData.medicalConditions === 'string'
          ? formData.medicalConditions.split(',').map(s => s.trim()).filter(Boolean)
          : formData.medicalConditions)
      : [],
  };

  if (mode === 'add') {
    payload.email = formData.email;
    payload.password = formData.password;
  }

  return payload;
};

const UserManagementPage = () => {
  // ── State ───────────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ 
    search: '', role: '', status: '', 
    gender: '', bloodType: '', isVerified: '' 
  });
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);

  const [formModal, setFormModal] = useState({ open: false, mode: 'add', user: null });
  const [lockModal, setLockModal] = useState({ open: false, user: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, user: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast notification
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = (type, message) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ type, message });
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  // ── Fetch users from API ────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userService.getUsers({
        page,
        limit: PAGE_SIZE,
        role: filters.role,
        status: filters.status,
        search: filters.search,
        gender: filters.gender,
        bloodType: filters.bloodType,
        isVerified: filters.isVerified,
      });

      if (res.success) {
        setUsers((res.data || []).map(mapUser));
        setTotal(res.pagination?.total || 0);
      } else {
        showToast('error', res.message || 'Không thể tải danh sách người dùng');
      }
    } catch (err) {
      showToast('error', 'Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // ── Search & Filter ─────────────────────────────────
  const searchTimer = useRef(null);

  const handleSearchChange = (value) => {
    setSearchInput(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setFilters((f) => ({ ...f, search: value }));
      setPage(1);
    }, 400);
  };

  const handleFilterChange = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  // ── CRUD handlers (Optimistic UI) ───────────────────
  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const apiData = mapFormToApi(formData, formModal.mode);
      let res;

      if (formModal.mode === 'add') {
        res = await userService.createUser(apiData);
        if (res.success && res.data) {
          // Optimistic: thêm user mới vào đầu danh sách
          setUsers(prev => [mapUser(res.data), ...prev]);
          setTotal(prev => prev + 1);
          showToast('success', 'Thêm người dùng thành công');
          setFormModal({ open: false, mode: 'add', user: null });
        } else {
          showToast('error', res.message || 'Thao tác thất bại');
        }
      } else {
        res = await userService.updateUser(formModal.user.id, apiData);
        if (res.success && res.data) {
          // Optimistic: cập nhật user trong danh sách hiện tại
          const updatedUser = mapUser(res.data);
          setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
          showToast('success', 'Cập nhật thành công');
          setFormModal({ open: false, mode: 'add', user: null });
        } else {
          showToast('error', res.message || 'Thao tác thất bại');
        }
      }
    } catch (err) {
      showToast('error', 'Lỗi kết nối server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLock = async () => {
    setIsSubmitting(true);
    try {
      const res = await userService.toggleLockUser(lockModal.user.id);

      if (res.success && res.data) {
        // Optimistic: cập nhật trạng thái ngay trong danh sách
        const updatedStatus = res.data.is_active ? 'active' : 'locked';
        setUsers(prev => prev.map(u =>
          u.id === lockModal.user.id ? { ...u, status: updatedStatus } : u
        ));
        showToast('success', res.message || 'Cập nhật trạng thái thành công');
        setLockModal({ open: false, user: null });
      } else {
        showToast('error', res.message || 'Thao tác thất bại');
      }
    } catch (err) {
      showToast('error', 'Lỗi kết nối server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (password) => {
    setIsSubmitting(true);
    try {
      const res = await userService.deleteUser(deleteModal.user.id, password);

      if (res.success) {
        // Optimistic: xóa user khỏi danh sách ngay lập tức
        setUsers(prev => prev.filter(u => u.id !== deleteModal.user.id));
        setTotal(prev => prev - 1);
        showToast('success', 'Đã xóa người dùng');
        setDeleteModal({ open: false, user: null });
        // Nếu xóa user cuối trang → quay lại trang trước
        if (users.length === 1 && page > 1) setPage(p => p - 1);
      } else {
        showToast('error', res.message || 'Xóa thất bại');
      }
    } catch (err) {
      showToast('error', 'Lỗi kết nối server');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ──────────────────────────────────────────
  return (
    <div className="max-w-[1400px] mx-auto space-y-10 animate-in fade-in duration-700">
      {/* Toast notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-bold animate-in slide-in-from-bottom-2 duration-300 border ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-200/50' : 'bg-rose-50 text-rose-700 border-rose-200 shadow-rose-200/50'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 p-0.5 rounded-lg hover:bg-white/50 transition-colors">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Quản lý tài khoản</h2>
          <p className="text-slate-500 font-medium mt-2">
            Hệ thống hiện đang vận hành với <span className="text-indigo-600 font-bold">{total}</span> người dùng.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchUsers()}
            disabled={loading}
            className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all active:scale-95 cursor-pointer border border-transparent hover:border-indigo-100"
            title="Làm mới"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setFormModal({ open: true, mode: 'add', user: null })}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Plus size={18} />
            Thêm người dùng mới
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <UsersToolbar
        searchInput={searchInput}
        onSearchChange={handleSearchChange}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={() => { 
          setSearchInput(''); 
          setFilters({ search: '', role: '', status: '', gender: '', bloodType: '', isVerified: '' }); 
          setPage(1); 
        }}
      />

      {/* Table */}
      <UsersTable
        users={users}
        loading={loading}
        filters={filters}
        onEdit={(user) => setFormModal({ open: true, mode: 'edit', user })}
        onLock={(user) => setLockModal({ open: true, user })}
        onDelete={(user) => setDeleteModal({ open: true, user })}
      />

      {/* Pagination */}
      <UsersPagination
        total={total}
        page={page}
        onPageChange={setPage}
      />

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
