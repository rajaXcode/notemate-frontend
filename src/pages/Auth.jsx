import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { Logo } from '../ui.jsx';
import { Loader2, ArrowRight } from 'lucide-react';

export default function Auth({ mode }) {
  const su = mode === 'signup', nav = useNavigate(), { login } = useAuth();
  const [msg, setMsg] = useState(''), [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const b = Object.fromEntries(new FormData(e.target));
    setBusy(true);
    setMsg('Connecting… the server may take a moment to wake up.');
    try {
      login(await api('/api/auth/' + (su ? 'register' : 'login'), { method: 'POST', body: b }));
      nav('/app');
    } catch (x) {
      setMsg(x.message);
    }
    setBusy(false);
  }

  return (
    <div className="min-h-screen bg-brand-deep flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,118,110,0.25),transparent_70%)] pointer-events-none"></div>
      <form onSubmit={submit} className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20 relative z-10 flex flex-col gap-4">
        <div className="flex justify-center mb-2">
          <Logo />
        </div>
        <div className="text-center mb-2">
          <h2 className="text-2xl font-extrabold text-brand-deep">{su ? 'Create your account' : 'Welcome back'}</h2>
          <p className="text-sm text-brand-mut mt-1">{su ? 'Start capturing intelligent lecture notes today' : 'Log in to access your subjects and transcripts'}</p>
        </div>

        {su && (
          <div>
            <label className="block text-xs font-semibold text-brand-mut uppercase mb-1">Full Name</label>
            <input name="name" placeholder="Raja" required className="w-full px-4 py-3 rounded-xl border border-brand-line bg-white text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-teal transition text-sm" />
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold text-brand-mut uppercase mb-1">Email Address</label>
          <input name="email" type="email" placeholder="student@dtu.ac.in" required className="w-full px-4 py-3 rounded-xl border border-brand-line bg-white text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-teal transition text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-brand-mut uppercase mb-1">Password</label>
          <input name="password" type="password" placeholder="•••••••• (8+ characters)" minLength={8} required className="w-full px-4 py-3 rounded-xl border border-brand-line bg-white text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-teal transition text-sm" />
        </div>

        <div className="text-brand-coral text-sm min-h-[1.5rem] font-medium text-center">{msg}</div>

        <button disabled={busy} className="w-full bg-brand-teal hover:bg-brand-deep text-white font-bold py-3.5 rounded-xl shadow-lg transition transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2">
          {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : (su ? 'Create Account' : 'Log In')}
          {!busy && <ArrowRight className="w-4 h-4" />}
        </button>

        <div className="text-center text-sm text-brand-mut mt-2">
          {su ? (
            <>Already have an account? <Link to="/login" className="text-brand-teal font-semibold hover:underline">Log in</Link></>
          ) : (
            <>New here? <Link to="/signup" className="text-brand-teal font-semibold hover:underline">Sign up</Link></>
          )}
        </div>
      </form>
    </div>
  );
}
