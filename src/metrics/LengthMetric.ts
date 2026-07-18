import type { Node as SyntaxNode } from 'web-tree-sitter';
import { IMetric, MetricViolation, createViolation } from './IMetric';

export class LengthMetric implements IMetric {
    /**
     * Evalúa si la longitud de un bloque supera el umbral configurado.
     * De momento recibe el límite por parámetro, pero en el futuro
     * la clase podría expandirse para inicializar sus propios límites en el constructor.
     */
    evaluate(node: SyntaxNode, threshold: number): MetricViolation | null {
        const startRow = node.startPosition.row;
        const endRow = node.endPosition.row;

        const lines = endRow - startRow;

        if (lines > threshold) {
            return createViolation(
                node,
                `La función es demasiado larga. Tiene ${lines} líneas, pero el límite es de ${threshold}.`,
            );
        }

        return null;
    }
}
