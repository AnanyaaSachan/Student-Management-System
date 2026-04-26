export default function StatCard({ label, value, icon: Icon, color = 'green' }) {
  const configs = {
    green:  { bg: 'linear-gradient(135deg,#16a34a,#15803d)', light: '#dcfce7', text: '#15803d' },
    indigo: { bg: 'linear-gradient(135deg,#4f46e5,#4338ca)', light: '#eef2ff', text: '#4338ca' },
    amber:  { bg: 'linear-gradient(135deg,#d97706,#b45309)', light: '#fef9c3', text: '#b45309' },
    sky:    { bg: 'linear-gradient(135deg,#0891b2,#0e7490)', light: '#e0f2fe', text: '#0e7490' },
    rose:   { bg: 'linear-gradient(135deg,#dc2626,#b91c1c)', light: '#ffe4e6', text: '#b91c1c' },
    purple: { bg: 'linear-gradient(135deg,#7c3aed,#6d28d9)', light: '#ede9fe', text: '#6d28d9' },
  };
  const c = configs[color] || configs.green;

  return (
    <div className="stat-card p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: c.bg, boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
