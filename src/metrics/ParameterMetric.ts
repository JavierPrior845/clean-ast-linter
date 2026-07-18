import type { Node as SyntaxNode } from 'web-tree-sitter';
import { IMetric, MetricViolation, createViolation } from './IMetric';

export class ParameterMetric implements IMetric {
    /**
     * Evalúa si el número de parámetros supera el umbral configurado.
     * @param node El nodo correspondiente a la captura @function.params (ej. formal_parameters)
     * @param threshold Límite máximo de parámetros permitidos
     */
    evaluate(node: SyntaxNode, threshold: number): MetricViolation | null {
        // En Tree-sitter, los caracteres estructurales como '(', ')' y ',' son nodos anónimos.
        // Utilizando namedChildCount obtenemos exclusivamente los nodos reales que
        // representan parámetros (ej. required_parameter en TS, identifier en Python).
        const parameterCount = node.namedChildCount;

        if (parameterCount > threshold) {
            return createViolation(
                node,
                `La función tiene demasiados parámetros (${parameterCount}). El límite recomendado es ${threshold}.`,
            );
        }

        return null;
    }
}
