import type { Node as SyntaxNode, QueryCapture } from 'web-tree-sitter';
import { IMetric, MetricViolation, createViolation } from './IMetric';

export class CyclomaticComplexityMetric implements IMetric {
    /**
     * Evalúa la complejidad ciclomática de una función.
     * @param node El nodo correspondiente a la función completa (@function.def)
     * @param threshold Límite máximo de complejidad permitida
     * @param allCaptures Todas las capturas calculadas previamente en la raíz del documento
     */
    evaluate(
        node: SyntaxNode,
        threshold: number,
        allCaptures: QueryCapture[] = [],
    ): MetricViolation | null {
        // En lugar de ejecutar query.captures(node) de nuevo, filtramos las capturas
        // que ya sabemos que existen en el documento entero y que caen dentro de este nodo.
        const decisionPoints = allCaptures.filter(
            (c) =>
                c.name === 'decision.point' &&
                c.node.startIndex >= node.startIndex &&
                c.node.endIndex <= node.endIndex,
        );

        // Complejidad ciclomática = Nodos de decisión + 1
        const complexity = decisionPoints.length + 1;

        if (complexity > threshold) {
            return createViolation(
                node,
                `La función tiene una complejidad ciclomática de ${complexity}, superando el límite de ${threshold}. Considera refactorizar para simplificar la lógica.`,
            );
        }

        return null;
    }
}
