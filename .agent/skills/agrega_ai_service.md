# Agregar Servicio de Inteligencia Artificial (AI Service)

Esta skill define cómo debes proceder cuando el usuario te pida añadir soporte para un nuevo proveedor de IA (ej: OpenAI, Anthropic, Gemini, DeepSeek).

## Contexto Arquitectónico
El proyecto utiliza un patrón de diseño basado en interfaces para los proveedores de Inteligencia Artificial, lo que permite cambiar el motor de refactorización (ej. de Ollama a OpenAI) de manera limpia y sin tocar la lógica de interfaz de usuario de VS Code.

Todas las interacciones de IA pasan por la interfaz `IAIService` definida en `src/ai/IAIService.ts`.

## Pasos para Agregar un Nuevo Proveedor

1. **Crear la Clase del Servicio**:
   Crea un nuevo archivo en el directorio `src/ai/` (ej: `src/ai/OpenAIService.ts`).
   La clase debe implementar la interfaz `IAIService`:
   ```typescript
   import * as vscode from 'vscode';
   import { IAIService } from './IAIService';

   export class OpenAIService implements IAIService {
       public async refactorCode(code: string, languageId: string): Promise<string> {
           // 1. Obtener API Keys o Endpoints desde vscode.workspace.getConfiguration()
           // 2. Construir el prompt estricto.
           // 3. Realizar la petición HTTP (fetch) al proveedor.
           // 4. Limpiar la respuesta (quitar bloques de markdown o explicaciones).
           // 5. Devolver únicamente el código refactorizado.
       }
   }
   ```

2. **Actualizar `package.json`**:
   Si el nuevo proveedor requiere tokens de autenticación o configuraciones específicas (ej: `cleanAstLinter.openAIApiKey`), debes añadirlas a la sección `contributes.configuration` del `package.json`.

3. **Inyectar el Servicio**:
   Modifica el archivo `src/extension.ts` (donde se registra el comando `clean-ast-linter.refactorWithAI`) para instanciar el nuevo servicio en lugar del anterior, o añade lógica para leer de la configuración qué servicio instanciar dinámicamente si el usuario puede elegir entre varios.
