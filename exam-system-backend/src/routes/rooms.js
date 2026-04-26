const router = require('express').Router();
const db     = require('../database/db');
const auth   = require('../middleware/auth');

router.get('/', auth(), (req, res) => {
  res.json(db.prepare('SELECT * FROM rooms ORDER BY building, room_no').all());
});

router.get('/:id', auth(), (req, res) => {
  const r = db.prepare('SELECT * FROM rooms WHERE room_id = ?').get(req.params.id);
  if (!r) return res.status(404).json({ error: 'Room not found' });
  res.json(r);
});

router.post('/', auth(['admin', 'exam_cell']), (req, res) => {
  const { room_no, building, capacity, floor, type } = req.body;
  if (!room_no || !building || !capacity) return res.status(400).json({ error: 'room_no, building and capacity are required' });
  try {
    const r = db.prepare('INSERT INTO rooms (room_no, building, capacity, floor, type) VALUES (?,?,?,?,?)').run(room_no, building, capacity, floor, type || 'Classroom');
    res.status(201).json({ room_id: r.lastInsertRowid, room_no });
  } catch (e) {
    if (e.message.includes('UNIQUE')) return res.status(409).json({ error: 'Room number already exists' });
    throw e;
  }
});

router.put('/:id', auth(['admin', 'exam_cell']), (req, res) => {
  const { room_no, building, capacity, floor, type } = req.body;
  db.prepare('UPDATE rooms SET room_no=?, building=?, capacity=?, floor=?, type=? WHERE room_id=?').run(room_no, building, capacity, floor, type, req.params.id);
  res.json({ message: 'Updated' });
});

router.delete('/:id', auth(['admin']), (req, res) => {
  db.prepare('DELETE FROM rooms WHERE room_id = ?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
