import { useRef, useState } from 'react';
import { ArrowLeft, Award, Check, CheckCircle2, ChevronLeft, Flame, Lightbulb, LockKeyhole, RotateCcw, Sparkles, Star, Trophy, Zap } from 'lucide-react';
import { MathExpressionPreview, MathKeyboard, validateDerivativeAnswer, type DerivativeAnswerResult, type MathToken } from '../../math';
import ExerciseMap from './ExerciseMap';

type DerivativeExercise = {
  id: string;
  level: number;
  title: string;
  prompt: string;
  functionExpression: string;
  expectedDerivative: string;
  hint: string;
  rule: string;
};

type LessonPhase = 'intro' | 'practice' | 'complete';

const exercises: DerivativeExercise[] = [
  { id: 'constant', level: 1, title: 'מתחילים בקטן', prompt: 'מה הנגזרת של פונקציה קבועה?', functionExpression: 'f(x) = 7', expectedDerivative: '0', hint: 'פונקציה קבועה לא משתנה כש־x משתנה.', rule: 'הנגזרת של מספר קבוע היא 0.' },
  { id: 'linear', level: 1, title: 'הקו הישר', prompt: 'מצאו את הנגזרת של הפונקציה.', functionExpression: 'f(x) = x', expectedDerivative: '1', hint: 'השיפוע של הישר y = x הוא 1 בכל נקודה.', rule: 'הנגזרת של x היא 1.' },
  { id: 'square', level: 2, title: 'חוק החזקה', prompt: 'השתמשו בחוק החזקה.', functionExpression: 'f(x) = x^2', expectedDerivative: '2*x', hint: 'מורידים את החזקה כמקדם, ומקטינים את החזקה באחד.', rule: 'אם f(x) = xⁿ, אז f′(x) = n·xⁿ⁻¹.' },
  { id: 'coefficient', level: 2, title: 'מקדם מוביל', prompt: 'מה קורה כשהחזקה מוכפלת במספר?', functionExpression: 'f(x) = 3*x^2', expectedDerivative: '6*x', hint: 'השאירו את המקדם 3, והכפילו אותו בחזקה 2.', rule: 'קבוע נשאר כמקדם: (a·f)′ = a·f′.' },
  { id: 'sum', level: 3, title: 'מחברים כללים', prompt: 'גזרו כל איבר בנפרד וחברו.', functionExpression: 'f(x) = x^3 + 2*x', expectedDerivative: '3*x^2 + 2', hint: 'הנגזרת של סכום היא סכום הנגזרות.', rule: '(f + g)′ = f′ + g′.' },
  { id: 'polynomial', level: 4, title: 'אתגר הפולינום', prompt: 'גזרו את הפולינום כולו. שימו לב גם למספר הקבוע.', functionExpression: 'f(x) = 2*x^3 - 5*x^2 + 4*x - 7', expectedDerivative: '6*x^2 - 10*x + 4', hint: 'עברו איבר־איבר: חזקה, מקדם, וסימן. הנגזרת של ‎−7 היא 0.', rule: 'גוזרים כל איבר בנפרד; מספר חופשי נעלם.' },
  { id: 'mixed-polynomial', level: 4, title: 'פולינום מעורב', prompt: 'גזרו את כל האיברים ושמרו על הסימנים.', functionExpression: '4*x^3 + 3*x^2 - 2*x + 5', expectedDerivative: '12*x^2 + 6*x - 2', hint: 'גזרו כל חזקה בנפרד, וזכרו שהנגזרת של מספר קבוע היא 0.', rule: 'כלל החזקה פועל על כל איבר בנפרד.' },
];

function formatAnswerFeedback(result: DerivativeAnswerResult) {
  if (result.status === 'correct') return { title: 'בדיוק! נגזרת נכונה', text: 'זיהיתם נכון את קצב השינוי. התרגיל הבא כבר מחכה לכם.', tone: 'success' };
  if (result.status === 'invalid') return { title: 'נראה שיש טעות בכתיבה', text: 'בדקו סוגריים וסימני פעולה, ונסו שוב.', tone: 'warning' };
  return { title: 'עוד לא הפעם — נסו שוב', text: 'רמז קטן יכול לעזור. אפשר לתקן את התשובה ולנסות שוב.', tone: 'retry' };
}

export default function DerivativeLesson() {
  const [phase, setPhase] = useState<LessonPhase>('intro');
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<DerivativeAnswerResult | null>(null);
  const [hintVisible, setHintVisible] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answeredIds, setAnsweredIds] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectionRef = useRef({ start: 0, end: 0 });

  const exercise = exercises[exerciseIndex];
  const feedback = result ? formatAnswerFeedback(result) : null;
  const completedCount = answeredIds.length;
  const progressPercent = phase === 'complete' ? 100 : phase === 'practice' ? (completedCount / exercises.length) * 100 : 0;

  const rememberSelection = (input: HTMLInputElement) => {
    selectionRef.current = { start: input.selectionStart ?? input.value.length, end: input.selectionEnd ?? input.value.length };
  };

  const insertToken = (token: MathToken) => {
    const input = inputRef.current;
    let start = input?.selectionStart ?? selectionRef.current.start;
    const end = input?.selectionEnd ?? selectionRef.current.end;
    if (token.action === 'backspace') {
      if (start === end && start > 0) start -= 1;
      if (start === end) return;
    }
    const tokenValue = token.action === 'backspace' ? '' : token.value;
    const nextAnswer = `${answer.slice(0, start)}${tokenValue}${answer.slice(end)}`;
    const nextCursor = start + (token.cursorOffset ?? tokenValue.length);
    setAnswer(nextAnswer);
    setResult(null);
    selectionRef.current = { start: nextCursor, end: nextCursor };
    input?.focus();
    requestAnimationFrame(() => input?.setSelectionRange(nextCursor, nextCursor));
  };

  const checkAnswer = () => {
    if (!exercise) return;
    const checked = validateDerivativeAnswer(answer, exercise.expectedDerivative);
    setResult(checked);
    if (checked.status === 'correct' && !answeredIds.includes(exercise.id)) {
      setScore((current) => current + exercise.level * 10 + 10);
      setStreak((current) => current + 1);
      setAnsweredIds((current) => [...current, exercise.id]);
    } else if (checked.status === 'incorrect' || checked.status === 'invalid') {
      setStreak(0);
    }
  };

  const startPractice = () => {
    setPhase('practice');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const goToNextExercise = () => {
    if (exerciseIndex >= exercises.length - 1) {
      setPhase('complete');
      setResult(null);
      return;
    }
    setExerciseIndex((current) => current + 1);
    setAnswer('');
    setResult(null);
    setHintVisible(false);
    selectionRef.current = { start: 0, end: 0 };
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const selectExercise = (index: number) => {
    setExerciseIndex(index);
    setPhase('practice');
    setAnswer('');
    setResult(null);
    setHintVisible(false);
    selectionRef.current = { start: 0, end: 0 };
  };

  const restartLesson = () => {
    setPhase('intro');
    setExerciseIndex(0);
    setAnswer('');
    setResult(null);
    setHintVisible(false);
    setScore(0);
    setStreak(0);
    setAnsweredIds([]);
  };

  if (phase === 'intro') {
    return (
      <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm" dir="rtl">
        <ExerciseMap subchapterTitle="הנגזרת" exercises={exercises} completedIds={answeredIds} currentIndex={exerciseIndex} onSelect={selectExercise} />
        <div className="grid lg:grid-cols-[1fr_0.85fr]">
          <div className="p-6 sm:p-9">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-lime-100 px-3 py-1.5 text-xs font-bold text-lime-900"><Sparkles size={14} /> כיתה י׳ · מסע הנגזרות</div>
            <h2 className="text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">אז מה הנגזרת<br className="hidden sm:block" /> מספרת לנו?</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">הנגזרת מתארת את <strong className="text-slate-900">קצב השינוי הרגעי</strong> של פונקציה — כלומר, את השיפוע של קו המשיק לגרף בנקודה מסוימת.</p>
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 text-xs font-bold text-slate-500">אפשר לחשוב על זה כך:</div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-white p-3"><span className="mb-1.5 block text-[11px] font-bold text-slate-400">קצב ממוצע</span><p className="text-xs leading-5 text-slate-600">כמה השתנה y לאורך קטע שלם?</p></div>
                <div className="rounded-xl bg-lime-50 p-3"><span className="mb-1.5 block text-[11px] font-bold text-lime-800">הנגזרת</span><p className="text-xs leading-5 text-slate-700">מה השיפוע בדיוק בנקודה אחת?</p></div>
              </div>
              <div className="mt-3 flex items-center justify-center rounded-xl bg-white px-3 py-4 font-serif text-lg text-slate-800" dir="ltr">f′(x) = lim<sub className="mx-1 text-[10px]">h→0</sub> <span className="inline-flex flex-col items-center text-sm"><span className="border-b border-slate-400 px-1 pb-0.5">f(x + h) − f(x)</span><span className="pt-0.5">h</span></span></div>
            </div>
          </div>
          <div className="flex flex-col justify-center border-t border-slate-100 bg-[#f7f8f2] p-6 sm:p-9 lg:border-r lg:border-t-0">
            <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-lime-200 text-lime-950"><Lightbulb size={21} /></div>
            <h3 className="text-lg font-extrabold text-slate-900">שלושה כללים למסע</h3>
            <div className="mt-4 space-y-3">
              <article className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"><span className="text-xs font-medium text-slate-600">מספר קבוע נעלם</span><span className="font-serif text-lg text-slate-900" dir="ltr">(c)′ = 0</span></article>
              <article className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"><span className="text-xs font-medium text-slate-600">מורידים חזקה כמקדם</span><span className="font-serif text-lg text-slate-900" dir="ltr">(xⁿ)′ = n·xⁿ⁻¹</span></article>
              <article className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"><span className="text-xs font-medium text-slate-600">גוזרים כל איבר בנפרד</span><span className="font-serif text-lg text-slate-900" dir="ltr">(f + g)′ = f′ + g′</span></article>
            </div>
            <div className="mt-5 flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs text-slate-500"><Zap size={15} className="shrink-0 text-amber-500" /> שישה שלבים קצרים, נקודות ורצף הצלחות. בלי שעון — בקצב שלכם.</div>
            <button type="button" onClick={startPractice} className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-lime-300 px-5 py-3 text-sm font-extrabold text-slate-900 transition hover:bg-lime-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-600">מתחילים במשימה הראשונה <ArrowLeft size={17} /></button>
          </div>
        </div>
      </section>
    );
  }

  if (phase === 'complete') {
    return (
      <section className="mx-auto max-w-3xl overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm" dir="rtl">
        <ExerciseMap subchapterTitle="הנגזרת" exercises={exercises} completedIds={answeredIds} currentIndex={exerciseIndex} onSelect={selectExercise} />
        <div className="bg-[#202447] px-6 py-10 text-center text-white sm:px-12">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-lime-300 text-slate-900"><Trophy size={30} /></div>
          <p className="mt-5 text-xs font-bold tracking-widest text-lime-200">המסע הושלם</p>
          <h2 className="mt-2 text-3xl font-extrabold">אלופי הנגזרות!</h2>
          <p className="mt-2 text-sm text-slate-300">פתרתם את כל השלבים והפכתם את חוקי הנגזרת לכלי עבודה.</p>
        </div>
        <div className="grid gap-3 p-6 sm:grid-cols-3 sm:p-8">
          <div className="rounded-2xl bg-lime-50 p-4 text-center"><Star className="mx-auto text-lime-700" size={20} /><p className="mt-2 text-2xl font-extrabold text-slate-900">{score}</p><p className="text-xs text-slate-500">נקודות שצברתם</p></div>
          <div className="rounded-2xl bg-orange-50 p-4 text-center"><Flame className="mx-auto text-orange-600" size={20} /><p className="mt-2 text-2xl font-extrabold text-slate-900">{streak}</p><p className="text-xs text-slate-500">רצף ההצלחות האחרון</p></div>
          <div className="rounded-2xl bg-indigo-50 p-4 text-center"><Award className="mx-auto text-indigo-600" size={20} /><p className="mt-2 text-2xl font-extrabold text-slate-900">{exercises.length}/{exercises.length}</p><p className="text-xs text-slate-500">משימות הושלמו</p></div>
        </div>
        <div className="px-6 pb-7 text-center"><button type="button" onClick={restartLesson} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"><RotateCcw size={15} /> משחקים שוב</button></div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm" dir="rtl">
      <ExerciseMap subchapterTitle="הנגזרת" exercises={exercises} completedIds={answeredIds} currentIndex={exerciseIndex} onSelect={selectExercise} />
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-[#fbfcfa] px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-lime-100 px-3 py-1.5 text-xs font-bold text-lime-900"><Sparkles size={13} /> שלב {exerciseIndex + 1} מתוך {exercises.length}</span><span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500">רמה {exercise.level}</span></div>
        <div className="flex items-center gap-3 text-xs font-bold text-slate-600"><span className="inline-flex items-center gap-1.5"><Star size={15} className="text-amber-500" />{score} נק׳</span><span className="inline-flex items-center gap-1.5"><Flame size={15} className={streak > 0 ? 'text-orange-500' : 'text-slate-300'} />{streak}</span></div>
      </div>
      <div className="h-1.5 bg-slate-100"><div className="h-full rounded-l-full bg-lime-400 transition-all duration-500" style={{ width: `${progressPercent}%` }} /></div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="p-5 sm:p-8">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-500"><span className="flex size-7 items-center justify-center rounded-lg bg-indigo-50 font-mono text-indigo-700" dir="ltr">{String(exerciseIndex + 1).padStart(2, '0')}</span>{exercise.title}</div>
          <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">{exercise.prompt}</h2>
          <div className="mt-5 flex min-h-24 items-center justify-center rounded-2xl border border-slate-200 bg-[#fbfcfa] px-4 py-5 text-3xl text-slate-900 sm:text-4xl" dir="ltr">
            <span className="mr-2 font-serif italic">f(x) =</span><MathExpressionPreview source={exercise.functionExpression.replace(/^f\(x\)\s*=\s*/, '')} />
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-700">כתבו את הנגזרת בשורה שמתחת:</p>
          <div className={`mt-2 flex items-center gap-3 rounded-xl border px-4 py-3 transition focus-within:ring-4 ${result?.status === 'correct' ? 'border-emerald-300 bg-emerald-50 focus-within:ring-emerald-100' : result && result.status !== 'empty' ? 'border-amber-300 bg-amber-50 focus-within:ring-amber-100' : 'border-slate-300 bg-white focus-within:border-indigo-300 focus-within:ring-indigo-100'}`}>
            <span className="shrink-0 font-serif text-lg font-semibold text-slate-700" dir="ltr">f′(x) =</span>
            <input
              ref={inputRef}
              value={answer}
              onChange={(event) => { setAnswer(event.target.value); setResult(null); rememberSelection(event.target); }}
              onFocus={(event) => rememberSelection(event.currentTarget)}
              onSelect={(event) => rememberSelection(event.currentTarget)}
              onKeyDown={(event) => { if (event.key === 'Enter') checkAnswer(); }}
              dir="ltr"
              spellCheck={false}
              autoComplete="off"
              aria-label="תשובת הנגזרת"
              aria-invalid={Boolean(result && result.status !== 'correct' && result.status !== 'empty')}
              placeholder="הקלידו את הנגזרת…"
              className="min-w-0 flex-1 bg-transparent font-mono text-lg font-medium text-slate-900 outline-none placeholder:text-sm placeholder:text-slate-400"
            />
            {result?.status === 'correct' && <Check size={19} className="text-emerald-700" aria-label="תשובה נכונה" />}
          </div>
          <div className="mt-3"><MathKeyboard initialSection="algebra" onInsert={insertToken} /></div>

          {feedback && <div role="status" aria-live="polite" className={`mt-4 flex items-start gap-3 rounded-xl p-3.5 ${feedback.tone === 'success' ? 'bg-emerald-50 text-emerald-900' : feedback.tone === 'warning' ? 'bg-amber-50 text-amber-900' : 'bg-orange-50 text-orange-900'}`}>
            {feedback.tone === 'success' ? <CheckCircle2 size={19} className="mt-0.5 shrink-0" /> : <Lightbulb size={19} className="mt-0.5 shrink-0" />}
            <div><p className="text-sm font-bold">{feedback.title}</p><p className="mt-0.5 text-xs leading-5 opacity-80">{feedback.text}</p></div>
          </div>}
          {hintVisible && <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs leading-6 text-amber-950"><span className="font-bold">רמז:</span> {exercise.hint}</div>}
          {result?.status === 'correct' && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-emerald-50 px-4 py-3"><div className="flex items-center gap-2 text-xs font-semibold text-emerald-900"><CheckCircle2 size={17} />{exercise.rule}</div><button type="button" onClick={goToNextExercise} className="inline-flex items-center gap-2 rounded-lg bg-lime-300 px-4 py-2 text-xs font-extrabold text-slate-900 transition hover:bg-lime-400">{exerciseIndex === exercises.length - 1 ? 'לסיום המסע' : 'למשימה הבאה'} <ArrowLeft size={14} /></button></div>}

          <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={() => setHintVisible((visible) => !visible)} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold text-slate-500 transition hover:bg-amber-50 hover:text-amber-800"><Lightbulb size={15} />{hintVisible ? 'הסתרת רמז' : 'אפשר לקבל רמז'}</button>
            {result?.status !== 'correct' && <button type="button" onClick={checkAnswer} disabled={!answer.trim()} className="inline-flex items-center gap-2 rounded-lg bg-lime-300 px-5 py-2.5 text-sm font-extrabold text-slate-900 transition hover:bg-lime-400 disabled:cursor-not-allowed disabled:opacity-45">בדיקת תשובה <Check size={16} /></button>}
          </div>
        </div>

        <aside className="border-t border-slate-100 bg-[#f8f9f5] p-5 sm:p-6 lg:border-r lg:border-t-0" aria-label="התקדמות במסע">
          <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-slate-500">התקדמות</p><p className="mt-1 text-2xl font-extrabold text-slate-900">{completedCount}<span className="text-sm font-semibold text-slate-400"> / {exercises.length}</span></p></div><div className="flex size-10 items-center justify-center rounded-xl bg-lime-100 text-lime-800"><Trophy size={19} /></div></div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-lime-400 transition-all duration-500" style={{ width: `${progressPercent}%` }} /></div>
          <div className="mt-5 space-y-2">
            {exercises.map((item, index) => {
              const isComplete = answeredIds.includes(item.id);
              const isCurrent = exerciseIndex === index;
              const isUnlocked = index <= exerciseIndex;
              return <div key={item.id} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${isCurrent ? 'bg-white shadow-sm ring-1 ring-slate-200' : ''} ${!isUnlocked ? 'opacity-50' : ''}`}>
                <span className={`flex size-7 shrink-0 items-center justify-center rounded-full ${isComplete ? 'bg-lime-300 text-slate-900' : isCurrent ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'}`}>{isComplete ? <Check size={14} /> : !isUnlocked ? <LockKeyhole size={12} /> : <span className="font-mono text-[10px]">{index + 1}</span>}</span>
                <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-slate-700">{item.title}</p><p className="mt-0.5 text-[10px] text-slate-400">רמה {item.level}</p></div>
                {isCurrent && <ChevronLeft size={15} className="text-indigo-500" />}
              </div>;
            })}
          </div>
          <div className="mt-5 rounded-xl border border-slate-200 bg-white p-3.5"><p className="flex items-center gap-2 text-xs font-bold text-slate-700"><Zap size={14} className="text-amber-500" /> איך צוברים נקודות?</p><p className="mt-1.5 text-[11px] leading-5 text-slate-500">כל תשובה נכונה פותחת את השלב הבא ומוסיפה נקודות. אפשר לנסות שוב כמה שרוצים.</p></div>
        </aside>
      </div>
    </section>
  );
}
