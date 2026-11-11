import { useRef, useState } from 'react';
import { ArrowLeft, Check, CheckCircle2, Lightbulb, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import { MathExpressionPreview, MathKeyboard, validateDerivativeAnswer, validateFunctionValue, type DerivativeAnswerResult, type FunctionValueValidationResult, type MathToken } from '../../math';
import ExerciseMap from './ExerciseMap';

type SlopeQuestion = {
  id: string;
  label: string;
  x: number;
};

type PointQuestion = {
  id: string;
  label: string;
  x: number;
  y: number;
};

type TangentExercise = {
  id: string;
  title: string;
  prompt: string;
  functionExpression: string;
  expectedDerivative: string;
  askForDerivative?: boolean;
  slopeQuestions?: SlopeQuestion[];
  pointQuestions?: PointQuestion[];
  hint: string;
};

type LessonPhase = 'intro' | 'practice' | 'complete';

const exercises: TangentExercise[] = [
  {
    id: 'three-x-square',
    title: 'נגזרת ושיפוע בנקודה',
    prompt: 'מצאו את הנגזרת, חשבו את ערכה ב־x = 3, וקבעו את שיפוע המשיק שם.',
    functionExpression: '3*x^2',
    expectedDerivative: '6*x',
    askForDerivative: true,
    slopeQuestions: [
      { id: 'derivative-at-three', label: 'ב. ערך הנגזרת f′(3)', x: 3 },
      { id: 'tangent-at-three', label: 'ג. שיפוע המשיק כאשר x = 3', x: 3 },
    ],
    hint: 'גזרו לפי כלל החזקה: 3x² נגזרת ל־6x. הציבו 3 בביטוי שקיבלתם.',
  },
  {
    id: 'quadratic-at-two',
    title: 'שיפוע המשיק ב־x = 2',
    prompt: 'חשבו את שיפוע המשיק לגרף הפונקציה בנקודה שבה x = 2.',
    functionExpression: 'x^2 - 5*x + 4',
    expectedDerivative: '2*x - 5',
    slopeQuestions: [{ id: 'slope-at-two', label: 'שיפוע המשיק', x: 2 }],
    hint: 'גזרו את הפונקציה איבר־איבר, ואז הציבו 2 בנגזרת.',
  },
  {
    id: 'cubic-at-negative-three',
    title: 'פונקציה ממעלה שלישית',
    prompt: 'מצאו את הנגזרת ואז חשבו את שיפוע המשיק כאשר x = −3.',
    functionExpression: '1/3*x^3 - 4*x',
    expectedDerivative: 'x^2 - 4',
    askForDerivative: true,
    slopeQuestions: [{ id: 'slope-at-negative-three', label: 'ב. שיפוע המשיק כאשר x = −3', x: -3 }],
    hint: 'הנגזרת של (1/3)x³ היא x², והנגזרת של ‎−4x היא ‎−4.',
  },
  {
    id: 'prove-slope-negative-three',
    title: 'בודקים טענה על שיפוע',
    prompt: 'הראו ששיפוע המשיק בנקודה שבה x = 2 הוא ‎−3: מצאו נגזרת והציבו.',
    functionExpression: 'x^3 - 6*x^2 + 9*x',
    expectedDerivative: '3*x^2 - 12*x + 9',
    askForDerivative: true,
    slopeQuestions: [{ id: 'prove-slope', label: 'שיפוע המשיק בנקודה x = 2', x: 2 }],
    hint: 'גזרו כל חזקה בנפרד. לאחר מכן הציבו 2 בנגזרת והשוו לטענה.',
  },
  {
    id: 'stationary-points',
    title: 'נקודות שבהן המשיק אופקי',
    prompt: 'מצאו את שיעורי הנקודות על הגרף שבהן ערך הנגזרת הוא 0.',
    functionExpression: 'x^3 - 12*x',
    expectedDerivative: '3*x^2 - 12',
    pointQuestions: [
      { id: 'first-zero-slope-point', label: 'הנקודה הראשונה', x: 2, y: -16 },
      { id: 'second-zero-slope-point', label: 'הנקודה השנייה', x: -2, y: 16 },
    ],
    hint: 'פתרו 3x² − 12 = 0 כדי למצוא ערכי x, ואז הציבו כל ערך בפונקציה כדי למצוא y.',
  },
  {
    id: 'point-with-slope-negative-two',
    title: 'מוצאים נקודה לפי שיפוע',
    prompt: 'מצאו את שיעורי הנקודה שבה שיפוע המשיק לגרף הוא ‎−2.',
    functionExpression: 'x^2 - 8*x + 12',
    expectedDerivative: '2*x - 8',
    pointQuestions: [{ id: 'point-at-slope-negative-two', label: 'הנקודה המבוקשת', x: 3, y: -3 }],
    hint: 'השוו את הנגזרת ‎2x − 8 ל־‎−2 כדי למצוא x. אחר כך חשבו y לפי הפונקציה.',
  },
  {
    id: 'horizontal-line-intersections',
    title: 'חיתוך עם ישר אופקי',
    prompt: 'הישר y = 4 חותך את הפרבולה בשתי נקודות. מצאו את הנקודות ואת שיפועי המשיקים בהן.',
    functionExpression: 'x^2 - 6*x + 9',
    expectedDerivative: '2*x - 6',
    pointQuestions: [
      { id: 'point-a', label: 'נקודה A', x: 1, y: 4 },
      { id: 'point-b', label: 'נקודה B', x: 5, y: 4 },
    ],
    slopeQuestions: [
      { id: 'slope-a', label: 'שיפוע המשיק ב־A', x: 1 },
      { id: 'slope-b', label: 'שיפוע המשיק ב־B', x: 5 },
    ],
    hint: 'פתרו x² − 6x + 9 = 4 כדי למצוא את נקודות החיתוך. לאחר מכן הציבו את ערכי x בנגזרת.',
  },
  {
    id: 'x-axis-intersections',
    title: 'חיתוך עם ציר x',
    prompt: 'מצאו את נקודות החיתוך עם ציר x ואת שיפועי המשיקים בנקודות האלה.',
    functionExpression: 'x^2 - 2*x - 8',
    expectedDerivative: '2*x - 2',
    pointQuestions: [
      { id: 'point-c', label: 'נקודה C', x: -2, y: 0 },
      { id: 'point-d', label: 'נקודה D', x: 4, y: 0 },
    ],
    slopeQuestions: [
      { id: 'slope-c', label: 'שיפוע המשיק ב־C', x: -2 },
      { id: 'slope-d', label: 'שיפוע המשיק ב־D', x: 4 },
    ],
    hint: 'בנקודת חיתוך עם ציר x מתקיים y = 0. מצאו את השורשים, ואז הציבו אותם בנגזרת.',
  },
];

function feedbackText(result: FunctionValueValidationResult | undefined) {
  if (!result || result.status === 'empty') return '';
  if (result.status === 'correct') return 'נכון';
  if (result.status === 'invalid') return 'כתבו מספר תקין';
  return 'בדקו את הערך ונסו שוב';
}

export default function TangentSlopeLesson() {
  const [phase, setPhase] = useState<LessonPhase>('intro');
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [derivativeAnswer, setDerivativeAnswer] = useState('');
  const [derivativeResult, setDerivativeResult] = useState<DerivativeAnswerResult | null>(null);
  const [derivativeCorrect, setDerivativeCorrect] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, FunctionValueValidationResult>>({});
  const [hintVisible, setHintVisible] = useState(false);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const derivativeInputRef = useRef<HTMLInputElement>(null);
  const exercise = exercises[exerciseIndex];
  const needsDerivative = Boolean(exercise.askForDerivative);
  const isExerciseComplete = completedIds.includes(exercise.id);
  const completedCount = completedIds.length;
  const answerIds = [
    ...(exercise.slopeQuestions ?? []).map((question) => question.id),
    ...(exercise.pointQuestions ?? []).flatMap((point) => [`${point.id}-x`, `${point.id}-y`]),
  ];
  const allAnswersFilled = answerIds.every((id) => Boolean(answers[id]?.trim()));

  const insertToken = (token: MathToken) => {
    const input = derivativeInputRef.current;
    const start = input?.selectionStart ?? selection.start;
    let end = input?.selectionEnd ?? selection.end;
    let insertStart = start;
    if (token.action === 'backspace') {
      if (insertStart === end && insertStart > 0) insertStart -= 1;
      if (insertStart === end) return;
    }
    const tokenValue = token.action === 'backspace' ? '' : token.value;
    const nextAnswer = `${derivativeAnswer.slice(0, insertStart)}${tokenValue}${derivativeAnswer.slice(end)}`;
    const nextCursor = insertStart + (token.cursorOffset ?? tokenValue.length);
    setDerivativeAnswer(nextAnswer);
    setDerivativeResult(null);
    setSelection({ start: nextCursor, end: nextCursor });
    input?.focus();
    requestAnimationFrame(() => input?.setSelectionRange(nextCursor, nextCursor));
  };

  const checkDerivative = () => {
    const result = validateDerivativeAnswer(derivativeAnswer, exercise.expectedDerivative);
    setDerivativeResult(result);
    if (result.status === 'correct') setDerivativeCorrect(true);
  };

  const updateAnswer = (id: string, value: string) => {
    setAnswers((current) => ({ ...current, [id]: value }));
    setResults((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  const checkAnswers = () => {
    const nextResults: Record<string, FunctionValueValidationResult> = {};
    for (const question of exercise.slopeQuestions ?? []) {
      nextResults[question.id] = validateFunctionValue(exercise.expectedDerivative, question.x, answers[question.id] ?? '');
    }
    for (const point of exercise.pointQuestions ?? []) {
      nextResults[`${point.id}-x`] = validateFunctionValue('x', point.x, answers[`${point.id}-x`] ?? '');
      nextResults[`${point.id}-y`] = validateFunctionValue(exercise.functionExpression, point.x, answers[`${point.id}-y`] ?? '');
    }
    setResults(nextResults);
    if (answerIds.every((id) => nextResults[id]?.status === 'correct') && !isExerciseComplete) {
      setCompletedIds((current) => [...current, exercise.id]);
      setScore((current) => current + 10);
      setStreak((current) => current + 1);
    }
  };

  const resetExercise = () => {
    setDerivativeAnswer('');
    setDerivativeResult(null);
    setDerivativeCorrect(false);
    setAnswers({});
    setResults({});
    setHintVisible(false);
    setSelection({ start: 0, end: 0 });
  };

  const goToNextExercise = () => {
    if (exerciseIndex >= exercises.length - 1) {
      setPhase('complete');
      return;
    }
    setExerciseIndex((current) => current + 1);
    resetExercise();
  };

  const restartLesson = () => {
    setPhase('intro');
    setExerciseIndex(0);
    resetExercise();
    setCompletedIds([]);
    setScore(0);
    setStreak(0);
  };

  const selectExercise = (index: number) => {
    setExerciseIndex(index);
    setPhase('practice');
    resetExercise();
  };

  if (phase === 'intro') {
    return (
      <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm" dir="rtl">
        <ExerciseMap subchapterTitle="חישוב שיפוע המשיק לגרף פונקציה" exercises={exercises} completedIds={completedIds} currentIndex={exerciseIndex} onSelect={selectExercise} />
        <div className="grid lg:grid-cols-[1fr_0.85fr]">
          <div className="p-6 sm:p-9">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1.5 text-xs font-bold text-indigo-900"><Sparkles size={14} /> תת־פרק · שיפוע המשיק</div>
            <h2 className="text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">איך מוצאים את שיפוע המשיק?</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">ערך הנגזרת בנקודה שווה לשיפוע המשיק לגרף באותה נקודה. אם הנקודה היא <span dir="ltr">(a, f(a))</span>, אז שיפוע המשיק הוא <span dir="ltr">f′(a)</span>: גוזרים, מציבים את ערך ה־<span dir="ltr">x</span> בנגזרת, ומקבלים את השיפוע.</p>
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 text-xs font-bold text-slate-500">דוגמה: מוצאים נקודה ושיפוע</div>
              <div className="grid gap-2 text-center sm:grid-cols-3">
                <div className="rounded-xl bg-white p-3"><span className="block text-[11px] font-bold text-slate-400">הפונקציה</span><span className="mt-1 block font-serif text-lg text-slate-900" dir="ltr">f(x) = x² − 2x − 8</span></div>
                <div className="rounded-xl bg-white p-3"><span className="block text-[11px] font-bold text-slate-400">חיתוך עם ציר x</span><span className="mt-1 block font-serif text-lg text-slate-900" dir="ltr">(−2, 0), (4, 0)</span></div>
                <div className="rounded-xl bg-indigo-50 p-3"><span className="block text-[11px] font-bold text-indigo-700">שיפועי המשיקים</span><span className="mt-1 block font-serif text-lg font-bold text-indigo-950" dir="ltr">f′(−2) = −6, f′(4) = 6</span></div>
              </div>
              <p className="mt-3 text-center text-xs leading-5 text-slate-600">תשובות של נקודות מזינים כשני ערכים נפרדים, בתבנית <span dir="ltr">(x, y)</span>.</p>
            </div>
          </div>
          <div className="flex flex-col justify-center border-t border-slate-100 bg-[#f7f8f2] p-6 sm:p-9 lg:border-r lg:border-t-0">
            <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-800"><Lightbulb size={21} /></div>
            <h3 className="text-lg font-extrabold text-slate-900">מה מתרגלים?</h3>
            <ol className="mt-4 space-y-3">
              <li className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"><span className="flex size-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-extrabold text-indigo-900">1</span><span className="text-xs font-medium text-slate-700">מחשבים שיפוע משיק לפי ערך הנגזרת.</span></li>
              <li className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"><span className="flex size-7 items-center justify-center rounded-full bg-lime-100 text-xs font-extrabold text-lime-900">2</span><span className="text-xs font-medium text-slate-700">מוצאים נקודה לפי שיפוע או לפי חיתוך עם ישר וציר.</span></li>
              <li className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"><span className="flex size-7 items-center justify-center rounded-full bg-orange-100 text-xs font-extrabold text-orange-900">3</span><span className="text-xs font-medium text-slate-700">מזינים כל נקודה בפורמט <span dir="ltr">(x, y)</span> — שדה ל־x ושדה ל־y.</span></li>
            </ol>
            <p className="mt-4 text-xs leading-5 text-slate-500">שמונה תרגילים, בלי שעון — אפשר לתקן ולנסות שוב.</p>
            <button type="button" onClick={() => setPhase('practice')} className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-lime-300 px-5 py-3 text-sm font-extrabold text-slate-900 transition hover:bg-lime-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-600">מתחילים לתרגל <ArrowLeft size={17} /></button>
          </div>
        </div>
      </section>
    );
  }

  if (phase === 'complete') {
    return (
      <section className="mx-auto max-w-3xl overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm" dir="rtl">
        <ExerciseMap subchapterTitle="חישוב שיפוע המשיק לגרף פונקציה" exercises={exercises} completedIds={completedIds} currentIndex={exerciseIndex} onSelect={selectExercise} />
        <div className="bg-[#202447] px-6 py-10 text-center text-white sm:px-12">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-lime-300 text-slate-900"><Trophy size={30} /></div>
          <p className="mt-5 text-xs font-bold tracking-widest text-lime-200">תת־הפרק הושלם</p>
          <h2 className="mt-2 text-3xl font-extrabold">מצאתם נקודות ושיפועים!</h2>
          <p className="mt-2 text-sm text-slate-300">השתמשתם בנגזרת כדי לחשב שיפועי משיקים ולמצוא נקודות על גרפים.</p>
        </div>
        <div className="grid gap-3 p-6 sm:grid-cols-2 sm:p-8">
          <div className="rounded-2xl bg-lime-50 p-4 text-center"><Trophy className="mx-auto text-lime-700" size={20} /><p className="mt-2 text-2xl font-extrabold text-slate-900">{score}</p><p className="text-xs text-slate-500">נקודות שצברתם</p></div>
          <div className="rounded-2xl bg-indigo-50 p-4 text-center"><CheckCircle2 className="mx-auto text-indigo-600" size={20} /><p className="mt-2 text-2xl font-extrabold text-slate-900">{completedCount}/{exercises.length}</p><p className="text-xs text-slate-500">תרגילים הושלמו</p></div>
        </div>
        <div className="px-6 pb-7 text-center"><button type="button" onClick={restartLesson} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"><RotateCcw size={15} /> מתרגלים שוב</button></div>
      </section>
    );
  }

  const canAnswerQuestions = !needsDerivative || derivativeCorrect;
  const hasInvalidAnswer = Object.values(results).some((result) => result.status === 'invalid');
  const hasIncorrectAnswer = Object.values(results).some((result) => result.status === 'incorrect');

  return (
    <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm" dir="rtl">
      <ExerciseMap subchapterTitle="חישוב שיפוע המשיק לגרף פונקציה" exercises={exercises} completedIds={completedIds} currentIndex={exerciseIndex} onSelect={selectExercise} />
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-[#fbfcfa] px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1.5 text-xs font-bold text-indigo-900"><Sparkles size={13} /> תרגיל {exerciseIndex + 1} מתוך {exercises.length}</span><span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500">פולינומים</span></div>
        <div className="text-xs font-bold text-slate-600">{score} נק׳ · רצף {streak}</div>
      </div>
      <div className="h-1.5 bg-slate-100"><div className="h-full rounded-l-full bg-indigo-400 transition-all duration-500" style={{ width: `${(completedCount / exercises.length) * 100}%` }} /></div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="p-5 sm:p-8">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-500"><span className="flex size-7 items-center justify-center rounded-lg bg-indigo-50 font-mono text-indigo-700" dir="ltr">{String(exerciseIndex + 1).padStart(2, '0')}</span>{exercise.title}</div>
          <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">{exercise.prompt}</h2>
          <div className="mt-4 flex min-h-20 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-[#fbfcfa] px-4 py-5 text-3xl text-slate-900" dir="ltr"><span className="font-serif italic">y =</span><MathExpressionPreview source={exercise.functionExpression} /></div>

          {needsDerivative && <div className="mt-5">
            <label htmlFor="tangent-derivative-answer" className="block text-sm font-semibold text-slate-700">א. מצאו את הנגזרת:</label>
            <div className={`mt-2 flex items-center gap-3 rounded-xl border px-4 py-3 ${derivativeCorrect ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300 bg-white focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-100'}`}>
              <span className="shrink-0 font-serif text-lg font-semibold text-slate-700" dir="ltr">y′ =</span>
              <input id="tangent-derivative-answer" ref={derivativeInputRef} value={derivativeAnswer} onChange={(event) => { setDerivativeAnswer(event.target.value); setDerivativeResult(null); setSelection({ start: event.target.selectionStart ?? 0, end: event.target.selectionEnd ?? 0 }); }} onFocus={(event) => setSelection({ start: event.currentTarget.selectionStart ?? 0, end: event.currentTarget.selectionEnd ?? 0 })} onSelect={(event) => setSelection({ start: event.currentTarget.selectionStart ?? 0, end: event.currentTarget.selectionEnd ?? 0 })} onKeyDown={(event) => { if (event.key === 'Enter' && !derivativeCorrect) checkDerivative(); }} dir="ltr" spellCheck={false} autoComplete="off" aria-invalid={Boolean(derivativeResult && derivativeResult.status !== 'correct' && derivativeResult.status !== 'empty')} placeholder="כתבו את הנגזרת…" disabled={derivativeCorrect} className="min-w-0 flex-1 bg-transparent font-mono text-lg font-medium text-slate-900 outline-none placeholder:text-sm placeholder:text-slate-400 disabled:opacity-70" />
              {derivativeCorrect && <Check size={19} className="text-emerald-700" aria-label="נגזרת נכונה" />}
            </div>
            {!derivativeCorrect && <div className="mt-3"><MathKeyboard initialSection="algebra" onInsert={insertToken} /></div>}
            {!derivativeCorrect && <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              {derivativeResult && derivativeResult.status !== 'correct' && <p role="status" className="text-xs font-semibold text-amber-800">{derivativeResult.status === 'empty' ? 'כתבו נגזרת כדי להמשיך.' : derivativeResult.status === 'invalid' ? 'בדקו את צורת הכתיבה ונסו שוב.' : 'בדקו את כללי הגזירה ונסו שוב.'}</p>}
              <button type="button" onClick={checkDerivative} disabled={!derivativeAnswer.trim()} className="mr-auto inline-flex items-center gap-2 rounded-lg bg-lime-300 px-4 py-2.5 text-sm font-extrabold text-slate-900 transition hover:bg-lime-400 disabled:cursor-not-allowed disabled:opacity-45">בדיקת הנגזרת <Check size={16} /></button>
            </div>}
          </div>}

          {canAnswerQuestions && <div className="mt-5 space-y-5">
            {(exercise.slopeQuestions?.length ?? 0) > 0 && <div>
              <h3 className="text-sm font-extrabold text-slate-800">שיפועי המשיקים</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {exercise.slopeQuestions?.map((question) => {
                  const result = results[question.id];
                  return <div key={question.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <label htmlFor={`answer-${question.id}`} className="mb-2 block text-xs font-bold text-slate-700">{question.label}</label>
                    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2" dir="ltr"><span className="font-serif text-sm">m =</span><input id={`answer-${question.id}`} type="text" inputMode="decimal" value={answers[question.id] ?? ''} onChange={(event) => updateAnswer(question.id, event.target.value)} aria-invalid={Boolean(result && result.status !== 'correct' && result.status !== 'empty')} className="min-w-0 flex-1 bg-transparent text-center font-mono text-lg font-bold outline-none" placeholder="?" /></div>
                    {result && result.status !== 'empty' && <p role="status" className={`mt-1 text-center text-[11px] font-semibold ${result.status === 'correct' ? 'text-emerald-700' : 'text-amber-700'}`}>{feedbackText(result)}</p>}
                  </div>;
                })}
              </div>
            </div>}

            {(exercise.pointQuestions?.length ?? 0) > 0 && <div>
              <h3 className="text-sm font-extrabold text-slate-800">שיעורי הנקודות על הגרף</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {exercise.pointQuestions?.map((point) => {
                  const xResult = results[`${point.id}-x`];
                  const yResult = results[`${point.id}-y`];
                  return <fieldset key={point.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <legend className="px-1 text-xs font-bold text-slate-700">{point.label}</legend>
                    <div className="flex flex-wrap items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-2" dir="ltr">
                      <span className="font-serif text-lg">(</span>
                      <label className="flex items-center gap-1 text-xs font-bold text-slate-600">x<input aria-label={`${point.label}, ערך x`} type="text" inputMode="decimal" value={answers[`${point.id}-x`] ?? ''} onChange={(event) => updateAnswer(`${point.id}-x`, event.target.value)} className={`w-16 rounded-md border px-2 py-1 text-center font-mono text-base font-bold text-slate-900 outline-none focus:ring-2 ${xResult?.status === 'correct' ? 'border-emerald-300 bg-emerald-50 focus:ring-emerald-100' : 'border-slate-200 focus:ring-indigo-100'}`} placeholder="x" /></label>
                      <span className="font-serif text-lg">,</span>
                      <label className="flex items-center gap-1 text-xs font-bold text-slate-600">y<input aria-label={`${point.label}, ערך y`} type="text" inputMode="decimal" value={answers[`${point.id}-y`] ?? ''} onChange={(event) => updateAnswer(`${point.id}-y`, event.target.value)} className={`w-16 rounded-md border px-2 py-1 text-center font-mono text-base font-bold text-slate-900 outline-none focus:ring-2 ${yResult?.status === 'correct' ? 'border-emerald-300 bg-emerald-50 focus:ring-emerald-100' : 'border-slate-200 focus:ring-indigo-100'}`} placeholder="y" /></label>
                      <span className="font-serif text-lg">)</span>
                    </div>
                    {(xResult || yResult) && <p role="status" className="mt-1 text-center text-[11px] font-semibold text-amber-700">{xResult?.status === 'correct' && yResult?.status === 'correct' ? 'הנקודה נכונה' : [xResult, yResult].some((result) => result?.status === 'invalid') ? 'כתבו ערכים מספריים תקינים' : [xResult, yResult].some((result) => result?.status === 'incorrect') ? 'בדקו את זוג הערכים (x, y)' : ''}</p>}
                  </fieldset>;
                })}
              </div>
            </div>}

            {!isExerciseComplete && <div className="flex flex-wrap items-center justify-between gap-3">
              <div aria-live="polite" className="text-xs font-semibold text-amber-900">{hasInvalidAnswer ? 'חלק מהתשובות אינן מספרים תקינים.' : hasIncorrectAnswer ? 'חלק מהערכים עדיין אינם מתאימים — אפשר לתקן ולבדוק שוב.' : 'השלימו את כל השדות כדי לבדוק את התשובות.'}</div>
              <button type="button" onClick={checkAnswers} disabled={!allAnswersFilled} className="inline-flex items-center gap-2 rounded-lg bg-indigo-700 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-45">בדיקת תשובות <Check size={16} /></button>
            </div>}
            {isExerciseComplete && <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-emerald-50 px-4 py-3"><div className="flex items-center gap-2 text-xs font-semibold text-emerald-900"><CheckCircle2 size={17} />כל התשובות נכונות — יופי של עבודה!</div><button type="button" onClick={goToNextExercise} className="inline-flex items-center gap-2 rounded-lg bg-lime-300 px-4 py-2 text-xs font-extrabold text-slate-900 transition hover:bg-lime-400">{exerciseIndex === exercises.length - 1 ? 'לסיום התת־פרק' : 'לתרגיל הבא'} <ArrowLeft size={14} /></button></div>}
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
                <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-slate-700">{item.title}</p><p className="mt-0.5 text-[10px] text-slate-400">{item.pointQuestions?.length ?? 0} נקודות · {item.slopeQuestions?.length ?? 0} שיפועים</p></div>
              </div>;
            })}
          </div>
          <div className="mt-5 rounded-xl border border-slate-200 bg-white p-3.5"><p className="text-xs font-bold text-slate-700">מה לזכור?</p><p className="mt-1.5 text-[11px] leading-5 text-slate-500">שיפוע המשיק כאשר x שווה a הוא f′(a). נקודה על הגרף כוללת זוג ערכים מתאים (x, y).</p></div>
        </aside>
      </div>
    </section>
  );
}
