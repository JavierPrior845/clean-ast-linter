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

export function createViolation(node: SyntaxNode, message: string): MetricViolation {
    return {
        message,
        startPosition: {
            row: node.startPosition.row,
            column: node.startPosition.column,
        },
        endPosition: {
            row: node.endPosition.row,
            column: node.endPosition.column,
        },
    };
}
