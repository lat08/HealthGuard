import { Search, Filter } from 'lucide-react';
import { STATUS_OPTIONS, OWNER_OPTIONS, DEVICE_TYPE_OPTIONS } from './DevicesConstants';

const DevicesToolbar = ({ filters, onFilterChange, onSearchChange, searchInput }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
          <input
            type="text"
            placeholder="Tìm theo tên thiết bị, serial, MAC, hoặc tên người dùng..."
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {/* Device Type Filter */}
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={filters.device_type}
              onChange={(e) => onFilterChange('device_type', e.target.value)}
              className="pl-9 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium appearance-none cursor-pointer hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
            >
              {DEVICE_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={filters.is_active}
              onChange={(e) => onFilterChange('is_active', e.target.value)}
              className="pl-9 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium appearance-none cursor-pointer hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Owner Filter */}
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={filters.has_owner}
              onChange={(e) => onFilterChange('has_owner', e.target.value)}
              className="pl-9 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium appearance-none cursor-pointer hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
            >
              {OWNER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevicesToolbar;
