import { useState, useMemo } from 'react';
import Select from 'react-select';
import { Play, Printer, ChevronDown, CheckCircle, LayoutGrid, List, Table2, FileText, Grid3X3, ChevronLeft, ChevronRight, User, Filter, X, SlidersHorizontal } from 'lucide-react';
import { getExams, getStudents, getRooms, getSeatingAllocations, getInvigilationAllocations, getFaculty } from '../data/store';
import { generateSeatingAllocation } from '../data/algorithms';
import { getCourseForSection, MORNING_SCHEDULE } from '../data/morningShiftData';
import { PROGRAMMES, SEMESTERS_BY_PROGRAMME, YEAR_FROM_SEM, getCoursesFor, getCourseNameByCode, getProgrammeFromSection } from '../data/filterData';
function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
}

function toRoman(n) {
  const map = { 1:'I',2:'II',3:'III',4:'IV',5:'V',6:'VI',7:'VII',8:'VIII',9:'IX',10:'X' };
  return map[n] || String(n);
}

function groupByDate(exams) {
  const map = {};
  exams.forEach(e => { if (!map[e.date]) map[e.date] = []; map[e.date].push(e); });
  return map;
}

const CHIP_COLORS = [
  { bg: '#fef9c3', text: '#854d0e', border: '#fde047' },
  { bg: '#dcfce7', text: '#166534', border: '#86efac' },
  { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
  { bg: '#fce7f3', text: '#9d174d', border: '#f9a8d4' },
  { bg: '#ede9fe', text: '#5b21b6', border: '#c4b5fd' },
  { bg: '#ffedd5', text: '#9a3412', border: '#fdba74' },
];
function chipColor(i) { return CHIP_COLORS[i % CHIP_COLORS.length]; }

const selectStyles = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? '#4ade80' : '#d1fae5',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(74,222,128,0.15)' : 'none',
    borderRadius: '12px',
    background: '#fff',
    minHeight: '40px',
    fontSize: '13px',
    '&:hover': { borderColor: '#86efac' },
  }),
  option: (base, state) => ({
    ...base,
    background: state.isSelected ? '#16a34a' : state.isFocused ? '#f0fdf4' : 'white',
    color: state.isSelected ? 'white' : '#1f2937',
    fontSize: '13px',
  }),
  multiValue: (base) => ({ ...base, background: '#dcfce7', borderRadius: '6px' }),
  multiValueLabel: (base) => ({ ...base, color: '#15803d', fontWeight: 600, fontSize: '12px' }),
  multiValueRemove: (base) => ({ ...base, color: '#15803d', '&:hover': { background: '#bbf7d0', color: '#166534' } }),
  placeholder: (base) => ({ ...base, color: '#9ca3af', fontSize: '13px' }),
  menu: (base) => ({ ...base, borderRadius: '12px', border: '1px solid #d1fae5', boxShadow: '0 8px 24px rgba(22,163,74,0.12)' }),
};

function FilterBadge({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
      style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }}>
      {label}
      <button onClick={onRemove} className="hover:text-red-500"><X className="w-3 h-3" /></button>
    </span>
  );
}

const TABS = [
  { id: 'seating',  label: 'Seating Plan',   icon: LayoutGrid },
  { id: 'master',   label: 'Master Summary', icon: List },
  { id: 'room',     label: 'Room Summary',   icon: Table2 },
  { id: 'students', label: 'Student List',   icon: FileText },
  { id: 'roomplan', label: 'Room Plan',      icon: Grid3X3 },
];
export default function SeatingAllocation() {
  const allExams    = getExams();
  const allRooms    = getRooms();
  const allStudents = getStudents();

  const [selectedDate,   setSelectedDate]   = useState('');
  const [selectedShift,  setSelectedShift]  = useState('');
  const [activeTab,      setActiveTab]      = useState('seating');
  const [refresh,        setRefresh]        = useState(0);
  const [roomNavIdx,     setRoomNavIdx]     = useState(0);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [filters, setFilters] = useState({
    programme: null,
    semester:  null,
    year:      null,
    courseCode: null,
    courseName: '',
    roomNo:    null,
  });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const updateFilter = (key, value) => {
    setFilters(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'programme') { next.semester = null; next.year = null; next.courseCode = null; next.courseName = ''; }
      if (key === 'semester')  { next.year = value ? { value: YEAR_FROM_SEM[value.value], label: YEAR_FROM_SEM[value.value] } : null; next.courseCode = null; next.courseName = ''; }
      if (key === 'courseCode') { next.courseName = value ? getCourseNameByCode(value.value) : ''; }
      return next;
    });
  };

  const clearFilters = () => setFilters({ programme: null, semester: null, year: null, courseCode: null, courseName: '', roomNo: null });
  const hasFilters = Object.values(filters).some(v => v !== null && v !== '');

  const activeFilterCount = [
    filters.programme,
    filters.semester,
    filters.year,
    filters.courseCode && filters.courseCode.length > 0 ? filters.courseCode : null,
    filters.roomNo,
  ].filter(Boolean).length;

  const dateGroups  = useMemo(() => groupByDate(allExams), [allExams]);
  const sortedDates = Object.keys(dateGroups).sort();
  const dateExams   = selectedDate ? (dateGroups[selectedDate] || []) : [];
  const morningExams = dateExams.filter(e => e.session === 'Morning');
  const eveningExams = dateExams.filter(e => e.session === 'Evening');
  const activeExams  = dateExams.filter(e => e.session === selectedShift);
  const activeExamIds = useMemo(() => new Set(activeExams.map(e => e.exam_id)), [activeExams]);

  const getCourse = (examId, section) => {
    if (selectedShift === 'Morning') {
      const entry = getCourseForSection(examId, section);
      if (entry) return { code: entry.courseCode, name: entry.courseName };
    }
    return { code: 'CS202', name: 'Software Engineering' };
  };

  const rawAllocs = useMemo(() => {
    void refresh;
    return getSeatingAllocations().filter(a => activeExamIds.has(a.exam_id));
  }, [activeExamIds, refresh]);

  const isAllocated = rawAllocs.length > 0;

  const enrichedAllocs = useMemo(() => {
    const studentMap = Object.fromEntries(allStudents.map(s => [s.student_id, s]));
    const roomMap    = Object.fromEntries(allRooms.map(r => [r.room_id, r]));
    return rawAllocs.map(a => {
      const student    = studentMap[a.student_id] || null;
      const room       = roomMap[a.room_id] || null;
      const courseInfo = student ? getCourse(a.exam_id, student.section) : { code: '--', name: '--' };
      return { ...a, student, room, course: courseInfo };
    });
  }, [rawAllocs, allStudents, allRooms, selectedShift]);

  const advancedFiltered = useMemo(() => {
    let data = enrichedAllocs;
    if (filters.programme) {
      data = data.filter(a => getProgrammeFromSection(a.student?.section) === filters.programme.value);
    }
    if (filters.semester) {
      data = data.filter(a => Number(a.student?.semester) === Number(filters.semester.value));
    }
    if (filters.courseCode && filters.courseCode.length > 0) {
      const codes = new Set(filters.courseCode.map(c => c.value));
      data = data.filter(a => codes.has(a.course.code));
    }
    if (filters.roomNo) {
      data = data.filter(a => a.room_id === filters.roomNo.value);
    }
    return data;
  }, [enrichedAllocs, filters]);

  const uniqueCourses = useMemo(() => {
    const seen = new Map();
    enrichedAllocs.forEach(a => {
      if (!seen.has(a.course.code)) seen.set(a.course.code, a.course.name);
    });
    return [...seen.entries()].map(([code, name]) => ({ code, name }));
  }, [enrichedAllocs]);

  const filtered = useMemo(() => {
    if (!selectedCourse) return advancedFiltered;
    return advancedFiltered.filter(a => a.course.code === selectedCourse);
  }, [advancedFiltered, selectedCourse]);

  const totalStudents = advancedFiltered.length;
  const totalRooms    = new Set(advancedFiltered.map(a => a.room_id)).size;
  const totalCourses  = new Set(advancedFiltered.map(a => a.course.code)).size;

  const planRooms = useMemo(() => {
    const ids = [...new Set(advancedFiltered.map(a => a.room_id))];
    return allRooms.filter(r => ids.includes(r.room_id)).sort((a, b) => a.room_no.localeCompare(b.room_no));
  }, [advancedFiltered, allRooms]);

  const currentPlanRoom = planRooms[roomNavIdx] || null;
  const roomPlanStudents = useMemo(() => {
    if (!currentPlanRoom) return [];
    return advancedFiltered.filter(a => a.room_id === currentPlanRoom.room_id).sort((a, b) => a.seat_no - b.seat_no);
  }, [advancedFiltered, currentPlanRoom]);

  const handleAutoAllocate = () => {
    if (!selectedShift || activeExams.length === 0) return;
    const studentIds = allStudents.map(s => s.student_id);
    const roomIds    = allRooms.map(r => r.room_id);
    if (studentIds.length === 0) { alert('No students found. Please seed data first.'); return; }
    if (roomIds.length === 0)    { alert('No rooms found. Please add rooms first.'); return; }
    const result = generateSeatingAllocation(activeExams[0].exam_id, studentIds, roomIds);
    if (result.success) { setRefresh(r => r + 1); setActiveTab('seating'); }
    else alert(result.message);
  };

  const semesterOptions = useMemo(() => {
    if (!filters.programme) return [];
    const sems = SEMESTERS_BY_PROGRAMME[filters.programme.value] || [];
    return sems.map(n => ({ value: n, label: 'Sem ' + toRoman(n) }));
  }, [filters.programme]);

  const courseCodeOptions = useMemo(() => {
    const courses = getCoursesFor(filters.programme?.value, filters.semester?.value);
    return courses.map(c => ({ value: c.code, label: c.code }));
  }, [filters.programme, filters.semester]);

  const roomOptions = useMemo(() => {
    return allRooms.map(r => ({ value: r.room_id, label: r.room_no + ' -- ' + r.building }));
  }, [allRooms]);

  const yearOptions = [
    { value: '1st Year', label: '1st Year' },
    { value: '2nd Year', label: '2nd Year' },
    { value: '3rd Year', label: '3rd Year' },
    { value: '4th Year', label: '4th Year' },
    { value: '5th Year', label: '5th Year' },
  ];
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Admin</span>
          <span className="text-gray-300">&#x203A;</span>
          <span className="font-semibold text-gray-800">Seating Allocation</span>
        </div>
        <span className="text-xs text-gray-400">
          {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </div>

      <div className="px-8 py-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Seating Allocation</h1>

        {/* Step 1: Select Exam Date */}
        <div className="bg-white rounded-2xl border border-gray-200 mb-4 shadow-sm">
          <div className="px-5 py-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Step 1 -- Select Exam Date</p>
          </div>
          <div className="px-5 py-3">
            <div className="relative">
              <select
                value={selectedDate}
                onChange={e => { setSelectedDate(e.target.value); setSelectedShift(''); setSelectedCourse(null); clearFilters(); }}
                className="w-full appearance-none bg-transparent text-sm font-semibold text-gray-800 focus:outline-none cursor-pointer pr-8"
              >
                <option value="">-- Choose a date --</option>
                {sortedDates.map(d => (
                  <option key={d} value={d}>{formatDate(d)}  --  {dateGroups[d].length} exam{dateGroups[d].length > 1 ? 's' : ''}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {selectedDate && (
          <div className="bg-white rounded-2xl border shadow-sm mb-4" style={{ borderColor: '#d1fae5' }}>
            <button
              onClick={() => setFiltersOpen(o => !o)}
              className="w-full flex items-center justify-between px-5 py-3 border-b"
              style={{ borderColor: '#d1fae5' }}
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" style={{ color: '#16a34a' }} />
                <span className="text-sm font-semibold text-gray-700">Advanced Filters</span>
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: '#16a34a' }}>
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <ChevronDown
                className="w-4 h-4 text-gray-400 transition-transform"
                style={{ transform: filtersOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
            </button>

            {filtersOpen && (
              <div className="px-5 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Programme</label>
                    <Select styles={selectStyles} options={PROGRAMMES} value={filters.programme}
                      onChange={v => updateFilter('programme', v)} placeholder="Select programme..." isClearable />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Semester</label>
                    <Select styles={selectStyles} options={semesterOptions} value={filters.semester}
                      onChange={v => updateFilter('semester', v)}
                      placeholder={filters.programme ? 'Select semester...' : 'Select programme first'}
                      isDisabled={!filters.programme} isClearable />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Year</label>
                    <Select styles={selectStyles} options={yearOptions} value={filters.year}
                      onChange={v => updateFilter('year', v)} placeholder="Auto-filled from semester" isClearable />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Course Code</label>
                    <Select styles={selectStyles} options={courseCodeOptions} value={filters.courseCode}
                      onChange={v => updateFilter('courseCode', v)}
                      placeholder={filters.programme ? 'Search course code...' : 'Select programme first'}
                      isDisabled={!filters.programme} isMulti isSearchable />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Course Name</label>
                    <input type="text" readOnly value={filters.courseName}
                      placeholder="Select a course code first"
                      className="w-full px-3 py-2 rounded-xl border text-sm text-gray-600 bg-gray-50 cursor-default focus:outline-none"
                      style={{ borderColor: '#d1fae5', fontSize: '13px' }} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Room Number</label>
                    <Select styles={selectStyles} options={roomOptions} value={filters.roomNo}
                      onChange={v => updateFilter('roomNo', v)} placeholder="Filter by room..." isClearable />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t" style={{ borderColor: '#d1fae5' }}>
                  <span className="text-xs text-gray-400">
                    {activeFilterCount > 0 ? activeFilterCount + ' filter' + (activeFilterCount > 1 ? 's' : '') + ' active' : 'No filters applied'}
                  </span>
                  {hasFilters && (
                    <button onClick={clearFilters}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 transition-colors">
                      <X className="w-3 h-3" /> Clear Filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Active filter badges */}
        {selectedDate && hasFilters && (
          <div className="flex flex-wrap gap-2 mb-3">
            {filters.programme && <FilterBadge label={'Programme: ' + filters.programme.label} onRemove={() => updateFilter('programme', null)} />}
            {filters.semester  && <FilterBadge label={'Semester: ' + filters.semester.label}   onRemove={() => updateFilter('semester', null)} />}
            {filters.year      && <FilterBadge label={'Year: ' + filters.year.label}            onRemove={() => updateFilter('year', null)} />}
            {filters.courseCode?.length > 0 && <FilterBadge label={'Courses: ' + filters.courseCode.map(c => c.value).join(', ')} onRemove={() => updateFilter('courseCode', null)} />}
            {filters.roomNo    && <FilterBadge label={'Room: ' + filters.roomNo.label}          onRemove={() => updateFilter('roomNo', null)} />}
          </div>
        )}
        {/* Step 2: Select Shift */}
        {selectedDate && (
          <div className="bg-white rounded-2xl border border-gray-200 mb-4 shadow-sm">
            <div className="px-5 py-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Step 2 -- Select Shift</p>
            </div>
            <div className="px-5 py-4 flex items-center gap-3 flex-wrap">
              <button
                onClick={() => { setSelectedShift('Morning'); setSelectedCourse(null); }}
                disabled={morningExams.length === 0}
                className={'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ' + (
                  selectedShift === 'Morning' ? 'bg-amber-400 border-amber-400 text-amber-900 shadow-sm'
                  : morningExams.length === 0 ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-amber-400 hover:bg-amber-50'
                )}
              >
                <span>&#9728;</span> Shift 1 (Morning)
                {morningExams.length > 0 && (
                  <span className={'text-xs px-1.5 py-0.5 rounded-full font-medium ' + (selectedShift === 'Morning' ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-600')}>
                    {morningExams.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => { setSelectedShift('Evening'); setSelectedCourse(null); }}
                disabled={eveningExams.length === 0}
                className={'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ' + (
                  selectedShift === 'Evening' ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                  : eveningExams.length === 0 ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-indigo-400 hover:bg-indigo-50'
                )}
              >
                <span>&#127769;</span> Shift 2 (Evening)
                {eveningExams.length > 0 && (
                  <span className={'text-xs px-1.5 py-0.5 rounded-full font-medium ' + (selectedShift === 'Evening' ? 'bg-indigo-400 text-white' : 'bg-gray-200 text-gray-600')}>
                    {eveningExams.length}
                  </span>
                )}
              </button>

              <div className="ml-auto flex gap-2">
                <button
                  onClick={handleAutoAllocate}
                  disabled={!selectedShift}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Auto Allocate
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Course filter chips */}
        {selectedShift && isAllocated && uniqueCourses.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setSelectedCourse(null)}
              className={'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ' + (!selectedCourse ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400')}
            >
              All Courses
            </button>
            {uniqueCourses.map((c, i) => {
              const col = chipColor(i);
              const active = selectedCourse === c.code;
              return (
                <button key={c.code} onClick={() => setSelectedCourse(active ? null : c.code)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                  style={{ background: active ? col.text : col.bg, color: active ? '#fff' : col.text, borderColor: col.border }}>
                  {c.code}
                </button>
              );
            })}
          </div>
        )}

        {/* Stats bar */}
        {selectedShift && isAllocated && (
          <div className="flex items-center gap-6 mb-5 text-sm text-gray-600 flex-wrap">
            <span>Students: <strong className="text-gray-900">{totalStudents}</strong></span>
            <span className="text-gray-300">|</span>
            <span>Rooms: <strong className="text-gray-900">{totalRooms}</strong></span>
            <span className="text-gray-300">|</span>
            <span>Courses: <strong className="text-gray-900">{totalCourses}</strong></span>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
              <CheckCircle className="w-3 h-3" /> Allocated
            </span>
          </div>
        )}

        {/* No results state */}
        {selectedShift && isAllocated && advancedFiltered.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed p-12 text-center" style={{ borderColor: '#d1fae5' }}>
            <Filter className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: '#16a34a' }} />
            <p className="font-semibold text-gray-600">No students match the current filters</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting or clearing the filters</p>
            <button onClick={clearFilters} className="mt-3 px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)' }}>
              Clear Filters
            </button>
          </div>
        )}
        {/* Tabs */}
        {selectedShift && isAllocated && advancedFiltered.length > 0 && (
          <>
            <div className="flex gap-1 mb-4 bg-white rounded-2xl border border-gray-200 p-1 shadow-sm w-fit">
              {TABS.map(tab => {
                const Icon = tab.icon;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ' + (
                      activeTab === tab.id ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                    )}>
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {activeTab === 'seating'  && <SeatingPlanTab  filtered={filtered} allRooms={allRooms} />}
            {activeTab === 'master'   && <MasterSummaryTab filtered={filtered} />}
            {activeTab === 'room'     && <RoomSummaryTab  filtered={filtered} allRooms={allRooms} />}
            {activeTab === 'students' && <StudentListTab  filtered={filtered} />}
            {activeTab === 'roomplan' && (
              <RoomPlanTab
                planRooms={planRooms}
                roomNavIdx={roomNavIdx}
                setRoomNavIdx={setRoomNavIdx}
                currentPlanRoom={currentPlanRoom}
                roomPlanStudents={roomPlanStudents}
              />
            )}
          </>
        )}

        {/* Empty state */}
        {selectedShift && !isAllocated && (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
            <LayoutGrid className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="font-semibold text-gray-500">No seating allocation yet</p>
            <p className="text-sm text-gray-400 mt-1">Click <strong>Auto Allocate</strong> to generate the seating plan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
// ---- SeatingPlanTab ----
function SeatingPlanTab({ filtered, allRooms }) {
  const roomMap = Object.fromEntries(allRooms.map(r => [r.room_id, r]));
  const byRoom = useMemo(() => {
    const map = {};
    filtered.forEach(a => {
      if (!map[a.room_id]) map[a.room_id] = [];
      map[a.room_id].push(a);
    });
    return map;
  }, [filtered]);

  const roomIds = Object.keys(byRoom).sort((a, b) => {
    const ra = roomMap[a]?.room_no || '';
    const rb = roomMap[b]?.room_no || '';
    return ra.localeCompare(rb);
  });

  if (roomIds.length === 0) return <EmptyFiltered />;

  return (
    <div className="space-y-4">
      {roomIds.map((roomId) => {
        const room = roomMap[roomId];
        const students = byRoom[roomId].sort((a, b) => a.seat_no - b.seat_no);
        const courses = [...new Set(students.map(s => s.course.code))];
        return (
          <div key={roomId} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-800">{room?.room_no || roomId}</span>
                <span className="text-xs text-gray-400">{room?.building}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 font-medium">{students.length} students</span>
              </div>
              <div className="flex gap-1">
                {courses.map((code, i) => {
                  const col = chipColor(i);
                  return (
                    <span key={code} className="px-2 py-0.5 rounded text-xs font-bold"
                      style={{ background: col.bg, color: col.text, border: '1px solid ' + col.border }}>{code}</span>
                  );
                })}
              </div>
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {students.map(a => {
                const col = chipColor(courses.indexOf(a.course.code));
                return (
                  <div key={a.allocation_id} className="rounded-xl border p-2 text-center text-xs"
                    style={{ background: col.bg, borderColor: col.border }}>
                    <div className="font-bold text-gray-700 mb-0.5">Seat {a.seat_no}</div>
                    <div className="font-semibold truncate" style={{ color: col.text }}>{a.student?.roll_no || '--'}</div>
                    <div className="text-gray-400 truncate mt-0.5">{a.course.code}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---- MasterSummaryTab ----
function MasterSummaryTab({ filtered }) {
  const byCourse = useMemo(() => {
    const map = {};
    filtered.forEach(a => {
      const key = a.course.code;
      if (!map[key]) map[key] = { code: a.course.code, name: a.course.name, students: [] };
      map[key].students.push(a);
    });
    return Object.values(map).sort((a, b) => a.code.localeCompare(b.code));
  }, [filtered]);

  if (byCourse.length === 0) return <EmptyFiltered />;

  return (
    <div className="space-y-4">
      {byCourse.map((course, ci) => {
        const col = chipColor(ci);
        const sorted = [...course.students].sort((a, b) => (a.student?.roll_no || '').localeCompare(b.student?.roll_no || ''));
        return (
          <div key={course.code} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100" style={{ background: col.bg }}>
              <span className="font-bold text-sm" style={{ color: col.text }}>{course.code}</span>
              <span className="text-sm text-gray-600">{course.name}</span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: col.text, color: '#fff' }}>
                {course.students.length} students
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">#</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Roll No</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Section</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Room</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Seat</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((a, i) => (
                    <tr key={a.allocation_id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-400 text-xs">{i + 1}</td>
                      <td className="px-4 py-2 font-semibold text-gray-800">{a.student?.roll_no || '--'}</td>
                      <td className="px-4 py-2 text-gray-500 text-xs">{a.student?.section || '--'}</td>
                      <td className="px-4 py-2 text-gray-600">{a.room?.room_no || '--'}</td>
                      <td className="px-4 py-2 text-gray-600">{a.seat_no}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
// ---- RoomSummaryTab ----
function RoomSummaryTab({ filtered, allRooms }) {
  const roomMap = Object.fromEntries(allRooms.map(r => [r.room_id, r]));
  const byRoom = useMemo(() => {
    const map = {};
    filtered.forEach(a => {
      if (!map[a.room_id]) map[a.room_id] = { room: roomMap[a.room_id], students: [] };
      map[a.room_id].students.push(a);
    });
    return Object.values(map).sort((a, b) => (a.room?.room_no || '').localeCompare(b.room?.room_no || ''));
  }, [filtered]);

  if (byRoom.length === 0) return <EmptyFiltered />;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Room</th>
            <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Building</th>
            <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Capacity</th>
            <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Allocated</th>
            <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Courses</th>
            <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Seat Range</th>
          </tr>
        </thead>
        <tbody>
          {byRoom.map(({ room, students }, i) => {
            const courses = [...new Set(students.map(s => s.course.code))];
            const seats = students.map(s => s.seat_no);
            const minSeat = Math.min(...seats);
            const maxSeat = Math.max(...seats);
            return (
              <tr key={room?.room_id || i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-5 py-3 font-bold text-gray-800">{room?.room_no || '--'}</td>
                <td className="px-5 py-3 text-gray-500 text-xs">{room?.building || '--'}</td>
                <td className="px-5 py-3 text-gray-600">{room?.capacity || '--'}</td>
                <td className="px-5 py-3">
                  <span className="font-semibold text-gray-800">{students.length}</span>
                  {room?.capacity && <span className="text-xs text-gray-400 ml-1">/ {room.capacity}</span>}
                </td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-1">
                    {courses.map((code, j) => {
                      const col = chipColor(j);
                      return (
                        <span key={code} className="px-2 py-0.5 rounded text-xs font-bold"
                          style={{ background: col.bg, color: col.text, border: '1px solid ' + col.border }}>{code}</span>
                      );
                    })}
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-600 text-xs">{minSeat} -- {maxSeat}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---- StudentListTab ----
function StudentListTab({ filtered }) {
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => (a.student?.roll_no || '').localeCompare(b.student?.roll_no || ''));
  }, [filtered]);

  if (sorted.length === 0) return <EmptyFiltered />;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">#</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Roll No</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Section</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Semester</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Course</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Room</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase">Seat</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((a, i) => {
              const col = chipColor(i % 6);
              return (
                <tr key={a.allocation_id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-gray-400 text-xs">{i + 1}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: col.bg, color: col.text }}>
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-gray-800">{a.student?.roll_no || '--'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs max-w-xs truncate">{a.student?.section || '--'}</td>
                  <td className="px-5 py-3 text-gray-600">{a.student?.semester || '--'}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 rounded text-xs font-bold"
                      style={{ background: col.bg, color: col.text, border: '1px solid ' + col.border }}>
                      {a.course.code}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-700">{a.room?.room_no || '--'}</td>
                  <td className="px-5 py-3 text-gray-600">{a.seat_no}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
// ---- RoomPlanTab ----
function RoomPlanTab({ planRooms, roomNavIdx, setRoomNavIdx, currentPlanRoom, roomPlanStudents }) {
  if (planRooms.length === 0) return <EmptyFiltered />;

  const courses = [...new Set(roomPlanStudents.map(s => s.course.code))];
  const cols = 6;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
        <button
          onClick={() => setRoomNavIdx(i => Math.max(0, i - 1))}
          disabled={roomNavIdx === 0}
          className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-center">
          <p className="font-bold text-gray-800">{currentPlanRoom?.room_no}</p>
          <p className="text-xs text-gray-400">{currentPlanRoom?.building} &middot; {roomPlanStudents.length} students</p>
        </div>
        <button
          onClick={() => setRoomNavIdx(i => Math.min(planRooms.length - 1, i + 1))}
          disabled={roomNavIdx === planRooms.length - 1}
          className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {planRooms.length > 1 && (
        <div className="flex justify-center gap-1.5 py-2 border-b border-gray-100">
          {planRooms.map((r, i) => (
            <button key={r.room_id} onClick={() => setRoomNavIdx(i)}
              className="w-2 h-2 rounded-full transition-all"
              style={{ background: i === roomNavIdx ? '#16a34a' : '#d1d5db' }}
              title={r.room_no} />
          ))}
        </div>
      )}

      {courses.length > 0 && (
        <div className="flex flex-wrap gap-2 px-5 py-3 border-b border-gray-100">
          {courses.map((code, i) => {
            const col = chipColor(i);
            return (
              <span key={code} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{ background: col.bg, color: col.text, border: '1px solid ' + col.border }}>
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: col.text }} />
                {code}
              </span>
            );
          })}
        </div>
      )}

      <div className="p-5">
        <div className="w-full py-2 mb-6 rounded-xl text-center text-xs font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#1e293b,#334155)' }}>
          BLACKBOARD / FRONT
        </div>

        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(' + cols + ', minmax(0, 1fr))' }}>
          {roomPlanStudents.map(a => {
            const courseIdx = courses.indexOf(a.course.code);
            const col = chipColor(courseIdx >= 0 ? courseIdx : 0);
            return (
              <div key={a.allocation_id}
                className="rounded-xl border p-2 text-center text-xs cursor-default hover:shadow-md transition-shadow"
                style={{ background: col.bg, borderColor: col.border }}>
                <div className="font-bold text-gray-600 text-xs mb-0.5">S{a.seat_no}</div>
                <div className="font-semibold truncate text-xs" style={{ color: col.text }}>
                  {a.student?.roll_no?.slice(-6) || '--'}
                </div>
                <div className="text-gray-400 text-xs mt-0.5">{a.course.code}</div>
              </div>
            );
          })}
        </div>

        {roomPlanStudents.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">No students in this room</div>
        )}
      </div>
    </div>
  );
}

// ---- EmptyFiltered ----
function EmptyFiltered() {
  return (
    <div className="bg-white rounded-2xl border border-dashed p-10 text-center" style={{ borderColor: '#d1fae5' }}>
      <Filter className="w-8 h-8 mx-auto mb-2 opacity-30" style={{ color: '#16a34a' }} />
      <p className="text-gray-500 font-medium text-sm">No data matches the current filters</p>
    </div>
  );
}