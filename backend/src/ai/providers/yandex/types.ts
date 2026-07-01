export type YandexConfig = {
  apiKey: string;
  folderId: string;
  liteModel: string;
  proModel: string;
  completionUrl: string;
  operationBaseUrl: string;
  timeoutMs: number;
  pollIntervalMs: number;
  enableServerDataLogging: boolean;
};

export type YandexOperation = {
  id?: string;
  done?: boolean;
  response?: unknown;
  error?: unknown;
};
