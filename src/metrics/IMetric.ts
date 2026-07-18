import type { Node as SyntaxNode, QueryCapture } from 'web-tree-sitter';

interface Position {
    row: number;
    column: number;
}

export interface MetricViolation {
    message: string;
    startPosition: Position;
    endPosition: Position;
}

export interface IMetric {
    evaluate(
        node: SyntaxNode,
        threshold: number,
        captures?: QueryCapture[],
    ): MetricViolation | null;
}
