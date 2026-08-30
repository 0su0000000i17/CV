import "dotenv/config";

import cors from "cors";
import express from "express";
import helmet from "helmet";

import { apiEndpointRateLimiter } from "./middleware/rate-limit.js";
import { mountApiRoutes } from "./routes/mount-api-routes.js";
import { getSafeErrorMessage } from "./utils/api-responses.js";

const REQUEST_BODY_LIMIT = "10mb";

function isPayloadTooLargeError(error: unknown) {
  if (!error || typeof error !== "object") return false;

  const typedError = error as { status?: number; type?: string };
  return typedError.status === 413 || typedError.type === "entity.too.large";
}

function configureTrustProxy(app: express.Express) {
  const trustProxy = process.env.TRUST_PROXY?.trim();
  if (!trustProxy) return;

  app.set(
    "trust proxy",
    /^\d+$/u.test(trustProxy) ? Number(trustProxy) : trustProxy
  );
}

export function createApp() {
  const frontendUrl = process.env.FRONTEND_URL;
  if (!frontendUrl) {
    throw new Error("FRONTEND_URL environment variable is required to configure CORS");
  }

  const app = express();
  configureTrustProxy(app);
  app.disable("x-powered-by");
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
      hsts: process.env.NODE_ENV === "production" ? undefined : false,
      referrerPolicy: { policy: "no-referrer" },
    })
  );
  // The API authenticates exclusively through Authorization bearer tokens;
  // cross-origin cookies are neither required nor accepted.
  app.use(cors({ origin: frontendUrl, credentials: false }));
  app.use("/api", (_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });
  app.use("/api", apiEndpointRateLimiter);
  app.use(express.json({ limit: REQUEST_BODY_LIMIT }));
  app.use(express.urlencoded({ extended: true, limit: REQUEST_BODY_LIMIT }));

  mountApiRoutes(app);
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/api", (_req, res) => {
    res.status(404).json({ message: "API route not found" });
  });
  app.use(
    (
      error: unknown,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      if (isPayloadTooLargeError(error)) {
        return res.status(413).json({ message: "Request payload is too large" });
      }

      console.error("[server] Unhandled error:", getSafeErrorMessage(error));
      return res.status(500).json({ message: "Internal server error" });
    }
  );

  return app;
}
