const router = require('express').Router();
const db     = require('../database/db');
const auth   = require('../middleware/auth');
const multer = require('multer');
const { parse } = require('csv-parse/sync');

const upload = multer({ storage: multer.memoryStorage() });

// GET /api/students  — list with filters + pagination
router.get('/', auth(), (req, res) => {
  const { branch, semester, section, type, search, page = 1, limit = 100 } = req.query;
  let sql = 'SELECT * FROM students WHERE 1=1';
  const params = [];

  if (branch)   { sql += ' AND branch = ?';   params.push(branch); }
  if (semester) { sql += ' AND semester = ?';  params.push(Number(semester)); }
  if (section)  { sql += ' AND section LIKE ?'; params.push(`%${section}%`); }
  if (type)     { sql += ' AND type = ?';      params.push(type); }
  if (search)   {
    sql += ' AND (roll_no LIKE ? OR name LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  const total = db.prepare(`SELECT COUNT(*) as c FROM (${sql})`).get(...params).c;
  sql += ' ORDER BY roll_no LIMIT ? OFFSET ?';
  params.push(Number(limit), (Number(page) - 1) * Number(limit));

  const students = db.prepare(sql).all(...params);
  res.json({ total, page: Number(page), limit: Number(limit), data: students });
});

// GET /api/students/:id
router.get('/:id', auth(), (req, res) => {
  const s = db.prepare('SELECT * FROM students WHERE student_id = ?').get(req.params.id);
  if (!s) return res.status(404).json({ error: 'Student not found' });
  res.json(s);
});

// POST /api/students
router.post('/', auth(['admin', 'exam_cell']), (req, res) => {
  const { roll_no, name, branch, semester, section, school, department, batch, session, type } = req.body;
  if (!roll_no) return res.status(400).json({ error: 'roll_no is required' });
  try {
    const r = db.prepare(`
      INSERT INTO students (roll_no, name, branch, semester, section, school, department, batch, session, type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(roll_no, name, branch, semester, section, school, department, batch, session, type || 'Regular');
    res.status(201).json({ student_id: r.lastInsertRowid, roll_no });
  } catch (e) {
    if (e.message.includes('UNIQUE')) return res.status(409).json({ error: 'Roll number already exists' });
    throw e;
  }
});

// PUT /api/students/:id
router.put('/:id', auth(['admin', 'exam_cell']), (req, res) => {
  const { roll_no, name, branch, semester, section, school, department, batch, session, type } = req.body;
  const existing = db.prepare('SELECT 1 FROM students WHERE student_id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Student not found' });
  db.prepare(`
    UPDATE students SET roll_no=?, name=?, branch=?, semester=?, section=?,
    school=?, department=?, batch=?, session=?, type=? WHERE student_id=?
  `).run(roll_no, name, branch, semester, section, school, department, batch, session, type, req.params.id);
  res.json({ message: 'Updated successfully' });
});

// DELETE /api/students/:id
router.delete('/:id', auth(['admin']), (req, res) => {
  db.prepare('DELETE FROM students WHERE student_id = ?').run(req.params.id);
  res.json({ message: 'Deleted successfully' });
});

// POST /api/students/bulk-import  — CSV upload
router.post('/bulk-import', auth(['admin', 'exam_cell']), upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const content = req.file.buffer.toString('utf-8');
  let records;
  try {
    records = parse(content, { columns: true, skip_empty_lines: true, trim: true });
  } catch (e) {
    return res.status(400).json({ error: 'Invalid CSV format: ' + e.message });
  }

  const insert = db.prepare(`
    INSERT OR IGNORE INTO students (roll_no, name, branch, semester, section, school, department, batch, session, type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertMany = db.transaction((rows) => {
    let inserted = 0;
    for (const r of rows) {
      const result = insert.run(
        r.roll_no || r['Roll No'] || r['roll no'],
        r.name || r['Name'] || '',
        r.branch || r['Branch'] || '',
        Number(r.semester || r['Semester'] || 0),
        r.section || r['Section'] || '',
        r.school || 'SOICT',
        r.department || '',
        r.batch || '',
        r.session || '',
        r.type || 'Regular'
      );
      if (result.changes) inserted++;
    }
    return inserted;
  });

  const inserted = insertMany(records);
  res.json({ message: `Imported ${inserted} of ${records.length} records`, inserted, total: records.length });
});

// GET /api/students/meta/filters  — unique values for filter dropdowns
router.get('/meta/filters', auth(), (req, res) => {
  const branches  = db.prepare('SELECT DISTINCT branch  FROM students WHERE branch  IS NOT NULL ORDER BY branch').all().map(r => r.branch);
  const semesters = db.prepare('SELECT DISTINCT semester FROM students WHERE semester IS NOT NULL ORDER BY semester').all().map(r => r.semester);
  const sections  = db.prepare('SELECT DISTINCT section  FROM students WHERE section  IS NOT NULL ORDER BY section').all().map(r => r.section);
  const batches   = db.prepare('SELECT DISTINCT batch    FROM students WHERE batch    IS NOT NULL ORDER BY batch').all().map(r => r.batch);
  res.json({ branches, semesters, sections, batches });
});

module.exports = router;
