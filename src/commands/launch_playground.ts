import * as vscode from 'vscode';
import { renderLiquidTemplate } from '../liquid_helpers/tools';
import { Command } from './abstractions/command';

export class LaunchPlaygroundCommand implements Command
{
    context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    register(commandName: string): vscode.Disposable {
        return vscode.commands.registerCommand(commandName, async (uri: vscode.Uri) => this.execute(uri));
    }

    async execute(uri: vscode.Uri) {
        // Open the Liquid template file
        const templateDocument = await vscode.workspace.openTextDocument(uri);
        const templateEditor = await vscode.window.showTextDocument(templateDocument, { viewColumn: vscode.ViewColumn.One });
    
        // Open DATA.json beside LIQUID_TEMPLATE.liquid
        const dataUri = vscode.Uri.parse('untitled:DATA.json');
        const dataDocument = await vscode.workspace.openTextDocument(dataUri);
        const dataEditor = await vscode.window.showTextDocument(dataDocument, { viewColumn: vscode.ViewColumn.Two });
    
        // Open OUTPUT.json beside DATA.json
        const outputUri = vscode.Uri.parse('untitled:OUTPUT.json');
        const outputDocument = await vscode.workspace.openTextDocument(outputUri);
        const outputEditor = await vscode.window.showTextDocument(outputDocument, { viewColumn: vscode.ViewColumn.Three });
    
        // Function to render Liquid template based on changes in LIQUID_TEMPLATE.liquid or DATA.json
        const render = async () => {
            const liquidTemplate = templateEditor.document.getText();
            const jsonData = dataEditor.document.getText();
            const output = await renderLiquidTemplate(uri.path, liquidTemplate, jsonData);
    
            // Replace entire content of OUTPUT.json
            await outputEditor.edit(editBuilder => {
                const fullRange = new vscode.Range(
                    new vscode.Position(0, 0),
                    outputEditor.document.lineAt(outputEditor.document.lineCount - 1).range.end
                );
                editBuilder.replace(fullRange, output);
            });
        };
    
        // Event listeners for changes in LIQUID_TEMPLATE.liquid and DATA.json
        const templateChangeListener = vscode.workspace.onDidChangeTextDocument(event => {
            if (event.document === templateDocument) {
                render();
            }
        });
    
        const dataChangeListener = vscode.workspace.onDidChangeTextDocument(event => {
            if (event.document === dataDocument) {
                render();
            }
        });
    
        // Add event listeners to subscriptions
        this.context.subscriptions.push(templateChangeListener);
        this.context.subscriptions.push(dataChangeListener);
    
        // Initial render on extension activation
        render();
    }
}