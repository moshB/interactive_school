export { compileFunctionExpression } from './functionExpression';
export type {
  FunctionCompilation,
  FunctionEvaluation,
  FunctionEvaluator,
} from './functionExpression';
export { findFunctionIntercepts, findLocalExtrema } from './graphAnalysis';
export type { FunctionExtremum, FunctionIntercept, GraphBounds } from './graphAnalysis';
export { validateDerivativeAnswer } from './derivativeAnswer';
export type { DerivativeAnswerResult } from './derivativeAnswer';
