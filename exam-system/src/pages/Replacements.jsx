import { useState } from 'react';
import { Plus, CheckCircle, XCircle } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import Table from '../components/Table';
import { getFaculty, getExams, getReplacements, addReplacement, updateReplacement } from '../data/store';

const EMPTY_FORM = { original_faculty_id: '', replacement_faculty_id: '', exam_id: '', reason: '' };

export default function Replacements() {
  const faculty = getFaculty();
  const exams = getExams();
  const [replacements, setReplacements] = useState(getReplacements);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const refresh = () => setReplacements(getReplacements());

  const handleSubmit = (e) => {
    e.preventDefault();
    addReplacement({
      ...form,
      original_faculty_id: Number(form.original_faculty_id),
      replacement_faculty_id: Number(form.replacement_faculty_id),
      exam_id: Number(form.exam_id),
    });
    refresh();
    setShowModal(false);
    setForm(EMPTY_FORM);
  };

  const handleApprove = (id) => {
    updateReplacement(id, { status: 'Approved' });
    refresh();
  };

  const handleReject = (id) => {
    updateReplacement(id, { status: 'Rejected' });
    refresh();
  };

  const getFacultyName = (id) => faculty.find((f) => f.faculty_id === id)?.name || '—';
  const getExamName = (id) => exams.find((e) => e.exam_id === id)?.exam_name || '—';

  const statusBadge = (status) => {
    const map = {
      Pending: 'bg-amber-100 text-amber-700',
      Approved: 'bg-green-100 text-green-700',
      Rejected: 'bg-rose-100 text-rose-700',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status] || ''}`}>
        {status}
      </span>
    );
  };

  const columns = [
    { key: 'exam', label: 'Exam', render: (row) => getExamName(row.exam_id) },
    { key: 'original', label: 'Original Faculty', render: (row) => getFacultyName(row.original_faculty_id) },
    { key: 'replacement', label: 'Replacement Faculty', render: (row) => getFacultyName(row.replacement_faculty_id) },
    { key: 'reason', label: 'Reason' },
    { key: 'status', label: 'Status', render: (row) => statusBadge(row.status) },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) =>
        row.status === 'Pending' ? (
          <div className="flex gap-2">
            <button
              onClick={() => handleApprove(row.replacement_id)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-medium hover:bg-green-200"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Approve
            </button>
            <button
              onClick={() => handleReject(row.replacement_id)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-700 text-xs font-medium hover:bg-rose-200"
            >
              <XCircle className="w-3.5 h-3.5" />
              Reject
            </button>
          </div>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        ),
    },
  ];

  return (
    <div className="p-8">
      <PageHeader
        title="Replacement Management"
        subtitle="Handle invigilation duty replacement requests"
        action={
          <button
            onClick={() => { setShowModal(true); setForm(EMPTY_FORM); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Request Replacement
          </button>
        }
      />

      <Table columns={columns} data={replacements} emptyMessage="No replacement requests yet." />

      {showModal && (
        <Modal title="Request Replacement" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam</label>
              <select
                required
                value={form.exam_id}
                onChange={(e) => setForm({ ...form, exam_id: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">— Select Exam —</option>
                {exams.map((e) => (
                  <option key={e.exam_id} value={e.exam_id}>{e.exam_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Original Faculty (requesting leave)</label>
              <select
                required
                value={form.original_faculty_id}
                onChange={(e) => setForm({ ...form, original_faculty_id: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">— Select Faculty —</option>
                {faculty.map((f) => (
                  <option key={f.faculty_id} value={f.faculty_id}>{f.name} ({f.department})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Replacement Faculty</label>
              <select
                required
                value={form.replacement_faculty_id}
                onChange={(e) => setForm({ ...form, replacement_faculty_id: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">— Select Faculty —</option>
                {faculty
                  .filter((f) => f.faculty_id !== Number(form.original_faculty_id))
                  .map((f) => (
                    <option key={f.faculty_id} value={f.faculty_id}>{f.name} ({f.department})</option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <textarea
                required
                rows={3}
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="e.g. Medical leave, emergency..."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
              >
                Submit Request
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
