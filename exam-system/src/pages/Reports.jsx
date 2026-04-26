import { Printer } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import {
  getExams,
  getRooms,
  getFaculty,
  getStudents,
  getSeatingAllocations,
  getInvigilationAllocations,
  getAttendance,
} from '../data/store';

export default function Reports() {
  const exams = getExams();
  const rooms = getRooms();
  const faculty = getFaculty();
  const students = getStudents();
  const seatingAllocs = getSeatingAllocations();
  const invigilationAllocs = getInvigilationAllocations();
  const attendance = getAttendance();

  // Faculty-wise duty report
  const facultyDutyReport = [...faculty]
    .sort((a, b) => (b.total_duties || 0) - (a.total_duties || 0))
    .map((f) => ({
      ...f,
      duties: invigilationAllocs.filter((a) => a.faculty_id === f.faculty_id).length,
    }));

  // Room utilization report
  const roomUtilization = rooms.map((r) => {
    const allocated = seatingAllocs.filter((a) => a.room_id === r.room_id).length;
    const pct = r.capacity > 0 ? Math.round((allocated / r.capacity) * 100) : 0;
    return { ...r, allocated, pct };
  });

  // Attendance summary per exam
  const attendanceSummary = exams.map((exam) => {
    const examAllocs = seatingAllocs.filter((a) => a.exam_id === exam.exam_id);
    const examAttendance = attendance.filter((a) =>
      examAllocs.some((ea) => ea.allocation_id === a.allocation_id)
    );
    const present = examAttendance.filter((a) => a.status === 'Present').length;
    const absent = examAttendance.filter((a) => a.status === 'Absent').length;
    return { ...exam, total: examAllocs.length, present, absent, recorded: examAttendance.length };
  });

  return (
    <div className="p-8">
      <PageHeader
        title="Reports"
        subtitle="Duty charts, attendance summaries, and room utilization"
        action={
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Printer className="w-4 h-4" />
            Print All
          </button>
        }
      />

      <div className="space-y-8">
        {/* Date-wise Schedule */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Exam Schedule Overview</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Shift</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Exam</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Students</th>
                </tr>
              </thead>
              <tbody>
                {[...exams].sort((a,b) => a.date.localeCompare(b.date) || (a.session === 'Morning' ? -1 : 1)).map(exam => {
                  const count = seatingAllocs.filter(a => a.exam_id === exam.exam_id).length;
                  return (
                    <tr key={exam.exam_id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-700">{exam.date}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${exam.session === 'Morning' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                          {exam.session}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{exam.exam_name}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-700">{count}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Faculty-wise Duty Report */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Faculty-wise Duty Report</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Faculty Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Designation</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total Duties</th>
                </tr>
              </thead>
              <tbody>
                {facultyDutyReport.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">No faculty data.</td>
                  </tr>
                ) : (
                  facultyDutyReport.map((f, i) => (
                    <tr key={f.faculty_id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-700">{f.name}</td>
                      <td className="px-4 py-3 text-gray-600">{f.department}</td>
                      <td className="px-4 py-3 text-gray-600">{f.designation}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-24">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{
                                width: `${Math.min(100, (f.duties / Math.max(1, Math.max(...facultyDutyReport.map((x) => x.duties)))) * 100)}%`,
                              }}
                            />
                          </div>
                          <span className="font-semibold text-indigo-700">{f.duties}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Room Utilization Report */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Room Utilization Report</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Room No</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Building</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Capacity</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Allocated</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Utilization</th>
                </tr>
              </thead>
              <tbody>
                {roomUtilization.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">No rooms added.</td>
                  </tr>
                ) : (
                  roomUtilization.map((r) => (
                    <tr key={r.room_id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-700">{r.room_no}</td>
                      <td className="px-4 py-3 text-gray-600">{r.building}</td>
                      <td className="px-4 py-3 text-gray-600">{r.capacity}</td>
                      <td className="px-4 py-3 text-gray-600">{r.allocated}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-32">
                            <div
                              className={`h-full rounded-full ${r.pct >= 90 ? 'bg-rose-500' : r.pct >= 60 ? 'bg-amber-500' : 'bg-green-500'}`}
                              style={{ width: `${r.pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-600">{r.pct}%</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Attendance Summary */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Attendance Summary Report</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Exam</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total Students</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Present</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Absent</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {attendanceSummary.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No exams scheduled.</td>
                  </tr>
                ) : (
                  attendanceSummary.map((e) => {
                    const pct = e.recorded > 0 ? Math.round((e.present / e.recorded) * 100) : 0;
                    return (
                      <tr key={e.exam_id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-700">{e.exam_name}</td>
                        <td className="px-4 py-3 text-gray-600">{e.date}</td>
                        <td className="px-4 py-3 text-gray-600">{e.total}</td>
                        <td className="px-4 py-3 text-green-600 font-medium">{e.present}</td>
                        <td className="px-4 py-3 text-rose-600 font-medium">{e.absent}</td>
                        <td className="px-4 py-3">
                          {e.recorded > 0 ? (
                            <span className={`font-semibold ${pct >= 75 ? 'text-green-600' : 'text-amber-600'}`}>
                              {pct}%
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">Not recorded</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
