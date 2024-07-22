import * as vscode from 'vscode';
import { LaunchPlaygroundCommand } from './commands/launch_playground';
import { OutputDocumentContentProvider } from './commands/output_document_content_provider';

export function activate(context: vscode.ExtensionContext) {
    const outputProvider = new OutputDocumentContentProvider();
    vscode.workspace.registerTextDocumentContentProvider('output', outputProvider);

    context.subscriptions.push(
        new LaunchPlaygroundCommand(context).register("liquidplayground.launchPlayground")
    );
}

// Function called when the extension is deactivated
export function deactivate() {}