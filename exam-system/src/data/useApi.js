/**
 * useApi — unified data hook
 * Tries the backend API first; falls back to localStorage (store.js) if backend is offline.
 * All pages import from here instead of store.js directly.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import * as store from './store';
import {
  studentsAPI, facultyAPI, roomsAPI, examsAPI,
  seatingAPI, invigilationAPI, attendanceAPI,
  replacementsAPI, reportsAPI, checkBackend,
  getToken,
} from './api';

// ── Backend availability cache (checked once per session) ─────────────────────
let _backendAvailable = null;
let _checking = false;
const _listeners = [];

export const isBackendAvailable = () => _backendAvailable;

export async function ensureBackendCheck() {
  if (_backendAvailable !== null) return _backendAvailable;
  if (_checking) return new Promise(r => _listeners.push(r));
  _checking = true;
  _backendAvailable = await checkBackend();
  _checking = false;
  _listeners.forEach(r => r(_backendAvailable));
  _listeners.length = 0;
  return _backendAvailable;
}

// ── Generic async hook ────────────────────────────────────────────────────────
export function useAsync(fn, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      setData(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, deps); // eslint-disable-line

  useEffect(() => { run(); }, [run]);
  return { data, loading, error, refetch: run };
}

// ── Backend status indicator hook ─────────────────────────────────────────────
export function useBackendStatus() {
  const [online, setOnline] = useState(_backendAvailable);
  useEffect(() => {
    ensureBackendCheck().then(v => setOnline(v));
  }, []);
  return online;
}

// ── STUDENTS ──────────────────────────────────────────────────────────────────
export function useStudents(params = {}) {
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [total,    setTotal]    = useState(0);
  const paramsKey = JSON.stringify(params);

  const load = useCallback(async () => {
    setLoading(true);
    const online = await ensureBackendCheck();
    if (online && getToken()) {
      try {
        const res = await studentsAPI.list(params);
        setStudents(res.data || res);
        setTotal(res.total || (res.data || res).length);
        setLoading(false);
        return;
      } catch { /* fall through */ }
    }
    // localStorage fallback
    let data = store.getStudents();
    if (params.search) {
      const q = params.search.toLowerCase();
      data = data.filter(s => s.roll_no?.toLowerCase().includes(q) || s.name?.toLowerCase().includes(q));
    }
    if (params.branch)   data = data.filter(s => s.branch === params.branch);
    if (params.semester) data = data.filter(s => String(s.semester) === String(params.semester));
    setStudents(data);
    setTotal(data.length);
    setLoading(false);
  }, [paramsKey]); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  const create = async (data) => {
    const online = await ensureBackendCheck();
    if (online && getToken()) {
      const res = await studentsAPI.create(data);
      await load();
      return res;
    }
    const s = store.addStudent(data);
    await load();
    return s;
  };

  const update = async (id, data) => {
    const online = await ensureBackendCheck();
    if (online && getToken()) { await studentsAPI.update(id, data); }
    else store.updateStudent(id, data);
    await load();
  };

  const remove = async (id) => {
    const online = await ensureBackendCheck();
    if (online && getToken()) { await studentsAPI.delete(id); }
    else store.deleteStudent(id);
    await load();
  };

  const bulkImport = async (file) => {
    const online = await ensureBackendCheck();
    if (online && getToken()) {
      const res = await studentsAPI.bulkImport(file);
      await load();
      return res;
    }
    // CSV fallback handled in Students.jsx
    throw new Error('Backend required for bulk import');
  };

  return { students, loading, total, refetch: load, create, update, remove, bulkImport };
}

// ── FACULTY ───────────────────────────────────────────────────────────────────
export function useFaculty(params = {}) {
  const [faculty,  setFaculty]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const paramsKey = JSON.stringify(params);

  const load = useCallback(async () => {
    setLoading(true);
    const online = await ensureBackendCheck();
    if (online && getToken()) {
      try {
        const res = await facultyAPI.list(params);
        setFaculty(res);
        setLoading(false);
        return;
      } catch { /* fall through */ }
    }
    let data = store.getFaculty();
    if (params.search) {
      const q = params.search.toLowerCase();
      data = data.filter(f => f.name?.toLowerCase().includes(q));
    }
    setFaculty(data);
    setLoading(false);
  }, [paramsKey]); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  const create = async (data) => {
    const online = await ensureBackendCheck();
    if (online && getToken()) { await facultyAPI.create(data); }
    else store.addFaculty(data);
    await load();
  };

  const update = async (id, data) => {
    const online = await ensureBackendCheck();
    if (online && getToken()) { await facultyAPI.update(id, data); }
    else store.updateFaculty(id, data);
    await load();
  };

  const remove = async (id) => {
    const online = await ensureBackendCheck();
    if (online && getToken()) { await facultyAPI.delete(id); }
    else store.deleteFaculty(id);
    await load();
  };

  return { faculty, loading, refetch: load, create, update, remove };
}

// ── ROOMS ─────────────────────────────────────────────────────────────────────
export function useRooms() {
  const [rooms,   setRooms]   = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const online = await ensureBackendCheck();
    if (online && getToken()) {
      try { setRooms(await roomsAPI.list()); setLoading(false); return; } catch {}
    }
    setRooms(store.getRooms());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async (data) => {
    const online = await ensureBackendCheck();
    if (online && getToken()) { await roomsAPI.create(data); }
    else store.addRoom(data);
    await load();
  };

  const update = async (id, data) => {
    const online = await ensureBackendCheck();
    if (online && getToken()) { await roomsAPI.update(id, data); }
    else store.updateRoom(id, data);
    await load();
  };

  const remove = async (id) => {
    const online = await ensureBackendCheck();
    if (online && getToken()) { await roomsAPI.delete(id); }
    else store.deleteRoom(id);
    await load();
  };

  return { rooms, loading, refetch: load, create, update, remove };
}

// ── EXAMS ─────────────────────────────────────────────────────────────────────
export function useExams(params = {}) {
  const [exams,   setExams]   = useState([]);
  const [loading, setLoading] = useState(true);
  const paramsKey = JSON.stringify(params);

  const load = useCallback(async () => {
    setLoading(true);
    const online = await ensureBackendCheck();
    if (online && getToken()) {
      try { setExams(await examsAPI.list(params)); setLoading(false); return; } catch {}
    }
    let data = store.getExams();
    if (params.date)    data = data.filter(e => e.date === params.date);
    if (params.session) data = data.filter(e => e.session === params.session);
    setExams(data);
    setLoading(false);
  }, [paramsKey]); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  const create = async (data) => {
    const online = await ensureBackendCheck();
    if (online && getToken()) { await examsAPI.create(data); }
    else store.addExam(data);
    await load();
  };

  const remove = async (id) => {
    const online = await ensureBackendCheck();
    if (online && getToken()) { await examsAPI.delete(id); }
    else store.deleteExam(id);
    await load();
  };

  return { exams, loading, refetch: load, create, remove };
}

// ── SEATING ALLOCATIONS ───────────────────────────────────────────────────────
export function useSeating(examId) {
  const [allocs,  setAllocs]  = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!examId) { setAllocs([]); return; }
    setLoading(true);
    const online = await ensureBackendCheck();
    if (online && getToken()) {
      try {
        const res = await seatingAPI.list({ exam_id: examId });
        setAllocs(res);
        setLoading(false);
        return;
      } catch {}
    }
    const data = store.getSeatingAllocations().filter(a => a.exam_id === Number(examId));
    setAllocs(data);
    setLoading(false);
  }, [examId]);

  useEffect(() => { load(); }, [load]);

  const generate = async (studentIds, roomIds) => {
    const online = await ensureBackendCheck();
    if (online && getToken()) {
      const res = await seatingAPI.generate({ exam_id: examId, student_ids: studentIds, room_ids: roomIds });
      await load();
      return res;
    }
    // localStorage algorithm
    const { generateSeatingAllocation } = await import('./algorithms');
    const res = generateSeatingAllocation(Number(examId), studentIds, roomIds);
    await load();
    return res;
  };

  return { allocs, loading, refetch: load, generate };
}

// ── INVIGILATION ──────────────────────────────────────────────────────────────
export function useInvigilation(examId) {
  const [duties,  setDuties]  = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!examId) { setDuties([]); return; }
    setLoading(true);
    const online = await ensureBackendCheck();
    if (online && getToken()) {
      try {
        setDuties(await invigilationAPI.list({ exam_id: examId }));
        setLoading(false);
        return;
      } catch {}
    }
    setDuties(store.getInvigilationAllocations().filter(a => a.exam_id === Number(examId)));
    setLoading(false);
  }, [examId]);

  useEffect(() => { load(); }, [load]);

  const generate = async (roomIds) => {
    const online = await ensureBackendCheck();
    if (online && getToken()) {
      const res = await invigilationAPI.generate({ exam_id: examId, room_ids: roomIds });
      await load();
      return res;
    }
    const { generateInvigilationAllocation } = await import('./algorithms');
    const res = generateInvigilationAllocation(Number(examId), roomIds);
    await load();
    return res;
  };

  const updateDuty = async (dutyId, data) => {
    const online = await ensureBackendCheck();
    if (online && getToken()) { await invigilationAPI.update(dutyId, data); }
    else store.updateInvigilationDuty(dutyId, data);
    await load();
  };

  return { duties, loading, refetch: load, generate, updateDuty };
}

// ── ATTENDANCE ────────────────────────────────────────────────────────────────
export function useAttendance(examId, roomId) {
  const [attendance, setAttendance] = useState([]);
  const [loading,    setLoading]    = useState(false);

  const load = useCallback(async () => {
    if (!examId) { setAttendance([]); return; }
    setLoading(true);
    const online = await ensureBackendCheck();
    if (online && getToken()) {
      try {
        const params = { exam_id: examId };
        if (roomId) params.room_id = roomId;
        setAttendance(await attendanceAPI.list(params));
        setLoading(false);
        return;
      } catch {}
    }
    setAttendance(store.getAttendance());
    setLoading(false);
  }, [examId, roomId]);

  useEffect(() => { load(); }, [load]);

  const mark = async (allocationId, status, method = 'Manual') => {
    const online = await ensureBackendCheck();
    if (online && getToken()) {
      await attendanceAPI.mark({ allocation_id: allocationId, status, method });
    } else {
      const existing = store.getAttendance().filter(a => a.allocation_id !== allocationId);
      store.saveAttendance([...existing, { attendance_id: Date.now(), allocation_id: allocationId, status }]);
    }
    await load();
  };

  const markBulk = async (records) => {
    const online = await ensureBackendCheck();
    if (online && getToken()) {
      await attendanceAPI.markBulk(records);
    } else {
      const existing = store.getAttendance();
      const ids = new Set(records.map(r => r.allocation_id));
      const filtered = existing.filter(a => !ids.has(a.allocation_id));
      const newEntries = records.map(r => ({ attendance_id: Date.now() + Math.random(), allocation_id: r.allocation_id, status: r.status }));
      store.saveAttendance([...filtered, ...newEntries]);
    }
    await load();
  };

  const qrScan = async (qrData) => {
    const online = await ensureBackendCheck();
    if (online && getToken()) {
      return attendanceAPI.qrScan(qrData);
    }
    throw new Error('Backend required for QR scan');
  };

  return { attendance, loading, refetch: load, mark, markBulk, qrScan };
}

// ── REPLACEMENTS ──────────────────────────────────────────────────────────────
export function useReplacements() {
  const [replacements, setReplacements] = useState([]);
  const [loading,      setLoading]      = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const online = await ensureBackendCheck();
    if (online && getToken()) {
      try { setReplacements(await replacementsAPI.list()); setLoading(false); return; } catch {}
    }
    setReplacements(store.getReplacements());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async (data) => {
    const online = await ensureBackendCheck();
    if (online && getToken()) { await replacementsAPI.create(data); }
    else store.addReplacement(data);
    await load();
  };

  const approve = async (id) => {
    const online = await ensureBackendCheck();
    if (online && getToken()) { await replacementsAPI.approve(id); }
    else store.updateReplacement(id, { status: 'Approved' });
    await load();
  };

  const reject = async (id) => {
    const online = await ensureBackendCheck();
    if (online && getToken()) { await replacementsAPI.reject(id); }
    else store.updateReplacement(id, { status: 'Rejected' });
    await load();
  };

  return { replacements, loading, refetch: load, create, approve, reject };
}

// ── REPORTS / DASHBOARD ───────────────────────────────────────────────────────
export function useDashboardStats() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const online = await ensureBackendCheck();
      if (online && getToken()) {
        try { setStats(await reportsAPI.dashboard()); setLoading(false); return; } catch {}
      }
      // Build from localStorage
      setStats({
        students:             store.getStudents().length,
        faculty:              store.getFaculty().length,
        rooms:                store.getRooms().length,
        exams:                store.getExams().length,
        morning_exams:        store.getExams().filter(e => e.session === 'Morning').length,
        evening_exams:        store.getExams().filter(e => e.session === 'Evening').length,
        seats_allocated:      store.getSeatingAllocations().length,
        pending_replacements: store.getReplacements().filter(r => r.status === 'Pending').length,
        total_present:        store.getAttendance().filter(a => a.status === 'Present').length,
      });
      setLoading(false);
    })();
  }, []);

  return { stats, loading };
}
