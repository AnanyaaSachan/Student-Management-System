import {
  getStudents,
  getRooms,
  getFaculty,
  saveSeatingAllocations,
  saveInvigilationAllocations,
  saveFaculty,
  getSeatingAllocations,
  getInvigilationAllocations,
} from './store';

/**
 * Seating Allocation Algorithm
 * 1. Sort students by roll_no
 * 2. Fill rooms sequentially up to capacity
 * 3. Return room-wise allocation
 */
export const generateSeatingAllocation = (examId, studentIds, roomIds) => {
  const allStudents = getStudents();
  const allRooms = getRooms();

  // Filter selected students and sort by roll_no
  const students = allStudents
    .filter((s) => studentIds.includes(s.student_id))
    .sort((a, b) => a.roll_no.localeCompare(b.roll_no, undefined, { numeric: true }));

  // Filter selected rooms
  const rooms = allRooms.filter((r) => roomIds.includes(r.room_id));

  if (students.length === 0) return { success: false, message: 'No students selected.' };
  if (rooms.length === 0) return { success: false, message: 'No rooms selected.' };

  const totalCapacity = rooms.reduce((sum, r) => sum + Number(r.capacity), 0);
  if (students.length > totalCapacity) {
    return {
      success: false,
      message: `Not enough capacity. ${students.length} students but only ${totalCapacity} seats available.`,
    };
  }

  // Remove existing allocations for this exam
  const existing = getSeatingAllocations().filter((a) => a.exam_id !== examId);

  const newAllocations = [];
  let studentIndex = 0;

  for (const room of rooms) {
    const cap = Number(room.capacity);
    for (let seat = 1; seat <= cap && studentIndex < students.length; seat++) {
      newAllocations.push({
        allocation_id: Date.now() + studentIndex,
        exam_id: examId,
        student_id: students[studentIndex].student_id,
        room_id: room.room_id,
        seat_no: seat,
      });
      studentIndex++;
    }
  }

  saveSeatingAllocations([...existing, ...newAllocations]);
  return { success: true, allocations: newAllocations };
};

/**
 * Invigilator Allocation Algorithm
 * 1. Sort faculty by total_duties ascending (fair distribution)
 * 2. Assign one faculty per room
 * 3. No faculty assigned to two rooms in same session
 */
export const generateInvigilationAllocation = (examId, roomIds) => {
  const allFaculty = getFaculty();
  const allRooms = getRooms();

  const rooms = allRooms.filter((r) => roomIds.includes(r.room_id));
  if (rooms.length === 0) return { success: false, message: 'No rooms selected.' };
  if (allFaculty.length === 0) return { success: false, message: 'No faculty available.' };
  if (allFaculty.length < rooms.length) {
    return {
      success: false,
      message: `Not enough faculty. Need ${rooms.length} but only ${allFaculty.length} available.`,
    };
  }

  // Remove existing invigilation for this exam
  const existing = getInvigilationAllocations().filter((a) => a.exam_id !== examId);

  // Sort faculty by total_duties ascending
  const sortedFaculty = [...allFaculty].sort((a, b) => (a.total_duties || 0) - (b.total_duties || 0));

  const newAllocations = [];
  const assignedFacultyIds = new Set();

  for (const room of rooms) {
    // Pick faculty with least duties not already assigned this session
    const faculty = sortedFaculty.find((f) => !assignedFacultyIds.has(f.faculty_id));
    if (!faculty) break;

    assignedFacultyIds.add(faculty.faculty_id);
    newAllocations.push({
      duty_id: Date.now() + newAllocations.length,
      exam_id: examId,
      faculty_id: faculty.faculty_id,
      room_id: room.room_id,
    });

    // Increment total_duties in faculty record
    faculty.total_duties = (faculty.total_duties || 0) + 1;
  }

  // Update faculty duty counts
  const updatedFaculty = allFaculty.map((f) => {
    const updated = sortedFaculty.find((sf) => sf.faculty_id === f.faculty_id);
    return updated || f;
  });
  saveFaculty(updatedFaculty);

  saveInvigilationAllocations([...existing, ...newAllocations]);
  return { success: true, allocations: newAllocations };
};
