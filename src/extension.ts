import * as vscode from 'vscode';
import { ASTAnalyzer } from './ASTAnalyzer';
import { RefactorCodeActionProvider } from './providers/RefactorCodeActionProvider';
import { OllamaService } from './ai/OllamaService';

export function activate(context: vscode.ExtensionContext) {
    const analyzer = new ASTAnalyzer(context);

    analyzeActiveDocument(analyzer);
    registerDocumentEventListeners(context, analyzer);
    registerCommands(context);
    registerProviders(context);
}

function analyzeActiveDocument(analyzer: ASTAnalyzer) {
    if (vscode.window.activeTextEditor) {
        analyzer.analyzeDocument(vscode.window.activeTextEditor.document);
    }
}

function registerDocumentEventListeners(context: vscode.ExtensionContext, analyzer: ASTAnalyzer) {
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument((event) => {
            analyzer.analyzeDocument(event.document);
        }),
    );

    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument((document) => {
            analyzer.analyzeDocument(document);
        }),
    );

    context.subscriptions.push(
        vscode.workspace.onDidCloseTextDocument((document) => {
            analyzer.clearTree(document);
        }),
    );
}

function registerCommands(context: vscode.ExtensionContext) {
    const helloDisposable = vscode.commands.registerCommand('clean-ast-linter.helloWorld', () => {
        vscode.window.showInformationMessage('Clean AST Linter is now active!');
    });

    const refactorDisposable = vscode.commands.registerCommand(
        'clean-ast-linter.refactorWithAI',
        async (document: vscode.TextDocument, range: vscode.Range) => {
            const editor = vscode.window.activeTextEditor;
            if (!editor || editor.document.uri.toString() !== document.uri.toString()) {
                vscode.window.showErrorMessage(
                    'Active editor does not match the refactoring target.',
                );
                return;
            }

            const codeToRefactor = document.getText(range);

            vscode.window.withProgress(
                {
                    location: vscode.ProgressLocation.Notification,
                    title: 'Refactoring with Local AI...',
                    cancellable: false,
                },
                async () => {
                    try {
                        const aiService = new OllamaService();
                        const refactoredCode = await aiService.refactorCode(
                            codeToRefactor,
                            document.languageId,
                        );

                        const edit = new vscode.WorkspaceEdit();
                        edit.replace(document.uri, range, refactoredCode);
                        const success = await vscode.workspace.applyEdit(edit);

                        if (success) {
                            vscode.window.showInformationMessage(
                                'Refactoring completed successfully!',
                            );
                        } else {
                            vscode.window.showErrorMessage('Failed to apply refactoring.');
                        }
                    } catch (error: unknown) {
                        vscode.window.showErrorMessage(
                            error instanceof Error ? error.message : String(error),
                        );
                    }
                },
            );
        },
    );

    context.subscriptions.push(helloDisposable, refactorDisposable);
}

function registerProviders(context: vscode.ExtensionContext) {
    const supportedLanguages = ['typescript', 'typescriptreact', 'python'];
    const provider = new RefactorCodeActionProvider();

    for (const lang of supportedLanguages) {
        context.subscriptions.push(
            vscode.languages.registerCodeActionsProvider(lang, provider, {
                providedCodeActionKinds: RefactorCodeActionProvider.providedCodeActionKinds,
            }),
        );
    }
}

export function deactivate() {}
