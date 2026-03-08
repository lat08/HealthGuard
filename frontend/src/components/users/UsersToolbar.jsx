import { useState } from 'react';
import { Search, Filter, ChevronDown, X } from 'lucide-react';
import { ROLE_OPTIONS, STATUS_OPTIONS, GENDER_OPTIONS, BLOOD_OPTIONS, VERIFIED_OPTIONS } from './UsersConstants';

const UsersToolbar = ({ searchInput, onSearchChange, filters, onFilterChange, onClearFilters }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            value={searchInput} 
            onChange={(e) => onSearchChange(e.target.value)} 
            placeholder="Tìm theo tên hoặc email người dùng..."
            className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 transition-all placeholder:text-slate-400 font-medium" 
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative group min-w-[160px]">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none"><Filter size={14} /></div>
            <select value={filters.role} onChange={(e) => onFilterChange('role', e.target.value)} className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 appearance-none focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 transition-all cursor-pointer">
              {ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><ChevronDown size={14} /></div>
          </div>
          <div className="relative group min-w-[160px]">
            <select value={filters.status} onChange={(e) => onFilterChange('status', e.target.value)} className="w-full px-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 appearance-none focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 transition-all cursor-pointer">
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><ChevronDown size={14} /></div>
          </div>
          
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all border ${
              showAdvanced ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Filter size={16} />
            Lọc nâng cao
            <ChevronDown size={14} className={`transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>

          {(filters.search || filters.role || filters.status || filters.gender || filters.bloodType || filters.isVerified) && (
            <button 
              onClick={onClearFilters}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              <X size={16} /> Làm mới
            </button>
          )}
        </div>
      </div>

      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in slide-in-from-top-2 duration-300">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Giới tính</label>
            <div className="relative group">
              <select value={filters.gender} onChange={(e) => onFilterChange('gender', e.target.value)} className="w-full px-4 pr-10 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 appearance-none focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 transition-all cursor-pointer">
                {GENDER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><ChevronDown size={14} /></div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nhóm máu</label>
            <div className="relative group">
              <select value={filters.bloodType} onChange={(e) => onFilterChange('bloodType', e.target.value)} className="w-full px-4 pr-10 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 appearance-none focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 transition-all cursor-pointer">
                {BLOOD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><ChevronDown size={14} /></div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Xác thực</label>
            <div className="relative group">
              <select value={filters.isVerified} onChange={(e) => onFilterChange('isVerified', e.target.value)} className="w-full px-4 pr-10 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 appearance-none focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 transition-all cursor-pointer">
                {VERIFIED_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><ChevronDown size={14} /></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersToolbar;
