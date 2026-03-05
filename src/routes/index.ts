import { Router } from 'express';
import authRoutes from './auth.routes';
import sessionRoutes from './session.routes';
import questionRoutes from './question.routes';
import reportRoutes from './report.routes';
import speechRoutes from './speech.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/sessions', sessionRoutes);
router.use('/sessions/:sessionId/questions', questionRoutes);
router.use('/reports', reportRoutes);
router.use('/speech', speechRoutes);

export default router;
