import { randomUUID } from "node:crypto";

import { AiConfigurationError, AiProviderError } from "../errors.js";
import type {
  AiGenerateTextParams,
  AiGenerateTextResult,
  AiMessage,
  AiProvider,
} from "../types.js";

type GigaChatTokenResponse = {
  access_token?: string;
  expires_at?: number;
};

type GigaChatChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

type CachedToken = {
  accessToken: string;
  expiresAtMs: number;
};

const DEFAULT_AUTH_URL = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth";
const DEFAULT_API_URL = "https://gigachat.devices.sberbank.ru/api/v1";
const DEFAULT_SCOPE = "GIGACHAT_API_PERS";
const DEFAULT_MODEL = "GigaChat";
const DEFAULT_TIMEOUT_MS = 30_000;
const TOKEN_REFRESH_SAFETY_WINDOW_MS = 60_000;
const FALLBACK_TOKEN_TTL_MS = 25 * 60 * 1000;

let cachedToken: CachedToken | null = null;

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new AiConfigurationError(`${name} is required`);
  }

  return value;
}

function getOptionalEnv(name: string, fallback: string) {
  return process.env[name]?.trim() || fallback;
}

function getGigaChatAuthorizationKey() {
  const authKey = process.env.GIGACHAT_AUTH_KEY?.trim();

  if (authKey) {
    return authKey;
  }

  const clientId = getRequiredEnv("GIGACHAT_CLIENT_ID");
  const clientSecret = getRequiredEnv("GIGACHAT_CLIENT_SECRET");

  return Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
}

function getGigaChatConfig() {
  return {
    authUrl: getOptionalEnv("GIGACHAT_AUTH_URL", DEFAULT_AUTH_URL),
    apiUrl: getOptionalEnv("GIGACHAT_API_URL", DEFAULT_API_URL).replace(/\/$/, ""),
    authorizationKey: getGigaChatAuthorizationKey(),
    scope: getOptionalEnv("GIGACHAT_SCOPE", DEFAULT_SCOPE),
    model: getOptionalEnv("GIGACHAT_MODEL", DEFAULT_MODEL),
    timeoutMs: Number(process.env.GIGACHAT_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS,
  };
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function readProviderError(response: Response) {
  const responseText = await response.text();

  if (!responseText) {
    return `AI provider request failed with status ${response.status}`;
  }

  return `AI provider request failed with status ${response.status}: ${responseText}`;
}

function getTokenExpirationMs(expiresAt?: number) {
  if (!expiresAt) {
    return Date.now() + FALLBACK_TOKEN_TTL_MS;
  }

  return expiresAt;
}

async function getAccessToken() {
  const config = getGigaChatConfig();

  if (
    cachedToken &&
    cachedToken.expiresAtMs - TOKEN_REFRESH_SAFETY_WINDOW_MS > Date.now()
  ) {
    return cachedToken.accessToken;
  }

  const body = new URLSearchParams({
    scope: config.scope,
  });

  const response = await fetchWithTimeout(
    config.authUrl,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${config.authorizationKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
        RqUID: randomUUID(),
      },
      body,
    },
    config.timeoutMs
  );

  if (!response.ok) {
    throw new AiProviderError(await readProviderError(response), response.status);
  }

  const data = (await response.json()) as GigaChatTokenResponse;

  if (!data.access_token) {
    throw new AiProviderError("AI provider did not return an access token");
  }

  cachedToken = {
    accessToken: data.access_token,
    expiresAtMs: getTokenExpirationMs(data.expires_at),
  };

  return cachedToken.accessToken;
}

function mapMessages(messages: AiMessage[]) {
  return messages.map((message) => ({
    role: message.role,
    content: message.content,
  }));
}

export function createGigaChatProvider(): AiProvider {
  return {
    async generateText(
      params: AiGenerateTextParams
    ): Promise<AiGenerateTextResult> {
      const config = getGigaChatConfig();
      const accessToken = await getAccessToken();

      const response = await fetchWithTimeout(
        `${config.apiUrl}/chat/completions`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: config.model,
            messages: mapMessages(params.messages),
            temperature: params.temperature ?? 0.2,
            max_tokens: params.maxTokens,
          }),
        },
        config.timeoutMs
      );

      if (!response.ok) {
        throw new AiProviderError(
          await readProviderError(response),
          response.status
        );
      }

      const data = (await response.json()) as GigaChatChatResponse;
      const text = data.choices?.[0]?.message?.content?.trim();

      if (!text) {
        throw new AiProviderError("AI provider returned an empty response");
      }

      return {
        text,
        provider: "gigachat",
        model: config.model,
      };
    },
  };
}
