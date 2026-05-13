import { Search, Bell, Plus } from 'lucide-react';

export const Header = () => {
  return (
    <header className="h-18 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center bg-slate-100 px-4 py-2 rounded-full w-80 gap-2">
        <Search size={18} className="text-slate-400" />
        <input 
          type="text" 
          placeholder="일정 검색..." 
          className="bg-transparent border-none outline-none text-sm w-full"
        />
      </div>
      <div className="flex items-center gap-6">
        <button className="relative text-slate-600 hover:text-slate-900 transition-colors">
          <Bell size={20} />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
        </button>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm">
          <Plus size={18} />
          <span>일정 추가</span>
        </button>
      </div>
    </header>
  );
};
