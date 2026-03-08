import { Pencil, Lock, Unlock, UserPlus, UserMinus, Loader2, Smartphone, Battery, Signal, Clock } from 'lucide-react';
import { DEVICE_TYPE_LABELS, DEVICE_TYPE_COLORS, getBatteryColor, getSignalColor } from './DevicesConstants';

/**
 * Highlight matching search keywords in text
 */
const HighlightText = ({ text, keyword }) => {
  if (!keyword || !text) return <>{text}</>;
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = String(text).split(regex);
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === keyword.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200/80 text-yellow-900 rounded-sm px-0.5 font-bold">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

/**
 * Format date to Vietnamese format
 */
const formatDate = (dateString) => {
  if (!dateString) return '---';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const DevicesTable = ({ devices, loading, filters, onEdit, onLock, onAssign, onUnassign }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-12 text-center">
                ID
              </th>
              <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Thiết bị
              </th>
              <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Chủ sở hữu
              </th>
              <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center w-28">
                Loại
              </th>
              <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center w-32">
                Trạng thái
              </th>
              <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-36 text-center sticky right-0 bg-slate-50/90 backdrop-blur-sm z-10 border-l border-slate-100">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <Loader2 size={32} className="text-indigo-500 animate-spin" />
                    <p className="text-sm text-slate-400 font-medium">Đang tải danh sách...</p>
                  </div>
                </td>
              </tr>
            ) : devices.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200">
                      <Smartphone size={32} />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-slate-800">Không tìm thấy thiết bị phù hợp</p>
                      <p className="text-xs text-slate-400 max-w-[280px] mx-auto">
                        Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              devices.map((device) => (
                <tr key={device.id} className="hover:bg-slate-50/30 transition-all duration-200 group">
                  <td className="px-4 py-4 text-center">
                    <span className="text-[11px] font-bold text-slate-300 font-mono">#{device.id}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                        <Smartphone size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-sm truncate">
                          <HighlightText text={device.device_name || 'Chưa đặt tên'} keyword={filters.search} />
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
                          <HighlightText text={device.serial_number || '---'} keyword={filters.search} />
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {device.users ? (
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-sm truncate">
                          <HighlightText text={device.users.full_name} keyword={filters.search} />
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
                          <HighlightText text={device.users.email} keyword={filters.search} />
                        </p>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Chưa có chủ</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                        DEVICE_TYPE_COLORS[device.device_type] || DEVICE_TYPE_COLORS.other
                      }`}
                    >
                      {DEVICE_TYPE_LABELS[device.device_type] || device.device_type}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap ${
                          device.is_active
                            ? 'text-emerald-600 bg-emerald-50/50'
                            : 'text-rose-600 bg-rose-50/50'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            device.is_active ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'
                          }`}
                        ></span>
                        {device.is_active ? 'Hoạt động' : 'Đã khóa'}
                      </div>
                      <div className="flex items-center gap-2 text-[10px]">
                        {device.battery_level !== null && (
                          <div className="flex items-center gap-0.5">
                            <Battery size={11} className={getBatteryColor(device.battery_level)} />
                            <span className={`font-bold ${getBatteryColor(device.battery_level)}`}>
                              {device.battery_level}%
                            </span>
                          </div>
                        )}
                        {device.signal_strength !== null && (
                          <div className="flex items-center gap-0.5">
                            <Signal size={11} className={getSignalColor(device.signal_strength)} />
                            <span className={`font-bold ${getSignalColor(device.signal_strength)}`}>
                              {device.signal_strength}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center sticky right-0 bg-white/90 backdrop-blur-sm z-10 border-l border-slate-50 group-hover:bg-slate-50/90 transition-colors shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onEdit(device)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 rounded-xl transition-all active:scale-90"
                        title="Chỉnh sửa thông tin thiết bị"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => onLock(device)}
                        className={`p-2 rounded-xl transition-all active:scale-90 border border-transparent hover:shadow-sm hover:bg-white ${
                          device.is_active
                            ? 'text-slate-400 hover:text-amber-500 hover:border-amber-100'
                            : 'text-slate-400 hover:text-emerald-500 hover:border-emerald-100'
                        }`}
                        title={device.is_active ? 'Khóa thiết bị (ngừng nhận dữ liệu)' : 'Mở khóa thiết bị'}
                      >
                        {device.is_active ? <Lock size={16} /> : <Unlock size={16} />}
                      </button>
                      {device.users ? (
                        <button
                          onClick={() => onUnassign(device)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-white hover:border-rose-100 border border-transparent hover:shadow-sm rounded-xl transition-all active:scale-90"
                          title={`Bỏ gán thiết bị khỏi ${device.users.full_name}`}
                        >
                          <UserMinus size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => onAssign(device)}
                          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-white hover:border-blue-100 border border-transparent hover:shadow-sm rounded-xl transition-all active:scale-90"
                          title="Gán thiết bị cho người dùng"
                        >
                          <UserPlus size={16} />
                        </button>
                      )}
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

export default DevicesTable;
