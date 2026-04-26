import { SEED_ROOMS, SEED_EXAM, SEED_STUDENTS, getSeedAllocations } from './seedData';
import {
  getRooms, saveRooms,
  getExams, saveExams,
  getStudents, saveStudents,
  saveSeatingAllocations, getSeatingAllocations,
} from './store';

/**
 * Loads GBU 14-03-2026 Evening Shift data into localStorage.
 * Safe to call multiple times — checks if already loaded by exam_id.
 */
export function loadSeedData() {
  // Check if already loaded
  const exams = getExams();
  if (exams.some(e => e.exam_id === 2001)) return;

  // Merge rooms (avoid duplicates by room_id)
  const existingRooms = getRooms();
  const existingRoomIds = new Set(existingRooms.map(r => r.room_id));
  const newRooms = SEED_ROOMS.filter(r => !existingRoomIds.has(r.room_id));
  saveRooms([...existingRooms, ...newRooms]);

  // Add exam
  saveExams([...exams, SEED_EXAM]);

  // Merge students (avoid duplicates by roll_no)
  const existingStudents = getStudents();
  const existingRolls = new Set(existingStudents.map(s => s.roll_no));
  const newStudents = SEED_STUDENTS.filter(s => !existingRolls.has(s.roll_no));
  saveStudents([...existingStudents, ...newStudents]);

  // Add seating allocations
  const existingAllocs = getSeatingAllocations();
  const seedAllocs = getSeedAllocations();
  saveSeatingAllocations([...existingAllocs, ...seedAllocs]);

  console.log(`✅ Seed loaded: ${newStudents.length} students, ${newRooms.length} rooms, ${seedAllocs.length} seat allocations`);
}
