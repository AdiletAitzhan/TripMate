import type {
  TripVacancyCreateRequest,
  TripVacancyUpdateRequest,
  TripVacancyResponse,
} from "../types/tripRequest";
import { MessageResponse } from "../types/auth";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "";

interface TripVacancyFilters {
  skip?: number;
  limit?: number;
  destination_city?: string | null;
  destination_country?: string | null;
  status?: string | null;
  start_date_from?: string | null;
  start_date_to?: string | null;
  min_age?: number | null;
  max_age?: number | null;
  min_budget?: number | null;
  max_budget?: number | null;
  gender_preference?: string | null;
  from_city?: string | null;
  from_country?: string | null;
}

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

export const tripVacanciesApi = {
  async create(data: TripVacancyCreateRequest): Promise<TripVacancyResponse> {
    const response = await fetchWithAuth(`${BASE}/api/v1/trip-vacancies`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return handleResponse<TripVacancyResponse>(response);
  },

  async getAll(filters?: TripVacancyFilters): Promise<TripVacancyResponse[]> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.skip !== undefined) params.set("skip", String(filters.skip));
      if (filters.limit !== undefined)
        params.set("limit", String(filters.limit));
      if (filters.destination_city)
        params.set("destination_city", filters.destination_city);
      if (filters.destination_country)
        params.set("destination_country", filters.destination_country);
      if (filters.status) params.set("status", filters.status);
      if (filters.start_date_from)
        params.set("start_date_from", filters.start_date_from);
      if (filters.start_date_to)
        params.set("start_date_to", filters.start_date_to);
      if (filters.min_age !== undefined && filters.min_age !== null)
        params.set("min_age", String(filters.min_age));
      if (filters.max_age !== undefined && filters.max_age !== null)
        params.set("max_age", String(filters.max_age));
      if (filters.min_budget !== undefined && filters.min_budget !== null)
        params.set("min_budget", String(filters.min_budget));
      if (filters.max_budget !== undefined && filters.max_budget !== null)
        params.set("max_budget", String(filters.max_budget));
      if (filters.gender_preference)
        params.set("gender_preference", filters.gender_preference);
      if (filters.from_city) params.set("from_city", filters.from_city);
      if (filters.from_country)
        params.set("from_country", filters.from_country);
    }

    const queryString = params.toString();
    const url = `${BASE}/api/v1/trip-vacancies${queryString ? `?${queryString}` : ""}`;
    const response = await fetchWithAuth(url, { method: "GET" });
    return handleResponse<TripVacancyResponse[]>(response);
  },

  async getMyVacancies(skip = 0, limit = 100): Promise<TripVacancyResponse[]> {
    const params = new URLSearchParams({
      skip: String(skip),
      limit: String(limit),
    });
    const response = await fetchWithAuth(
      `${BASE}/api/v1/trip-vacancies/me?${params}`,
      { method: "GET" },
    );
    return handleResponse<TripVacancyResponse[]>(response);
  },

  async getById(id: number): Promise<TripVacancyResponse> {
    const response = await fetchWithAuth(
      `${BASE}/api/v1/trip-vacancies/${id}`,
      { method: "GET" },
    );
    return handleResponse<TripVacancyResponse>(response);
  },

  async update(
    id: number,
    data: TripVacancyUpdateRequest,
  ): Promise<TripVacancyResponse> {
    const response = await fetchWithAuth(
      `${BASE}/api/v1/trip-vacancies/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
    );
    return handleResponse<TripVacancyResponse>(response);
  },

  async delete(id: number): Promise<MessageResponse> {
    const response = await fetchWithAuth(
      `${BASE}/api/v1/trip-vacancies/${id}`,
      {
        method: "DELETE",
      },
    );
    return handleResponse<MessageResponse>(response);
  },

  async updateStatus(id: number, status: string): Promise<TripVacancyResponse> {
    const params = new URLSearchParams({ status });
    const response = await fetchWithAuth(
      `${BASE}/api/v1/trip-vacancies/${id}/status?${params}`,
      { method: "PATCH" },
    );
    return handleResponse<TripVacancyResponse>(response);
  },
};
