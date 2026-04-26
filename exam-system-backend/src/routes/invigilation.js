const router = require('express').Router();
const db     = require('../database/db');
const auth   = require('../middleware/auth');

// GET /api/invigilation?exam_id=
router.get('/', auth(), (req, res) => {
  const { exam_id } = req.query;
  let sql = `
    SELECT ia.*, f.name as faculty_name, f.department, f.phone,
           r.room_no, r.building, e.exam_name, e.date, e.session
    FROM invigilation_allocations ia
    JOIN faculty f ON ia.faculty_id = f.faculty_id
    JOIN rooms   r ON ia.room_id    = r.room_id
    JOIN exams   e ON ia.exam_id    = e.exam_id
    WHERE 1=1
  `;
  const params = [];
  if (exam_id) { sql += ' AND ia.exam_id = ?'; params.push(exam_id); }
  sql += ' ORDER BY r.room_no, ia.role';
  res.json(db.prepare(sql).all(...params));
});

// POST /api/invigilation/generate  — auto-assign (least duties first)
router.post('/generate', auth(['admin', 'exam_cell']), (req, res) => {
  const { exam_id, room_ids } = req.body;
  if (!exam_id || !room_ids?.length)
    return res.status(400).json({ error: 'exam_id and room_ids are required' });

  const faculty = db.prepare('SELECT * FROM faculty WHERE is_available = 1 ORDER BY total_duties ASC').all();
  if (faculty.length < 2) return res.status(400).json({ error: 'Need at least 2 available faculty members' });

  const rooms = db.prepare(`SELECT * FROM rooms WHERE room_id IN (${room_ids.map(() => '?').join(',')})`).all(...room_ids);

  // Remove existing for this exam
  db.prepare('DELETE FROM invigilation_allocations WHERE exam_id = ?').run(exam_id);

  const insert = db.prepare('INSERT INTO invigilation_allocations (exam_id, faculty_id, room_id, role) VALUES (?,?,?,?)');
  const incDuty = db.prepare('UPDATE faculty SET total_duties = total_duties + 1 WHERE faculty_id = ?');

  const assign = db.transaction(() => {
    let fi = 0;
    const duties = [];
    for (const room of rooms) {
      const chief  = faculty[fi % faculty.length];
      const assist = faculty[(fi + 1) % faculty.length];
      fi += 2;
      insert.run(exam_id, chief.faculty_id,  room.room_id, 'Chief');
      insert.run(exam_id, assist.faculty_id, room.room_id, 'Assistant');
      incDuty.run(chief.faculty_id);
      incDuty.run(assist.faculty_id);
      duties.push({ room_no: room.room_no, chief: chief.name, assistant: assist.name });
    }
    return duties;
  });

  const duties = assign();
  res.json({ message: `Assigned invigilators to ${duties.length} rooms`, duties });
});

// PUT /api/invigilation/:duty_id  — edit assignment
router.put('/:duty_id', auth(['admin', 'exam_cell']), (req, res) => {
  const { faculty_id, role } = req.body;
  db.prepare('UPDATE invigilation_allocations SET faculty_id=?, role=? WHERE duty_id=?').run(faculty_id, role, req.params.duty_id);
  res.json({ message: 'Updated' });
});

// DELETE /api/invigilation/:exam_id
router.delete('/:exam_id', auth(['admin']), (req, res) => {
  const r = db.prepare('DELETE FROM invigilation_allocations WHERE exam_id = ?').run(req.params.exam_id);
  res.json({ message: `Cleared ${r.changes} duties` });
});

module.exports = router;
