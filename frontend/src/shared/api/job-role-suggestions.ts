import { createAuthHeaders, getApiUrl, parseApiResponse } from './http';

export type JobRoleSuggestion = {
  id: string;
  text: string;
};

export async function searchJobRoles(params: {
  query: string;
  accessToken: string;
}) {
  const query = new URLSearchParams({ query: params.query });
  const response = await fetch(`${getApiUrl()}/api/market/roles?${query}`, {
    headers: createAuthHeaders(params.accessToken),
  });
  return parseApiResponse<{ roles: JobRoleSuggestion[] }>(
    response,
    'Не удалось получить подсказки должностей'
  );
}
