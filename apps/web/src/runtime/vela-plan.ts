export interface VelaWalletSnapshot {
  user?: { plan?: string | null } | null;
  account?: { plan?: string | null } | null;
}
const fetchVelaLoginStatus = async (...args: any[]) => null;

const PAID_VELA_PLANS = new Set(['plus', 'pro', 'max']);

function normalizeVelaPlan(plan: string | null | undefined): string | null {
  const normalized = plan?.trim().toLowerCase();
  return normalized || null;
}

export function isPaidVelaPlan(plan: string | null | undefined): boolean {
  const normalized = normalizeVelaPlan(plan);
  return normalized !== null && PAID_VELA_PLANS.has(normalized);
}

export function isFreeVelaPlan(plan: string | null | undefined): boolean {
  return normalizeVelaPlan(plan) === 'free';
}

export async function resolveVelaPlan(
  snapshot?: VelaWalletSnapshot | null,
): Promise<string | null> {
  const status = (await fetchVelaLoginStatus().catch(() => null)) as any;
  if (status?.loggedIn === true) {
    const accountPlan = normalizeVelaPlan(status.account?.plan);
    if (accountPlan) return accountPlan;

    const userPlan = normalizeVelaPlan(status.user?.plan);
    if (userPlan) return userPlan;
  }

  return normalizeVelaPlan(snapshot?.user?.plan);
}