const DEFAULT_POLL_INTERVAL_MS = 2_000;
const DEFAULT_STALE_SECONDS = 10 * 60;
const MAX_ERROR_MESSAGE_LENGTH = 1_500;

function positiveNumber(names: string[], fallback: number, minimum: number) {
  for (const name of names) {
    const value = Number(process.env[name]);
    if (Number.isFinite(value) && value > 0) return Math.max(minimum, value);
  }
  return fallback;
}

export function workerConcurrency(name: string, fallback: number) {
  return () => positiveNumber([name], fallback, 1);
}

export function workerPollInterval(name: string, fallbackName?: string) {
  return () => positiveNumber(
    [name, ...(fallbackName ? [fallbackName] : [])],
    DEFAULT_POLL_INTERVAL_MS,
    500,
  );
}

export function workerStaleSeconds(name: string, fallbackName?: string) {
  return () => positiveNumber(
    [name, ...(fallbackName ? [fallbackName] : [])],
    DEFAULT_STALE_SECONDS,
    60,
  );
}

export function workerEnabled(name: string, fallbackName?: string) {
  return () => {
    const specific = process.env[name];
    if (specific !== undefined) return specific === "true";
    return fallbackName ? process.env[fallbackName] === "true" : false;
  };
}

export function taskErrorMessage(error: unknown, fallback: string) {
  const message = getSafeErrorMessage(error);
  return (message === "Unknown error" ? fallback : message)
    .slice(0, MAX_ERROR_MESSAGE_LENGTH);
}
import { getSafeErrorMessage } from "../utils/api-responses.js";
