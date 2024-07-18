import * as vscode from 'vscode';

export interface Command {
    context: vscode.ExtensionContext;

    register: (commandName: string) => vscode.Disposable;
    execute: (uri: vscode.Uri) => void;
}