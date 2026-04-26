import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Download, Upload, Search, X, ChevronDown } from 'lucide-react';
import Modal from '../components/Modal';
import { getStudents, addStudent, updateStudent, deleteStudent, saveStudents } from '../data/store';

// ── helpers ───────────────────────────────────────────────────────────────────
function deriveFields(student) {
  const roll = student.roll_no || '';
  const section = student.section || '';

  // School
  const school = section.includes('Law') ? 'SOL'
    : section.includes('BCA') || section.includes('MCA') ? 'SOICT'
    : 'SOICT';

  // Department
  const dept = section.includes('Law') ? 'Law'
    : section.includes('ECE') || section.includes('VLSI') ? 'Electronics & Communication'
    : section.includes('IT') ? 'Information Technology'
    : section.includes('BCA') || section.includes('MCA') ? 'Computer Applications'
    : 'Computer Science';

  // Year from semester
  const sem = Number(student.semester) || 0;
  const yearMap = { 1: '1st Year', 2: '1st Year', 3: '2nd Year', 4: '2nd Year', 5: '3rd Year', 6: '3rd Year', 7: '4th Year', 8: '4th Year', 9: '5th Year', 10: '5th Year' };
  const year = yearMap[sem] || `Sem ${sem}`;

  // Session & Batch from roll number year prefix
  const yearPrefix = roll.match(/^(\d{2})/)?.[1];
  const fullYear = yearPrefix ? `20${yearPrefix}` : '';
  const session = fullYear ? `${fullYear}-${Number(fullYear) + 1}` : '—';

  // Batch from section
  const batchMatch = section.match(/\((\d{4}-\d{4})\)/);
  const batch = batchMatch ? batchMatch[1] : (fullYear ? `${fullYear}-${Number(fullYear) + 4}` : '—');

  // Type
  const type = roll.startsWith('R-') ? 'Repeat'
    : roll.match(/^[A-Z]/) ? 'Lateral'
    : 'Regular';

  return { school, dept, year, session, batch, type };
}

const EMPTY_FORM = {
  roll_no: '', name: '', branch: '', semester: '', section: '',
  school: 'SOICT', department: 'Computer Science', year: '', session: '', batch: '', type: 'Regular',
};

// ── FilterSelect component ────────────────────────────────────────────────────
function FilterSelect({ label, value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none w-full bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
      >
        <option value="">{label}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────
export default function Students() {
  const [students, setStudents] = useState(getStudents);
  const [showModal, setShowModal]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [search, setSearch]         = useState('');

  // Filters
  const [fSchool,   setFSchool]   = useState('');
  const [fDept,     setFDept]     = useState('');
  const [fBranch,   setFBranch]   = useState('');
  const [fBatch,    setFBatch]    = useState('');
  const [fSemester, setFSemester] = useState('');
  const [fSession,  setFSession]  = useState('');
  const [fType,     setFType]     = useState('');

  const refresh = () => setStudents(getStudents());

  // ── derive unique filter options ──────────────────────────────────────────
  const enriched = useMemo(() => students.map(s => ({ ...s, ...deriveFields(s) })), [students]);

  const uniq = (arr, key) => [...new Set(arr.map(s => s[key]).filter(Boolean))].sort();
  const schools   = uniq(enriched, 'school');
  const depts     = uniq(enriched, 'dept');
  const branches  = uniq(enriched, 'branch');
  const batches   = uniq(enriched, 'batch');
  const semesters = uniq(enriched, 'semester').map(String);
  const sessions  = uniq(enriched, 'session');
  const types     = ['Regular', 'Repeat', 'Lateral'];

  // ── filter + search ───────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return enriched.filter(s => {
      const q = search.toLowerCase();
      const matchSearch = !q || s.name?.toLowerCase().includes(q) || s.roll_no?.toLowerCase().includes(q);
      return matchSearch
        && (!fSchool   || s.school   === fSchool)
        && (!fDept     || s.dept     === fDept)
        && (!fBranch   || s.branch   === fBranch)
        && (!fBatch    || s.batch    === fBatch)
        && (!fSemester || String(s.semester) === fSemester)
        && (!fSession  || s.session  === fSession)
        && (!fType     || s.type     === fType);
    });
  }, [enriched, search, fSchool, fDept, fBranch, fBatch, fSemester, fSession, fType]);

  const hasFilters = fSchool || fDept || fBranch || fBatch || fSemester || fSession || fType || search;
  const clearFilters = () => { setSearch(''); setFSchool(''); setFDept(''); setFBranch(''); setFBatch(''); setFSemester(''); setFSession(''); setFType(''); };

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const openAdd = () => { setEditTarget(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = s => { setEditTarget(s); setForm({ ...EMPTY_FORM, ...s }); setShowModal(true); };

  const handleSubmit = e => {
    e.preventDefault();
    if (editTarget) updateStudent(editTarget.student_id, form);
    else addStudent(form);
    refresh();
    setShowModal(false);
  };

  const handleDelete = id => {
    if (confirm('Delete this student?')) { deleteStudent(id); refresh(); }
  };

  // ── CSV import ────────────────────────────────────────────────────────────
  const handleCSV = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const lines = ev.target.result.split('\n').filter(Boolean);
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const newStudents = lines.slice(1).map(line => {
        const vals = line.split(',').map(v => v.trim());
        const obj = {};
        headers.forEach((h, i) => (obj[h] = vals[i] || ''));
        return { ...obj, student_id: Date.now() + Math.random() };
      });
      saveStudents([...getStudents(), ...newStudents]);
      refresh();
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ── CSV template download ─────────────────────────────────────────────────
  const downloadTemplate = () => {
    const csv = 'roll_no,name,branch,semester,section\n215ICS001,Student Name,CSE,10,5Y Int BTech-MTech CSE 2021-26\n';
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = 'student_template.csv';
    a.click();
  };

  // ── type badge ────────────────────────────────────────────────────────────
  const typeBadge = type => {
    const map = {
      Regular: 'bg-green-100 text-green-700',
      Repeat:  'bg-rose-100 text-rose-700',
      Lateral: 'bg-blue-100 text-blue-700',
    };
    return <span className={`px-2 py-0.5 rounded text-xs font-semibold ${map[type] || 'bg-gray-100 text-gray-600'}`}>{type}</span>;
  };

  const branchBadge = branch => (
    <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 text-xs font-bold">{branch}</span>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top bar ── */}
      <div className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Admin</span>
          <span className="text-gray-300">›</span>
          <span className="font-semibold text-gray-800">Student Management</span>
        </div>
        <span className="text-xs text-gray-400">
          {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </div>

      <div className="px-8 py-6">
        {/* ── Page header ── */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {students.length.toLocaleString()} total · {filtered.length.toLocaleString()} shown
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Template
            </button>
            <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              Import Excel
              <input type="file" accept=".csv,.xlsx" className="hidden" onChange={handleCSV} />
            </label>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Student
            </button>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or roll number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── Filters row 1 ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <FilterSelect label="All Schools"     value={fSchool}   onChange={setFSchool}   options={schools} />
          <FilterSelect label="All Departments" value={fDept}     onChange={setFDept}     options={depts} />
          <FilterSelect label="All Branches"    value={fBranch}   onChange={setFBranch}   options={branches} />
          <FilterSelect label="All Batches"     value={fBatch}    onChange={setFBatch}    options={batches} />
        </div>

        {/* ── Filters row 2 ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <FilterSelect label="All Semesters"   value={fSemester} onChange={setFSemester} options={semesters} />
          <FilterSelect label="All Sessions"    value={fSession}  onChange={setFSession}  options={sessions} />
          <FilterSelect label="All Types"       value={fType}     onChange={setFType}     options={types} />
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-rose-200 text-rose-600 text-sm font-medium hover:bg-rose-50 transition-colors">
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Roll Number</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">School</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Branch</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Year</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Semester</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Session</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Batch</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Type</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-16 text-center text-gray-400">
                      {hasFilters ? 'No students match the current filters.' : 'No students found. Add one or import a CSV.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((s, i) => (
                    <tr key={s.student_id} className={`border-b border-gray-100 last:border-0 hover:bg-indigo-50/40 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                      <td className="px-4 py-3 font-mono font-semibold text-gray-800 text-xs">{s.roll_no}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {s.name || <span className="text-gray-300 italic text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{s.school}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{s.dept}</td>
                      <td className="px-4 py-3">{branchBadge(s.branch)}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{s.year}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{s.semester}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{s.session}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{s.batch}</td>
                      <td className="px-4 py-3">{typeBadge(s.type)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEdit(s)}
                            className="p-1.5 rounded-lg hover:bg-indigo-100 text-indigo-600 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(s.student_id)}
                            className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          {filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
              <span>Showing <strong className="text-gray-700">{filtered.length.toLocaleString()}</strong> of <strong className="text-gray-700">{students.length.toLocaleString()}</strong> students</span>
              <span className="text-gray-400">CSV format: roll_no, name, branch, semester, section</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <Modal title={editTarget ? 'Edit Student' : 'Add Student'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'roll_no',    label: 'Roll Number',  required: true },
                { name: 'name',       label: 'Full Name',    required: false },
                { name: 'branch',     label: 'Branch',       required: true },
                { name: 'semester',   label: 'Semester',     required: true, type: 'number' },
              ].map(({ name, label, required, type = 'text' }) => (
                <div key={name}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">{label}</label>
                  <input
                    type={type}
                    required={required}
                    value={form[name] || ''}
                    onChange={e => setForm({ ...form, [name]: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Programme / Section</label>
              <input
                type="text"
                value={form.section || ''}
                onChange={e => setForm({ ...form, section: e.target.value })}
                placeholder="e.g. B.Tech CSE 2024-28"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">School</label>
                <select value={form.school || 'SOICT'} onChange={e => setForm({ ...form, school: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option>SOICT</option><option>SOL</option><option>SOB</option><option>SOE</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Type</label>
                <select value={form.type || 'Regular'} onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option>Regular</option><option>Repeat</option><option>Lateral</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Session</label>
                <input type="text" placeholder="e.g. 2025-2026" value={form.session || ''}
                  onChange={e => setForm({ ...form, session: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Batch</label>
                <input type="text" placeholder="e.g. 2021-2026" value={form.batch || ''}
                  onChange={e => setForm({ ...form, batch: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <button type="button" onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit"
                className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700">
                {editTarget ? 'Save Changes' : 'Add Student'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
