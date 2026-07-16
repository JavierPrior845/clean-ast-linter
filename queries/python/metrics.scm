;; queries/python/metrics.scm

;; Captura cualquier definición de función (estándar, asíncrona o método de clase)
;; y extrae tanto el nodo de la función completa como el de sus parámetros.

(function_definition
  parameters: (parameters) @function.params
) @function.def

;; Puntos de decisión para Complejidad Ciclomática
[
  (if_statement)
  (elif_clause)
  (for_statement)
  (while_statement)
  (except_clause)
  (case_clause)
  (boolean_operator)
  (conditional_expression)
] @decision.point
