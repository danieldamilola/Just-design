// Vela (Open Design Cloud) console URLs — the account/billing surface for
// team workspaces. The web bundle ships publicly, so the hostnames of internal
// (non-public) vela environments are not literals in this source tree:
// packaging injects the origin from a CI secret and the daemon hands it to the
// client at runtime. Kept module-level rather than threaded through every
// caller because it is a property of the runtime, not of any one call site.

const VELA_CONSOLE_URL =
  'https://open-design.ai/amr/dashboard?source=open_design';

// Path + attribution the console is always reached through, so a runtime
// origin only has to carry the host.
const VELA_CONSOLE_PATH = '/dashboard?source=open_design';

/**
 * The console's `billing=<intent>` value that means "open the upgrade surface
 * that matches THIS workspace".
 *
 * The dashboard resolves it against the workspace's own subscription state
 * rather than trusting the caller: a personal owner gets the personal plan
 * modal, a team that never subscribed gets first-checkout, and a subscribed
 * team gets change-plan. That is why this client links one intent for every
 * state instead of guessing a per-state parameter.
 */
export const VELA_CONSOLE_UPGRADE_INTENT = 'plan';

const VELA_CONSOLE_URL_BY_PROFILE: Record<string, string> = {
  prod: VELA_CONSOLE_URL,
  test: 'https://vela.powerformer.net/dashboard?source=open_design',
  local: 'http://localhost:5173/dashboard?source=open_design',
};

// Every vela profile the packaged runtime can be built with (mirrors the
// daemon's resolveVelaProfile allowlist). Anything else is treated as prod.
const KNOWN_VELA_PROFILES: ReadonlySet<string> = new Set([
  'prod',
  'test',
  'feature-test',
  'local',
]);

// Console origin the daemon reported for THIS runtime (GET
// /api/integrations/vela/status -> consoleOrigin, sourced from OD_VELA_WEB_URL).
let runtimeVelaConsoleOrigin: string | null = null;

/**
 * Record the vela console origin the daemon reported, or clear it with a blank
 * value. Normalizes away a trailing slash so callers can append console paths.
 */
export function setRuntimeVelaConsoleOrigin(
  origin: string | null | undefined,
): void {
  const normalized = origin?.trim().replace(/\/$/, '') ?? '';
  runtimeVelaConsoleOrigin = normalized.length > 0 ? normalized : null;
}

export function velaConsoleUrlForProfile(
  profile: string | null | undefined,
): string {
  const normalized = profile?.trim() || 'prod';
  // prod's console is the public product URL and stays pinned to it: a runtime
  // origin must never be able to redirect a production user's account, plan, or
  // upgrade links somewhere else. Unrecognized profiles are treated as prod for
  // the same reason.
  if (normalized === 'prod' || !KNOWN_VELA_PROFILES.has(normalized)) {
    return VELA_CONSOLE_URL;
  }
  if (runtimeVelaConsoleOrigin) {
    return `${runtimeVelaConsoleOrigin}${VELA_CONSOLE_PATH}`;
  }
  return VELA_CONSOLE_URL_BY_PROFILE[normalized] ?? VELA_CONSOLE_URL;
}

function velaWorkspaceUrl(
  profile: string | null | undefined,
  workspaceId: string | null | undefined,
  intent?: 'plans',
): string | null {
  const normalizedWorkspaceId = workspaceId?.trim();
  if (!normalizedWorkspaceId) return null;
  const url = new URL(velaConsoleUrlForProfile(profile));
  url.searchParams.set('workspaceId', normalizedWorkspaceId);
  if (intent === 'plans') {
    url.searchParams.set('billing', VELA_CONSOLE_UPGRADE_INTENT);
  }
  return url.toString();
}

export function velaConsoleUrlForWorkspace(
  profile: string | null | undefined,
  workspaceId: string | null | undefined,
): string | null {
  return velaWorkspaceUrl(profile, workspaceId);
}

export function velaPlansUrlForWorkspace(
  profile: string | null | undefined,
  workspaceId: string | null | undefined,
): string | null {
  return velaWorkspaceUrl(profile, workspaceId, 'plans');
}

// Console dashboard deep-linked to open the subscription/plans modal, used by
// the "Upgrade" affordances next to the plan tier.
export function velaPlansUrlForProfile(
  profile: string | null | undefined,
): string {
  const base = velaConsoleUrlForProfile(profile);
  const intent = `billing=${VELA_CONSOLE_UPGRADE_INTENT}`;
  return base.includes('?') ? `${base}&${intent}` : `${base}?${intent}`;
}

export function velaProfileBadgeLabel(
  profile: string | null | undefined,
): string | null {
  if (profile === 'test') return 'TEST';
  if (profile === 'feature-test') return 'FEATURE TEST';
  if (profile === 'local') return 'LOCAL';
  return null;
}