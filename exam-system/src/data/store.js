// In-memory store simulating a backend database
// All data is kept in localStorage for persistence

const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const save = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// ── Students ──────────────────────────────────────────────────────────────────
export const getStudents = () => load('students', []);
export const saveStudents = (students) => save('students', students);

export const addStudent = (student) => {
  const students = getStudents();
  const newStudent = { ...student, student_id: Date.now() };
  students.push(newStudent);
  saveStudents(students);
  return newStudent;
};

export const updateStudent = (id, data) => {
  const students = getStudents().map((s) =>
    s.student_id === id ? { ...s, ...data } : s
  );
  saveStudents(students);
};

export const deleteStudent = (id) => {
  saveStudents(getStudents().filter((s) => s.student_id !== id));
};

// ── Faculty ───────────────────────────────────────────────────────────────────
export const getFaculty = () => load('faculty', []);
export const saveFaculty = (faculty) => save('faculty', faculty);

export const addFaculty = (faculty) => {
  const list = getFaculty();
  const newFaculty = { ...faculty, faculty_id: Date.now(), total_duties: 0 };
  list.push(newFaculty);
  saveFaculty(list);
  return newFaculty;
};

export const updateFaculty = (id, data) => {
  const list = getFaculty().map((f) =>
    f.faculty_id === id ? { ...f, ...data } : f
  );
  saveFaculty(list);
};

export const deleteFaculty = (id) => {
  saveFaculty(getFaculty().filter((f) => f.faculty_id !== id));
};

// ── Rooms ─────────────────────────────────────────────────────────────────────
export const getRooms = () => load('rooms', []);
export const saveRooms = (rooms) => save('rooms', rooms);

export const addRoom = (room) => {
  const rooms = getRooms();
  const newRoom = { ...room, room_id: Date.now() };
  rooms.push(newRoom);
  saveRooms(rooms);
  return newRoom;
};

export const updateRoom = (id, data) => {
  const rooms = getRooms().map((r) =>
    r.room_id === id ? { ...r, ...data } : r
  );
  saveRooms(rooms);
};

export const deleteRoom = (id) => {
  saveRooms(getRooms().filter((r) => r.room_id !== id));
};

// ── Exams ─────────────────────────────────────────────────────────────────────
export const getExams = () => load('exams', []);
export const saveExams = (exams) => save('exams', exams);

export const addExam = (exam) => {
  const exams = getExams();
  const newExam = { ...exam, exam_id: Date.now() };
  exams.push(newExam);
  saveExams(exams);
  return newExam;
};

export const deleteExam = (id) => {
  saveExams(getExams().filter((e) => e.exam_id !== id));
};

// ── Seating Allocations ───────────────────────────────────────────────────────
export const getSeatingAllocations = () => load('seating_allocations', []);
export const saveSeatingAllocations = (allocs) => save('seating_allocations', allocs);

// ── Invigilation Allocations ──────────────────────────────────────────────────
export const getInvigilationAllocations = () => load('invigilation_allocations', []);
export const saveInvigilationAllocations = (allocs) => save('invigilation_allocations', allocs);

export const updateInvigilationDuty = (dutyId, data) => {
  const allocs = getInvigilationAllocations().map((a) =>
    a.duty_id === dutyId ? { ...a, ...data } : a
  );
  saveInvigilationAllocations(allocs);
};

// ── Attendance ────────────────────────────────────────────────────────────────
export const getAttendance = () => load('attendance', []);
export const saveAttendance = (att) => save('attendance', att);

// ── Replacement Log ───────────────────────────────────────────────────────────
export const getReplacements = () => load('replacements', []);
export const saveReplacements = (reps) => save('replacements', reps);

export const addReplacement = (rep) => {
  const reps = getReplacements();
  const newRep = { ...rep, replacement_id: Date.now(), status: 'Pending' };
  reps.push(newRep);
  saveReplacements(reps);
  return newRep;
};

export const updateReplacement = (id, data) => {
  const reps = getReplacements().map((r) =>
    r.replacement_id === id ? { ...r, ...data } : r
  );
  saveReplacements(reps);
};
