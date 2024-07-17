import * as vscode from 'vscode';
import { Liquid } from 'liquidjs';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('liquidplayground.openLiquidPlayground', async (uri: vscode.Uri) => {
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
            context.subscriptions.push(templateChangeListener);
            context.subscriptions.push(dataChangeListener);

            // Initial render on extension activation
            render();
        })
    );
}

async function renderLiquidTemplate(templateFilePath: string, liquidTemplate: string, jsonData: string): Promise<string> {
    try {
        // Determine the parent folder of the template file
        let templateRootFilePath = path.dirname(templateFilePath).replace('/c:', 'c:');
        
        const engine = new Liquid({
            root: [templateRootFilePath],
            extname: 'liquid',
            fs: {
                async exists(filepath: string): Promise<boolean> {
                    

                    return new Promise((resolve) => {
                        fs.access(filepath, fs.constants.F_OK, (err) => {
                            resolve(!err);
                        });
                    });
                },

                existsSync(filepath: string): boolean {
                    

                    return fs.existsSync(filepath);
                },

                async readFile(filepath: string): Promise<string> {
                    
                    return new Promise((resolve, reject) => {
                        fs.readFile(filepath, 'utf8', (err, data) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(data);
                            }
                        });
                    });
                },

                readFileSync(filepath: string): string {
                    

                    return fs.readFileSync(filepath, 'utf8');
                },

                resolve(dir: string, file: string, ext: string): string {
                                        
                    // Always prepend underscore to the file name
                    var fullPath = path.resolve(path.join(dir, file));
                    const dirName = path.dirname(fullPath);
                    var splitPath = fullPath.split('\\');
                    const filePath = path.join(dirName, `_${splitPath[splitPath.length - 1]}.${ext}`);
                    fullPath = path.resolve(filePath);
                                        

                    if (!this.contains?.(dir, fullPath)) {
                        throw new Error('Illegal template path');
                    }

                    return fullPath;
                },

                contains(root: string, file: string): boolean {

                    const relative = path.relative(root, file);
                    return !!relative && !relative.startsWith('..') && !path.isAbsolute(relative);
                },

                dirname(file: string): string {
                    return path.dirname(file);
                }
            }
        });

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