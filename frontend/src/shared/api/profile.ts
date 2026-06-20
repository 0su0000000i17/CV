export type Profile = {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  updated_at: string;
};

type ProfileResponse = {
  profile: Profile;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getApiUrl() {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  return API_URL;
}

async function parseProfileResponse(response: Response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to process profile request");
  }

  return data as ProfileResponse;
}

export async function getProfile(accessToken: string) {
  const response = await fetch(`${getApiUrl()}/api/profile`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return parseProfileResponse(response);
}

export async function updateProfile(
  fullName: string,
  accessToken: string
) {
  const response = await fetch(`${getApiUrl()}/api/profile`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ full_name: fullName }),
  });

  return parseProfileResponse(response);
}
