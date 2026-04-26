const router = require('express').Router();
const db     = require('../database/db');
const auth   = require('../middleware/auth');

// GET /api/reports/dashboard
router.get('/dashboard', auth(), (req, res) => {
  const students    = db.prepare('SELECT COUNT(*) as c FROM students').get().c;
  const faculty     = db.prepare('SELECT COUNT(*) as c FROM faculty').get().c;
  const rooms       = db.prepare('SELECT COUNT(*) as c FROM rooms').get().c;
  const exams       = db.prepare('SELECT COUNT(*) as c FROM exams').get().c;
  const morning     = db.prepare("SELECT COUNT(*) as c FROM exams WHERE session='Morning'").get().c;
  const evening     = db.prepare("SELECT COUNT(*) as c FROM exams WHERE session='Evening'").get().c;
  const allocated   = db.prepare('SELECT COUNT(*) as c FROM seating_allocations').get().c;
  const pending_rep = db.prepare("SELECT COUNT(*) as c FROM replacements WHERE status='Pending'").get().c;
  const present     = db.prepare("SELECT COUNT(*) as c FROM attendance WHERE status='Present'").get().c;
  res.json({ students, faculty, rooms, exams, morning_exams: morning, evening_exams: evening, seats_allocated: allocated, pending_replacements: pending_rep, total_present: present });
});

// GET /api/reports/faculty-duties
router.get('/faculty-duties', auth(), (req, res) => {
  const rows = db.prepare(`
    SELECT f.faculty_id, f.name, f.department, f.designation, f.total_duties,
           COUNT(ia.duty_id) as assigned_duties
    FROM faculty f
    LEFT JOIN invigilation_allocations ia ON ia.faculty_id = f.faculty_id
    GROUP BY f.faculty_id
    ORDER BY assigned_duties DESC
  `).all();
  res.json(rows);
});

// GET /api/reports/room-utilization
router.get('/room-utilization', auth(), (req, res) => {
  const rows = db.prepare(`
    SELECT r.room_id, r.room_no, r.building, r.capacity,
           COUNT(sa.allocation_id) as allocated,
           ROUND(COUNT(sa.allocation_id) * 100.0 / r.capacity, 1) as utilization_pct
    FROM rooms r
    LEFT JOIN seating_allocations sa ON sa.room_id = r.room_id
    GROUP BY r.room_id
    ORDER BY r.building, r.room_no
  `).all();
  res.json(rows);
});

// GET /api/reports/attendance-summary
router.get('/attendance-summary', auth(), (req, res) => {
  const rows = db.prepare(`
    SELECT e.exam_id, e.exam_name, e.date, e.session,
           COUNT(sa.allocation_id) as total_students,
           SUM(CASE WHEN a.status='Present' THEN 1 ELSE 0 END) as present,
           SUM(CASE WHEN a.status='Absent' OR a.status IS NULL THEN 1 ELSE 0 END) as absent,
           COUNT(a.attendance_id) as recorded
    FROM exams e
    LEFT JOIN seating_allocations sa ON sa.exam_id = e.exam_id
    LEFT JOIN attendance a ON a.allocation_id = sa.allocation_id
    GROUP BY e.exam_id
    ORDER BY e.date DESC
  `).all();
  res.json(rows);
});

// GET /api/reports/exam-schedule
router.get('/exam-schedule', auth(), (req, res) => {
  const rows = db.prepare(`
    SELECT e.*,
           COUNT(DISTINCT sa.student_id) as students_allocated,
           COUNT(DISTINCT ia.faculty_id) as invigilators_assigned
    FROM exams e
    LEFT JOIN seating_allocations sa ON sa.exam_id = e.exam_id
    LEFT JOIN invigilation_allocations ia ON ia.exam_id = e.exam_id
    GROUP BY e.exam_id
    ORDER BY e.date ASC, e.session ASC
  `).all();
  res.json(rows);
});

module.exports = router;
