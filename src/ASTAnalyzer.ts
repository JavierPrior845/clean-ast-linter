import * as vscode from 'vscode';
import type {
    Language as SyntaxLanguage,
    Query as SyntaxQuery,
    QueryCapture,
    Node as SyntaxNode,
    Tree,
} from 'web-tree-sitter';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Parser, Language, Query } = require('web-tree-sitter');
import * as path from 'path';
import * as fs from 'fs';
import { LengthMetric } from './metrics/LengthMetric';
import { ParameterMetric } from './metrics/ParameterMetric';
import { CyclomaticComplexityMetric } from './metrics/CyclomaticComplexityMetric';
import { MetricViolation } from './metrics/IMetric';

interface LanguageConfig {
    wasmFile: string;
    queryFolder: string;
}

const SUPPORTED_LANGUAGES: Record<string, LanguageConfig> = {
    typescript: { wasmFile: 'tree-sitter-typescript.wasm', queryFolder: 'typescript' },
    typescriptreact: { wasmFile: 'tree-sitter-typescript.wasm', queryFolder: 'typescript' },
    python: { wasmFile: 'tree-sitter-python.wasm', queryFolder: 'python' },
};

export class ASTAnalyzer {
    private diagnosticCollection: vscode.DiagnosticCollection;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private parser: any | null = null;
    private languages = new Map<string, SyntaxLanguage>();
    private queries = new Map<string, SyntaxQuery>();

    // Métricas
    private lengthMetric = new LengthMetric();
    private parameterMetric = new ParameterMetric();
    private complexityMetrics = new Map<string, CyclomaticComplexityMetric>();

    private debounceTimers = new Map<string, NodeJS.Timeout>();
    private extensionContext: vscode.ExtensionContext;
    private previousTrees: Map<string, Tree> = new Map();

    constructor(context: vscode.ExtensionContext) {
        this.extensionContext = context;
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('clean-ast-linter');
        context.subscriptions.push(this.diagnosticCollection);

        // Inicializar parser asíncronamente
        this.initParser().catch((err) => {
            console.error('Error inicializando Tree-sitter:', err);
        });
    }

    private async initParser() {
        try {
            await Parser.init();
            this.parser = new Parser();
        } catch (e) {
            console.error('Error inicializando Tree-sitter:', e);
        }
    }

    private async loadLanguageResources(languageId: string): Promise<boolean> {
        if (this.languages.has(languageId)) {
            return true;
        }

        const config = SUPPORTED_LANGUAGES[languageId];
        if (!config) {
            return false;
        }

        try {
            const wasmPath = path.join(
                this.extensionContext.extensionPath,
                'grammars',
                config.wasmFile,
            );
            if (!fs.existsSync(wasmPath)) {
                console.warn(`No se encontró el binario Wasm en: ${wasmPath}`);
                return false;
            }

            const language = await Language.load(wasmPath);
            this.languages.set(languageId, language);

            this.loadQueryForLanguage(languageId, language, config.queryFolder);

            return true;
        } catch (e) {
            console.error(`Error cargando recursos para ${languageId}:`, e);
            return false;
        }
    }

    private loadQueryForLanguage(
        languageId: string,
        language: SyntaxLanguage,
        queryFolder: string,
    ) {
        const queryFile = path.join('queries', queryFolder, 'metrics.scm');
        const queryPath = path.join(this.extensionContext.extensionPath, queryFile);
        const querySource = fs.readFileSync(queryPath, 'utf8');
        const query = new Query(language, querySource);
        this.queries.set(languageId, query);
        this.complexityMetrics.set(languageId, new CyclomaticComplexityMetric());
    }

    public analyzeDocument(document: vscode.TextDocument) {
        if (!this.isSupportedLanguage(document)) {
            return;
        }

        const uriString = document.uri.toString();
        if (this.debounceTimers.has(uriString)) {
            clearTimeout(this.debounceTimers.get(uriString)!);
        }

        this.run(document, uriString);
    }

    private isSupportedLanguage(document: vscode.TextDocument): boolean {
        return !!SUPPORTED_LANGUAGES[document.languageId];
    }

    private run(document: vscode.TextDocument, uriString: string) {
        const timer = setTimeout(async () => {
            this.clearDiagnostics(document);
            const success = await this.loadLanguageResources(document.languageId);
            if (!success || !this.parser) {
                return;
            }

            const captures = this.getCapturesFromDocument(document);
            if (captures) {
                const config = this.getLinterConfiguration();
                const diagnostics = this.evaluateCaptures(captures, config, document.languageId);
                this.diagnosticCollection.set(document.uri, diagnostics);
            }
            this.debounceTimers.delete(uriString);
        }, 400);
        this.debounceTimers.set(uriString, timer);
    }

    private clearDiagnostics(document: vscode.TextDocument) {
        this.diagnosticCollection.set(document.uri, []);
    }

    public clearTree(document: vscode.TextDocument) {
        const uriString = document.uri.toString();
        const tree = this.previousTrees.get(uriString);
        if (tree) {
            tree.delete();
            this.previousTrees.delete(uriString);
        }
    }

    private getCapturesFromDocument(document: vscode.TextDocument): QueryCapture[] | null {
        const languageId = document.languageId;
        const language = this.languages.get(languageId);
        const query = this.queries.get(languageId);

        if (!language || !query || !this.parser) {
            return null;
        }

        this.parser.setLanguage(language);

        const sourceCode = document.getText();
        const uriString = document.uri.toString();

        const previousTree = this.previousTrees.get(uriString);
        if (previousTree) {
            previousTree.delete();
        }

        const tree = this.parser.parse(sourceCode);
        this.previousTrees.set(uriString, tree);

        return query.captures(tree.rootNode);
    }

    private getLinterConfiguration() {
        const config = vscode.workspace.getConfiguration('cleanAstLinter');
        return {
            maxLines: config.get<number>('maxFunctionLines', 50),
            maxParams: config.get<number>('maxParameters', 4),
            maxComplexity: config.get<number>('maxComplexity', 10),
        };
    }

    private evaluateCaptures(
        captures: QueryCapture[],
        config: { maxLines: number; maxParams: number; maxComplexity: number },
        languageId: string,
    ): vscode.Diagnostic[] {
        const diagnostics: vscode.Diagnostic[] = [];

        for (const capture of captures) {
            if (capture.name === 'function.def') {
                this.evaluateFunctionDefinition(
                    capture.node,
                    config,
                    diagnostics,
                    languageId,
                    captures,
                );
            } else if (capture.name === 'function.params') {
                this.evaluateFunctionParameters(capture.node, config, diagnostics);
            }
        }

        console.log(
            `Clean AST Linter: Evaluated ${captures.length} captures, generated ${diagnostics.length} diagnostics.`,
        );
        return diagnostics;
    }

    private evaluateFunctionDefinition(
        node: SyntaxNode,
        config: { maxLines: number; maxParams: number; maxComplexity: number },
        diagnostics: vscode.Diagnostic[],
        languageId: string,
        allCaptures: QueryCapture[],
    ) {
        this.addViolationIfAny(diagnostics, this.lengthMetric.evaluate(node, config.maxLines));

        const complexityMetric = this.complexityMetrics.get(languageId);
        if (complexityMetric) {
            this.addViolationIfAny(
                diagnostics,
                complexityMetric.evaluate(node, config.maxComplexity, allCaptures),
            );
        }
    }

    private evaluateFunctionParameters(
        node: SyntaxNode,
        config: { maxParams: number },
        diagnostics: vscode.Diagnostic[],
    ) {
        this.addViolationIfAny(diagnostics, this.parameterMetric.evaluate(node, config.maxParams));
    }

    private addViolationIfAny(diagnostics: vscode.Diagnostic[], violation: MetricViolation | null) {
        if (violation) {
            diagnostics.push(this.createDiagnostic(violation, vscode.DiagnosticSeverity.Warning));
        }
    }

    private createDiagnostic(
        violation: MetricViolation,
        severity: vscode.DiagnosticSeverity,
    ): vscode.Diagnostic {
        const start = new vscode.Position(
            violation.startPosition.row,
            violation.startPosition.column,
        );
        const end = new vscode.Position(violation.endPosition.row, violation.endPosition.column);
        const range = new vscode.Range(start, end);

        const diagnostic = new vscode.Diagnostic(range, violation.message, severity);
        diagnostic.source = 'clean-ast-linter';
        return diagnostic;
    }
}
