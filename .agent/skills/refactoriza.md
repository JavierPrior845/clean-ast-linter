# Skill: Refactorización ("refactoriza")

**Contexto**: Esta skill se activa cuando el usuario selecciona un fragmento de código (o te indica un archivo) y te pide explícitamente "refactoriza".

**Instrucciones a seguir:**
Cuando recibas el comando de refactorizar un fragmento de código, debes aplicar inmediatamente las siguientes reglas:

1. **Principio de Responsabilidad Única (SRP)**:
   - Desglosa la función principal en funciones auxiliares lo más pequeñas posibles.
   - Cada nueva función debe hacer una sola cosa y hacerla bien.

2. **Nombres Descriptivos**:
   - Asigna nombres extremadamente claros y descriptivos a las nuevas funciones y variables resultantes de la refactorización, de modo que el código se explique por sí mismo.

3. **Control de Parámetros**:
   - Mantén el número de parámetros de cada función al mínimo.
   - Si una función requiere muchos parámetros, agrúpalos en un objeto de configuración o en una interfaz.

4. **Sin pérdida de funcionalidad**:
   - Asegúrate de que, tras desglosar la función, el comportamiento lógico del código original se mantenga intacto.

5. **Validación**:
   - Al finalizar, recuerda la directriz principal: el código propuesto no debe romper las reglas del Linter ni de TypeScript.
