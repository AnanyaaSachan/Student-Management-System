import { useState, useMemo } from 'react';
import { Play, Printer, ChevronDown, CheckCircle, LayoutGrid, List, Table2, FileText, Grid3X3, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { getExams, getStudents, getRooms, getSeatingAllocations, getInvigilationAllocations, getFaculty } from '../data/store';
import { generateSeatingAllocation } from '../data/algorithms';
import { getCourseForSection } from '../data/morningShiftData';

// ── colour palette for course chips ──────────────────────────────────────────
const CHIP_COLORS = [
  'bg-yellow-400 text-yellow-900',
  'bg-green-400 text-green-900',
  'bg-blue-400 text-blue-900',
  'bg-pink-400 text-pink-900',
  'bg-purple-400 text-purple-900',
  'bg-orange-400 text-orange-900',
  'bg-teal-400 text-teal-900',
  'bg-red-400 text-red-900',
];

function chipColor(idx) { return CHIP_COLORS[idx % CHIP_COLORS.length]; }

// ── derive course code for a student in a given exam ─────────────────────────
function getCourse(student, examId) {
  if (!student) return { code: '—', name: '' };
  const isMorning = examId >= 3001 && examId <= 3099;
  if (isMorning) {
    const c = getCourseForSection(examId, student.section);
    if (c) return { code: c.courseCode, name: c.courseName };
  }
  // Evening / fallback — derive from section string
  const s = student.section || '';
  if (s.includes('B.Tech CSE 2024') || s.includes('5Y Int BTech-MTech CSE 2024')) return { code: 'CS202', name: 'Software Engineering' };
  if (s.includes('B.Tech AI 2024'))       return { code: 'AI202', name: 'Machine Learning' };
  if (s.includes('B.Tech ML 2024'))       return { code: 'CM202', name: 'Software Engineering' };
  if (s.includes('B.Tech DS 2024'))       return { code: 'CD202', name: 'Software Engineering' };
  if (s.includes('Cyber Security 2024'))  return { code: 'CC202', name: 'Software Engineering' };
  if (s.includes('B.Tech IT 2024'))       return { code: 'IT202', name: 'Data Structure' };
  if (s.includes('B.Tech ECE VLSI'))      return { code: 'EV202', name: 'Linear Integrated Circuits' };
  if (s.includes('B.Tech ECE AI'))        return { code: 'EA202', name: 'Electromagnetic Field Theory' };
  if (s.includes('B.Tech ECE 2024'))      return { code: 'EC228', name: 'Electromagnetic Field Theory' };
  if (s.includes('BCA 2024'))             return { code: 'BCA202', name: 'Java Programming' };
  if (s.includes('Int BTech CSE 2022'))   return { code: 'CS524', name: 'Computer Vision / SE' };
  if (s.includes('MTech CSE Working'))    return { code: 'WCS524', name: 'Problem Solving Using AI' };
  if (s.includes('MTech CSE'))            return { code: 'CS522', name: 'Advanced Software Engineering' };
  return { code: student.branch || '—', name: '' };
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
}

function toRoman(n) {
  const m = {1:'I',2:'II',3:'III',4:'IV',5:'V',6:'VI',7:'VII',8:'VIII',9:'IX',10:'X'};
  return m[n] || n;
}

// ── group exams by date ───────────────────────────────────────────────────────
function groupByDate(exams) {
  const map = {};
  exams.forEach(e => {
    if (!map[e.date]) map[e.date] = [];
    map[e.date].push(e);
  });
  return map;
}

export default function SeatingAllocation() {
  const allExams    = getExams();
  const allStudents = getStudents();
  const allRooms    = getRooms();
  const allFaculty  = getFaculty();
  const invigilationAllocs = getInvigilationAllocations();

  // ── state ──────────────────────────────────────────────────────────────────
  const [selectedDate,  setSelectedDate]  = useState('');
  const [selectedShift, setSelectedShift] = useState('');   // 'Morning' | 'Evening'
  const [filterCourse,  setFilterCourse]  = useState('ALL');
  const [activeTab,     setActiveTab]     = useState('master'); // master | summary | room | student | roomplan
  const [allocated,     setAllocated]     = useState(false);
  const [error,         setError]         = useState('');
  const [selectedRoomIdx, setSelectedRoomIdx] = useState(0);

  // ── derived ────────────────────────────────────────────────────────────────
  const dateGroups = useMemo(() => groupByDate(allExams), [allExams]);
  const sortedDates = Object.keys(dateGroups).sort();

  // Exams on selected date
  const dateExams = selectedDate ? (dateGroups[selectedDate] || []) : [];
  const morningExams = dateExams.filter(e => e.session === 'Morning');
  const eveningExams = dateExams.filter(e => e.session === 'Evening');

  // Active exam(s) for selected shift
  const activeExams = useMemo(() => {
    if (!selectedDate || !selectedShift) return [];
    return dateExams.filter(e => e.session === selectedShift);
  }, [selectedDate, selectedShift, dateExams]);

  // All allocations for active exams
  const allAllocs = getSeatingAllocations();
  const examAllocs = useMemo(() => {
    const ids = new Set(activeExams.map(e => e.exam_id));
    return allAllocs.filter(a => ids.has(a.exam_id));
  }, [activeExams, allAllocs]);

  // Build student+course map
  const enrichedAllocs = useMemo(() => {
    return examAllocs.map(a => {
      const student = allStudents.find(s => s.student_id === a.student_id);
      const course  = getCourse(student, a.exam_id);
      const room    = allRooms.find(r => r.room_id === a.room_id);
      return { ...a, student, course, room };
    });
  }, [examAllocs, allStudents, allRooms]);

  // Unique courses in this exam set
  const courses = useMemo(() => {
    const map = {};
    enrichedAllocs.forEach(a => {
      if (!map[a.course.code]) map[a.course.code] = { code: a.course.code, name: a.course.name, sem: a.student?.semester };
    });
    return Object.values(map);
  }, [enrichedAllocs]);

  // Filtered allocs
  const filtered = useMemo(() => {
    if (filterCourse === 'ALL') return enrichedAllocs;
    return enrichedAllocs.filter(a => a.course.code === filterCourse);
  }, [enrichedAllocs, filterCourse]);

  // Stats
  const totalEligible = filtered.length;
  const roomsUsed     = new Set(filtered.map(a => a.room_id)).size;
  const isAllocated   = examAllocs.length > 0;

  // Group filtered by room
  const byRoom = useMemo(() => {
    const map = {};
    filtered.forEach(a => {
      if (!map[a.room_id]) map[a.room_id] = { room: a.room, allocs: [] };
      map[a.room_id].allocs.push(a);
    });
    return Object.values(map).sort((a, b) => (a.room?.room_no || '').localeCompare(b.room?.room_no || ''));
  }, [filtered]);

  // ── auto allocate ──────────────────────────────────────────────────────────
  const handleAutoAllocate = () => {
    setError('');
    if (!selectedDate || !selectedShift) return setError('Select a date and shift first.');
    if (activeExams.length === 0) return setError('No exams found for this date/shift.');

    const examStudents = allStudents.filter(s => {
      return activeExams.some(exam => {
        if (exam.session === 'Morning') {
          const c = getCourseForSection(exam.exam_id, s.section);
          return !!c;
        }
        return true; // evening — all students
      });
    });

    const roomIds = allRooms.map(r => r.room_id);
    const studentIds = examStudents.map(s => s.student_id);

    let success = true;
    for (const exam of activeExams) {
      const examStudentIds = allStudents
        .filter(s => {
          if (exam.session === 'Morning') return !!getCourseForSection(exam.exam_id, s.section);
          return true;
        })
        .map(s => s.student_id);

      const res = generateSeatingAllocation(exam.exam_id, examStudentIds, roomIds);
      if (!res.success) { setError(res.message); success = false; break; }
    }
    if (success) setAllocated(true);
  };

  const handleClear = () => {
    setSelectedShift('');
    setFilterCourse('ALL');
    setAllocated(false);
    setError('');
    setActiveTab('master');
  };


  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Admin</span>
          <span className="text-gray-300">›</span>
          <span className="font-semibold text-gray-800">Seating Allocation</span>
        </div>
        <span className="text-xs text-gray-400">
          {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </div>

      <div className="px-8 py-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Seating Allocation</h1>

        {/* ── Step 1: Select Exam Date ── */}
        <div className="bg-white rounded-xl border border-gray-200 mb-4">
          <div className="px-5 py-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Select Exam Date</p>
          </div>
          <div className="px-5 py-3">
            <div className="relative">
              <select
                value={selectedDate}
                onChange={e => { setSelectedDate(e.target.value); setSelectedShift(''); setFilterCourse('ALL'); setAllocated(false); }}
                className="w-full appearance-none bg-transparent text-sm font-semibold text-gray-800 focus:outline-none cursor-pointer pr-8"
              >
                <option value="">— Choose a date —</option>
                {sortedDates.map(d => (
                  <option key={d} value={d}>
                    {formatDate(d)}  —  {dateGroups[d].length} exam{dateGroups[d].length > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            {selectedDate && (
              <p className="text-xs text-gray-400 mt-1">
                {dateGroups[selectedDate]?.length} exam{dateGroups[selectedDate]?.length > 1 ? 's' : ''} on this date
              </p>
            )}
          </div>
        </div>

        {/* ── Step 2: Select Shift ── */}
        {selectedDate && (
          <div className="bg-white rounded-xl border border-gray-200 mb-4">
            <div className="px-5 py-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Select Shift</p>
            </div>
            <div className="px-5 py-4 flex items-center gap-3 flex-wrap">
              {/* Morning button */}
              <button
                onClick={() => { setSelectedShift('Morning'); setFilterCourse('ALL'); setAllocated(false); }}
                disabled={morningExams.length === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                  selectedShift === 'Morning'
                    ? 'bg-amber-400 border-amber-400 text-amber-900 shadow-sm'
                    : morningExams.length === 0
                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-amber-400 hover:bg-amber-50'
                }`}
              >
                <span className="text-base">☀</span>
                Shift 1 (Morning)
                {morningExams.length > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${selectedShift === 'Morning' ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {morningExams.length} exam{morningExams.length > 1 ? 's' : ''}
                  </span>
                )}
              </button>

              {/* Evening button */}
              <button
                onClick={() => { setSelectedShift('Evening'); setFilterCourse('ALL'); setAllocated(false); }}
                disabled={eveningExams.length === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                  selectedShift === 'Evening'
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                    : eveningExams.length === 0
                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-indigo-400 hover:bg-indigo-50'
                }`}
              >
                <span className="text-base">🌙</span>
                Shift 2 (Evening)
                {eveningExams.length > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${selectedShift === 'Evening' ? 'bg-indigo-400 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {eveningExams.length} exam{eveningExams.length > 1 ? 's' : ''}
                  </span>
                )}
              </button>

              {/* Auto Allocate + Clear */}
              <div className="ml-auto flex gap-2">
                <button
                  onClick={handleAutoAllocate}
                  disabled={!selectedShift}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Auto Allocate
                </button>
                <button
                  onClick={handleClear}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>
            </div>
            {error && <p className="px-5 pb-3 text-xs text-rose-600">{error}</p>}
          </div>
        )}

        {/* ── Course filter chips ── */}
        {selectedShift && activeExams.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">
              Exams on {formatDate(selectedDate)} — click to filter:
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterCourse('ALL')}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  filterCourse === 'ALL'
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'
                }`}
              >
                All Exams
              </button>
              {courses.map((c, i) => (
                <button
                  key={c.code}
                  onClick={() => setFilterCourse(c.code)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                    filterCourse === c.code
                      ? `${chipColor(i)} border-transparent`
                      : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'
                  }`}
                >
                  {c.code}
                  <span className={`w-2 h-2 rounded-full ${chipColor(i).split(' ')[0]}`} />
                  {c.sem ? `Sem ${toRoman(c.sem)}` : ''}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Stats bar ── */}
        {selectedShift && (
          <div className="flex items-center gap-6 mb-4 text-sm text-gray-600">
            <span>
              <span className="font-semibold text-gray-800">{totalEligible}</span> Total Eligible
            </span>
            <span className="text-gray-300">|</span>
            <span>
              <span className="font-semibold text-gray-800">{isAllocated ? totalEligible : 0}</span> Allocated
            </span>
            <span className="text-gray-300">|</span>
            <span>
              <span className="font-semibold text-gray-800">{isAllocated ? roomsUsed : 0}</span> Rooms Used
            </span>
            {isAllocated && (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                <CheckCircle className="w-3 h-3" /> Allocated
              </span>
            )}
          </div>
        )}

        {/* ── Tabs ── */}
        {isAllocated && byRoom.length > 0 && (
          <div>
            {/* Tab bar */}
            <div className="flex gap-1 mb-4 border-b border-gray-200">
              {[
                { key: 'master',   label: 'Seating Plan',   icon: LayoutGrid },
                { key: 'summary',  label: 'Master Summary', icon: Table2 },
                { key: 'room',     label: 'Room Summary',   icon: List },
                { key: 'student',  label: 'Student List',   icon: FileText },
                { key: 'roomplan', label: 'Room Plan',      icon: Grid3X3 },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === key
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* ── MASTER SUMMARY TAB ── */}
            {activeTab === 'master' && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Card header */}
                <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Gautam Buddha University</p>
                  <h2 className="text-xl font-bold text-gray-900">Master Seating Plan</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{formatDate(selectedDate)}</p>

                  {/* Course legend */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {courses.map((c, i) => (
                      <span key={c.code} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${chipColor(i)}`}>
                        {c.code}
                        <span className="w-2 h-2 rounded-full bg-white opacity-60" />
                      </span>
                    ))}
                  </div>
                </div>

                {/* Print all rooms button */}
                <div className="px-6 py-3 border-b border-gray-100 flex justify-end">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Printer className="w-4 h-4" />
                    Print All Rooms
                  </button>
                </div>

                {/* Room cards grid */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {byRoom.map(({ room, allocs }) => {
                    // group allocs by course for colour coding
                    const courseSet = [...new Set(allocs.map(a => a.course.code))];
                    return (
                      <div key={room?.room_id} className="border border-gray-200 rounded-xl overflow-hidden">
                        {/* Room header */}
                        <div className="bg-gray-800 text-white px-4 py-2.5 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-sm">Room {room?.room_no}</p>
                            <p className="text-xs text-gray-400">{room?.building}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-400">{allocs.length}/{room?.capacity} seats</p>
                            <div className="flex gap-1 mt-1 justify-end">
                              {courseSet.map((code, i) => {
                                const idx = courses.findIndex(c => c.code === code);
                                return <span key={code} className={`text-xs px-1.5 py-0.5 rounded font-semibold ${chipColor(idx >= 0 ? idx : i)}`}>{code}</span>;
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Seat grid — alternating columns like real seating plan */}
                        <div className="p-3 max-h-56 overflow-y-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-gray-400 border-b border-gray-100">
                                <th className="text-left pb-1 font-medium">Seat</th>
                                <th className="text-left pb-1 font-medium">Roll No</th>
                                <th className="text-left pb-1 font-medium">Course</th>
                              </tr>
                            </thead>
                            <tbody>
                              {allocs
                                .sort((a, b) => a.seat_no - b.seat_no)
                                .map((a, i) => {
                                  const idx = courses.findIndex(c => c.code === a.course.code);
                                  return (
                                    <tr key={a.allocation_id} className="border-b border-gray-50 last:border-0">
                                      <td className="py-0.5 text-gray-400 w-8">{a.seat_no}</td>
                                      <td className="py-0.5 font-medium text-gray-700">{a.student?.roll_no}</td>
                                      <td className="py-0.5">
                                        <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${chipColor(idx >= 0 ? idx : i)}`}>
                                          {a.course.code}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── SUMMARY TAB ── */}
            {activeTab === 'summary' && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-bold text-gray-900">Master Summary</h2>
                  <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-600 hover:bg-gray-50">
                    <Printer className="w-3.5 h-3.5" /> Print
                  </button>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Programme</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Sem</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Course</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Students</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Roll Range</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const groups = {};
                      filtered.forEach(a => {
                        const key = `${a.student?.section}||${a.course.code}`;
                        if (!groups[key]) groups[key] = { section: a.student?.section, sem: a.student?.semester, course: a.course, rolls: [] };
                        groups[key].rolls.push(a.student?.roll_no);
                      });
                      return Object.values(groups).map((g, i) => (
                        <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                          <td className="px-4 py-3 text-xs text-gray-700 font-medium">{g.section}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{toRoman(g.sem)}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${chipColor(i)}`}>{g.course.code}</span>
                            <span className="ml-2 text-xs text-gray-400">{g.course.name}</span>
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-gray-800">{g.rolls.length}</td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {g.rolls[0]} → {g.rolls[g.rolls.length - 1]}
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100 border-t-2 border-gray-300 font-bold">
                      <td className="px-4 py-3 text-gray-800" colSpan={3}>TOTAL</td>
                      <td className="px-4 py-3 text-center text-indigo-700 text-base">{totalEligible}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* ── ROOM SUMMARY TAB ── */}
            {activeTab === 'room' && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-bold text-gray-900">Room Summary</h2>
                  <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-600 hover:bg-gray-50">
                    <Printer className="w-3.5 h-3.5" /> Print
                  </button>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Room</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Building</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Capacity</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Allocated</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Courses</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Roll Range</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byRoom.map(({ room, allocs }, i) => {
                      const roomCourses = [...new Set(allocs.map(a => a.course.code))];
                      const rolls = allocs.map(a => a.student?.roll_no).filter(Boolean);
                      const pct = room?.capacity ? Math.round((allocs.length / room.capacity) * 100) : 0;
                      return (
                        <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                          <td className="px-4 py-3 font-bold text-gray-800">{room?.room_no}</td>
                          <td className="px-4 py-3 text-gray-600 text-xs">{room?.building}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{room?.capacity}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="font-semibold text-gray-800">{allocs.length}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {roomCourses.map((code, j) => {
                                const idx = courses.findIndex(c => c.code === code);
                                return <span key={code} className={`px-1.5 py-0.5 rounded text-xs font-bold ${chipColor(idx >= 0 ? idx : j)}`}>{code}</span>;
                              })}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {rolls[0]} → {rolls[rolls.length - 1]}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── STUDENT LIST TAB ── */}
            {activeTab === 'student' && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-bold text-gray-900">Student List — {totalEligible} students</h2>
                  <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-600 hover:bg-gray-50">
                    <Printer className="w-3.5 h-3.5" /> Print
                  </button>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">#</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Roll No</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Programme</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Sem</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Course</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Room</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Seat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered
                      .sort((a, b) => (a.student?.roll_no || '').localeCompare(b.student?.roll_no || '', undefined, { numeric: true }))
                      .map((a, i) => {
                        const idx = courses.findIndex(c => c.code === a.course.code);
                        return (
                          <tr key={a.allocation_id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                            <td className="px-4 py-2.5 text-gray-400 text-xs">{i + 1}</td>
                            <td className="px-4 py-2.5 font-mono font-semibold text-gray-800 text-xs">{a.student?.roll_no}</td>
                            <td className="px-4 py-2.5 text-xs text-gray-600">{a.student?.section}</td>
                            <td className="px-4 py-2.5 text-center text-gray-600 text-xs">{toRoman(a.student?.semester)}</td>
                            <td className="px-4 py-2.5">
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${chipColor(idx >= 0 ? idx : i)}`}>{a.course.code}</span>
                            </td>
                            <td className="px-4 py-2.5 font-semibold text-gray-700 text-xs">{a.room?.room_no}</td>
                            <td className="px-4 py-2.5 text-center text-gray-600 text-xs">{a.seat_no}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── ROOM PLAN TAB (Fig 2.3 — physical desk grid) ── */}
            {activeTab === 'roomplan' && (() => {
              const roomList = byRoom;
              if (roomList.length === 0) return <div className="text-center text-gray-400 py-12">No rooms allocated.</div>;
              const safeIdx = Math.min(selectedRoomIdx, roomList.length - 1);
              const { room, allocs: roomAllocs } = roomList[safeIdx];

              // Get invigilators for this room (from any active exam)
              const activeExamIds = new Set(activeExams.map(e => e.exam_id));
              const roomInvigilators = invigilationAllocs
                .filter(d => activeExamIds.has(d.exam_id) && d.room_id === room?.room_id)
                .map(d => allFaculty.find(f => f.faculty_id === d.faculty_id))
                .filter(Boolean);

              // Sort allocs by seat number
              const sorted = [...roomAllocs].sort((a, b) => a.seat_no - b.seat_no);

              // Build desk grid: 6 desks across, rows down
              // Each desk column holds students in order
              const DESKS = 6;
              const rows = Math.ceil(sorted.length / DESKS);
              // Fill grid[row][desk] = alloc | null
              const grid = Array.from({ length: rows }, (_, r) =>
                Array.from({ length: DESKS }, (_, d) => sorted[r * DESKS + d] || null)
              );

              // Summary table: group by section+course
              const summaryGroups = {};
              roomAllocs.forEach(a => {
                const key = `${a.student?.branch}||${a.course.code}`;
                if (!summaryGroups[key]) summaryGroups[key] = {
                  branch: a.student?.branch,
                  section: a.student?.section,
                  sem: a.student?.semester,
                  batch: '',
                  course: a.course,
                  rolls: [],
                };
                summaryGroups[key].rolls.push(a.student?.roll_no);
              });
              const summaryRows = Object.values(summaryGroups);

              return (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {/* Room navigator */}
                  <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-gray-50">
                    <button
                      onClick={() => setSelectedRoomIdx(Math.max(0, safeIdx - 1))}
                      disabled={safeIdx === 0}
                      className="p-1.5 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-30"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <div className="flex items-center gap-2 flex-wrap justify-center">
                      {roomList.map(({ room: r }, i) => (
                        <button
                          key={r?.room_id}
                          onClick={() => setSelectedRoomIdx(i)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                            i === safeIdx
                              ? 'bg-gray-900 text-white border-gray-900'
                              : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'
                          }`}
                        >
                          {r?.room_no}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setSelectedRoomIdx(Math.min(roomList.length - 1, safeIdx + 1))}
                      disabled={safeIdx === roomList.length - 1}
                      className="p-1.5 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-30"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>

                  {/* Room header — matches Fig 2.3 */}
                  <div className="text-center py-5 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">SEATING PLAN (SOICT)</p>
                    <h2 className="text-2xl font-bold text-gray-900">Room No - {room?.room_no}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {selectedShift === 'Morning' ? 'Shift 1 (Morning)' : 'Shift 2 (Evening)'} &nbsp;·&nbsp; {selectedDate}
                    </p>

                    {/* Invigilators */}
                    {roomInvigilators.length > 0 && (
                      <div className="flex items-center justify-center gap-4 mt-3 flex-wrap">
                        {roomInvigilators.map((f, i) => (
                          <span key={f.faculty_id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-800">
                            <User className="w-3 h-3" />
                            {f.name}
                            <span className="text-indigo-400 font-normal">({i === 0 ? 'Chief' : 'Assistant'})</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Print button */}
                    <div className="mt-3">
                      <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-600 hover:bg-gray-50">
                        <Printer className="w-3.5 h-3.5" /> Print Room
                      </button>
                    </div>
                  </div>

                  {/* WHITE BOARD label */}
                  <div className="mx-6 mt-4 mb-2">
                    <div className="border-2 border-gray-300 rounded-lg py-1.5 text-center">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">WHITE BOARD</span>
                    </div>
                  </div>

                  {/* Desk grid */}
                  <div className="px-6 pb-4 overflow-x-auto">
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr>
                          {Array.from({ length: DESKS }, (_, d) => (
                            <th key={d} className="px-2 py-2 text-center font-bold text-gray-600 bg-gray-50 border border-gray-200 text-xs">
                              DESK-{d + 1}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {grid.map((row, r) => (
                          <tr key={r}>
                            {row.map((alloc, d) => {
                              if (!alloc) return <td key={d} className="border border-gray-100 px-1 py-1.5" />;
                              const idx = courses.findIndex(c => c.code === alloc.course.code);
                              const colors = [
                                'bg-blue-100 text-blue-800 border-blue-200',
                                'bg-yellow-100 text-yellow-800 border-yellow-200',
                                'bg-green-100 text-green-800 border-green-200',
                                'bg-pink-100 text-pink-800 border-pink-200',
                                'bg-purple-100 text-purple-800 border-purple-200',
                                'bg-orange-100 text-orange-800 border-orange-200',
                                'bg-teal-100 text-teal-800 border-teal-200',
                                'bg-red-100 text-red-800 border-red-200',
                              ];
                              const cellColor = colors[(idx >= 0 ? idx : d) % colors.length];
                              return (
                                <td key={d} className={`border px-1 py-1.5 text-center font-mono font-semibold ${cellColor}`}>
                                  {alloc.student?.roll_no}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary table — matches Fig 2.3 bottom table */}
                  <div className="mx-6 mb-6 border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-500 uppercase">Room No</th>
                          <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-500 uppercase">Programme</th>
                          <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-500 uppercase">Semester</th>
                          <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-500 uppercase">Batch</th>
                          <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-500 uppercase">From</th>
                          <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-500 uppercase">To</th>
                          <th className="px-4 py-2.5 text-center text-xs font-bold text-gray-500 uppercase">No. of Students</th>
                          <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-500 uppercase">Paper Code</th>
                          <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-500 uppercase">Course Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summaryRows.map((g, i) => {
                          const sortedRolls = [...g.rolls].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
                          const idx = courses.findIndex(c => c.code === g.course.code);
                          // Extract batch from section string
                          const batchMatch = g.section?.match(/\((\d{4}-\d{4})\)/);
                          const batch = batchMatch ? batchMatch[1] : '—';
                          return (
                            <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                              <td className="px-4 py-2.5 font-bold text-gray-800">{room?.room_no}</td>
                              <td className="px-4 py-2.5">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${chipColor(idx >= 0 ? idx : i)}`}>
                                  {g.branch}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-gray-600">{g.sem}</td>
                              <td className="px-4 py-2.5 text-gray-600 text-xs">{batch}</td>
                              <td className="px-4 py-2.5 font-mono text-xs text-gray-700">{sortedRolls[0]}</td>
                              <td className="px-4 py-2.5 font-mono text-xs text-gray-700">{sortedRolls[sortedRolls.length - 1]}</td>
                              <td className="px-4 py-2.5 text-center font-bold text-gray-800">{g.rolls.length}</td>
                              <td className="px-4 py-2.5">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${chipColor(idx >= 0 ? idx : i)}`}>
                                  {g.course.code}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-xs text-gray-600">{g.course.name}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50 border-t-2 border-gray-300 font-bold">
                          <td className="px-4 py-2.5 text-gray-800" colSpan={6}>Total</td>
                          <td className="px-4 py-2.5 text-center text-indigo-700 text-base">{roomAllocs.length}</td>
                          <td colSpan={2} />
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Empty state */}
        {selectedShift && !isAllocated && (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <LayoutGrid className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No seating plan yet</p>
            <p className="text-gray-400 text-sm mt-1">Click <strong>Auto Allocate</strong> to generate the seating plan for this shift</p>
          </div>
        )}
      </div>
    </div>
  );
}
