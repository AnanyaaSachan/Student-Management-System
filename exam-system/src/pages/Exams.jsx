import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { getExams, addExam, deleteExam } from '../data/store';

const EMPTY_FORM = { exam_name: '', date: '', session: 'Morning' };

export default function Exams() {
  const [exams, setExams] = useState(getExams);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const refresh = () => setExams(getExams());

  const handleSubmit = (e) => {
    e.preventDefault();
    addExam(form);
    refresh();
    setShowModal(false);
    setForm(EMPTY_FORM);
  };

  const handleDelete = (id) => {
    if (confirm('Delete this exam?')) {
      deleteExam(id);
      refresh();
    }
  };

  const columns = [
    { key: 'exam_name', label: 'Exam Name' },
    { key: 'date', label: 'Date' },
    {
      key: 'session',
      label: 'Session',
      render: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.session === 'Morning'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-indigo-100 text-indigo-700'
          }`}
        >
          {row.session}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <button
          onClick={() => handleDelete(row.exam_id)}
          className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="p-8">
      <PageHeader
        title="Exams"
        subtitle={`${exams.length} exams scheduled`}
        action={
          <button
            onClick={() => { setShowModal(true); setForm(EMPTY_FORM); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Schedule Exam
          </button>
        }
      />

      <Table columns={columns} data={exams} emptyMessage="No exams scheduled yet." />

      {showModal && (
        <Modal title="Schedule Exam" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Mid Semester Exam – CS 2025"
                value={form.exam_name}
                onChange={(e) => setForm({ ...form, exam_name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
              <select
                value={form.session}
                onChange={(e) => setForm({ ...form, session: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option>Morning</option>
                <option>Afternoon</option>
                <option>Evening</option>
              </select>
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
                Schedule
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
