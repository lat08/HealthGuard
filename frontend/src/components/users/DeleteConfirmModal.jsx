import { useState } from 'react';
import { Trash2, Key, Loader2, AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal';

const DeleteConfirmModal = ({ isOpen, onClose, user, onConfirm, isSubmitting }) => {
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleClose = () => { setPassword(''); setPasswordError(''); onClose(); };

  const handleConfirm = async () => {
    if (!password) { setPasswordError('Vui lòng nhập mật khẩu quản trị.'); return; }
    setPasswordError('');
    try { await onConfirm(password); } finally { setPassword(''); }
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Yêu cầu xóa tài khoản" size="sm">
      <div className="flex flex-col gap-6 py-2">
        <div className="flex flex-col items-center gap-4 text-center p-6 bg-rose-50/50 border border-rose-100 rounded-2xl">
          <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
            <Trash2 size={28} />
          </div>
          <div className="space-y-1">
            <h4 className="text-[13px] font-bold text-rose-700 uppercase tracking-widest">Hành động nguy hiểm</h4>
            <p className="text-slate-600 text-[13px] font-medium leading-relaxed">
              Bạn đang thực hiện vô hiệu hóa tài khoản của <br/>
              <span className="text-slate-900 font-bold uppercase underline underline-offset-4 decoration-rose-300 decoration-2">{user.fullName}</span>.
            </p>
            <p className="text-slate-400 text-[11px] font-medium mt-2">
              Tài khoản sẽ bị ẩn khỏi hệ thống nhưng dữ liệu vẫn được lưu trữ.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">
            <Key size={14} className="text-slate-400" /> Xác minh quyền quản trị
          </label>
          <input
            type="password" value={password}
            onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
            placeholder="Nhập mật khẩu quản trị viên"
            className={`w-full px-4 py-3 border rounded-xl text-sm font-bold transition-all duration-200 ${
              passwordError ? 'bg-rose-50 border-rose-200 text-rose-900 focus:ring-4 focus:ring-rose-500/10' : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:ring-4 focus:ring-rose-500/5 focus:border-rose-400'
            }`}
          />
          {passwordError && (
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-rose-500 uppercase tracking-tight ml-1">
              <AlertCircle size={12} /> {passwordError}
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={handleClose} disabled={isSubmitting} className="flex-1 px-4 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all active:scale-95">Hủy bỏ</button>
          <button onClick={handleConfirm} disabled={isSubmitting || !password}
            className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-rose-600/20 active:scale-95 flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Xác nhận xóa'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;
