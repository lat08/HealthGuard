import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import Modal from './Modal';

const TYPES = {
  success: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', btn: 'bg-emerald-500 hover:bg-emerald-600' },
  error:   { icon: AlertCircle,  color: 'text-rose-500',    bg: 'bg-rose-50',    btn: 'bg-rose-500 hover:bg-rose-600' },
  warning: { icon: AlertTriangle,color: 'text-amber-500',   bg: 'bg-amber-50',   btn: 'bg-amber-500 hover:bg-amber-600' },
  info:    { icon: Info,         color: 'text-blue-500',    bg: 'bg-blue-50',    btn: 'bg-blue-500 hover:bg-blue-600' },
};

const AlertModal = ({ open, onClose, type = 'info', title, message }) => {
  if (!open) return null;
  const cfg = TYPES[type] || TYPES.info;
  const Icon = cfg.icon;

  return (
    <Modal isOpen={open} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center gap-5 py-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${cfg.bg} ${cfg.color}`}>
          <Icon size={28} />
        </div>
        <p className="text-slate-600 text-sm font-medium leading-relaxed">{message}</p>
        <button onClick={onClose} className={`w-full px-4 py-3 text-sm font-bold text-white rounded-xl transition-all active:scale-95 cursor-pointer ${cfg.btn}`}>
          Đã hiểu
        </button>
      </div>
    </Modal>
  );
};

export default AlertModal;
