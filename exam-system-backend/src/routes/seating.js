const router = require('express').Router();
const db     = require('../database/db');
const auth   = require('../middleware/auth');

// GET /api/seating?exam_id=&room_id=
router.get('/', auth(), (req, res) => {
  const { exam_id, room_id } = req.query;
  let sql = `
    SELECT sa.*, s.roll_no, s.name, s.branch, s.semester, s.section,
           r.room_no, r.building
    FROM seating_allocations sa
    JOIN students s ON sa.student_id = s.student_id
    JOIN rooms    r ON sa.room_id    = r.room_id
    WHERE 1=1
  `;
  const params = [];
  if (exam_id) { sql += ' AND sa.exam_id = ?'; params.push(exam_id); }
  if (room_id) { sql += ' AND sa.room_id = ?'; params.push(room_id); }
  sql += ' ORDER BY r.room_no, sa.seat_no';
  res.json(db.prepare(sql).all(...params));
});

// POST /api/seating/generate  — auto-allocate
router.post('/generate', auth(['admin', 'exam_cell']), (req, res) => {
  const { exam_id, student_ids, room_ids } = req.body;
  if (!exam_id || !student_ids?.length || !room_ids?.length)
    return res.status(400).json({ error: 'exam_id, student_ids and room_ids are required' });

  // Sort students by roll_no
  const placeholders = student_ids.map(() => '?').join(',');
  const students = db.prepare(`SELECT * FROM students WHERE student_id IN (${placeholders}) ORDER BY roll_no`).all(...student_ids);

  // Get rooms with capacity
  const roomPlaceholders = room_ids.map(() => '?').join(',');
  const rooms = db.prepare(`SELECT * FROM rooms WHERE room_id IN (${roomPlaceholders})`).all(...room_ids);

  const totalCapacity = rooms.reduce((s, r) => s + r.capacity, 0);
  if (students.length > totalCapacity)
    return res.status(400).json({ error: `Not enough capacity. ${students.length} students, ${totalCapacity} seats.` });

  // Remove existing allocations for this exam
  db.prepare('DELETE FROM seating_allocations WHERE exam_id = ?').run(exam_id);

  const insert = db.prepare('INSERT INTO seating_allocations (exam_id, student_id, room_id, seat_no) VALUES (?,?,?,?)');
  const allocate = db.transaction(() => {
    let si = 0;
    const allocs = [];
    for (const room of rooms) {
      for (let seat = 1; seat <= room.capacity && si < students.length; seat++) {
        insert.run(exam_id, students[si].student_id, room.room_id, seat);
        allocs.push({ student_id: students[si].student_id, roll_no: students[si].roll_no, room_id: room.room_id, room_no: room.room_no, seat_no: seat });
        si++;
      }
    }
    return allocs;
  });

  const allocs = allocate();
  res.json({ message: `${allocs.length} students allocated`, count: allocs.length, allocations: allocs });
});

// DELETE /api/seating/:exam_id  — clear allocations for exam
router.delete('/:exam_id', auth(['admin', 'exam_cell']), (req, res) => {
  const r = db.prepare('DELETE FROM seating_allocations WHERE exam_id = ?').run(req.params.exam_id);
  res.json({ message: `Cleared ${r.changes} allocations` });
});

// GET /api/seating/room-summary/:exam_id
router.get('/room-summary/:exam_id', auth(), (req, res) => {
  const rows = db.prepare(`
    SELECT r.room_id, r.room_no, r.building, r.capacity,
           COUNT(sa.allocation_id) as allocated
    FROM rooms r
    LEFT JOIN seating_allocations sa ON sa.room_id = r.room_id AND sa.exam_id = ?
    GROUP BY r.room_id
    HAVING allocated > 0
    ORDER BY r.room_no
  `).all(req.params.exam_id);
  res.json(rows);
});

module.exports = router;
