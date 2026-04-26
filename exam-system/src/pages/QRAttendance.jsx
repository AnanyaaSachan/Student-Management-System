import { useState, useMemo, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  QrCode, ScanLine, CheckCircle, XCircle, Printer,
  ChevronDown, Download, RefreshCw, Users, UserCheck,
} from 'lucide-react';
import {
  getExams, getStudents, getSeatingAllocations,
  getAttendance, saveAttendance,
} from '../data/store';

// ── QR data format: "GBU|examId|studentId|rollNo|examDate" ───────────────────
function encodeQR(exam, student, alloc) {
  return `GBU|${exam.exam_id}|${student.student_id}|${student.roll_no}|${exam.date}|${alloc.room_id}|${alloc.seat_no}`;
}

function decodeQR(raw) {
  try {
    const parts = raw.split('|');
    if (parts[0] !== 'GBU' || parts.length < 7) return null;
    return {
      examId:    Number(parts[1]),
      studentId: Number(parts[2]),
      rollNo:    parts[3],
      date:      parts[4],
      roomId:    Number(parts[5]),
      seatNo:    Number(parts[6]),
    };
  } catch { return null; }
}

// ── Tab: Generate QR codes ────────────────────────────────────────────────────
function GenerateTab() {
  const exams    = getExams();
  const students = getStudents();
  const allAllocs = getSeatingAllocations();

  const [selectedExam, setSelectedExam] = useState('');
  const [search, setSearch]             = useState('');
  const [printAll, setPrintAll]         = useState(false);

  const exam = exams.find(e => e.exam_id === Number(selectedExam));

  const examAllocs = useMemo(() => {
    if (!selectedExam) return [];
    return allAllocs
      .filter(a => a.exam_id === Number(selectedExam))
      .map(a => ({
        alloc:   a,
        student: students.find(s => s.student_id === a.student_id),
      }))
      .filter(x => x.student)
      .sort((a, b) => (a.student.roll_no || '').localeCompare(b.student.roll_no || '', undefined, { numeric: true }));
  }, [selectedExam, students, allAllocs]);

  const filtered = useMemo(() => {
    if (!search) return examAllocs;
    const q = search.toLowerCase();
    return examAllocs.filter(x =>
      x.student.roll_no?.toLowerCase().includes(q) ||
      x.student.name?.toLowerCase().includes(q)
    );
  }, [examAllocs, search]);

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-64">
          <select
            value={selectedExam}
            onChange={e => setSelectedExam(e.target.value)}
            className="w-full appearance-none px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none"
            style={{ borderColor: '#bbf7d0', background: 'white', color: '#14532d' }}
          >
            <option value="">— Select Exam —</option>
            {exams.map(e => (
              <option key={e.exam_id} value={e.exam_id}>
                {e.exam_name} · {e.date} · {e.session}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#16a34a' }} />
        </div>

        {selectedExam && (
          <input
            type="text"
            placeholder="Search roll no or name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-4 py-2.5 rounded-xl border text-sm focus:outline-none"
            style={{ borderColor: '#bbf7d0', minWidth: '220px' }}
          />
        )}

        {selectedExam && (
          <button
            onClick={() => { setPrintAll(true); setTimeout(() => { window.print(); setPrintAll(false); }, 300); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)', boxShadow: '0 2px 8px rgba(22,163,74,0.3)' }}
          >
            <Printer className="w-4 h-4" /> Print All QR Codes
          </button>
        )}
      </div>

      {/* Stats */}
      {selectedExam && (
        <div className="flex gap-4 mb-5">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: '#dcfce7', color: '#15803d' }}>
            <Users className="w-4 h-4" />
            {examAllocs.length} students allocated
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: '#dbeafe', color: '#1d4ed8' }}>
            <QrCode className="w-4 h-4" />
            {filtered.length} QR codes shown
          </div>
        </div>
      )}

      {/* QR Grid */}
      {filtered.length === 0 && selectedExam && (
        <div className="text-center py-16 text-gray-400">
          No students allocated for this exam. Generate seating first.
        </div>
      )}

      <div className={`grid gap-4 ${printAll ? 'grid-cols-4' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'}`}>
        {filtered.map(({ alloc, student }) => {
          const qrData = encodeQR(exam, student, alloc);
          return (
            <div key={alloc.allocation_id}
              className="bg-white rounded-2xl p-4 flex flex-col items-center gap-2 text-center"
              style={{ border: '1px solid #bbf7d0', boxShadow: '0 2px 8px rgba(22,163,74,0.08)' }}>
              {/* QR Code */}
              <QRCodeSVG
                value={qrData}
                size={120}
                level="M"
                fgColor="#14532d"
                bgColor="#ffffff"
                style={{ borderRadius: '8px' }}
              />
              {/* Student info */}
              <div className="mt-1">
                <p className="font-bold text-xs" style={{ color: '#14532d' }}>{student.roll_no}</p>
                {student.name && <p className="text-xs text-gray-500 truncate max-w-28">{student.name}</p>}
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: '#dcfce7', color: '#15803d' }}>
                    Room {alloc.room_id}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                    Seat {alloc.seat_no}
                  </span>
                </div>
              </div>
              {/* Exam info */}
              <p className="text-xs text-gray-400">{exam?.date} · {exam?.session}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab: Scan QR codes ────────────────────────────────────────────────────────
function ScanTab() {
  const exams    = getExams();
  const students = getStudents();
  const allAllocs = getSeatingAllocations();

  const [selectedExam, setSelectedExam] = useState('');
  const [scanning,     setScanning]     = useState(false);
  const [lastScan,     setLastScan]     = useState(null);   // { rollNo, status, message }
  const [scanLog,      setScanLog]      = useState([]);
  const [refresh,      setRefresh]      = useState(0);
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);

  const exam = exams.find(e => e.exam_id === Number(selectedExam));

  // Attendance counts
  const attendance = getAttendance();
  const examAllocIds = new Set(
    allAllocs.filter(a => a.exam_id === Number(selectedExam)).map(a => a.allocation_id)
  );
  const markedPresent = attendance.filter(a => examAllocIds.has(a.allocation_id) && a.status === 'Present').length;
  const totalStudents = examAllocIds.size;

  const startScanner = async () => {
    if (!selectedExam) return;
    setScanning(true);
    try {
      const qr = new Html5Qrcode('qr-reader');
      html5QrRef.current = qr;
      await qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 280, height: 280 } },
        (decodedText) => handleScan(decodedText),
        () => {}
      );
    } catch (err) {
      console.error('Camera error:', err);
      setScanning(false);
      setLastScan({ status: 'error', message: 'Camera access denied. Please allow camera permission.' });
    }
  };

  const stopScanner = async () => {
    if (html5QrRef.current) {
      try { await html5QrRef.current.stop(); } catch {}
      html5QrRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => { if (html5QrRef.current) { html5QrRef.current.stop().catch(() => {}); } };
  }, []);

  const handleScan = (raw) => {
    const data = decodeQR(raw);
    if (!data) {
      setLastScan({ status: 'error', message: 'Invalid QR code — not a GBU exam QR.' });
      return;
    }

    // Check exam match
    if (data.examId !== Number(selectedExam)) {
      setLastScan({ status: 'error', rollNo: data.rollNo, message: `QR is for a different exam (${data.date}).` });
      return;
    }

    // Find allocation
    const alloc = allAllocs.find(a =>
      a.exam_id === data.examId && a.student_id === data.studentId
    );
    if (!alloc) {
      setLastScan({ status: 'error', rollNo: data.rollNo, message: 'Student not found in seating allocation.' });
      return;
    }

    // Check already marked
    const existing = getAttendance();
    const alreadyMarked = existing.find(a => a.allocation_id === alloc.allocation_id && a.status === 'Present');
    if (alreadyMarked) {
      setLastScan({ status: 'duplicate', rollNo: data.rollNo, message: 'Already marked Present.' });
      return;
    }

    // Mark present
    const updated = existing.filter(a => a.allocation_id !== alloc.allocation_id);
    updated.push({ attendance_id: Date.now(), allocation_id: alloc.allocation_id, status: 'Present' });
    saveAttendance(updated);

    const student = students.find(s => s.student_id === data.studentId);
    const entry = {
      rollNo:  data.rollNo,
      name:    student?.name || '',
      room:    data.roomId,
      seat:    data.seatNo,
      time:    new Date().toLocaleTimeString(),
      status:  'success',
    };
    setLastScan({ ...entry, message: `✓ Marked Present` });
    setScanLog(prev => [entry, ...prev.slice(0, 49)]);
    setRefresh(r => r + 1);
  };

  const clearLog = () => { setScanLog([]); setLastScan(null); };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Scanner */}
      <div>
        {/* Exam selector */}
        <div className="mb-4">
          <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: '#15803d' }}>
            Select Exam
          </label>
          <div className="relative">
            <select
              value={selectedExam}
              onChange={e => { setSelectedExam(e.target.value); stopScanner(); setLastScan(null); }}
              className="w-full appearance-none px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none"
              style={{ borderColor: '#bbf7d0', background: 'white', color: '#14532d' }}
            >
              <option value="">— Select Exam —</option>
              {exams.map(e => (
                <option key={e.exam_id} value={e.exam_id}>
                  {e.exam_name} · {e.date} · {e.session}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#16a34a' }} />
          </div>
        </div>

        {/* Stats */}
        {selectedExam && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="rounded-xl p-3 text-center" style={{ background: '#dcfce7', border: '1px solid #bbf7d0' }}>
              <p className="text-xl font-bold" style={{ color: '#15803d' }}>{markedPresent}</p>
              <p className="text-xs text-gray-500">Present</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: '#ffe4e6', border: '1px solid #fecdd3' }}>
              <p className="text-xl font-bold text-rose-600">{totalStudents - markedPresent}</p>
              <p className="text-xs text-gray-500">Absent</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: '#dbeafe', border: '1px solid #bfdbfe' }}>
              <p className="text-xl font-bold text-blue-600">{totalStudents}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
        )}

        {/* Camera viewfinder */}
        <div className="rounded-2xl overflow-hidden mb-4"
          style={{ border: '2px solid #bbf7d0', background: '#f0fdf4', minHeight: '300px', position: 'relative' }}>
          <div id="qr-reader" style={{ width: '100%' }} />
          {!scanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#dcfce7,#bbf7d0)' }}>
                <ScanLine className="w-10 h-10" style={{ color: '#16a34a' }} />
              </div>
              <p className="text-sm font-medium text-gray-500">Camera not active</p>
              <p className="text-xs text-gray-400">Select an exam and click Start Scanning</p>
            </div>
          )}
        </div>

        {/* Start/Stop button */}
        <div className="flex gap-3">
          {!scanning ? (
            <button
              onClick={startScanner}
              disabled={!selectedExam}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)', boxShadow: '0 4px 14px rgba(22,163,74,0.35)' }}
            >
              <ScanLine className="w-5 h-5" />
              Start Scanning
            </button>
          ) : (
            <button
              onClick={stopScanner}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all"
              style={{ background: 'linear-gradient(135deg,#dc2626,#b91c1c)', boxShadow: '0 4px 14px rgba(220,38,38,0.3)' }}
            >
              <XCircle className="w-5 h-5" />
              Stop Scanner
            </button>
          )}
          <button onClick={clearLog}
            className="px-4 py-3 rounded-xl border text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            style={{ borderColor: '#d1d5db' }}>
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Last scan result */}
        {lastScan && (
          <div className="mt-4 p-4 rounded-xl flex items-start gap-3"
            style={{
              background: lastScan.status === 'success' ? '#dcfce7'
                : lastScan.status === 'duplicate' ? '#fef9c3' : '#ffe4e6',
              border: `1px solid ${lastScan.status === 'success' ? '#86efac'
                : lastScan.status === 'duplicate' ? '#fde047' : '#fca5a5'}`,
            }}>
            {lastScan.status === 'success'
              ? <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#16a34a' }} />
              : lastScan.status === 'duplicate'
              ? <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
              : <XCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
            }
            <div>
              {lastScan.rollNo && <p className="font-bold text-sm text-gray-800">{lastScan.rollNo}</p>}
              {lastScan.name && <p className="text-xs text-gray-600">{lastScan.name}</p>}
              <p className="text-sm font-medium mt-0.5"
                style={{ color: lastScan.status === 'success' ? '#15803d' : lastScan.status === 'duplicate' ? '#92400e' : '#be123c' }}>
                {lastScan.message}
              </p>
              {lastScan.status === 'success' && (
                <p className="text-xs text-gray-500 mt-0.5">Room {lastScan.room} · Seat {lastScan.seat} · {lastScan.time}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right: Scan log */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <UserCheck className="w-4 h-4" style={{ color: '#16a34a' }} />
            Scan Log
            <span className="px-2 py-0.5 rounded-full text-xs font-bold"
              style={{ background: '#dcfce7', color: '#15803d' }}>
              {scanLog.length}
            </span>
          </h3>
          {scanLog.length > 0 && (
            <button onClick={clearLog} className="text-xs text-gray-400 hover:text-gray-600">Clear</button>
          )}
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #bbf7d0', maxHeight: '520px', overflowY: 'auto' }}>
          {scanLog.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <ScanLine className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No scans yet</p>
            </div>
          ) : (
            <table className="w-full text-sm bg-white">
              <thead>
                <tr style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', borderBottom: '2px solid #bbf7d0' }}>
                  <th className="px-4 py-2.5 text-left text-xs font-bold uppercase" style={{ color: '#15803d' }}>Roll No</th>
                  <th className="px-4 py-2.5 text-left text-xs font-bold uppercase" style={{ color: '#15803d' }}>Room</th>
                  <th className="px-4 py-2.5 text-left text-xs font-bold uppercase" style={{ color: '#15803d' }}>Seat</th>
                  <th className="px-4 py-2.5 text-left text-xs font-bold uppercase" style={{ color: '#15803d' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {scanLog.map((entry, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f0fdf4', background: i % 2 === 0 ? 'white' : '#f9fefb' }}>
                    <td className="px-4 py-2.5 font-mono font-semibold text-gray-800 text-xs">{entry.rollNo}</td>
                    <td className="px-4 py-2.5 text-gray-600 text-xs">{entry.room}</td>
                    <td className="px-4 py-2.5 text-gray-600 text-xs">{entry.seat}</td>
                    <td className="px-4 py-2.5 text-gray-400 text-xs">{entry.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Progress bar */}
        {selectedExam && totalStudents > 0 && (
          <div className="mt-4 p-4 rounded-xl" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-gray-700">Attendance Progress</span>
              <span className="font-bold" style={{ color: '#15803d' }}>
                {Math.round((markedPresent / totalStudents) * 100)}%
              </span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: '#dcfce7' }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(markedPresent / totalStudents) * 100}%`,
                  background: 'linear-gradient(90deg,#16a34a,#4ade80)',
                  boxShadow: '0 0 8px rgba(74,222,128,0.5)',
                }} />
            </div>
            <p className="text-xs text-gray-500 mt-1.5">{markedPresent} of {totalStudents} students marked present</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function QRAttendance() {
  const [tab, setTab] = useState('scan');

  return (
    <div className="min-h-screen" style={{ background: '#f0faf4' }}>
      {/* Top bar */}
      <div className="bg-white border-b px-8 py-3 flex items-center justify-between"
        style={{ borderColor: '#d1fae5' }}>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Admin</span>
          <span className="text-gray-300">›</span>
          <span className="font-semibold text-gray-800">QR Attendance</span>
        </div>
        <span className="text-xs text-gray-400">
          {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </div>

      <div className="px-8 py-6 max-w-6xl mx-auto">
        {/* Hero */}
        <div className="page-hero mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">QR Code Attendance</h1>
            <p className="text-green-200 text-sm mt-0.5">
              Generate QR codes for students · Scan to mark attendance instantly
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { step: '1', title: 'Generate QR', desc: 'Each student gets a unique QR code with their exam + seat info', icon: QrCode, color: '#16a34a' },
            { step: '2', title: 'Print & Distribute', desc: 'Print QR codes on admit cards or display on screen', icon: Printer, color: '#0891b2' },
            { step: '3', title: 'Scan & Mark', desc: 'Invigilator scans QR with camera — attendance marked instantly', icon: ScanLine, color: '#7c3aed' },
          ].map(({ step, title, desc, icon: Icon, color }) => (
            <div key={step} className="bg-white rounded-2xl p-4 flex items-start gap-3"
              style={{ border: '1px solid #d1fae5', boxShadow: '0 2px 8px rgba(22,163,74,0.06)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-sm"
                style={{ background: color }}>
                {step}
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit"
          style={{ background: '#dcfce7', border: '1px solid #bbf7d0' }}>
          {[
            { key: 'scan',     label: 'Scan QR',       icon: ScanLine },
            { key: 'generate', label: 'Generate QR',   icon: QrCode },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all"
              style={tab === key ? {
                background: 'linear-gradient(135deg,#16a34a,#15803d)',
                color: 'white',
                boxShadow: '0 2px 8px rgba(22,163,74,0.3)',
              } : {
                color: '#15803d',
              }}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="bg-white rounded-2xl p-6"
          style={{ border: '1px solid #d1fae5', boxShadow: '0 2px 12px rgba(22,163,74,0.06)' }}>
          {tab === 'scan'     && <ScanTab />}
          {tab === 'generate' && <GenerateTab />}
        </div>
      </div>
    </div>
  );
}
