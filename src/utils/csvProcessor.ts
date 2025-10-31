import fs from 'fs';
import { parse } from 'csv-parse';

export function readCsv(filePath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
        const records: any[] = [];
        fs.createReadStream(filePath)
            .pipe(parse({ columns: true, trim: true }))
            .on('data', (row) => records.push(row))
            .on('end', () => resolve(records))
            .on('error', (error) => reject(error));
    });
}

export function writeCsv(filePath: string, data: any[]): Promise<void> {
    return new Promise((resolve, reject) => {
        const csvData = data.map(row => Object.values(row).join(',')).join('\n');
        fs.writeFile(filePath, csvData, (error) => {
            if (error) return reject(error);
            resolve();
        });
    });
}