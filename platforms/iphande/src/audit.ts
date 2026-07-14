import { Router, Request, Response } from 'express';
import { db } from './db';
import { v4 as uuidv4 } from 'uuid';

export const auditRouter = Router();

auditRouter.post('/log', (req: Request, res: Response) => {
  const { traceId, correlationId, sourceLayer, domain, action, actorId, targetResource } = req.body;
  if (!traceId || !action || !actorId || !targetResource) {
    return res.status(400).json({ error: 'Missing required audit fields' });
  }

  const eventId = uuidv4();
  
  try {
    db.prepare(`
      INSERT INTO AuditLog (eventId, traceId, correlationId, sourceLayer, domain, action, actorId, targetResource)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(eventId, traceId, correlationId || null, sourceLayer || 'API', domain || 'unknown', action, actorId, targetResource);
    
    res.status(201).json({ success: true, eventId });
  } catch (e: any) {
    console.error("Failed to write audit log:", e);
    res.status(500).json({ error: 'Failed to write audit log' });
  }
});
