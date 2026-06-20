import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import { profileRouter } from "./routes/profile.js";
import { resumesRouter } from "./routes/resumes.js";

const app = express();

const PORT = Number(process.env.PORT) || 5000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/profile", profileRouter);
app.use("/api/resumes", resumesRouter);

app.get('/api/health', (_, res) => {
  res.json({
    status: 'ok',
  });
});

app.get('/api/test', (_, res) => {
  res.json({
    message: 'Backend works 🚀',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend started on http://localhost:${PORT}`);
});
