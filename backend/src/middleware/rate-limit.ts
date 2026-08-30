import type { Request } from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

import { getAuthenticatedUserFromRequest } from "../utils/auth.js";

function getAuthenticatedRateLimitKey(req: Request) {
  const user = getAuthenticatedUserFromRequest(req);
  const address = req.ip ?? req.socket.remoteAddress ?? "unknown";
  return user ? `user:${user.id}` : `ip:${ipKeyGenerator(address)}`;
}

const skipPreflight = (req: Request) => req.method === "OPTIONS";

const API_RATE_LIMIT_WINDOW_MS =
  Number(process.env.API_RATE_LIMIT_WINDOW_MS) || 5 * 60 * 1000;
const API_RATE_LIMIT_MAX_REQUESTS =
  Number(process.env.API_RATE_LIMIT_MAX_REQUESTS) || 600;

export const apiEndpointRateLimiter = rateLimit({
  windowMs: API_RATE_LIMIT_WINDOW_MS,
  limit: API_RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipPreflight,
  message: { message: "Too many requests" },
});

// Generous by default so normal usage (including manual testing) never hits
// it; it exists to stop scripted abuse of endpoints that trigger paid AI
// provider calls. Tunable via env without a code change/redeploy of logic.
const AI_RATE_LIMIT_WINDOW_MS = Number(process.env.AI_RATE_LIMIT_WINDOW_MS) || 5 * 60 * 1000;
const AI_RATE_LIMIT_MAX_REQUESTS = Number(process.env.AI_RATE_LIMIT_MAX_REQUESTS) || 30;

export const aiEndpointRateLimiter = rateLimit({
  windowMs: AI_RATE_LIMIT_WINDOW_MS,
  limit: AI_RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getAuthenticatedRateLimitKey,
  skip: skipPreflight,
  message: {
    message: "Слишком много запросов. Попробуйте немного позже.",
  },
});

const UPLOAD_RATE_LIMIT_WINDOW_MS =
  Number(process.env.UPLOAD_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
const UPLOAD_RATE_LIMIT_MAX_REQUESTS =
  Number(process.env.UPLOAD_RATE_LIMIT_MAX_REQUESTS) || 15;

export const uploadEndpointRateLimiter = rateLimit({
  windowMs: UPLOAD_RATE_LIMIT_WINDOW_MS,
  limit: UPLOAD_RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getAuthenticatedRateLimitKey,
  skip: skipPreflight,
  message: { message: "Too many resume upload attempts" },
});

const MARKET_RATE_LIMIT_WINDOW_MS =
  Number(process.env.MARKET_RATE_LIMIT_WINDOW_MS) || 60 * 1000;
const MARKET_RATE_LIMIT_MAX_REQUESTS =
  Number(process.env.MARKET_RATE_LIMIT_MAX_REQUESTS) || 60;

export const marketEndpointRateLimiter = rateLimit({
  windowMs: MARKET_RATE_LIMIT_WINDOW_MS,
  limit: MARKET_RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getAuthenticatedRateLimitKey,
  skip: skipPreflight,
  message: {
    message: "Слишком много запросов к данным рынка. Попробуйте немного позже.",
  },
});
