import { 
  Watch, Users, AlertTriangle, Activity, 
  TrendingUp, TrendingDown, Clock, CheckCircle2, 
  BarChart3, ArrowRight
} from 'lucide-react';

const AdminOverviewPage = () => {
  const stats = [
    { label: 'Thiết bị IoT đang chạy', value: '1,234', icon: <Watch size={20} />, bgColor: 'bg-indigo-50', textColor: 'text-indigo-600', trend: '+12%', isUp: true },
    { label: 'Bệnh nhân đang kết nối', value: '1,210', icon: <Users size={20} />, bgColor: 'bg-blue-50', textColor: 'text-blue-600', trend: '+8%', isUp: true },
    { label: 'Ca nguy cơ đột quỵ', value: '12', icon: <AlertTriangle size={20} />, bgColor: 'bg-amber-50', textColor: 'text-amber-600', trend: '-3%', isUp: false },
    { label: 'Cảnh báo té ngã (24h)', value: '3', icon: <Activity size={20} />, bgColor: 'bg-rose-50', textColor: 'text-rose-600', trend: '+1', isUp: true },
  ];

  const recentAlerts = [
    { id: 1, patient: 'Nguyễn Văn An', type: 'Nguy cơ đột quỵ', severity: 'high', time: '2 phút trước' },
    { id: 2, patient: 'Trần Thị Bình', type: 'Phát hiện té ngã', severity: 'high', time: '15 phút trước' },
    { id: 3, patient: 'Lê Minh Cường', type: 'Nhịp tim bất thường', severity: 'medium', time: '32 phút trước' },
    { id: 4, patient: 'Phạm Thị Dung', type: 'Huyết áp không ổn định', severity: 'low', time: '1 giờ trước' },
  ];

  const SEVERITY_STYLES = {
    high: 'text-rose-600 bg-rose-50 border-rose-100',
    medium: 'text-amber-600 bg-amber-50 border-amber-100',
    low: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tổng quan hệ thống</h2>
          <p className="text-slate-500 font-medium mt-2">
            Giám sát trạng thái sức khỏe bệnh nhân và hiệu năng thiết bị thời gian thực.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl">
          <Clock size={16} className="text-slate-400" />
          <span className="text-sm font-bold text-slate-700">
            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(({ label, value, icon, bgColor, textColor, trend, isUp }) => (
          <div key={label} className="bg-white p-7 border border-slate-100 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgColor} ${textColor} shadow-inner`}>
                {icon}
              </div>
              <div className={`flex items-center gap-1 text-[13px] font-bold ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {trend}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1.5">{label}</p>
              <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Recent Alerts */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-rose-500 rounded-full"></div>
              <h3 className="text-xl font-bold text-slate-900">Cảnh báo khẩn cấp</h3>
            </div>
            <button className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:gap-3 transition-all cursor-pointer">
              Tất cả cảnh báo <ArrowRight size={16} />
            </button>
          </div>
          
          <div className="bg-white border border-slate-100 shadow-sm overflow-hidden flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 font-bold text-slate-400 text-[11px] uppercase tracking-widest">
                  <th className="px-6 py-4">Bệnh nhân</th>
                  <th className="px-6 py-4">Tình trạng</th>
                  <th className="px-6 py-4 w-40 text-center">Ưu tiên</th>
                  <th className="px-6 py-4 text-right w-32">Gửi lúc</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-200">
                          {alert.patient.charAt(0)}
                        </div>
                        <span className="text-[15px] font-bold text-slate-800">{alert.patient}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-[14px] text-slate-600 font-bold whitespace-nowrap">{alert.type}</td>
                    <td className="px-6 py-5 text-center">
                      <span className={`inline-flex items-center justify-center px-3 py-1 text-[10px] font-bold rounded-lg border uppercase tracking-wider whitespace-nowrap ${SEVERITY_STYLES[alert.severity]}`}>
                        {alert.severity === 'high' ? 'Khẩn cấp' : alert.severity === 'medium' ? 'Cần chú ý' : 'Bình thường'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right whitespace-nowrap">
                      <span className="text-xs text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded">{alert.time}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Status */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <BarChart3 size={20} />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Hạ tầng hệ thống</h3>
            </div>
            
            <div className="space-y-6">
              {[
                { name: 'API Server Core', load: 12 },
                { name: 'Data Processing', load: 8 },
                { name: 'IoT Stream Gate', load: 24 },
                { name: 'Push Messaging', load: 15 },
              ].map((svc) => (
                <div key={svc.name} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">{svc.name}</span>
                    <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1.5 uppercase">Tốt</span>
                  </div>
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-1000 group-hover:bg-indigo-500" style={{ width: `${svc.load}%` }} />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-10 p-5 bg-slate-900 rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 transition-transform group-hover:scale-150 duration-500">
                <CheckCircle2 size={48} className="text-white" />
              </div>
              <div className="relative z-10 flex items-center gap-3 text-emerald-400">
                <CheckCircle2 size={18} />
                <p className="text-[12px] font-extrabold uppercase tracking-widest">Toàn bộ dịch vụ sẵn sàng</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverviewPage;
