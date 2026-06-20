import { Request, Response, NextFunction } from 'express';
import { getSpeechProvider } from '@/services/speech';

export const ttsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const speech = getSpeechProvider();
    const audioBuffer = await speech.textToSpeech(req.body);

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length.toString(),
    });
    res.send(audioBuffer);
  } catch (error) {
    next(error);
  }
};

export const sttHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', async () => {
      try {
        const audioBuffer = Buffer.concat(chunks);
        const mimeType = req.headers['content-type'] || 'audio/webm';

        const speech = getSpeechProvider();
        const transcript = await speech.speechToText({ audio: audioBuffer, mimeType });

        res.json({ message: 'Speech transcribed successfully', data: { transcript } });
      } catch (error) {
        next(error);
      }
    });
  } catch (error) {
    next(error);
  }
};
