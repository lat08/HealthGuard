import { Lock, Unlock, Loader2, AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal';

const LockConfirmModal = ({ isOpen, onClose, user, onConfirm, isSubmitting }) => {
  if (!user) return null;
  const isLocking = user.status === 'active';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isLocking ? 'Xác nhận khóa' : 'Mở khóa tài khoản'} size="sm">
      <div className="flex flex-col items-center text-center gap-6 py-2">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-500 hover:rotate-12 ${
          isLocking ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'
        }`}>
          {isLocking ? <Lock size={32} /> : <Unlock size={32} />}
        </div>

        <div className="space-y-2">
          <p className="text-slate-500 font-medium text-[13px] leading-relaxed">Hành động này sẽ thay đổi trạng thái đăng nhập của</p>
          <p className="text-slate-800 font-bold text-lg leading-tight uppercase tracking-tight">{user.fullName}</p>
          
          {isLocking && (
            <div className="mt-4 flex items-start gap-2 text-left bg-amber-50/70 border border-amber-100 p-3 rounded-xl">
              <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-amber-700 text-[11px] font-semibold leading-normal">
                Người dùng này sẽ bị từ chối truy cập hệ thống ngay lập tức cho đến khi bạn mở khóa lại.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 w-full pt-2">
          <button onClick={onClose} disabled={isSubmitting} className="flex-1 px-4 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all active:scale-95">Hủy bỏ</button>
          <button onClick={onConfirm} disabled={isSubmitting}
            className={`flex-1 px-4 py-3 text-sm font-extrabold text-white rounded-xl transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 ${
              isLocking ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
            }`}>
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : isLocking ? 'Khóa tài khoản' : 'Mở khóa'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default LockConfirmModal;
