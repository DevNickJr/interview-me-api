export interface TTSRequest {
  text: string;
  voice?: string;
  speed?: number;
}

export interface STTRequest {
  audio: Buffer;
  mimeType: string;
}

export interface SpeechProvider {
  textToSpeech(request: TTSRequest): Promise<Buffer>;
  speechToText(request: STTRequest): Promise<string>;
}
