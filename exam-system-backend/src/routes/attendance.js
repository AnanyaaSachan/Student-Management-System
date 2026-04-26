const router = require('express').Router();
const db     = require('../database/db');
const auth   = require('../middleware/auth');

// GET /api/attendance?exam_id=&room_id=
router.get('/', auth(), (req, res) => {
  const { exam_id, room_id } = req.query;
  let sql = `
    SELECT a.*, sa.seat_no, sa.room_id,
           s.roll_no, s.name, s.branch, s.semester,
           r.room_no, r.building
    FROM attendance a
    JOIN seating_allocations sa ON a.allocation_id = sa.allocation_id
    JOIN students s ON sa.student_id = s.student_id
    JOIN rooms    r ON sa.room_id    = r.room_id
    WHERE sa.exam_id = ?
  `;
  const params = [exam_id];
  if (room_id) { sql += ' AND sa.room_id = ?'; params.push(room_id); }
  sql += ' ORDER BY r.room_no, sa.seat_no';
  res.json(db.prepare(sql).all(...params));
});

// POST /api/attendance/mark  — mark single student
router.post('/mark', auth(), (req, res) => {
  const { allocation_id, status, method = 'Manual' } = req.body;
  if (!allocation_id || !status) return res.status(400).json({ error: 'allocation_id and status required' });

  db.prepare(`
    INSERT INTO attendance (allocation_id, status, marked_by, method)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(allocation_id) DO UPDATE SET status=excluded.status, marked_by=excluded.marked_by, marked_at=datetime('now'), method=excluded.method
  `).run(allocation_id, status, req.user.user_id, method);

  res.json({ message: 'Attendance marked', allocation_id, status });
});

// POST /api/attendance/mark-bulk  — mark multiple at once
router.post('/mark-bulk', auth(), (req, res) => {
  const { records } = req.body; // [{ allocation_id, status }]
  if (!Array.isArray(records) || !records.length)
    return res.status(400).json({ error: 'records array required' });

  const upsert = db.prepare(`
    INSERT INTO attendance (allocation_id, status, marked_by, method)
    VALUES (?, ?, ?, 'Bulk')
    ON CONFLICT(allocation_id) DO UPDATE SET status=excluded.status, marked_by=excluded.marked_by, marked_at=datetime('now'), method='Bulk'
  `);
  const markAll = db.transaction((rows) => {
    for (const r of rows) upsert.run(r.allocation_id, r.status, req.user.user_id);
  });
  markAll(records);
  res.json({ message: `Marked ${records.length} records` });
});

// POST /api/attendance/qr-scan  — QR code scan
router.post('/qr-scan', auth(), (req, res) => {
  const { qr_data } = req.body;
  if (!qr_data) return res.status(400).json({ error: 'qr_data required' });

  // Parse: GBU|examId|studentId|rollNo|date|roomId|seatNo
  const parts = qr_data.split('|');
  if (parts[0] !== 'GBU' || parts.length < 7)
    return res.status(400).json({ error: 'Invalid QR code format' });

  const [, examId, studentId, rollNo] = parts;

  const alloc = db.prepare(`
    SELECT sa.allocation_id, sa.exam_id, sa.room_id, sa.seat_no,
           s.roll_no, s.name, r.room_no
    FROM seating_allocations sa
    JOIN students s ON sa.student_id = s.student_id
    JOIN rooms    r ON sa.room_id    = r.room_id
    WHERE sa.exam_id = ? AND sa.student_id = ?
  `).get(examId, studentId);

  if (!alloc) return res.status(404).json({ error: 'Student not found in seating allocation for this exam' });

  const existing = db.prepare('SELECT * FROM attendance WHERE allocation_id = ?').get(alloc.allocation_id);
  if (existing?.status === 'Present')
    return res.status(409).json({ error: 'Already marked Present', student: alloc });

  db.prepare(`
    INSERT INTO attendance (allocation_id, status, marked_by, method)
    VALUES (?, 'Present', ?, 'QR')
    ON CONFLICT(allocation_id) DO UPDATE SET status='Present', marked_by=excluded.marked_by, marked_at=datetime('now'), method='QR'
  `).run(alloc.allocation_id, req.user.user_id);

  res.json({ message: 'Marked Present via QR', student: alloc });
});

// GET /api/attendance/summary/:exam_id
router.get('/summary/:exam_id', auth(), (req, res) => {
  const rows = db.prepare(`
    SELECT r.room_no, r.building,
           COUNT(sa.allocation_id) as total,
           SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as present,
           SUM(CASE WHEN a.status = 'Absent' OR a.status IS NULL THEN 1 ELSE 0 END) as absent
    FROM seating_allocations sa
    JOIN rooms r ON sa.room_id = r.room_id
    LEFT JOIN attendance a ON a.allocation_id = sa.allocation_id
    WHERE sa.exam_id = ?
    GROUP BY r.room_id
    ORDER BY r.room_no
  `).all(req.params.exam_id);
  res.json(rows);
});

// GET /api/attendance/daily-summary/:exam_id  — programme-wise
router.get('/daily-summary/:exam_id', auth(), (req, res) => {
  const rows = db.prepare(`
    SELECT s.section, s.branch, s.semester,
           COUNT(sa.allocation_id) as total,
           SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as present,
           GROUP_CONCAT(CASE WHEN a.status != 'Present' OR a.status IS NULL THEN s.roll_no END) as absent_rolls
    FROM seating_allocations sa
    JOIN students s ON sa.student_id = s.student_id
    LEFT JOIN attendance a ON a.allocation_id = sa.allocation_id
    WHERE sa.exam_id = ?
    GROUP BY s.section, s.branch, s.semester
    ORDER BY s.section
  `).all(req.params.exam_id);
  res.json(rows);
});

module.exports = router;
