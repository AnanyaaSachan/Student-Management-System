import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, GraduationCap } from 'lucide-react';
import { authAPI, setToken } from '../data/api';

export default function Login() {
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ username: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      setToken(res.token);
      localStorage.setItem('auth_user', JSON.stringify(res.user));
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg,#052e16 0%,#14532d 50%,#166534 100%)' }}>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle,#4ade80,transparent)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle,#86efac,transparent)' }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}>

          {/* Header */}
          <div className="px-8 py-8 text-center"
            style={{ background: 'linear-gradient(135deg,#166534,#16a34a)' }}>
            <div className="flex justify-center mb-3">
              <img
                src="https://s.yimg.com/zb/imgv1/644fd604-0fa6-3cca-b3a6-82eafb56d751/t_500x300"
                alt="GBU Logo"
                className="w-16 h-16 rounded-full object-cover"
                style={{ border: '3px solid rgba(255,255,255,0.4)', boxShadow: '0 0 20px rgba(74,222,128,0.5)' }}
              />
            </div>
            <h1 className="text-xl font-bold text-white uppercase tracking-wide">Gautam Buddha University</h1>
            <p className="text-green-200 text-sm mt-1">Exam Management System</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <h2 className="text-xl font-bold text-gray-800 mb-1">Welcome back</h2>
            <p className="text-sm text-gray-500 mb-6">Sign in to your admin portal</p>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
                style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1.5"
                  style={{ color: '#15803d' }}>Username</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="admin"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                  style={{ borderColor: '#d1fae5', background: '#f0fdf4' }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-1.5"
                  style={{ color: '#15803d' }}>Password</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full px-4 py-3 pr-12 rounded-xl border text-sm outline-none transition-all"
                    style={{ borderColor: '#d1fae5', background: '#f0fdf4' }}
                  />
                  <button type="button" onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all mt-2 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#166534,#16a34a)', boxShadow: '0 4px 14px rgba(22,163,74,0.4)' }}
              >
                {loading
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <LogIn className="w-4 h-4" />}
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 p-3 rounded-xl text-xs text-center"
              style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d' }}>
              Default: <strong>admin</strong> / <strong>admin123</strong>
            </div>
          </div>
        </div>

        <p className="text-center text-green-300 text-xs mt-4 opacity-60">
          © 2026 Gautam Buddha University · Exam Management System
        </p>
      </div>
    </div>
  );
}
