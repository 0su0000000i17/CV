import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { handleTelegramAuth } from './routes/auth.js';

const app = express();

const PORT = Number(process.env.PORT) || 5000;

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

app.use(cookieParser());

app.use(express.json());

app.post('/api/auth/telegram', handleTelegramAuth);

app.get('/api/health', (_, res) => {
    res.json({
        status: 'ok'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Backend started on http://localhost:${PORT}`);
});

app.get('/api/test', (_, res) => {
    res.json({
        message: 'Backend works 🚀'
    });
});