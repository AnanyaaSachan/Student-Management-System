import { SEED_ROOMS, SEED_EXAM, SEED_STUDENTS, getSeedAllocations } from './seedData';
import { MORNING_EXAMS, MORNING_STUDENTS, getMorningAllocations } from './morningShiftData';
import {
  getRooms, saveRooms,
  getExams, saveExams,
  getStudents, saveStudents,
  saveSeatingAllocations, getSeatingAllocations,
} from './store';

// Bump this version whenever seed data changes (rooms, courses, etc.)
const SEED_VERSION = '10';

/**
 * Loads GBU 14-03-2026 Evening Shift data into localStorage.
 * Re-loads automatically when SEED_VERSION changes.
 */
export function loadSeedData() {
  const storedVersion = localStorage.getItem('gbu_seed_version');

  // If version matches, skip reload
  if (storedVersion === SEED_VERSION) return;

  // Clear old seed data to force fresh load
  const exams = getExams().filter(e => e.exam_id !== 2001 && !(e.exam_id >= 3001 && e.exam_id <= 3009));
  const students = getStudents().filter(s => s.student_id < 20000 || s.student_id >= 40000);
  const rooms = getRooms().filter(r => r.room_id < 1001 || r.room_id > 1016);
  const allocs = getSeatingAllocations().filter(a => a.exam_id !== 2001 && !(a.exam_id >= 3001 && a.exam_id <= 3009));

  // ── Evening shift seed ────────────────────────────────────────────────────
  const existingRoomIds = new Set(rooms.map(r => r.room_id));
  const newRooms = SEED_ROOMS.filter(r => !existingRoomIds.has(r.room_id));
  saveRooms([...rooms, ...newRooms]);
  saveExams([...exams, SEED_EXAM]);

  const existingRolls = new Set(students.map(s => s.roll_no));
  const newStudents = SEED_STUDENTS.filter(s => !existingRolls.has(s.roll_no));
  const allStudents = [...students, ...newStudents];
  saveStudents(allStudents);
  saveSeatingAllocations([...allocs, ...getSeedAllocations()]);

  // ── Morning shift seed ────────────────────────────────────────────────────
  const morningRolls = new Set(allStudents.map(s => s.roll_no));
  const newMorningStudents = MORNING_STUDENTS.filter(s => !morningRolls.has(s.roll_no));
  saveStudents([...allStudents, ...newMorningStudents]);
  saveExams([...getExams(), ...MORNING_EXAMS]);
  saveSeatingAllocations([...getSeatingAllocations(), ...getMorningAllocations()]);

  localStorage.setItem('gbu_seed_version', SEED_VERSION);
  console.log(`✅ Seed v${SEED_VERSION} loaded: ${newStudents.length + newMorningStudents.length} students, ${newRooms.length} rooms`);
}
