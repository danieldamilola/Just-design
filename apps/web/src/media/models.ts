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

export const MEDIA_PROVIDERS: MediaProvider[] = [];
export const IMAGE_MODELS: MediaModel[] = [
  { id: 'vela/gpt-image-2', label: 'GPT Image 2', provider: 'vela', hint: '', default: true },
  { id: 'gpt-image-2', label: 'GPT Image 2 (BYOK)', provider: 'openai', hint: '', default: false },
];
export const mediaModelProviderId = (modelId: string) => modelId.split('/')[0] || '';

export const AUDIO_MODELS_BY_KIND: Record<string, MediaModel[]> = {
  speech: [],
  sfx: [],
  music: [],
};
export const DEFAULT_AUDIO_MODEL: any = { speech: '', sfx: '', music: '' };
export const DEFAULT_IMAGE_MODEL = 'vela/gpt-image-2';
export const DEFAULT_VIDEO_MODEL = 'vela/gpt-video-1';
export const MEDIA_ASPECTS: MediaAspect[] = ['16:9', '1:1', '9:16'];
export const VIDEO_LENGTHS_SEC: number[] = [5, 10];
export const VIDEO_MODELS: MediaModel[] = [
  { id: 'vela/gpt-video-1', label: 'GPT Video 1', provider: 'vela', hint: '', default: true },
];
export const findProvider = (providerId: string) => MEDIA_PROVIDERS.find((p) => p.id === providerId) || ({} as MediaProvider);
export const AUDIO_DURATIONS_SEC: number[] = [5, 10, 15, 30];
