import * as vscode from 'vscode';
import { Liquid } from 'liquidjs';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('liquidplayground.openLiquidPlayground', async (uri: vscode.Uri) => {
            try {
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
                    const output = await renderLiquidTemplate(liquidTemplate, jsonData);

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
                context.subscriptions.push(templateChangeListener);
                context.subscriptions.push(dataChangeListener);

                // Initial render on extension activation
                render();
            } catch (error) {
                if (error instanceof Error) {
                    return `Error: ${error.message}`;
                } else {
                    return `Error: An unknown error occurred`;
                }
            }
        })
    );
}

// Function to render Liquid template with JSON data
async function renderLiquidTemplate(liquidTemplate: string, jsonData: string): Promise<string> {
    try {
        const engine = new Liquid();
        const parsedData = JSON.parse(jsonData);
        return await engine.parseAndRender(liquidTemplate, parsedData);
    } catch (error) {
        if (error instanceof Error) {
            return `Error: ${error.message}`;
        } else {
            return `Error: An unknown error occurred`;
        }
    }
}

// Function called when the extension is deactivated
export function deactivate() {}
