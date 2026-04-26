/**
 * GBU Mid Semester Examination - Morning Shift (1st Shift, 10:00am - 11:30am)
 * Date Sheet: 14th March to 25th March 2026
 * Department: Computer Science and Engineering
 *
 * Programmes visible in screenshots:
 *  - B.Tech AI (2023-2027) 6th Sem
 *  - B.Tech Cyber Security (2023-2027) 6th Sem
 *  - B.Tech ML (2023-2027) 6th Sem
 *  - B.Tech DS (2023-2027) 6th Sem
 *  - B.Tech IT (2025-2029) 2nd Sem
 *  - B.Tech IT (2023-2027) 6th Sem
 *  - BCA (2025-2028) 2nd Sem
 *  - BCA (2023-2026) 6th Sem
 *  - MCA AI (2025-2027) 2nd Sem
 */

// ── MORNING SHIFT EXAMS (one per date) ───────────────────────────────────────
export const MORNING_EXAMS = [
  { exam_id: 3001, exam_name: 'GBU Mid Sem Exam – 14 Mar 2026 (Morning)', date: '2026-03-14', session: 'Morning' },
  { exam_id: 3002, exam_name: 'GBU Mid Sem Exam – 16 Mar 2026 (Morning)', date: '2026-03-16', session: 'Morning' },
  { exam_id: 3003, exam_name: 'GBU Mid Sem Exam – 17 Mar 2026 (Morning)', date: '2026-03-17', session: 'Morning' },
  { exam_id: 3004, exam_name: 'GBU Mid Sem Exam – 18 Mar 2026 (Morning)', date: '2026-03-18', session: 'Morning' },
  { exam_id: 3005, exam_name: 'GBU Mid Sem Exam – 19 Mar 2026 (Morning)', date: '2026-03-19', session: 'Morning' },
  { exam_id: 3006, exam_name: 'GBU Mid Sem Exam – 20 Mar 2026 (Morning)', date: '2026-03-20', session: 'Morning' },
  { exam_id: 3007, exam_name: 'GBU Mid Sem Exam – 23 Mar 2026 (Morning)', date: '2026-03-23', session: 'Morning' },
  { exam_id: 3008, exam_name: 'GBU Mid Sem Exam – 24 Mar 2026 (Morning)', date: '2026-03-24', session: 'Morning' },
  { exam_id: 3009, exam_name: 'GBU Mid Sem Exam – 25 Mar 2026 (Morning)', date: '2026-03-25', session: 'Morning' },
];

// ── PROGRAMME GROUPS with roll number ranges ──────────────────────────────────
// Each group: { prefix, from, to, branch, semester, section }
// Roll number format derived from GBU pattern: YY + programme code + serial
// 2023 batch → 235xxx, 2025 batch → 255xxx

const PROG_GROUPS = [
  // B.Tech AI 2023-2027 Sem 6
  { prefix: '235UAI', from: 1, to: 120, branch: 'AI',    semester: 6, section: 'B.Tech AI (2023-2027) 6th Sem' },
  // B.Tech Cyber Security 2023-2027 Sem 6
  { prefix: '235UCC', from: 1, to: 40,  branch: 'CySec', semester: 6, section: 'B.Tech Cyber Security (2023-2027) 6th Sem' },
  // B.Tech ML 2023-2027 Sem 6
  { prefix: '235UCM', from: 1, to: 30,  branch: 'ML',    semester: 6, section: 'B.Tech ML (2023-2027) 6th Sem' },
  // B.Tech DS 2023-2027 Sem 6
  { prefix: '235UCD', from: 1, to: 60,  branch: 'DS',    semester: 6, section: 'B.Tech DS (2023-2027) 6th Sem' },
  // B.Tech IT 2025-2029 Sem 2
  { prefix: '255UIT', from: 1, to: 50,  branch: 'IT',    semester: 2, section: 'B.Tech IT (2025-2029) 2nd Sem' },
  // B.Tech IT 2023-2027 Sem 6
  { prefix: '235UIT', from: 1, to: 60,  branch: 'IT',    semester: 6, section: 'B.Tech IT (2023-2027) 6th Sem' },
  // BCA 2025-2028 Sem 2
  { prefix: '255UCA', from: 1, to: 80,  branch: 'BCA',   semester: 2, section: 'BCA (2025-2028) 2nd Sem' },
  // BCA 2023-2026 Sem 6
  { prefix: '235UCA', from: 1, to: 70,  branch: 'BCA',   semester: 6, section: 'BCA (2023-2026) 6th Sem' },
  // MCA AI 2025-2027 Sem 2
  { prefix: '255MAI', from: 1, to: 30,  branch: 'MCA-AI',semester: 2, section: 'MCA AI (2025-2027) 2nd Sem' },
];

// ── DATE-WISE COURSE SCHEDULE (from screenshots) ──────────────────────────────
// Format: { examId, section, courseCode, courseName }
export const MORNING_SCHEDULE = [
  // ── 14-03-2026 ──────────────────────────────────────────────────────────────
  { examId: 3001, section: 'B.Tech AI (2023-2027) 6th Sem',              courseCode: 'AI806', courseName: 'Cloud Computing' },
  { examId: 3001, section: 'B.Tech Cyber Security (2023-2027) 6th Sem',  courseCode: 'CC306', courseName: 'Cloud Computing' },
  { examId: 3001, section: 'B.Tech ML (2023-2027) 6th Sem',              courseCode: 'CM310', courseName: 'Cloud Computing' },
  { examId: 3001, section: 'B.Tech DS (2023-2027) 6th Sem',              courseCode: 'CD308', courseName: 'Cloud Computing' },
  { examId: 3001, section: 'B.Tech IT (2025-2029) 2nd Sem',              courseCode: 'IT102', courseName: 'Object Oriented Programming Using Java' },
  { examId: 3001, section: 'B.Tech IT (2023-2027) 6th Sem',              courseCode: 'IT302', courseName: 'Cloud Computing' },
  { examId: 3001, section: 'BCA (2025-2028) 2nd Sem',                    courseCode: 'ES101', courseName: 'Environmental Studies' },
  { examId: 3001, section: 'BCA (2023-2026) 6th Sem',                    courseCode: 'BCA302', courseName: '.NET Technology' },
  { examId: 3001, section: 'MCA AI (2025-2027) 2nd Sem',                 courseCode: 'MAI102', courseName: 'Analysis and Design of Algorithms' },

  // ── 16-03-2026 ──────────────────────────────────────────────────────────────
  { examId: 3002, section: 'B.Tech AI (2023-2027) 6th Sem',              courseCode: 'AI802', courseName: 'IoT and Its Applications' },
  { examId: 3002, section: 'B.Tech Cyber Security (2023-2027) 6th Sem',  courseCode: 'CC310', courseName: 'Data Privacy and Database Security' },
  { examId: 3002, section: 'B.Tech ML (2023-2027) 6th Sem',              courseCode: 'CM306', courseName: 'Reinforcement Learning' },
  { examId: 3002, section: 'B.Tech DS (2023-2027) 6th Sem',              courseCode: 'CD310', courseName: 'Data Privacy and Database Security' },
  { examId: 3002, section: 'B.Tech IT (2025-2029) 2nd Sem',              courseCode: 'MA112', courseName: 'Applied Mathematics-II' },
  { examId: 3002, section: 'B.Tech IT (2023-2027) 6th Sem',              courseCode: 'IT306', courseName: 'Computer Organization' },
  { examId: 3002, section: 'BCA (2025-2028) 2nd Sem',                    courseCode: 'MA152', courseName: 'Mathematical Foundation of Computer Science-II' },
  { examId: 3002, section: 'BCA (2023-2026) 6th Sem',                    courseCode: 'BCA304', courseName: 'Basics of Internet of Things' },
  { examId: 3002, section: 'MCA AI (2025-2027) 2nd Sem',                 courseCode: 'MAI205', courseName: 'Soft Computing' },

  // ── 17-03-2026 ──────────────────────────────────────────────────────────────
  { examId: 3003, section: 'B.Tech AI (2023-2027) 6th Sem',              courseCode: 'AI814', courseName: 'Knowledge Engineering' },
  { examId: 3003, section: 'B.Tech Cyber Security (2023-2027) 6th Sem',  courseCode: 'CC308', courseName: 'Digital Forensics, Audit and Investigations' },
  { examId: 3003, section: 'B.Tech ML (2023-2027) 6th Sem',              courseCode: 'CM308', courseName: 'Human Machine Interaction' },
  { examId: 3003, section: 'B.Tech DS (2023-2027) 6th Sem',              courseCode: 'CD306', courseName: 'Operation Research in Data Science' },
  { examId: 3003, section: 'B.Tech IT (2023-2027) 6th Sem',              courseCode: 'IT304', courseName: 'Algorithm Design & Analysis' },
  { examId: 3003, section: 'MCA AI (2025-2027) 2nd Sem',                 courseCode: 'MAI106', courseName: 'Machine Learning' },

  // ── 18-03-2026 ──────────────────────────────────────────────────────────────
  { examId: 3004, section: 'B.Tech Cyber Security (2023-2027) 6th Sem',  courseCode: 'CC304', courseName: 'Computer Network' },
  { examId: 3004, section: 'B.Tech ML (2023-2027) 6th Sem',              courseCode: 'CM318', courseName: 'Expert Systems' },  // 19 Mar visible
  { examId: 3004, section: 'B.Tech DS (2023-2027) 6th Sem',              courseCode: 'CD304', courseName: 'Introduction to Statistical Learning' },
  { examId: 3004, section: 'B.Tech IT (2025-2029) 2nd Sem',              courseCode: 'EC104', courseName: 'Digital Logic Design' },
  { examId: 3004, section: 'BCA (2025-2028) 2nd Sem',                    courseCode: 'BCA102', courseName: 'Data Structure' },
  { examId: 3004, section: 'BCA (2023-2026) 6th Sem',                    courseCode: 'BCA310', courseName: 'Basics of Blockchain' },

  // ── 19-03-2026 ──────────────────────────────────────────────────────────────
  { examId: 3005, section: 'B.Tech AI (2023-2027) 6th Sem',              courseCode: 'AI804', courseName: 'Expert Systems' },
  { examId: 3005, section: 'B.Tech ML (2023-2027) 6th Sem',              courseCode: 'CM318', courseName: 'Expert Systems' },
  { examId: 3005, section: 'B.Tech IT (2025-2029) 2nd Sem',              courseCode: 'IT104', courseName: 'Discrete Mathematics' },
  { examId: 3005, section: 'B.Tech IT (2023-2027) 6th Sem',              courseCode: 'IT310', courseName: 'Digital Image Processing' },
  { examId: 3005, section: 'BCA (2023-2026) 6th Sem',                    courseCode: 'BCA318', courseName: 'Basics of Data Science' },
  { examId: 3005, section: 'MCA AI (2025-2027) 2nd Sem',                 courseCode: 'MAI112', courseName: 'Theory of Computation' },

  // ── 20-03-2026 ──────────────────────────────────────────────────────────────
  { examId: 3006, section: 'B.Tech AI (2023-2027) 6th Sem',              courseCode: 'AI820', courseName: 'AI Enabled Cyber Security' },
  { examId: 3006, section: 'B.Tech Cyber Security (2023-2027) 6th Sem',  courseCode: 'CC320', courseName: 'Social Networks Security' },
  { examId: 3006, section: 'B.Tech DS (2023-2027) 6th Sem',              courseCode: 'CD312', courseName: 'Big Data Platforms' },
  { examId: 3006, section: 'B.Tech IT (2023-2027) 6th Sem',              courseCode: 'IT824', courseName: 'Information Retrieval and Management' },
  { examId: 3006, section: 'BCA (2025-2028) 2nd Sem',                    courseCode: 'BCA104', courseName: 'Data Science and Analytics' },
  { examId: 3006, section: 'MCA AI (2025-2027) 2nd Sem',                 courseCode: 'ITV301', courseName: 'Professional Ethics' },

  // ── 23-03-2026 ──────────────────────────────────────────────────────────────
  { examId: 3007, section: 'B.Tech Cyber Security (2023-2027) 6th Sem',  courseCode: 'CC302', courseName: 'Web Development using PHP' },
  { examId: 3007, section: 'B.Tech ML (2023-2027) 6th Sem',              courseCode: 'CM302', courseName: 'Applications of Machine Learning in Industries' },
  { examId: 3007, section: 'B.Tech DS (2023-2027) 6th Sem',              courseCode: 'CD302', courseName: 'Web Development using PHP' },
  { examId: 3007, section: 'B.Tech IT (2023-2027) 6th Sem',              courseCode: 'IT308', courseName: 'Information and Network Security' },
  { examId: 3007, section: 'MCA AI (2025-2027) 2nd Sem',                 courseCode: 'MAI110', courseName: 'Natural Language Processing' },

  // ── 24-03-2026 ──────────────────────────────────────────────────────────────
  { examId: 3008, section: 'B.Tech AI (2023-2027) 6th Sem',              courseCode: 'AI808', courseName: 'Metaheuristics for Optimization' },
  { examId: 3008, section: 'B.Tech ML (2023-2027) 6th Sem',              courseCode: 'CM304', courseName: 'Deep Learning' },
  { examId: 3008, section: 'B.Tech IT (2025-2029) 2nd Sem',              courseCode: 'PH102', courseName: 'Engineering Physics' },
  { examId: 3008, section: 'BCA (2025-2028) 2nd Sem',                    courseCode: 'BCA106', courseName: 'Digital Marketing' },
  { examId: 3008, section: 'MCA AI (2025-2027) 2nd Sem',                 courseCode: 'MAI108', courseName: 'Data Base Management System' },
];

// ── BUILD MORNING STUDENTS ────────────────────────────────────────────────────
function buildMorningStudents() {
  const students = [];
  let sid = 30000;
  for (const g of PROG_GROUPS) {
    for (let i = g.from; i <= g.to; i++) {
      const num = String(i).padStart(3, '0');
      students.push({
        student_id: sid++,
        roll_no:    `${g.prefix}${num}`,
        name:       '',
        branch:     g.branch,
        semester:   g.semester,
        section:    g.section,
      });
    }
  }
  return students;
}

export const MORNING_STUDENTS = buildMorningStudents();

// ── BUILD MORNING ALLOCATIONS ─────────────────────────────────────────────────
// For morning shift we don't have room-level seating plans from the screenshots,
// so we assign students to rooms based on programme groups (auto-fill rooms).
// Rooms shared with evening shift — morning uses same SOICT rooms.
const MORNING_ROOMS = [
  { room_id: 1001, capacity: 60 },
  { room_id: 1002, capacity: 60 },
  { room_id: 1003, capacity: 60 },
  { room_id: 1004, capacity: 40 },
  { room_id: 1005, capacity: 70 },
  { room_id: 1006, capacity: 55 },
  { room_id: 1007, capacity: 60 },
  { room_id: 1008, capacity: 55 },
  { room_id: 1009, capacity: 45 },
  { room_id: 1013, capacity: 65 },
  { room_id: 1014, capacity: 65 },
  { room_id: 1015, capacity: 65 },
  { room_id: 1016, capacity: 65 },
];

export function getMorningAllocations() {
  const rollToId = {};
  MORNING_STUDENTS.forEach(s => { rollToId[s.roll_no] = s.student_id; });

  const allocs = [];
  let allocId = 50000;

  // For each exam date, find which sections are scheduled and allocate those students
  for (const exam of MORNING_EXAMS) {
    const scheduledSections = new Set(
      MORNING_SCHEDULE.filter(s => s.examId === exam.exam_id).map(s => s.section)
    );

    // Students sitting this exam
    const examStudents = MORNING_STUDENTS.filter(s => scheduledSections.has(s.section));

    // Auto-allocate into rooms sequentially
    let roomIdx = 0;
    let seatInRoom = 0;

    for (const student of examStudents) {
      if (roomIdx >= MORNING_ROOMS.length) break;
      const room = MORNING_ROOMS[roomIdx];

      allocs.push({
        allocation_id: allocId++,
        exam_id:       exam.exam_id,
        student_id:    rollToId[student.roll_no],
        room_id:       room.room_id,
        seat_no:       seatInRoom + 1,
      });

      seatInRoom++;
      if (seatInRoom >= room.capacity) {
        roomIdx++;
        seatInRoom = 0;
      }
    }
  }

  return allocs;
}

/** Given an exam_id and a student section string, return { courseCode, courseName } */
export function getCourseForSection(examId, section) {
  const entry = MORNING_SCHEDULE.find(s => s.examId === examId && s.section === section);
  if (entry) return { courseCode: entry.courseCode, courseName: entry.courseName };
  return null;
}

/** All unique sections that appear in morning schedule */
export function getMorningSections() {
  return [...new Set(MORNING_SCHEDULE.map(s => s.section))];
}
