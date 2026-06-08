import { isValidElement, cloneElement, type ReactNode, type ReactElement } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  CheckSquare, 
  BarChart3, 
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 text-slate-600 flex flex-col py-8 h-screen sticky top-0">
      <div className="px-6 mb-10 flex items-center gap-3 text-xl font-bold font-heading text-slate-900">
        <img src="/app-icon.svg" alt="Smart Schedule Logo" className="w-10 h-10 rounded-xl shadow-sm" />
        <span className="tracking-tight whitespace-nowrap">Smart Schedule</span>
      </div>
      
      <nav className="flex-1 flex flex-col gap-1 px-2">
        <NavItem 
          to="/"
          icon={<LayoutDashboard size={20} />} 
          label="대시보드" 
          active={currentPath === '/'} 
        />
        <NavItem 
          to="/tasks"
          icon={<CheckSquare size={20} />} 
          label="할 일 목록" 
          active={currentPath === '/tasks'} 
        />
        <NavItem 
          to="/calendar"
          icon={<Calendar size={20} />} 
          label="캘린더" 
          active={currentPath === '/calendar'} 
        />
        <NavItem 
          to="/analytics"
          icon={<BarChart3 size={20} />} 
          label="통계분석" 
          active={currentPath === '/analytics'} 
        />
        <NavItem 
          to="/settings"
          icon={<User size={20} />} 
          label="마이페이지" 
          active={currentPath === '/settings'} 
        />
      </nav>
      
      <div className="px-6 pt-6 border-t border-slate-100">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold shrink-0 text-xs">
              {user?.nickname?.[0] || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold text-sm truncate text-slate-900">{user?.nickname || '로딩 중...'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email || ''}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="로그아웃"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

interface NavItemProps {
  to: string;
  icon: ReactNode;
  label: string;
  active: boolean;
}

const NavItem = ({ to, icon, label, active }: NavItemProps) => (
  <Link 
    to={to}
    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all w-full text-left group
      ${active 
        ? 'bg-indigo-50 text-indigo-600 font-bold shadow-sm border border-indigo-100/50' 
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold'}`}
  >
    <span className={`${active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
      {isValidElement(icon) 
        ? cloneElement(icon as ReactElement<any>, { size: 22 }) 
        : icon}
    </span>
    <span className="text-[15px] tracking-tight">{label}</span>
  </Link>
);
