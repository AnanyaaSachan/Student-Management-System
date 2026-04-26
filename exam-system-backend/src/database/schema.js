/**
 * Database schema — creates all tables if they don't exist
 */
const initSchema = (db) => {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    -- ── Users (Auth) ──────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS users (
      user_id     INTEGER PRIMARY KEY AUTOINCREMENT,
      username    TEXT    NOT NULL UNIQUE,
      email       TEXT    NOT NULL UNIQUE,
      password    TEXT    NOT NULL,
      role        TEXT    NOT NULL DEFAULT 'faculty'
                          CHECK(role IN ('admin','exam_cell','faculty')),
      name        TEXT,
      is_active   INTEGER NOT NULL DEFAULT 1,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- ── Students ──────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS students (
      student_id  INTEGER PRIMARY KEY AUTOINCREMENT,
      roll_no     TEXT    NOT NULL UNIQUE,
      name        TEXT,
      branch      TEXT,
      semester    INTEGER,
      section     TEXT,
      school      TEXT    DEFAULT 'SOICT',
      department  TEXT,
      batch       TEXT,
      session     TEXT,
      type        TEXT    DEFAULT 'Regular'
                          CHECK(type IN ('Regular','Repeat','Lateral')),
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- ── Faculty ───────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS faculty (
      faculty_id    INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT    NOT NULL,
      department    TEXT,
      designation   TEXT,
      email         TEXT,
      phone         TEXT,
      total_duties  INTEGER NOT NULL DEFAULT 0,
      is_available  INTEGER NOT NULL DEFAULT 1,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- ── Rooms ─────────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS rooms (
      room_id   INTEGER PRIMARY KEY AUTOINCREMENT,
      room_no   TEXT    NOT NULL UNIQUE,
      building  TEXT    NOT NULL,
      capacity  INTEGER NOT NULL,
      floor     TEXT,
      type      TEXT    DEFAULT 'Classroom',
      created_at TEXT   NOT NULL DEFAULT (datetime('now'))
    );

    -- ── Exams ─────────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS exams (
      exam_id     INTEGER PRIMARY KEY AUTOINCREMENT,
      exam_name   TEXT    NOT NULL,
      date        TEXT    NOT NULL,
      session     TEXT    NOT NULL CHECK(session IN ('Morning','Afternoon','Evening')),
      start_time  TEXT,
      end_time    TEXT,
      exam_type   TEXT    DEFAULT 'End Semester'
                          CHECK(exam_type IN ('End Semester','Mid Semester','Practical','Other')),
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- ── Seating Allocations ───────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS seating_allocations (
      allocation_id INTEGER PRIMARY KEY AUTOINCREMENT,
      exam_id       INTEGER NOT NULL REFERENCES exams(exam_id)    ON DELETE CASCADE,
      student_id    INTEGER NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
      room_id       INTEGER NOT NULL REFERENCES rooms(room_id)    ON DELETE CASCADE,
      seat_no       INTEGER NOT NULL,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE(exam_id, student_id),
      UNIQUE(exam_id, room_id, seat_no)
    );

    -- ── Invigilation Allocations ──────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS invigilation_allocations (
      duty_id     INTEGER PRIMARY KEY AUTOINCREMENT,
      exam_id     INTEGER NOT NULL REFERENCES exams(exam_id)    ON DELETE CASCADE,
      faculty_id  INTEGER NOT NULL REFERENCES faculty(faculty_id) ON DELETE CASCADE,
      room_id     INTEGER NOT NULL REFERENCES rooms(room_id)    ON DELETE CASCADE,
      role        TEXT    NOT NULL DEFAULT 'Chief'
                          CHECK(role IN ('Chief','Assistant')),
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE(exam_id, faculty_id)
    );

    -- ── Attendance ────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS attendance (
      attendance_id  INTEGER PRIMARY KEY AUTOINCREMENT,
      allocation_id  INTEGER NOT NULL REFERENCES seating_allocations(allocation_id) ON DELETE CASCADE,
      status         TEXT    NOT NULL DEFAULT 'Absent'
                             CHECK(status IN ('Present','Absent')),
      marked_by      INTEGER REFERENCES users(user_id),
      marked_at      TEXT    NOT NULL DEFAULT (datetime('now')),
      method         TEXT    DEFAULT 'Manual'
                             CHECK(method IN ('Manual','QR','Bulk')),
      UNIQUE(allocation_id)
    );

    -- ── Replacement Log ───────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS replacements (
      replacement_id        INTEGER PRIMARY KEY AUTOINCREMENT,
      exam_id               INTEGER NOT NULL REFERENCES exams(exam_id) ON DELETE CASCADE,
      original_faculty_id   INTEGER NOT NULL REFERENCES faculty(faculty_id),
      replacement_faculty_id INTEGER REFERENCES faculty(faculty_id),
      reason                TEXT,
      status                TEXT    NOT NULL DEFAULT 'Pending'
                                    CHECK(status IN ('Pending','Approved','Rejected')),
      requested_by          INTEGER REFERENCES users(user_id),
      approved_by           INTEGER REFERENCES users(user_id),
      created_at            TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at            TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- ── Indexes ───────────────────────────────────────────────────────────────
    CREATE INDEX IF NOT EXISTS idx_students_roll    ON students(roll_no);
    CREATE INDEX IF NOT EXISTS idx_students_branch  ON students(branch);
    CREATE INDEX IF NOT EXISTS idx_seating_exam     ON seating_allocations(exam_id);
    CREATE INDEX IF NOT EXISTS idx_seating_room     ON seating_allocations(room_id);
    CREATE INDEX IF NOT EXISTS idx_invig_exam       ON invigilation_allocations(exam_id);
    CREATE INDEX IF NOT EXISTS idx_attendance_alloc ON attendance(allocation_id);
    CREATE INDEX IF NOT EXISTS idx_exams_date       ON exams(date);
  `);
};

module.exports = initSchema;
