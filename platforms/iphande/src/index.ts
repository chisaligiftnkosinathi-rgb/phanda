import express from 'express';
import cors from 'cors';
import { authRouter } from './auth';
import { identityRouter } from './identity';
import { auditRouter } from './audit';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/identity', identityRouter);
app.use('/api/v1/audit', auditRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'iphande', version: '1.0.0' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`[iPhande] Trust Platform running on port ${PORT}`);
});
