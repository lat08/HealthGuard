import { Loader2, AlertTriangle, Trash2, CheckCircle2 } from 'lucide-react';
import Modal from './Modal';

const VARIANTS = {
  danger:  { icon: Trash2,       color: 'text-rose-500',    bg: 'bg-rose-50',    btn: 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20' },
  warning: { icon: AlertTriangle,color: 'text-amber-500',   bg: 'bg-amber-50',   btn: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' },
  success: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', btn: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' },
};

const ConfirmModal = ({ open, onClose, onConfirm, variant = 'danger', title = 'Xác nhận', message, detail, confirmText = 'Xác nhận', cancelText = 'Hủy bỏ', loading = false }) => {
  if (!open) return null;
  const cfg = VARIANTS[variant] || VARIANTS.danger;
  const Icon = cfg.icon;

  return (
    <Modal isOpen={open} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center gap-5 py-2">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${cfg.bg} ${cfg.color}`}>
          <Icon size={28} />
        </div>
        <div className="space-y-2">
          <p className="text-slate-600 text-sm font-medium leading-relaxed">{message}</p>
          {detail && <p className="text-slate-400 text-xs font-medium">{detail}</p>}
        </div>
        <div className="flex gap-3 w-full pt-2">
          <button onClick={onClose} disabled={loading} className="flex-1 px-4 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all active:scale-95 cursor-pointer">
            {cancelText}
          </button>
          <button onClick={onConfirm} disabled={loading} className={`flex-1 px-4 py-3 text-sm font-extrabold text-white rounded-xl transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer ${cfg.btn}`}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
