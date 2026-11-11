import type { FunctionEvaluator } from './functionExpression';

export type GraphBounds = {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
};

export type FunctionExtremum = {
  x: number;
  y: number;
  kind: 'minimum' | 'maximum';
};

export type FunctionIntercept = {
  x: number;
  y: number;
  kind: 'x' | 'y';
};

export function findFunctionIntercepts(
  evaluator: FunctionEvaluator,
  bounds: GraphBounds,
  samples = 420,
): FunctionIntercept[] {
  const evaluate = (x: number) => {
    const result = evaluator.evaluate(x);
    return result.ok ? result.value : null;
  };
  const roots: number[] = [];
  const yIntercept = evaluate(0);
  if (yIntercept === 0) roots.push(0);
  let previousX = bounds.xMin;
  let previousY = evaluate(previousX);

  for (let index = 1; index <= samples; index += 1) {
    const currentX = bounds.xMin + (index / samples) * (bounds.xMax - bounds.xMin);
    const currentY = evaluate(currentX);
    if (currentY === 0) roots.push(currentX);
    else if (previousY !== null && currentY !== null && previousY * currentY < 0) {
      let left = previousX;
      let right = currentX;
      let leftY = previousY;
      let validBracket = true;
      for (let iteration = 0; iteration < 32; iteration += 1) {
        const middle = (left + right) / 2;
        const middleY = evaluate(middle);
        if (middleY === null) {
          validBracket = false;
          break;
        }
        if (leftY * middleY <= 0) right = middle;
        else {
          left = middle;
          leftY = middleY;
        }
      }
      const root = (left + right) / 2;
      const rootValue = evaluate(root);
      if (validBracket && rootValue !== null && Math.abs(rootValue) < 1e-5) roots.push(root);
    }
    previousX = currentX;
    previousY = currentY;
  }

  const uniqueRoots = roots
    .filter((root, index) => roots.findIndex((candidate) => Math.abs(candidate - root) < 1e-4) === index)
    .filter((root) => root >= bounds.xMin && root <= bounds.xMax);
  return [
    ...uniqueRoots.map((x) => ({ x, y: 0, kind: 'x' as const })),
    ...(yIntercept !== null && yIntercept >= bounds.yMin && yIntercept <= bounds.yMax
      ? [{ x: 0, y: yIntercept, kind: 'y' as const }]
      : []),
  ];
}

export function findLocalExtrema(
  evaluator: FunctionEvaluator,
  bounds: GraphBounds,
  samples = 480,
): FunctionExtremum[] {
  const step = (bounds.xMax - bounds.xMin) / samples;
  const values = Array.from({ length: samples + 1 }, (_, index) => {
    const x = bounds.xMin + index * step;
    const result = evaluator.evaluate(x);
    return result.ok ? result.value : null;
  });
  const extrema: FunctionExtremum[] = [];

  for (let index = 1; index < samples; index += 1) {
    const previous = values[index - 1];
    const current = values[index];
    const next = values[index + 1];
    if (previous === null || current === null || next === null) continue;
    if (Math.abs(previous - current) > 2 * (bounds.yMax - bounds.yMin)) continue;
    if (Math.abs(next - current) > 2 * (bounds.yMax - bounds.yMin)) continue;

    const kind = current < previous && current < next
      ? 'minimum'
      : current > previous && current > next
        ? 'maximum'
        : null;
    if (!kind) continue;

    let left = bounds.xMin + (index - 1) * step;
    let right = bounds.xMin + (index + 1) * step;
    const direction = kind === 'minimum' ? 1 : -1;
    const ratio = (Math.sqrt(5) - 1) / 2;
    let first = right - ratio * (right - left);
    let second = left + ratio * (right - left);
    const optimize = (x: number) => {
      const result = evaluator.evaluate(x);
      return result.ok ? direction * result.value : Number.POSITIVE_INFINITY;
    };

    for (let iteration = 0; iteration < 28; iteration += 1) {
      if (optimize(first) < optimize(second)) {
        right = second;
        second = first;
        first = right - ratio * (right - left);
      } else {
        left = first;
        first = second;
        second = left + ratio * (right - left);
      }
    }

    const x = (left + right) / 2;
    const result = evaluator.evaluate(x);
    if (!result.ok || result.value < bounds.yMin || result.value > bounds.yMax) continue;
    if (extrema.some((point) => Math.abs(point.x - x) < step * 2)) continue;
    extrema.push({ x, y: result.value, kind });
  }

  return extrema;
}
