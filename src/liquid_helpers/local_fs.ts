import { FS } from 'liquidjs';
import * as path from 'path';
import * as fs from 'fs';

export class LocalFs implements FS {
    filePrependChar: string;

    constructor() {
        this.filePrependChar = '_';
    }

    async exists(filepath: string): Promise<boolean> {
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
        
        var fullPath = path.resolve(path.join(dir, file));
        const dirName = path.dirname(fullPath);
        var splitPath = fullPath.split('\\');

        var filePath = path.join(dirName, `${splitPath[splitPath.length - 1]}.${ext}`);

        if (!fs.existsSync(filePath))
        {
            filePath = path.join(dirName, `${this.filePrependChar}${splitPath[splitPath.length - 1]}.${ext}`);
        }
        
        fullPath = path.resolve(filePath);

        if (!this.contains?.(dir, fullPath)) {
            throw new Error('Illegal template path');
        }

        return fullPath;
    }

    contains(root: string, file: string): boolean {

        const relative = path.relative(root, file);
        return !!relative && !relative.startsWith('..') && !path.isAbsolute(relative);
    }

    dirname(file: string): string {
        return path.dirname(file);
    }
}