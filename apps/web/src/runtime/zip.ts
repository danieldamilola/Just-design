import { zipSync, strToU8 } from 'fflate';

export interface ZipEntry {
  path: string;
  content: string;
}

export function buildZip(entries: ZipEntry[]): Blob {
  const zipData: Record<string, Uint8Array> = {};
  for (const entry of entries) {
    zipData[entry.path] = strToU8(entry.content);
  }
  // Use DEFLATE compression (level 6) to compress web-export assets
  const out = zipSync(zipData, { level: 6 });
  return new Blob([out], { type: 'application/zip' });
}
