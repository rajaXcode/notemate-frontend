import { Link } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { Logo } from '../ui.jsx';
import { Mic, Sparkles, BrainCircuit, ShieldCheck, ArrowRight, CheckCircle2, Play } from 'lucide-react';

const steps = [
  ['Start a lecture', 'Pick a project, like Physics, and launch a session.'],
  ['Speak or listen', 'Your mic streams to speech-to-text that understands Hinglish.'],
  ['Notes build live', 'AI adds, updates or ignores lines every few seconds.'],
  ['End and search', 'Notes are finalized and indexed for every future question.']
];

const feats = [
  ['Live transcript', 'See every sentence as it is spoken, with a caption for the one in progress.'],
  ['Notes that rewrite themselves', 'Blocks grow as the lecture goes on, in clean English with Markdown formatting.'],
  ['Ask across lectures', 'Ask in class or later. Answers draw on the current lecture and past ones.'],
  ['Flashcards', 'Turn any lecture into flip cards in one click.'],
  ['Quick MCQ quiz', 'Check what stuck with a short five-question quiz.'],
  ['Private by default', 'Only you can see your subjects, notes and transcripts.']
];

export default function Landing() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-brand-bg text-brand-ink selection:bg-brand-mark selection:text-brand-ink">
      <nav className="sticky top-0 z-20 flex items-center justify-between px-[5vw] py-4 bg-brand-deep/95 text-white backdrop-blur-md border-b border-white/10 shadow-lg">
        <Logo />
        <div className="hidden md:flex items-center gap-6">
          <a className="text-white/80 hover:text-white text-sm font-medium transition" href="#how">How it works</a>
          <a className="text-white/80 hover:text-white text-sm font-medium transition" href="#feat">Features</a>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <Link className="bg-brand-mark text-brand-ink hover:bg-brand-mark/90 font-semibold px-4 py-2 rounded-xl text-sm shadow-md transition transform hover:-translate-y-0.5" to="/app">Dashboard</Link>
          ) : (
            <>
              <Link className="border border-white/30 hover:border-white text-white font-medium px-4 py-2 rounded-xl text-sm transition" to="/login">Log in</Link>
              <Link className="bg-brand-mark text-brand-ink hover:bg-brand-mark/90 font-semibold px-4 py-2 rounded-xl text-sm shadow-md transition transform hover:-translate-y-0.5 flex items-center gap-1.5" to="/signup">
                Sign up <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </nav>

      <section className="bg-brand-deep text-white px-[5vw] pt-20 pb-24 grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(15,118,110,0.3),transparent_50%)] pointer-events-none"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-teal/30 border border-brand-teal/40 text-brand-mark text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> AI-Powered Lecture Assistant
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.05]">
            Listen once. <span className="text-brand-mark underline decoration-brand-mark/40 decoration-wavy">Keep the notes.</span>
          </h1>
          <p className="text-lg text-white/80 my-6 max-w-xl leading-relaxed">
            NoteMate turns your live lecture, even in Hinglish, into clean, structured notes while the teacher is still talking. Ask questions mid-class and revise later from flashcards and quizzes.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link className="bg-brand-mark text-brand-ink hover:bg-brand-mark/90 font-bold px-6 py-3.5 rounded-2xl shadow-xl transition transform hover:-translate-y-0.5 flex items-center gap-2" to="/signup">
              Start your first lecture <ArrowRight className="w-4 h-4" />
            </Link>
            <a className="border border-white/30 hover:border-white text-white font-semibold px-6 py-3.5 rounded-2xl transition flex items-center gap-2 hover:bg-white/5" href="#how">
              See how it works
            </a>
          </div>
        </div>

        <div className="relative z-10 bg-white text-brand-ink rounded-3xl overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] border border-brand-line">
          <div className="p-4 bg-emerald-50/80 border-b border-brand-line flex items-center justify-between text-sm">
            <span className="inline-flex items-center gap-2 font-bold text-brand-coral">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-coral animate-ping"></span> Hearing the lecture
            </span>
            <span className="text-xs text-brand-mut font-mono">Live Stream</span>
          </div>
          <div className="p-5 italic text-brand-deep text-base border-b border-brand-line/60 bg-white">
            “aaj hum Newton ke laws padhenge… agar koi force na lage to object rest mein hi rehta hai”
          </div>
          <div className="p-6 bg-brand-card">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-mut">Notes, written for you</span>
            <h3 className="text-xl font-bold mt-1 text-brand-deep">Newton’s first law</h3>
            <p className="mt-2 text-brand-ink text-sm leading-relaxed">
              An object stays at rest or in uniform motion unless a <strong className="bg-brand-mark/30 px-1 rounded font-semibold">net force</strong> acts on it.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 px-[5vw]" id="how">
        <div className="max-w-3xl mb-16">
          <span className="text-brand-teal font-bold uppercase text-xs tracking-wider">Seamless Workflow</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold mt-2 text-brand-deep">From microphone to revision sheet</h2>
          <p className="text-brand-mut text-lg mt-3">Four steps, and you only do the first one.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map(([t, d], i) => (
            <div key={t} className="bg-white p-6 rounded-2xl border border-brand-line shadow-sm relative group hover:border-brand-teal transition">
              <div className="text-brand-teal font-extrabold text-3xl mb-3 font-heading">0{i+1}</div>
              <b className="block text-lg font-bold text-brand-deep mb-2">{t}</b>
              <p className="text-brand-mut text-sm leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 px-[5vw] bg-white border-y border-brand-line" id="feat">
        <div className="max-w-3xl mb-16">
          <span className="text-brand-teal font-bold uppercase text-xs tracking-wider">Powerful Features</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold mt-2 text-brand-deep">Built for the way students actually study</h2>
          <p className="text-brand-mut text-lg mt-3">Everything stays in one place, organised by subject.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {feats.map(([t, d]) => (
            <div key={t} className="bg-brand-bg/50 border border-brand-line rounded-2xl p-6 hover:shadow-md transition group">
              <div className="w-10 h-10 rounded-xl bg-brand-teal/10 flex items-center justify-center text-brand-teal mb-4 group-hover:scale-110 transition">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-brand-deep mb-2">{t}</h3>
              <p className="text-brand-mut text-sm leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-brand-mark px-[5vw] py-20 text-center relative overflow-hidden">
        <div className="max-w-2xl mx-auto relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-deep mb-4">Your next lecture deserves better than a blank page.</h2>
          <p className="text-brand-deep/80 text-base mb-8">Join students who are acing their classes without missing a word.</p>
          <Link className="inline-flex items-center gap-2 bg-brand-deep text-white hover:bg-brand-deep/90 font-bold px-8 py-4 rounded-2xl shadow-xl transition transform hover:-translate-y-0.5" to="/signup">
            Create a free account <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <footer className="py-8 px-[5vw] text-brand-mut text-sm flex flex-col sm:flex-row items-center justify-between border-t border-brand-line bg-white">
        <Logo />
        <p className="mt-4 sm:mt-0">NoteMate. Built for students who would rather listen.</p>
      </footer>
    </div>
  );
}
