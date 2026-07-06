import type { Node as SyntaxNode } from 'web-tree-sitter';

export interface Position {
    row: number;
    column: number;
}

export interface MetricViolation {
    message: string;
    startPosition: Position;
    endPosition: Position;
}

export interface IMetric {
    evaluate(node: SyntaxNode, threshold: number): MetricViolation | null;
}
