const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../database/db');

// ── Seed default admin on first run ──────────────────────────────────────────
const seedAdmin = () => {
  const exists = db.prepare('SELECT 1 FROM users WHERE username = ?').get('admin');
  if (!exists) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare(`
      INSERT INTO users (username, email, password, role, name)
      VALUES (?, ?, ?, ?, ?)
    `).run('admin', 'admin@gbu.ac.in', hash, 'admin', 'Administrator');
    console.log('✅ Default admin created — username: admin, password: admin123');
  }
};
seedAdmin();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username and password required' });

  const user = db.prepare('SELECT * FROM users WHERE username = ? AND is_active = 1').get(username);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { user_id: user.user_id, username: user.username, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  res.json({
    token,
    user: { user_id: user.user_id, username: user.username, role: user.role, name: user.name, email: user.email }
  });
});

// POST /api/auth/register  (admin only in production)
router.post('/register', (req, res) => {
  const { username, email, password, role = 'faculty', name } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: 'username, email and password are required' });

  const hash = bcrypt.hashSync(password, 10);
  try {
    const result = db.prepare(`
      INSERT INTO users (username, email, password, role, name)
      VALUES (?, ?, ?, ?, ?)
    `).run(username, email, hash, role, name || username);
    res.status(201).json({ user_id: result.lastInsertRowid, username, email, role });
  } catch (e) {
    if (e.message.includes('UNIQUE')) return res.status(409).json({ error: 'Username or email already exists' });
    throw e;
  }
});

// GET /api/auth/me
const auth = require('../middleware/auth');
router.get('/me', auth(), (req, res) => {
  const user = db.prepare('SELECT user_id, username, email, role, name FROM users WHERE user_id = ?').get(req.user.user_id);
  res.json(user);
});

// PUT /api/auth/change-password
router.put('/change-password', auth(), (req, res) => {
  const { current_password, new_password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE user_id = ?').get(req.user.user_id);
  if (!bcrypt.compareSync(current_password, user.password))
    return res.status(400).json({ error: 'Current password is incorrect' });
  const hash = bcrypt.hashSync(new_password, 10);
  db.prepare('UPDATE users SET password = ?, updated_at = datetime("now") WHERE user_id = ?').run(hash, req.user.user_id);
  res.json({ message: 'Password changed successfully' });
});

module.exports = router;
