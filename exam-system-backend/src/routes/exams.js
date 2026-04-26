const router = require('express').Router();
const db     = require('../database/db');
const auth   = require('../middleware/auth');

router.get('/', auth(), (req, res) => {
  const { date, session } = req.query;
  let sql = 'SELECT * FROM exams WHERE 1=1';
  const params = [];
  if (date)    { sql += ' AND date = ?';    params.push(date); }
  if (session) { sql += ' AND session = ?'; params.push(session); }
  sql += ' ORDER BY date ASC, session ASC';
  res.json(db.prepare(sql).all(...params));
});

router.get('/:id', auth(), (req, res) => {
  const e = db.prepare('SELECT * FROM exams WHERE exam_id = ?').get(req.params.id);
  if (!e) return res.status(404).json({ error: 'Exam not found' });
  res.json(e);
});

router.post('/', auth(['admin', 'exam_cell']), (req, res) => {
  const { exam_name, date, session, start_time, end_time, exam_type } = req.body;
  if (!exam_name || !date || !session) return res.status(400).json({ error: 'exam_name, date and session are required' });
  const r = db.prepare('INSERT INTO exams (exam_name, date, session, start_time, end_time, exam_type) VALUES (?,?,?,?,?,?)').run(exam_name, date, session, start_time, end_time, exam_type || 'End Semester');
  res.status(201).json({ exam_id: r.lastInsertRowid, exam_name });
});

router.put('/:id', auth(['admin', 'exam_cell']), (req, res) => {
  const { exam_name, date, session, start_time, end_time, exam_type } = req.body;
  db.prepare('UPDATE exams SET exam_name=?, date=?, session=?, start_time=?, end_time=?, exam_type=? WHERE exam_id=?').run(exam_name, date, session, start_time, end_time, exam_type, req.params.id);
  res.json({ message: 'Updated' });
});

router.delete('/:id', auth(['admin']), (req, res) => {
  db.prepare('DELETE FROM exams WHERE exam_id = ?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
