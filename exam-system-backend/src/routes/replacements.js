const router = require('express').Router();
const db     = require('../database/db');
const auth   = require('../middleware/auth');

router.get('/', auth(), (req, res) => {
  const rows = db.prepare(`
    SELECT r.*,
           f1.name as original_faculty_name,
           f2.name as replacement_faculty_name,
           e.exam_name, e.date, e.session
    FROM replacements r
    JOIN faculty f1 ON r.original_faculty_id = f1.faculty_id
    LEFT JOIN faculty f2 ON r.replacement_faculty_id = f2.faculty_id
    JOIN exams e ON r.exam_id = e.exam_id
    ORDER BY r.created_at DESC
  `).all();
  res.json(rows);
});

router.post('/', auth(), (req, res) => {
  const { exam_id, original_faculty_id, replacement_faculty_id, reason } = req.body;
  if (!exam_id || !original_faculty_id) return res.status(400).json({ error: 'exam_id and original_faculty_id required' });
  const r = db.prepare(`
    INSERT INTO replacements (exam_id, original_faculty_id, replacement_faculty_id, reason, requested_by)
    VALUES (?,?,?,?,?)
  `).run(exam_id, original_faculty_id, replacement_faculty_id, reason, req.user.user_id);
  res.status(201).json({ replacement_id: r.lastInsertRowid });
});

router.put('/:id/approve', auth(['admin', 'exam_cell']), (req, res) => {
  db.prepare(`UPDATE replacements SET status='Approved', approved_by=?, updated_at=datetime('now') WHERE replacement_id=?`).run(req.user.user_id, req.params.id);
  // Update invigilation allocation
  const rep = db.prepare('SELECT * FROM replacements WHERE replacement_id = ?').get(req.params.id);
  if (rep?.replacement_faculty_id) {
    db.prepare(`UPDATE invigilation_allocations SET faculty_id=? WHERE exam_id=? AND faculty_id=?`).run(rep.replacement_faculty_id, rep.exam_id, rep.original_faculty_id);
  }
  res.json({ message: 'Approved and duty reassigned' });
});

router.put('/:id/reject', auth(['admin', 'exam_cell']), (req, res) => {
  db.prepare(`UPDATE replacements SET status='Rejected', approved_by=?, updated_at=datetime('now') WHERE replacement_id=?`).run(req.user.user_id, req.params.id);
  res.json({ message: 'Rejected' });
});

module.exports = router;
