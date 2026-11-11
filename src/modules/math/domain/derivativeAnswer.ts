import { parse, simplify } from 'mathjs';
import { compileFunctionExpression } from './functionExpression';

export type DerivativeAnswerResult =
  | { status: 'correct' }
  | { status: 'incorrect' }
  | { status: 'empty' }
  | { status: 'invalid' };

const samplePoints = [-3.17, -1.61, -0.37, 0.53, 1.89, 3.41];

export function validateDerivativeAnswer(answer: string, expected: string): DerivativeAnswerResult {
  const normalizedAnswer = answer.trim();
  if (!normalizedAnswer) return { status: 'empty' };

  const answerCompilation = compileFunctionExpression(normalizedAnswer);
  const expectedCompilation = compileFunctionExpression(expected);
  if (!answerCompilation.ok || !expectedCompilation.ok) return { status: 'invalid' };

  try {
    const difference = simplify(parse(`(${normalizedAnswer}) - (${expected})`)).toString();
    if (difference === '0') return { status: 'correct' };
  } catch {
    return { status: 'invalid' };
  }

  for (const x of samplePoints) {
    const actual = answerCompilation.evaluator.evaluate(x);
    const target = expectedCompilation.evaluator.evaluate(x);
    if (!actual.ok || !target.ok) return { status: 'invalid' };
    const tolerance = 1e-8 * Math.max(1, Math.abs(target.value));
    if (Math.abs(actual.value - target.value) > tolerance) return { status: 'incorrect' };
  }

  return { status: 'correct' };
}
