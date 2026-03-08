import { useState, useEffect, useRef } from 'react';
import { UserPlus, Search, Loader2 } from 'lucide-react';
import Modal from '../ui/Modal';
import userService from '../../services/userService';

const AssignDeviceModal = ({ isOpen, onClose, device, onSubmit }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchTimer = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchUsers('');
      setSelectedUser(null);
      setSearchInput('');
    }
  }, [isOpen]);

  const fetchUsers = async (search) => {
    setLoading(true);
    try {
      const response = await userService.getUsers({
        page: 1,
        limit: 50,
        search,
        status: 'active',
      });
      setUsers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value) => {
    setSearchInput(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      fetchUsers(value);
    }, 400);
  };

  const handleSubmit = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      await onSubmit(selectedUser.id);
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gán thiết bị cho người dùng" size="lg">
      <div className="space-y-6">
        {/* Device Info */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Thiết bị</p>
          <p className="font-bold text-slate-800">{device?.device_name || 'Chưa đặt tên'}</p>
          {device?.serial_number && (
            <p className="text-xs text-slate-500 mt-0.5">SN: {device.serial_number}</p>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm người dùng theo tên hoặc email..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all"
          />
        </div>

        {/* User List */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 size={32} className="text-indigo-500 animate-spin" />
                <p className="text-sm text-slate-400 font-medium">Đang tải danh sách...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200">
                  <UserPlus size={32} />
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-800">Không tìm thấy người dùng</p>
                  <p className="text-xs text-slate-400 mt-1">Thử điều chỉnh từ khóa tìm kiếm</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`w-full px-4 py-3.5 flex items-center gap-3 hover:bg-slate-50 transition-all text-left ${
                      selectedUser?.id === user.id ? 'bg-indigo-50/50 border-l-4 border-indigo-500' : ''
                    }`}
                  >
                    <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 text-sm font-bold shrink-0">
                      {(user.fullName || user.full_name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate">{user.fullName || user.full_name}</p>
                      <p className="text-[11px] text-slate-400 font-medium truncate">{user.email}</p>
                    </div>
                    {selectedUser?.id === user.id && (
                      <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedUser || isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            {isSubmitting ? 'Đang gán...' : (
              <>
                <UserPlus size={16} />
                Gán thiết bị
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AssignDeviceModal;
