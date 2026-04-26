import { useState } from 'react';
import { Printer, Save } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import {
  getExams,
  getRooms,
  getStudents,
  getFaculty,
  getSeatingAllocations,
  getInvigilationAllocations,
  getAttendance,
  saveAttendance,
} from '../data/store';

export default function Attendance() {
  const exams = getExams();
  const rooms = getRooms();
  const students = getStudents();
  const faculty = getFaculty();

  const [selectedExam, setSelectedExam] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [attendance, setAttendance] = useState({});
  const [saved, setSaved] = useState(false);

  const seatingAllocs = getSeatingAllocations();
  const invigilationAllocs = getInvigilationAllocations();
  const savedAttendance = getAttendance();

  // Rooms that have seating for this exam
  const examRooms = selectedExam
    ? rooms.filter((r) =>
        seatingAllocs.some(
          (a) => a.exam_id === Number(selectedExam) && a.room_id === r.room_id
        )
      )
    : [];

  // Students in selected room for selected exam
  const roomStudents = selectedExam && selectedRoom
    ? seatingAllocs
        .filter(
          (a) =>
            a.exam_id === Number(selectedExam) && a.room_id === Number(selectedRoom)
        )
        .sort((a, b) => a.seat_no - b.seat_no)
        .map((a) => ({
          ...a,
          student: students.find((s) => s.student_id === a.student_id),
        }))
    : [];

  // Invigilator for this room
  const invigilator = selectedExam && selectedRoom
    ? (() => {
        const duty = invigilationAllocs.find(
          (a) =>
            a.exam_id === Number(selectedExam) && a.room_id === Number(selectedRoom)
        );
        return duty ? faculty.find((f) => f.faculty_id === duty.faculty_id) : null;
      })()
    : null;

  const handleLoad = () => {
    // Load existing attendance for this exam+room
    const existing = {};
    savedAttendance.forEach((a) => {
      const alloc = seatingAllocs.find((s) => s.allocation_id === a.allocation_id);
      if (
        alloc &&
        alloc.exam_id === Number(selectedExam) &&
        alloc.room_id === Number(selectedRoom)
      ) {
        existing[a.allocation_id] = a.status;
      }
    });
    setAttendance(existing);
    setSaved(false);
  };

  const toggle = (allocId) => {
    setAttendance((prev) => ({
      ...prev,
      [allocId]: prev[allocId] === 'Present' ? 'Absent' : 'Present',
    }));
    setSaved(false);
  };

  const markAll = (status) => {
    const all = {};
    roomStudents.forEach((rs) => (all[rs.allocation_id] = status));
    setAttendance(all);
    setSaved(false);
  };

  const handleSave = () => {
    // Remove old attendance for this exam+room
    const allocIds = roomStudents.map((rs) => rs.allocation_id);
    const filtered = savedAttendance.filter((a) => !allocIds.includes(a.allocation_id));
    const newEntries = Object.entries(attendance).map(([allocId, status]) => ({
      attendance_id: Date.now() + Math.random(),
      allocation_id: Number(allocId),
      status,
    }));
    saveAttendance([...filtered, ...newEntries]);
    setSaved(true);
  };

  const presentCount = Object.values(attendance).filter((v) => v === 'Present').length;
  const absentCount = Object.values(attendance).filter((v) => v === 'Absent').length;

  const exam = exams.find((e) => e.exam_id === Number(selectedExam));
  const room = rooms.find((r) => r.room_id === Number(selectedRoom));

  return (
    <div className="p-8">
      <PageHeader title="Attendance Sheet" subtitle="Mark and record student attendance per room" />

      {/* Selectors */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={selectedExam}
          onChange={(e) => { setSelectedExam(e.target.value); setSelectedRoom(''); setAttendance({}); }}
          className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">— Select Exam —</option>
          {exams.map((e) => (
            <option key={e.exam_id} value={e.exam_id}>
              {e.exam_name} ({e.date})
            </option>
          ))}
        </select>

        <select
          value={selectedRoom}
          onChange={(e) => { setSelectedRoom(e.target.value); setAttendance({}); }}
          disabled={!selectedExam}
          className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <option value="">— Select Room —</option>
          {examRooms.map((r) => (
            <option key={r.room_id} value={r.room_id}>
              {r.room_no} ({r.building})
            </option>
          ))}
        </select>

        {selectedRoom && (
          <button
            onClick={handleLoad}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Load Saved
          </button>
        )}
      </div>

      {selectedRoom && roomStudents.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Sheet header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="text-gray-500">Exam:</span>{' '}
                <span className="font-semibold text-gray-900">{exam?.exam_name}</span>
              </div>
              <div>
                <span className="text-gray-500">Date:</span>{' '}
                <span className="font-semibold text-gray-900">{exam?.date}</span>
              </div>
              <div>
                <span className="text-gray-500">Session:</span>{' '}
                <span className="font-semibold text-gray-900">{exam?.session}</span>
              </div>
              <div>
                <span className="text-gray-500">Room:</span>{' '}
                <span className="font-semibold text-gray-900">{room?.room_no} — {room?.building}</span>
              </div>
              <div>
                <span className="text-gray-500">Invigilator:</span>{' '}
                <span className="font-semibold text-gray-900">{invigilator?.name || 'Not assigned'}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
            <div className="flex gap-2">
              <button
                onClick={() => markAll('Present')}
                className="px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs font-medium hover:bg-green-200"
              >
                Mark All Present
              </button>
              <button
                onClick={() => markAll('Absent')}
                className="px-3 py-1.5 rounded-lg bg-rose-100 text-rose-700 text-xs font-medium hover:bg-rose-200"
              >
                Mark All Absent
              </button>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-green-600 font-medium">Present: {presentCount}</span>
              <span className="text-rose-600 font-medium">Absent: {absentCount}</span>
              <span className="text-gray-500">Total: {roomStudents.length}</span>
            </div>
          </div>

          {/* Student list */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Seat</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Roll No</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Branch</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Signature</th>
              </tr>
            </thead>
            <tbody>
              {roomStudents.map((rs) => {
                const status = attendance[rs.allocation_id] || 'Absent';
                return (
                  <tr key={rs.allocation_id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{rs.seat_no}</td>
                    <td className="px-4 py-3 font-medium text-gray-700">{rs.student?.roll_no}</td>
                    <td className="px-4 py-3 text-gray-700">{rs.student?.name}</td>
                    <td className="px-4 py-3 text-gray-500">{rs.student?.branch}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggle(rs.allocation_id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          status === 'Present'
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                        }`}
                      >
                        {status}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-32 border-b border-gray-300 h-6" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Footer actions */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <Printer className="w-4 h-4" />
              Print Sheet
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
            >
              <Save className="w-4 h-4" />
              {saved ? 'Saved ✓' : 'Save Attendance'}
            </button>
          </div>
        </div>
      )}

      {selectedRoom && roomStudents.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
          No seating allocation found for this room. Generate seating first.
        </div>
      )}
    </div>
  );
}
