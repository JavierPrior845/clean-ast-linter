import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('clean-ast-linter.helloWorld', () => {
        vscode.window.showInformationMessage('Clean AST Linter is now active!');
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
