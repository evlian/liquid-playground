import { Liquid } from "liquidjs";
import { LocalFs } from "./local_fs";
import path from "path";

export async function renderLiquidTemplate(templateFilePath: string, liquidTemplate: string, jsonData: string): Promise<string> {
    try {
        // Determine the parent folder of the template file
        let templateRootFilePath = path.dirname(templateFilePath).replace('/c:', 'c:');
        
        const engine = new Liquid({
            root: [templateRootFilePath],
            extname: 'liquid',
            fs: new LocalFs()
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