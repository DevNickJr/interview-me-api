import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { getSpeechProvider } from '../services/speech';

const router = Router();

const ttsSchema = z.object({
  text: z.string().min(1).max(5000),
  voice: z.string().optional(),
  speed: z.number().min(0.5).max(2.0).optional(),
});

router.use(requireAuth);

// Text to Speech
router.post('/tts', validate(ttsSchema), async (req: Request, res: Response, next: NextFunction) => {
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
});

// Speech to Text
router.post('/stt', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', async () => {
      try {
        const audioBuffer = Buffer.concat(chunks);
        const mimeType = req.headers['content-type'] || 'audio/webm';

        const speech = getSpeechProvider();
        const transcript = await speech.speechToText({ audio: audioBuffer, mimeType });

        res.json({ transcript });
      } catch (error) {
        next(error);
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
