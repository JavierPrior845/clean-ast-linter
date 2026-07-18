import * as vscode from 'vscode';
import { ASTAnalyzer } from './ASTAnalyzer';

export function activate(context: vscode.ExtensionContext) {
    const analyzer = new ASTAnalyzer(context);

    analyzeActiveDocument(analyzer);
    registerDocumentEventListeners(context, analyzer);
    registerCommands(context);
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
    const disposable = vscode.commands.registerCommand('clean-ast-linter.helloWorld', () => {
        vscode.window.showInformationMessage('Clean AST Linter is now active!');
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
