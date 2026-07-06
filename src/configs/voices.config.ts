export interface VoiceConfig {
  id: string;
  name: string;
  description: string;
  free: boolean;
}

export const VOICES: VoiceConfig[] = [
  { id: 'alloy', name: 'Alloy', description: 'Neutral & balanced', free: true },
  { id: 'echo', name: 'Echo', description: 'Warm & clear', free: true },
  { id: 'nova', name: 'Nova', description: 'Bright & expressive', free: false },
  { id: 'fable', name: 'Fable', description: 'British & articulate', free: false },
  { id: 'onyx', name: 'Onyx', description: 'Deep & authoritative', free: false },
  { id: 'shimmer', name: 'Shimmer', description: 'Soft & friendly', free: false },
];

export const FREE_VOICES = VOICES.filter((v) => v.free);
export const VOICE_IDS = VOICES.map((v) => v.id);
