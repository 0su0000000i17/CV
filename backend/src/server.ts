import "dotenv/config";

import cors from "cors";
import express from "express";

import { accountRouter } from "./routes/account.js";
import { adminRouter } from "./routes/admin.js";
import { aiRouter } from "./routes/ai.js";
import { coverLettersRouter } from "./routes/cover-letters.js";
import { profileRouter } from "./routes/profile.js";
import { resumesRouter } from "./routes/resumes.js";
import { vacanciesRouter } from "./routes/vacancies.js";
import { startAdaptationWorker } from "./controllers/resume-adaptation.js";

const app = express();

const PORT = Number(process.env.PORT) || 5000;
const REQUEST_BODY_LIMIT = "10mb";

function isPayloadTooLargeError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const typedError = error as {
    status?: number;
    type?: string;
  };

  return typedError.status === 413 || typedError.type === "entity.too.large";
}

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(
  express.json({
    limit: REQUEST_BODY_LIMIT,
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: REQUEST_BODY_LIMIT,
  })
);

app.use("/api/account", accountRouter);
app.use("/api/admin", adminRouter);
app.use("/api/ai", aiRouter);
app.use("/api/cover-letters", coverLettersRouter);
app.use("/api/profile", profileRouter);
app.use("/api/resumes", resumesRouter);
app.use("/api/vacancies", vacanciesRouter);

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
    if (isPayloadTooLargeError(error)) {
      return res.status(413).json({
        message: "Request payload is too large",
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
);

app.listen(PORT, () => {
  console.log(`🚀 Backend started on http://localhost:${PORT}`);
  startAdaptationWorker();
});
