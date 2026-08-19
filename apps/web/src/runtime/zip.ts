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
  // Use stored mode (level 0) for fastest archive generation
  const out = zipSync(zipData, { level: 0 });
  return new Blob([out], { type: 'application/zip' });
}
