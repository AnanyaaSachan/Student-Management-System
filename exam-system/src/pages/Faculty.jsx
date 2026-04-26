import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { getFaculty, addFaculty, updateFaculty, deleteFaculty } from '../data/store';

const EMPTY_FORM = { name: '', department: '', designation: '' };

export default function Faculty() {
  const [faculty, setFaculty] = useState(getFaculty);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');

  const refresh = () => setFaculty(getFaculty());

  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (f) => {
    setEditTarget(f);
    setForm({ name: f.name, department: f.department, designation: f.designation });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editTarget) {
      updateFaculty(editTarget.faculty_id, form);
    } else {
      addFaculty(form);
    }
    refresh();
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (confirm('Delete this faculty member?')) {
      deleteFaculty(id);
      refresh();
    }
  };

  const filtered = faculty.filter(
    (f) =>
      f.name?.toLowerCase().includes(search.toLowerCase()) ||
      f.department?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'department', label: 'Department' },
    { key: 'designation', label: 'Designation' },
    {
      key: 'total_duties',
      label: 'Total Duties',
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
          {row.total_duties || 0}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEdit(row)}
            className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.faculty_id)}
            className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-8">
      <PageHeader
        title="Faculty"
        subtitle={`${faculty.length} faculty members`}
        action={
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Faculty
          </button>
        }
      />

      <input
        type="text"
        placeholder="Search by name or department..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-sm px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      <Table columns={columns} data={filtered} emptyMessage="No faculty members added yet." />

      {showModal && (
        <Modal title={editTarget ? 'Edit Faculty' : 'Add Faculty'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { name: 'name', label: 'Full Name', required: true },
              { name: 'department', label: 'Department', required: true },
              { name: 'designation', label: 'Designation', required: true },
            ].map(({ name, label, required }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type="text"
                  required={required}
                  value={form[name]}
                  onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            ))}
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
                {editTarget ? 'Save Changes' : 'Add Faculty'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
