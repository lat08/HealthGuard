import { useState, useEffect, useRef } from 'react';
import { Smartphone } from 'lucide-react';
import DevicesToolbar from '../../components/devices/DevicesToolbar';
import DevicesTable from '../../components/devices/DevicesTable';
import DevicesPagination from '../../components/devices/DevicesPagination';
import DeviceFormModal from '../../components/devices/DeviceFormModal';
import AssignDeviceModal from '../../components/devices/AssignDeviceModal';
import LockDeviceModal from '../../components/devices/LockDeviceModal';
import UnassignDeviceModal from '../../components/devices/UnassignDeviceModal';
import AlertModal from '../../components/ui/AlertModal';
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
  const [editModal, setEditModal] = useState({ isOpen: false, device: null });
  const [assignModal, setAssignModal] = useState({ isOpen: false, device: null });
  const [lockModal, setLockModal] = useState({ isOpen: false, device: null });
  const [unassignModal, setUnassignModal] = useState({ isOpen: false, device: null });
  const [alertModal, setAlertModal] = useState({ isOpen: false, type: 'success', message: '' });

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
      showAlert('error', 'Không thể tải danh sách thiết bị');
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

  const showAlert = (type, message) => {
    setAlertModal({ isOpen: true, type, message });
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
      showAlert('success', 'Cập nhật thiết bị thành công');
    } catch (error) {
      console.error('Update error:', error);
      showAlert('error', error.message || 'Không thể cập nhật thiết bị');
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
      showAlert('success', 'Đã gán thiết bị cho người dùng');
    } catch (error) {
      console.error('Assign error:', error);
      showAlert('error', error.message || 'Không thể gán thiết bị');
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
      showAlert('success', 'Đã bỏ gán thiết bị');
    } catch (error) {
      console.error('Unassign error:', error);
      setUnassignModal({ isOpen: false, device: null });
      showAlert('error', error.message || 'Không thể bỏ gán thiết bị');
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
      showAlert('success', message);
    } catch (error) {
      console.error('Lock error:', error);
      setLockModal({ isOpen: false, device: null });
      showAlert('error', error.message || 'Không thể thay đổi trạng thái thiết bị');
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
              <Smartphone size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Quản lý thiết bị IoT</h1>
              <p className="text-sm text-slate-500 mt-1">Quản lý danh sách thiết bị trong hệ thống</p>
            </div>
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
          isOpen={editModal.isOpen}
          onClose={() => setEditModal({ isOpen: false, device: null })}
          device={editModal.device}
          onSubmit={handleEditSubmit}
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

        <AlertModal
          isOpen={alertModal.isOpen}
          onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
          type={alertModal.type}
          message={alertModal.message}
        />
    </div>
  );
};

export default DeviceManagementPage;
