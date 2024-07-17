import * as fs from 'fs';
import { FS } from 'liquidjs';
import * as path from 'path';

export class LocalFileSystem implements FS {
    public sep: string;
    public fallback?: (file: string) => string | undefined;

    constructor() {
        this.sep = '/';
    }

    async exists(filepath: string): Promise<boolean> {
        return true;
        return new Promise((resolve) => {
            fs.access(filepath, fs.constants.F_OK, (err) => {
                resolve(!err);
            });
        });
    }

    existsSync(filepath: string): boolean {
        return fs.existsSync(filepath);
    }

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
    }

    readFileSync(filepath: string): string {
        return fs.readFileSync(filepath, 'utf8');
    }

    resolve(dir: string, file: string, ext: string): string {

        if (!this.isValidTemplateName(file)) {
            throw new Error('Illegal template name');
        }

        // Always prepend underscore to the file name
        const filePath = path.join(dir, `_${file}.${ext}`);
        const fullPath = path.resolve(filePath);


        if (!this.contains?.(dir, fullPath)) {
            throw new Error('Illegal template path');
        }

        return fullPath;
    }

    contains?(root: string, file: string): boolean {

        const relative = path.relative(root, file);
        return !!relative && !relative.startsWith('..') && !path.isAbsolute(relative);
    }

    dirname?(file: string): string {
        return path.dirname(file);
    }

    private isValidTemplateName(templateName: string): boolean {
        return true;
        const validTemplateNamePattern = /^[a-zA-Z0-9_]+(\/[a-zA-Z0-9_]+)*$/;
        return validTemplateNamePattern.test(templateName);
    }
}
