export { compileFunctionExpression, validateFunctionValue } from './domain/functionExpression';
export type {
  FunctionCompilation,
  FunctionEvaluation,
  FunctionEvaluator,
  FunctionValueValidationResult,
} from './domain/functionExpression';
export { findFunctionIntercepts, findLocalExtrema } from './domain/graphAnalysis';
export type { FunctionExtremum, FunctionIntercept, GraphBounds } from './domain/graphAnalysis';
export { validateDerivativeAnswer } from './domain/derivativeAnswer';
export type { DerivativeAnswerResult } from './domain/derivativeAnswer';
export { GraphingCalculator, MathExpressionPreview } from './graphing';
export { MathKeyboard } from './input';
export type { MathToken } from './input';
