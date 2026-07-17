;; queries/typescript/metrics.scm

;; Captura diferentes tipos de funciones en TypeScript y extrae
;; tanto la función completa como la lista de parámetros.

[
  ;; Declaraciones de funciones y funciones de expresión:
  ;; function foo(a, b) {} o const foo = function(a, b) {}
  (function_declaration
    parameters: (formal_parameters) @function.params)
  

  ;; Funciones flecha:
  ;; const foo = (a, b) => {}
  (arrow_function
    parameters: (formal_parameters) @function.params)

  ;; Métodos de clase o firmas de métodos en interfaces:
  ;; class A { foo(a, b) {} }
  (method_definition
    parameters: (formal_parameters) @function.params)

  (method_signature
    parameters: (formal_parameters) @function.params)
] @function.def

;; Puntos de decisión para Complejidad Ciclomática
[
  (if_statement)
  (for_statement)
  (for_in_statement)
  (while_statement)
  (do_statement)
  (catch_clause)
  (switch_case)
  (ternary_expression)
  (binary_expression
    operator: [
      "&&"
      "||"
      "??"
    ])
] @decision.point
