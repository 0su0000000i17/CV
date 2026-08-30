export function pollingNumber(raw: string | undefined, fallback: number, limits: {
  min: number; max: number;
}) {
  const value = Number(raw);
  return Number.isFinite(value)
    ? Math.max(limits.min, Math.min(limits.max, Math.trunc(value)))
    : fallback;
}

export async function pollTaskResult<T>(params: {
  intervalMs: number;
  maxPolls: number;
  fetchStatus: () => Promise<T>;
  isComplete: (value: T) => boolean;
  failureMessage: (value: T) => string | null;
  timeoutMessage: string;
}) {
  for (let attempt = 0; attempt < params.maxPolls; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, params.intervalMs));
    const result = await params.fetchStatus();
    if (params.isComplete(result)) return result;
    const failure = params.failureMessage(result);
    if (failure) throw new Error(failure);
  }
  throw new Error(params.timeoutMessage);
}
