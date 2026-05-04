/**
 * generateSeating.js
 *
 * Anti-cheating seating layout:
 *   Adjacent seats (col-A and col-B of the same desk row) MUST have different courses.
 *
 * Strategy:
 *   1. Group students by course code.
 *   2. For each desk pair (col-A, col-B), assign students from different courses.
 *   3. Use a greedy algorithm: always pick the largest remaining group that
 *      differs from the previous sub-column's course.
 *
 * Three layout modes:
 *   'large' — IL-series SOICT: 2 sides × 3 desks × 2 sub-cols (12 sub-cols + gap)
 *   'nb'    — New Building: 3 sections (4+6+4 sub-cols + 2 gaps)
 *   'small' — IT-series: single board, 5 cols, no gap
 */

// ── Core interleaving ─────────────────────────────────────────────────────────

/**
 * Distribute students across numSubCols sub-columns so that for every desk row,
 * col-A and col-B have different courses.
 *
 * Approach: build a flat interleaved sequence first, then slice into sub-columns.
 * The flat sequence alternates between two "streams":
 *   - Even positions (0,2,4,...) → stream A
 *   - Odd positions  (1,3,5,...) → stream B
 * Stream A and stream B are filled from different course groups so that
 * position 2k and 2k+1 (which map to col-A and col-B of the same desk row) differ.
 *
 * @param {Array}  students    Enriched allocation objects.
 * @param {number} numSubCols  12 for large rooms, 14 for NB rooms.
 * @returns {Array[]}          numSubCols arrays of allocation objects.
 */
function interleaveByourse(students, numSubCols) {
  if (students.length === 0) return Array.from({ length: numSubCols }, () => []);

  const total    = students.length;
  const baseSize = Math.floor(total / numSubCols);
  const extra    = total % numSubCols;

  // Group by course, sort each group by roll_no
  const courseMap = {};
  students.forEach(s => {
    const code = s.course?.code || '--';
    if (!courseMap[code]) courseMap[code] = [];
    courseMap[code].push(s);
  });

  const groups = Object.values(courseMap).sort((a, b) => b.length - a.length);

  // If only one course, just distribute evenly — can't avoid same-course adjacency
  if (groups.length === 1) {
    const subCols = Array.from({ length: numSubCols }, () => []);
    let cursor = 0;
    for (let col = 0; col < numSubCols; col++) {
      const colSize = col < extra ? baseSize + 1 : baseSize;
      subCols[col] = students.slice(cursor, cursor + colSize);
      cursor += colSize;
    }
    return subCols;
  }

  // Build two interleaved streams:
  //   streamA fills even sub-col indices (col-A of each desk pair)
  //   streamB fills odd  sub-col indices (col-B of each desk pair)
  // Each stream gets numSubCols/2 sub-columns worth of students.
  // We assign groups to streams so that streamA and streamB have different courses
  // at every row position.

  // Total slots per stream
  const halfCols  = Math.ceil(numSubCols / 2);  // even cols count
  const halfCols2 = Math.floor(numSubCols / 2); // odd cols count

  // Compute how many students go into even vs odd sub-cols
  let evenTotal = 0, oddTotal = 0;
  for (let col = 0; col < numSubCols; col++) {
    const colSize = col < extra ? baseSize + 1 : baseSize;
    if (col % 2 === 0) evenTotal += colSize;
    else               oddTotal  += colSize;
  }

  // Build streamA (for even cols) and streamB (for odd cols) by interleaving groups
  // such that at each row position i, streamA[i].course !== streamB[i].course.
  // Strategy: round-robin between groups, alternating which group goes to A vs B.

  const ptrs = groups.map(() => 0);
  const streamA = [];
  const streamB = [];

  // We fill row by row: for each row, pick one student for A and one for B from different groups
  const maxRowsNeeded = Math.max(evenTotal, oddTotal);

  for (let row = 0; row < maxRowsNeeded; row++) {
    // Pick for A: group with most remaining
    let gA = -1, bestA = -1;
    for (let g = 0; g < groups.length; g++) {
      const rem = groups[g].length - ptrs[g];
      if (rem > bestA) { bestA = rem; gA = g; }
    }

    // Pick for B: group with most remaining that differs from gA's course
    const courseA = gA >= 0 ? groups[gA][ptrs[gA]]?.course?.code : null;
    let gB = -1, bestB = -1;
    for (let g = 0; g < groups.length; g++) {
      if (g === gA) continue;
      const rem  = groups[g].length - ptrs[g];
      const code = groups[g][ptrs[g]]?.course?.code;
      if (rem > 0 && code !== courseA && rem > bestB) { bestB = rem; gB = g; }
    }
    // Fallback: if no different group available, pick any remaining
    if (gB === -1) {
      for (let g = 0; g < groups.length; g++) {
        if (g === gA) continue;
        const rem = groups[g].length - ptrs[g];
        if (rem > bestB) { bestB = rem; gB = g; }
      }
    }
    // Last resort: same group
    if (gB === -1) gB = gA;

    if (streamA.length < evenTotal && gA >= 0 && ptrs[gA] < groups[gA].length) {
      streamA.push(groups[gA][ptrs[gA]++]);
    }
    if (streamB.length < oddTotal && gB >= 0 && ptrs[gB] < groups[gB].length) {
      streamB.push(groups[gB][ptrs[gB]++]);
    }

    // If one stream is full, drain remaining into the other
    if (streamA.length >= evenTotal && streamB.length < oddTotal) {
      // Fill streamB from any remaining
      for (let g = 0; g < groups.length && streamB.length < oddTotal; g++) {
        while (ptrs[g] < groups[g].length && streamB.length < oddTotal) {
          streamB.push(groups[g][ptrs[g]++]);
        }
      }
      break;
    }
    if (streamB.length >= oddTotal && streamA.length < evenTotal) {
      for (let g = 0; g < groups.length && streamA.length < evenTotal; g++) {
        while (ptrs[g] < groups[g].length && streamA.length < evenTotal) {
          streamA.push(groups[g][ptrs[g]++]);
        }
      }
      break;
    }
  }

  // Slice streams into sub-columns
  const subCols = Array.from({ length: numSubCols }, () => []);
  let curA = 0, curB = 0;
  for (let col = 0; col < numSubCols; col++) {
    const colSize = col < extra ? baseSize + 1 : baseSize;
    if (col % 2 === 0) {
      subCols[col] = streamA.slice(curA, curA + colSize);
      curA += colSize;
    } else {
      subCols[col] = streamB.slice(curB, curB + colSize);
      curB += colSize;
    }
  }

  return subCols;
}

// ── Layout builders ───────────────────────────────────────────────────────────

/**
 * Large room (IL-series SOICT): 12 sub-cols, gap at row-index 6.
 */
export function generateSeatingGrid(students) {
  if (students.length === 0) return { rows: [], layout: 'large' };
  const sc = interleaveByourse(students, 12);
  const maxRows = Math.max(...sc.map(c => c.length), 1);
  const rows = Array.from({ length: maxRows }, (_, r) => [
    sc[0][r]  || null, sc[1][r]  || null,   // L-D1
    sc[2][r]  || null, sc[3][r]  || null,   // L-D2
    sc[4][r]  || null, sc[5][r]  || null,   // L-D3
    null,                                    // GAP
    sc[6][r]  || null, sc[7][r]  || null,   // R-D1
    sc[8][r]  || null, sc[9][r]  || null,   // R-D2
    sc[10][r] || null, sc[11][r] || null,   // R-D3
  ]);
  return { rows, layout: 'large' };
}

/**
 * New Building room (NB IL-series): 14 sub-cols, gaps at row-indices 4 and 11.
 */
export function generateNBRoomGrid(students) {
  if (students.length === 0) return { rows: [], layout: 'nb' };
  const sc = interleaveByourse(students, 14);
  const maxRows = Math.max(...sc.map(c => c.length), 1);
  const rows = Array.from({ length: maxRows }, (_, r) => [
    sc[0][r]  || null, sc[1][r]  || null,   // S1-D1
    sc[2][r]  || null, sc[3][r]  || null,   // S1-D2
    null,                                    // GAP-1
    sc[4][r]  || null, sc[5][r]  || null,   // S2-D1
    sc[6][r]  || null, sc[7][r]  || null,   // S2-D2
    sc[8][r]  || null, sc[9][r]  || null,   // S2-D3
    null,                                    // GAP-2
    sc[10][r] || null, sc[11][r] || null,   // S3-D1
    sc[12][r] || null, sc[13][r] || null,   // S3-D2
  ]);
  return { rows, layout: 'nb' };
}

/**
 * Small room (IT-series): single board, N cols, no gap.
 * Usually single-course rooms — no interleaving needed.
 */
export function generateSmallRoomGrid(students, numCols = 5) {
  if (students.length === 0) return { rows: [], numCols, layout: 'small' };
  const rowsPerCol = Math.ceil(students.length / numCols);
  const cols = Array.from({ length: numCols }, (_, c) =>
    students.slice(c * rowsPerCol, (c + 1) * rowsPerCol)
  );
  const maxRows = Math.max(...cols.map(c => c.length), 1);
  const rows = Array.from({ length: maxRows }, (_, r) =>
    cols.map(col => col[r] || null)
  );
  return { rows, numCols, layout: 'small' };
}

/**
 * Auto-detect layout from room metadata and build the grid.
 *
 * @param {Array}  students  Enriched allocation objects for this room.
 * @param {string} roomNo    e.g. 'IL-101', 'IT-202'
 * @param {string} building  e.g. 'SOICT', 'New Building'
 */
export function generateRoomGrid(students, roomNo = '', building = '') {
  const isSmall = /^IT-/i.test(roomNo);
  const isNB    = building === 'New Building';
  if (isSmall) return generateSmallRoomGrid(students, 5);
  if (isNB)    return generateNBRoomGrid(students);
  return generateSeatingGrid(students);
}
