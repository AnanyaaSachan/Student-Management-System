/**
 * Seed data — Gautam Buddha University
 * End Semester Examination  |  Evening Shift (03:00 pm – 04:30 pm)  |  14-03-2026
 *
 * Source: Master Seating Plan (official sheet) — 750 students total
 *
 * Programme → section mapping (used by getProgrammeFromSection in filterData.js):
 *   B.Tech CSE 4th Sem      → 'B.Tech CSE (2024-2028) 4th Sem'
 *   5Y Int B.Tech CSE 4th   → '5Y Int B.Tech CSE (2024-2029) 4th Sem'
 *   B.Tech ML 4th Sem       → 'B.Tech ML (2024-2028) 4th Sem'
 *   B.Tech DS 4th Sem       → 'B.Tech DS (2024-2028) 4th Sem'
 *   B.Tech CySec 4th Sem    → 'B.Tech Cyber Security (2024-2028) 4th Sem'
 *   B.Tech AI 4th Sem       → 'B.Tech AI (2024-2028) 4th Sem'
 *   5Y Int B.Tech CSE 8th   → '5Y Int B.Tech CSE (AIR) (2022-2027) 8th Sem'
 *   M.Tech CSE (AIR) 2nd    → 'M.Tech CSE (AIR) (2025-2027) 2nd Sem'
 *   5Y Int B.Tech CSE DS 8th→ '5Y Int B.Tech CSE (DS) (2022-2027) 8th Sem'
 *   M.Tech CSE DS 2nd       → 'M.Tech CSE (DS) (2025-2027) 2nd Sem'
 *   5Y Int B.Tech CSE SE 8th→ '5Y Int B.Tech CSE (SE) (2022-2027) 8th Sem'
 *   M.Tech CSE SE 2nd       → 'M.Tech CSE (SE) (2025-2027) 2nd Sem'
 *   B.Tech IT 4th Sem       → 'B.Tech IT (2024-2028) 4th Sem'
 *   B.Tech ECE 4th Sem      → 'B.Tech ECE (2024-2028) 4th Sem'
 *   B.Tech VLSI 4th Sem     → 'B.Tech ECE VLSI (2024-2028) 4th Sem'
 *   5Y Int B.Tech ECE 8th   → '5Y Int B.Tech ECE (2022-2027) 8th Sem'
 *   M.Tech CSE WP 2nd       → 'M.Tech CSE (Working Professional) (2025-2027) 2nd Sem'
 *   B.Tech ECE-AI 4th Sem   → 'B.Tech ECE AI&ML (2024-2028) 4th Sem'
 *   BCA 4th Sem             → 'BCA (2024-2027) 4th Sem'
 */

// ── Helper functions ──────────────────────────────────────────────────────────
let _allocId = 10000;
let _seatCounters = {};   // room_id → next seat number

function nextSeat(roomId) {
  if (!_seatCounters[roomId]) _seatCounters[roomId] = 1;
  return _seatCounters[roomId]++;
}

function makeAlloc(rollNo, roomId) {
  return { allocation_id: _allocId++, exam_id: 2001, roll_no: rollNo, room_id: roomId, seat_no: nextSeat(roomId) };
}

function generateRange(prefix, from, to, roomId) {
  const results = [];
  for (let i = from; i <= to; i++) {
    const num = String(i).padStart(3, '0');
    results.push(makeAlloc(`${prefix}${num}`, roomId));
  }
  return results;
}

// ── Programme lookup from roll number ────────────────────────────────────────
// 225/ICS split: AIR=CA522, DS=CD522, SE=CS522 — determined by which room/group they appear in
const ICS_AIR_ROLLS = new Set([
  '225/ICS/001','225/ICS/012','225/ICS/013','225/ICS/014','225/ICS/018','225/ICS/019',
  '225/ICS/025','225/ICS/026','225/ICS/028','225/ICS/033','225/ICS/034','225/ICS/035',
  '225/ICS/036','225/ICS/037','225/ICS/039','225/ICS/042','225/ICS/043','225/ICS/045',
  '225/ICS/047','225/ICS/049','225/ICS/052','225/ICS/054','225/ICS/057','225/ICS/058',
  '225/ICS/060',
]);
const ICS_SE_ROLLS = new Set([
  '225/ICS/006','225/ICS/007','225/ICS/010','225/ICS/047','225/ICS/050',
]);
// All other 225/ICS → DS

function getProgramme(rollNo) {
  // B.Tech CSE 4th Sem (2024-2028)
  if (rollNo.startsWith('245UCS') || rollNo.startsWith('255LCS') ||
      rollNo.startsWith('R-235UCS') || rollNo.startsWith('R-245LCS') ||
      rollNo.startsWith('R-225/UCF'))
    return { branch: 'CSE', semester: 4, section: 'B.Tech CSE (2024-2028) 4th Sem' };

  // 5Y Int B.Tech CSE 4th Sem (2024-2029)
  if (rollNo.startsWith('245ICS') || rollNo.startsWith('R-235ICS'))
    return { branch: 'ICS', semester: 4, section: '5Y Int B.Tech CSE (2024-2029) 4th Sem' };

  // B.Tech ML 4th Sem (2024-2028)
  if (rollNo.startsWith('245UCM'))
    return { branch: 'ML', semester: 4, section: 'B.Tech ML (2024-2028) 4th Sem' };

  // B.Tech DS 4th Sem (2024-2028)
  if (rollNo.startsWith('245UCD'))
    return { branch: 'DS', semester: 4, section: 'B.Tech DS (2024-2028) 4th Sem' };

  // B.Tech Cyber Security 4th Sem (2024-2028)
  if (rollNo.startsWith('245UCC'))
    return { branch: 'CySec', semester: 4, section: 'B.Tech Cyber Security (2024-2028) 4th Sem' };

  // B.Tech AI 4th Sem (2024-2028)
  if (rollNo.startsWith('245UAI') || rollNo.startsWith('255LAI') ||
      rollNo.startsWith('R-235UAI') || rollNo.startsWith('R-245LAI'))
    return { branch: 'AI', semester: 4, section: 'B.Tech AI (2024-2028) 4th Sem' };

  // 5Y Int B.Tech CSE 8th Sem — split by specialisation
  if (rollNo.startsWith('225/ICS/')) {
    if (ICS_AIR_ROLLS.has(rollNo))
      return { branch: 'ICS', semester: 8, section: '5Y Int B.Tech CSE (AIR) (2022-2027) 8th Sem' };
    if (ICS_SE_ROLLS.has(rollNo))
      return { branch: 'ICS', semester: 8, section: '5Y Int B.Tech CSE (SE) (2022-2027) 8th Sem' };
    return { branch: 'ICS', semester: 8, section: '5Y Int B.Tech CSE (DS) (2022-2027) 8th Sem' };
  }

  // M.Tech CSE 2nd Sem — split by specialisation
  if (rollNo.startsWith('255PCS')) {
    if (['255PCS009','255PCS011','255PCS017','255PCS022'].includes(rollNo))
      return { branch: 'PCS', semester: 2, section: 'M.Tech CSE (AIR) (2025-2027) 2nd Sem' };
    if (rollNo === '255PCS020')
      return { branch: 'PCS', semester: 2, section: 'M.Tech CSE (SE) (2025-2027) 2nd Sem' };
    return { branch: 'PCS', semester: 2, section: 'M.Tech CSE (DS) (2025-2027) 2nd Sem' };
  }

  // B.Tech IT 4th Sem (2024-2028)
  if (rollNo.startsWith('245UIT') || rollNo.startsWith('255LIT'))
    return { branch: 'IT', semester: 4, section: 'B.Tech IT (2024-2028) 4th Sem' };

  // B.Tech ECE 4th Sem (2024-2028)
  if (rollNo.startsWith('245UEC') || rollNo.startsWith('235UEC') ||
      rollNo.startsWith('R-215/UEC') || rollNo.startsWith('R-235/LEC'))
    return { branch: 'ECE', semester: 4, section: 'B.Tech ECE (2024-2028) 4th Sem' };

  // B.Tech ECE VLSI 4th Sem (2024-2028)
  if (rollNo.startsWith('245UVL'))
    return { branch: 'VLSI', semester: 4, section: 'B.Tech ECE VLSI (2024-2028) 4th Sem' };

  // 5Y Int B.Tech ECE 8th Sem (2022-2027)
  if (rollNo.startsWith('225/IEC'))
    return { branch: 'IEC', semester: 8, section: '5Y Int B.Tech ECE (2022-2027) 8th Sem' };

  // M.Tech CSE (Working Professional) 2nd Sem (2025-2027)
  if (rollNo.startsWith('255PCW'))
    return { branch: 'PCW', semester: 2, section: 'M.Tech CSE (Working Professional) (2025-2027) 2nd Sem' };

  // B.Tech ECE AI&ML 4th Sem (2024-2028)
  if (rollNo.startsWith('245UEA') || rollNo.startsWith('255LEA'))
    return { branch: 'ECE-AI', semester: 4, section: 'B.Tech ECE AI&ML (2024-2028) 4th Sem' };

  // BCA 4th Sem (2024-2027)
  if (rollNo.startsWith('245UCA') || rollNo.startsWith('R-235UCA'))
    return { branch: 'BCA', semester: 4, section: 'BCA (2024-2027) 4th Sem' };

  return { branch: 'Other', semester: 0, section: 'Unknown' };
}

// ── ROOMS ─────────────────────────────────────────────────────────────────────
export const SEED_ROOMS = [
  // SOICT building
  { room_id: 1001, room_no: 'IL-101', building: 'SOICT',        capacity: 80 },
  { room_id: 1002, room_no: 'IL-102', building: 'SOICT',        capacity: 60 },
  { room_id: 1003, room_no: 'IL-200', building: 'SOICT',        capacity: 60 },
  { room_id: 1004, room_no: 'IL-201', building: 'SOICT',        capacity: 40 },
  { room_id: 1005, room_no: 'IL-202', building: 'SOICT',        capacity: 70 },
  { room_id: 1006, room_no: 'IL-203', building: 'SOICT',        capacity: 55 },
  { room_id: 1007, room_no: 'IL-204', building: 'SOICT',        capacity: 60 },
  { room_id: 1008, room_no: 'IL-205', building: 'SOICT',        capacity: 55 },
  { room_id: 1009, room_no: 'IL-206', building: 'SOICT',        capacity: 45 },
  { room_id: 1010, room_no: 'IT-201', building: 'SOICT',        capacity: 20 },
  { room_id: 1011, room_no: 'IT-202', building: 'SOICT',        capacity: 20 },
  { room_id: 1012, room_no: 'IT-203', building: 'SOICT',        capacity: 15 },
  // New Building
  { room_id: 1013, room_no: 'IL-103', building: 'New Building', capacity: 65 },
  { room_id: 1014, room_no: 'IL-104', building: 'New Building', capacity: 65 },
  { room_id: 1015, room_no: 'IL-105', building: 'New Building', capacity: 65 },
  { room_id: 1016, room_no: 'IL-106', building: 'New Building', capacity: 65 },
];

// ── EXAM ──────────────────────────────────────────────────────────────────────
export const SEED_EXAM = {
  exam_id:    2001,
  exam_name:  'GBU End Semester Examination 2026',
  date:       '2026-03-14',
  session:    'Evening',
  start_time: '15:00',
  end_time:   '16:30',
};

// ── IL-101 exact layout — sub-column order for generateSeatingGrid ────────────
// Seats are assigned sub-column by sub-column (6 per sub-col):
//   1- 6: L-D1-A  7-12: L-D1-B  13-18: L-D2-A  19-24: L-D2-B
//  25-30: L-D3-A  31-36: L-D3-B  37-42: R-D1-A  43-48: R-D1-B
//  49-54: R-D2-A  55-60: R-D2-B  61-66: R-D3-A  67-72: R-D3-B
function makeIL101Allocs() {
  const R = 1001;
  let seat = 1;
  const allocs = [];
  const mk = (roll) => ({ allocation_id: _allocId++, exam_id: 2001, roll_no: roll, room_id: R, seat_no: seat++ });
  const skip = () => { seat++; };

  const subCols = [
    // L-DESK-1 col-A
    ['245UCS002','245UCS003','245UCS005','245UCS006','245UCS007','245UCS008'],
    // L-DESK-1 col-B
    ['245UCA059','245UCA061','245UCA062','245UCA064','245UCA065','245UCA066'],
    // L-DESK-2 col-A
    ['245UCS009','245UCS010','245UCS012','245UCS013','245UCS014','245UCS015'],
    // L-DESK-2 col-B
    ['245UCA069','245UCA070','245UCA071','245UCA072','245UCA075','245UCA076'],
    // L-DESK-3 col-A
    ['245UCS016','245UCS017','245UCS019','245UCS020','245UCS021','245UCS022'],
    // L-DESK-3 col-B (empty)
    [null,null,null,null,null,null],
    // R-DESK-1 col-A
    ['245UCS026','245UCS027','245UCS028','245UCS029','245UCS030','245UCS032'],
    // R-DESK-1 col-B
    ['245UCA077','245UCA078','245UCA079','245UCA080','R-235UCA040','R-235UCA050'],
    // R-DESK-2 col-A
    ['245UCS033','245UCS034','245UCS035','245UCS036','245UCS037','245UCS038'],
    // R-DESK-2 col-B
    ['R-235UCA052','R-235UCA066','R-235UCA069',null,null,null],
    // R-DESK-3 col-A
    ['245UCS041','245UCS042','245UCS043','245UCS044','245UCS045','245UCS046'],
    // R-DESK-3 col-B (empty)
    [null,null,null,null,null,null],
  ];

  for (const col of subCols) {
    for (const roll of col) {
      if (roll) allocs.push(mk(roll)); else skip();
    }
  }
  _seatCounters[R] = seat;
  return allocs;
}

const IL101_ALLOCS = makeIL101Allocs();

// ── IL-102 exact layout — sub-column order for generateSeatingGrid ────────────
// Seats assigned sub-column by sub-column (6 per sub-col):
//   1- 6: L-D1-A (245UCS047-053)           7-12: L-D1-B (225/ICS/001,012,013,014,018,019)
//  13-18: L-D2-A (245UCS054-061)          19-24: L-D2-B (225/ICS/025,026,028,033,034,035)
//  25-30: L-D3-A (245UCS062-067)          31-36: L-D3-B (empty×6)
//  37-42: R-D1-A (225/ICS/036,037,039,042,043,045)  43-48: R-D1-B (245UCS068,070,072,073,074,075)
//  49-54: R-D2-A (225/ICS/049,052,054,057,058,059)  55-60: R-D2-B (245UCS076-081)
//  61-66: R-D3-A (225/ICS/060,empty×5)    67-72: R-D3-B (255PCS009,011,017,022,empty×2)
function makeIL102Allocs() {
  const R = 1002;
  let seat = 1;
  const allocs = [];
  const mk = (roll) => ({ allocation_id: _allocId++, exam_id: 2001, roll_no: roll, room_id: R, seat_no: seat++ });
  const skip = () => { seat++; };

  const subCols = [
    // L-DESK-1 col-A
    ['245UCS047','245UCS048','245UCS050','245UCS051','245UCS052','245UCS053'],
    // L-DESK-1 col-B
    ['225/ICS/001','225/ICS/012','225/ICS/013','225/ICS/014','225/ICS/018','225/ICS/019'],
    // L-DESK-2 col-A
    ['245UCS054','245UCS055','245UCS056','245UCS057','245UCS058','245UCS061'],
    // L-DESK-2 col-B
    ['225/ICS/025','225/ICS/026','225/ICS/028','225/ICS/033','225/ICS/034','225/ICS/035'],
    // L-DESK-3 col-A
    ['245UCS062','245UCS063','245UCS064','245UCS065','245UCS066','245UCS067'],
    // L-DESK-3 col-B (empty)
    [null,null,null,null,null,null],
    // R-DESK-1 col-A
    ['225/ICS/036','225/ICS/037','225/ICS/039','225/ICS/042','225/ICS/043','225/ICS/045'],
    // R-DESK-1 col-B
    ['245UCS068','245UCS070','245UCS072','245UCS073','245UCS074','245UCS075'],
    // R-DESK-2 col-A
    ['225/ICS/049','225/ICS/052','225/ICS/054','225/ICS/057','225/ICS/058','225/ICS/059'],
    // R-DESK-2 col-B
    ['245UCS076','245UCS077','245UCS078','245UCS079','245UCS080','245UCS081'],
    // R-DESK-3 col-A
    ['225/ICS/060',null,null,null,null,null],
    // R-DESK-3 col-B (255PCS — highlighted yellow in sheet)
    ['255PCS009','255PCS011','255PCS017','255PCS022',null,null],
  ];

  for (const col of subCols) {
    for (const roll of col) {
      if (roll) allocs.push(mk(roll)); else skip();
    }
  }
  _seatCounters[R] = seat;
  return allocs;
}

const IL102_ALLOCS = makeIL102Allocs();

// ── Generic room layout builder ───────────────────────────────────────────────
// subCols: array of 12 arrays (one per sub-column), each with roll numbers or null
// Seat numbers assigned sub-column by sub-column, top to bottom.
function makeRoomAllocs(roomId, subCols) {
  let seat = 1;
  const allocs = [];
  const mk = (roll) => ({ allocation_id: _allocId++, exam_id: 2001, roll_no: roll, room_id: roomId, seat_no: seat++ });
  const skip = () => { seat++; };
  for (const col of subCols) {
    for (const roll of col) {
      if (roll) allocs.push(mk(roll)); else skip();
    }
  }
  _seatCounters[roomId] = seat;
  return allocs;
}

// ── Helper: split a flat array into N equal-ish chunks ────────────────────────
function splitInto(arr, n) {
  const chunks = Array.from({ length: n }, () => []);
  arr.forEach((item, i) => chunks[i % n].push(item));
  return chunks;
}

// ── Helper: pad array to length with nulls ────────────────────────────────────
function pad(arr, len) {
  const out = [...arr];
  while (out.length < len) out.push(null);
  return out.slice(0, len);
}

// ── IL-201: 245UCS122-153 (32 CSE) + 245UAI001-013 (13 AI) = 45 students ─────
// Interleave CSE and AI across desks. CSE fills L-D1-A, L-D1-B, L-D2-A, L-D2-B, L-D3-A
// AI fills L-D3-B, R-D1-A, R-D1-B (partial)
function makeIL201Allocs() {
  const cse = [];
  for (let i = 122; i <= 153; i++) cse.push(`245UCS${String(i).padStart(3,'0')}`);
  const ai = [];
  for (let i = 1; i <= 13; i++) ai.push(`245UAI${String(i).padStart(3,'0')}`);

  // Distribute: 6 sub-cols for CSE (6 each = 36 slots, use 32), 6 sub-cols for AI (6 each = 36 slots, use 13)
  // Layout: alternate CSE/AI per desk to separate branches
  // L-D1-A: CSE[0-5], L-D1-B: AI[0-5], L-D2-A: CSE[6-11], L-D2-B: AI[6-11]
  // L-D3-A: CSE[12-17], L-D3-B: CSE[18-23]
  // R-D1-A: CSE[24-29], R-D1-B: CSE[30-31]+null×4
  // R-D2-A..R-D3-B: empty
  const subCols = [
    pad(cse.slice(0,6),   6),  // L-D1-A
    pad(ai.slice(0,6),    6),  // L-D1-B
    pad(cse.slice(6,12),  6),  // L-D2-A
    pad(ai.slice(6,12),   6),  // L-D2-B
    pad(cse.slice(12,18), 6),  // L-D3-A
    pad(ai.slice(12,13),  6),  // L-D3-B (only 1 AI left)
    pad(cse.slice(18,24), 6),  // R-D1-A
    pad(cse.slice(24,30), 6),  // R-D1-B
    pad(cse.slice(30,32), 6),  // R-D2-A (2 remaining CSE)
    new Array(6).fill(null),   // R-D2-B
    new Array(6).fill(null),   // R-D3-A
    new Array(6).fill(null),   // R-D3-B
  ];
  return makeRoomAllocs(1004, subCols);
}

// ── IL-202: 245UCS155-238 (84 CSE only) ──────────────────────────────────────
function makeIL202Allocs() {
  const cse = [];
  for (let i = 155; i <= 238; i++) cse.push(`245UCS${String(i).padStart(3,'0')}`);
  // 84 students across 12 sub-cols = 7 per sub-col
  const subCols = Array.from({ length: 12 }, (_, c) => pad(cse.slice(c*7, c*7+7), 7));
  return makeRoomAllocs(1005, subCols);
}

// ── IL-203: 245UCS239-268 (30 CSE) + 245UAI015-046 (32 AI) = 62 students ─────
function makeIL203Allocs() {
  const cse = [];
  for (let i = 239; i <= 268; i++) cse.push(`245UCS${String(i).padStart(3,'0')}`);
  const ai = [];
  for (let i = 15; i <= 46; i++) ai.push(`245UAI${String(i).padStart(3,'0')}`);

  // Alternate CSE/AI per sub-col: L-D1-A=CSE, L-D1-B=AI, L-D2-A=CSE, L-D2-B=AI ...
  // 30 CSE across 6 sub-cols = 5 each; 32 AI across 6 sub-cols = ~5-6 each
  const subCols = [
    pad(cse.slice(0,5),   6),  // L-D1-A CSE
    pad(ai.slice(0,6),    6),  // L-D1-B AI
    pad(cse.slice(5,10),  6),  // L-D2-A CSE
    pad(ai.slice(6,12),   6),  // L-D2-B AI
    pad(cse.slice(10,15), 6),  // L-D3-A CSE
    pad(ai.slice(12,18),  6),  // L-D3-B AI
    pad(cse.slice(15,20), 6),  // R-D1-A CSE
    pad(ai.slice(18,24),  6),  // R-D1-B AI
    pad(cse.slice(20,25), 6),  // R-D2-A CSE
    pad(ai.slice(24,30),  6),  // R-D2-B AI
    pad(cse.slice(25,30), 6),  // R-D3-A CSE
    pad(ai.slice(30,32),  6),  // R-D3-B AI (2 remaining)
  ];
  return makeRoomAllocs(1006, subCols);
}

// ── IL-204: CSE(269-284=16) + 255LCS(1-11=11) + R-235UCS×4 + 245UAI(047-091=45) = 76 ──
function makeIL204Allocs() {
  const cse = [];
  for (let i = 269; i <= 284; i++) cse.push(`245UCS${String(i).padStart(3,'0')}`);
  for (let i = 1; i <= 11; i++) cse.push(`255LCS${String(i).padStart(3,'0')}`);
  cse.push('R-235UCS020','R-235UCS033','R-235UCS044','R-235UCS049'); // 4 repeat CSE
  // total CSE-side = 31
  const ai = [];
  for (let i = 47; i <= 91; i++) ai.push(`245UAI${String(i).padStart(3,'0')}`);
  // total AI = 45

  // 31 CSE + 45 AI = 76 across 12 sub-cols
  // Alternate: L-D1-A=CSE, L-D1-B=AI, L-D2-A=CSE, L-D2-B=AI ...
  // CSE: 6 sub-cols × ~5-6 = 31; AI: 6 sub-cols × ~7-8 = 45
  const subCols = [
    pad(cse.slice(0,6),   6),  // L-D1-A CSE
    pad(ai.slice(0,8),    8),  // L-D1-B AI
    pad(cse.slice(6,12),  6),  // L-D2-A CSE
    pad(ai.slice(8,16),   8),  // L-D2-B AI
    pad(cse.slice(12,18), 6),  // L-D3-A CSE
    pad(ai.slice(16,24),  8),  // L-D3-B AI
    pad(cse.slice(18,24), 6),  // R-D1-A CSE
    pad(ai.slice(24,32),  8),  // R-D1-B AI
    pad(cse.slice(24,30), 6),  // R-D2-A CSE
    pad(ai.slice(32,40),  8),  // R-D2-B AI
    pad(cse.slice(30,31), 6),  // R-D3-A CSE (1 remaining)
    pad(ai.slice(40,45),  6),  // R-D3-B AI (5 remaining)
  ];
  return makeRoomAllocs(1007, subCols);
}

// ── IL-205: R-235UCS×3 + R-245LCS×3 + R-225/UCF×3 + 245ICS001-015(15) + 245UAI092-131(40) = 64 ──
function makeIL205Allocs() {
  const special = ['R-235UCS053','R-235UCS061','R-235UCS114',
                   'R-245LCS004','R-245LCS010','R-245LCS016',
                   'R-225/UCF/001','R-225/UCF/059','R-225/UCF/070'];
  const ics = [];
  for (let i = 1; i <= 15; i++) ics.push(`245ICS${String(i).padStart(3,'0')}`);
  const ai = [];
  for (let i = 92; i <= 131; i++) ai.push(`245UAI${String(i).padStart(3,'0')}`);

  // special(9) + ics(15) = 24 on one side; ai(40) on other side
  // L side: special + ICS; R side: AI
  const leftStudents = [...special, ...ics]; // 24
  const subCols = [
    pad(leftStudents.slice(0,6),  6),  // L-D1-A
    pad(leftStudents.slice(6,12), 6),  // L-D1-B
    pad(leftStudents.slice(12,18),6),  // L-D2-A
    pad(leftStudents.slice(18,24),6),  // L-D2-B
    new Array(6).fill(null),           // L-D3-A (empty)
    new Array(6).fill(null),           // L-D3-B (empty)
    pad(ai.slice(0,7),  7),            // R-D1-A
    pad(ai.slice(7,14), 7),            // R-D1-B
    pad(ai.slice(14,21),7),            // R-D2-A
    pad(ai.slice(21,28),7),            // R-D2-B
    pad(ai.slice(28,35),7),            // R-D3-A
    pad(ai.slice(35,40),6),            // R-D3-B (5 remaining)
  ];
  return makeRoomAllocs(1008, subCols);
}

// ── IL-206: 245ICS016-042(27) + 245UAI132-143(12) + 255LAI×2 + R-235UAI×2 + R-245LAI×1 = 44 ──
function makeIL206Allocs() {
  const ics = [];
  for (let i = 16; i <= 42; i++) ics.push(`245ICS${String(i).padStart(3,'0')}`);
  const ai = [];
  for (let i = 132; i <= 143; i++) ai.push(`245UAI${String(i).padStart(3,'0')}`);
  ai.push('255LAI001','255LAI002','R-235UAI054','R-235UAI060','R-245LAI003');
  // ics=27, ai=17 = 44 total

  const subCols = [
    pad(ics.slice(0,6),   6),  // L-D1-A ICS
    pad(ai.slice(0,6),    6),  // L-D1-B AI
    pad(ics.slice(6,12),  6),  // L-D2-A ICS
    pad(ai.slice(6,12),   6),  // L-D2-B AI
    pad(ics.slice(12,18), 6),  // L-D3-A ICS
    pad(ai.slice(12,17),  6),  // L-D3-B AI (5 remaining)
    pad(ics.slice(18,24), 6),  // R-D1-A ICS
    new Array(6).fill(null),   // R-D1-B empty
    pad(ics.slice(24,27), 6),  // R-D2-A ICS (3 remaining)
    new Array(6).fill(null),   // R-D2-B empty
    new Array(6).fill(null),   // R-D3-A empty
    new Array(6).fill(null),   // R-D3-B empty
  ];
  return makeRoomAllocs(1009, subCols);
}

const IL201_ALLOCS = makeIL201Allocs();
const IL202_ALLOCS = makeIL202Allocs();
const IL203_ALLOCS = makeIL203Allocs();
const IL204_ALLOCS = makeIL204Allocs();
const IL205_ALLOCS = makeIL205Allocs();
const IL206_ALLOCS = makeIL206Allocs();

// ── RAW ALLOCATIONS ───────────────────────────────────────────────────────────
const RAW_ALLOCS = [

  // IL-200: CSE only (sequential, single programme)
  ...generateRange('245UCS', 82, 121, 1003),

  // IL-201: CSE + AI interleaved
  ...IL201_ALLOCS,
  // IL-202: CSE only
  ...IL202_ALLOCS,
  // IL-203: CSE + AI interleaved
  ...IL203_ALLOCS,
  // IL-204: CSE + AI interleaved
  ...IL204_ALLOCS,
  // IL-205: special CSE + ICS + AI interleaved
  ...IL205_ALLOCS,
  // IL-206: ICS + AI interleaved
  ...IL206_ALLOCS,

  // IT-201, IT-202, IT-203: ICS — sub-column ordered for small room grid
  ...makeRoomAllocs(1010, [
    // IT-201: 245ICS046-058 (13 students), 5 cols × 3 rows
    // Col-0: 046,047,048  Col-1: 049,050,051  Col-2: 052,053,054  Col-3: 055,056,057  Col-4: 058
    ['245ICS046','245ICS047','245ICS048'],
    ['245ICS049','245ICS050','245ICS051'],
    ['245ICS052','245ICS053','245ICS054'],
    ['245ICS055','245ICS056','245ICS057'],
    ['245ICS058',null,null],
  ]),
  ...makeRoomAllocs(1011, [
    // IT-202: 245ICS059-070 (11 students, skip 065), 5 cols
    // Col-0: 059,060,061,062  Col-1: empty  Col-2: 063,064,066,067  Col-3: empty  Col-4: 068,069,070
    ['245ICS059','245ICS060','245ICS061','245ICS062'],
    [null,null,null,null],
    ['245ICS063','245ICS064','245ICS066','245ICS067'],
    [null,null,null,null],
    ['245ICS068','245ICS069','245ICS070',null],
  ]),
  ...makeRoomAllocs(1012, [
    // IT-203: R-235ICS027,032,037,072,073,075 (6 students), 5 cols
    // Col-0: 027,032,037,072  Col-1: empty  Col-2: 073,075  Col-3: empty  Col-4: empty
    ['R-235ICS027','R-235ICS032','R-235ICS037','R-235ICS072'],
    [null,null,null,null],
    ['R-235ICS073','R-235ICS075',null,null],
    [null,null,null,null],
    [null,null,null,null],
  ]),

  // IL-101: CSE + BCA interleaved
  ...IL101_ALLOCS,
  // IL-102: CSE + ICS(AIR) + PCS(AIR) interleaved
  ...IL102_ALLOCS,

  // ── NB rooms: sub-column ordered for 3-section NB layout (14 sub-cols) ──────

  // IL-103 (NB): ML(14) + DS(15) + ECE(19) + BCA(15) = 63
  // Section 1 (4 sub-cols): ML + DS start
  // Section 2 (6 sub-cols): DS cont + ECE
  // Section 3 (4 sub-cols): ECE cont + BCA
  ...makeRoomAllocs(1013, (() => {
    const ml  = Array.from({length:14}, (_,i) => `245UCM${String(i+1).padStart(3,'0')}`);
    const ds  = [
      ...Array.from({length:19}, (_,i) => `245UCD${String(i+2).padStart(3,'0')}`),
    ].slice(0,15); // 245UCD002-016 = 15
    const ece = [
      ...Array.from({length:14}, (_,i) => `245UEC${String(i+1).padStart(3,'0')}`),
      '235UEC002','235UEC003','235UEC004','235UEC013',
      'R-215/UEC/048','R-235/LEC/001',
    ]; // 14+4+1+1 = 20 → but we need 19 for 63 total; drop last R-235
    const ece19 = ece.slice(0,19);
    const bca  = Array.from({length:15}, (_,i) => `245UCA${String(i+1).padStart(3,'0')}`);
    // 14 sub-cols, 5 rows each = 70 slots; 63 students
    const all  = [...ml, ...ds, ...ece19, ...bca]; // 63
    const SUBCOLS = 14;
    const base = Math.floor(all.length / SUBCOLS);
    const rem  = all.length % SUBCOLS;
    let cur = 0;
    return Array.from({length: SUBCOLS}, (_, i) => {
      const size = i < rem ? base + 1 : base;
      const col  = all.slice(cur, cur + size);
      cur += size;
      // pad to uniform length
      while (col.length < (i < rem ? base + 1 : base)) col.push(null);
      return col;
    });
  })()),

  // IL-104 (NB): DS(20) + CySec(16) + IT(17) + PCW(11) = 64
  ...makeRoomAllocs(1014, (() => {
    const ds   = Array.from({length:20}, (_,i) => `245UCD${String(i+22).padStart(3,'0')}`); // 022-041
    const cyse = Array.from({length:16}, (_,i) => `245UCC${String(i+1).padStart(3,'0')}`);
    const it   = Array.from({length:17}, (_,i) => `245UIT${String(i+1).padStart(3,'0')}`);
    const pcw  = Array.from({length:11}, (_,i) => `255PCW${String(i+1).padStart(3,'0')}`);
    const all  = [...ds, ...cyse, ...it, ...pcw]; // 64
    const SUBCOLS = 14;
    const base = Math.floor(all.length / SUBCOLS);
    const rem  = all.length % SUBCOLS;
    let cur = 0;
    return Array.from({length: SUBCOLS}, (_, i) => {
      const size = i < rem ? base + 1 : base;
      const col  = all.slice(cur, cur + size);
      cur += size;
      return col;
    });
  })()),

  // IL-105 (NB): IT(22) + CySec(20) + ECE-AI(20) + BCA(19) = 81 → actual: IT(20+2=22), CySec(20), ECE-AI(19+1=20), BCA(19)
  ...makeRoomAllocs(1015, (() => {
    const it   = [
      ...Array.from({length:20}, (_,i) => `245UIT${String(i+18).padStart(3,'0')}`), // 018-037
      '255LIT001','255LIT002',
    ]; // 22
    const cyse = Array.from({length:20}, (_,i) => `245UCC${String(i+18).padStart(3,'0')}`); // 018-037
    const eai  = [
      ...Array.from({length:19}, (_,i) => `245UEA${String(i+1).padStart(3,'0')}`),
      '255LEA001',
    ]; // 20
    const bca  = Array.from({length:19}, (_,i) => `245UCA${String(i+24).padStart(3,'0')}`); // 024-042
    const all  = [...it, ...cyse, ...eai, ...bca]; // 81
    const SUBCOLS = 14;
    const base = Math.floor(all.length / SUBCOLS);
    const rem  = all.length % SUBCOLS;
    let cur = 0;
    return Array.from({length: SUBCOLS}, (_, i) => {
      const size = i < rem ? base + 1 : base;
      const col  = all.slice(cur, cur + size);
      cur += size;
      return col;
    });
  })()),

  // IL-106 (NB): DS(25) + ICS-DS(21) + VLSI(6) + IEC(2) + BCA(16) = 70
  ...makeRoomAllocs(1016, (() => {
    const ds   = Array.from({length:25}, (_,i) => `245UCD${String(i+42).padStart(3,'0')}`); // 042-066
    const ics  = ['225/ICS/002','225/ICS/005','225/ICS/008','225/ICS/009','225/ICS/011',
                  '225/ICS/015','225/ICS/016','225/ICS/017','225/ICS/020','225/ICS/023',
                  '225/ICS/027','225/ICS/029','225/ICS/030','225/ICS/031','225/ICS/032',
                  '225/ICS/038','225/ICS/040','225/ICS/051','225/ICS/053','225/ICS/055',
                  '225/ICS/056']; // 21
    const vlsi = Array.from({length:6}, (_,i) => `245UVL${String(i+1).padStart(3,'0')}`);
    const iec  = ['225/IEC/001','225/IEC/002'];
    const bca  = Array.from({length:16}, (_,i) => `245UCA${String(i+43).padStart(3,'0')}`); // 043-058
    const all  = [...ds, ...ics, ...vlsi, ...iec, ...bca]; // 70
    const SUBCOLS = 14;
    const base = Math.floor(all.length / SUBCOLS);
    const rem  = all.length % SUBCOLS;
    let cur = 0;
    return Array.from({length: SUBCOLS}, (_, i) => {
      const size = i < rem ? base + 1 : base;
      const col  = all.slice(cur, cur + size);
      cur += size;
      return col;
    });
  })()),

  // IL-200 (SOICT): PCS(DS) + ICS(SE) + PCS(SE)
  ...['255PCS002','255PCS003','255PCS004','255PCS005','255PCS006','255PCS007','255PCS010',
      '255PCS012','255PCS013','255PCS014','255PCS015','255PCS016','255PCS018','255PCS019',
      '255PCS021','255PCS023'].map(r => makeAlloc(r, 1003)),
  ...['225/ICS/006','225/ICS/007','225/ICS/010','225/ICS/047','225/ICS/050'].map(r => makeAlloc(r, 1003)),
  makeAlloc('255PCS020', 1003),

  // IL-206 AI extras (255LAI, R-235UAI, R-245LAI already in IL206_ALLOCS)
  // IL-102 extras already in IL102_ALLOCS
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
      name:       '',
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
  return RAW_ALLOCS
    .filter(a => rollToId[a.roll_no] !== undefined)
    .map((a, i) => ({
      allocation_id: 10000 + i,
      exam_id:       a.exam_id,
      student_id:    rollToId[a.roll_no],
      room_id:       a.room_id,
      seat_no:       a.seat_no,
    }));
}
