;; queries/python/metrics.scm

;; Captura cualquier definición de función (estándar, asíncrona o método de clase)
;; y extrae tanto el nodo de la función completa como el de sus parámetros.

(function_definition
  parameters: (parameters) @function.params
) @function.def
