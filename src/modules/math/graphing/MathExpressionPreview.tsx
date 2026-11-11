import { parse } from 'mathjs';
import type { ReactNode } from 'react';

type MathNodeLike = {
  isOperatorNode?: boolean;
  isParenthesisNode?: boolean;
  isConstantNode?: boolean;
  isSymbolNode?: boolean;
  isFunctionNode?: boolean;
  op?: string;
  fn?: { name?: string };
  name?: string;
  value?: string | number;
  args?: MathNodeLike[];
  content?: MathNodeLike;
  implicit?: boolean;
};

type MathExpressionPreviewProps = {
  source: string;
  className?: string;
};

function renderNode(node: MathNodeLike, key = 'node'): ReactNode {
  if (node.isParenthesisNode && node.content) {
    return <span key={key} className="math-preview-group"><span className="math-preview-paren">(</span>{renderNode(node.content, `${key}-content`)}<span className="math-preview-paren">)</span></span>;
  }

  if (node.isOperatorNode && node.args) {
    if (node.op === '/' && node.args.length === 2) {
      return (
        <span key={key} className="math-preview-fraction">
          <span className="math-preview-numerator">{renderNode(node.args[0], `${key}-numerator`)}</span>
          <span className="math-preview-denominator">{renderNode(node.args[1], `${key}-denominator`)}</span>
        </span>
      );
    }
    if (node.op === '^' && node.args.length === 2) {
      return <span key={key} className="math-preview-power">{renderNode(node.args[0], `${key}-base`)}<sup>{renderNode(node.args[1], `${key}-exponent`)}</sup></span>;
    }
    if (node.args.length === 1) {
      return <span key={key}>{node.op === '-' ? '−' : node.op}{renderNode(node.args[0], `${key}-argument`)}</span>;
    }
    const operator = node.op === '*' ? (node.implicit ? ' ' : ' · ') : node.op === '-' ? ' − ' : ` ${node.op ?? ''} `;
    return <span key={key} className="math-preview-operation">{node.args.map((argument, index) => <span key={`${key}-${index}`}>{index > 0 && operator}{renderNode(argument, `${key}-${index}`)}</span>)}</span>;
  }

  if (node.isFunctionNode && node.args) {
    const functionName = node.fn?.name ?? '';
    const argument = node.args[0];
    if ((functionName === 'sqrt' || functionName === 'sqrtNumber') && argument) {
      return <span key={key} className="math-preview-root"><span className="math-preview-radical" aria-hidden="true">√</span><span className="math-preview-radicand">{renderNode(argument, `${key}-radicand`)}</span></span>;
    }
    if (functionName === 'abs' && argument) {
      return <span key={key} className="math-preview-absolute">|{renderNode(argument, `${key}-absolute`)}|</span>;
    }
    return <span key={key}><span className="math-preview-function">{functionName}</span><span className="math-preview-paren">(</span>{node.args.map((item, index) => <span key={`${key}-arg-${index}`}>{index > 0 && ', '}{renderNode(item, `${key}-arg-${index}`)}</span>)}<span className="math-preview-paren">)</span></span>;
  }

  if (node.isConstantNode) return <span key={key}>{String(node.value)}</span>;
  if (node.isSymbolNode) {
    const symbols: Record<string, string> = { pi: 'π', theta: 'θ', infinity: '∞' };
    return <span key={key}>{symbols[node.name ?? ''] ?? node.name}</span>;
  }
  return <span key={key}>?</span>;
}

export default function MathExpressionPreview({ source, className = '' }: MathExpressionPreviewProps) {
  if (!source.trim()) return <span className={`math-preview-empty ${className}`}>הביטוי יוצג כאן</span>;

  try {
    const tree = parse(source) as unknown as MathNodeLike;
    return <span className={`math-preview ${className}`} dir="ltr">{renderNode(tree)}</span>;
  } catch {
    return <span className={`math-preview-empty ${className}`} dir="ltr">{source}</span>;
  }
}
