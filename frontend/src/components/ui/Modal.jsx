import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const sizeClasses = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      <div className={`bg-white rounded-3xl shadow-2xl w-full ${sizeClasses[size]} animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col border border-white/20`}
        role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-50 bg-slate-50/50">
          <h2 id="modal-title" className="text-sm font-bold text-slate-800 uppercase tracking-widest">{title}</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer active:scale-90">
            <X size={20} />
          </button>
        </div>
        <div className="px-8 py-6 overflow-y-auto max-h-[calc(100vh-160px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
