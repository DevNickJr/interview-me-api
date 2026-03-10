import OpenAI, { toFile } from 'openai';
import { env } from '../../config/env';
import { SpeechProvider, TTSRequest, STTRequest } from './types';

export class OpenAISpeechProvider implements SpeechProvider {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }

  async textToSpeech(request: TTSRequest): Promise<Buffer> {
    const response = await this.client.audio.speech.create({
      model: 'tts-1',
      voice: (request.voice as any) || 'alloy',
      input: request.text,
      speed: request.speed || 1.0,
    });

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async speechToText(request: STTRequest): Promise<string> {
    const file = await toFile(request.audio, 'audio.webm', { type: request.mimeType });
    const response = await this.client.audio.transcriptions.create({
      model: 'whisper-1',
      file,
    });

    return response.text;
  }
}
