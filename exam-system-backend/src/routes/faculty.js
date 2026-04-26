const router = require('express').Router();
const db     = require('../database/db');
const auth   = require('../middleware/auth');

// GET /api/faculty
router.get('/', auth(), (req, res) => {
  const { department, search } = req.query;
  let sql = 'SELECT * FROM faculty WHERE 1=1';
  const params = [];
  if (department) { sql += ' AND department = ?'; params.push(department); }
  if (search)     { sql += ' AND (name LIKE ? OR email LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  sql += ' ORDER BY total_duties ASC, name ASC';
  res.json(db.prepare(sql).all(...params));
});

// GET /api/faculty/:id
router.get('/:id', auth(), (req, res) => {
  const f = db.prepare('SELECT * FROM faculty WHERE faculty_id = ?').get(req.params.id);
  if (!f) return res.status(404).json({ error: 'Faculty not found' });
  res.json(f);
});

// POST /api/faculty
router.post('/', auth(['admin', 'exam_cell']), (req, res) => {
  const { name, department, designation, email, phone } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const r = db.prepare(`
    INSERT INTO faculty (name, department, designation, email, phone)
    VALUES (?, ?, ?, ?, ?)
  `).run(name, department, designation, email, phone);
  res.status(201).json({ faculty_id: r.lastInsertRowid, name });
});

// PUT /api/faculty/:id
router.put('/:id', auth(['admin', 'exam_cell']), (req, res) => {
  const { name, department, designation, email, phone, is_available } = req.body;
  const existing = db.prepare('SELECT 1 FROM faculty WHERE faculty_id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Faculty not found' });
  db.prepare(`
    UPDATE faculty SET name=?, department=?, designation=?, email=?, phone=?, is_available=?
    WHERE faculty_id=?
  `).run(name, department, designation, email, phone, is_available ?? 1, req.params.id);
  res.json({ message: 'Updated successfully' });
});

// DELETE /api/faculty/:id
router.delete('/:id', auth(['admin']), (req, res) => {
  db.prepare('DELETE FROM faculty WHERE faculty_id = ?').run(req.params.id);
  res.json({ message: 'Deleted successfully' });
});

// GET /api/faculty/meta/departments
router.get('/meta/departments', auth(), (req, res) => {
  const depts = db.prepare('SELECT DISTINCT department FROM faculty WHERE department IS NOT NULL ORDER BY department').all().map(r => r.department);
  res.json(depts);
});

module.exports = router;
