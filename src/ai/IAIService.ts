export interface IAIService {
    /**
     * Refactoriza el código proporcionado según el lenguaje.
     * @param code El código fuente a refactorizar.
     * @param languageId El identificador del lenguaje (ej. 'typescript', 'python').
     * @returns Promesa con el código fuente refactorizado y limpio.
     */
    refactorCode(code: string, languageId: string): Promise<string>;
}
