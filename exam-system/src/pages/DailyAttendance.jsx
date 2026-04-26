import { useState, useMemo, useRef } from 'react';
import { Printer, Save, ChevronDown, ChevronUp } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import {
  getExams, getStudents, getSeatingAllocations,
  getAttendance, saveAttendance,
} from '../data/store';
import { getCourseForSection } from '../data/morningShiftData';

// ── Evening shift course lookup (hardcoded from seating plan) ─────────────────
function getEveningCourse(student) {
  const s = student?.section || '';
  const b = student?.branch  || '';
  const courseMap = [
    { match: s.includes('B.Tech CSE 2024') || s.includes('5Y Int BTech-MTech CSE 2024'), code: 'CS202', name: 'Software Engineering' },
    { match: s.includes('B.Tech AI 2024'),        code: 'AI202', name: 'Machine Learning' },
    { match: s.includes('B.Tech ML 2024'),         code: 'CM202', name: 'Software Engineering' },
    { match: s.includes('B.Tech DS 2024'),         code: 'CD202', name: 'Software Engineering' },
    { match: s.includes('Cyber Security 2024'),    code: 'CC202', name: 'Software Engineering' },
    { match: s.includes('B.Tech IT 2024'),         code: 'IT202', name: 'Data Structure' },
    { match: s.includes('B.Tech ECE VLSI'),        code: 'EV202', name: 'Linear Integrated Circuits' },
    { match: s.includes('B.Tech ECE AI'),          code: 'EA202', name: 'Electromagnetic Field Theory' },
    { match: s.includes('B.Tech ECE 2024'),        code: 'EC228', name: 'Electromagnetic Field Theory' },
    { match: s.includes('BCA 2024'),               code: 'BCA202', name: 'Fundamental of Java Programming' },
    { match: s.includes('Int BTech CSE 2022') && b === 'ICS', code: 'CS524', name: 'Computer Vision / Stat. Foundations / Adv. SE' },
    { match: s.includes('Int BTech ECE'),          code: 'MA402', name: 'Modeling and Simulation' },
    { match: s.includes('MTech CSE Working'),      code: 'WCS524', name: 'Problem Solving Using AI' },
    { match: s.includes('MTech CSE'),              code: 'CS522', name: 'Advanced Software Engineering' },
  ];
  const found = courseMap.find(c => c.match);
  return found ? { courseCode: found.code, courseName: found.name } : { courseCode: b || '—', courseName: '' };
}

function toRoman(n) {
  const map = { 1:'I',2:'II',3:'III',4:'IV',5:'V',6:'VI',7:'VII',8:'VIII',9:'IX',10:'X' };
  return map[n] || String(n);
}

export default function DailyAttendance() {
  const exams     = getExams();
  const students  = getStudents();
  const allAllocs = getSeatingAllocations();

  const [selectedExam, setSelectedExam] = useState('');
  const [attendance, setAttendance]     = useState({});
  const [saved, setSaved]               = useState(false);
  const [expanded, setExpanded]         = useState({});
  const printRef = useRef();

  const isMorning = (examId) => Number(examId) >= 3001 && Number(examId) <= 3009;

  // Load saved attendance
  const loadSaved = (examId) => {
    const att = getAttendance();
    const ids = new Set(allAllocs.filter(a => a.exam_id === Number(examId)).map(a => a.allocation_id));
    const map = {};
    att.forEach(a => { if (ids.has(a.allocation_id)) map[a.allocation_id] = a.status; });
    setAttendance(map);
    setSaved(false);
  };

  const handleExamChange = (examId) => {
    setSelectedExam(examId);
    setExpanded({});
    if (examId) loadSaved(examId);
    else setAttendance({});
    setSaved(false);
  };

  // Build groups
  const groups = useMemo(() => {
    if (!selectedExam) return [];
    const examId = Number(selectedExam);
    const examAllocs = allAllocs.filter(a => a.exam_id === examId);
    const map = {};

    examAllocs.forEach(alloc => {
      const student = students.find(s => s.student_id === alloc.student_id);
      if (!student) return;

      let courseCode, courseName;
      if (isMorning(examId)) {
        const c = getCourseForSection(examId, student.section);
        if (!c) return; // this student's section has no exam today — skip
        courseCode = c.courseCode;
        courseName = c.courseName;
      } else {
        const c = getEveningCourse(student);
        courseCode = c.courseCode;
        courseName = c.courseName;
      }

      const key = `${student.section}||${student.semester}||${courseCode}`;
      if (!map[key]) {
        map[key] = { key, programme: student.section, semester: student.semester, courseCode, courseName, allocs: [] };
      }
      map[key].allocs.push({ alloc, student });
    });

    return Object.values(map).sort((a, b) =>
      a.programme.localeCompare(b.programme) || a.semester - b.semester
    );
  }, [selectedExam, students, allAllocs]);

  const toggle = (allocId) => {
    setAttendance(prev => ({ ...prev, [allocId]: prev[allocId] === 'Present' ? 'Absent' : 'Present' }));
    setSaved(false);
  };

  const markGroup = (allocs, status) => {
    const patch = {};
    allocs.forEach(({ alloc }) => { patch[alloc.allocation_id] = status; });
    setAttendance(prev => ({ ...prev, ...patch }));
    setSaved(false);
  };

  const markAll = (status) => {
    const patch = {};
    groups.forEach(g => g.allocs.forEach(({ alloc }) => { patch[alloc.allocation_id] = status; }));
    setAttendance(prev => ({ ...prev, ...patch }));
    setSaved(false);
  };

  const handleSave = () => {
    const ids = new Set(allAllocs.filter(a => a.exam_id === Number(selectedExam)).map(a => a.allocation_id));
    const existing = getAttendance().filter(a => !ids.has(a.allocation_id));
    const newEntries = Object.entries(attendance).map(([allocId, status]) => ({
      attendance_id: Date.now() + Math.random(),
      allocation_id: Number(allocId),
      status,
    }));
    saveAttendance([...existing, ...newEntries]);
    setSaved(true);
  };

  const totalStudents = groups.reduce((s, g) => s + g.allocs.length, 0);
  const totalPresent  = groups.reduce((s, g) =>
    s + g.allocs.filter(({ alloc }) => attendance[alloc.allocation_id] === 'Present').length, 0);
  const totalAbsent   = totalStudents - totalPresent;
  const exam = exams.find(e => e.exam_id === Number(selectedExam));

  // Sort exams: morning first by date, then evening
  const sortedExams = [...exams].sort((a, b) => {
    if (a.session === b.session) return a.date.localeCompare(b.date);
    return a.session === 'Morning' ? -1 : 1;
  });

  return (
    <div className="p-8">
      <PageHeader
        title="Daily Attendance Sheet"
        subtitle="Programme-wise attendance summary with absent roll numbers"
        action={
          <div className="flex gap-2">
            <button onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Printer className="w-4 h-4" /> Print
            </button>
            {selectedExam && (
              <button onClick={handleSave}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${saved ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                <Save className="w-4 h-4" />
                {saved ? 'Saved ✓' : 'Save Attendance'}
              </button>
            )}
          </div>
        }
      />

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <select value={selectedExam} onChange={e => handleExamChange(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-80">
          <option value="">— Select Exam / Date —</option>
          <optgroup label="Morning Shift (10:00am – 11:30am)">
            {sortedExams.filter(e => e.session === 'Morning').map(e => (
              <option key={e.exam_id} value={e.exam_id}>{e.date} · {e.exam_name}</option>
            ))}
          </optgroup>
          <optgroup label="Evening Shift (03:00pm – 04:30pm)">
            {sortedExams.filter(e => e.session === 'Evening').map(e => (
              <option key={e.exam_id} value={e.exam_id}>{e.date} · {e.exam_name}</option>
            ))}
          </optgroup>
        </select>

        {selectedExam && (
          <div className="flex gap-2">
            <button onClick={() => markAll('Present')}
              className="px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs font-medium hover:bg-green-200">
              Mark All Present
            </button>
            <button onClick={() => markAll('Absent')}
              className="px-3 py-1.5 rounded-lg bg-rose-100 text-rose-700 text-xs font-medium hover:bg-rose-200">
              Mark All Absent
            </button>
          </div>
        )}
      </div>

      {selectedExam && groups.length > 0 && (
        <div ref={printRef}>
          {/* Print header */}
          <div className="hidden print:block mb-6 text-center border-b pb-4">
            <h1 className="text-xl font-bold">Gautam Buddha University</h1>
            <p className="text-sm text-gray-600">School of Information and Communication Technology</p>
            <p className="text-base font-semibold mt-1">{exam?.exam_name}</p>
            <p className="text-sm">Date: {exam?.date} &nbsp;|&nbsp; Shift: {exam?.session} ({exam?.session === 'Morning' ? '10:00am – 11:30am' : '03:00pm – 04:30pm'})</p>
            <p className="text-sm font-bold mt-1">Daily Attendance Sheet</p>
          </div>

          {/* Summary bar */}
          <div className="flex gap-6 mb-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100 print:hidden">
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-700">{totalStudents}</p>
              <p className="text-xs text-indigo-500">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{totalPresent}</p>
              <p className="text-xs text-green-500">Present</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-rose-600">{totalAbsent}</p>
              <p className="text-xs text-rose-500">Absent</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-700">
                {totalStudents > 0 ? Math.round((totalPresent / totalStudents) * 100) : 0}%
              </p>
              <p className="text-xs text-gray-400">Attendance %</p>
            </div>
            <div className="ml-auto text-right text-xs text-gray-400 self-center">
              <p className="font-medium text-gray-600">{exam?.session} Shift</p>
              <p>{exam?.date}</p>
            </div>
          </div>

          {/* Main table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Programme, Batch &amp; Semester</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase w-16">Sem</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase w-32">Subject</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-green-700 uppercase w-20">Present</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-rose-600 uppercase w-20">Absent</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase w-16">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Absent Roll Numbers</th>
                  <th className="px-4 py-3 w-20 print:hidden"></th>
                </tr>
              </thead>
              <tbody>
                {groups.map((g, idx) => {
                  const present = g.allocs.filter(({ alloc }) => attendance[alloc.allocation_id] === 'Present').length;
                  const absent  = g.allocs.length - present;
                  const absentRolls = g.allocs
                    .filter(({ alloc }) => attendance[alloc.allocation_id] !== 'Present')
                    .map(({ student }) => student?.roll_no).filter(Boolean);
                  const isExpanded = expanded[g.key];

                  return [
                    <tr key={g.key}
                      className={`border-b border-gray-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                      <td className="px-4 py-3 font-medium text-gray-800 text-xs leading-snug">{g.programme}</td>
                      <td className="px-4 py-3 text-center text-gray-600 font-semibold text-xs">{g.semester === 0 ? '—' : toRoman(g.semester)}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-gray-800 text-xs">{g.courseCode}</div>
                        <div className="text-xs text-gray-400 leading-tight">{g.courseName}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center min-w-8 h-7 px-2 rounded-lg bg-green-100 text-green-700 font-bold text-sm">{present}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center justify-center min-w-8 h-7 px-2 rounded-lg font-bold text-sm ${absent > 0 ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-400'}`}>{absent}</span>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-gray-700">{g.allocs.length}</td>
                      <td className="px-4 py-3 text-xs text-rose-700 max-w-sm break-words">
                        {absentRolls.length === 0
                          ? <span className="text-gray-300 italic">#N/A</span>
                          : absentRolls.join(', ')}
                      </td>
                      <td className="px-4 py-3 text-center print:hidden">
                        <button onClick={() => setExpanded(prev => ({ ...prev, [g.key]: !prev[g.key] }))}
                          className="flex items-center gap-1 mx-auto px-2 py-1 rounded text-xs text-indigo-600 hover:bg-indigo-50 font-medium">
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          {isExpanded ? 'Hide' : 'Mark'}
                        </button>
                      </td>
                    </tr>,

                    isExpanded && (
                      <tr key={`${g.key}-exp`} className="bg-indigo-50 border-b border-indigo-100 print:hidden">
                        <td colSpan={8} className="px-6 py-4">
                          <div className="flex items-center gap-3 mb-3 flex-wrap">
                            <span className="text-xs font-bold text-indigo-800">{g.programme} — {g.courseCode}</span>
                            <button onClick={() => markGroup(g.allocs, 'Present')}
                              className="px-2.5 py-1 rounded bg-green-100 text-green-700 text-xs font-medium hover:bg-green-200">All Present</button>
                            <button onClick={() => markGroup(g.allocs, 'Absent')}
                              className="px-2.5 py-1 rounded bg-rose-100 text-rose-700 text-xs font-medium hover:bg-rose-200">All Absent</button>
                            <span className="text-xs text-indigo-500 ml-auto">{present} present · {absent} absent</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {g.allocs
                              .sort((a, b) => (a.student?.roll_no || '').localeCompare(b.student?.roll_no || '', undefined, { numeric: true }))
                              .map(({ alloc, student }) => {
                                const status = attendance[alloc.allocation_id];
                                return (
                                  <button key={alloc.allocation_id} onClick={() => toggle(alloc.allocation_id)}
                                    className={`px-2 py-1 rounded text-xs font-medium border transition-all ${
                                      status === 'Present' ? 'bg-green-100 border-green-400 text-green-800'
                                      : status === 'Absent' ? 'bg-rose-100 border-rose-400 text-rose-800'
                                      : 'bg-white border-gray-300 text-gray-500 hover:border-indigo-400'
                                    }`}>
                                    {student?.roll_no || `#${alloc.allocation_id}`}
                                    <span className="ml-0.5 opacity-70">{status === 'Present' ? '✓' : status === 'Absent' ? '✗' : '?'}</span>
                                  </button>
                                );
                              })}
                          </div>
                          <p className="text-xs text-indigo-400 mt-2">Green ✓ = Present · Red ✗ = Absent · Grey ? = Unmarked (counts as absent)</p>
                        </td>
                      </tr>
                    ),
                  ];
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 border-t-2 border-gray-300 font-bold">
                  <td className="px-4 py-3 text-gray-800" colSpan={3}>GRAND TOTAL</td>
                  <td className="px-4 py-3 text-center text-green-700 text-base">{totalPresent}</td>
                  <td className="px-4 py-3 text-center text-rose-600 text-base">{totalAbsent}</td>
                  <td className="px-4 py-3 text-center text-gray-800 text-base">{totalStudents}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    Overall Attendance: {totalStudents > 0 ? Math.round((totalPresent / totalStudents) * 100) : 0}%
                  </td>
                  <td className="print:hidden" />
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Print signature */}
          <div className="hidden print:flex justify-between mt-12 pt-4 border-t border-gray-400 text-sm">
            <div className="text-center w-48"><div className="border-b border-gray-400 mb-1 h-8" /><p>Exam Controller</p></div>
            <div className="text-center w-48"><div className="border-b border-gray-400 mb-1 h-8" /><p>Deputy Controller</p></div>
            <div className="text-center w-48"><div className="border-b border-gray-400 mb-1 h-8" /><p>Prepared By</p></div>
          </div>
        </div>
      )}

      {selectedExam && groups.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          No allocations found for this exam date. The seating plan may not be loaded yet.
        </div>
      )}
    </div>
  );
}
