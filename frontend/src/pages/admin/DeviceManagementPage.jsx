import { useState, useEffect, useRef } from 'react';
import { RefreshCw, X, CheckCircle2, AlertCircle, Plus } from 'lucide-react';
import DevicesToolbar from '../../components/devices/DevicesToolbar';
import DevicesTable from '../../components/devices/DevicesTable';
import DevicesPagination from '../../components/devices/DevicesPagination';
import DeviceFormModal from '../../components/devices/DeviceFormModal';
import AssignDeviceModal from '../../components/devices/AssignDeviceModal';
import LockDeviceModal from '../../components/devices/LockDeviceModal';
import UnassignDeviceModal from '../../components/devices/UnassignDeviceModal';
import deviceService from '../../services/deviceService';

const DeviceManagementPage = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState({
    is_active: '',
    has_owner: '',
    search: '',
    device_type: '',
  });

  const [searchInput, setSearchInput] = useState('');
  const searchTimer = useRef(null);

  // Modals state
  const [addModal, setAddModal] = useState({ isOpen: false });
  const [editModal, setEditModal] = useState({ isOpen: false, device: null });
  const [assignModal, setAssignModal] = useState({ isOpen: false, device: null });
  const [lockModal, setLockModal] = useState({ isOpen: false, device: null });
  const [unassignModal, setUnassignModal] = useState({ isOpen: false, device: null });

  // Toast notification (giống User Management)
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = (type, message) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ type, message });
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetchDevices();
  }, [page, filters]);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const response = await deviceService.getDevices({
        page,
        limit,
        ...filters,
      });
      setDevices(response.data || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      showToast('error', 'Không thể tải danh sách thiết bị');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSearchChange = (value) => {
    setSearchInput(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: value }));
      setPage(1);
    }, 400);
  };

  // ── Add Device ────────────────────────────────────────
  const handleAdd = () => {
    setAddModal({ isOpen: true });
  };

  const handleAddSubmit = async (formData) => {
    try {
      const response = await deviceService.createDevice(formData);
      const newDevice = response.data;
      setDevices((prev) => [newDevice, ...prev]);
      setTotal((prev) => prev + 1);
      showToast('success', 'Thêm thiết bị thành công');
    } catch (error) {
      console.error('Add error:', error);
      showToast('error', error.message || 'Không thể thêm thiết bị');
      throw error;
    }
  };

  // ── Edit Device ──────────────────────────────────────
  const handleEdit = (device) => {
    setEditModal({ isOpen: true, device });
  };

  const handleEditSubmit = async (formData) => {
    try {
      const response = await deviceService.updateDevice(editModal.device.id, formData);
      const updatedDevice = response.data;
      setDevices((prev) => prev.map((d) => (d.id === updatedDevice.id ? updatedDevice : d)));
      showToast('success', 'Cập nhật thiết bị thành công');
    } catch (error) {
      console.error('Update error:', error);
      showToast('error', error.message || 'Không thể cập nhật thiết bị');
      throw error;
    }
  };

  // ── Assign Device ────────────────────────────────────
  const handleAssign = (device) => {
    setAssignModal({ isOpen: true, device });
  };

  const handleAssignSubmit = async (userId) => {
    try {
      const response = await deviceService.assignDevice(assignModal.device.id, userId);
      const updatedDevice = response.data;
      setDevices((prev) => prev.map((d) => (d.id === updatedDevice.id ? updatedDevice : d)));
      showToast('success', 'Đã gán thiết bị cho người dùng');
    } catch (error) {
      console.error('Assign error:', error);
      showToast('error', error.message || 'Không thể gán thiết bị');
      throw error;
    }
  };

  // ── Unassign Device ──────────────────────────────────
  const handleUnassign = (device) => {
    setUnassignModal({ isOpen: true, device });
  };

  const handleUnassignConfirm = async () => {
    try {
      const response = await deviceService.unassignDevice(unassignModal.device.id);
      
      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }
      
      const updatedDevice = response.data;
      setDevices((prev) => prev.map((d) => (d.id === updatedDevice.id ? updatedDevice : d)));
      setUnassignModal({ isOpen: false, device: null });
      showToast('success', 'Đã bỏ gán thiết bị');
    } catch (error) {
      console.error('Unassign error:', error);
      setUnassignModal({ isOpen: false, device: null });
      showToast('error', error.message || 'Không thể bỏ gán thiết bị');
    }
  };

  // ── Lock/Unlock Device ───────────────────────────────
  const handleLock = (device) => {
    setLockModal({ isOpen: true, device });
  };

  const handleLockConfirm = async () => {
    try {
      const response = await deviceService.toggleLockDevice(lockModal.device.id);
      const updatedDevice = response.data;
      setDevices((prev) => prev.map((d) => (d.id === updatedDevice.id ? updatedDevice : d)));
      setLockModal({ isOpen: false, device: null });
      const message = updatedDevice.is_active ? 'Đã mở khóa thiết bị' : 'Đã khóa thiết bị';
      showToast('success', message);
    } catch (error) {
      console.error('Lock error:', error);
      setLockModal({ isOpen: false, device: null });
      showToast('error', error.message || 'Không thể thay đổi trạng thái thiết bị');
    }
  };

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
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Quản lý thiết bị IoT</h2>
          <p className="text-slate-500 font-medium mt-2">
            Hệ thống hiện đang vận hành với <span className="text-indigo-600 font-bold">{total}</span> thiết bị.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchDevices()}
            disabled={loading}
            className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all active:scale-95 cursor-pointer border border-transparent hover:border-indigo-100"
            title="Làm mới"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Plus size={18} />
            Thêm thiết bị mới
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <DevicesToolbar
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        searchInput={searchInput}
      />

      {/* Table */}
      <DevicesTable
        devices={devices}
        loading={loading}
        filters={filters}
        onEdit={handleEdit}
        onLock={handleLock}
        onAssign={handleAssign}
        onUnassign={handleUnassign}
      />

      {/* Pagination */}
      <DevicesPagination page={page} limit={limit} total={total} onPageChange={setPage} />

      {/* Modals */}
      <DeviceFormModal
        isOpen={addModal.isOpen}
        onClose={() => setAddModal({ isOpen: false })}
        device={null}
        onSubmit={handleAddSubmit}
        mode="add"
      />

      <DeviceFormModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, device: null })}
        device={editModal.device}
        onSubmit={handleEditSubmit}
        mode="edit"
      />

      <AssignDeviceModal
        isOpen={assignModal.isOpen}
        onClose={() => setAssignModal({ isOpen: false, device: null })}
        device={assignModal.device}
        onSubmit={handleAssignSubmit}
      />

      <LockDeviceModal
        isOpen={lockModal.isOpen}
        onClose={() => setLockModal({ isOpen: false, device: null })}
        device={lockModal.device}
        onConfirm={handleLockConfirm}
      />

      <UnassignDeviceModal
        isOpen={unassignModal.isOpen}
        onClose={() => setUnassignModal({ isOpen: false, device: null })}
        device={unassignModal.device}
        onConfirm={handleUnassignConfirm}
      />
    </div>
  );
};

export default DeviceManagementPage;
