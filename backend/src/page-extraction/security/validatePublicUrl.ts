import type { ParsedPublicUrlResult } from "../types.js";
import { assertPublicHostname, isBlockedHostname } from "./ipAddressGuards.js";

export async function validatePublicUrl(
  rawUrl: string
): Promise<ParsedPublicUrlResult> {
  const trimmedUrl = rawUrl.trim();

  if (!trimmedUrl) {
    return {
      ok: false,
      status: "invalid_url",
      message: "Вставьте ссылку.",
    };
  }

  const urlWithProtocol = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmedUrl)
    ? trimmedUrl
    : `https://${trimmedUrl}`;

  let url: URL;

  try {
    url = new URL(urlWithProtocol);
  } catch {
    return {
      ok: false,
      status: "invalid_url",
      message: "Некорректная ссылка.",
    };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return {
      ok: false,
      status: "blocked_url",
      message: "Поддерживаются только ссылки http и https.",
    };
  }

  if (url.username || url.password) {
    return {
      ok: false,
      status: "blocked_url",
      message: "Ссылки с логином или паролем не поддерживаются.",
    };
  }

  if (isBlockedHostname(url.hostname)) {
    return {
      ok: false,
      status: "blocked_url",
      message: "Эта ссылка заблокирована по соображениям безопасности.",
    };
  }

  try {
    await assertPublicHostname(url.hostname);
  } catch {
    return {
      ok: false,
      status: "blocked_url",
      message: "Эта ссылка заблокирована по соображениям безопасности.",
    };
  }

  url.hash = "";

  return {
    ok: true,
    url,
  };
}

export async function isAllowedPlaywrightRequestUrl(rawUrl: string) {
  let url: URL;

  try {
    url = new URL(rawUrl);
  } catch {
    return false;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return false;
  }

  if (isBlockedHostname(url.hostname)) {
    return false;
  }

  try {
    await assertPublicHostname(url.hostname);
    return true;
  } catch {
    return false;
  }
}