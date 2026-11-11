import { useMemo, useRef, useState, type PointerEvent, type WheelEvent } from 'react';
import { compileFunctionExpression } from '../domain/functionExpression';
import { findFunctionIntercepts, findLocalExtrema, type FunctionExtremum, type GraphBounds } from '../domain/graphAnalysis';
import { Eye, EyeOff, Focus, Minus, Plus, RotateCcw, Trash2 } from 'lucide-react';
import MathExpressionPreview from './MathExpressionPreview';
import MathKeyboard, { type MathToken } from '../input/MathKeyboard';

type Viewport = GraphBounds;
type TracePoint = { x: number; y: number; screenX: number; screenY: number; color: string; label: string };
type DragState = { pointerX: number; pointerY: number; viewport: Viewport };
type GraphExpression = { id: string; source: string; color: string; visible: boolean; showExtrema: boolean };

const WIDTH = 900;
const HEIGHT = 560;
const INITIAL_VIEW: Viewport = { xMin: -10, xMax: 10, yMin: -6, yMax: 6 };
const COLORS = ['#6558e8', '#e87945', '#0d9b8a', '#cf4d7d', '#2d83c5', '#a16bc3', '#87952f'];
const initialExpression: GraphExpression = { id: 'function-1', source: 'x^2/4 - 2', color: COLORS[0], visible: true, showExtrema: false };

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

function mapPoint(x: number, y: number, viewport: Viewport) {
  return {
    screenX: ((x - viewport.xMin) / (viewport.xMax - viewport.xMin)) * WIDTH,
    screenY: ((viewport.yMax - y) / (viewport.yMax - viewport.yMin)) * HEIGHT,
  };
}

export default function GraphingCalculator() {
  const [expressions, setExpressions] = useState<GraphExpression[]>([initialExpression]);
  const [activeId, setActiveId] = useState(initialExpression.id);
  const [viewport, setViewport] = useState(INITIAL_VIEW);
  const [traceX, setTraceX] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<DragState | null>(null);
  const inputRefs = useRef(new Map<string, HTMLInputElement>());
  const selectionRefs = useRef(new Map<string, { start: number; end: number }>());
  const nextId = useRef(2);

  const graphs = useMemo(() => expressions.map((expression) => {
    const compilation = compileFunctionExpression(expression.source);
    const evaluator = compilation.ok ? compilation.evaluator : null;
    const evaluate = (x: number): number | null => {
      if (!evaluator) return null;
      const result = evaluator.evaluate(x);
      return result.ok ? result.value : null;
    };
    let path = '';
    if (evaluator && expression.visible) {
      const segments: string[] = [];
      const samples = 1200;
      let drawing = false;
      let previousY: number | null = null;
      for (let index = 0; index <= samples; index += 1) {
        const x = viewport.xMin + (index / samples) * (viewport.xMax - viewport.xMin);
        const y = evaluate(x);
        const { screenX, screenY } = y === null ? { screenX: 0, screenY: Number.NaN } : mapPoint(x, y, viewport);
        const visible = y !== null && screenY > -HEIGHT * 1.5 && screenY < HEIGHT * 2.5;
        const discontinuity = previousY !== null && Math.abs(screenY - previousY) > 85;
        if (!visible || discontinuity) drawing = false;
        if (visible) {
          segments.push(`${drawing ? 'L' : 'M'}${screenX.toFixed(2)},${screenY.toFixed(2)}`);
          drawing = true;
        }
        previousY = visible ? screenY : null;
      }
      path = segments.join(' ');
    }
    return {
      expression,
      compilation,
      evaluator,
      evaluate,
      path,
      intercepts: expression.visible && evaluator ? findFunctionIntercepts(evaluator, viewport) : [],
      extrema: expression.visible && expression.showExtrema && evaluator ? findLocalExtrema(evaluator, viewport) : [],
    };
  }), [expressions, viewport]);

  const xTicks = useMemo(() => ticks(viewport.xMin, viewport.xMax, tickStep(viewport.xMax - viewport.xMin, WIDTH)), [viewport]);
  const yTicks = useMemo(() => ticks(viewport.yMin, viewport.yMax, tickStep(viewport.yMax - viewport.yMin, HEIGHT)), [viewport]);
  const axisX = mapPoint(0, 0, viewport).screenX;
  const axisY = mapPoint(0, 0, viewport).screenY;
  const tracePoints: TracePoint[] = traceX === null ? [] : graphs.flatMap((graph, graphIndex) => {
    if (!graph.expression.visible) return [];
    const y = graph.evaluate(traceX);
    if (y === null || y < viewport.yMin || y > viewport.yMax) return [];
    return [{ x: traceX, y, ...mapPoint(traceX, y, viewport), color: graph.expression.color, label: `f${graphIndex + 1}` }];
  });

  const updateExpression = (id: string, update: Partial<GraphExpression>) => {
    setExpressions((current) => current.map((item) => item.id === id ? { ...item, ...update } : item));
  };

  const addExpression = () => {
    const id = `function-${nextId.current++}`;
    setExpressions((current) => [...current, { id, source: '', color: COLORS[(current.length) % COLORS.length], visible: true, showExtrema: false }]);
    setActiveId(id);
    requestAnimationFrame(() => inputRefs.current.get(id)?.focus());
  };

  const removeExpression = (id: string) => {
    setExpressions((current) => {
      if (current.length === 1) return [{ ...current[0], source: '', visible: true, showExtrema: false }];
      const next = current.filter((item) => item.id !== id);
      if (activeId === id) setActiveId(next[0].id);
      return next;
    });
    inputRefs.current.delete(id);
    selectionRefs.current.delete(id);
  };

  const insertToken = (token: MathToken) => {
    const input = inputRefs.current.get(activeId);
    const expression = expressions.find((item) => item.id === activeId);
    if (!expression) return;
    let start = input?.selectionStart ?? selectionRefs.current.get(activeId)?.start ?? expression.source.length;
    const end = input?.selectionEnd ?? selectionRefs.current.get(activeId)?.end ?? start;
    if (token.action === 'backspace') {
      if (start === end && start > 0) start -= 1;
      if (start === end) return;
    }
    const value = token.action === 'backspace' ? '' : token.value;
    const nextSource = `${expression.source.slice(0, start)}${value}${expression.source.slice(end)}`;
    const nextCursor = start + (token.cursorOffset ?? value.length);
    updateExpression(activeId, { source: nextSource });
    selectionRefs.current.set(activeId, { start: nextCursor, end: nextCursor });
    input?.focus();
    requestAnimationFrame(() => input?.setSelectionRange(nextCursor, nextCursor));
  };

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
    return { x: ((event.clientX - bounds.left) / bounds.width) * WIDTH, y: ((event.clientY - bounds.top) / bounds.height) * HEIGHT };
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
      setViewport({ xMin: drag.viewport.xMin - dx, xMax: drag.viewport.xMax - dx, yMin: drag.viewport.yMin + dy, yMax: drag.viewport.yMax + dy });
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
    <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_22px_65px_-42px_rgba(15,23,42,0.32)]" aria-labelledby="calculator-title" dir="rtl">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
        <div><h2 id="calculator-title" className="text-base font-extrabold text-slate-900">מחשבון גרפי</h2><p className="mt-0.5 text-xs text-slate-500">ביטויים, גרפים וחקירה באותו מקום</p></div>
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1" aria-label="כלי תצוגה">
          <button type="button" className="graph-toolbar-button" onClick={() => setZoom(0.8)} aria-label="הגדלה"><Plus size={16} /></button>
          <button type="button" className="graph-toolbar-button" onClick={() => setZoom(1.25)} aria-label="הקטנה"><Minus size={16} /></button>
          <button type="button" className="graph-toolbar-button" onClick={() => { setViewport(INITIAL_VIEW); setTraceX(null); }} aria-label="איפוס תצוגה"><RotateCcw size={15} /></button>
        </div>
      </header>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 p-3 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-2 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1.5"><Focus size={13} /> גררו להזזה · גלגלת להגדלה · הצביעו למעקב</span>
            <span dir="ltr">x: {displayNumber(viewport.xMin)} … {displayNumber(viewport.xMax)}</span>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <svg
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              role="application"
              aria-label="מערכת צירים אינטראקטיבית של הפונקציות"
              className={`block h-auto w-full touch-none select-none ${dragging ? 'cursor-grabbing' : 'cursor-crosshair'}`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={stopDragging}
              onPointerCancel={stopDragging}
              onPointerLeave={() => { if (!dragRef.current) setTraceX(null); }}
              onWheel={handleWheel}
            >
              <defs><clipPath id="calculator-graph-area"><rect width={WIDTH} height={HEIGHT} /></clipPath></defs>
              <rect width={WIDTH} height={HEIGHT} fill="#fff" />
              {xTicks.map((tick) => {
                const x = mapPoint(tick, 0, viewport).screenX;
                return <g key={`x-${tick}`}><line x1={x} y1="0" x2={x} y2={HEIGHT} stroke="#e9edf3" strokeWidth="1" /><text x={x} y={Math.min(Math.max(axisY + 20, 17), HEIGHT - 8)} textAnchor="middle" className="graph-label">{displayNumber(tick)}</text></g>;
              })}
              {yTicks.map((tick) => {
                const y = mapPoint(0, tick, viewport).screenY;
                return <g key={`y-${tick}`}><line x1="0" y1={y} x2={WIDTH} y2={y} stroke="#e9edf3" strokeWidth="1" /><text x={Math.min(Math.max(axisX - 10, 28), WIDTH - 10)} y={y - 7} textAnchor="end" className="graph-label">{displayNumber(tick)}</text></g>;
              })}
              {axisY >= 0 && axisY <= HEIGHT && <line x1="0" y1={axisY} x2={WIDTH} y2={axisY} stroke="#4b5563" strokeWidth="1.7" />}
              {axisX >= 0 && axisX <= WIDTH && <line x1={axisX} y1="0" x2={axisX} y2={HEIGHT} stroke="#4b5563" strokeWidth="1.7" />}
              {axisY >= 0 && axisY <= HEIGHT && <text x={WIDTH - 14} y={Math.max(19, axisY - 10)} textAnchor="end" className="graph-axis-label">x</text>}
              {axisX >= 0 && axisX <= WIDTH && <text x={axisX + 12} y={18} textAnchor="start" className="graph-axis-label">y</text>}
              <g clipPath="url(#calculator-graph-area)" pointerEvents="none">
                {graphs.map(({ expression, path, intercepts, extrema }) => expression.visible && <g key={`curve-${expression.id}`}>
                  {path && <path d={path} fill="none" stroke={expression.color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />}
                  {intercepts.map((point, index) => <circle key={`${expression.id}-intercept-${point.kind}-${index}`} cx={mapPoint(point.x, point.y, viewport).screenX} cy={mapPoint(point.x, point.y, viewport).screenY} r="4" fill="white" stroke={expression.color} strokeWidth="2.5" />)}
                  {extrema.map((point: FunctionExtremum) => <g key={`${expression.id}-extremum-${point.x}`}>
                    <circle cx={mapPoint(point.x, point.y, viewport).screenX} cy={mapPoint(point.x, point.y, viewport).screenY} r="6" fill="white" stroke={expression.color} strokeWidth="3" />
                    <text x={mapPoint(point.x, point.y, viewport).screenX + 9} y={mapPoint(point.x, point.y, viewport).screenY - 8} className="extremum-label">{point.kind === 'minimum' ? 'מינימום' : 'מקסימום'}</text>
                  </g>)}
                </g>)}
                {traceX !== null && <line x1={mapPoint(traceX, 0, viewport).screenX} y1="0" x2={mapPoint(traceX, 0, viewport).screenX} y2={HEIGHT} stroke="#64748b" strokeWidth="1" strokeDasharray="4 5" />}
                {tracePoints.map((point) => <circle key={`trace-${point.label}`} cx={point.screenX} cy={point.screenY} r="5.5" fill="white" stroke={point.color} strokeWidth="3" />)}
              </g>
            </svg>
          </div>

          {traceX !== null && <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600" dir="ltr">
            <span className="font-semibold">x = {displayNumber(traceX)}</span>
            {tracePoints.map((point) => <span key={`trace-value-${point.label}`} style={{ color: point.color }}>
              {point.label}(x) = {displayNumber(point.y)}
            </span>)}
          </div>}
          {graphs.some((graph) => graph.expression.showExtrema && graph.expression.visible) && <p className="mt-2 text-[11px] text-slate-400">נקודות קיצון מחושבות בקירוב מספרי בתחום התצוגה.</p>}
        </div>

        <aside className="border-t border-slate-200 bg-[#f7f8fa] p-3 sm:p-4 lg:border-r lg:border-t-0" aria-label="רשימת פונקציות ומקלדת מתמטית">
          <div className="mb-3 flex items-center justify-between px-1">
            <h3 className="text-xs font-bold tracking-wide text-slate-600">ביטויים</h3>
            <button type="button" onClick={addExpression} className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-bold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"><Plus size={14} /> הוסף גרף</button>
          </div>
          <div className="space-y-2.5">
            {graphs.map(({ expression, compilation, extrema }) => (
              <article key={expression.id} className={`expression-card ${activeId === expression.id ? 'is-selected' : ''}`} style={{ borderInlineStartColor: expression.color }} onClick={() => setActiveId(expression.id)}>
                <div className="flex items-center gap-2">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: expression.color }} aria-hidden="true" />
                  <label className="min-w-0 flex-1">
                    <span className="sr-only">ביטוי מספר {expressions.indexOf(expression) + 1}</span>
                    <span className="flex items-baseline gap-1.5" dir="ltr">
                      <span className="shrink-0 text-[11px] font-bold text-slate-500">f{expressions.indexOf(expression) + 1}(x) =</span>
                      <input
                        ref={(element) => { if (element) inputRefs.current.set(expression.id, element); else inputRefs.current.delete(expression.id); }}
                        value={expression.source}
                        onFocus={(event) => { setActiveId(expression.id); selectionRefs.current.set(expression.id, { start: event.currentTarget.selectionStart ?? 0, end: event.currentTarget.selectionEnd ?? 0 }); }}
                        onSelect={(event) => selectionRefs.current.set(expression.id, { start: event.currentTarget.selectionStart ?? 0, end: event.currentTarget.selectionEnd ?? 0 })}
                        onChange={(event) => updateExpression(expression.id, { source: event.target.value })}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') { event.preventDefault(); addExpression(); }
                          if (event.key === 'Escape') event.currentTarget.blur();
                        }}
                        dir="ltr"
                        spellCheck={false}
                        autoComplete="off"
                        className="min-w-0 flex-1 bg-transparent font-mono text-[13px] font-medium text-slate-800 outline-none placeholder:text-slate-400"
                        placeholder="הקלידו פונקציה"
                      />
                    </span>
                  </label>
                  <button type="button" onClick={(event) => { event.stopPropagation(); updateExpression(expression.id, { visible: !expression.visible }); }} className="expression-action" aria-label={expression.visible ? 'הסתרת גרף' : 'הצגת גרף'} title={expression.visible ? 'הסתרת גרף' : 'הצגת גרף'}>{expression.visible ? <Eye size={15} /> : <EyeOff size={15} />}</button>
                  <button type="button" onClick={(event) => { event.stopPropagation(); updateExpression(expression.id, { showExtrema: !expression.showExtrema }); }} className={`expression-action ${expression.showExtrema ? 'is-on' : ''}`} aria-label={expression.showExtrema ? 'כיבוי סימון נקודות קיצון' : 'סימון נקודות קיצון'} aria-pressed={expression.showExtrema} title="נקודות קיצון"><Focus size={15} /></button>
                  <button type="button" onClick={(event) => { event.stopPropagation(); removeExpression(expression.id); }} className="expression-action expression-remove" aria-label="מחיקת פונקציה" title="מחיקת פונקציה"><Trash2 size={15} /></button>
                </div>
                <div className="expression-preview" dir="ltr"><span className="mr-1 text-[10px] font-semibold text-slate-400">y =</span><MathExpressionPreview source={expression.source} /></div>
                {!compilation.ok && compilation.reason !== 'empty-expression' && <p className="mt-1 text-[10px] text-amber-700">בדקו את הביטוי</p>}
                {expression.showExtrema && extrema.length > 0 && <p className="mt-1 text-[10px] text-slate-500" dir="ltr">{extrema.slice(0, 3).map((point) => `${point.kind === 'minimum' ? 'min' : 'max'} (${displayNumber(point.x)}, ${displayNumber(point.y)})`).join(' · ')}</p>}
              </article>
            ))}
          </div>
          <div className="my-4 border-t border-slate-200" />
          <div className="mb-2 px-1"><h3 className="text-xs font-bold tracking-wide text-slate-600">מקלדת מתמטית</h3><p className="mt-1 text-[10px] text-slate-400">הסימנים יתווספו לשורה הפעילה</p></div>
          <MathKeyboard onInsert={insertToken} />
          <div className="mt-3 flex flex-wrap gap-1.5" dir="ltr" aria-label="דוגמאות לפונקציות">
            {['x^2', 'sin(x)', 'sqrt(x)', '1/x'].map((example) => <button key={example} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => updateExpression(activeId, { source: example, visible: true })} className="rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-[10px] text-slate-500 transition hover:border-indigo-200 hover:text-indigo-700">{example}</button>)}
          </div>
        </aside>
      </div>
    </section>
  );
}
