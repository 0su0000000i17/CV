import type { Request } from "express";
import type { User } from "@supabase/supabase-js";

import { supabaseAdmin } from "../lib/supabase.js";
import { parseBearerToken } from "./bearer-token.js";

export type RequestAuthResult = {
  user: User | null;
  errorMessage: string | null;
};

const authPromiseByRequest = new WeakMap<Request, Promise<RequestAuthResult>>();
const authResultByRequest = new WeakMap<Request, RequestAuthResult>();

async function authenticateRequest(req: Request): Promise<RequestAuthResult> {
  const token = parseBearerToken(req.headers.authorization);

  if (!token) {
    return {
      user: null,
      errorMessage: "Auth token is required",
    };
  }

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return {
      user: null,
      errorMessage: "Unauthorized",
    };
  }

  return {
    user,
    errorMessage: null,
  };
}

export function getUserFromRequest(req: Request) {
  const cachedPromise = authPromiseByRequest.get(req);
  if (cachedPromise) return cachedPromise;

  const authPromise = authenticateRequest(req).then((result) => {
    authResultByRequest.set(req, result);
    return result;
  });
  authPromiseByRequest.set(req, authPromise);
  return authPromise;
}

export function getAuthenticatedUserFromRequest(req: Request) {
  return authResultByRequest.get(req)?.user ?? null;
}
