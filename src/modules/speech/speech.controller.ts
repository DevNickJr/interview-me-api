import { Request, Response, NextFunction } from 'express';
import { getSpeechProvider } from '@/services/speech';
import { VOICES, VOICE_IDS } from '@/configs/voices.config';
import CustomError from '@/utils/CustomError';

export const ttsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text, voice, speed } = req.body;

    // Validate voice if provided
    if (voice && !VOICE_IDS.includes(voice)) {
      throw CustomError.badRequest(`Invalid voice. Available: ${VOICE_IDS.join(', ')}`);
    }

    // Check premium voice access
    if (voice) {
      const voiceConfig = VOICES.find((v) => v.id === voice);
      if (voiceConfig && !voiceConfig.free && req.user) {
        const { getUserPlan } = await import('@/modules/subscriptions/subscription.service');
        const plan = await getUserPlan(req.user.id);
        if (!plan.premiumVoices) {
          throw CustomError.forbidden('Premium voices require a paid plan. Upgrade to access this voice.');
        }
      }
    }

    const speech = getSpeechProvider();
    const audioBuffer = await speech.textToSpeech({ text, voice, speed });

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

export const getVoicesHandler = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ message: 'Voices retrieved successfully', data: VOICES });
  } catch (error) {
    next(error);
  }
};
