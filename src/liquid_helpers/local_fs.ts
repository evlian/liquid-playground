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
        // Get the full normalized path
        const fullPath = path.resolve(path.join(dir, file));
        const dirName = path.dirname(fullPath);
        const baseName = path.basename(fullPath);
        
        // Try both variations of the filename
        const normalPath = path.join(dirName, `${baseName}.${ext}`);
        const prependedPath = path.join(dirName, `${this.filePrependChar}${baseName}.${ext}`);
        
        // Check first for normal path, then prepended path
        let finalPath = fs.existsSync(normalPath) ? normalPath : prependedPath;
        
        // Resolve the final path
        finalPath = path.resolve(finalPath);
        
        // Security check
        if (!this.contains(dir, finalPath)) {
            throw new Error('Illegal template path');
        }
        
        return finalPath;
    }

    contains(root: string, file: string): boolean {

        const relative = path.relative(root, file);
        return !!relative && !relative.startsWith('..') && !path.isAbsolute(relative);
    }

    dirname(file: string): string {
        return path.dirname(file);
    }
}