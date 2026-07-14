import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db, EntityStatus } from './db';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only-do-not-use-in-prod';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh-fallback-secret';

const refreshTokens: Record<string, string> = {}; 

function logAudit(action: string, actorId: string, resource: string, traceId: string) {
  console.log(JSON.stringify({ eventId: uuidv4(), traceId, sourceLayer: "A", domain: "iphande", action, actorId, targetResource: resource, timestamp: new Date().toISOString() }));
}

authRouter.post('/register', async (req: Request, res: Response) => {
  const traceId = uuidv4();
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required', traceId });
  
  const existing = db.prepare('SELECT id FROM AuthUser WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Email already exists', traceId });

  const hashedPassword = await bcrypt.hash(password, 10);
  const authUserId = uuidv4();
  const personId = uuidv4();
  
  const insertAuthUser = db.prepare('INSERT INTO AuthUser (id, email, passwordHash, credentialStatus) VALUES (?, ?, ?, ?)');
  const insertPerson = db.prepare('INSERT INTO Person (id, authUserId, preferredName, status) VALUES (?, ?, ?, ?)');
  
  const registerTransaction = db.transaction(() => {
    insertAuthUser.run(authUserId, email, hashedPassword, EntityStatus.ACTIVE);
    insertPerson.run(personId, authUserId, name || email.split('@')[0], EntityStatus.ACTIVE);
  });

  registerTransaction();

  logAudit('USER_REGISTERED', authUserId, `user:${authUserId}`, traceId);
  res.status(201).json({ message: 'User registered', userId: authUserId, traceId });
});

authRouter.post('/login', async (req: Request, res: Response) => {
  const traceId = uuidv4();
  const { email, password } = req.body;
  
  const user: any = db.prepare('SELECT * FROM AuthUser WHERE email = ?').get(email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid credentials', traceId });
  }

  const person: any = db.prepare('SELECT preferredName FROM Person WHERE authUserId = ?').get(user.id);

  const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId: user.id }, REFRESH_SECRET, { expiresIn: '7d' });
  refreshTokens[refreshToken] = user.id;

  logAudit('USER_LOGIN', user.id, `session:${uuidv4()}`, traceId);
  res.json({ accessToken, refreshToken, user: { id: user.id, email: user.email, name: person?.preferredName }, traceId });
});

authRouter.post('/refresh', (req: Request, res: Response) => {
  const traceId = uuidv4();
  const { token } = req.body;
  if (!token || !refreshTokens[token]) return res.status(403).json({ error: 'Invalid refresh token', traceId });

  try {
    const decoded = jwt.verify(token, REFRESH_SECRET) as any;
    const newAccessToken = jwt.sign({ userId: decoded.userId }, JWT_SECRET, { expiresIn: '15m' });
    logAudit('TOKEN_REFRESHED', decoded.userId, `token:${token.substring(0, 8)}...`, traceId);
    res.json({ accessToken: newAccessToken, traceId });
  } catch (e) {
    res.status(403).json({ error: 'Token expired or invalid', traceId });
  }
});

authRouter.post('/logout', (req: Request, res: Response) => {
  const traceId = uuidv4();
  const { token } = req.body;
  if (token && refreshTokens[token]) {
    const userId = refreshTokens[token];
    delete refreshTokens[token];
    logAudit('USER_LOGOUT', userId, `token:${token.substring(0, 8)}...`, traceId);
  }
  res.json({ message: 'Logged out successfully', traceId });
});

authRouter.post('/reset-password', async (req: Request, res: Response) => {
  const traceId = uuidv4();
  const { email, newPassword } = req.body;
  
  const user: any = db.prepare('SELECT id FROM AuthUser WHERE email = ?').get(email);
  if (!user) return res.status(404).json({ error: 'User not found', traceId });

  const hashed = await bcrypt.hash(newPassword, 10);
  db.prepare('UPDATE AuthUser SET passwordHash = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(hashed, user.id);
  
  for (const [t, uid] of Object.entries(refreshTokens)) {
    if (uid === user.id) delete refreshTokens[t];
  }
  
  logAudit('PASSWORD_RESET', user.id, `user:${user.id}`, traceId);
  res.json({ message: 'Password reset successfully', traceId });
});

authRouter.get('/verify-token', (req: Request, res: Response) => {
  const traceId = uuidv4();
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided', traceId });
  const token = authHeader.split(' ')[1];
  try {
    jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, traceId });
  } catch (e) {
    res.status(401).json({ error: 'Invalid or expired token', traceId });
  }
});
