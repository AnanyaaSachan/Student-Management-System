/**
 * Seed data extracted from:
 * Gautam Buddha University - End Semester Examination
 * Evening Shift (03:00 pm - 04:30 pm) - 14-03-2026
 */

// ── Helper functions ──────────────────────────────────────────────────────────
let _allocId = 10000;

function makeAlloc(rollNo, roomId, seatNo) {
  return { allocation_id: _allocId++, exam_id: 2001, roll_no: rollNo, room_id: roomId, seat_no: seatNo };
}

function generateRange(prefix, from, to, roomId) {
  const results = [];
  for (let i = from; i <= to; i++) {
    const num = String(i).padStart(3, '0');
    results.push(makeAlloc(`${prefix}${num}`, roomId, i));
  }
  return results;
}

function getProgramme(rollNo) {
  if (rollNo.startsWith('245UCS') || rollNo.startsWith('255LCS') || rollNo.startsWith('R-235UCS') || rollNo.startsWith('R-245LCS') || rollNo.startsWith('R-225/UCF'))
    return { branch: 'CSE', semester: 4, section: 'B.Tech CSE 2024-28', course: 'CS202 Software Engineering' };
  if (rollNo.startsWith('245UAI') || rollNo.startsWith('255LAI') || rollNo.startsWith('R-235UAI') || rollNo.startsWith('R-245LAI'))
    return { branch: 'AI', semester: 4, section: 'B.Tech AI 2024-28', course: 'AI202 Machine Learning' };
  if (rollNo.startsWith('245ICS') || rollNo.startsWith('R-235ICS'))
    return { branch: 'ICS', semester: 4, section: '5Y Int BTech-MTech CSE 2024-29', course: 'CS202 Software Engineering' };
  if (rollNo.startsWith('245UCM'))
    return { branch: 'ML', semester: 4, section: 'B.Tech ML 2024-28', course: 'CM202 Software Engineering' };
  if (rollNo.startsWith('245UCD'))
    return { branch: 'DS', semester: 4, section: 'B.Tech DS 2024-28', course: 'CD202 Software Engineering' };
  if (rollNo.startsWith('245UCC'))
    return { branch: 'CySec', semester: 4, section: 'B.Tech Cyber Security 2024-28', course: 'CC202 Software Engineering' };
  if (rollNo.startsWith('245UIT') || rollNo.startsWith('255LIT'))
    return { branch: 'IT', semester: 4, section: 'B.Tech IT 2024-28', course: 'IT202 Data Structure' };
  if (rollNo.startsWith('245UEC') || rollNo.startsWith('235UEC') || rollNo.startsWith('R-215/UEC') || rollNo.startsWith('R-235/LEC'))
    return { branch: 'ECE', semester: 4, section: 'B.Tech ECE 2024-28', course: 'EC228 Electromagnetic Field Theory' };
  if (rollNo.startsWith('245UEA') || rollNo.startsWith('255LEA'))
    return { branch: 'ECE-AI', semester: 4, section: 'B.Tech ECE AI&ML 2024-28', course: 'EA202 Electromagnetic Field Theory' };
  if (rollNo.startsWith('245UVL'))
    return { branch: 'VLSI', semester: 4, section: 'B.Tech ECE VLSI 2024-28', course: 'EV202 Linear Integrated Circuits' };
  if (rollNo.startsWith('245UCA') || rollNo.startsWith('R-235UCA'))
    return { branch: 'BCA', semester: 4, section: 'BCA 2024-27', course: 'BCA202 Fundamental of Java Programming' };
  if (rollNo.startsWith('225/ICS'))
    return { branch: 'ICS', semester: 8, section: 'Int BTech CSE 2022-27', course: 'CA522/CD522/CS522' };
  if (rollNo.startsWith('225/IEC'))
    return { branch: 'IEC', semester: 8, section: 'Int BTech ECE 2022-27', course: 'MA402 Modeling and Simulation' };
  if (rollNo.startsWith('255PCS'))
    return { branch: 'PCS', semester: 2, section: 'MTech CSE 2025-27', course: 'CA522/CD522/CS522' };
  if (rollNo.startsWith('255PCW'))
    return { branch: 'PCW', semester: 2, section: 'MTech CSE Working Prof 2025-27', course: 'WCS524 Problem Solving Using AI' };
  return { branch: 'Other', semester: 0, section: 'Unknown', course: '' };
}

// ── ROOMS ─────────────────────────────────────────────────────────────────────
export const SEED_ROOMS = [
  { room_id: 1001, room_no: 'IL-101',    building: 'SOICT',          capacity: 60 },
  { room_id: 1002, room_no: 'IL-102',    building: 'SOICT',          capacity: 60 },
  { room_id: 1003, room_no: 'IL-200',    building: 'SOICT',          capacity: 60 },
  { room_id: 1004, room_no: 'IL-201',    building: 'SOICT',          capacity: 40 },
  { room_id: 1005, room_no: 'IL-202',    building: 'SOICT',          capacity: 70 },
  { room_id: 1006, room_no: 'IL-203',    building: 'SOICT',          capacity: 55 },
  { room_id: 1007, room_no: 'IL-204',    building: 'SOICT',          capacity: 60 },
  { room_id: 1008, room_no: 'IL-205',    building: 'SOICT',          capacity: 55 },
  { room_id: 1009, room_no: 'IL-206',    building: 'SOICT',          capacity: 45 },
  { room_id: 1010, room_no: 'IT-201',    building: 'SOICT-IT Block', capacity: 20 },
  { room_id: 1011, room_no: 'IT-202',    building: 'SOICT-IT Block', capacity: 20 },
  { room_id: 1012, room_no: 'IT-203',    building: 'SOICT-IT Block', capacity: 15 },
  { room_id: 1013, room_no: 'NB-IL-103', building: 'New Building',   capacity: 65 },
  { room_id: 1014, room_no: 'NB-IL-104', building: 'New Building',   capacity: 65 },
  { room_id: 1015, room_no: 'NB-IL-105', building: 'New Building',   capacity: 65 },
  { room_id: 1016, room_no: 'NB-IL-106', building: 'New Building',   capacity: 65 },
];

// ── EXAM ──────────────────────────────────────────────────────────────────────
export const SEED_EXAM = {
  exam_id:   2001,
  exam_name: 'GBU End Semester Examination 2026',
  date:      '2026-03-14',
  session:   'Evening',
};

// ── RAW ALLOCATIONS (roll_no → room) ─────────────────────────────────────────
const RAW_ALLOCS = [
  // IL-101
  ...generateRange('245UCS', 2, 46, 1001),
  ...generateRange('245UCA', 59, 80, 1001),
  ...['R-235UCA040','R-235UCA050','R-235UCA052','R-235UCA066','R-235UCA069'].map((r,i) => makeAlloc(r, 1001, 200+i)),

  // IL-102
  ...generateRange('245UCS', 47, 81, 1002),
  ...['225/ICS/001','225/ICS/012','225/ICS/013','225/ICS/014','225/ICS/018','225/ICS/019',
      '225/ICS/025','225/ICS/026','225/ICS/028','225/ICS/033','225/ICS/034','225/ICS/035',
      '225/ICS/036','225/ICS/037','225/ICS/039','225/ICS/042','225/ICS/043','225/ICS/045',
      '225/ICS/047','225/ICS/049','225/ICS/052','225/ICS/054','225/ICS/057','225/ICS/058',
      '225/ICS/059','225/ICS/060'].map((r,i) => makeAlloc(r, 1002, 300+i)),
  ...['255PCS009','255PCS011','255PCS017','255PCS022'].map((r,i) => makeAlloc(r, 1002, 400+i)),

  // IL-200
  ...generateRange('245UCS', 82, 121, 1003),
  ...['255PCS002','255PCS003','255PCS004','255PCS005','255PCS006','255PCS007','255PCS010',
      '255PCS012','255PCS013','255PCS014','255PCS015','255PCS016','255PCS018','255PCS019',
      '255PCS021','255PCS023'].map((r,i) => makeAlloc(r, 1003, 500+i)),
  ...['225/ICS/006','225/ICS/007','225/ICS/010','225/ICS/047','225/ICS/050'].map((r,i) => makeAlloc(r, 1003, 600+i)),
  makeAlloc('255PCS020', 1003, 699),

  // IL-201
  ...generateRange('245UCS', 122, 153, 1004),
  ...generateRange('245UAI', 1, 13, 1004),

  // IL-202
  ...generateRange('245UCS', 155, 238, 1005),

  // IL-203
  ...generateRange('245UCS', 239, 268, 1006),
  ...generateRange('245UAI', 15, 46, 1006),

  // IL-204
  ...generateRange('245UCS', 269, 284, 1007),
  ...generateRange('255LCS', 1, 11, 1007),
  ...['R-235UCS020','R-235UCS033','R-235UCS044','R-235UCS049'].map((r,i) => makeAlloc(r, 1007, 700+i)),
  ...generateRange('245UAI', 47, 91, 1007),

  // IL-205
  ...['R-235UCS053','R-235UCS061','R-235UCS114'].map((r,i) => makeAlloc(r, 1008, 800+i)),
  ...['R-245LCS004','R-245LCS010','R-245LCS016'].map((r,i) => makeAlloc(r, 1008, 810+i)),
  ...['R-225/UCF/001','R-225/UCF/059','R-225/UCF/070'].map((r,i) => makeAlloc(r, 1008, 820+i)),
  ...generateRange('245ICS', 1, 15, 1008),
  ...generateRange('245UAI', 92, 131, 1008),

  // IL-206
  ...generateRange('245ICS', 16, 42, 1009),
  ...generateRange('245UAI', 132, 143, 1009),
  ...['255LAI001','255LAI002'].map((r,i) => makeAlloc(r, 1009, 900+i)),
  ...['R-235UAI054','R-235UAI060'].map((r,i) => makeAlloc(r, 1009, 910+i)),
  makeAlloc('R-245LAI003', 1009, 920),

  // IT-201
  ...generateRange('245ICS', 46, 58, 1010),

  // IT-202
  ...generateRange('245ICS', 59, 70, 1011),

  // IT-203
  ...['R-235ICS027','R-235ICS032','R-235ICS037','R-235ICS072','R-235ICS073','R-235ICS075'].map((r,i) => makeAlloc(r, 1012, 1000+i)),

  // NB-IL-103
  ...generateRange('245UCM', 1, 18, 1013),
  ...generateRange('245UCD', 2, 20, 1013),
  ...generateRange('245UEC', 1, 14, 1013),
  ...['235UEC002','235UEC003','235UEC004','235UEC013'].map((r,i) => makeAlloc(r, 1013, 1100+i)),
  ...['R-215/UEC/048','R-235/LEC/001'].map((r,i) => makeAlloc(r, 1013, 1110+i)),
  ...generateRange('245UCA', 1, 21, 1013),

  // NB-IL-104
  ...generateRange('245UCC', 1, 16, 1014),
  ...generateRange('245UCD', 22, 41, 1014),
  ...generateRange('255PCW', 1, 11, 1014),
  ...generateRange('245UIT', 1, 17, 1014),

  // NB-IL-105
  ...generateRange('245UIT', 18, 37, 1015),
  ...['255LIT001','255LIT002'].map((r,i) => makeAlloc(r, 1015, 1200+i)),
  ...generateRange('245UEA', 1, 19, 1015),
  makeAlloc('255LEA001', 1015, 1220),
  ...generateRange('245UCC', 18, 37, 1015),
  ...generateRange('245UCA', 24, 42, 1015),

  // NB-IL-106
  ...generateRange('245UCD', 42, 66, 1016),
  ...['225/ICS/002','225/ICS/005','225/ICS/008','225/ICS/009','225/ICS/011','225/ICS/015',
      '225/ICS/016','225/ICS/017','225/ICS/020','225/ICS/023','225/ICS/027','225/ICS/029',
      '225/ICS/030','225/ICS/031','225/ICS/032','225/ICS/038','225/ICS/040','225/ICS/051',
      '225/ICS/053','225/ICS/055','225/ICS/056'].map((r,i) => makeAlloc(r, 1016, 1300+i)),
  ...['225/IEC/001','225/IEC/002'].map((r,i) => makeAlloc(r, 1016, 1400+i)),
  ...generateRange('245UCA', 43, 58, 1016),
  ...generateRange('245UVL', 1, 6, 1016),
];

// ── BUILD STUDENTS from roll numbers ─────────────────────────────────────────
function buildStudents() {
  const seen = new Set();
  const students = [];
  let sid = 20000;
  for (const a of RAW_ALLOCS) {
    if (seen.has(a.roll_no)) continue;
    seen.add(a.roll_no);
    const prog = getProgramme(a.roll_no);
    students.push({
      student_id: sid++,
      roll_no:    a.roll_no,
      name:       '',   // names not in seating plan document
      branch:     prog.branch,
      semester:   prog.semester,
      section:    prog.section,
    });
  }
  return students;
}

export const SEED_STUDENTS = buildStudents();

// ── FINAL ALLOCATIONS with numeric student_ids ────────────────────────────────
export function getSeedAllocations() {
  const rollToId = {};
  SEED_STUDENTS.forEach(s => { rollToId[s.roll_no] = s.student_id; });
  return RAW_ALLOCS.map((a, i) => ({
    allocation_id: 10000 + i,
    exam_id:       a.exam_id,
    student_id:    rollToId[a.roll_no],
    room_id:       a.room_id,
    seat_no:       a.seat_no,
  }));
}
