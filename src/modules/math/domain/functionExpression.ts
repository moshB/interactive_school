import { compile } from 'mathjs';

export type FunctionEvaluation =
  | { ok: true; value: number }
  | { ok: false; reason: 'non-finite' | 'evaluation-error' };

export type FunctionEvaluator = {
  source: string;
  evaluate: (x: number) => FunctionEvaluation;
};

export type FunctionCompilation =
  | { ok: true; evaluator: FunctionEvaluator }
  | { ok: false; reason: 'empty-expression' | 'invalid-expression' };

export function compileFunctionExpression(source: string): FunctionCompilation {
  const normalizedSource = source.trim();
  if (!normalizedSource) return { ok: false, reason: 'empty-expression' };

  try {
    const expression = compile(normalizedSource);
    return {
      ok: true,
      evaluator: {
        source: normalizedSource,
        evaluate: (x) => {
          try {
            const value = Number(expression.evaluate({ x }));
            return Number.isFinite(value)
              ? { ok: true, value }
              : { ok: false, reason: 'non-finite' };
          } catch {
            return { ok: false, reason: 'evaluation-error' };
          }
        },
      },
    };
  } catch {
    return { ok: false, reason: 'invalid-expression' };
  }
}

export type FunctionValueValidationResult =
  | { status: 'correct' }
  | { status: 'incorrect' }
  | { status: 'empty' }
  | { status: 'invalid' };

export function validateFunctionValue(expression: string, x: number, answer: string): FunctionValueValidationResult {
  const normalizedAnswer = answer.trim();
  if (!normalizedAnswer) return { status: 'empty' };
  if (!Number.isFinite(x)) return { status: 'invalid' };

  const numericAnswer = Number(normalizedAnswer.replace(',', '.'));
  if (!Number.isFinite(numericAnswer)) return { status: 'invalid' };

  const compilation = compileFunctionExpression(expression);
  if (!compilation.ok) return { status: 'invalid' };

  const expected = compilation.evaluator.evaluate(x);
  if (!expected.ok) return { status: 'invalid' };

  const tolerance = 1e-8 * Math.max(1, Math.abs(expected.value));
  return Math.abs(numericAnswer - expected.value) <= tolerance
    ? { status: 'correct' }
    : { status: 'incorrect' };
}
