import { useState, useEffect } from 'react';
import { Wifi, WifiOff, X } from 'lucide-react';
import { ensureBackendCheck } from '../data/useApi';

export default function BackendStatus() {
  const [status,    setStatus]    = useState(null); // null=checking, true=online, false=offline
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    ensureBackendCheck().then(setStatus);
  }, []);

  // Don't show while checking or if online or dismissed
  if (status === null || status === true || dismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-start gap-3 px-4 py-3 rounded-2xl shadow-xl max-w-sm"
      style={{ background: '#fef9c3', border: '1px solid #fde047', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
      <WifiOff className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-amber-800">Backend Offline</p>
        <p className="text-xs text-amber-700 mt-0.5">
          Running in offline mode — data saved to browser storage.
          Start the backend: <code className="bg-amber-100 px-1 rounded">npm start</code> in <code className="bg-amber-100 px-1 rounded">exam-system-backend/</code>
        </p>
      </div>
      <button onClick={() => setDismissed(true)} className="text-amber-500 hover:text-amber-700 shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
