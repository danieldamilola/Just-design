import { getWorkspaceProjectByProjectId } from '../db.js';

type SqliteDb = Parameters<typeof getWorkspaceProjectByProjectId>[0];

export type PinnedRunWorkspaceScope = Readonly<{
  schemaVersion: 1;
  projectId: string;
  workspaceId: string;
  workspaceMemberId?: string;
  source: 'persisted_project_binding';
}>;

export type RunWorkspaceScope = PinnedRunWorkspaceScope;

/**
 * Freeze the billing address before a run is created.
 *
 * This is the only function in the run path that reads the mutable project
 * binding. Its result is stored on the run and reused for every attempt. The
 * separate account-scoped proof records a genuinely unbound local project;
 * null remains "no proof" and may not silently select a wallet.
 */
export function pinRunWorkspaceScopeForProject(
  db: SqliteDb,
  projectId: string,
): PinnedRunWorkspaceScope | null {
  const normalizedProjectId = projectId.trim();
  if (!normalizedProjectId) return null;
  const binding = getWorkspaceProjectByProjectId(db, normalizedProjectId);
  const workspaceId =
    typeof binding?.workspaceId === 'string' && binding.workspaceId.trim()
      ? binding.workspaceId.trim()
      : null;
  if (!workspaceId) return null;
  const workspaceMemberId =
    typeof binding?.createdByWorkspaceMemberId === 'string'
    && binding.createdByWorkspaceMemberId.trim()
      ? binding.createdByWorkspaceMemberId.trim()
      : null;
  return Object.freeze({
    schemaVersion: 1,
    projectId: normalizedProjectId,
    workspaceId,
    ...(workspaceMemberId ? { workspaceMemberId } : {}),
    source: 'persisted_project_binding',
  });
}
