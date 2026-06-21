const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function getApiUrl() {
  if (!API_URL) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured');
  }

  return API_URL;
}

type ApiErrorResponse = {
  message?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

async function readJsonSafely(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function getResponseErrorMessage(data: unknown, fallbackMessage: string) {
  if (!isRecord(data)) {
    return fallbackMessage;
  }

  const errorData = data as ApiErrorResponse;

  if (typeof errorData.message === 'string' && errorData.message.trim()) {
    return errorData.message;
  }

  return fallbackMessage;
}

export async function parseApiResponse<T>(
  response: Response,
  fallbackErrorMessage: string
) {
  const data = await readJsonSafely(response);

  if (!response.ok) {
    throw new Error(getResponseErrorMessage(data, fallbackErrorMessage));
  }

  return data as T;
}

export function createAuthHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}
