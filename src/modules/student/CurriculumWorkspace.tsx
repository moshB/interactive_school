import { useState } from 'react';
import { BookOpen, Calculator, CheckCircle2, ChevronLeft, Clock3, Layers3, Sparkles } from 'lucide-react';
import { GraphingCalculator } from '../math';
import { DerivativeAtPointLesson, DerivativeLesson, TangentEquationLesson, TangentSlopeLesson } from './derivatives';
import { gradeTenCurriculum, type CurriculumChapter, type CurriculumSubject, type CurriculumSubchapter } from './curriculum';

type WorkspacePanel = 'lesson' | 'calculator';

function firstSubchapter(chapter: CurriculumChapter | undefined) {
  return chapter?.subchapters[0];
}

function statusText(status: 'available' | 'planned') {
  return status === 'available' ? 'זמין ללמידה' : 'בקרוב';
}

export default function CurriculumWorkspace() {
  const [selectedSubjectId, setSelectedSubjectId] = useState('differential-calculus');
  const [selectedChapterId, setSelectedChapterId] = useState('polynomials');
  const [selectedSubchapterId, setSelectedSubchapterId] = useState('derivative-rules');
  const [activePanel, setActivePanel] = useState<WorkspacePanel>('lesson');
  const [isOutlineOpen, setIsOutlineOpen] = useState(true);

  const selectedSubject: CurriculumSubject = gradeTenCurriculum.subjects.find((subject) => subject.id === selectedSubjectId) ?? gradeTenCurriculum.subjects[0];
  const selectedChapter: CurriculumChapter = selectedSubject.chapters.find((chapter) => chapter.id === selectedChapterId) ?? selectedSubject.chapters[0];
  const selectedSubchapter: CurriculumSubchapter | undefined = selectedChapter.subchapters.find((subchapter) => subchapter.id === selectedSubchapterId) ?? firstSubchapter(selectedChapter);
  const availableLesson = selectedSubchapter?.status === 'available';

  const selectSubject = (subject: CurriculumSubject) => {
    const chapter = subject.chapters[0];
    setSelectedSubjectId(subject.id);
    setSelectedChapterId(chapter?.id ?? '');
    setSelectedSubchapterId(firstSubchapter(chapter)?.id ?? '');
    setActivePanel('lesson');
  };

  const selectChapter = (chapter: CurriculumChapter) => {
    setSelectedChapterId(chapter.id);
    setSelectedSubchapterId(firstSubchapter(chapter)?.id ?? '');
    setActivePanel('lesson');
  };

  const selectSubchapter = (subchapter: CurriculumSubchapter) => {
    setSelectedSubchapterId(subchapter.id);
    setActivePanel('lesson');
  };

  return (
    <section id="student-tools" className="scroll-mt-6" dir="rtl">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <div className="mb-1.5 flex items-center gap-2 text-xs font-bold tracking-wide text-indigo-600"><BookOpen size={14} />תוכנית הלימודים · {gradeTenCurriculum.grade}</div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">הקורס שלך במתמטיקה</h2>
          <p className="mt-1 text-sm text-slate-500">בוחרים נושא, פרק ותת־פרק — ולומדים בקצב שלכם.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-1.5 text-xs font-bold text-indigo-800"><Sparkles size={14} className="text-amber-500" />{gradeTenCurriculum.track}</span>
      </div>

      <div className={`grid items-start gap-5 ${isOutlineOpen ? 'lg:grid-cols-[310px_minmax(0,1fr)]' : 'grid-cols-1'}`}>
        <aside id="course-outline" className={`${isOutlineOpen ? 'block' : 'hidden'} order-2 w-full rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm lg:order-1 lg:sticky lg:top-5`} aria-label="תוכן עניינים של הקורס">
          <div className="mb-3 flex items-center justify-between px-1">
            <h3 className="text-sm font-extrabold text-slate-900">תוכן הקורס</h3>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">{gradeTenCurriculum.grade}</span>
          </div>
          <div className="space-y-1.5" role="group" aria-label="נושאי לימוד">
            {gradeTenCurriculum.subjects.map((subject) => {
              const isSelected = selectedSubject.id === subject.id;
              return <button key={subject.id} type="button" onClick={() => selectSubject(subject)} aria-current={isSelected ? 'true' : undefined} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-right transition ${isSelected ? 'bg-indigo-50 text-indigo-950 ring-1 ring-indigo-100' : 'text-slate-600 hover:bg-slate-50'}`}>
                <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${isSelected ? 'bg-white text-indigo-700' : 'bg-slate-100 text-slate-500'}`}><Layers3 size={16} /></span>
                <span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold">{subject.shortTitle}</span><span className={`mt-0.5 block text-[10px] ${subject.status === 'available' ? 'text-emerald-700' : 'text-slate-400'}`}>{subject.status === 'available' ? 'פרק אחד זמין' : 'בתכנון'}</span></span>
                <ChevronLeft size={15} className={isSelected ? 'text-indigo-500' : 'text-slate-300'} />
              </button>;
            })}
          </div>

          <div className="my-4 border-t border-slate-100" />
          <div className="mb-2 flex items-center gap-2 px-1 text-[11px] font-bold text-slate-400"><span className="size-1.5 rounded-full bg-indigo-400" />פרקים · {selectedSubject.title}</div>
          <div className="space-y-2">
            {selectedSubject.chapters.map((chapter, chapterIndex) => {
              const isSelected = selectedChapter.id === chapter.id;
              return <div key={chapter.id} className="overflow-hidden rounded-xl border border-slate-100">
                <button type="button" onClick={() => selectChapter(chapter)} aria-expanded={isSelected} className={`flex w-full items-center gap-2 px-3 py-2.5 text-right transition ${isSelected ? 'bg-slate-50 text-slate-900' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                  <span className="font-mono text-[10px] font-bold text-indigo-400" dir="ltr">{String(chapterIndex + 1).padStart(2, '0')}</span>
                  <span className="flex-1 text-xs font-bold">{chapter.title}</span>
                  {chapter.status === 'available' ? <CheckCircle2 size={14} className="text-emerald-600" /> : <Clock3 size={13} className="text-slate-400" />}
                </button>
                {isSelected && <div className="space-y-1 border-t border-slate-100 p-2">
                  {chapter.subchapters.map((subchapter, subchapterIndex) => {
                    const isSubchapterSelected = selectedSubchapter?.id === subchapter.id;
                    return <button key={subchapter.id} type="button" onClick={() => selectSubchapter(subchapter)} aria-current={isSubchapterSelected ? 'true' : undefined} className={`flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-right transition ${isSubchapterSelected ? 'bg-lime-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}>
                      <span className="mt-0.5 font-mono text-[9px] text-slate-400" dir="ltr">{chapterIndex + 1}.{subchapterIndex + 1}</span>
                      <span className="min-w-0 flex-1"><span className="block text-[11px] font-bold leading-4">{subchapter.title}</span><span className={`mt-0.5 block text-[9px] ${subchapter.status === 'available' ? 'text-emerald-700' : 'text-slate-400'}`}>{statusText(subchapter.status)}</span></span>
                    </button>;
                  })}
                </div>}
              </div>;
            })}
          </div>
          <p className="mt-4 rounded-xl bg-[#f7f8f2] px-3 py-2.5 text-[10px] leading-5 text-slate-500">מפת הקורס נבנית בהדרגה. נושאים שעדיין בפיתוח מסומנים כ״בקרוב״.</p>
        </aside>

        <div className="order-1 min-w-0 lg:order-2">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold text-slate-400"><span>{gradeTenCurriculum.grade} · {gradeTenCurriculum.track}</span><ChevronLeft size={12} /><span>{selectedSubject.title}</span><ChevronLeft size={12} /><span>{selectedChapter.title}</span></div>
              <h3 className="mt-1 truncate text-sm font-extrabold text-slate-900 sm:text-base">{selectedSubchapter?.title ?? 'בחרו תת־פרק'}</h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setIsOutlineOpen((open) => !open)} aria-expanded={isOutlineOpen} aria-controls="course-outline" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-800">
                <BookOpen size={14} />{isOutlineOpen ? 'הסתרת תוכן הקורס' : 'הצגת תוכן הקורס'}
              </button>
              {availableLesson && <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1" role="tablist" aria-label="כלי לימוד לפרק">
              <button type="button" role="tab" aria-selected={activePanel === 'lesson'} onClick={() => setActivePanel('lesson')} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-bold transition ${activePanel === 'lesson' ? 'bg-white text-indigo-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}><BookOpen size={14} />שיעור ותרגול</button>
              <button type="button" role="tab" aria-selected={activePanel === 'calculator'} onClick={() => setActivePanel('calculator')} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-bold transition ${activePanel === 'calculator' ? 'bg-white text-indigo-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}><Calculator size={14} />מחשבון גרפי</button>
              </div>}
            </div>
          </div>

          {selectedSubchapter?.status === 'planned' ? <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500"><Clock3 size={22} /></span>
            <p className="mt-4 text-xs font-bold text-indigo-600">{selectedSubject.title} · {selectedChapter.title}</p>
            <h4 className="mt-1 text-xl font-extrabold text-slate-900">{selectedSubchapter.title}</h4>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{selectedSubchapter.description}</p>
            <span className="mt-5 inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">התוכן הזה בתכנון ויתווסף בהמשך</span>
          </div> : activePanel === 'calculator' ? <GraphingCalculator /> : selectedSubchapter?.id === 'derivative-at-point' ? <DerivativeAtPointLesson /> : selectedSubchapter?.id === 'tangent-slope' ? <TangentSlopeLesson /> : selectedSubchapter?.id === 'tangent-equation' ? <TangentEquationLesson /> : <DerivativeLesson />}
        </div>
      </div>
    </section>
  );
}
