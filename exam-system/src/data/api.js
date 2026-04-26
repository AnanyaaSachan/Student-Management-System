/**
 * API client — connects the React frontend to the Express backend.
 * Falls back to localStorage if backend is not running.
 */

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Token management ──────────────────────────────────────────────────────────
export const getToken  = ()    => localStorage.getItem('auth_token');
export const setToken  = (t)   => localStorage.setItem('auth_token', t);
export const clearToken = ()   => localStorage.removeItem('auth_token');

// ── Base fetch ────────────────────────────────────────────────────────────────
async function request(method, path, body, isFormData = false) {
  const headers = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

const get    = (path)        => request('GET',    path);
const post   = (path, body)  => request('POST',   path, body);
const put    = (path, body)  => request('PUT',    path, body);
const del    = (path)        => request('DELETE', path);
const upload = (path, form)  => request('POST',   path, form, true);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:          (creds)  => post('/auth/login', creds),
  me:             ()       => get('/auth/me'),
  changePassword: (data)   => put('/auth/change-password', data),
  register:       (data)   => post('/auth/register', data),
};

// ── Students ──────────────────────────────────────────────────────────────────
export const studentsAPI = {
  list:        (params = {}) => get('/students?' + new URLSearchParams(params)),
  get:         (id)          => get(`/students/${id}`),
  create:      (data)        => post('/students', data),
  update:      (id, data)    => put(`/students/${id}`, data),
  delete:      (id)          => del(`/students/${id}`),
  bulkImport:  (file)        => { const f = new FormData(); f.append('file', file); return upload('/students/bulk-import', f); },
  filters:     ()            => get('/students/meta/filters'),
};

// ── Faculty ───────────────────────────────────────────────────────────────────
export const facultyAPI = {
  list:    (params = {}) => get('/faculty?' + new URLSearchParams(params)),
  get:     (id)          => get(`/faculty/${id}`),
  create:  (data)        => post('/faculty', data),
  update:  (id, data)    => put(`/faculty/${id}`, data),
  delete:  (id)          => del(`/faculty/${id}`),
};

// ── Rooms ─────────────────────────────────────────────────────────────────────
export const roomsAPI = {
  list:   ()          => get('/rooms'),
  get:    (id)        => get(`/rooms/${id}`),
  create: (data)      => post('/rooms', data),
  update: (id, data)  => put(`/rooms/${id}`, data),
  delete: (id)        => del(`/rooms/${id}`),
};

// ── Exams ─────────────────────────────────────────────────────────────────────
export const examsAPI = {
  list:   (params = {}) => get('/exams?' + new URLSearchParams(params)),
  get:    (id)          => get(`/exams/${id}`),
  create: (data)        => post('/exams', data),
  update: (id, data)    => put(`/exams/${id}`, data),
  delete: (id)          => del(`/exams/${id}`),
};

// ── Seating ───────────────────────────────────────────────────────────────────
export const seatingAPI = {
  list:        (params = {}) => get('/seating?' + new URLSearchParams(params)),
  generate:    (data)        => post('/seating/generate', data),
  clear:       (examId)      => del(`/seating/${examId}`),
  roomSummary: (examId)      => get(`/seating/room-summary/${examId}`),
};

// ── Invigilation ──────────────────────────────────────────────────────────────
export const invigilationAPI = {
  list:     (params = {}) => get('/invigilation?' + new URLSearchParams(params)),
  generate: (data)        => post('/invigilation/generate', data),
  update:   (id, data)    => put(`/invigilation/${id}`, data),
  clear:    (examId)      => del(`/invigilation/${examId}`),
};

// ── Attendance ────────────────────────────────────────────────────────────────
export const attendanceAPI = {
  list:         (params = {}) => get('/attendance?' + new URLSearchParams(params)),
  mark:         (data)        => post('/attendance/mark', data),
  markBulk:     (records)     => post('/attendance/mark-bulk', { records }),
  qrScan:       (qr_data)     => post('/attendance/qr-scan', { qr_data }),
  summary:      (examId)      => get(`/attendance/summary/${examId}`),
  dailySummary: (examId)      => get(`/attendance/daily-summary/${examId}`),
};

// ── Replacements ──────────────────────────────────────────────────────────────
export const replacementsAPI = {
  list:    ()    => get('/replacements'),
  create:  (d)   => post('/replacements', d),
  approve: (id)  => put(`/replacements/${id}/approve`, {}),
  reject:  (id)  => put(`/replacements/${id}/reject`, {}),
};

// ── Reports ───────────────────────────────────────────────────────────────────
export const reportsAPI = {
  dashboard:         () => get('/reports/dashboard'),
  facultyDuties:     () => get('/reports/faculty-duties'),
  roomUtilization:   () => get('/reports/room-utilization'),
  attendanceSummary: () => get('/reports/attendance-summary'),
  examSchedule:      () => get('/reports/exam-schedule'),
};

// ── Health check ──────────────────────────────────────────────────────────────
export const checkBackend = async () => {
  try {
    const r = await fetch(`${BASE}/health`, { signal: AbortSignal.timeout(3000) });
    return r.ok;
  } catch {
    return false;
  }
};
