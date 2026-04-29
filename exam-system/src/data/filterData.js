/**
 * Static filter data for Seating Allocation filters.
 * Derived from GBU programme structure.
 */

// ── Programmes ────────────────────────────────────────────────────────────────
export const PROGRAMMES = [
  { value: 'B.Tech',          label: 'B.Tech' },
  { value: '5Y Int B.Tech',   label: '5Y Integrated B.Tech-M.Tech' },
  { value: 'M.Tech',          label: 'M.Tech' },
  { value: 'BCA',             label: 'BCA' },
  { value: 'MCA',             label: 'MCA' },
  { value: 'MBA',             label: 'MBA' },
  { value: 'BA LLB',          label: 'BA LLB (Integrated)' },
];

// ── Semesters per programme ───────────────────────────────────────────────────
export const SEMESTERS_BY_PROGRAMME = {
  'B.Tech':        [1,2,3,4,5,6,7,8],
  '5Y Int B.Tech': [1,2,3,4,5,6,7,8,9,10],
  'M.Tech':        [1,2,3,4],
  'BCA':           [1,2,3,4,5,6],
  'MCA':           [1,2,3,4],
  'MBA':           [1,2,3,4],
  'BA LLB':        [1,2,3,4,5,6,7,8,9,10],
};

// ── Year derived from semester ────────────────────────────────────────────────
export const YEAR_FROM_SEM = {
  1: '1st Year', 2: '1st Year',
  3: '2nd Year', 4: '2nd Year',
  5: '3rd Year', 6: '3rd Year',
  7: '4th Year', 8: '4th Year',
  9: '5th Year', 10: '5th Year',
};

// ── Course catalogue (Programme + Semester → courses) ─────────────────────────
export const COURSES = [
  // B.Tech Sem 4
  { programme: 'B.Tech', semester: 4, branch: 'CSE',    code: 'CS202',  name: 'Software Engineering' },
  { programme: 'B.Tech', semester: 4, branch: 'AI',     code: 'AI202',  name: 'Machine Learning' },
  { programme: 'B.Tech', semester: 4, branch: 'ML',     code: 'CM202',  name: 'Software Engineering' },
  { programme: 'B.Tech', semester: 4, branch: 'DS',     code: 'CD202',  name: 'Software Engineering' },
  { programme: 'B.Tech', semester: 4, branch: 'CySec',  code: 'CC202',  name: 'Software Engineering' },
  { programme: 'B.Tech', semester: 4, branch: 'IT',     code: 'IT202',  name: 'Data Structure' },
  { programme: 'B.Tech', semester: 4, branch: 'ECE',    code: 'EC228',  name: 'Electromagnetic Field Theory' },
  { programme: 'B.Tech', semester: 4, branch: 'ECE-AI', code: 'EA202',  name: 'Electromagnetic Field Theory' },
  { programme: 'B.Tech', semester: 4, branch: 'VLSI',   code: 'EV202',  name: 'Linear Integrated Circuits' },
  // B.Tech Sem 6
  { programme: 'B.Tech', semester: 6, branch: 'AI',     code: 'AI806',  name: 'Cloud Computing' },
  { programme: 'B.Tech', semester: 6, branch: 'AI',     code: 'AI802',  name: 'IoT and Its Applications' },
  { programme: 'B.Tech', semester: 6, branch: 'AI',     code: 'AI814',  name: 'Knowledge Engineering' },
  { programme: 'B.Tech', semester: 6, branch: 'AI',     code: 'AI804',  name: 'Expert Systems' },
  { programme: 'B.Tech', semester: 6, branch: 'AI',     code: 'AI820',  name: 'AI Enabled Cyber Security' },
  { programme: 'B.Tech', semester: 6, branch: 'AI',     code: 'AI808',  name: 'Metaheuristics for Optimization' },
  { programme: 'B.Tech', semester: 6, branch: 'CySec',  code: 'CC306',  name: 'Cloud Computing' },
  { programme: 'B.Tech', semester: 6, branch: 'CySec',  code: 'CC310',  name: 'Data Privacy and Database Security' },
  { programme: 'B.Tech', semester: 6, branch: 'CySec',  code: 'CC308',  name: 'Digital Forensics, Audit and Investigations' },
  { programme: 'B.Tech', semester: 6, branch: 'CySec',  code: 'CC304',  name: 'Computer Network' },
  { programme: 'B.Tech', semester: 6, branch: 'CySec',  code: 'CC320',  name: 'Social Networks Security' },
  { programme: 'B.Tech', semester: 6, branch: 'CySec',  code: 'CC302',  name: 'Web Development using PHP' },
  { programme: 'B.Tech', semester: 6, branch: 'ML',     code: 'CM310',  name: 'Cloud Computing' },
  { programme: 'B.Tech', semester: 6, branch: 'ML',     code: 'CM306',  name: 'Reinforcement Learning' },
  { programme: 'B.Tech', semester: 6, branch: 'ML',     code: 'CM308',  name: 'Human Machine Interaction' },
  { programme: 'B.Tech', semester: 6, branch: 'ML',     code: 'CM318',  name: 'Expert Systems' },
  { programme: 'B.Tech', semester: 6, branch: 'ML',     code: 'CM302',  name: 'Applications of ML in Industries' },
  { programme: 'B.Tech', semester: 6, branch: 'ML',     code: 'CM304',  name: 'Deep Learning' },
  { programme: 'B.Tech', semester: 6, branch: 'DS',     code: 'CD308',  name: 'Cloud Computing' },
  { programme: 'B.Tech', semester: 6, branch: 'DS',     code: 'CD310',  name: 'Data Privacy and Database Security' },
  { programme: 'B.Tech', semester: 6, branch: 'DS',     code: 'CD306',  name: 'Operation Research in Data Science' },
  { programme: 'B.Tech', semester: 6, branch: 'DS',     code: 'CD304',  name: 'Introduction to Statistical Learning' },
  { programme: 'B.Tech', semester: 6, branch: 'DS',     code: 'CD312',  name: 'Big Data Platforms' },
  { programme: 'B.Tech', semester: 6, branch: 'DS',     code: 'CD302',  name: 'Web Development using PHP' },
  { programme: 'B.Tech', semester: 6, branch: 'IT',     code: 'IT302',  name: 'Cloud Computing' },
  { programme: 'B.Tech', semester: 6, branch: 'IT',     code: 'IT306',  name: 'Computer Organization' },
  { programme: 'B.Tech', semester: 6, branch: 'IT',     code: 'IT304',  name: 'Algorithm Design & Analysis' },
  { programme: 'B.Tech', semester: 6, branch: 'IT',     code: 'IT310',  name: 'Digital Image Processing' },
  { programme: 'B.Tech', semester: 6, branch: 'IT',     code: 'IT824',  name: 'Information Retrieval and Management' },
  { programme: 'B.Tech', semester: 6, branch: 'IT',     code: 'IT308',  name: 'Information and Network Security' },
  // B.Tech Sem 2
  { programme: 'B.Tech', semester: 2, branch: 'IT',     code: 'IT102',  name: 'Object Oriented Programming Using Java' },
  { programme: 'B.Tech', semester: 2, branch: 'IT',     code: 'MA112',  name: 'Applied Mathematics-II' },
  { programme: 'B.Tech', semester: 2, branch: 'IT',     code: 'EC104',  name: 'Digital Logic Design' },
  { programme: 'B.Tech', semester: 2, branch: 'IT',     code: 'IT104',  name: 'Discrete Mathematics' },
  { programme: 'B.Tech', semester: 2, branch: 'IT',     code: 'PH102',  name: 'Engineering Physics' },
  { programme: 'B.Tech', semester: 2, branch: 'ECE',    code: 'EC228',  name: 'Electromagnetic Field Theory' },
  // BCA
  { programme: 'BCA',    semester: 4, branch: 'BCA',    code: 'BCA202', name: 'Fundamental of Java Programming' },
  { programme: 'BCA',    semester: 2, branch: 'BCA',    code: 'ES101',  name: 'Environmental Studies' },
  { programme: 'BCA',    semester: 2, branch: 'BCA',    code: 'MA152',  name: 'Mathematical Foundation of CS-II' },
  { programme: 'BCA',    semester: 2, branch: 'BCA',    code: 'BCA102', name: 'Data Structure' },
  { programme: 'BCA',    semester: 2, branch: 'BCA',    code: 'BCA104', name: 'Data Science and Analytics' },
  { programme: 'BCA',    semester: 2, branch: 'BCA',    code: 'BCA106', name: 'Digital Marketing' },
  { programme: 'BCA',    semester: 6, branch: 'BCA',    code: 'BCA302', name: '.NET Technology' },
  { programme: 'BCA',    semester: 6, branch: 'BCA',    code: 'BCA304', name: 'Basics of Internet of Things' },
  { programme: 'BCA',    semester: 6, branch: 'BCA',    code: 'BCA310', name: 'Basics of Blockchain' },
  { programme: 'BCA',    semester: 6, branch: 'BCA',    code: 'BCA318', name: 'Basics of Data Science' },
  // MCA
  { programme: 'MCA',    semester: 2, branch: 'MCA-AI', code: 'MAI102', name: 'Analysis and Design of Algorithms' },
  { programme: 'MCA',    semester: 2, branch: 'MCA-AI', code: 'MAI205', name: 'Soft Computing' },
  { programme: 'MCA',    semester: 2, branch: 'MCA-AI', code: 'MAI106', name: 'Machine Learning' },
  { programme: 'MCA',    semester: 2, branch: 'MCA-AI', code: 'MAI112', name: 'Theory of Computation' },
  { programme: 'MCA',    semester: 2, branch: 'MCA-AI', code: 'MAI110', name: 'Natural Language Processing' },
  { programme: 'MCA',    semester: 2, branch: 'MCA-AI', code: 'MAI108', name: 'Data Base Management System' },
  // 5Y Int B.Tech
  { programme: '5Y Int B.Tech', semester: 4,  branch: 'ICS', code: 'CS202',  name: 'Software Engineering' },
  { programme: '5Y Int B.Tech', semester: 8,  branch: 'ICS', code: 'CS522',  name: 'Advanced Software Engineering' },
  { programme: '5Y Int B.Tech', semester: 8,  branch: 'ICS', code: 'CA522',  name: 'Computer Vision Applications' },
  { programme: '5Y Int B.Tech', semester: 8,  branch: 'ICS', code: 'CD522',  name: 'Statistical Foundations for Data Science' },
  // M.Tech
  { programme: 'M.Tech', semester: 2, branch: 'PCS', code: 'CS522',  name: 'Advanced Software Engineering' },
  { programme: 'M.Tech', semester: 2, branch: 'PCS', code: 'CA522',  name: 'Computer Vision Applications' },
  { programme: 'M.Tech', semester: 2, branch: 'PCS', code: 'CD522',  name: 'Statistical Foundations for Data Science' },
  { programme: 'M.Tech', semester: 2, branch: 'PCW', code: 'WCS524', name: 'Problem Solving Using AI' },
];

// ── Helper: get courses for programme + semester ───────────────────────────────
export function getCoursesFor(programme, semester) {
  if (!programme) return [];
  return COURSES.filter(c =>
    c.programme === programme &&
    (!semester || c.semester === Number(semester))
  );
}

// ── Helper: get course name from code ─────────────────────────────────────────
export function getCourseNameByCode(code) {
  const c = COURSES.find(c => c.code === code);
  return c ? c.name : '';
}

// ── Helper: get programme from student section ────────────────────────────────
export function getProgrammeFromSection(section = '') {
  if (section.includes('5Y Int') || section.includes('Integrated B.Tech')) return '5Y Int B.Tech';
  if (section.includes('M.Tech') || section.includes('MTech')) return 'M.Tech';
  if (section.includes('MCA')) return 'MCA';
  if (section.includes('BCA')) return 'BCA';
  if (section.includes('MBA')) return 'MBA';
  if (section.includes('BA LLB') || section.includes('LLB')) return 'BA LLB';
  if (section.includes('B.Tech') || section.includes('BTech')) return 'B.Tech';
  return 'B.Tech';
}
