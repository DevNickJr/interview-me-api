import { Router } from 'express';
import { isAuthenticated } from '@/middlewares/auth.middleware';
import validateRequest from '@/middlewares/validate-request';
import * as Schema from '@/modules/archetypes/archetype.schema';
import * as Controller from '@/modules/archetypes/archetype.controller';

const router = Router();

router.get('/', Controller.getArchetypesHandler);
router.get('/:id', validateRequest([Schema.archetypeIdParamSchema]), Controller.getArchetypeHandler);
router.post('/:id/create-session', isAuthenticated, validateRequest([Schema.createSessionFromArchetypeSchema]), Controller.createSessionFromArchetypeHandler);

export default router;
