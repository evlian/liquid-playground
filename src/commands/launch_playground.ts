import * as vscode from 'vscode';
import { renderLiquidTemplate } from '../liquid_helpers/tools';
import { Command } from './abstractions/command';
import { outputProvider } from './output_document_content_provider';

export class LaunchPlaygroundCommand implements Command {
    context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    register(commandName: string): vscode.Disposable {
        return vscode.commands.registerCommand(commandName, async (uri: vscode.Uri) => this.execute(uri));
    }

    async execute(uri: vscode.Uri) {
        let debounceTimer: NodeJS.Timeout | undefined;
        let lastContent: string = ''; // Track last rendered content

        // Open the Liquid template file
        const templateDocument = await vscode.workspace.openTextDocument(uri);
        const templateEditor = await vscode.window.showTextDocument(templateDocument, { viewColumn: vscode.ViewColumn.One });

        // Open DATA.json beside LIQUID_TEMPLATE.liquid
        const dataUri = vscode.Uri.parse('untitled:DATA.json');
        const dataDocument = await vscode.workspace.openTextDocument(dataUri);
        const dataEditor = await vscode.window.showTextDocument(dataDocument, { viewColumn: vscode.ViewColumn.Two });

        // Open OUTPUT.json as a virtual document
        const outputUri = vscode.Uri.parse('output:OUTPUT.json');
        await vscode.workspace.openTextDocument(outputUri).then((doc) => {
            vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Three });
        });

        // Function to render Liquid template based on changes in any active editor
        const render = async () => {
            const activeEditors = vscode.window.visibleTextEditors;
            const templateEditor = activeEditors.find(editor => 
                editor.document.uri.scheme === 'file' && 
                editor.document.languageId === 'liquid'
            );
            const dataEditor = activeEditors.find(editor => 
                editor.document.uri.scheme === 'untitled' && 
                editor.document.fileName === 'DATA.json'
            );

            if (templateEditor && dataEditor) {
                const liquidTemplate = templateEditor.document.getText();
                const jsonData = dataEditor.document.getText();
                
                // Create a combined content string to check for changes
                const currentContent = `${liquidTemplate}${jsonData}`;
                
                // Only render if content has actually changed
                if (currentContent !== lastContent) {
                    const output = await renderLiquidTemplate(templateEditor.document.uri.path, liquidTemplate, jsonData);
                    outputProvider.updateContent(output);
                    lastContent = currentContent;
                }
            }
        };

        // Event listener for any text document changes
        const documentChangeListener = vscode.workspace.onDidChangeTextDocument(event => {
            // Only proceed if there are actual content changes
            if (event.contentChanges.length > 0) {
                const activeEditors = vscode.window.visibleTextEditors;
                // Check if the changed document is one we care about
                if (activeEditors.some(editor => 
                    editor.document === event.document && 
                    (editor.document.languageId === 'liquid' || 
                     editor.document.fileName === 'DATA.json')
                )) {
                    if (debounceTimer) {
                        clearTimeout(debounceTimer);
                    }
                    debounceTimer = setTimeout(() => {
                        render();
                    }, 300);
                }
            }
        });

        // Event listener for active editor changes
        const activeEditorListener = vscode.window.onDidChangeActiveTextEditor(() => {
            render();
        });

        // Add event listeners to subscriptions
        this.context.subscriptions.push(documentChangeListener);
        this.context.subscriptions.push(activeEditorListener);

        // Initial render on extension activation
        render();
    }
}
