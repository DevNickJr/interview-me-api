import { Router } from 'express';
import { isAuthenticated } from '@/middlewares/auth.middleware';
import validateRequest from '@/middlewares/validate-request';
import * as Schema from '@/modules/speech/speech.schema';
import * as Controller from '@/modules/speech/speech.controller';

const router = Router();

router.use(isAuthenticated);

router.post('/tts', validateRequest([Schema.ttsSchema]), Controller.ttsHandler);
router.post('/stt', Controller.sttHandler);

export default router;
