import { useState } from 'react';
import { api } from '../api.js';
import { Md, Modal, toast } from '../ui.jsx';
import { Sparkles, Brain, FileText, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Check } from 'lucide-react';

function Cards({ items, onClose }) {
  const [i, setI] = useState(0), [f, setF] = useState(false);
  const go = n => { setI((i + n + items.length) % items.length); setF(false) };
  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between mb-4 text-xs font-bold text-brand-mut uppercase tracking-wider">
        <span>Flashcard {i + 1} of {items.length}</span>
        <span className="bg-brand-teal/10 text-brand-teal px-2 py-0.5 rounded-full">Click card to flip</span>
      </div>
      <div className={`min-h-[240px] rounded-2xl flex items-center justify-center text-center p-6 cursor-pointer shadow-lg transition-all duration-300 font-medium text-lg mb-6 select-none ${f ? 'bg-brand-mark text-brand-ink' : 'bg-brand-deep text-white'}`} onClick={() => setF(!f)}>
        {f ? items[i].a : items[i].q}
      </div>
      <div className="flex items-center gap-3">
        <button className="flex-1 border border-brand-line hover:bg-brand-bg text-brand-teal font-bold py-3 rounded-xl transition flex items-center justify-center gap-1.5" onClick={() => go(-1)}>
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <button className="flex-1 bg-brand-teal hover:bg-brand-deep text-white font-bold py-3 rounded-xl shadow-md transition flex items-center justify-center gap-1.5" onClick={() => go(1)}>
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </Modal>
  );
}

function Quiz({ items, onClose }) {
  const [i, setI] = useState(0), [sc, setSc] = useState(0), [pick, setPick] = useState(null);
  if (i >= items.length) return (
    <Modal onClose={onClose}>
      <div className="text-center py-6">
        <div className="w-16 h-16 rounded-2xl bg-brand-teal/10 text-brand-teal flex items-center justify-center mx-auto mb-4">
          <Brain className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-brand-deep mb-2">You scored {sc} of {items.length}</h2>
        <p className="text-sm text-brand-mut mb-6">{sc === items.length ? 'Perfect score! You’ve mastered this lecture.' : 'Review the notes and try a fresh quiz to reinforce learning.'}</p>
        <button className="w-full bg-brand-teal hover:bg-brand-deep text-white font-bold py-3.5 rounded-xl shadow-md transition" onClick={onClose}>Done</button>
      </div>
    </Modal>
  );
  const q = items[i];
  const choose = k => { if (pick !== null) return; setPick(k); if (k === q.answer) setSc(sc + 1) };
  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between mb-3 text-xs font-bold text-brand-mut uppercase tracking-wider">
        <span>Question {i + 1} of {items.length}</span>
        <span>Score: {sc}</span>
      </div>
      <h3 className="text-lg font-bold text-brand-deep mb-5">{q.q}</h3>
      <div className="space-y-3 mb-6">
        {q.options.map((o, k) => {
          let st = 'border-brand-line bg-white hover:border-brand-teal';
          if (pick !== null) {
            if (k === q.answer) st = 'bg-emerald-100 border-brand-teal text-brand-deep font-semibold';
            else if (k === pick) st = 'bg-red-100 border-brand-coral text-brand-deep';
          }
          return (
            <button key={k} className={`w-full text-left p-4 rounded-xl border-2 transition text-sm flex items-center justify-between ${st}`} disabled={pick !== null} onClick={() => choose(k)}>
              <span>{o}</span>
              {pick !== null && k === q.answer && <Check className="w-5 h-5 text-brand-teal shrink-0" />}
              {pick !== null && k === pick && k !== q.answer && <XCircle className="w-5 h-5 text-brand-coral shrink-0" />}
            </button>
          );
        })}
      </div>
      {pick !== null && (
        <div className="animate-in fade-in duration-200">
          <p className="text-xs text-brand-mut bg-brand-bg p-3 rounded-xl mb-4 border border-brand-line leading-relaxed">{q.why}</p>
          <button className="w-full bg-brand-teal hover:bg-brand-deep text-white font-bold py-3 rounded-xl shadow-md transition" onClick={() => { setI(i + 1); setPick(null) }}>
            {i + 1 < items.length ? 'Next question' : 'See score'}
          </button>
        </div>
      )}
    </Modal>
  );
}

const PROMPTS = {
  cards: 'Using only this lecture’s notes, write 8 flashcards. Reply with ONLY a JSON array like [{"q":"question","a":"short answer"}]. No other text.',
  quiz: 'Using only this lecture’s notes, write 5 multiple-choice questions with 4 options each. Reply with ONLY a JSON array like [{"q":"question","options":["a","b","c","d"],"answer":0,"why":"one-line reason"}] where answer is the index of the correct option. No other text.'
};

export default function Notes({ d, back }) {
  const [view, setView] = useState(null), [busy, setBusy] = useState(false);

  async function gen(kind) {
    if (!d.noteChunks.length) return toast('This lecture has no notes yet.');
    setBusy(true);
    try {
      const r = await api('/api/query', { method: 'POST', body: { question: PROMPTS[kind], sessionId: d.id } });
      const s = r.answer;
      setView({ kind, items: JSON.parse(s.slice(s.indexOf('['), s.lastIndexOf(']') + 1)) });
    } catch { toast('Could not generate. Try again.') }
    setBusy(false);
  }

  const close = () => setView(null);

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <div className="bg-brand-deep text-white px-6 py-4 flex items-center gap-4 shadow-md sticky top-0 z-30">
        {back}
        <h2 className="text-lg font-bold truncate flex-1">{d.title}</h2>
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-brand-teal">{d.status}</span>
      </div>

      <div className="max-w-4xl w-full mx-auto p-6 sm:p-10 flex-1">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-brand-line mb-8">
          <h1 className="text-3xl font-extrabold text-brand-deep mb-2">{d.title}</h1>
          <p className="text-xs text-brand-mut font-medium mb-6">{new Date(d.startedAt).toLocaleString()}</p>

          <div className="flex flex-wrap items-center gap-3 mb-10 pb-6 border-b border-brand-line">
            <button className="bg-brand-teal hover:bg-brand-deep text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-md transition disabled:opacity-50 flex items-center gap-2" disabled={busy} onClick={() => gen('cards')}>
              <Sparkles className="w-4 h-4 text-brand-mark" /> {busy ? 'Working…' : 'Flashcards'}
            </button>
            <button className="bg-brand-mark hover:bg-brand-mark/90 text-brand-ink font-bold px-5 py-2.5 rounded-xl text-sm shadow-md transition disabled:opacity-50 flex items-center gap-2" disabled={busy} onClick={() => gen('quiz')}>
              <Brain className="w-4 h-4" /> Quick quiz
            </button>
            <button className="border border-brand-line hover:bg-brand-bg text-brand-teal font-semibold px-5 py-2.5 rounded-xl text-sm transition flex items-center gap-2" onClick={() => setView({ kind: 'tx' })}>
              <FileText className="w-4 h-4" /> Transcript
            </button>
          </div>

          {d.noteChunks.length ? (
            <div className="space-y-8">
              {d.noteChunks.map(n => (
                <div key={n.id} className="p-6 rounded-2xl border-l-4 border-brand-teal bg-emerald-50/40 border border-brand-line shadow-sm">
                  <h2 className="text-xl font-bold text-brand-deep mb-3">{n.heading}</h2>
                  <Md text={n.content} />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-brand-bg border-2 border-dashed border-brand-line rounded-2xl p-12 text-center text-brand-mut">
              No notes were captured for this lecture.
            </div>
          )}
        </div>
      </div>

      {view?.kind === 'cards' && <Cards items={view.items} onClose={close} />}
      {view?.kind === 'quiz' && <Quiz items={view.items} onClose={close} />}
      {view?.kind === 'tx' && (
        <Modal onClose={close}>
          <h2 className="text-xl font-bold text-brand-deep mb-4">Full Lecture Transcript</h2>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {d.transcriptChunks.length ? d.transcriptChunks.map(t => (
              <div key={t.id} className="text-sm p-3 rounded-xl bg-brand-bg border border-brand-line text-brand-ink leading-relaxed">
                {t.text}
              </div>
            )) : <p className="text-sm text-brand-mut">No transcript available.</p>}
          </div>
        </Modal>
      )}
    </div>
  );
}
