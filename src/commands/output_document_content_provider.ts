import * as vscode from 'vscode';

export class OutputDocumentContentProvider implements vscode.TextDocumentContentProvider {
    private content: string = '';

    provideTextDocumentContent(uri: vscode.Uri): string {
        return this.content;
    }

    updateContent(newContent: string) {
        this.content = newContent;
        vscode.workspace.textDocuments
            .filter(doc => doc.uri.scheme === 'output')
            .forEach(doc => {
                const edit = new vscode.WorkspaceEdit();
                const fullRange = new vscode.Range(0, 0, doc.lineCount, doc.getText().length);
                edit.replace(doc.uri, fullRange, newContent);
                vscode.workspace.applyEdit(edit);
            });
    }
}

export const outputProvider = new OutputDocumentContentProvider();
