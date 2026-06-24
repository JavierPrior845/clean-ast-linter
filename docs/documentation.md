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