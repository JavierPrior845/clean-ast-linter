import * as vscode from 'vscode';
import type { Language, Query, QueryCapture, Node as SyntaxNode, Tree } from 'web-tree-sitter';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Parser = require('web-tree-sitter');
import * as path from 'path';
import * as fs from 'fs';
import { LengthMetric } from './metrics/LengthMetric';
import { ParameterMetric } from './metrics/ParameterMetric';
import { CyclomaticComplexityMetric } from './metrics/CyclomaticComplexityMetric';
import { MetricViolation } from './metrics/IMetric';

export class ASTAnalyzer {
    private diagnosticCollection: vscode.DiagnosticCollection;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private parser: any | null = null;
    private language: Language | null = null;
    private query: Query | null = null;

    // Métricas
    private lengthMetric = new LengthMetric();
    private parameterMetric = new ParameterMetric();
    private complexityMetric: CyclomaticComplexityMetric | null = null;

    private debounceTimer: NodeJS.Timeout | null = null;
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

            const wasmPath = this.getWasmPath();
            if (!fs.existsSync(wasmPath)) {
                console.warn(`No se encontró el binario Wasm en: ${wasmPath}`);
                return;
            }

            this.language = await Parser.Language.load(wasmPath);
            this.parser.setLanguage(this.language);

            this.loadQueries();
        } catch (e) {
            console.error('Error inicializando Tree-sitter o cargando recursos:', e);
        }
    }

    private getWasmPath(): string {
        return path.join(this.extensionContext.extensionPath, 'tree-sitter-typescript.wasm');
    }

    private loadQueries() {
        const queryPath = path.join(
            this.extensionContext.extensionPath,
            'queries',
            'typescript',
            'metrics.scm',
        );
        const querySource = fs.readFileSync(queryPath, 'utf8');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.query = (this.language as any).query(querySource);

        if (this.query) {
            this.complexityMetric = new CyclomaticComplexityMetric(this.query);
        }
    }

    public analyzeDocument(document: vscode.TextDocument) {
        if (!this.isSupportedLanguage(document)) {
            return;
        }

        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        this.debounceTimer = setTimeout(() => {
            this.run(document);
        }, 400);
    }

    private isSupportedLanguage(document: vscode.TextDocument): boolean {
        return document.languageId === 'typescript' || document.languageId === 'typescriptreact';
    }

    private run(document: vscode.TextDocument) {
        this.clearDiagnostics(document);

        if (!this.isReady()) {
            return; // Aún no inicializado o fallo en Wasm
        }

        const captures = this.getCapturesFromDocument(document);
        const config = this.getLinterConfiguration();
        const diagnostics = this.evaluateCaptures(captures, config);

        this.diagnosticCollection.set(document.uri, diagnostics);
    }

    private clearDiagnostics(document: vscode.TextDocument) {
        this.diagnosticCollection.set(document.uri, []);
    }

    private isReady(): boolean {
        return !!(this.parser && this.query && this.complexityMetric);
    }

    public clearTree(document: vscode.TextDocument) {
        const uriString = document.uri.toString();
        const tree = this.previousTrees.get(uriString);
        if (tree) {
            tree.delete();
            this.previousTrees.delete(uriString);
        }
    }

    private getCapturesFromDocument(document: vscode.TextDocument) {
        const sourceCode = document.getText();
        const uriString = document.uri.toString();

        const previousTree = this.previousTrees.get(uriString);
        if (previousTree) {
            previousTree.delete();
        }

        const tree = this.parser.parse(sourceCode);
        this.previousTrees.set(uriString, tree);

        return this.query!.captures(tree.rootNode);
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
    ): vscode.Diagnostic[] {
        const diagnostics: vscode.Diagnostic[] = [];

        for (const capture of captures) {
            if (capture.name === 'function.def') {
                this.evaluateFunctionDefinition(capture.node, config, diagnostics);
            } else if (capture.name === 'function.params') {
                this.evaluateFunctionParameters(capture.node, config, diagnostics);
            }
        }

        return diagnostics;
    }

    private evaluateFunctionDefinition(
        node: SyntaxNode,
        config: { maxLines: number; maxParams: number; maxComplexity: number },
        diagnostics: vscode.Diagnostic[],
    ) {
        const lengthViolation = this.lengthMetric.evaluate(node, config.maxLines);
        if (lengthViolation) {
            diagnostics.push(
                this.createDiagnostic(lengthViolation, vscode.DiagnosticSeverity.Warning),
            );
        }

        const complexityViolation = this.complexityMetric!.evaluate(node, config.maxComplexity);
        if (complexityViolation) {
            diagnostics.push(
                this.createDiagnostic(complexityViolation, vscode.DiagnosticSeverity.Warning),
            );
        }
    }

    private evaluateFunctionParameters(
        node: SyntaxNode,
        config: { maxParams: number },
        diagnostics: vscode.Diagnostic[],
    ) {
        const paramsViolation = this.parameterMetric.evaluate(node, config.maxParams);
        if (paramsViolation) {
            diagnostics.push(
                this.createDiagnostic(paramsViolation, vscode.DiagnosticSeverity.Warning),
            );
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
