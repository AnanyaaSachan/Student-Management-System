import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { getRooms, addRoom, updateRoom, deleteRoom } from '../data/store';

const EMPTY_FORM = { room_no: '', capacity: '', building: '' };

export default function Rooms() {
  const [rooms, setRooms] = useState(getRooms);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const refresh = () => setRooms(getRooms());

  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (room) => {
    setEditTarget(room);
    setForm({ room_no: room.room_no, capacity: room.capacity, building: room.building });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editTarget) {
      updateRoom(editTarget.room_id, { ...form, capacity: Number(form.capacity) });
    } else {
      addRoom({ ...form, capacity: Number(form.capacity) });
    }
    refresh();
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (confirm('Delete this room?')) {
      deleteRoom(id);
      refresh();
    }
  };

  const totalCapacity = rooms.reduce((sum, r) => sum + Number(r.capacity), 0);

  const columns = [
    { key: 'room_no', label: 'Room No' },
    { key: 'building', label: 'Building' },
    {
      key: 'capacity',
      label: 'Capacity',
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
          {row.capacity} seats
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
            onClick={() => handleDelete(row.room_id)}
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
        title="Rooms"
        subtitle={`${rooms.length} rooms · ${totalCapacity} total seats`}
        action={
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Room
          </button>
        }
      />

      <Table columns={columns} data={rooms} emptyMessage="No rooms added yet." />

      {showModal && (
        <Modal title={editTarget ? 'Edit Room' : 'Add Room'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { name: 'room_no', label: 'Room Number', required: true },
              { name: 'building', label: 'Building', required: true },
              { name: 'capacity', label: 'Seating Capacity', type: 'number', required: true },
            ].map(({ name, label, type = 'text', required }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type={type}
                  required={required}
                  min={type === 'number' ? 1 : undefined}
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
                {editTarget ? 'Save Changes' : 'Add Room'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
