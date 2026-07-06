# Skill: Creación de Queries de Métricas ("crea_query_metricas")

**Contexto**: Esta skill se activa cuando necesitamos extraer información del AST para calcular métricas (por ejemplo, longitud de funciones, número de parámetros) en un lenguaje específico usando Tree-sitter.

**Instrucciones a seguir:**
1. **Identificar los Nodos Funcionales**: Busca en la gramática del lenguaje (`node-types.json` o documentación de Tree-sitter) cuáles son los nodos que representan bloques de código ejecutables:
   - Funciones estándar (declaraciones y expresiones).
   - Funciones asíncronas.
   - Métodos de clases o interfaces.
   - Funciones anónimas (lambdas/arrow functions).

2. **Identificar los Parámetros**: Busca cómo se llaman los campos o nodos hijos que contienen la lista de parámetros (por ejemplo, `parameters: (formal_parameters)` en TypeScript, o `parameters: (parameters)` en Python).

3. **Estructurar la Consulta (`.scm`)**:
   - Etiqueta el nodo funcional completo con `@function.def` (esto permitirá medir líneas de código o complejidad ciclomática).
   - Etiqueta el nodo de parámetros con `@function.params` (esto permitirá contar el número de parámetros recibidos).
   - Escribe la consulta de forma que agrupe todas las variaciones funcionales si el lenguaje distingue entre ellas (usando corchetes `[]` para la alternancia).

4. **Documentar**: Añade comentarios (`;;`) en el archivo `.scm` explicando qué nodos atrapa la consulta.
