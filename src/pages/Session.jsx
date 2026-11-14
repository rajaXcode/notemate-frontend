import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { Spin, toast } from '../ui.jsx';
import Live from './Live.jsx';
import Notes from './Notes.jsx';
import { ArrowLeft, Loader2, RotateCw, AlertTriangle } from 'lucide-react';

export default function Session() {
  const { id } = useParams(), [d, setD] = useState(null);
  const load = useCallback(() => api('/api/sessions/' + id).then(r => setD(r.data)).catch(e => { toast(e.message) }), [id]);

  useEffect(() => { setD(null); load() }, [load]);
  useEffect(() => { if (d?.status !== 'PROCESSING') return; const t = setInterval(load, 2500); return () => clearInterval(t) }, [d?.status, load]);

  if (!d) return <Spin />;
  const back = (
    <Link className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-brand-line bg-white hover:bg-brand-bg text-brand-deep font-semibold text-sm transition" to={'/app/' + d.subjectId}>
      <ArrowLeft className="w-4 h-4" /> Back
    </Link>
  );

  if (d.status === 'LIVE') return <Live d={d} back={back} onEnded={load} />;
  if (d.status === 'COMPLETED') return <Notes d={d} back={back} />;

  const failed = d.status === 'FAILED';
  const retry = async () => {
    try {
      await api(`/api/sessions/${id}/end`, { method: 'POST' });
      load();
    } catch (e) { toast(e.message) }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <div className="bg-brand-deep text-white px-6 py-4 flex items-center gap-4 shadow-md">
        {back}
        <h2 className="text-lg font-bold truncate flex-1">{d.title}</h2>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-xl border border-brand-line text-center">
          {failed ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-red-100 text-brand-coral flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-brand-deep mb-2">Finalizing failed</h2>
              <p className="text-sm text-brand-mut mb-6 leading-relaxed">Your notes are safe. Retry to finish indexing them.</p>
              <button className="w-full bg-brand-teal hover:bg-brand-deep text-white font-bold py-3.5 rounded-xl shadow-md transition flex items-center justify-center gap-2" onClick={retry}>
                <RotateCw className="w-4 h-4" /> Retry indexing
              </button>
            </>
          ) : (
            <>
              <Loader2 className="w-12 h-12 animate-spin text-brand-teal mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-brand-deep mb-2">Finalizing your notes</h2>
              <p className="text-sm text-brand-mut leading-relaxed">Stopping the live feed, saving the last notes, then indexing every block so you can search it later. This takes a few seconds.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
