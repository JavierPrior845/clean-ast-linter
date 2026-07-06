# Instrucciones para el Agente (Agent Instructions)

Al desarrollar o modificar código en este proyecto, debes seguir **estrictamente** las siguientes directrices:

1. **Modularidad y Refactorización**:
   - El código debe ser lo más modular posible.
   - Mantén las funciones pequeñas, enfocadas y con una única responsabilidad.
   - Refactoriza el código de manera proactiva para mejorar la legibilidad.

2. **Evitar Malas Prácticas (Clean Code)**:
   - Dado que esta extensión detecta malas prácticas de programación, nuestro propio código **debe ser un ejemplo de Clean Code**.
   - **No** crees funciones demasiado grandes (evita funciones con muchas líneas de código).
   - **No** crees funciones con demasiados parámetros (usa objetos para agrupar parámetros si es necesario).

3. **Validación Temprana (Linter, Knip y Compilación)**:
   - Antes de escribir o proponer código muy complejo (o con muchas funciones), y antes de dar por completada una tarea, debes verificar que el código sea correcto.
   - **Linter**: Asegúrate de que el código pasa el linter (`npm run lint` o el script correspondiente en el `package.json`).
   - **Knip**: Ejecuta y comprueba que no hay errores de dependencias o exportaciones sin uso usando `knip`.
   - **Compilación**: Asegúrate de que no haya errores de compilación de TypeScript (`npm run build` o `tsc --noEmit`).

4. **Brevedad**:
   - Mantén estas prácticas en mente en todo momento sin que tus respuestas se vuelvan innecesariamente largas. Ve al grano en tus explicaciones siendo critico en todo momento y no buscando favorecer al usuario.
