import type { AmrWalletSnapshot } from '@open-design/contracts';
const fetchVelaLoginStatus = async (...args: any[]) => null;

const PAID_AMR_PLANS = new Set(['plus', 'pro', 'max']);

function normalizeAmrPlan(plan: string | null | undefined): string | null {
  const normalized = plan?.trim().toLowerCase();
  return normalized || null;
}

export function isPaidAmrPlan(plan: string | null | undefined): boolean {
  const normalized = normalizeAmrPlan(plan);
  return normalized !== null && PAID_AMR_PLANS.has(normalized);
}

export function isFreeAmrPlan(plan: string | null | undefined): boolean {
  return normalizeAmrPlan(plan) === 'free';
}

export async function resolveAmrPlan(
  snapshot: AmrWalletSnapshot,
): Promise<string | null> {
  const status = (await fetchVelaLoginStatus().catch(() => null)) as any;
  if (status?.loggedIn === true) {
    const accountPlan = normalizeAmrPlan(status.account?.plan);
    if (accountPlan) return accountPlan;

    const userPlan = normalizeAmrPlan(status.user?.plan);
    if (userPlan) return userPlan;
  }

  return normalizeAmrPlan(snapshot.user?.plan);
}
