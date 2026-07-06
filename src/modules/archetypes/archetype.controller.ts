import { Request, Response, NextFunction } from 'express';
import * as archetypeService from '@/modules/archetypes/archetype.service';

export const getArchetypesHandler = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const archetypes = await archetypeService.getArchetypes();
    res.json({ message: 'Archetypes retrieved successfully', data: archetypes });
  } catch (error) {
    next(error);
  }
};

export const getArchetypeHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const archetype = await archetypeService.getArchetype(req.params.id as string);
    res.json({ message: 'Archetype retrieved successfully', data: archetype });
  } catch (error) {
    next(error);
  }
};

export const createSessionFromArchetypeHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await archetypeService.createSessionFromArchetype(req.user!.id, req.params.id as string);
    res.status(201).json({ message: 'Session created from archetype successfully', data: session });
  } catch (error) {
    next(error);
  }
};
