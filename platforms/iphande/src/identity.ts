import { Router, Request, Response } from 'express';
import { db } from './db';

export const identityRouter = Router();

identityRouter.get('/me', (req: Request, res: Response) => {
  const authUserId = req.headers['x-auth-user-id']; // Simulated internal header from API gateway / JWT middleware
  if (!authUserId) return res.status(401).json({ error: 'Unauthorized' });

  const person: any = db.prepare('SELECT * FROM Person WHERE authUserId = ?').get(authUserId);
  if (!person) return res.status(404).json({ error: 'Person not found' });

  // Resolve Memberships & Permissions
  const memberships = db.prepare(`
    SELECT m.organizationId, o.slug as orgSlug, r.name as roleName, p.action, p.resource
    FROM Membership m
    JOIN Organization o ON m.organizationId = o.id
    JOIN Role r ON m.roleId = r.id
    JOIN RolePermission rp ON r.id = rp.roleId
    JOIN Permission p ON rp.permissionId = p.id
    WHERE m.personId = ? AND m.status = 'ACTIVE'
  `).all(person.id) as any[];

  // Group permissions by Organization
  const orgs: Record<string, any> = {};
  memberships.forEach(row => {
    if (!orgs[row.organizationId]) {
      orgs[row.organizationId] = {
        id: row.organizationId,
        slug: row.orgSlug,
        role: row.roleName,
        permissions: []
      };
    }
    orgs[row.organizationId].permissions.push(`${row.action}:${row.resource}`);
  });

  res.json({
    person: { id: person.id, name: person.preferredName },
    memberships: Object.values(orgs)
  });
});
