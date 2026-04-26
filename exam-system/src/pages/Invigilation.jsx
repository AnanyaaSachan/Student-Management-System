import { useState, useMemo } from "react";
import { Play, Printer, ChevronDown, CheckCircle, Pencil, X } from "lucide-react";
import {
  getExams, getFaculty, getRooms,
  getSeatingAllocations, getInvigilationAllocations,
  saveInvigilationAllocations,
} from "../data/store";
import { getCourseForSection, MORNING_SCHEDULE } from "../data/morningShiftData";

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
}

function groupByDate(exams) {
  const map = {};
  exams.forEach(e => { if (!map[e.date]) map[e.date] = []; map[e.date].push(e); });
  return map;
}

const CHIP = ["bg-yellow-400 text-yellow-900","bg-green-400 text-green-900","bg-blue-400 text-blue-900","bg-pink-400 text-pink-900","bg-purple-400 text-purple-900","bg-orange-400 text-orange-900"];
function chip(i) { return CHIP[i % CHIP.length]; }

export default function Invigilation() {
  const allExams   = getExams();
  const allFaculty = getFaculty();
  const allRooms   = getRooms();
  const allSeating = getSeatingAllocations();

  const [selectedDate,  setSelectedDate]  = useState("");
  const [selectedShift, setSelectedShift] = useState("");
  const [editDuty,      setEditDuty]      = useState(null);
  const [editChief,     setEditChief]     = useState("");
  const [editAssist,    setEditAssist]    = useState("");
  const [refresh,       setRefresh]       = useState(0);

  const dateGroups  = useMemo(() => groupByDate(allExams), [allExams]);
  const sortedDates = Object.keys(dateGroups).sort();
  const dateExams   = selectedDate ? (dateGroups[selectedDate] || []) : [];
  const morningExams = dateExams.filter(e => e.session === "Morning");
  const eveningExams = dateExams.filter(e => e.session === "Evening");
  const activeExams  = dateExams.filter(e => e.session === selectedShift);

  const invigilationAllocs = getInvigilationAllocations();

  // Rooms that have seating for active exams
  const activeExamIds = new Set(activeExams.map(e => e.exam_id));
  const usedRoomIds = [...new Set(
    allSeating.filter(a => activeExamIds.has(a.exam_id)).map(a => a.room_id)
  )];
  const activeRooms = allRooms.filter(r => usedRoomIds.includes(r.room_id))
    .sort((a, b) => a.room_no.localeCompare(b.room_no));

  // Duties for active exams
  const activeDuties = invigilationAllocs.filter(d => activeExamIds.has(d.exam_id));

  // Stats
  const availableFaculty    = allFaculty.length;
  const roomsAssigned       = new Set(activeDuties.map(d => d.room_id)).size;
  const invigilatorsAssigned = new Set(activeDuties.map(d => d.faculty_id)).size;
  const isAssigned          = activeDuties.length > 0;

  // Auto-assign: 2 faculty per room (chief + assistant), least duties first
  const handleAutoAssign = () => {
    if (!selectedShift || activeRooms.length === 0) return;
    if (allFaculty.length < 2) { alert("Add at least 2 faculty members first."); return; }

    const sorted = [...allFaculty].sort((a, b) => (a.total_duties || 0) - (b.total_duties || 0));
    const newDuties = [];
    let fi = 0;
    activeRooms.forEach(room => {
      activeExams.forEach(exam => {
        const chief   = sorted[fi % sorted.length];
        const assist  = sorted[(fi + 1) % sorted.length];
        fi += 2;
        newDuties.push({
          duty_id:    Date.now() + Math.random(),
          exam_id:    exam.exam_id,
          room_id:    room.room_id,
          faculty_id: chief.faculty_id,
          role:       "Chief",
        });
        newDuties.push({
          duty_id:    Date.now() + Math.random(),
          exam_id:    exam.exam_id,
          room_id:    room.room_id,
          faculty_id: assist.faculty_id,
          role:       "Assistant",
        });
      });
    });

    // Remove old duties for active exams, add new
    const kept = invigilationAllocs.filter(d => !activeExamIds.has(d.exam_id));
    saveInvigilationAllocations([...kept, ...newDuties]);
    setRefresh(r => r + 1);
  };

  // Save edit
  const saveEdit = () => {
    if (!editDuty) return;
    const allocs = getInvigilationAllocations();
    const updated = allocs.map(d => {
      if (d.duty_id === editDuty.chief?.duty_id)  return { ...d, faculty_id: Number(editChief) };
      if (d.duty_id === editDuty.assist?.duty_id) return { ...d, faculty_id: Number(editAssist) };
      return d;
    });
    saveInvigilationAllocations(updated);
    setEditDuty(null);
    setRefresh(r => r + 1);
  };

  // Build room rows
  const roomRows = useMemo(() => {
    const duties = getInvigilationAllocations().filter(d => activeExamIds.has(d.exam_id));
    return activeRooms.map(room => {
      const roomDuties = duties.filter(d => d.room_id === room.room_id);
      const chief  = roomDuties.find(d => d.role === "Chief")  || roomDuties[0];
      const assist = roomDuties.find(d => d.role === "Assistant") || roomDuties[1];
      const chiefF  = chief  ? allFaculty.find(f => f.faculty_id === chief.faculty_id)  : null;
      const assistF = assist ? allFaculty.find(f => f.faculty_id === assist.faculty_id) : null;

      // Courses in this room
      const roomSeating = allSeating.filter(a => a.room_id === room.room_id && activeExamIds.has(a.exam_id));
      const examCodesSet = new Set();
      activeExams.forEach(exam => {
        if (roomSeating.some(a => a.exam_id === exam.exam_id)) {
          if (exam.session === "Morning") {
            MORNING_SCHEDULE.filter(s => s.examId === exam.exam_id).forEach(s => examCodesSet.add(s.courseCode));
          } else {
            examCodesSet.add("CS202");
          }
        }
      });

      return { room, chief, assist, chiefF, assistF, examCodes: [...examCodesSet] };
    });
  }, [activeRooms, activeExams, refresh]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Admin</span><span className="text-gray-300">›</span>
          <span className="font-semibold text-gray-800">Invigilation Management</span>
        </div>
        <span className="text-xs text-gray-400">
          {new Date().toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
        </span>
      </div>

      <div className="px-8 py-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Invigilation Management</h1>

        {/* Select Exam Date */}
        <div className="bg-white rounded-xl border border-gray-200 mb-4">
          <div className="px-5 py-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Select Exam Date</p>
          </div>
          <div className="px-5 py-3">
            <div className="relative">
              <select
                value={selectedDate}
                onChange={e => { setSelectedDate(e.target.value); setSelectedShift(""); }}
                className="w-full appearance-none bg-transparent text-sm font-semibold text-gray-800 focus:outline-none cursor-pointer pr-8"
              >
                <option value="">— Choose a date —</option>
                {sortedDates.map(d => (
                  <option key={d} value={d}>{formatDate(d)}  —  {dateGroups[d].length} exam{dateGroups[d].length > 1 ? "s" : ""}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Select Shift */}
        {selectedDate && (
          <div className="bg-white rounded-xl border border-gray-200 mb-4">
            <div className="px-5 py-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Select Shift</p>
            </div>
            <div className="px-5 py-4 flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setSelectedShift("Morning")}
                disabled={morningExams.length === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                  selectedShift === "Morning" ? "bg-amber-400 border-amber-400 text-amber-900 shadow-sm"
                  : morningExams.length === 0 ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white border-gray-300 text-gray-700 hover:border-amber-400 hover:bg-amber-50"
                }`}
              >
                <span>☀</span> Shift 1 (Morning)
                {morningExams.length > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${selectedShift === "Morning" ? "bg-amber-600 text-white" : "bg-gray-200 text-gray-600"}`}>
                    {morningExams.length} exam{morningExams.length > 1 ? "s" : ""}
                  </span>
                )}
              </button>

              <button
                onClick={() => setSelectedShift("Evening")}
                disabled={eveningExams.length === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                  selectedShift === "Evening" ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                  : eveningExams.length === 0 ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white border-gray-300 text-gray-700 hover:border-indigo-400 hover:bg-indigo-50"
                }`}
              >
                <span>🌙</span> Shift 2 (Evening)
                {eveningExams.length > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${selectedShift === "Evening" ? "bg-indigo-400 text-white" : "bg-gray-200 text-gray-600"}`}>
                    {eveningExams.length} exam{eveningExams.length > 1 ? "s" : ""}
                  </span>
                )}
              </button>

              <div className="ml-auto flex gap-2">
                <button
                  onClick={handleAutoAssign}
                  disabled={!selectedShift}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Auto Assign
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
              </div>
            </div>

            {/* Exam chips */}
            {selectedShift && activeExams.length > 0 && (
              <div className="px-5 pb-4">
                <p className="text-xs text-gray-500 mb-2">Exams in this shift:</p>
                <div className="flex flex-wrap gap-2">
                  {activeExams.map((exam, i) => (
                    <span key={exam.exam_id} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${chip(i)}`}>
                      {exam.exam_name.match(/CS\d+|AI\d+|IT\d+|EC\d+|BCA\d+|CM\d+|CD\d+|CC\d+/)?.[0] || `Exam ${i+1}`}
                      <span className="opacity-60">Sem {exam.session === "Morning" ? "6" : "4"}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats bar */}
        {selectedShift && (
          <div className="flex items-center gap-6 mb-5 text-sm text-gray-600">
            <span>Available Faculty: <strong className="text-gray-900">{availableFaculty}</strong></span>
            <span className="text-gray-300">|</span>
            <span>Rooms Assigned: <strong className="text-gray-900">{roomsAssigned}</strong></span>
            <span className="text-gray-300">|</span>
            <span>Invigilators Assigned: <strong className="text-gray-900">{invigilatorsAssigned}</strong></span>
            {isAssigned && (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                <CheckCircle className="w-3 h-3" /> Assigned
              </span>
            )}
          </div>
        )}

        {/* Duty table */}
        {selectedShift && activeRooms.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Room</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Building</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Exams in Room</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" /> Chief Invigilator
                    </span>
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" /> Assistant Invigilator
                    </span>
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {roomRows.map(({ room, chief, assist, chiefF, assistF, examCodes }, i) => (
                  <tr key={room.room_id} className={`border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? "" : "bg-gray-50/40"}`}>
                    {/* Room */}
                    <td className="px-5 py-4 font-bold text-gray-800">{room.room_no}</td>
                    {/* Building */}
                    <td className="px-5 py-4 text-gray-600 text-xs">{room.building}</td>
                    {/* Exam chips */}
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {examCodes.length > 0
                          ? examCodes.map((code, j) => (
                              <span key={code} className={`px-2 py-0.5 rounded text-xs font-bold ${chip(j)}`}>{code}</span>
                            ))
                          : activeExams.map((e, j) => (
                              <span key={e.exam_id} className={`px-2 py-0.5 rounded text-xs font-bold ${chip(j)}`}>
                                {e.session === "Morning" ? "—" : "CS202"}
                              </span>
                            ))
                        }
                      </div>
                    </td>
                    {/* Chief */}
                    <td className="px-5 py-4">
                      {chiefF ? (
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{chiefF.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {chiefF.phone || `98765${String(chiefF.faculty_id).slice(-5)}`} · {chiefF.department}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs italic">Not assigned</span>
                      )}
                    </td>
                    {/* Assistant */}
                    <td className="px-5 py-4">
                      {assistF ? (
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{assistF.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {assistF.phone || `98765${String(assistF.faculty_id).slice(-5)}`} · {assistF.department}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs italic">Not assigned</span>
                      )}
                    </td>
                    {/* Edit */}
                    <td className="px-5 py-4">
                      <button
                        onClick={() => {
                          setEditDuty({ room, chief, assist });
                          setEditChief(String(chief?.faculty_id || ""));
                          setEditAssist(String(assist?.faculty_id || ""));
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {roomRows.length === 0 && (
              <div className="py-12 text-center text-gray-400">
                No rooms with seating allocations found. Generate seating first.
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {selectedShift && activeRooms.length === 0 && (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <p className="text-gray-500 font-medium">No rooms allocated for this shift</p>
            <p className="text-gray-400 text-sm mt-1">Go to Seating Allocation and generate a seating plan first.</p>
          </div>
        )}

        {allFaculty.length === 0 && selectedShift && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
            No faculty added yet. Go to <strong>Faculty</strong> management to add faculty members before assigning invigilators.
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editDuty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Edit Invigilators — {editDuty.room?.room_no}</h2>
              <button onClick={() => setEditDuty(null)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Chief Invigilator</label>
                <select value={editChief} onChange={e => setEditChief(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">— Select Faculty —</option>
                  {allFaculty.map(f => (
                    <option key={f.faculty_id} value={f.faculty_id}>{f.name} · {f.department}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Assistant Invigilator</label>
                <select value={editAssist} onChange={e => setEditAssist(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">— Select Faculty —</option>
                  {allFaculty.filter(f => String(f.faculty_id) !== editChief).map(f => (
                    <option key={f.faculty_id} value={f.faculty_id}>{f.name} · {f.department}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t">
              <button onClick={() => setEditDuty(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={saveEdit}
                className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
