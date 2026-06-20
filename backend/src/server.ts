import "dotenv/config";

import cors from "cors";
import express from "express";

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

app.get("/api/health", (_, res) => {
  res.json({
    status: "ok",
  });
});

app.use("/api", (_, res) => {
  res.status(404).json({
    message: "API route not found",
  });
});

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
);

app.listen(PORT, () => {
  console.log(`🚀 Backend started on http://localhost:${PORT}`);
});