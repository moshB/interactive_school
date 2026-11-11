import { useMemo, useRef, useState, type PointerEvent, type WheelEvent } from 'react';
import { Minus, MousePointer2, Move, Plus, RotateCcw, Sparkles, ZoomIn } from 'lucide-react';
import MathKeyboard from './MathKeyboard';
import { useMathInput } from '../hooks/useMathInput';
import { compileFunctionExpression } from '../modules/math/domain';

type Viewport = { xMin: number; xMax: number; yMin: number; yMax: number };
type TracePoint = { x: number; y: number; screenX: number; screenY: number };
type DragState = { pointerX: number; pointerY: number; viewport: Viewport };

const WIDTH = 900;
const HEIGHT = 520;
const INITIAL_VIEW: Viewport = { xMin: -10, xMax: 10, yMin: -6, yMax: 6 };

function tickStep(range: number, pixels: number) {
  const target = (range * 72) / pixels;
  const magnitude = 10 ** Math.floor(Math.log10(target));
  const normalized = target / magnitude;
  return (normalized < 1.5 ? 1 : normalized < 3.5 ? 2 : normalized < 7.5 ? 5 : 10) * magnitude;
}

function ticks(min: number, max: number, step: number) {
  const first = Math.ceil(min / step) * step;
  const result: number[] = [];
  for (let value = first; value <= max + step * 0.0001 && result.length < 180; value += step) {
    result.push(Number(value.toPrecision(8)));
  }
  return result;
}

function displayNumber(value: number) {
  if (Math.abs(value) < 0.0001) return '0';
  return Number(value.toPrecision(4)).toString();
}

export default function GraphingCalculator() {
  const mathInput = useMathInput('x^2/4 - 2');
  const [viewport, setViewport] = useState(INITIAL_VIEW);
  const [traceX, setTraceX] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<DragState | null>(null);

  const compilation = useMemo(() => compileFunctionExpression(mathInput.value), [mathInput.value]);
  const compiled = compilation.ok ? compilation.evaluator : null;

  const evaluateAt = (x: number): number | null => {
    if (!compiled) return null;
    const result = compiled.evaluate(x);
    return result.ok ? result.value : null;
  };

  const graphPath = useMemo(() => {
    if (!compiled) return '';
    const segments: string[] = [];
    const samples = 1000;
    let drawing = false;
    let previousY: number | null = null;

    for (let index = 0; index <= samples; index += 1) {
      const x = viewport.xMin + (index / samples) * (viewport.xMax - viewport.xMin);
      const y = evaluateAt(x);
      const screenX = ((x - viewport.xMin) / (viewport.xMax - viewport.xMin)) * WIDTH;
      const screenY = y === null ? Number.NaN : ((viewport.yMax - y) / (viewport.yMax - viewport.yMin)) * HEIGHT;
      const visible = y !== null && screenY > -HEIGHT * 2 && screenY < HEIGHT * 3;
      const discontinuity = previousY !== null && Math.abs(screenY - previousY) > 85;

      if (!visible || discontinuity) {
        drawing = false;
      }
      if (visible) {
        segments.push(`${drawing ? 'L' : 'M'}${screenX.toFixed(2)},${screenY.toFixed(2)}`);
        drawing = true;
      }
      previousY = visible ? screenY : null;
    }
    return segments.join(' ');
  }, [compiled, mathInput.value, viewport]);

  const intercepts = useMemo(() => {
    if (!compiled) return [];
    const roots: number[] = [];
    const yIntercept = evaluateAt(0);
    if (yIntercept !== null) roots.push(0);

    const samples = 600;
    let previousX = viewport.xMin;
    let previousY = evaluateAt(previousX);
    for (let index = 1; index <= samples; index += 1) {
      const currentX = viewport.xMin + (index / samples) * (viewport.xMax - viewport.xMin);
      const currentY = evaluateAt(currentX);

      if (currentY === 0) {
        roots.push(currentX);
      } else if (previousY !== null && currentY !== null && previousY * currentY < 0) {
        let left = previousX;
        let right = currentX;
        let leftY = previousY;
        let validBracket = true;
        for (let iteration = 0; iteration < 40; iteration += 1) {
          const middle = (left + right) / 2;
          const middleY = evaluateAt(middle);
          if (middleY === null) {
            validBracket = false;
            break;
          }
          if (Math.abs(middleY) < 1e-10) {
            left = middle;
            right = middle;
            break;
          }
          if (leftY * middleY <= 0) right = middle;
          else {
            left = middle;
            leftY = middleY;
          }
        }
        const root = (left + right) / 2;
        const rootY = evaluateAt(root);
        if (validBracket && rootY !== null && Math.abs(rootY) < 1e-5) roots.push(root);
      }

      previousX = currentX;
      previousY = currentY;
    }

    const uniqueRoots = roots
      .filter((root, index) => roots.findIndex((candidate) => Math.abs(candidate - root) < 1e-4) === index)
      .filter((root) => root >= viewport.xMin && root <= viewport.xMax);
    return [
      ...uniqueRoots.map((x) => ({
        kind: 'x' as const,
        x,
        y: 0,
        screenX: ((x - viewport.xMin) / (viewport.xMax - viewport.xMin)) * WIDTH,
        screenY: ((viewport.yMax - 0) / (viewport.yMax - viewport.yMin)) * HEIGHT,
      })),
      ...(yIntercept !== null && yIntercept >= viewport.yMin && yIntercept <= viewport.yMax
        ? [{ kind: 'y' as const, x: 0, y: yIntercept, screenX: ((0 - viewport.xMin) / (viewport.xMax - viewport.xMin)) * WIDTH, screenY: ((viewport.yMax - yIntercept) / (viewport.yMax - viewport.yMin)) * HEIGHT }]
        : []),
    ];
  }, [compiled, mathInput.value, viewport]);

  const xTicks = useMemo(() => ticks(viewport.xMin, viewport.xMax, tickStep(viewport.xMax - viewport.xMin, WIDTH)), [viewport]);
  const yTicks = useMemo(() => ticks(viewport.yMin, viewport.yMax, tickStep(viewport.yMax - viewport.yMin, HEIGHT)), [viewport]);
  const axisX = ((0 - viewport.xMin) / (viewport.xMax - viewport.xMin)) * WIDTH;
  const axisY = ((viewport.yMax - 0) / (viewport.yMax - viewport.yMin)) * HEIGHT;
  const tracePoint: TracePoint | null = traceX === null ? null : (() => {
    const y = evaluateAt(traceX);
    if (y === null) return null;
    return {
      x: traceX,
      y,
      screenX: ((traceX - viewport.xMin) / (viewport.xMax - viewport.xMin)) * WIDTH,
      screenY: ((viewport.yMax - y) / (viewport.yMax - viewport.yMin)) * HEIGHT,
    };
  })();

  const setZoom = (factor: number) => {
    setViewport((current) => {
      const centerX = (current.xMin + current.xMax) / 2;
      const centerY = (current.yMin + current.yMax) / 2;
      const halfWidth = ((current.xMax - current.xMin) / 2) * factor;
      const halfHeight = ((current.yMax - current.yMin) / 2) * factor;
      return { xMin: centerX - halfWidth, xMax: centerX + halfWidth, yMin: centerY - halfHeight, yMax: centerY + halfHeight };
    });
  };

  const getSvgPoint = (event: PointerEvent<SVGSVGElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - bounds.left) / bounds.width) * WIDTH,
      y: ((event.clientY - bounds.top) / bounds.height) * HEIGHT,
    };
  };

  const handlePointerDown = (event: PointerEvent<SVGSVGElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = getSvgPoint(event);
    dragRef.current = { pointerX: point.x, pointerY: point.y, viewport };
    setDragging(true);
  };

  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    const point = getSvgPoint(event);
    const drag = dragRef.current;
    if (drag) {
      const dx = ((point.x - drag.pointerX) / WIDTH) * (drag.viewport.xMax - drag.viewport.xMin);
      const dy = ((point.y - drag.pointerY) / HEIGHT) * (drag.viewport.yMax - drag.viewport.yMin);
      setViewport({
        xMin: drag.viewport.xMin - dx,
        xMax: drag.viewport.xMax - dx,
        yMin: drag.viewport.yMin + dy,
        yMax: drag.viewport.yMax + dy,
      });
      return;
    }
    setTraceX(viewport.xMin + (point.x / WIDTH) * (viewport.xMax - viewport.xMin));
  };

  const stopDragging = (event: PointerEvent<SVGSVGElement>) => {
    dragRef.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handleWheel = (event: WheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    setZoom(event.deltaY < 0 ? 0.85 : 1.18);
  };

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_24px_70px_-45px_rgba(15,23,42,0.35)]" aria-labelledby="calculator-title" dir="rtl">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-7">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><ZoomIn size={21} aria-hidden="true" /></div>
          <div>
            <h2 id="calculator-title" className="text-lg font-extrabold text-slate-900">מחשבון גרפי</h2>
            <p className="mt-0.5 text-xs text-slate-500">מקלידים, חוקרים ורואים איך הפונקציה מתנהגת</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          עדכון בזמן אמת
        </div>
      </header>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-100/70 sm:max-w-[480px]">
              <span className="shrink-0 text-sm font-bold text-indigo-700" dir="ltr">f(x) =</span>
              <input
                ref={mathInput.inputRef}
                value={mathInput.value}
                onChange={mathInput.handleChange}
                onSelect={mathInput.rememberSelection}
                onFocus={mathInput.rememberSelection}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') event.currentTarget.blur();
                }}
                aria-label="ביטוי הפונקציה"
                dir="ltr"
                spellCheck={false}
                className="min-w-0 flex-1 bg-transparent text-left font-mono text-base font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="לדוגמה: x^2 - 3*x + 1"
              />
            </div>
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1" aria-label="כלי תצוגה">
              <button type="button" className="icon-button" onClick={() => setZoom(0.8)} aria-label="הגדלה"><Plus size={17} /></button>
              <button type="button" className="icon-button" onClick={() => setZoom(1.25)} aria-label="הקטנה"><Minus size={17} /></button>
              <span className="mx-1 h-5 w-px bg-slate-200" />
              <button type="button" className="icon-button" onClick={() => { setViewport(INITIAL_VIEW); setTraceX(null); }} aria-label="איפוס מערכת הצירים"><RotateCcw size={16} /></button>
            </div>
          </div>

          {!compilation.ok && compilation.reason !== 'empty-expression' && (
            <div role="alert" className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
              לא הצלחנו לקרוא את הביטוי. אפשר להשתמש ב־x, בסוגריים, בפעולות חשבון ובפונקציות כמו sqrt(x), sin(x), cos(x).
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-[#fbfcff]">
            <div className="flex items-center justify-between border-b border-slate-100 bg-white/80 px-3 py-2.5 text-[11px] text-slate-500 sm:px-4">
              <div className="flex items-center gap-1.5"><Move size={13} /><span>גרירה להזזת הצירים</span><span className="mx-1 text-slate-300">·</span><MousePointer2 size={12} /><span>הצבעה למעקב</span></div>
              <span dir="ltr">x: {displayNumber(viewport.xMin)} … {displayNumber(viewport.xMax)}</span>
            </div>
            <svg
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              role="application"
              aria-label={`גרף הפונקציה f של x שווה ${mathInput.value}`}
              className={`block h-auto w-full touch-none select-none ${dragging ? 'cursor-grabbing' : 'cursor-crosshair'}`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={stopDragging}
              onPointerCancel={stopDragging}
              onPointerLeave={() => { if (!dragRef.current) setTraceX(null); }}
              onWheel={handleWheel}
            >
              <defs><clipPath id="graph-area"><rect width={WIDTH} height={HEIGHT} /></clipPath></defs>
              <rect width={WIDTH} height={HEIGHT} fill="#fbfcff" />
              {xTicks.map((tick) => {
                const x = ((tick - viewport.xMin) / (viewport.xMax - viewport.xMin)) * WIDTH;
                return <g key={`x-${tick}`}><line x1={x} y1="0" x2={x} y2={HEIGHT} stroke="#e8edf5" strokeWidth="1" /><text x={x} y={Math.min(Math.max(axisY + 22, 18), HEIGHT - 8)} textAnchor="middle" className="graph-label">{displayNumber(tick)}</text></g>;
              })}
              {yTicks.map((tick) => {
                const y = ((viewport.yMax - tick) / (viewport.yMax - viewport.yMin)) * HEIGHT;
                return <g key={`y-${tick}`}><line x1="0" y1={y} x2={WIDTH} y2={y} stroke="#e8edf5" strokeWidth="1" /><text x={Math.min(Math.max(axisX - 10, 30), WIDTH - 10)} y={y - 7} textAnchor="end" className="graph-label">{displayNumber(tick)}</text></g>;
              })}
              {axisY >= 0 && axisY <= HEIGHT && <line x1="0" y1={axisY} x2={WIDTH} y2={axisY} stroke="#52647e" strokeWidth="2" />}
              {axisX >= 0 && axisX <= WIDTH && <line x1={axisX} y1="0" x2={axisX} y2={HEIGHT} stroke="#52647e" strokeWidth="2" />}
              {axisY >= 0 && axisY <= HEIGHT && <text x={WIDTH - 14} y={Math.max(20, axisY - 12)} textAnchor="end" className="graph-axis-label">x</text>}
              {axisX >= 0 && axisX <= WIDTH && <text x={axisX + 13} y={18} textAnchor="start" className="graph-axis-label">y</text>}
              <g clipPath="url(#graph-area)" pointerEvents="none">
                {graphPath && <path d={graphPath} fill="none" stroke="#6558e8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />}
                {intercepts.map((point) => <circle key={`${point.kind}-${point.x}`} cx={point.screenX} cy={point.screenY} r="5.5" fill="#fbfcff" stroke="#0d9b8a" strokeWidth="3" />)}
                {tracePoint && <><line x1={tracePoint.screenX} y1="0" x2={tracePoint.screenX} y2={HEIGHT} stroke="#8a80f2" strokeWidth="1.5" strokeDasharray="5 6" /><circle cx={tracePoint.screenX} cy={tracePoint.screenY} r="7" fill="white" stroke="#6558e8" strokeWidth="3" /></>}
              </g>
            </svg>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-2"><span className="h-0.5 w-4 rounded-full bg-indigo-500" />f(x)</span>
            <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-full border-2 border-teal-600 bg-white" />חיתוכים עם הצירים</span>
            {intercepts.filter((point) => point.kind === 'x').length > 0 && <span dir="ltr">x-intercepts: {intercepts.filter((point) => point.kind === 'x').slice(0, 4).map((point) => displayNumber(point.x)).join(', ')}</span>}
            {intercepts.some((point) => point.kind === 'y') && <span dir="ltr">y-intercept: {displayNumber(intercepts.find((point) => point.kind === 'y')!.y)}</span>}
          </div>
          {tracePoint ? (
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-slate-600" dir="ltr">
              <span>x = {displayNumber(tracePoint.x)}</span><span>f(x) = {displayNumber(tracePoint.y)}</span>
              <span className="text-slate-400">גררו את הסמן על הגרף כדי לעקוב</span>
            </div>
          ) : (
            <p className="mt-3 text-xs text-slate-400">טיפ: השתמשו בגלגלת העכבר לשינוי קנה המידה, או בכפתורים למעלה.</p>
          )}
        </div>

        <aside className="border-t border-slate-100 bg-slate-50/70 p-5 sm:p-6 lg:border-r lg:border-t-0" aria-label="מקלדת מתמטית וכלים">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><Sparkles size={17} aria-hidden="true" /></div>
            <div><h3 className="font-bold text-slate-900">בונים פונקציה</h3><p className="mt-1 text-xs leading-5 text-slate-500">הקלידו או הוסיפו סימנים מהמקלדת</p></div>
          </div>
          <MathKeyboard onInsert={mathInput.insertToken} />
          <div className="mt-6 rounded-2xl border border-indigo-100 bg-white p-4">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800"><span className="size-2 rounded-full bg-indigo-500" />דוגמאות לניסוי</h4>
            <div className="flex flex-wrap gap-2" dir="ltr">
              {['x^2', 'sin(x)', 'sqrt(x)', '1/x'].map((example) => (
                <button key={example} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => mathInput.setValue(example)} className="rounded-lg bg-slate-100 px-2.5 py-1.5 font-mono text-xs text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700">{example}</button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
