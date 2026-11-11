import { useState } from 'react';
import { ArrowLeft, BookOpen, Calculator, Sparkles, Waypoints } from 'lucide-react';
import { GraphingCalculator } from '../math';
import { DerivativeLesson } from './derivatives';

type LearningTool = 'derivatives' | 'graphing';

const learningSteps = [
  { number: '01', title: 'מבינים את הרעיון', text: 'לומדים מה הנגזרת מספרת על קצב השינוי והשיפוע.' },
  { number: '02', title: 'מתרגלים בהדרגה', text: 'פותרים תרגילים מהכלל הבסיסי ועד פולינומים.' },
  { number: '03', title: 'צוברים הצלחות', text: 'מקבלים משוב, נקודות ורצף התקדמות אישי.' },
];

export default function StudentWorkspace() {
  const [activeTool, setActiveTool] = useState<LearningTool>('derivatives');

  return (
    <main className="mx-auto max-w-[1440px] px-4 pb-20 pt-9 sm:px-8 sm:pt-12">
      <section className="relative mb-9 overflow-hidden rounded-[30px] bg-[#171b36] px-6 py-9 text-white sm:px-10 sm:py-11 lg:px-14">
        <div className="absolute -left-16 -top-32 size-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute bottom-[-130px] right-[37%] size-72 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="relative max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-indigo-100"><Sparkles size={14} className="text-amber-300" />מתמטיקה שאפשר לחקור</div>
          <h1 className="max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-[44px]">רואים את הפונקציה.<br className="hidden sm:block" /> מבינים את הסיפור.</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">מרחב עבודה אינטראקטיבי לחקירת פונקציות. שנו ביטוי, עקבו אחרי הגרף, וגלו את הקשר בין הנוסחה לצורה.</p>
          <a href="#student-tools" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-indigo-800 transition hover:bg-indigo-50">מתחילים לחקור <ArrowLeft size={16} /></a>
        </div>
      </section>

      <section id="student-tools" className="scroll-mt-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3 px-1">
          <div><div className="mb-1.5 flex items-center gap-2 text-xs font-bold tracking-wide text-indigo-600"><BookOpen size={14} />תוכנית הלימודים · כיתה י׳</div><h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">מתחילים ללמוד ולתרגל</h2></div>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500">המסע הראשון שלך</span>
        </div>
        <div className="mb-4 flex w-fit items-center gap-1 rounded-xl border border-slate-200 bg-white p-1" role="tablist" aria-label="בחירת כלי למידה">
          <button type="button" role="tab" aria-selected={activeTool === 'derivatives'} onClick={() => setActiveTool('derivatives')} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition sm:px-4 ${activeTool === 'derivatives' ? 'bg-lime-200 text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}><Waypoints size={15} />הנגזרת · שיעור ותרגול</button>
          <button type="button" role="tab" aria-selected={activeTool === 'graphing'} onClick={() => setActiveTool('graphing')} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition sm:px-4 ${activeTool === 'graphing' ? 'bg-indigo-100 text-indigo-800 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}><Calculator size={15} />מחשבון גרפי</button>
        </div>
        {activeTool === 'derivatives' ? <DerivativeLesson /> : <GraphingCalculator />}
      </section>

      <section className="mt-12">
        <div className="mb-5 px-1"><p className="mb-1.5 text-xs font-bold tracking-wide text-indigo-600">מתחילים בשלושה צעדים</p><h2 className="text-xl font-extrabold tracking-tight text-slate-900">מתרגול לתובנה</h2></div>
        <div className="grid gap-3 sm:grid-cols-3">
          {learningSteps.map((step) => (
            <article key={step.number} className="flex gap-4 rounded-2xl border border-slate-200/80 bg-white p-5">
              <span className="font-mono text-sm font-bold text-indigo-300" dir="ltr">{step.number}</span>
              <div><h3 className="text-sm font-bold text-slate-800">{step.title}</h3><p className="mt-1.5 text-xs leading-5 text-slate-500">{step.text}</p></div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
