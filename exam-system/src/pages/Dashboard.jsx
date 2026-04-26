import { Users, UserCheck, DoorOpen, BookOpen, Grid3X3, RefreshCw, Sun, Moon, TrendingUp } from 'lucide-react';
import { useDashboardStats } from '../data/useApi';
import { getExams, getRooms, getSeatingAllocations } from '../data/store';

function StatCard({ label, value, icon: Icon, gradient, iconBg }) {
  return (
    <div className="stat-card p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: iconBg, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { stats, loading } = useDashboardStats();
  const exams       = getExams();
  const rooms       = getRooms();
  const allocations = getSeatingAllocations();

  const s = stats || {};
  const morningExams = exams.filter(e => e.session === 'Morning');
  const eveningExams = exams.filter(e => e.session === 'Evening');
  const recentMorning = [...morningExams].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const recentEvening = [...eveningExams].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  const statCards = [
    { label: 'Total Students',       value: s.students             ?? 0, icon: Users,      iconBg: 'linear-gradient(135deg,#16a34a,#15803d)' },
    { label: 'Faculty Members',       value: s.faculty              ?? 0, icon: UserCheck,  iconBg: 'linear-gradient(135deg,#0891b2,#0e7490)' },
    { label: 'Exam Rooms',            value: s.rooms                ?? 0, icon: DoorOpen,   iconBg: 'linear-gradient(135deg,#7c3aed,#6d28d9)' },
    { label: 'Morning Exams',         value: s.morning_exams        ?? 0, icon: Sun,        iconBg: 'linear-gradient(135deg,#d97706,#b45309)' },
    { label: 'Evening Exams',         value: s.evening_exams        ?? 0, icon: Moon,       iconBg: 'linear-gradient(135deg,#4f46e5,#4338ca)' },
    { label: 'Seats Allocated',       value: s.seats_allocated      ?? 0, icon: Grid3X3,    iconBg: 'linear-gradient(135deg,#059669,#047857)' },
    { label: 'Pending Replacements',  value: s.pending_replacements ?? 0, icon: RefreshCw,  iconBg: 'linear-gradient(135deg,#dc2626,#b91c1c)' },
  ];

  return (
    <div className="p-8">

      {/* ── Hero banner ── */}
      <div className="page-hero mb-8 flex items-center justify-between">
        <div>
          <p className="text-green-200 text-sm font-medium mb-1">Welcome back, Admin 👋</p>
          <h1 className="text-3xl font-bold text-white">Exam Management Dashboard</h1>
          <p className="text-green-200 text-sm mt-1">
            Gautam Buddha University · {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-3">
          <div className="text-center px-5 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
            <p className="text-2xl font-bold text-white">{s.exams ?? exams.length}</p>
            <p className="text-green-200 text-xs">Total Exams</p>
          </div>
          <div className="text-center px-5 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
            <p className="text-2xl font-bold text-white">{(s.students ?? 0).toLocaleString()}</p>
            <p className="text-green-200 text-xs">Students</p>
          </div>
          <div className="text-center px-5 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
            <p className="text-2xl font-bold text-white">{(s.seats_allocated ?? allocations.length).toLocaleString()}</p>
            <p className="text-green-200 text-xs">Seats Allocated</p>
          </div>
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* ── Bottom panels ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Exams */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)' }}>
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-bold text-gray-900">Recent Exams</h2>
          </div>

          {exams.length === 0 ? (
            <p className="text-gray-400 text-sm">No exams scheduled yet.</p>
          ) : (
            <div className="space-y-4">
              {recentMorning.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide mb-2 flex items-center gap-1.5"
                    style={{ color: '#d97706' }}>
                    <Sun className="w-3 h-3" /> Morning Shift
                  </p>
                  <ul className="space-y-2">
                    {recentMorning.map(exam => (
                      <li key={exam.exam_id} className="flex items-center justify-between text-sm p-2 rounded-lg"
                        style={{ background: '#fefce8' }}>
                        <span className="font-medium text-gray-700 truncate max-w-xs">{exam.exam_name}</span>
                        <span className="text-xs text-gray-400 ml-2 shrink-0 font-mono">{exam.date}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {recentEvening.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide mb-2 flex items-center gap-1.5"
                    style={{ color: '#4f46e5' }}>
                    <Moon className="w-3 h-3" /> Evening Shift
                  </p>
                  <ul className="space-y-2">
                    {recentEvening.map(exam => (
                      <li key={exam.exam_id} className="flex items-center justify-between text-sm p-2 rounded-lg"
                        style={{ background: '#eef2ff' }}>
                        <span className="font-medium text-gray-700 truncate max-w-xs">{exam.exam_name}</span>
                        <span className="text-xs text-gray-400 ml-2 shrink-0 font-mono">{exam.date}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Room Utilization */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)' }}>
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-bold text-gray-900">Room Utilization</h2>
          </div>

          {rooms.length === 0 ? (
            <p className="text-gray-400 text-sm">No rooms added yet.</p>
          ) : (
            <ul className="space-y-3">
              {rooms.slice(0, 6).map(room => {
                const used = allocations.filter(a => a.room_id === room.room_id).length;
                const pct  = Math.min(100, Math.round((used / room.capacity) * 100));
                const barColor = pct >= 90 ? '#dc2626' : pct >= 60 ? '#d97706' : '#16a34a';
                return (
                  <li key={room.room_id}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-semibold text-gray-700">{room.room_no}
                        <span className="text-gray-400 font-normal ml-1 text-xs">— {room.building}</span>
                      </span>
                      <span className="text-xs font-mono" style={{ color: barColor }}>{used}/{room.capacity}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: '#dcfce7' }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: barColor }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
