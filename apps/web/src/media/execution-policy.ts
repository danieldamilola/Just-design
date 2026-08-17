import type { ProjectMetadata } from '../types';

export interface MediaExecutionPolicy {
  mode: 'enabled' | 'disabled';
  allowedSurfaces?: string[];
  allowedModels?: string[];
}

export function mediaExecutionPolicyForProjectMetadata(
  metadata?: ProjectMetadata | null,
): MediaExecutionPolicy {
  if (!metadata || !metadata.kind) {
    return { mode: 'disabled' };
  }
  const allowedSurfaces = [metadata.kind];
  const model = metadata.imageModel || metadata.videoModel || (metadata as any).audioModel;
  return {
    mode: 'enabled',
    allowedSurfaces,
    ...(model ? { allowedModels: [model] } : {}),
  };
}
