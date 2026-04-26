import { useState, useEffect } from 'react';
import {
  Link2, Database, Users, UserCheck, BookOpen, Calendar,
  CheckCircle, XCircle, Loader2, Eye, EyeOff, RefreshCw,
  Trash2, Save, Settings, Activity, Filter, ChevronRight,
} from 'lucide-react';
import { getStudents, saveStudents, getFaculty, saveFaculty } from '../data/store';

// ─── helpers ────────────────────────────────────────────────────────────────
const loadLS = (key, fallback) => {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; }
  catch { return fallback; }
};
const saveLS = (key, val) => localStorage.setItem(key, JSON.stringify(val));

const fmtTs = (ts) => ts
  ? new Date(ts).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : 'Never';

// ─── mock data generators ────────────────────────────────────────────────────
const genStudents = (n) =>
  Array.from({ length: n }, (_, i) => ({
    student_id: Date.now() + i,
    roll_no: `ERP${String(i + 1).padStart(3, '0')}`,
    name: `Student ${i + 1}`,
    branch: ['CSE', 'ECE', 'ME', 'CE'][i % 4],
    semester: (i % 8) + 1,
    section: 'B.Tech CSE 2024-28',
  }));

const genFaculty = (n) =>
  Array.from({ length: n }, (_, i) => ({
    faculty_id: Date.now() + i,
    name: `Dr. Faculty ${i + 1}`,
    department: ['Computer Science', 'Electronics', 'Mathematics', 'Physics'][i % 4],
    designation: ['Professor', 'Associate Professor', 'Assistant Professor'][i % 3],
    total_duties: 0,
  }));

const genCourses = (n) =>
  Array.from({ length: n }, (_, i) => ({
    course_id: Date.now() + i,
    code: `CS${(100 + i).toString()}`,
    name: `Course Subject ${i + 1}`,
    credits: (i % 4) + 2,
    semester: (i % 8) + 1,
    branch: 'CSE',
  }));

const genSchedule = (n) =>
  Array.from({ length: n }, (_, i) => ({
    schedule_id: Date.now() + i,
    subject: `Subject ${i + 1}`,
    date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
    session: i % 2 === 0 ? 'Morning' : 'Evening',
    room: `Room ${101 + i}`,
  }));

// ─── SYNC CARD CONFIG ────────────────────────────────────────────────────────
const SYNC_TYPES = [
  {
    key: 'students',
    label: 'Students',
    icon: Users,
    description: 'Pull student records from ERP and merge into local database.',
    lsKey: 'students',
    generate: () => genStudents(10 + Math.floor(Math.random() * 11)),
    merge: (existing, incoming) => {
      const ids = new Set(existing.map((s) => s.roll_no));
      const fresh = incoming.filter((s) => !ids.has(s.roll_no));
      return [...existing, ...fresh];
    },
    save: saveStudents,
    get: getStudents,
  },
  {
    key: 'faculty',
    label: 'Faculty',
    icon: UserCheck,
    description: 'Pull faculty and staff records from ERP.',
    lsKey: 'faculty',
    generate: () => genFaculty(10 + Math.floor(Math.random() * 11)),
    merge: (existing, incoming) => {
      const ids = new Set(existing.map((f) => f.name));
      const fresh = incoming.filter((f) => !ids.has(f.name));
      return [...existing, ...fresh];
    },
    save: saveFaculty,
    get: getFaculty,
  },
  {
    key: 'courses',
    label: 'Courses',
    icon: BookOpen,
    description: 'Pull course and subject catalog from ERP.',
    lsKey: 'erp_courses',
    generate: () => genCourses(10 + Math.floor(Math.random() * 11)),
    merge: (existing, incoming) => {
      const ids = new Set(existing.map((c) => c.code));
      const fresh = incoming.filter((c) => !ids.has(c.code));
      return [...existing, ...fresh];
    },
    save: (data) => saveLS('erp_courses', data),
    get: () => loadLS('erp_courses', []),
  },
  {
    key: 'schedule',
    label: 'Exam Schedule',
    icon: Calendar,
    description: 'Pull exam timetable from ERP system.',
    lsKey: 'erp_schedule',
    generate: () => genSchedule(10 + Math.floor(Math.random() * 11)),
    merge: (existing, incoming) => {
      const ids = new Set(existing.map((s) => s.schedule_id));
      const fresh = incoming.filter((s) => !ids.has(s.schedule_id));
      return [...existing, ...fresh];
    },
    save: (data) => saveLS('erp_schedule', data),
    get: () => loadLS('erp_schedule', []),
  },
];

// ─── FIELD MAPPING CONFIG ────────────────────────────────────────────────────
const DEFAULT_MAPPINGS = {
  students: [
    { erpField: 'student_id', systemField: 'student_id' },
    { erpField: 'roll_no',    systemField: 'roll_no' },
    { erpField: 'name',       systemField: 'name' },
    { erpField: 'branch',     systemField: 'branch' },
    { erpField: 'semester',   systemField: 'semester' },
    { erpField: 'section',    systemField: 'section' },
  ],
  faculty: [
    { erpField: 'faculty_id',   systemField: 'faculty_id' },
    { erpField: 'name',         systemField: 'name' },
    { erpField: 'department',   systemField: 'department' },
    { erpField: 'designation',  systemField: 'designation' },
  ],
};

// ─── TOAST ───────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white animate-fade-in"
          style={{
            background: t.type === 'success'
              ? 'linear-gradient(135deg,#166534,#16a34a)'
              : 'linear-gradient(135deg,#991b1b,#dc2626)',
            minWidth: 260,
          }}
        >
          {t.type === 'success'
            ? <CheckCircle className="w-4 h-4 shrink-0" />
            : <XCircle className="w-4 h-4 shrink-0" />}
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ─── STATUS BADGE ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = {
    Connected:    { bg: '#dcfce7', color: '#166534', dot: '#16a34a', label: 'Connected' },
    Disconnected: { bg: '#fee2e2', color: '#991b1b', dot: '#dc2626', label: 'Disconnected' },
    Testing:      { bg: '#fef9c3', color: '#854d0e', dot: '#ca8a04', label: 'Testing…' },
  }[status] || { bg: '#f3f4f6', color: '#374151', dot: '#9ca3af', label: status };
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

// ─── TAB 1: CONNECTION SETUP ─────────────────────────────────────────────────
function ConnectionSetup({ toast }) {
  const [cfg, setCfg] = useState(() => loadLS('erp_config', {
    system: 'SAP',
    baseUrl: '',
    apiKey: '',
    timeout: '30',
  }));
  const [showKey, setShowKey] = useState(false);
  const [connStatus, setConnStatus] = useState('Disconnected');
  const [testing, setTesting] = useState(false);

  const update = (k, v) => setCfg((c) => ({ ...c, [k]: v }));

  const testConnection = async () => {
    if (!cfg.baseUrl) { toast('Please enter an API Base URL', 'error'); return; }
    setTesting(true);
    setConnStatus('Testing');
    await new Promise((r) => setTimeout(r, 2000));
    setTesting(false);
    const ok = Math.random() > 0.3;
    setConnStatus(ok ? 'Connected' : 'Disconnected');
    toast(ok ? 'Connection successful!' : 'Connection failed. Check your credentials.', ok ? 'success' : 'error');
  };

  const saveConfig = () => {
    saveLS('erp_config', cfg);
    toast('Configuration saved successfully', 'success');
  };

  const inputCls = "w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all focus:ring-2";
  const inputStyle = { borderColor: '#d1fae5', background: '#fff', color: '#1f2937' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">ERP Connection Setup</h2>
          <p className="text-sm text-gray-500 mt-0.5">Configure your ERP system connection parameters</p>
        </div>
        <StatusBadge status={connStatus} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* ERP System */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">ERP System</label>
          <select
            value={cfg.system}
            onChange={(e) => update('system', e.target.value)}
            className={inputCls}
            style={inputStyle}
          >
            {['SAP', 'Oracle ERP', 'Moodle', 'Custom REST API', 'GBU ERP'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Timeout */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Connection Timeout</label>
          <select
            value={cfg.timeout}
            onChange={(e) => update('timeout', e.target.value)}
            className={inputCls}
            style={inputStyle}
          >
            {['10', '30', '60', '120'].map((t) => (
              <option key={t} value={t}>{t} seconds</option>
            ))}
          </select>
        </div>

        {/* Base URL */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">API Base URL</label>
          <input
            type="url"
            placeholder="https://erp.university.ac.in/api/v1"
            value={cfg.baseUrl}
            onChange={(e) => update('baseUrl', e.target.value)}
            className={inputCls}
            style={inputStyle}
          />
        </div>

        {/* API Key */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">API Key / Token</label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              placeholder="Enter your API key or bearer token"
              value={cfg.apiKey}
              onChange={(e) => update('apiKey', e.target.value)}
              className={inputCls + ' pr-10'}
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-2">
        <button
          onClick={testConnection}
          disabled={testing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg,#166534,#16a34a)', boxShadow: '0 2px 8px rgba(22,163,74,0.3)' }}
        >
          {testing
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Activity className="w-4 h-4" />}
          {testing ? 'Testing…' : 'Test Connection'}
        </button>
        <button
          onClick={saveConfig}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }}
        >
          <Save className="w-4 h-4" />
          Save Configuration
        </button>
      </div>

      {/* Info box */}
      <div className="rounded-xl p-4 text-sm" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
        <p className="font-semibold text-green-800 mb-1">Configuration Notes</p>
        <ul className="text-green-700 space-y-1 list-disc list-inside">
          <li>Ensure the ERP API endpoint is accessible from this server.</li>
          <li>API keys are stored locally in your browser and never transmitted to third parties.</li>
          <li>Use the Test Connection button to verify credentials before syncing data.</li>
        </ul>
      </div>
    </div>
  );
}

// ─── TAB 2: DATA SYNC ────────────────────────────────────────────────────────
function SyncCard({ syncType, syncState, onSync }) {
  const Icon = syncType.icon;
  const state = syncState[syncType.key] || { loading: false, lastSync: null, count: 0, status: 'idle' };

  const statusCfg = {
    success: { bg: '#dcfce7', color: '#166534', label: 'Synced' },
    error:   { bg: '#fee2e2', color: '#991b1b', label: 'Failed' },
    idle:    { bg: '#f3f4f6', color: '#6b7280', label: 'Not synced' },
  }[state.status] || { bg: '#f3f4f6', color: '#6b7280', label: 'Not synced' };

  return (
    <div className="rounded-2xl p-5 flex flex-col gap-4"
      style={{ background: '#fff', border: '1px solid #d1fae5', boxShadow: '0 1px 6px rgba(22,163,74,0.07)' }}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#dcfce7,#bbf7d0)' }}>
            <Icon className="w-5 h-5" style={{ color: '#166534' }} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-sm">{syncType.label}</h3>
            <p className="text-xs text-gray-500 mt-0.5 max-w-xs">{syncType.description}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ background: statusCfg.bg, color: statusCfg.color }}>
          {statusCfg.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-3 text-center" style={{ background: '#f0fdf4' }}>
          <p className="text-xs text-gray-500 mb-0.5">Last Synced</p>
          <p className="text-xs font-semibold text-gray-700">{fmtTs(state.lastSync)}</p>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: '#f0fdf4' }}>
          <p className="text-xs text-gray-500 mb-0.5">Records</p>
          <p className="text-lg font-bold" style={{ color: '#166534' }}>{state.count}</p>
        </div>
      </div>

      <button
        onClick={() => onSync(syncType)}
        disabled={state.loading}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg,#166534,#16a34a)', boxShadow: '0 2px 8px rgba(22,163,74,0.25)' }}
      >
        {state.loading
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Syncing…</>
          : <><RefreshCw className="w-4 h-4" /> Sync Now</>}
      </button>
    </div>
  );
}

function DataSync({ toast }) {
  const [syncState, setSyncState] = useState(() => {
    const saved = loadLS('erp_sync_state', {});
    return saved;
  });

  const addLog = (type, records, status, message) => {
    const logs = loadLS('erp_sync_logs', []);
    logs.unshift({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type,
      records,
      status,
      message,
    });
    saveLS('erp_sync_logs', logs.slice(0, 200));
  };

  const handleSync = async (syncType) => {
    setSyncState((prev) => ({
      ...prev,
      [syncType.key]: { ...prev[syncType.key], loading: true, status: 'idle' },
    }));

    await new Promise((r) => setTimeout(r, 2000));

    try {
      const incoming = syncType.generate();
      const existing = syncType.get();
      const merged = syncType.merge(existing, incoming);
      syncType.save(merged);

      const newCount = merged.length;
      const ts = new Date().toISOString();

      setSyncState((prev) => {
        const next = {
          ...prev,
          [syncType.key]: { loading: false, lastSync: ts, count: newCount, status: 'success' },
        };
        saveLS('erp_sync_state', next);
        return next;
      });

      addLog(syncType.label, incoming.length, 'Success', `Imported ${incoming.length} records. Total: ${newCount}`);
      toast(`${syncType.label} synced — ${incoming.length} new records imported`, 'success');
    } catch (err) {
      setSyncState((prev) => {
        const next = { ...prev, [syncType.key]: { ...prev[syncType.key], loading: false, status: 'error' } };
        saveLS('erp_sync_state', next);
        return next;
      });
      addLog(syncType.label, 0, 'Failed', err.message || 'Unknown error');
      toast(`${syncType.label} sync failed`, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-800">Data Synchronisation</h2>
        <p className="text-sm text-gray-500 mt-0.5">Pull data from your ERP system into the exam management database</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {SYNC_TYPES.map((st) => (
          <SyncCard key={st.key} syncType={st} syncState={syncState} onSync={handleSync} />
        ))}
      </div>
    </div>
  );
}

// ─── TAB 3: SYNC LOGS ────────────────────────────────────────────────────────
function SyncLogs({ toast }) {
  const [logs, setLogs] = useState(() => loadLS('erp_sync_logs', []));
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const refresh = () => setLogs(loadLS('erp_sync_logs', []));

  const clearLogs = () => {
    saveLS('erp_sync_logs', []);
    setLogs([]);
    toast('Sync logs cleared', 'success');
  };

  const types = ['All', ...Array.from(new Set(logs.map((l) => l.type)))];
  const statuses = ['All', 'Success', 'Failed'];

  const filtered = logs.filter((l) => {
    const tOk = filterType === 'All' || l.type === filterType;
    const sOk = filterStatus === 'All' || l.status === filterStatus;
    return tOk && sOk;
  });

  const selCls = "px-3 py-2 rounded-xl border text-sm outline-none";
  const selStyle = { borderColor: '#d1fae5', background: '#fff', color: '#1f2937' };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Sync Logs</h2>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} log entries</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-gray-400" />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={selCls} style={selStyle}>
              {types.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={selCls} style={selStyle}>
            {statuses.map((s) => <option key={s}>{s}</option>)}
          </select>
          <button onClick={refresh}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-white"
            style={{ background: 'linear-gradient(135deg,#166534,#16a34a)' }}>
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button onClick={clearLogs}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-white"
            style={{ background: 'linear-gradient(135deg,#991b1b,#dc2626)' }}>
            <Trash2 className="w-3.5 h-3.5" /> Clear Logs
          </button>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #d1fae5' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'linear-gradient(135deg,#166534,#15803d)' }}>
                {['Timestamp', 'Type', 'Records', 'Status', 'Message'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400 text-sm">
                    No sync logs found
                  </td>
                </tr>
              ) : filtered.map((log, idx) => (
                <tr key={log.id}
                  style={{ background: idx % 2 === 0 ? '#fff' : '#f0fdf4', borderBottom: '1px solid #d1fae5' }}>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtTs(log.timestamp)}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-lg text-xs font-semibold"
                      style={{ background: '#dcfce7', color: '#166534' }}>
                      {log.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-700">{log.records}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={log.status === 'Success'
                        ? { background: '#dcfce7', color: '#166534' }
                        : { background: '#fee2e2', color: '#991b1b' }}>
                      {log.status === 'Success'
                        ? <CheckCircle className="w-3 h-3" />
                        : <XCircle className="w-3 h-3" />}
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{log.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── TAB 4: FIELD MAPPING ────────────────────────────────────────────────────
function FieldMapping({ toast }) {
  const [entity, setEntity] = useState('students');
  const [mappings, setMappings] = useState(() =>
    loadLS('erp_field_mappings', DEFAULT_MAPPINGS)
  );

  const updateErpField = (idx, val) => {
    setMappings((prev) => {
      const updated = prev[entity].map((row, i) =>
        i === idx ? { ...row, erpField: val } : row
      );
      return { ...prev, [entity]: updated };
    });
  };

  const saveMappings = () => {
    saveLS('erp_field_mappings', mappings);
    toast('Field mappings saved successfully', 'success');
  };

  const resetMappings = () => {
    setMappings(DEFAULT_MAPPINGS);
    saveLS('erp_field_mappings', DEFAULT_MAPPINGS);
    toast('Mappings reset to defaults', 'success');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Field Mapping</h2>
          <p className="text-sm text-gray-500 mt-0.5">Map ERP field names to system field names</p>
        </div>
        <div className="flex items-center gap-2">
          {['students', 'faculty'].map((e) => (
            <button
              key={e}
              onClick={() => setEntity(e)}
              className="px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all"
              style={entity === e
                ? { background: 'linear-gradient(135deg,#166534,#16a34a)', color: '#fff' }
                : { background: '#f0fdf4', color: '#166534', border: '1px solid #d1fae5' }}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #d1fae5' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'linear-gradient(135deg,#166534,#15803d)' }}>
              <th className="px-5 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider w-1/2">
                ERP Field Name
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider w-1/2">
                System Field Name
              </th>
            </tr>
          </thead>
          <tbody>
            {(mappings[entity] || []).map((row, idx) => (
              <tr key={idx}
                style={{ background: idx % 2 === 0 ? '#fff' : '#f0fdf4', borderBottom: '1px solid #d1fae5' }}>
                <td className="px-5 py-3">
                  <input
                    type="text"
                    value={row.erpField}
                    onChange={(e) => updateErpField(idx, e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-green-300"
                    style={{ borderColor: '#d1fae5', background: '#f0fdf4', color: '#1f2937' }}
                  />
                </td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-mono"
                    style={{ background: '#dcfce7', color: '#166534' }}>
                    {row.systemField}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3">
        <button
          onClick={saveMappings}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg,#166534,#16a34a)', boxShadow: '0 2px 8px rgba(22,163,74,0.3)' }}
        >
          <Save className="w-4 h-4" /> Save Mappings
        </button>
        <button
          onClick={resetMappings}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #d1fae5' }}
        >
          <RefreshCw className="w-4 h-4" /> Reset to Defaults
        </button>
      </div>

      <div className="rounded-xl p-4 text-sm" style={{ background: '#fefce8', border: '1px solid #fde68a' }}>
        <p className="font-semibold text-yellow-800 mb-1">Mapping Notes</p>
        <p className="text-yellow-700">
          The ERP Field Name is the key used in the raw API response from your ERP system.
          The System Field Name is the internal key used by this application. Edit the ERP field names
          to match your ERP's actual API response structure.
        </p>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────
const TABS = [
  { key: 'connection', label: 'Connection Setup', icon: Settings },
  { key: 'sync',       label: 'Data Sync',        icon: RefreshCw },
  { key: 'logs',       label: 'Sync Logs',         icon: Activity },
  { key: 'mapping',    label: 'Field Mapping',     icon: Database },
];

export default function ERPIntegration() {
  const [activeTab, setActiveTab] = useState('connection');
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };

  const tabProps = { toast: addToast };

  return (
    <div className="min-h-screen" style={{ background: '#f0faf4' }}>
      <Toast toasts={toasts} />

      {/* ── Hero ── */}
      <div className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#166534,#15803d,#16a34a)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%,#4ade80 0%,transparent 50%), radial-gradient(circle at 80% 20%,#86efac 0%,transparent 40%)' }} />
        <div className="relative px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs mb-4" style={{ color: 'rgba(187,247,208,0.8)' }}>
            <span>Admin</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-semibold">ERP Integration</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <Link2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">ERP Integration</h1>
              <p className="text-sm mt-0.5" style={{ color: '#bbf7d0' }}>
                Connect and synchronise data with your institution's ERP system
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-4 mt-6">
            {[
              { label: 'ERP System', value: loadLS('erp_config', {}).system || 'Not configured' },
              { label: 'Students Synced', value: loadLS('erp_sync_state', {}).students?.count ?? 0 },
              { label: 'Faculty Synced',  value: loadLS('erp_sync_state', {}).faculty?.count ?? 0 },
              { label: 'Sync Logs',       value: loadLS('erp_sync_logs', []).length },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl px-4 py-2.5"
                style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <p className="text-xs" style={{ color: '#bbf7d0' }}>{label}</p>
                <p className="text-lg font-bold text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="px-8 pt-6">
        <div className="flex flex-wrap gap-1 p-1 rounded-2xl w-fit"
          style={{ background: '#dcfce7', border: '1px solid #bbf7d0' }}>
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={activeTab === key
                ? { background: 'linear-gradient(135deg,#166534,#16a34a)', color: '#fff', boxShadow: '0 2px 8px rgba(22,163,74,0.35)' }
                : { color: '#166534' }}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="px-8 py-6">
        <div className="rounded-2xl p-6"
          style={{ background: '#fff', border: '1px solid #d1fae5', boxShadow: '0 2px 12px rgba(22,163,74,0.06)' }}>
          {activeTab === 'connection' && <ConnectionSetup {...tabProps} />}
          {activeTab === 'sync'       && <DataSync       {...tabProps} />}
          {activeTab === 'logs'       && <SyncLogs       {...tabProps} />}
          {activeTab === 'mapping'    && <FieldMapping   {...tabProps} />}
        </div>
      </div>
    </div>
  );
}
