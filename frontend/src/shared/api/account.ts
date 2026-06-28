import { createAuthHeaders, getApiUrl, parseApiResponse } from './http';

type RemoveAccountResponse = {
  success: boolean;
};

export async function removeAccount(accessToken: string) {
  const response = await fetch(`${getApiUrl()}/api/account`, {
    method: 'DELETE',
    headers: {
      ...createAuthHeaders(accessToken),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ confirmation: 'DELETE_ACCOUNT' }),
  });

  return parseApiResponse<RemoveAccountResponse>(
    response,
    'Failed to remove account'
  );
}
