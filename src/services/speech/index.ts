import { SpeechProvider } from './types';
import { OpenAISpeechProvider } from './openai.provider';

let cachedProvider: SpeechProvider | null = null;

export function getSpeechProvider(): SpeechProvider {
  if (cachedProvider) return cachedProvider;
  // Currently only OpenAI speech is implemented; extend with other providers as needed
  cachedProvider = new OpenAISpeechProvider();
  return cachedProvider;
}

export type { SpeechProvider, TTSRequest, STTRequest } from './types';
