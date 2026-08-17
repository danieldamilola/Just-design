export type MediaProvider = { 
  id: string; 
  settingsVisible: boolean; 
  integrated: boolean;
  credentialsRequired: boolean;
  supportsCustomModel: boolean;
  hint: string;
  label: string;
  defaultBaseUrl: string;
  customModelPlaceholder: string;
  docsUrl: string;
};
export type MediaModel = { 
  id: string; 
  label: string; 
  provider: string;
  hint: string;
  default: boolean;
};
export type MediaAspect = '16:9' | '1:1' | '9:16';

export const MEDIA_PROVIDERS = [] as MediaProvider[];
export const IMAGE_MODELS: MediaModel[] = [];
export const mediaModelProviderId = (...args: any[]) => '';

export const AUDIO_MODELS_BY_KIND: Record<string, MediaModel[]> = {};
export const DEFAULT_AUDIO_MODEL: any = { speech: '', sfx: '', music: '' };
export const DEFAULT_IMAGE_MODEL = '';
export const DEFAULT_VIDEO_MODEL = '';
export const MEDIA_ASPECTS: any = [];
export const VIDEO_LENGTHS_SEC: number[] = [];
export const VIDEO_MODELS: MediaModel[] = [];
export const findProvider = (...args: any[]) => ({} as MediaProvider);
export const AUDIO_DURATIONS_SEC: number[] = [];
