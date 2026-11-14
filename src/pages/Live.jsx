import { useEffect, useRef, useState } from 'react';
import { api, wsUrl } from '../api.js';
import { Md, toast } from '../ui.jsx';
import { Mic, MicOff, Send, PhoneOff, MessageSquare, BookOpen, FileText, Sparkles, Clock, Loader2 } from 'lucide-react';

const mmss = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');

export default function Live({ d, back, onEnded }) {
  const [tr, setTr] = useState(d.transcriptChunks), [part, setPart] = useState(''), [notes, setNotes] = useState(() => new Map(d.noteChunks.map(n => [n.id, n]))), [fresh, setFresh] = useState(new Set());
  const [msgs, setMsgs] = useState([{ r: 'a', t: 'Ask anything about this lecture or your earlier ones.' }]), [q, setQ] = useState(''), [typed, setTyped] = useState('');
  const [status, setStatus] = useState('Connecting'), [secs, setSecs] = useState(0), [mic, setMic] = useState(false), [tab, setTab] = useState('c2');
  const ws = useRef(null), micRef = useRef(null), alive = useRef(true), trEnd = useRef(), qaEnd = useRef();

  useEffect(() => { trEnd.current?.scrollIntoView({ behavior: 'smooth' }) }, [tr]);
  useEffect(() => { qaEnd.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs]);
  useEffect(() => { const t0 = new Date(d.startedAt); const i = setInterval(() => setSecs(Math.max(0, Math.floor((Date.now() - t0) / 1000))), 1000); return () => clearInterval(i) }, [d.startedAt]);

  useEffect(() => {
    alive.current = true;
    const connect = () => {
      const s = new WebSocket(wsUrl(d.id));
      ws.current = s;
      s.onopen = () => setStatus('Live');
      s.onclose = () => { if (!alive.current) return; setStatus('Reconnecting'); setTimeout(() => alive.current && connect(), 3000) };
      s.onmessage = e => {
        const m = JSON.parse(e.data);
        if (m.type === 'TRANSCRIPT_PARTIAL') setPart(m.text);
        else if (m.type === 'TRANSCRIPT_FINAL') { setTr(t => [...t, m.chunk]); setPart('') }
        else if (m.type === 'NOTE_BLOCKS_UPDATED') { setNotes(p => { const n = new Map(p); m.blocks.forEach(b => n.set(b.id, b)); return n }); setFresh(new Set(m.blocks.map(b => b.id))) }
        else if (m.type === 'QA_ANSWER_CHUNK') setMsgs(a => { const c = [...a], l = c[c.length - 1]; c[c.length - 1] = { ...l, t: (l.t === 'Thinking…' ? '' : l.t) + m.text }; return c });
        else if (m.type === 'QA_ERROR') setMsgs(a => { const c = [...a]; c[c.length - 1] = { r: 'a', t: m.error }; return c });
      };
    };
    connect();
    return () => { alive.current = false; ws.current?.close(); micRef.current?.stop() }
  }, [d.id]);

  const send = o => ws.current?.readyState === 1 ? (ws.current.send(JSON.stringify(o)), true) : (toast('Not connected yet'), false);
  const ask = () => { const v = q.trim(); if (v && send({ type: 'QUESTION', question: v })) { setMsgs(a => [...a, { r: 'u', t: v }, { r: 'a', t: 'Thinking…' }]); setQ('') } };
  const addLine = () => { const v = typed.trim(); if (v && send({ type: 'TRANSCRIPT_TEXT', text: v })) setTyped('') };

  async function toggleMic() {
    if (micRef.current) { micRef.current.stop(); return }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } });
      const ac = new AudioContext(), src = ac.createMediaStreamSource(stream), pr = ac.createScriptProcessor(4096, 1, 1), ratio = ac.sampleRate / 16000;
      pr.onaudioprocess = e => {
        if (ws.current?.readyState !== 1) return;
        const x = e.inputBuffer.getChannelData(0), n = Math.floor(x.length / ratio), o = new Int16Array(n);
        for (let i = 0; i < n; i++) { const v = Math.max(-1, Math.min(1, x[Math.floor(i * ratio)])); o[i] = v < 0 ? v * 32768 : v * 32767 }
        ws.current.send(o.buffer);
      };
      src.connect(pr); pr.connect(ac.destination);
      micRef.current = { stop() { stream.getTracks().forEach(t => t.stop()); pr.disconnect(); ac.close(); micRef.current = null; setMic(false) } };
      setMic(true);
    } catch { toast('Microphone permission is needed to stream audio.') }
  }

  async function end() {
    if (!confirm('End this lecture? Notes will be finalized and indexed.')) return;
    alive.current = false; ws.current?.close(); micRef.current?.stop();
    try { await api(`/api/sessions/${d.id}/end`, { method: 'POST' }) } catch (e) { toast(e.message) }
    onEnded();
  }

  const sorted = [...notes.values()].sort((a, b) => a.sortOrder - b.sortOrder);
  const show = id => tab === id ? ' flex' : ' hidden lg:flex';

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col h-screen overflow-hidden">
      {/* Top Bar */}
      <div className="bg-brand-deep text-white px-6 py-3.5 flex items-center gap-4 shadow-md shrink-0">
        {back}
        <h2 className="text-base font-bold truncate flex-1">{d.title}</h2>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-brand-mark animate-ping"></span>
          <span className="text-brand-mark">{status}</span>
        </div>
        <div className="font-mono text-sm font-bold bg-white/10 px-3 py-1 rounded-lg flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-brand-mark" /> {mmss(secs)}
        </div>
        <button onClick={toggleMic} className={`font-bold px-4 py-2 rounded-xl text-sm shadow transition flex items-center gap-1.5 ${mic ? 'bg-brand-coral text-white animate-pulse' : 'bg-brand-mark text-brand-ink hover:bg-brand-mark/90'}`}>
          {mic ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />} {mic ? 'Mute mic' : 'Start mic'}
        </button>
        <button onClick={end} className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-sm shadow transition flex items-center gap-1.5">
          <PhoneOff className="w-4 h-4" /> End session
        </button>
      </div>

      {/* Mobile Tabs */}
      <div className="lg:hidden flex bg-white border-b border-brand-line p-2 gap-2 shrink-0">
        {[
          ['c1', 'Transcript', FileText],
          ['c2', 'Live Notes', BookOpen],
          ['c3', 'Ask AI', MessageSquare]
        ].map(([k, l, Icon]) => (
          <button key={k} onClick={() => setTab(k)} className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${tab === k ? 'bg-brand-teal text-white shadow' : 'bg-brand-bg text-brand-mut hover:text-brand-deep'}`}>
            <Icon className="w-3.5 h-3.5" /> {l}
          </button>
        ))}
      </div>

      {/* 3 Column Layout */}
      <div className="grid lg:grid-cols-[1fr_2fr_1fr] gap-4 p-4 flex-1 overflow-hidden">
        {/* Column 1: Transcript */}
        <section className={`bg-white rounded-2xl border border-brand-line flex-col overflow-hidden shadow-sm ${show('c1')}`}>
          <div className="p-4 border-b border-brand-line bg-brand-bg/50 font-bold text-sm text-brand-deep flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-teal" /> Live Transcript
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {tr.map((t, idx) => (
              <div key={t.sequence + t.text + idx} className="text-sm p-3 rounded-xl bg-brand-bg border border-brand-line/60 text-brand-ink leading-relaxed">
                {t.text}
              </div>
            ))}
            {part && (
              <div className="text-sm p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 italic animate-pulse">
                {part}
              </div>
            )}
            <div ref={trEnd} />
          </div>
          <div className="p-3 border-t border-brand-line bg-white flex gap-2">
            <input 
              value={typed} 
              onChange={e => setTyped(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && addLine()} 
              placeholder="Type a line to test..." 
              className="flex-1 px-3 py-2 rounded-xl border border-brand-line text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal" 
            />
            <button onClick={addLine} className="bg-brand-teal hover:bg-brand-deep text-white font-bold px-4 py-2 rounded-xl text-sm transition">
              Add
            </button>
          </div>
        </section>

        {/* Column 2: Live Notes */}
        <section className={`bg-white rounded-2xl border border-brand-line flex-col overflow-hidden shadow-sm ${show('c2')}`}>
          <div className="p-4 border-b border-brand-line bg-brand-bg/50 font-bold text-sm text-brand-deep flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-teal" /> Live Notes
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {sorted.length ? sorted.map(n => (
              <div key={n.id + n.version} className={`p-6 rounded-2xl border-l-4 border-brand-teal bg-emerald-50/30 border border-brand-line shadow-sm transition-all duration-500 ${fresh.has(n.id) ? 'bg-brand-mark/20 ring-2 ring-brand-mark animate-pulse' : ''}`}>
                <h3 className="text-lg font-bold text-brand-deep mb-3">{n.heading}</h3>
                <Md text={n.content} />
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-brand-mut">
                <Sparkles className="w-12 h-12 text-brand-teal/30 mb-3 animate-bounce" />
                <p className="font-medium text-sm">Notes appear here a few seconds after the lecture starts.</p>
              </div>
            )}
          </div>
        </section>

        {/* Column 3: Ask NoteMate */}
        <section className={`bg-white rounded-2xl border border-brand-line flex-col overflow-hidden shadow-sm ${show('c3')}`}>
          <div className="p-4 border-b border-brand-line bg-brand-bg/50 font-bold text-sm text-brand-deep flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-brand-teal" /> Ask NoteMate
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {msgs.map((m, i) => (
              <div key={i} className={`p-3.5 rounded-2xl text-sm max-w-[88%] leading-relaxed ${m.r === 'u' ? 'bg-brand-teal text-white ml-auto rounded-br-xs' : 'bg-brand-bg border border-brand-line text-brand-ink rounded-bl-xs'}`}>
                {m.r === 'a' ? <Md text={m.t} /> : m.t}
              </div>
            ))}
            <div ref={qaEnd} />
          </div>
          <div className="p-3 border-t border-brand-line bg-white flex gap-2">
            <input 
              value={q} 
              onChange={e => setQ(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && ask()} 
              placeholder="Ask about this lecture..." 
              className="flex-1 px-3 py-2 rounded-xl border border-brand-line text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal" 
            />
            <button onClick={ask} className="bg-brand-teal hover:bg-brand-deep text-white font-bold px-4 py-2 rounded-xl text-sm transition flex items-center justify-center">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
