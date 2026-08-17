import type { KnownProvider } from '../state/config';
import type { ApiProtocol } from '../types';

export function isLocalhostBaseUrl(baseUrl: string): boolean {
  try {
    const parsed = new URL(baseUrl);
    const hostname = parsed.hostname.toLowerCase();
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
  } catch {
    return false;
  }
}

export const isLocalOllamaBaseUrl = isLocalhostBaseUrl;

export function byokProviderRequiresApiKey(
  protocol: ApiProtocol | undefined,
  provider: KnownProvider | undefined,
  baseUrl: string,
): boolean {
  if (provider?.requiresApiKey === false) return false;
  if (isLocalhostBaseUrl(baseUrl)) return false;

  return true;
}
