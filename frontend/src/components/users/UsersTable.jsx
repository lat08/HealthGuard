import { Pencil, Lock, Unlock, Trash2, UserPlus, ShieldCheck, Activity, Loader2 } from 'lucide-react';
import { ROLE_LABELS, ROLE_COLORS, GENDER_LABELS } from './UsersConstants';

/**
 * Highlight matching search keywords in text
 */
const HighlightText = ({ text, keyword }) => {
  if (!keyword || !text) return <>{text}</>
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = String(text).split(regex);
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === keyword.toLowerCase()
          ? <mark key={i} className="bg-yellow-200/80 text-yellow-900 rounded-sm px-0.5 font-bold">{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </>
  );
};

const UsersTable = ({ users, loading, filters, onEdit, onLock, onDelete }) => {
  return (
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
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <Loader2 size={32} className="text-indigo-500 animate-spin" />
                    <p className="text-sm text-slate-400 font-medium">Đang tải danh sách...</p>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
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
                          <p className="font-bold text-slate-800 text-sm truncate"><HighlightText text={user.fullName} keyword={filters.search} /></p>
                          {user.isVerified && <span title="Đã xác thực" className="flex items-center shrink-0"><ShieldCheck size={14} className="text-blue-500" /></span>}
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                          <HighlightText text={user.phone} keyword={filters.search} /><span className="mx-1.5 text-slate-200">|</span><HighlightText text={user.email} keyword={filters.search} />
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
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap ${user.status === 'active' ? 'text-emerald-600 bg-emerald-50/50' : 'text-rose-600 bg-rose-50/50'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></span>
                      {user.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center sticky right-0 bg-white/90 backdrop-blur-sm z-10 border-l border-slate-50 group-hover:bg-slate-50/90 transition-colors shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onEdit(user)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 rounded-xl transition-all active:scale-90"
                        title="Chỉnh sửa"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => onLock(user)}
                        className={`p-2 rounded-xl transition-all active:scale-90 border border-transparent hover:shadow-sm hover:bg-white ${user.status === 'active' ? 'text-slate-400 hover:text-amber-500 hover:border-amber-100' : 'text-slate-400 hover:text-emerald-500 hover:border-emerald-100'}`}
                        title={user.status === 'active' ? 'Khóa' : 'Kích hoạt'}
                      >
                        {user.status === 'active' ? <Lock size={16} /> : <Unlock size={16} />}
                      </button>
                      <button
                        onClick={() => onDelete(user)}
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
  );
};

export default UsersTable;
