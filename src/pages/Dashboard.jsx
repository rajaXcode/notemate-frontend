import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { Logo, Modal, Spin, toast } from '../ui.jsx';
import { Plus, Trash2, Menu, LogOut, BookOpen, Clock, ChevronRight, Play } from 'lucide-react';

// Simple, sleek 3-dot pulse loader component
function DotsLoader() {
  return (
    <div className="flex items-center justify-center gap-1.5 py-12">
      <div className="w-2.5 h-2.5 rounded-full bg-brand-teal animate-bounce [animation-delay:-0.32s]"></div>
      <div className="w-2.5 h-2.5 rounded-full bg-brand-teal animate-bounce [animation-delay:-0.16s]"></div>
      <div className="w-2.5 h-2.5 rounded-full bg-brand-teal animate-bounce"></div>
    </div>
  );
}

function NameModal({ title, hint, label, ph, onSubmit, onClose, loading }) {
  const [v, setV] = useState('');
  return (
    <Modal onClose={onClose}>
      <h2 className="text-xl font-bold text-brand-deep">{title}</h2>
      <p className="text-sm text-brand-mut mt-1 mb-4">{hint}</p>
      <input
        autoFocus
        value={v}
        onChange={e => setV(e.target.value)}
        placeholder={ph}
        onKeyDown={e => e.key === 'Enter' && !loading && onSubmit(v.trim())}
        disabled={loading}
        className="w-full px-4 py-3 rounded-xl border border-brand-line bg-white text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-teal text-sm disabled:opacity-50"
      />
      <div className="flex justify-end gap-2 mt-6">
        <button onClick={onClose} disabled={loading} className="px-4 py-2.5 rounded-xl border border-brand-line text-brand-mut hover:bg-brand-bg text-sm font-medium transition disabled:opacity-50">Cancel</button>
        <button
          disabled={loading}
          className="bg-brand-teal hover:bg-brand-deep text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition flex items-center gap-2 disabled:opacity-50"
          onClick={() => onSubmit(v.trim())}
        >
          {loading ? (
            <div className="flex items-center gap-1 px-2">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:-0.32s]"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:-0.16s]"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce"></div>
            </div>
          ) : label}
        </button>
      </div>
    </Modal>
  );
}

function ConfirmModal({ title, message, confirmLabel, onConfirm, onClose, loading }) {
  return (
    <Modal onClose={onClose}>
      <h2 className="text-xl font-bold text-brand-deep">{title}</h2>
      <p className="text-sm text-brand-mut mt-1 mb-6">{message}</p>
      <div className="flex justify-end gap-2">
        <button onClick={onClose} disabled={loading} className="px-4 py-2.5 rounded-xl border border-brand-line text-brand-mut hover:bg-brand-bg text-sm font-medium transition disabled:opacity-50">Cancel</button>
        <button
          disabled={loading}
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition flex items-center gap-2 disabled:opacity-50"
          onClick={onConfirm}
        >
          {loading ? (
            <div className="flex items-center gap-1 px-2">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:-0.32s]"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:-0.16s]"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce"></div>
            </div>
          ) : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export default function Dashboard() {
  const { subjectId } = useParams(), nav = useNavigate(), { user, logout } = useAuth();
  const [subs, setSubs] = useState(null), [sess, setSess] = useState([]), [modal, setModal] = useState(null), [menu, setMenu] = useState(false);
  const [loadingSess, setLoadingSess] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadSubs = useCallback(() => api('/api/subjects').then(d => setSubs(d.data)).catch(e => toast(e.message)), []);

  const loadSessions = useCallback(() => {
    if (subjectId) {
      setLoadingSess(true);
      api(`/api/subjects/${subjectId}/sessions`)
        .then(d => setSess(d.data))
        .catch(e => toast(e.message))
        .finally(() => setLoadingSess(false));
    } else {
      setSess([]);
    }
  }, [subjectId]);

  useEffect(() => { loadSubs() }, [loadSubs, subjectId]);
  useEffect(() => {
    setSess([]);
    setMenu(false);
    loadSessions();
  }, [subjectId, loadSessions]);

  if (!subs) return <Spin />;
  const cur = subs.find(s => s.id === subjectId);

  const createProject = async name => {
    if (!name) return toast('Enter a project name');
    setActionLoading(true);
    try {
      const d = await api('/api/subjects', { method: 'POST', body: { name } });
      setModal(null);
      await loadSubs();
      nav('/app/' + d.data.id);
    } catch (e) { toast(e.message) }
    finally { setActionLoading(false) }
  };

  const launch = async title => {
    setActionLoading(true);
    try {
      const d = await api(`/api/subjects/${subjectId}/sessions`, { method: 'POST', body: { title } });
      nav('/session/' + d.data.id);
    } catch (e) { toast(e.message) }
    finally { setActionLoading(false) }
  };

  const promptDelProject = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setModal({ type: 'deleteProject', id });
  };

  const executeDelProject = async id => {
    setActionLoading(true);
    try {
      await api('/api/subjects/' + id, { method: 'DELETE' });
      toast('Project deleted successfully');
      setModal(null);
      await loadSubs();
      if (id === subjectId) nav('/app');
    } catch (x) { toast(x.message) }
    finally { setActionLoading(false) }
  };

  const promptDelSession = (e, sessionId) => {
    e.preventDefault();
    e.stopPropagation();
    setModal({ type: 'deleteSession', sessionId });
  };

  const executeDelSession = async sessionId => {
    setActionLoading(true);
    try {
      await api(`/api/subjects/sessions/${sessionId}`, { method: 'DELETE' });
      toast('Lecture deleted successfully');
      setModal(null);
      loadSessions();
      await loadSubs(); // refresh subject counts
    } catch (x) {
      toast(x.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg grid lg:grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-brand-deep text-white p-5 flex flex-col gap-6 transition-transform duration-300 lg:static lg:translate-x-0 ${menu ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between">
          <Logo />
          <button onClick={() => setMenu(false)} className="lg:hidden text-white/70 hover:text-white">✕</button>
        </div>

        <button className="w-full bg-brand-mark hover:bg-brand-mark/90 text-brand-ink font-bold py-3 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2" onClick={() => setModal('project')}>
          <Plus className="w-5 h-5" /> New project
        </button>

        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {subs.length ? subs.map(s => (
            <Link key={s.id} to={'/app/' + s.id} className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition text-sm font-medium ${s.id === subjectId ? 'bg-white/15 text-white font-semibold shadow-inner' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
              <BookOpen className="w-4 h-4 shrink-0 text-brand-mark" />
              <span className="truncate flex-1">{s.name}</span>
              <span className="bg-white/25 text-white text-xs px-2 py-0.5 rounded-full">{s._count.sessions}</span>
              <button title="Delete project" onClick={e => promptDelProject(e, s.id)} className="text-white/40 hover:text-brand-coral p-1 transition">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </Link>
          )) : (
            <p className="text-xs text-white/50 text-center py-6">Your projects appear here.</p>
          )}
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="truncate">
            <p className="text-sm font-bold truncate text-white">{user?.name}</p>
            <p className="text-xs text-white/60 truncate">{user?.email}</p>
          </div>
          <button onClick={() => logout()} title="Log out" className="text-white/70 hover:text-brand-coral p-2 rounded-lg hover:bg-white/10 transition">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-brand-line px-6 py-4 flex items-center gap-4">
          <button className="lg:hidden p-2 rounded-xl border border-brand-line bg-white text-brand-deep hover:bg-brand-bg transition" onClick={() => setMenu(!menu)}>
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-brand-deep truncate flex-1">{cur ? cur.name : 'Your projects'}</h2>
          {cur && (
            <button className="bg-brand-teal hover:bg-brand-deep text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-md transition flex items-center gap-2" onClick={() => setModal('launch')}>
              <Play className="w-4 h-4 fill-current" /> Launch session
            </button>
          )}
        </header>

        <div className="p-6 sm:p-10 max-w-7xl w-full mx-auto">
          {!cur ? (
            subs.length ? (
              <>
                <p className="text-brand-mut mb-6">Choose a project to see its lectures and notes.</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {subs.map(s => (
                    <Link key={s.id} className="bg-white p-6 rounded-2xl border border-brand-line shadow-sm hover:border-brand-teal transition group block" to={'/app/' + s.id}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="w-10 h-10 rounded-xl bg-brand-teal/10 flex items-center justify-center text-brand-teal group-hover:bg-brand-teal group-hover:text-white transition">
                          <BookOpen className="w-5 h-5" />
                        </span>
                        <ChevronRight className="w-5 h-5 text-brand-mut group-hover:translate-x-1 transition-transform" />
                      </div>
                      <h3 className="text-lg font-bold text-brand-deep mb-1 group-hover:text-brand-teal transition">{s.name}</h3>
                      <p className="text-xs text-brand-mut flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {s._count.sessions} lectures recorded</p>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-white border-2 border-dashed border-brand-line rounded-3xl p-12 text-center max-w-lg mx-auto my-12">
                <div className="w-16 h-16 rounded-2xl bg-brand-teal/10 text-brand-teal flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-brand-deep mb-2">No projects yet</h3>
                <p className="text-brand-mut text-sm mb-6">Create a project for each subject, then launch live lectures inside it.</p>
                <button className="bg-brand-teal hover:bg-brand-deep text-white font-bold px-6 py-3 rounded-xl shadow-md transition" onClick={() => setModal('project')}>
                  Create a project
                </button>
              </div>
            )
          ) : (
            loadingSess ? (
              <DotsLoader />
            ) : sess.length ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {sess.map(x => (
                  <Link key={x.id} className="bg-white p-6 rounded-2xl border border-brand-line shadow-sm hover:border-brand-teal transition group block relative" to={'/session/' + x.id}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${x.status === 'LIVE' ? 'bg-red-100 text-brand-coral animate-pulse' : x.status === 'PROCESSING' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-brand-teal'}`}>
                        {x.status}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          title="Delete lecture"
                          onClick={e => promptDelSession(e, x.id)}
                          className="text-brand-mut hover:text-brand-coral p-1.5 rounded-lg hover:bg-red-50 transition z-10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <ChevronRight className="w-5 h-5 text-brand-mut group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-brand-deep mb-1 group-hover:text-brand-teal transition">{x.title}</h3>
                    <p className="text-xs text-brand-mut flex items-center gap-1.5 mt-2"><Clock className="w-3.5 h-3.5" /> {new Date(x.startedAt).toLocaleString()}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white border-2 border-dashed border-brand-line rounded-3xl p-12 text-center max-w-lg mx-auto my-12">
                <div className="w-16 h-16 rounded-2xl bg-brand-teal/10 text-brand-teal flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-brand-deep mb-2">No lectures in {cur.name}</h3>
                <p className="text-brand-mut text-sm mb-6">Launch a live session to start capturing intelligent notes.</p>
                <button className="bg-brand-teal hover:bg-brand-deep text-white font-bold px-6 py-3 rounded-xl shadow-md transition" onClick={() => setModal('launch')}>
                  Launch session
                </button>
              </div>
            )
          )}
        </div>
      </main>

      {modal === 'project' && (
        <NameModal title="New project" hint="One project per subject, like Physics or Economics." ph="Project name" label="Create project" onSubmit={createProject} onClose={() => setModal(null)} loading={actionLoading} />
      )}
      {modal === 'launch' && (
        <NameModal title="Launch a session" hint="Leave the title empty to use today’s date." ph="Lecture title" label="Go live" onSubmit={launch} onClose={() => setModal(null)} loading={actionLoading} />
      )}
      {modal && modal.type === 'deleteProject' && (
        <ConfirmModal
          title="Delete project?"
          message="Are you sure you want to delete this project with all its lectures, notes and transcripts? This action cannot be undone."
          confirmLabel="Delete project"
          onConfirm={() => executeDelProject(modal.id)}
          onClose={() => setModal(null)}
          loading={actionLoading}
        />
      )}
      {modal && modal.type === 'deleteSession' && (
        <ConfirmModal
          title="Delete lecture?"
          message="Are you sure you want to delete this lecture session with all its notes and transcripts? This action cannot be undone."
          confirmLabel="Delete lecture"
          onConfirm={() => executeDelSession(modal.sessionId)}
          onClose={() => setModal(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
}