import * as vscode from 'vscode';
import { LaunchPlaygroundCommand } from './commands/launch_playground';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        new LaunchPlaygroundCommand(context).register("liquidplayground.launchPlayground")
    );
}

// Function called when the extension is deactivated
export function deactivate() {}