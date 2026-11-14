import { marked } from 'marked';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { X, Loader2 } from 'lucide-react';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Md = ({ text }) => (
  <div className="prose prose-slate max-w-none text-brand-ink [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-semibold [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_code]:bg-emerald-50 [&_code]:text-teal-700 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_strong]:bg-[#F4C84A]/30 [&_strong]:px-1 [&_strong]:rounded" dangerouslySetInnerHTML={{ __html: marked.parse(text || '') }} />
);

export const Spin = ({ text = "Loading..." }) => (
  <div className="min-h-screen flex items-center justify-center bg-brand-bg text-brand-ink">
    <div className="text-center">
      <Loader2 className="w-12 h-12 animate-spin text-brand-teal mx-auto mb-3" />
      <p className="font-medium text-brand-mut">{text}</p>
    </div>
  </div>
);

export const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-brand-deep/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="bg-brand-card rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-brand-line relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
      <button onClick={onClose} className="absolute top-4 right-4 text-brand-mut hover:text-brand-ink p-1.5 rounded-xl hover:bg-brand-bg transition">
        <X className="w-5 h-5" />
      </button>
      {children}
    </div>
  </div>
);

export function toast(m) {
  const t = document.createElement('div');
  t.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 bg-brand-ink text-white px-5 py-3 rounded-xl shadow-2xl z-[99] text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300';
  t.innerHTML = `<span class="w-2 h-2 rounded-full bg-brand-mark animate-pulse"></span><span>${m}</span>`;
  document.body.append(t);
  setTimeout(() => {
    t.classList.add('opacity-0', 'transition-opacity', 'duration-300');
    setTimeout(() => t.remove(), 300);
  }, 3500);
}

export const Logo = ({ to = '/' }) => (
  <a className="flex items-center gap-2.5 font-extrabold text-xl text-inherit no-underline group" href={to}>
    <div className="w-8 h-8 rounded-xl bg-brand-mark flex items-center justify-center shadow-md group-hover:scale-105 transition-transform relative overflow-hidden">
      <div className="absolute inset-x-1.5 top-3 h-0.5 bg-brand-deep rounded-full shadow-[0_5px_0_#0B3C3F]"></div>
    </div>
    <span className="tracking-tight bg-gradient-to-r from-brand-teal to-brand-deep bg-clip-text text-transparent">NoteMate</span>
  </a>
);
