import * as vscode from 'vscode';
import * as path from 'path';
import { Liquid } from 'liquidjs';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('liquidplayground.openLiquidPlayground', async (uri: vscode.Uri) => {
            // Open the Liquid template file
            const templateDocument = await vscode.workspace.openTextDocument(uri);
            const templateEditor = await vscode.window.showTextDocument(templateDocument, { viewColumn: vscode.ViewColumn.One });

            // Function to dynamically load and open files in the same folder as the Liquid template
            const openFileInSameFolder = async (fileName: string, viewColumn: vscode.ViewColumn) => {
                const folderPath = path.dirname(uri.fsPath);
                const filePath = path.join(folderPath, fileName);
                if (fs.existsSync(filePath)) {
                    const fileUri = vscode.Uri.file(filePath);
                    const fileDocument = await vscode.workspace.openTextDocument(fileUri);
                    await vscode.window.showTextDocument(fileDocument, { viewColumn });
                } else {
                    vscode.window.showErrorMessage(`File not found: ${fileName}`);
                }
            };

            // Open all files in the same folder as LIQUID_TEMPLATE.liquid
            const folderPath = path.dirname(uri.fsPath);
            const filesInFolder = await readFilesInFolder(folderPath);
            if (filesInFolder.length > 0) {
                filesInFolder.forEach(async (fileName, index) => {
                    const viewColumn = vscode.ViewColumn.Two + index; // Open files sequentially in view columns
                    await openFileInSameFolder(fileName, viewColumn);
                });
            }

            // Function to render Liquid template based on changes in LIQUID_TEMPLATE.liquid or any file in the same folder
            const render = async () => {
                const liquidTemplate = templateEditor.document.getText();
                const filesData = await readFilesDataInFolder(folderPath);
                const output = await renderLiquidTemplate(liquidTemplate, filesData);

                // Update OUTPUT.json in the same folder
                await updateFileContentInFolder(folderPath, 'OUTPUT.json', output);
            };

            // Event listener for changes in LIQUID_TEMPLATE.liquid or any file in the same folder
            const templateChangeListener = vscode.workspace.onDidChangeTextDocument(event => {
                if (event.document === templateDocument || event.document.uri.fsPath.startsWith(folderPath)) {
                    render();
                }
            });

            // Add event listener to subscriptions
            context.subscriptions.push(templateChangeListener);

            // Initial render on extension activation
            render();
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

// Function to read all files in a folder
async function readFilesInFolder(folderPath: string): Promise<string[]> {
    try {
        const files = await fs.promises.readdir(folderPath);
        return files.filter(file => !file.startsWith('.') && fs.statSync(path.join(folderPath, file)).isFile());
    } catch (error) {
        console.error(`Error reading files from folder ${folderPath}:`, error);
        return [];
    }
}

// Function to read data from all files in a folder
async function readFilesDataInFolder(folderPath: string): Promise<{ [fileName: string]: string }> {
    try {
        const files = await readFilesInFolder(folderPath);
        const filesData: { [fileName: string]: string } = {};
        await Promise.all(files.map(async (fileName) => {
            const filePath = path.join(folderPath, fileName);
            const fileContent = await fs.promises.readFile(filePath, 'utf8');
            filesData[fileName] = fileContent;
        }));
        return filesData;
    } catch (error) {
        console.error(`Error reading files data from folder ${folderPath}:`, error);
        return {};
    }
}

// Function to update file content in a folder
async function updateFileContentInFolder(folderPath: string, fileName: string, content: string): Promise<void> {
    try {
        const filePath = path.join(folderPath, fileName);
        await fs.promises.writeFile(filePath, content, 'utf8');
    } catch (error) {
        console.error(`Error updating file ${fileName} in folder ${folderPath}:`, error);
    }
}

// Function called when the extension is deactivated
export function deactivate() {}
