import type {
  OfferCreateRequest,
  OfferUpdateRequest,
  OfferResponse,
} from "../types/offer";
import { MessageResponse } from "../types/auth";

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

export const offersApi = {
  async create(data: OfferCreateRequest): Promise<OfferResponse> {
    const response = await fetchWithAuth(`${BASE}/api/v1/offers`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return handleResponse<OfferResponse>(response);
  },

  async getAll(skip = 0, limit = 100): Promise<OfferResponse[]> {
    const params = new URLSearchParams({
      skip: String(skip),
      limit: String(limit),
    });
    const response = await fetchWithAuth(`${BASE}/api/v1/offers?${params}`, {
      method: "GET",
    });
    return handleResponse<OfferResponse[]>(response);
  },

  async getMyOffers(skip = 0, limit = 100): Promise<OfferResponse[]> {
    const params = new URLSearchParams({
      skip: String(skip),
      limit: String(limit),
    });
    const response = await fetchWithAuth(`${BASE}/api/v1/offers/me?${params}`, {
      method: "GET",
    });
    return handleResponse<OfferResponse[]>(response);
  },

  async getById(id: number): Promise<OfferResponse> {
    const response = await fetchWithAuth(`${BASE}/api/v1/offers/${id}`, {
      method: "GET",
    });
    return handleResponse<OfferResponse>(response);
  },

  async update(id: number, data: OfferUpdateRequest): Promise<OfferResponse> {
    const response = await fetchWithAuth(`${BASE}/api/v1/offers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return handleResponse<OfferResponse>(response);
  },

  async delete(id: number): Promise<MessageResponse> {
    const response = await fetchWithAuth(`${BASE}/api/v1/offers/${id}`, {
      method: "DELETE",
    });
    return handleResponse<MessageResponse>(response);
  },

  async updateStatus(id: number, status: string): Promise<OfferResponse> {
    const response = await fetchWithAuth(`${BASE}/api/v1/offers/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    return handleResponse<OfferResponse>(response);
  },

  async getOffersForVacancy(
    tripVacancyId: number,
    status?: string | null,
    skip = 0,
    limit = 100,
  ): Promise<OfferResponse[]> {
    const params = new URLSearchParams({
      skip: String(skip),
      limit: String(limit),
    });
    if (status) params.set("status", status);

    const response = await fetchWithAuth(
      `${BASE}/api/v1/offers/trip-vacancy/${tripVacancyId}?${params}`,
      { method: "GET" },
    );
    return handleResponse<OfferResponse[]>(response);
  },

  async cancelOffer(id: number): Promise<OfferResponse> {
    const response = await fetchWithAuth(`${BASE}/api/v1/offers/${id}/cancel`, {
      method: "POST",
    });
    return handleResponse<OfferResponse>(response);
  },
};
