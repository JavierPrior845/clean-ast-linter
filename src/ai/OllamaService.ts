import * as vscode from 'vscode';
import { IAIService } from './IAIService';

export class OllamaService implements IAIService {
    public async refactorCode(code: string, languageId: string): Promise<string> {
        const config = vscode.workspace.getConfiguration('cleanAstLinter');
        const endpoint = config.get<string>('aiEndpoint', 'http://localhost:11434');
        const model = config.get<string>('aiModel', 'qwen2.5-coder:1.5b');

        const prompt = `You are an expert ${languageId} developer and a strict clean code refactoring tool.
Your task is to refactor the following code to fix clean code violations (such as excessive cyclomatic complexity, too many lines, or too many parameters).
Return ONLY the refactored code. Do NOT wrap the code in markdown blocks (e.g., \`\`\`${languageId}). Do NOT include any explanations, greetings, or text outside the code. Your output must be a valid, compilable drop-in replacement for the provided code.

CODE TO REFACTOR:
${code}`;

        try {
            const response = await fetch(`${endpoint}/api/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: model,
                    prompt: prompt,
                    stream: false,
                }),
            });

            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.statusText}`);
            }

            const data = (await response.json()) as { response: string };
            return this.cleanMarkdown(data.response);
        } catch (error: unknown) {
            console.error('Error connecting to Ollama:', error);
            throw new Error(
                `Failed to refactor code: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }

    private cleanMarkdown(text: string): string {
        let cleaned = text.trim();
        // Remove starting markdown blocks like ```python or ```
        cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '');
        // Remove ending markdown blocks like ```
        cleaned = cleaned.replace(/\n?```$/, '');
        return cleaned.trim();
    }
}
