import type {
  ProfileCreateRequest,
  ProfileUpdateRequest,
  ProfileResponse,
  ProfileDetailResponse,
  LanguageResponse,
  InterestResponse,
  TravelStyleResponse,
} from "../types/profile";
import type {
  MessageResponse,
  LanguageBase,
  InterestBase,
  TravelStyleBase,
} from "../types/auth";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "";

async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = sessionStorage.getItem("tripmate_access");
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    // Token expired, redirect to login
    sessionStorage.removeItem("tripmate_access");
    sessionStorage.removeItem("tripmate_refresh");
    sessionStorage.removeItem("tripmate_user");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  return response;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Request failed" }));
    throw new Error(
      error.message || error.detail?.[0]?.msg || `HTTP ${response.status}`,
    );
  }
  return response.json();
}

export const profilesApi = {
  // Profile CRUD
  async create(data: ProfileCreateRequest): Promise<ProfileResponse> {
    const response = await fetchWithAuth(`${BASE}/api/v1/profiles`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return handleResponse<ProfileResponse>(response);
  },

  async getMyProfile(): Promise<ProfileDetailResponse> {
    const response = await fetchWithAuth(`${BASE}/api/v1/profiles/me`, {
      method: "GET",
    });
    return handleResponse<ProfileDetailResponse>(response);
  },

  async getProfile(profileId: number): Promise<ProfileDetailResponse> {
    const response = await fetchWithAuth(
      `${BASE}/api/v1/profiles/${profileId}`,
      {
        method: "GET",
      },
    );
    return handleResponse<ProfileDetailResponse>(response);
  },

  async updateMyProfile(data: ProfileUpdateRequest): Promise<ProfileResponse> {
    const response = await fetchWithAuth(`${BASE}/api/v1/profiles/me`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return handleResponse<ProfileResponse>(response);
  },

  async deleteMyProfile(): Promise<MessageResponse> {
    const response = await fetchWithAuth(`${BASE}/api/v1/profiles/me`, {
      method: "DELETE",
    });
    return handleResponse<MessageResponse>(response);
  },

  // Languages
  async setLanguages(languageIds: number[]): Promise<MessageResponse> {
    const response = await fetchWithAuth(
      `${BASE}/api/v1/profiles/me/languages`,
      {
        method: "PUT",
        body: JSON.stringify(languageIds),
      },
    );
    return handleResponse<MessageResponse>(response);
  },

  async addLanguage(languageId: number): Promise<MessageResponse> {
    const body: LanguageBase = { language_id: languageId };
    const response = await fetchWithAuth(
      `${BASE}/api/v1/profiles/me/languages`,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    );
    return handleResponse<MessageResponse>(response);
  },

  async removeLanguage(languageId: number): Promise<MessageResponse> {
    const response = await fetchWithAuth(
      `${BASE}/api/v1/profiles/me/languages/${languageId}`,
      { method: "DELETE" },
    );
    return handleResponse<MessageResponse>(response);
  },

  // Interests
  async setInterests(interestIds: number[]): Promise<MessageResponse> {
    const response = await fetchWithAuth(
      `${BASE}/api/v1/profiles/me/interests`,
      {
        method: "PUT",
        body: JSON.stringify(interestIds),
      },
    );
    return handleResponse<MessageResponse>(response);
  },

  async addInterest(interestId: number): Promise<MessageResponse> {
    const body: InterestBase = { interest_id: interestId };
    const response = await fetchWithAuth(
      `${BASE}/api/v1/profiles/me/interests`,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    );
    return handleResponse<MessageResponse>(response);
  },

  async removeInterest(interestId: number): Promise<MessageResponse> {
    const response = await fetchWithAuth(
      `${BASE}/api/v1/profiles/me/interests/${interestId}`,
      { method: "DELETE" },
    );
    return handleResponse<MessageResponse>(response);
  },

  // Travel Styles
  async setTravelStyles(travelStyleIds: number[]): Promise<MessageResponse> {
    const response = await fetchWithAuth(
      `${BASE}/api/v1/profiles/me/travel-styles`,
      {
        method: "PUT",
        body: JSON.stringify(travelStyleIds),
      },
    );
    return handleResponse<MessageResponse>(response);
  },

  async addTravelStyle(travelStyleId: number): Promise<MessageResponse> {
    const body: TravelStyleBase = { travel_style_id: travelStyleId };
    const response = await fetchWithAuth(
      `${BASE}/api/v1/profiles/me/travel-styles`,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    );
    return handleResponse<MessageResponse>(response);
  },

  async removeTravelStyle(travelStyleId: number): Promise<MessageResponse> {
    const response = await fetchWithAuth(
      `${BASE}/api/v1/profiles/me/travel-styles/${travelStyleId}`,
      { method: "DELETE" },
    );
    return handleResponse<MessageResponse>(response);
  },

  // Options
  async getAllLanguages(): Promise<LanguageResponse[]> {
    const response = await fetch(`${BASE}/api/v1/profiles/options/languages`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    return handleResponse<LanguageResponse[]>(response);
  },

  async getAllInterests(): Promise<InterestResponse[]> {
    const response = await fetch(`${BASE}/api/v1/profiles/options/interests`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    return handleResponse<InterestResponse[]>(response);
  },

  async getAllTravelStyles(): Promise<TravelStyleResponse[]> {
    const response = await fetch(
      `${BASE}/api/v1/profiles/options/travel-styles`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
      },
    );
    return handleResponse<TravelStyleResponse[]>(response);
  },
};
