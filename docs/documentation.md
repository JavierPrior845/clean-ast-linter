## Tree-Sitter

### What it is NOT
- **LSP (Language Server Protocol):** No proporciona inteligencia de código profunda (autocompletado semántico, ir a definición de tipos complejos) por sí mismo, sino análisis estructural local.
- **Interpreter:** No ejecuta ni evalúa el código.
- **Compiler:** No traduce el código fuente a código máquina o bytecode.

### What it is
- **Parser generator tool:** Permite crear analizadores sintácticos a partir de una gramática (reglas) escrita en JavaScript.
- **Incremental parsing library:** Analiza el código de forma ultrarrápida a medida que escribes, actualizando solo las partes del árbol (CST) que han cambiado en lugar de analizar el archivo entero desde cero.
- **A query engine:** Proporciona un potente motor de búsqueda para extraer patrones específicos del árbol de sintaxis utilizando su propio lenguaje de consultas.

### Why Tree-Sitter?
- **Incremental:** Es lo suficientemente rápido para ejecutarse en cada pulsación de tecla del editor de código sin bloquear la interfaz.
- **Error handler (Tolerancia a errores):** Si el programador se deja un punto y coma o escribe mal la sintaxis, Tree-Sitter no se rompe. Genera un nodo `ERROR` pero sigue construyendo el resto del árbol correctamente.
- **Queries (S-Expressions):** Permite realizar búsquedas semánticas avanzadas de una manera estándar, declarativa y muy expresiva.

---

### LSP vs Tree-Sitter
- **Language Server Protocol (LSP):** Es un estándar creado por Microsoft que comunica tu editor de código (como VS Code) con herramientas externas para darte autocompletado global, detección de errores y navegación. Un servidor LSP puede tardar segundos en analizar un proyecto enorme.
- **Tree-Sitter:** Es una herramienta local del editor. Su función principal es tomar texto de código fuente y convertirlo en un árbol de sintaxis en milisegundos. Un servidor LSP podría usar Tree-Sitter por debajo, pero la principal ventaja de Tree-Sitter es dar estructura rápida al editor (por ejemplo, para el resaltado de colores o plegado de código).

---

### CST vs AST
- **Concrete Syntax Tree (CST) / Árbol de Análisis Sintáctico:** Es una representación detallada que refleja exactamente el texto del código fuente. Incluye todos los tokens, como palabras clave, comas, paréntesis y espacios. **Tree-Sitter genera CSTs**, aunque coloquialmente la gente los llame ASTs.
- **Abstract Syntax Tree (AST):** Es una estructura jerárquica simplificada. Elimina detalles sintácticos innecesarios (como llaves o puntos y coma) y se centra solo en la estructura lógica abstracta. Se usa más en las tripas de los compiladores clásicos.

---

### Consultas (Queries) y S-Expressions

**Lisp** (abreviatura de List Processing) es una familia de lenguajes de programación pioneros en el paradigma funcional, conocidos por representar tanto el código como los datos en forma de listas rodeadas de paréntesis. 

Tree-Sitter utiliza esta sintaxis inspirada en Lisp, conocida como **S-Expressions** (Expresiones Simbólicas), para construir las consultas de su motor de búsqueda (*Queries*). Es decir, las "queries" de Tree-Sitter son, sintácticamente, S-expressions.

El objetivo de estas queries es encontrar nodos específicos en el inmenso árbol CST que devuelve Tree-Sitter, de forma muy parecida a como usarías selectores CSS (`div > p.clase`) para encontrar elementos en el DOM de una web HTML.

#### Sintaxis Básica
Para buscar un nodo por su tipo, se encierra entre paréntesis:
```scheme
(tipo_de_nodo)
```

Para buscar jerarquías (nodos anidados), se anidan los paréntesis. A veces, la gramática le da un **nombre de campo** (field) específico a los hijos, que se denota con dos puntos (`nombre_campo:`):
```scheme
(nodo_padre
  nombre_campo: (nodo_hijo))
```

#### Capturas (@)
Una vez que encuentras la estructura que buscas, necesitas "guardarla" o extraerla para que tu extensión de TypeScript pueda usar esa información. Para ello se usa el operador de captura `@` seguido de un nombre de variable arbitrario.

```scheme
(tipo_de_nodo) @mi_variable
```

#### Ejemplos Prácticos de S-Expressions

**1. Capturar una declaración de función completa (TypeScript/JavaScript)**
```scheme
(function_declaration
  name: (identifier) @nombre_de_la_funcion
  parameters: (formal_parameters) @parametros) @funcion_entera
```
*Explicación:* Esta query busca un nodo `function_declaration`. Captura su campo `name` (que debe ser un `identifier`) y lo guarda en `@nombre_de_la_funcion`. Captura los parámetros en `@parametros`. Finalmente, todo el bloque de la función se captura en `@funcion_entera`.

**2. Encontrar variables globales (que no están dentro de funciones o clases)**
Las S-Expressions permiten anclar búsquedas usando el nodo raíz (`program` en TS):
```scheme
(program
  (lexical_declaration 
    (variable_declarator 
      name: (identifier) @variable_global)))
```

**3. Alternativas (Búsqueda múltiple)**
Puedes usar corchetes `[]` para buscar que coincida con una cosa u otra (similar al operador `OR`).
```scheme
[
  (function_declaration)
  (arrow_function)
  (method_definition)
] @cualquier_tipo_de_funcion
```

**4. Predicados y Condiciones Avanzadas (#eq?)**
Puedes filtrar todavía más los resultados de las capturas usando predicados dentro de la query:
```scheme
(
  (identifier) @nombre_variable
  (#eq? @nombre_variable "i")
)
```
*Explicación:* Captura todos los identificadores que se llamen exactamente "i".

### Métricas en AST (AST Metrics)

En el contexto del análisis estático de código mediante AST, las **métricas** son valores cuantitativos que extraemos de los nodos capturados (por ejemplo, a través de *queries* de Tree-sitter) para evaluar la calidad del código y detectar posibles "malas prácticas" (code smells).

Al utilizar S-Expressions para separar e identificar componentes clave como `@function.def` (la declaración completa) y `@function.params` (la lista de parámetros), podemos calcular principalmente dos métricas fundamentales:

1. **Tamaño de la Función (Function Length):**
   - Utilizando las propiedades del nodo capturado como `@function.def` (`startPosition.row` y `endPosition.row`), el linter calcula cuántas líneas ocupa la función.
   - Si supera un límite predefinido (por ejemplo, más de 30 líneas), se considera demasiado larga e incumple el principio de responsabilidad única.

2. **Exceso de Parámetros (Parameter Count):**
   - Utilizando el nodo capturado como `@function.params`, se cuenta directamente el número de hijos correspondientes a parámetros.
   - Si hay demasiados (por ejemplo, más de 3 o 4), el linter recomendará agruparlos en un objeto o interfaz (Data Transfer Object / Configuration Object).

Estas capturas son la base sobre la cual el código de la extensión (en TypeScript) toma decisiones para emitir advertencias (*warnings*) directamente en el editor del usuario.

---

### Integración de AST con Inteligencia Artificial (Code Actions)

El uso de Tree-sitter no solo permite detectar problemas, sino que habilita soluciones quirúrgicas automatizadas mediante modelos de lenguaje (LLM). El flujo arquitectónico es el siguiente:

1. **Detección Determinista:** El analizador AST (Tree-sitter) determina con 100% de fiabilidad matemática dónde empieza y dónde acaba una función infractora (usando `startPosition` y `endPosition`).
2. **Code Action Provider:** La extensión registra un proveedor de "Quick Fixes" (bombilla amarilla en VS Code). Cuando el cursor del usuario coincide con las coordenadas exactas de la función defectuosa, el proveedor se activa.
3. **Extracción Quirúrgica:** Gracias a que Tree-sitter conoce los límites exactos del nodo `@function.def`, la extensión extrae **únicamente** ese bloque de texto del documento completo.
4. **Refactorización Aislada (LLM):** Ese bloque específico se envía a un agente de IA local (por ejemplo, mediante Ollama). Como la IA recibe un contexto reducido y específico (solo la función, no todo el archivo), su respuesta es mucho más rápida y menos propensa a alucinaciones.
5. **Reemplazo Seguro:** La extensión recoge la respuesta de la IA (el código limpio) y utiliza un `WorkspaceEdit` para sobrescribir exactamente el rango de coordenadas original detectado por Tree-sitter. 

Esta sinergia garantiza que la IA no corrompa otras partes del archivo por error (un problema común en herramientas genéricas de autocompletado), ya que **el AST actúa como una barrera o delimitador estricto** de la zona de actuación.