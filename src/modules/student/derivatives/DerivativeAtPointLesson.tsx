import { useRef, useState } from 'react';
import { ArrowLeft, Check, CheckCircle2, Lightbulb, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import { MathExpressionPreview, MathKeyboard, validateDerivativeAnswer, validateFunctionValue, type DerivativeAnswerResult, type FunctionValueValidationResult, type MathToken } from '../../math';
import ExerciseMap from './ExerciseMap';

type PointExercise = {
  id: string;
  title: string;
  functionExpression: string;
  expectedDerivative: string;
  points: number[];
  hint: string;
};

type LessonPhase = 'intro' | 'practice' | 'complete';

const exercises: PointExercise[] = [
  { id: 'quadratic-slope', title: 'רואים את השיפוע משתנה', functionExpression: 'x^2 + 2*x', expectedDerivative: '2*x + 2', points: [-1, 0, 2], hint: 'גזרו את x² ואת 2x בנפרד, ואז הציבו כל ערך של x בנגזרת.' },
  { id: 'quadratic-coefficients', title: 'מציבים בכמה נקודות', functionExpression: '2*x^2 - 3*x + 1', expectedDerivative: '4*x - 3', points: [0, 1, 2], hint: 'לאחר הגזירה, הציבו כל פעם ערך x אחר בביטוי 4x − 3.' },
  { id: 'cubic-slope', title: 'אתגר קצר לסיום', functionExpression: 'x^3 - x^2 + 2*x', expectedDerivative: '3*x^2 - 2*x + 2', points: [-1, 0, 1], hint: 'גזרו איבר־איבר. שימו לב ש־x² הופך ל־2x.' },
];

function statusMessage(result: FunctionValueValidationResult | undefined) {
  if (!result || result.status === 'empty') return '';
  if (result.status === 'correct') return 'נכון';
  if (result.status === 'invalid') return 'כתבו מספר תקין';
  return 'בדקו את ההצבה';
}

export default function DerivativeAtPointLesson() {
  const [phase, setPhase] = useState<LessonPhase>('intro');
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [derivativeAnswer, setDerivativeAnswer] = useState('');
  const [derivativeResult, setDerivativeResult] = useState<DerivativeAnswerResult | null>(null);
  const [derivativeCorrect, setDerivativeCorrect] = useState(false);
  const [pointAnswers, setPointAnswers] = useState<Record<string, string>>({});
  const [pointResults, setPointResults] = useState<Record<string, FunctionValueValidationResult>>({});
  const [hintVisible, setHintVisible] = useState(false);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const derivativeInputRef = useRef<HTMLInputElement>(null);
  const selectionRef = useRef({ start: 0, end: 0 });

  const exercise = exercises[exerciseIndex];
  const completedCount = completedIds.length;
  const isExerciseComplete = completedIds.includes(exercise.id);
  const pointsComplete = exercise.points.every((point) => pointResults[String(point)]?.status === 'correct');
  const hasInvalidPoint = exercise.points.some((point) => pointResults[String(point)]?.status === 'invalid');
  const hasIncorrectPoint = exercise.points.some((point) => pointResults[String(point)]?.status === 'incorrect');
  const allPointAnswersFilled = exercise.points.every((point) => Boolean(pointAnswers[String(point)]?.trim()));

  const rememberSelection = (input: HTMLInputElement) => {
    selectionRef.current = { start: input.selectionStart ?? input.value.length, end: input.selectionEnd ?? input.value.length };
  };

  const insertToken = (token: MathToken) => {
    const input = derivativeInputRef.current;
    let start = input?.selectionStart ?? selectionRef.current.start;
    const end = input?.selectionEnd ?? selectionRef.current.end;
    if (token.action === 'backspace') {
      if (start === end && start > 0) start -= 1;
      if (start === end) return;
    }
    const tokenValue = token.action === 'backspace' ? '' : token.value;
    const nextAnswer = `${derivativeAnswer.slice(0, start)}${tokenValue}${derivativeAnswer.slice(end)}`;
    const nextCursor = start + (token.cursorOffset ?? tokenValue.length);
    setDerivativeAnswer(nextAnswer);
    setDerivativeResult(null);
    selectionRef.current = { start: nextCursor, end: nextCursor };
    input?.focus();
    requestAnimationFrame(() => input?.setSelectionRange(nextCursor, nextCursor));
  };

  const checkDerivative = () => {
    const result = validateDerivativeAnswer(derivativeAnswer, exercise.expectedDerivative);
    setDerivativeResult(result);
    if (result.status === 'correct') setDerivativeCorrect(true);
  };

  const checkPointValues = () => {
    const nextResults: Record<string, FunctionValueValidationResult> = {};
    for (const point of exercise.points) {
      const pointKey = String(point);
      nextResults[pointKey] = validateFunctionValue(exercise.expectedDerivative, point, pointAnswers[pointKey] ?? '');
    }
    setPointResults(nextResults);
    if (exercise.points.every((point) => nextResults[String(point)].status === 'correct') && !completedIds.includes(exercise.id)) {
      setCompletedIds((current) => [...current, exercise.id]);
      setScore((current) => current + 30);
      setStreak((current) => current + 1);
    }
  };

  const goToNextExercise = () => {
    if (exerciseIndex >= exercises.length - 1) {
      setPhase('complete');
      return;
    }
    setExerciseIndex((current) => current + 1);
    setDerivativeAnswer('');
    setDerivativeResult(null);
    setDerivativeCorrect(false);
    setPointAnswers({});
    setPointResults({});
    setHintVisible(false);
  };

  const selectExercise = (index: number) => {
    setExerciseIndex(index);
    setPhase('practice');
    setDerivativeAnswer('');
    setDerivativeResult(null);
    setDerivativeCorrect(false);
    setPointAnswers({});
    setPointResults({});
    setHintVisible(false);
  };

  const restartLesson = () => {
    setPhase('intro');
    setExerciseIndex(0);
    setDerivativeAnswer('');
    setDerivativeResult(null);
    setDerivativeCorrect(false);
    setPointAnswers({});
    setPointResults({});
    setHintVisible(false);
    setCompletedIds([]);
    setScore(0);
    setStreak(0);
  };

  if (phase === 'intro') {
    return (
      <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm" dir="rtl">
        <ExerciseMap subchapterTitle="חישוב ערך נגזרת בנקודה על הגרף" exercises={exercises} completedIds={completedIds} currentIndex={exerciseIndex} onSelect={selectExercise} />
        <div className="grid lg:grid-cols-[1fr_0.85fr]">
          <div className="p-6 sm:p-9">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1.5 text-xs font-bold text-indigo-900"><Sparkles size={14} /> תת־פרק · חישוב ערך נגזרת</div>
            <h2 className="text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">גוזרים — ואז מציבים</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">הנגזרת היא פונקציה שמתארת את שיפוע המשיק בכל נקודה. כדי למצוא את השיפוע בנקודה מסוימת על הגרף, גוזרים את <span dir="ltr">f(x)</span> ואז מציבים בנגזרת את ערך ה־<span dir="ltr">x</span> של הנקודה.</p>
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 text-xs font-bold text-slate-500">דוגמה קצרה</div>
              <div className="grid gap-2 text-center sm:grid-cols-3">
                <div className="rounded-xl bg-white p-3"><span className="block text-[11px] font-bold text-slate-400">הפונקציה</span><span className="mt-1 block font-serif text-lg text-slate-900" dir="ltr">f(x) = x² + 2x</span></div>
                <div className="rounded-xl bg-white p-3"><span className="block text-[11px] font-bold text-slate-400">גוזרים</span><span className="mt-1 block font-serif text-lg text-slate-900" dir="ltr">f′(x) = 2x + 2</span></div>
                <div className="rounded-xl bg-indigo-50 p-3"><span className="block text-[11px] font-bold text-indigo-700">בנקודה (1, 3)</span><span className="mt-1 block font-serif text-lg font-bold text-indigo-950" dir="ltr">f′(1) = 4</span></div>
              </div>
              <p className="mt-3 text-center text-xs leading-5 text-slate-600">בנקודה שבה <span dir="ltr">x = 1</span>, שיפוע המשיק לגרף הוא 4.</p>
            </div>
          </div>
          <div className="flex flex-col justify-center border-t border-slate-100 bg-[#f7f8f2] p-6 sm:p-9 lg:border-r lg:border-t-0">
            <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-800"><Lightbulb size={21} /></div>
            <h3 className="text-lg font-extrabold text-slate-900">בכל תרגיל נעשה שני צעדים</h3>
            <ol className="mt-4 space-y-3">
              <li className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"><span className="flex size-7 items-center justify-center rounded-full bg-lime-100 text-xs font-extrabold text-lime-900">1</span><span className="text-xs font-medium text-slate-700">נגזור את הפונקציה הפולינומית.</span></li>
              <li className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"><span className="flex size-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-extrabold text-indigo-900">2</span><span className="text-xs font-medium text-slate-700">נציב כמה ערכי x ונחשב את שיפוע המשיק.</span></li>
            </ol>
            <p className="mt-4 text-xs leading-5 text-slate-500">תרגול קצר, בלי שעון — אפשר לתקן תשובות ולנסות שוב.</p>
            <button type="button" onClick={() => setPhase('practice')} className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-lime-300 px-5 py-3 text-sm font-extrabold text-slate-900 transition hover:bg-lime-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-600">מתחילים לתרגל <ArrowLeft size={17} /></button>
          </div>
        </div>
      </section>
    );
  }

  if (phase === 'complete') {
    return (
      <section className="mx-auto max-w-3xl overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm" dir="rtl">
        <ExerciseMap subchapterTitle="חישוב ערך נגזרת בנקודה על הגרף" exercises={exercises} completedIds={completedIds} currentIndex={exerciseIndex} onSelect={selectExercise} />
        <div className="bg-[#202447] px-6 py-10 text-center text-white sm:px-12">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-lime-300 text-slate-900"><Trophy size={30} /></div>
          <p className="mt-5 text-xs font-bold tracking-widest text-lime-200">תת־הפרק הושלם</p>
          <h2 className="mt-2 text-3xl font-extrabold">מצאתם את השיפוע בנקודה!</h2>
          <p className="mt-2 text-sm text-slate-300">גזרתם פולינומים והצבתם ערכי x כדי לחשב את שיפוע המשיק.</p>
        </div>
        <div className="grid gap-3 p-6 sm:grid-cols-3 sm:p-8">
          <div className="rounded-2xl bg-lime-50 p-4 text-center"><Trophy className="mx-auto text-lime-700" size={20} /><p className="mt-2 text-2xl font-extrabold text-slate-900">{score}</p><p className="text-xs text-slate-500">נקודות שצברתם</p></div>
          <div className="rounded-2xl bg-indigo-50 p-4 text-center"><CheckCircle2 className="mx-auto text-indigo-600" size={20} /><p className="mt-2 text-2xl font-extrabold text-slate-900">{completedCount}/{exercises.length}</p><p className="text-xs text-slate-500">תרגילים הושלמו</p></div>
          <div className="rounded-2xl bg-orange-50 p-4 text-center"><Sparkles className="mx-auto text-orange-600" size={20} /><p className="mt-2 text-2xl font-extrabold text-slate-900">{streak}</p><p className="text-xs text-slate-500">רצף ההצלחות</p></div>
        </div>
        <div className="px-6 pb-7 text-center"><button type="button" onClick={restartLesson} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"><RotateCcw size={15} /> מתרגלים שוב</button></div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm" dir="rtl">
      <ExerciseMap subchapterTitle="חישוב ערך נגזרת בנקודה על הגרף" exercises={exercises} completedIds={completedIds} currentIndex={exerciseIndex} onSelect={selectExercise} />
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-[#fbfcfa] px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1.5 text-xs font-bold text-indigo-900"><Sparkles size={13} /> תרגיל {exerciseIndex + 1} מתוך {exercises.length}</span><span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500">פולינומים</span></div>
        <div className="text-xs font-bold text-slate-600">{score} נק׳ · רצף {streak}</div>
      </div>
      <div className="h-1.5 bg-slate-100"><div className="h-full rounded-l-full bg-indigo-400 transition-all duration-500" style={{ width: `${(completedCount / exercises.length) * 100}%` }} /></div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="p-5 sm:p-8">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-500"><span className="flex size-7 items-center justify-center rounded-lg bg-indigo-50 font-mono text-indigo-700" dir="ltr">{String(exerciseIndex + 1).padStart(2, '0')}</span>{exercise.title}</div>
          <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">גזרו את הפונקציה</h2>
          <div className="mt-4 flex min-h-20 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-[#fbfcfa] px-4 py-5 text-3xl text-slate-900" dir="ltr"><span className="font-serif italic">f(x) =</span><MathExpressionPreview source={exercise.functionExpression} /></div>
          <label htmlFor="derivative-answer" className="mt-5 block text-sm font-semibold text-slate-700">הנגזרת היא:</label>
          <div className={`mt-2 flex items-center gap-3 rounded-xl border px-4 py-3 ${derivativeCorrect ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300 bg-white focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-100'}`}>
            <span className="shrink-0 font-serif text-lg font-semibold text-slate-700" dir="ltr">f′(x) =</span>
            <input id="derivative-answer" ref={derivativeInputRef} value={derivativeAnswer} onChange={(event) => { setDerivativeAnswer(event.target.value); setDerivativeResult(null); rememberSelection(event.target); }} onFocus={(event) => rememberSelection(event.currentTarget)} onSelect={(event) => rememberSelection(event.currentTarget)} onKeyDown={(event) => { if (event.key === 'Enter' && !derivativeCorrect) checkDerivative(); }} dir="ltr" spellCheck={false} autoComplete="off" aria-invalid={Boolean(derivativeResult && derivativeResult.status !== 'correct' && derivativeResult.status !== 'empty')} placeholder="כתבו את הנגזרת…" disabled={derivativeCorrect} className="min-w-0 flex-1 bg-transparent font-mono text-lg font-medium text-slate-900 outline-none placeholder:text-sm placeholder:text-slate-400 disabled:opacity-70" />
            {derivativeCorrect && <Check size={19} className="text-emerald-700" aria-label="נגזרת נכונה" />}
          </div>
          {!derivativeCorrect && <div className="mt-3"><MathKeyboard initialSection="algebra" onInsert={insertToken} /></div>}
          {!derivativeCorrect && <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            {derivativeResult && derivativeResult.status !== 'correct' && <p role="status" className="text-xs font-semibold text-amber-800">{derivativeResult.status === 'empty' ? 'כתבו נגזרת כדי להמשיך.' : derivativeResult.status === 'invalid' ? 'בדקו את צורת הכתיבה ונסו שוב.' : 'כמעט — בדקו את כללי הגזירה ונסו שוב.'}</p>}
            <button type="button" onClick={checkDerivative} disabled={!derivativeAnswer.trim()} className="mr-auto inline-flex items-center gap-2 rounded-lg bg-lime-300 px-4 py-2.5 text-sm font-extrabold text-slate-900 transition hover:bg-lime-400 disabled:cursor-not-allowed disabled:opacity-45">בדיקת הנגזרת <Check size={16} /></button>
          </div>}

          {derivativeCorrect && <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div><p className="text-sm font-extrabold text-emerald-950">מעולה — עכשיו מציבים בנגזרת</p><p className="mt-1 text-xs text-emerald-900">חשבו את ערך הנגזרת בכל אחת מהנקודות:</p></div>
              <span className="rounded-lg bg-white px-3 py-1.5 font-serif text-base font-bold text-emerald-950" dir="ltr">f′(x) = {exercise.expectedDerivative}</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {exercise.points.map((point) => {
                const key = String(point);
                const pointResult = pointResults[key];
                const isCorrect = pointResult?.status === 'correct';
                return <div key={key} className="rounded-xl border border-emerald-100 bg-white p-3">
                  <label htmlFor={`point-${key}`} className="mb-2 block text-center text-xs font-bold text-slate-700" dir="ltr">f′({point}) = ?</label>
                  <input id={`point-${key}`} type="text" inputMode="decimal" value={pointAnswers[key] ?? ''} onChange={(event) => { setPointAnswers((current) => ({ ...current, [key]: event.target.value })); setPointResults((current) => { const next = { ...current }; delete next[key]; return next; }); }} dir="ltr" aria-label={`ערך הנגזרת כאשר x שווה ${point}`} aria-invalid={Boolean(pointResult && pointResult.status !== 'correct' && pointResult.status !== 'empty')} className={`w-full rounded-lg border px-3 py-2 text-center font-mono text-lg font-bold text-slate-900 outline-none focus:ring-4 ${isCorrect ? 'border-emerald-300 bg-emerald-50 focus:ring-emerald-100' : 'border-slate-200 focus:border-indigo-300 focus:ring-indigo-100'}`} placeholder="ערך מספרי" />
                  {pointResult && pointResult.status !== 'empty' && <p className={`mt-1 text-center text-[11px] font-semibold ${isCorrect ? 'text-emerald-700' : 'text-amber-700'}`} role="status">{statusMessage(pointResult)}</p>}
                </div>;
              })}
            </div>
            {!isExerciseComplete && <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div aria-live="polite" className="text-xs font-semibold text-amber-900">{hasInvalidPoint ? 'חלק מהתשובות אינן מספרים תקינים.' : hasIncorrectPoint ? 'לא כל הערכים מתאימים עדיין — אפשר לתקן ולבדוק שוב.' : 'השלימו את כל ערכי הנגזרת כדי להתקדם.'}</div>
              <button type="button" onClick={checkPointValues} disabled={!allPointAnswersFilled} className="inline-flex items-center gap-2 rounded-lg bg-indigo-700 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-45">בדיקת הערכים <Check size={16} /></button>
            </div>}
            {isExerciseComplete && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-4 py-3"><div className="flex items-center gap-2 text-xs font-semibold text-emerald-900"><CheckCircle2 size={17} />כל הערכים נכונים — מצאתם את שיפועי המשיקים.</div><button type="button" onClick={goToNextExercise} className="inline-flex items-center gap-2 rounded-lg bg-lime-300 px-4 py-2 text-xs font-extrabold text-slate-900 transition hover:bg-lime-400">{exerciseIndex === exercises.length - 1 ? 'לסיום התת־פרק' : 'לתרגיל הבא'} <ArrowLeft size={14} /></button></div>}
          </div>}

          <div className="mt-5 border-t border-slate-100 pt-4">
            <button type="button" onClick={() => setHintVisible((visible) => !visible)} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold text-slate-500 transition hover:bg-amber-50 hover:text-amber-800"><Lightbulb size={15} />{hintVisible ? 'הסתרת רמז' : 'אפשר לקבל רמז'}</button>
            {hintVisible && <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs leading-6 text-amber-950"><span className="font-bold">רמז:</span> {exercise.hint}</div>}
          </div>
        </div>

        <aside className="border-t border-slate-100 bg-[#f8f9f5] p-5 sm:p-6 lg:border-r lg:border-t-0" aria-label="התקדמות בתת־הפרק">
          <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-slate-500">התקדמות</p><p className="mt-1 text-2xl font-extrabold text-slate-900">{completedCount}<span className="text-sm font-semibold text-slate-400"> / {exercises.length}</span></p></div><div className="flex size-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-800"><Trophy size={19} /></div></div>
          <div className="mt-5 space-y-2">
            {exercises.map((item, index) => {
              const isComplete = completedIds.includes(item.id);
              const isCurrent = exerciseIndex === index;
              return <div key={item.id} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${isCurrent ? 'bg-white shadow-sm ring-1 ring-slate-200' : ''}`}>
                <span className={`flex size-7 shrink-0 items-center justify-center rounded-full ${isComplete ? 'bg-lime-300 text-slate-900' : isCurrent ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'}`}>{isComplete ? <Check size={14} /> : <span className="font-mono text-[10px]">{index + 1}</span>}</span>
                <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-slate-700">{item.title}</p><p className="mt-0.5 text-[10px] text-slate-400">נגזרת + {item.points.length} הצבות</p></div>
              </div>;
            })}
          </div>
          <div className="mt-5 rounded-xl border border-slate-200 bg-white p-3.5"><p className="text-xs font-bold text-slate-700">מה לזכור?</p><p className="mt-1.5 text-[11px] leading-5 text-slate-500">הנגזרת f′(x) נותנת את שיפוע המשיק. כדי למצוא אותו בנקודה, מציבים את ערך x בנגזרת.</p></div>
        </aside>
      </div>
    </section>
  );
}
