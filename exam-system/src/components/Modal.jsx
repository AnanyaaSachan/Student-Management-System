import { X } from 'lucide-react';

export default function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,46,22,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
        style={{ border: '1px solid #bbf7d0', boxShadow: '0 20px 60px rgba(22,163,74,0.2)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid #dcfce7', background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', borderRadius: '16px 16px 0 0' }}>
          <h2 className="text-lg font-bold" style={{ color: '#14532d' }}>{title}</h2>
          <button onClick={onClose}
            className="p-1.5 rounded-xl transition-colors"
            style={{ color: '#16a34a' }}
            onMouseEnter={e => e.currentTarget.style.background = '#dcfce7'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
