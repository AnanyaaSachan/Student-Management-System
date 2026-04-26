import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCheck, DoorOpen, BookOpen,
  Grid3X3, ClipboardList, RefreshCw, BarChart3, LogOut,
  CalendarCheck, QrCode, Link2,
} from 'lucide-react';
import { clearToken } from '../data/api';

const NAV_SECTIONS = [
  {
    label: 'OVERVIEW',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    ],
  },
  {
    label: 'MANAGEMENT',
    items: [
      { to: '/students',  label: 'Students', icon: Users },
      { to: '/faculty',   label: 'Faculty',  icon: UserCheck },
      { to: '/rooms',     label: 'Rooms',    icon: DoorOpen },
      { to: '/exams',     label: 'Exams',    icon: BookOpen },
    ],
  },
  {
    label: 'EXAM OPERATIONS',
    items: [
      { to: '/seating',          label: 'Seating Allocation', icon: Grid3X3 },
      { to: '/invigilation',     label: 'Invigilation',       icon: CalendarCheck },
      { to: '/attendance',       label: 'Attendance',         icon: ClipboardList },
      { to: '/daily-attendance', label: 'Daily Attendance',   icon: ClipboardList },
      { to: '/qr-attendance',    label: 'QR Attendance',      icon: QrCode },
      { to: '/replacements',     label: 'Replacements',       icon: RefreshCw },
    ],
  },
  {
    label: 'ANALYTICS',
    items: [
      { to: '/reports', label: 'Reports', icon: BarChart3 },
      { to: '/erp', label: 'ERP Integration', icon: Link2 },
    ],
  },
];

export default function Layout() {
  const navigate = useNavigate();
  const user = (() => { try { return JSON.parse(localStorage.getItem('auth_user') || '{}'); } catch { return {}; } })();

  const handleSignOut = () => {
    clearToken();
    localStorage.removeItem('auth_user');
    navigate('/login');
  };
  return (
    <div className="flex min-h-screen" style={{ background: '#f0faf4' }}>

      {/* ── Sidebar ── */}
      <aside className="w-64 flex flex-col shrink-0 shadow-xl"
        style={{ background: 'linear-gradient(180deg, #052e16 0%, #14532d 40%, #166534 100%)' }}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4"
          style={{ borderBottom: '1px solid rgba(74,222,128,0.15)' }}>
          <img
            src="https://s.yimg.com/zb/imgv1/644fd604-0fa6-3cca-b3a6-82eafb56d751/t_500x300"
            alt="GBU Logo"
            className="w-11 h-11 rounded-full object-cover shrink-0"
            style={{ border: '2px solid #4ade80', boxShadow: '0 0 12px rgba(74,222,128,0.4)' }}
          />
          <div>
            <p className="font-bold text-xs leading-tight tracking-wide text-white uppercase">
              Gautam Buddha University
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#86efac' }}>Exam Management System</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(134,239,172,0.45)', fontSize: '10px' }}>Made by: Ananya Sachan</p>
          </div>
        </div>

        {/* Admin Portal badge */}
        <div className="px-4 py-2.5" style={{ borderBottom: '1px solid rgba(74,222,128,0.1)' }}>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold"
            style={{ background: 'rgba(74,222,128,0.15)', color: '#86efac', border: '1px solid rgba(74,222,128,0.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Admin Portal
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
          {NAV_SECTIONS.map(({ label, items }) => (
            <div key={label}>
              <p className="px-3 mb-1.5 text-xs font-bold uppercase tracking-widest"
                style={{ color: 'rgba(134,239,172,0.5)' }}>
                {label}
              </p>
              <div className="space-y-0.5">
                {items.map(({ to, label: itemLabel, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                        isActive ? 'active-nav' : 'inactive-nav'
                      }`
                    }
                    style={({ isActive }) => isActive ? {
                      background: 'linear-gradient(135deg, rgba(74,222,128,0.25), rgba(34,197,94,0.15))',
                      color: '#4ade80',
                      boxShadow: 'inset 0 0 0 1px rgba(74,222,128,0.3)',
                    } : {
                      color: 'rgba(187,247,208,0.75)',
                    }}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {itemLabel}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(74,222,128,0.15)' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', boxShadow: '0 2px 8px rgba(22,163,74,0.4)' }}>
              {(user.name || user.username || 'A')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.name || user.username || 'Admin'}</p>
              <p className="text-xs truncate" style={{ color: '#86efac' }}>{user.email || 'admin@gbu.ac.in'}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ color: 'rgba(134,239,172,0.7)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(74,222,128,0.1)'; e.currentTarget.style.color = '#4ade80'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(134,239,172,0.7)'; }}>
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
