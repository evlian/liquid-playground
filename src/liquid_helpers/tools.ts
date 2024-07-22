import { Liquid } from "liquidjs";
import { LocalFs } from "./local_fs";
import path from "path";
import { parseAsJson } from "./filters/parse_as_json";
import { newGuid } from "./filters/new_guid";
import { maskString } from "./filters/mask_string";
import { push } from "./filters/push";
import { performChatRequest, performChatRequestSync } from "./filters/prompt";

export async function renderLiquidTemplate(templateFilePath: string, liquidTemplate: string, jsonData: string): Promise<string> {
    try {
        // Determine the parent folder of the template file
        let templateRootFilePath = path.dirname(templateFilePath).replace('/c:', 'c:');
        
        const engine = new Liquid({
            root: [templateRootFilePath],
            extname: 'liquid',
            fs: new LocalFs(),
            relativeReference: false
        });

        engine.registerFilter("parse_as_json", (value) => parseAsJson(value));
        engine.registerFilter("new_guid", () => newGuid());
        engine.registerFilter("mask_string", (code, length = 6) => maskString(code, length));
        engine.registerFilter('push', (array: any[], value: any) => push(array, value));
        engine.registerFilter("prompt", async (value) => await performChatRequest(value));

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