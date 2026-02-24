export async function ensureDir(dirPath: string): Promise<void> {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export async function writeFileAtomic(filePath: string, data: string): Promise<void> {
  const tmpPath = filePath + ".tmp";
  fs.writeFileSync(tmpPath, data);
  fs.renameSync(tmpPath, filePath);
}
import fs from 'fs';
import path from 'path';

export function writeJson(filePath: string, data: any): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function readJson(filePath: string): any {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}
