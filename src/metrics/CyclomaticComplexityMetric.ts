import type { Query, Node as SyntaxNode } from 'web-tree-sitter';
import { IMetric, MetricViolation } from './IMetric';

export class CyclomaticComplexityMetric implements IMetric {
    private query: Query;

    constructor(query: Query) {
        this.query = query;
    }

    /**
     * Evalúa la complejidad ciclomática de una función.
     * @param node El nodo correspondiente a la función completa (@function.def)
     * @param threshold Límite máximo de complejidad permitida
     */
    evaluate(node: SyntaxNode, threshold: number): MetricViolation | null {
        // Ejecutamos la consulta solo dentro del subárbol de esta función
        const captures = this.query.captures(node);

        // Filtramos para contar únicamente los nodos etiquetados como @decision.point
        const decisionPoints = captures.filter((c) => c.name === 'decision.point');

        // Complejidad ciclomática = Nodos de decisión + 1
        const complexity = decisionPoints.length + 1;

        if (complexity > threshold) {
            return {
                message: `La función tiene una complejidad ciclomática de ${complexity}, superando el límite de ${threshold}. Considera refactorizar para simplificar la lógica.`,
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

        return null;
    }
}
