import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import {
  closeDatabase,
  ensureWorkspaceProject,
  insertProject,
  openDatabase,
} from '../../src/db.js';
import { pinRunWorkspaceScopeForProject } from '../../src/runtimes/project-amr-trace-env.js';

let tempDir: string | null = null;

afterEach(() => {
  closeDatabase();
  if (tempDir) fs.rmSync(tempDir, { recursive: true, force: true });
  tempDir = null;
});

function projectDb(input: {
  projectId: string;
  workspaceId?: string;
  memberId?: string;
}) {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'od-project-scope-'));
  const db = openDatabase(tempDir);
  const now = Date.now();
  insertProject(db, {
    id: input.projectId,
    name: input.projectId,
    createdAt: now,
    updatedAt: now,
  });
  if (input.workspaceId) {
    ensureWorkspaceProject(db, {
      projectId: input.projectId,
      workspaceId: input.workspaceId,
      visibility: 'personal',
      createdByWorkspaceMemberId: input.memberId ?? null,
    });
  }
  return db;
}

describe('pinRunWorkspaceScopeForProject', () => {
  it('returns null when the project has no Workspace binding', () => {
    const db = projectDb({ projectId: 'project-unbound' });
    expect(pinRunWorkspaceScopeForProject(db, 'project-unbound')).toBeNull();
  });

  it('returns null for an empty project id', () => {
    const db = projectDb({ projectId: 'project-empty' });
    expect(pinRunWorkspaceScopeForProject(db, '   ')).toBeNull();
  });

  it('pins a persisted Team Workspace binding', () => {
    const db = projectDb({
      projectId: 'project-a',
      workspaceId: 'workspace-a',
      memberId: 'member-a',
    });
    const scope = pinRunWorkspaceScopeForProject(db, 'project-a');

    expect(scope).toEqual({
      schemaVersion: 1,
      projectId: 'project-a',
      workspaceId: 'workspace-a',
      workspaceMemberId: 'member-a',
      source: 'persisted_project_binding',
    });
  });

  it('omits workspaceMemberId when the binding has none', () => {
    const db = projectDb({
      projectId: 'project-b',
      workspaceId: 'workspace-b',
    });
    const scope = pinRunWorkspaceScopeForProject(db, 'project-b');

    expect(scope).toEqual({
      schemaVersion: 1,
      projectId: 'project-b',
      workspaceId: 'workspace-b',
      source: 'persisted_project_binding',
    });
  });

  it('freezes the returned scope', () => {
    const db = projectDb({
      projectId: 'project-c',
      workspaceId: 'workspace-c',
    });
    const scope = pinRunWorkspaceScopeForProject(db, 'project-c');
    expect(Object.isFrozen(scope)).toBe(true);
  });
});
