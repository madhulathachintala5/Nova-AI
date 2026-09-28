import express from 'express';
import dotenv from 'dotenv';
import apiRoutes from './routes.js';

dotenv.config();

const app = express();

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'NOVA AI Core',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Mount API routes
app.use('/api', apiRoutes);

export default app;
