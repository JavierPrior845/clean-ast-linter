# Guía de Pruebas: Refactorización con Inteligencia Artificial Local

Esta guía detalla el proceso para configurar un entorno local y probar la funcionalidad estrella de la extensión: la **auto-refactorización mediante IA**. Al integrar **Ollama**, los modelos de lenguaje (LLMs) se ejecutan directamente en la máquina del desarrollador. Esto garantiza una privacidad absoluta del código fuente (ningún dato sale de tu ordenador) y evita la latencia de red de las APIs comerciales.

---

## 1. Requisitos Previos: Instalación de Ollama

Ollama actúa como el servidor y motor de ejecución para los modelos de Inteligencia Artificial locales.

1. Navega a la web oficial del proyecto: **[ollama.com](https://ollama.com/)**.
2. Descarga el paquete correspondiente a tu sistema operativo (Windows, macOS o Linux) y procede con la instalación estándar.
3. Tras la instalación, asegúrate de que la aplicación está abierta. Ollama se ejecutará como un servicio en segundo plano, escuchando por defecto en el puerto `http://localhost:11434`.

---

## 2. Descarga del Modelo de IA

La extensión `clean-ast-linter` está configurada por defecto para comunicarse con el modelo **`qwen2.5-coder:1.5b`**. Se trata de un modelo desarrollado por Alibaba, optimizado específicamente para tareas de programación, y cuyo tamaño (menos de 1 GB) lo hace ideal para ejecutarse fluidamente en equipos portátiles o estándar.

Para descargar y preparar el modelo:

1. Abre tu terminal de comandos.
2. Ejecuta el siguiente comando:
   ```bash
   ollama run qwen2.5-coder:1.5b
   ```
3. Ollama comenzará a descargar los pesos del modelo. Cuando termine, te mostrará un *prompt* interactivo (`>>>`). 
4. Puedes salir de ese entorno escribiendo `/bye` o pulsando `Ctrl + D`. El modelo ya ha quedado almacenado de forma permanente en tu sistema.

> **Modelos Alternativos:**
> Si tu equipo dispone de recursos muy limitados, puedes usar versiones ultraligeras como `qwen2.5-coder:0.5b`. Si, por el contrario, tienes un ordenador de alto rendimiento (16GB+ de RAM), puedes aprovechar modelos mucho más capaces como `llama3` o `deepseek-coder`. Recuerda que si cambias de modelo, deberás actualizar la variable `cleanAstLinter.aiModel` en los Ajustes de VS Code.

---

## 3. Ejecución del Entorno de Desarrollo

Para probar la extensión directamente desde su código fuente:

1. Abre la carpeta del proyecto `clean-ast-linter` en Visual Studio Code.
2. Si es la primera vez que abres el proyecto, instala las dependencias ejecutando en la terminal integrada:
   ```bash
   npm install
   ```
3. Presiona la tecla **F5** (o ve a *Run > Start Debugging*). VS Code compilará el código TypeScript y abrirá una nueva ventana aislada llamada **[Extension Development Host]**. En esta nueva ventana, la extensión ya está cargada y activa.

---

## 4. Probando las "Code Actions" (Quick Fixes)

Sigue estos pasos dentro de la ventana de pruebas (*Extension Development Host*) para desencadenar la IA:

1. Abre o crea un archivo de código fuente soportado (por ejemplo, `test.py` o `test.ts`).
2. Escribe (o pega) una función que incumpla intencionadamente los principios de Clean Code. Una forma rápida de hacerlo es anidar múltiples sentencias `if`, `for` o `while` dentro de una misma función, hasta superar el umbral de **Complejidad Ciclomática** (por defecto configurado en > 10).
3. El analizador AST en tiempo real detectará el problema y subrayará el nombre de la función con una línea ondulada de advertencia.
4. Posiciona el cursor del texto encima de la zona subrayada. 
5. Observarás que aparece un icono de una **Bombilla Amarilla (💡)** en el margen izquierdo del editor. También puedes invocar el menú manualmente usando el atajo de teclado (`Ctrl + .` en Windows/Linux, `Cmd + .` en macOS).
6. Al desplegar el menú de acciones, selecciona:
   👉 **"💡 Refactorizar con IA (Ollama)"**

---

## 5. Resultados Esperados

Al ejecutar la acción, ocurre lo siguiente:

- La extensión extrae quirúrgicamente el código de la función problemática usando las coordenadas del AST.
- En la esquina inferior derecha del editor, aparecerá una notificación indicando: *"Refactorizando con IA Local..."*.
- El código se envía mediante una petición HTTP local al servidor de Ollama.
- Dependiendo del hardware (GPU/CPU) y del tamaño de la función, el proceso durará unos segundos.
- Finalmente, el fragmento de código original será sustituido automáticamente en el editor por la versión corregida y refactorizada que ha devuelto el LLM. Todo ello sin perder formato ni corromper el resto del archivo.
