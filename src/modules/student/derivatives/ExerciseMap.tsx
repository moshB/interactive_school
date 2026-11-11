import { useState } from 'react';
import { Check, Grid2X2 } from 'lucide-react';

export type ExerciseMapItem = {
  id: string;
  title: string;
};

type ExerciseMapProps = {
  subchapterTitle: string;
  exercises: ExerciseMapItem[];
  completedIds: string[];
  currentIndex: number;
  onSelect: (index: number) => void;
};

export default function ExerciseMap({ subchapterTitle, exercises, completedIds, currentIndex, onSelect }: ExerciseMapProps) {
  const [isOpen, setIsOpen] = useState(false);
  const completedCount = exercises.filter((exercise) => completedIds.includes(exercise.id)).length;

  return (
    <div className="mb-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm" dir="rtl">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 rounded-xl px-2 py-1 text-right transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700"><Grid2X2 size={17} /></span>
          <span className="min-w-0">
            <span className="block text-[10px] font-semibold text-slate-400">מפת התרגילים</span>
            <span className="block truncate text-sm font-extrabold text-slate-900">{subchapterTitle}</span>
          </span>
        </span>
        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">{completedCount}/{exercises.length} נפתרו</span>
      </button>

      {isOpen && <div className="mt-3 border-t border-slate-100 px-1 pt-3">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-bold text-slate-700">בחרו שאלה כדי לעבור אליה</p>
          <p className="text-[10px] text-slate-500"><span className="text-emerald-700">✓ נפתרה</span> · <span>טרם נפתרה</span></p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {exercises.map((exercise, index) => {
            const isComplete = completedIds.includes(exercise.id);
            const isCurrent = currentIndex === index;
            return <button
              key={exercise.id}
              type="button"
              onClick={() => { onSelect(index); setIsOpen(false); }}
              aria-current={isCurrent ? 'step' : undefined}
              aria-label={`שאלה ${index + 1}: ${exercise.title}. ${isComplete ? 'נפתרה' : 'טרם נפתרה'}`}
              className={`relative flex min-h-20 flex-col items-center justify-center gap-1 rounded-xl border p-2 text-center transition hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${isComplete ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-200 hover:bg-indigo-50'} ${isCurrent ? 'ring-2 ring-indigo-400 ring-offset-1' : ''}`}
            >
              <span className={`flex size-6 items-center justify-center rounded-full text-[11px] font-extrabold ${isComplete ? 'bg-emerald-200 text-emerald-900' : 'bg-white text-slate-600'}`}>{isComplete ? <Check size={14} /> : index + 1}</span>
              <span className="line-clamp-2 text-[10px] font-bold leading-4">{exercise.title}</span>
              <span className={`text-[9px] font-semibold ${isComplete ? 'text-emerald-700' : 'text-slate-400'}`}>{isComplete ? 'נפתרה' : 'טרם נפתרה'}</span>
            </button>;
          })}
        </div>
      </div>}
    </div>
  );
}