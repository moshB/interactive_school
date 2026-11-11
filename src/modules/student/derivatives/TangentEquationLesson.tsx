import { useState } from 'react';
import { ArrowLeft, Check, CheckCircle2, Lightbulb, Maximize2, RotateCcw, Sparkles, Trophy, X } from 'lucide-react';
import { compileFunctionExpression, MathExpressionPreview, validateDerivativeAnswer, type DerivativeAnswerResult } from '../../math';
import ExerciseMap from './ExerciseMap';

type TangentLine = {
  id: string;
  label: string;
  x: number;
  y: number;
  slope: number;
  color: string;
};

type NumericQuestion = {
  id: string;
  label: string;
  expected: number;
};

type GraphLine = {
  label: string;
  slope: number;
  intercept: number;
  color: string;
  dashed?: boolean;
};

type GraphPoint = {
  x: number;
  y: number;
  label: string;
  color?: string;
};

type GraphIllustration = {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  referenceLines?: GraphLine[];
  points?: GraphPoint[];
};

type TangentEquationExercise = {
  id: string;
  title: string;
  prompt: string;
  functionExpression: string;
  expectedDerivative: string;
  lines: TangentLine[];
  numericQuestions?: NumericQuestion[];
  hint: string;
  graph?: GraphIllustration;
};

type AnswerState = 'empty' | 'invalid' | 'incorrect' | 'correct';

const exercises: TangentEquationExercise[] = [
  {
    id: 'quadratic-at-three',
    title: 'משיק בנקודה נתונה',
    prompt: 'מצאו את משוואת המשיק לפונקציה בנקודה שבה x = 3.',
    functionExpression: 'x^2 - 4*x + 6',
    expectedDerivative: '2*x - 4',
    lines: [{ id: 'tangent', label: 'המשיק בנקודה שבה x = 3', x: 3, y: 3, slope: 2, color: '#e87945' }],
    hint: 'חשבו את הנגזרת והציבו בה x = 3 כדי למצוא את השיפוע. נקודת ההשקה היא (3, 3). הציבו את שלושת הערכים בנוסחה y − y₁ = m(x − x₁).',
  },
  {
    id: 'cubic-at-two',
    title: 'משיק בנקודה על גרף של פונקציה מעוקבת',
    prompt: 'מצאו את משוואת המשיק לגרף בנקודה (2, 0).',
    functionExpression: 'x^3 - 3*x^2 + 4',
    expectedDerivative: '3*x^2 - 6*x',
    lines: [{ id: 'tangent', label: 'המשיק בנקודה (2, 0)', x: 2, y: 0, slope: 0, color: '#e87945' }],
    hint: 'הציבו x = 2 בנגזרת כדי למצוא את השיפוע. נקודת ההשקה כבר נתונה: (2, 0).',
  },
  {
    id: 'secant-intersections',
    title: 'ישר חותך פרבולה ושני משיקים',
    prompt: 'הישר y = x + 2 חותך את הפרבולה בנקודות A ו־B. מצאו את הקואורדינטות של A ו־B, ואז את משוואת המשיק לפונקציה בכל אחת מהנקודות.',
    functionExpression: 'x^2 - 4*x + 6',
    expectedDerivative: '2*x - 4',
    lines: [
      { id: 'tangent-a', label: 'המשיק בנקודה A', x: 1, y: 3, slope: -2, color: '#0d9b8a' },
      { id: 'tangent-b', label: 'המשיק בנקודה B', x: 4, y: 6, slope: 4, color: '#cf4d7d' },
    ],
    numericQuestions: [
      { id: 'a-x', label: 'שיעור x של A', expected: 1 },
      { id: 'a-y', label: 'שיעור y של A', expected: 3 },
      { id: 'b-x', label: 'שיעור x של B', expected: 4 },
      { id: 'b-y', label: 'שיעור y של B', expected: 6 },
    ],
    hint: 'מצאו את החיתוך על ידי השוואת x² − 4x + 6 ל־x + 2. נקבל A(1, 3), B(4, 6). הציבו כל ערך x בנגזרת כדי למצוא את שיפוע המשיק.',
    graph: {
      xMin: -1,
      xMax: 6,
      yMin: -4,
      yMax: 10,
      referenceLines: [{ label: 'הישר החותך y = x + 2', slope: 1, intercept: 2, color: '#87952f', dashed: true }],
      points: [{ x: 1, y: 3, label: 'A', color: '#0d9b8a' }, { x: 4, y: 6, label: 'B', color: '#cf4d7d' }],
    },
  },
  {
    id: 'parallel-tangents',
    title: 'משיק המקביל לישר נתון',
    prompt: 'מצאו את נקודות ההשקה שבהן שיפוע הפונקציה הוא 9, ואז כתבו את משוואת המשיק בכל נקודה. שיפוע 9 נובע מכך שהמשיקים מקבילים לישר y = 9x − 5.',
    functionExpression: 'x^3 - 3*x',
    expectedDerivative: '3*x^2 - 3',
    lines: [
      { id: 'tangent-left', label: 'המשיק בנקודה שבה x = −2', x: -2, y: -2, slope: 9, color: '#0d9b8a' },
      { id: 'tangent-right', label: 'המשיק בנקודה שבה x = 2', x: 2, y: 2, slope: 9, color: '#cf4d7d' },
    ],
    hint: 'השוו את הנגזרת ל־9: 3x² − 3 = 9. מצאו את ערכי x, חשבו את y בכל נקודה והשתמשו בנוסחת המשיק.',
    graph: { xMin: -3, xMax: 3, yMin: -18, yMax: 18 },
  },
  {
    id: 'given-slope',
    title: 'משיק לפי שיפוע נתון',
    prompt: 'מצאו את נקודת ההשקה שבה שיפוע המשיק הוא −2, ואז כתבו את משוואת המשיק בנקודה זו.',
    functionExpression: '2*x^2 - 10*x + 7',
    expectedDerivative: '4*x - 10',
    lines: [{ id: 'tangent', label: 'המשיק ששיפועו −2', x: 2, y: -5, slope: -2, color: '#e87945' }],
    hint: 'השוו את הנגזרת ל־−2 כדי למצוא x = 2. הציבו x = 2 בפונקציה כדי למצוא את y של נקודת ההשקה.',
  },
  {
    id: 'axis-intercept-tangent',
    title: 'משיק בנקודת חיתוך עם ציר y',
    prompt: 'מצאו את נקודת החיתוך של הפונקציה עם ציר y. לאחר מכן מצאו את משוואת המשיק בנקודה זו ואת שיעור x שבו המשיק חותך את ציר x.',
    functionExpression: '-x^2 + 6*x - 5',
    expectedDerivative: '-2*x + 6',
    lines: [{ id: 'tangent', label: 'המשיק בנקודה שעל ציר y', x: 0, y: -5, slope: 6, color: '#e87945' }],
    numericQuestions: [{ id: 'x-intercept', label: 'שיעור x של חיתוך המשיק עם ציר x', expected: 5 / 6 }],
    hint: 'בציר y מתקיים x = 0, לכן נקודת ההשקה היא (0, −5). חשבו את הנגזרת בנקודה. אחרי כתיבת המשיק, הציבו y = 0 כדי למצוא את חיתוכו עם ציר x.',
    graph: {
      xMin: -1,
      xMax: 7,
      yMin: -8,
      yMax: 6,
      points: [{ x: 0, y: -5, label: '(0, −5)' }, { x: 5 / 6, y: 0, label: '(5/6, 0)', color: '#e87945' }],
    },
  },
  {
    id: 'horizontal-tangents',
    title: 'שני משיקים אופקיים',
    prompt: 'מצאו את שתי הנקודות שבהן שיפוע הפונקציה הוא 0. כתבו את משוואת המשיק בכל אחת מהנקודות.',
    functionExpression: 'x^3 - 6*x^2 + 9*x',
    expectedDerivative: '3*x^2 - 12*x + 9',
    lines: [
      { id: 'horizontal-at-three', label: 'המשיק בנקודה (3, 0)', x: 3, y: 0, slope: 0, color: '#0d9b8a' },
      { id: 'horizontal-at-one', label: 'המשיק בנקודה (1, 4)', x: 1, y: 4, slope: 0, color: '#cf4d7d' },
    ],
    hint: 'השוו את הנגזרת 3x² − 12x + 9 לאפס, מצאו את ערכי x, ואז הציבו בפונקציה כדי לקבל את ערכי y של המשיקים.',
    graph: { xMin: -1, xMax: 5, yMin: -4, yMax: 8, points: [{ x: 3, y: 0, label: '(3, 0)' }, { x: 1, y: 4, label: '(1, 4)' }] },
  },
  {
    id: 'tangent-intersection',
    title: 'נקודת מפגש של שני משיקים',
    prompt: 'הישר y = 2 חותך את הפרבולה בשתי נקודות. מצאו את נקודות ההשקה, כתבו את משוואת המשיק בכל נקודה, ואז מצאו היכן שני המשיקים נפגשים.',
    functionExpression: 'x^2 - 6*x + 8',
    expectedDerivative: '2*x - 6',
    lines: [
      { id: 'tangent-left', label: 'המשיק בנקודה שמשמאל לקודקוד', x: 3 - Math.sqrt(3), y: 2, slope: -2 * Math.sqrt(3), color: '#0d9b8a' },
      { id: 'tangent-right', label: 'המשיק בנקודה שמימין לקודקוד', x: 3 + Math.sqrt(3), y: 2, slope: 2 * Math.sqrt(3), color: '#cf4d7d' },
    ],
    numericQuestions: [
      { id: 'meeting-x', label: 'שיעור x של נקודת המפגש', expected: 3 },
      { id: 'meeting-y', label: 'שיעור y של נקודת המפגש', expected: -4 },
    ],
    hint: 'פתרו x² − 6x + 8 = 2 כדי למצוא x = 3 ± √3. שתי נקודות ההשקה הן בגובה y = 2. הציבו את ערכי x בנגזרת; השוו את המשיקים כדי למצוא את נקודת המפגש.',
    graph: {
      xMin: -1,
      xMax: 7,
      yMin: -8,
      yMax: 10,
      referenceLines: [{ label: 'הישר החותך y = 2', slope: 0, intercept: 2, color: '#87952f', dashed: true }],
      points: [{ x: 3 - Math.sqrt(3), y: 2, label: 'נקודת השקה' }, { x: 3 + Math.sqrt(3), y: 2, label: 'נקודת השקה' }, { x: 3, y: -4, label: 'מפגש המשיקים', color: '#e87945' }],
    },
  },
];

const GRAPH_WIDTH = 640;
const GRAPH_HEIGHT = 340;

function mapGraphPoint(x: number, y: number, graph: GraphIllustration) {
  return {
    x: ((x - graph.xMin) / (graph.xMax - graph.xMin)) * GRAPH_WIDTH,
    y: ((graph.yMax - y) / (graph.yMax - graph.yMin)) * GRAPH_HEIGHT,
  };
}

function makePath(evaluate: (x: number) => number | null, graph: GraphIllustration) {
  const segments: string[] = [];
  let drawing = false;
  let previousScreenY: number | null = null;
  const samples = 360;
  for (let index = 0; index <= samples; index += 1) {
    const x = graph.xMin + (index / samples) * (graph.xMax - graph.xMin);
    const y = evaluate(x);
    const point = y === null ? null : mapGraphPoint(x, y, graph);
    const visible = point !== null && Number.isFinite(point.y) && point.y >= -GRAPH_HEIGHT && point.y <= GRAPH_HEIGHT * 2;
    const discontinuity = visible && previousScreenY !== null && Math.abs(point.y - previousScreenY) > GRAPH_HEIGHT * 0.45;
    if (!visible || discontinuity) drawing = false;
    if (visible) {
      segments.push(`${drawing ? 'L' : 'M'}${point.x.toFixed(2)},${point.y.toFixed(2)}`);
      drawing = true;
    }
    previousScreenY = visible ? point.y : null;
  }
  return segments.join(' ');
}

function graphTicks(min: number, max: number) {
  const roughStep = (max - min) / 8;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalized = roughStep / magnitude;
  const step = (normalized < 1.5 ? 1 : normalized < 3.5 ? 2 : normalized < 7.5 ? 5 : 10) * magnitude;
  const result: number[] = [];
  for (let value = Math.ceil(min / step) * step; value <= max + step * 0.001 && result.length < 60; value += step) {
    result.push(Number(value.toPrecision(5)));
  }
  return result;
}

function formatNumber(value: number) {
  if (Math.abs(value) < 0.000001) return '0';
  return Number(value.toPrecision(4)).toString().replace('-', '−');
}

function TangentGraph({ exercise }: { exercise: TangentEquationExercise }) {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!exercise.graph) return null;
  const graph = exercise.graph;
  const compiled = compileFunctionExpression(exercise.functionExpression);
  const evaluator = compiled.ok ? compiled.evaluator : null;
  const functionPath = evaluator ? makePath((x) => {
    const result = evaluator.evaluate(x);
    return result.ok ? result.value : null;
  }, graph) : '';
  const lines = [...exercise.lines.map((line) => {
    const intercept = line.y - line.slope * line.x;
    return { label: line.label, slope: line.slope, intercept, color: line.color };
  }), ...(graph.referenceLines ?? [])];
  const xTicks = graphTicks(graph.xMin, graph.xMax);
  const yTicks = graphTicks(graph.yMin, graph.yMax);
  const xAxisY = mapGraphPoint(0, 0, graph).y;
  const yAxisX = mapGraphPoint(0, 0, graph).x;

  return (
    <>
      {isExpanded && <button type="button" onClick={() => setIsExpanded(false)} aria-label="סגירת תצוגת הגרף המוגדלת" className="fixed inset-0 z-40 cursor-default bg-slate-950/60" />}
      <figure className={`${isExpanded ? 'fixed inset-3 z-50 m-auto max-h-[calc(100vh-1.5rem)] w-[min(100%,960px)] overflow-y-auto shadow-2xl' : 'w-full max-w-[360px]'} overflow-hidden rounded-2xl border border-slate-200 bg-white`} role={isExpanded ? 'dialog' : undefined} aria-modal={isExpanded ? true : undefined} aria-label="המחשה גרפית של הפונקציה והישרים בתרגיל">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
        <figcaption className="text-xs font-extrabold text-slate-700">המחשה גרפית</figcaption>
        <div className="flex items-center gap-2">
          <span className="hidden text-[10px] text-slate-400 sm:inline">הפונקציה והישרים הרלוונטיים</span>
          <button type="button" onClick={() => setIsExpanded((expanded) => !expanded)} aria-label={isExpanded ? 'סגירת הגדלת הגרף' : 'הגדלת הגרף'} className="inline-flex size-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
            {isExpanded ? <X size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>
      <div className="p-2 sm:p-3">
        <svg viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`} role="img" aria-label={`גרף של y = ${exercise.functionExpression} והמשיקים הרלוונטיים`} className={`block h-auto w-full rounded-xl bg-white ${isExpanded ? 'max-h-[70vh]' : ''}`}>
          <defs><clipPath id="tangent-equation-graph-clip"><rect width={GRAPH_WIDTH} height={GRAPH_HEIGHT} /></clipPath></defs>
          <rect width={GRAPH_WIDTH} height={GRAPH_HEIGHT} fill="#fff" />
          {xTicks.map((tick) => {
            const x = mapGraphPoint(tick, 0, graph).x;
            return <g key={`grid-x-${tick}`}><line x1={x} y1="0" x2={x} y2={GRAPH_HEIGHT} stroke="#edf0f4" /><text x={x} y={Math.min(Math.max(xAxisY + 17, 15), GRAPH_HEIGHT - 5)} textAnchor="middle" fill="#94a3b8" fontSize="11">{formatNumber(tick)}</text></g>;
          })}
          {yTicks.map((tick) => {
            const y = mapGraphPoint(0, tick, graph).y;
            return <g key={`grid-y-${tick}`}><line x1="0" y1={y} x2={GRAPH_WIDTH} y2={y} stroke="#edf0f4" /><text x={Math.min(Math.max(yAxisX - 8, 24), GRAPH_WIDTH - 5)} y={y - 5} textAnchor="end" fill="#94a3b8" fontSize="11">{formatNumber(tick)}</text></g>;
          })}
          {xAxisY >= 0 && xAxisY <= GRAPH_HEIGHT && <line x1="0" y1={xAxisY} x2={GRAPH_WIDTH} y2={xAxisY} stroke="#475569" strokeWidth="1.7" />}
          {yAxisX >= 0 && yAxisX <= GRAPH_WIDTH && <line x1={yAxisX} y1="0" x2={yAxisX} y2={GRAPH_HEIGHT} stroke="#475569" strokeWidth="1.7" />}
          <g clipPath="url(#tangent-equation-graph-clip)">
            {functionPath && <path d={functionPath} fill="none" stroke="#6558e8" strokeWidth="3.5" strokeLinecap="round" />}
            {lines.map((line) => <path key={line.label} d={makePath((x) => line.slope * x + line.intercept, graph)} fill="none" stroke={line.color} strokeWidth="2.5" strokeDasharray={'dashed' in line && line.dashed ? '7 6' : undefined} strokeLinecap="round" />)}
            {(graph.points ?? []).map((point) => {
              const screenPoint = mapGraphPoint(point.x, point.y, graph);
              return <g key={`${point.x}-${point.y}-${point.label}`}><circle cx={screenPoint.x} cy={screenPoint.y} r="5" fill="white" stroke={point.color ?? '#334155'} strokeWidth="2.5" /><text x={screenPoint.x + 8} y={screenPoint.y - 8} fill={point.color ?? '#334155'} fontSize="12" fontWeight="700">{point.label}</text></g>;
            })}
          </g>
        </svg>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 px-1 text-[10px] text-slate-600">
          <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 rounded bg-indigo-600" />הפונקציה</span>
          {lines.map((line) => <span key={`legend-${line.label}`} className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 rounded" style={{ backgroundColor: line.color }} />{line.label}</span>)}
        </div>
      </div>
      </figure>
    </>
  );
}

function parseNumericAnswer(value: string): number | null {
  const normalized = value.trim().replace(/−/g, '-');
  if (!normalized) return null;
  const numberPattern = '[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)';
  const fraction = normalized.match(new RegExp(`^(${numberPattern})\\s*\\/\\s*(${numberPattern})$`));
  if (fraction) {
    const denominator = Number(fraction[2]);
    if (denominator === 0) return Number.NaN;
    return Number(fraction[1]) / denominator;
  }
  if (new RegExp(`^${numberPattern}$`).test(normalized)) return Number(normalized);
  if (/\bx\b/i.test(normalized)) return Number.NaN;
  const compilation = compileFunctionExpression(normalized);
  if (!compilation.ok) return Number.NaN;
  const result = compilation.evaluator.evaluate(0);
  return result.ok ? result.value : Number.NaN;
}

function validateAnswer(answer: string, expected: number): AnswerState {
  if (!answer.trim()) return 'empty';
  const value = parseNumericAnswer(answer);
  if (value === null) return 'empty';
  if (!Number.isFinite(value)) return 'invalid';
  return Math.abs(value - expected) <= 0.000001 * Math.max(1, Math.abs(expected)) ? 'correct' : 'incorrect';
}

function answerFeedback(state: AnswerState | undefined) {
  if (!state || state === 'empty') return '';
  if (state === 'correct') return 'נכון';
  if (state === 'invalid') return 'כתבו מספר או שבר תקינים';
  return 'בדקו את הערך ונסו שוב';
}

export default function TangentEquationLesson() {
  const [phase, setPhase] = useState<'intro' | 'practice' | 'complete'>('intro');
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [derivativeAnswer, setDerivativeAnswer] = useState('');
  const [derivativeResult, setDerivativeResult] = useState<DerivativeAnswerResult | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, AnswerState>>({});
  const [hintVisible, setHintVisible] = useState(false);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const exercise = exercises[exerciseIndex];
  const answerItems = [
    ...exercise.lines.flatMap((line) => [
      { id: `${line.id}-x`, label: `${line.label} · שיעור x₁`, expected: line.x },
      { id: `${line.id}-y`, label: `${line.label} · שיעור y₁`, expected: line.y },
      { id: `${line.id}-slope`, label: `${line.label} · שיפוע m`, expected: line.slope },
    ]),
    ...(exercise.numericQuestions ?? []),
  ];
  const isExerciseComplete = completedIds.includes(exercise.id);
  const completedCount = completedIds.length;
  const derivativeIsCorrect = derivativeResult?.status === 'correct';

  const checkDerivative = () => {
    setDerivativeResult(validateDerivativeAnswer(derivativeAnswer, exercise.expectedDerivative));
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
    const nextResults = Object.fromEntries(answerItems.map((item) => [item.id, validateAnswer(answers[item.id] ?? '', item.expected)])) as Record<string, AnswerState>;
    setResults(nextResults);
    if (answerItems.every((item) => nextResults[item.id] === 'correct') && !isExerciseComplete) {
      setCompletedIds((current) => [...current, exercise.id]);
      setScore((current) => current + 10);
    }
  };

  const resetExercise = () => {
    setDerivativeAnswer('');
    setDerivativeResult(null);
    setAnswers({});
    setResults({});
    setHintVisible(false);
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
  };

  const selectExercise = (index: number) => {
    setExerciseIndex(index);
    setPhase('practice');
    resetExercise();
  };

  if (phase === 'intro') {
    return (
      <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm" dir="rtl">
        <ExerciseMap subchapterTitle="משוואת המשיק לגרף פונקציה ותכונותיו" exercises={exercises} completedIds={completedIds} currentIndex={exerciseIndex} onSelect={selectExercise} />
        <div className="grid lg:grid-cols-[1fr_0.85fr]">
          <div className="p-6 sm:p-9">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1.5 text-xs font-bold text-indigo-900"><Sparkles size={14} /> תת־פרק 1.4 · משוואת המשיק</div>
            <h2 className="text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">מוצאים את משוואת המשיק</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">בכל תרגיל נמצא קודם את הנגזרת. אחר כך נציב בה את ערך x של נקודת ההשקה כדי למצוא את השיפוע m. לבסוף נציב את השיפוע ואת נקודת ההשקה <span dir="ltr">(x₁, y₁)</span> בנוסחת המשיק:</p>
            <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-center font-serif text-2xl font-bold text-indigo-950" dir="ltr">y − y₁ = m(x − x₁)</div>
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 text-xs font-bold text-slate-500">שלושת הערכים שמציבים בנוסחה</div>
              <div className="grid gap-2 text-center sm:grid-cols-3">
                <div className="rounded-xl bg-white p-3"><span className="block text-[11px] font-bold text-slate-400">שיפוע המשיק</span><span className="mt-1 block font-serif text-lg text-slate-900" dir="ltr">m = f′(x₁)</span></div>
                <div className="rounded-xl bg-white p-3"><span className="block text-[11px] font-bold text-slate-400">נקודת ההשקה</span><span className="mt-1 block font-serif text-lg text-slate-900" dir="ltr">(x₁, y₁)</span></div>
                <div className="rounded-xl bg-indigo-50 p-3"><span className="block text-[11px] font-bold text-indigo-700">מציבים בנוסחה</span><span className="mt-1 block font-serif text-lg font-bold text-indigo-950" dir="ltr">y − y₁ = m(x − x₁)</span></div>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center border-t border-slate-100 bg-[#f7f8f2] p-6 sm:p-9 lg:border-r lg:border-t-0">
            <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-800"><Lightbulb size={21} /></div>
            <h3 className="text-lg font-extrabold text-slate-900">מה מתרגלים?</h3>
            <ol className="mt-4 space-y-3">
              <li className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"><span className="flex size-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-extrabold text-indigo-900">1</span><span className="text-xs font-medium text-slate-700">משיק בנקודה, לפי שיפוע נתון, או במקביל לישר אחר.</span></li>
              <li className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"><span className="flex size-7 items-center justify-center rounded-full bg-lime-100 text-xs font-extrabold text-lime-900">2</span><span className="text-xs font-medium text-slate-700">משיקים אופקיים, חיתוך עם צירים ומפגש בין שני משיקים.</span></li>
              <li className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"><span className="flex size-7 items-center justify-center rounded-full bg-orange-100 text-xs font-extrabold text-orange-900">3</span><span className="text-xs font-medium text-slate-700">בכמה תרגילים מופיע גרף של הפונקציה והישרים הרלוונטיים.</span></li>
            </ol>
            <p className="mt-4 text-xs leading-5 text-slate-500">שמונה תרגילים בשני שלבים: גזירת הפונקציה, ואז מציאת ערכי נקודת ההשקה והשיפוע. ללא שעון.</p>
            <button type="button" onClick={() => setPhase('practice')} className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-lime-300 px-5 py-3 text-sm font-extrabold text-slate-900 transition hover:bg-lime-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-600">מתחילים לתרגל <ArrowLeft size={17} /></button>
          </div>
        </div>
      </section>
    );
  }

  if (phase === 'complete') {
    return (
      <section className="mx-auto max-w-3xl overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm" dir="rtl">
        <ExerciseMap subchapterTitle="משוואת המשיק לגרף פונקציה ותכונותיו" exercises={exercises} completedIds={completedIds} currentIndex={exerciseIndex} onSelect={selectExercise} />
        <div className="bg-[#202447] px-6 py-10 text-center text-white sm:px-12">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-lime-300 text-slate-900"><Trophy size={30} /></div>
          <p className="mt-5 text-xs font-bold tracking-widest text-lime-200">תת־הפרק הושלם</p>
          <h2 className="mt-2 text-3xl font-extrabold">מצאתם משוואות משיקים!</h2>
          <p className="mt-2 text-sm text-slate-300">תרגלתם משיקים בנקודה, ישרים מקבילים ונקודות מפגש.</p>
        </div>
        <div className="grid gap-3 p-6 sm:grid-cols-2 sm:p-8">
          <div className="rounded-2xl bg-lime-50 p-4 text-center"><Trophy className="mx-auto text-lime-700" size={20} /><p className="mt-2 text-2xl font-extrabold text-slate-900">{score}</p><p className="text-xs text-slate-500">נקודות שצברתם</p></div>
          <div className="rounded-2xl bg-indigo-50 p-4 text-center"><CheckCircle2 className="mx-auto text-indigo-600" size={20} /><p className="mt-2 text-2xl font-extrabold text-slate-900">{completedCount}/{exercises.length}</p><p className="text-xs text-slate-500">תרגילים הושלמו</p></div>
        </div>
        <div className="px-6 pb-7 text-center"><button type="button" onClick={restartLesson} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"><RotateCcw size={15} /> מתרגלים שוב</button></div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm" dir="rtl">
      <ExerciseMap subchapterTitle="משוואת המשיק לגרף פונקציה ותכונותיו" exercises={exercises} completedIds={completedIds} currentIndex={exerciseIndex} onSelect={selectExercise} />
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-[#fbfcfa] px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1.5 text-xs font-bold text-indigo-900"><Sparkles size={13} /> תרגיל {exerciseIndex + 1} מתוך {exercises.length}</span><span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500">פולינומים</span></div>
        <div className="text-xs font-bold text-slate-600">{score} נק׳</div>
      </div>
      <div className="h-1.5 bg-slate-100"><div className="h-full rounded-l-full bg-indigo-400 transition-all duration-500" style={{ width: `${(completedCount / exercises.length) * 100}%` }} /></div>

      <div className="p-5 sm:p-8">
        <div className={exercise.graph ? 'grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(220px,300px)] md:items-start' : ''}>
          <div className="min-w-0">
        <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-500"><span className="flex size-7 items-center justify-center rounded-lg bg-indigo-50 font-mono text-indigo-700" dir="ltr">{String(exerciseIndex + 1).padStart(2, '0')}</span>{exercise.title}</div>
          <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">{exercise.prompt}</h2>
        <div className="mt-4 flex min-h-20 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-[#fbfcfa] px-4 py-5 text-3xl text-slate-900" dir="ltr"><span className="font-serif italic">y =</span><MathExpressionPreview source={exercise.functionExpression} /></div>
          </div>
          {exercise.graph && <div className="flex justify-start"><TangentGraph exercise={exercise} /></div>}
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-extrabold text-white">1</span>
            <div><h3 className="text-sm font-extrabold text-slate-800">שלב 1 · מצאו את הנגזרת</h3><p className="mt-0.5 text-xs text-slate-500">כתבו את הנגזרת של הפונקציה כדי להמשיך לתרגיל.</p></div>
          </div>
          <label htmlFor="tangent-equation-derivative" className="sr-only">הנגזרת של הפונקציה</label>
          <div className={`flex items-center gap-3 rounded-xl border bg-white px-4 py-3 ${derivativeIsCorrect ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-100'}`} dir="ltr">
            <span className="shrink-0 font-serif text-lg font-semibold text-slate-700">y′ =</span>
            <input id="tangent-equation-derivative" type="text" value={derivativeAnswer} onChange={(event) => { setDerivativeAnswer(event.target.value); setDerivativeResult(null); }} onKeyDown={(event) => { if (event.key === 'Enter' && !derivativeIsCorrect) checkDerivative(); }} disabled={derivativeIsCorrect} spellCheck={false} autoComplete="off" aria-invalid={Boolean(derivativeResult && derivativeResult.status !== 'correct' && derivativeResult.status !== 'empty')} className="min-w-0 flex-1 bg-transparent font-mono text-lg font-bold text-slate-900 outline-none placeholder:text-sm placeholder:text-slate-400 disabled:opacity-70" placeholder="כתבו כאן את הנגזרת" />
            {derivativeIsCorrect && <Check size={18} className="text-emerald-700" aria-label="נגזרת נכונה" />}
          </div>
          {!derivativeIsCorrect && <p className="mt-2 text-[11px] text-slate-500">אפשר לכתוב חזקות בעזרת ^ וכפל בעזרת *, למשל 2*x − 4.</p>}
          {!derivativeIsCorrect && <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            {derivativeResult && derivativeResult.status !== 'correct' && <p role="status" className="text-xs font-semibold text-amber-800">{derivativeResult.status === 'empty' ? 'כתבו את הנגזרת כדי לפתוח את שלב 2.' : derivativeResult.status === 'invalid' ? 'לא הצלחנו לקרוא את הביטוי. בדקו את הכתיבה ונסו שוב.' : 'כמעט — בדקו שוב את כללי הגזירה.'}</p>}
            <button type="button" onClick={checkDerivative} disabled={!derivativeAnswer.trim()} className="mr-auto inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-45">בדיקת הנגזרת <Check size={16} /></button>
          </div>}
        </div>

        {derivativeIsCorrect && <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-extrabold text-white">2</span>
            <div><h3 className="text-sm font-extrabold text-slate-800">שלב 2 · מצאו את נקודת ההשקה ואת השיפוע</h3><p className="mt-0.5 text-xs text-slate-600">הנגזרת שמצאתם זמינה כאן. הציבו בה את x₁ כדי למצוא m.</p></div>
          </div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 font-serif text-base font-bold text-emerald-900" dir="ltr"><span>y′ =</span><MathExpressionPreview source={derivativeAnswer} /></div>
          <p className="mb-3 text-xs text-slate-600">השלימו את x₁ ואת y₁ של נקודת ההשקה ואת השיפוע m. אפשר לכתוב שבר, מספר עשרוני או ביטוי עם sqrt, למשל sqrt(3). לאחר שהתשובות נכונות, משוואת המשיק תוצג לפי הנוסחה <span dir="ltr">y − y₁ = m(x − x₁)</span>.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {answerItems.map((item) => {
              const result = results[item.id];
              return <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <label htmlFor={`answer-${item.id}`} className="mb-2 block text-xs font-bold text-slate-700">{item.label}</label>
                <div className={`flex items-center gap-2 rounded-lg border bg-white px-3 py-2 ${result === 'correct' ? 'border-emerald-300' : result && result !== 'empty' ? 'border-amber-300' : 'border-slate-200'}`} dir="ltr">
                  <input id={`answer-${item.id}`} type="text" inputMode="decimal" value={answers[item.id] ?? ''} onChange={(event) => updateAnswer(item.id, event.target.value)} disabled={isExerciseComplete} aria-invalid={Boolean(result && result !== 'correct' && result !== 'empty')} className="min-w-0 flex-1 bg-transparent text-center font-mono text-lg font-bold outline-none disabled:opacity-70" placeholder="?" />
                  {result === 'correct' && <Check size={17} className="text-emerald-700" aria-label="תשובה נכונה" />}
                </div>
                {result && result !== 'empty' && <p role="status" className={`mt-1 text-center text-[11px] font-semibold ${result === 'correct' ? 'text-emerald-700' : 'text-amber-700'}`}>{answerFeedback(result)}</p>}
              </div>;
            })}
          </div>
          {exercise.lines.map((line) => {
            const xAnswer = answers[`${line.id}-x`] ?? '';
            const yAnswer = answers[`${line.id}-y`] ?? '';
            const slopeAnswer = answers[`${line.id}-slope`] ?? '';
            const equationReady = validateAnswer(xAnswer, line.x) === 'correct'
              && validateAnswer(yAnswer, line.y) === 'correct'
              && validateAnswer(slopeAnswer, line.slope) === 'correct';
            if (!equationReady) return null;
            return <div key={`equation-${line.id}`} className="mt-3 rounded-xl border border-emerald-200 bg-white px-4 py-3">
              <p className="text-[11px] font-bold text-emerald-800">{line.label} · מציבים בנוסחה:</p>
              <p className="mt-1 text-center font-serif text-xl font-bold text-slate-900" dir="ltr">y − ({yAnswer}) = ({slopeAnswer})(x − ({xAnswer}))</p>
            </div>;
          })}
        </div>}

        {hintVisible && <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-950"><strong>רמז:</strong> {exercise.hint}</p>}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={() => setHintVisible((visible) => !visible)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"><Lightbulb size={15} />{hintVisible ? 'הסתרת הרמז' : 'רמז'}</button>
          {isExerciseComplete ? <button type="button" onClick={goToNextExercise} className="inline-flex items-center gap-2 rounded-lg bg-lime-300 px-4 py-2.5 text-sm font-extrabold text-slate-900 transition hover:bg-lime-400">{exerciseIndex === exercises.length - 1 ? 'סיום תת־הפרק' : 'לתרגיל הבא'} <ArrowLeft size={16} /></button> : <button type="button" onClick={checkAnswers} className="mr-auto inline-flex items-center gap-2 rounded-lg bg-lime-300 px-4 py-2.5 text-sm font-extrabold text-slate-900 transition hover:bg-lime-400">בדיקת תשובות <Check size={16} /></button>}
        </div>
      </div>
    </section>
  );
}