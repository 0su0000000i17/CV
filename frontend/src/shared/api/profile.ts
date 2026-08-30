import { createAuthHeaders, getApiUrl, parseApiResponse } from './http';

type Profile = {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  updated_at: string;
};

type ProfileResponse = {
  profile: Profile;
};

export async function getProfile(accessToken: string) {
  const response = await fetch(`${getApiUrl()}/api/profile`, {
    headers: createAuthHeaders(accessToken),
  });

  return parseApiResponse<ProfileResponse>(response, 'Failed to fetch profile');
}

export async function updateProfile(fullName: string, accessToken: string) {
  const response = await fetch(`${getApiUrl()}/api/profile`, {
    method: 'PATCH',
    headers: {
      ...createAuthHeaders(accessToken),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ full_name: fullName }),
  });

  return parseApiResponse<ProfileResponse>(
    response,
    'Failed to update profile'
  );
}
