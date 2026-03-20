import type { TripPlanResponse } from "../types/tripPlan";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export class ApiRequestError extends Error {
  status?: number;
  payload?: unknown;

  constructor(message: string, status?: number, payload?: unknown) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.payload = payload;
  }
}

function extractDetailMessage(payload: unknown): string {
  const data = payload as {
    detail?: unknown;
    message?: unknown;
    error?: unknown;
  };

  if (typeof data?.detail === "string") return data.detail;
  if (Array.isArray(data?.detail) && typeof data.detail[0] === "object") {
    const first = data.detail[0] as { msg?: unknown };
    if (typeof first?.msg === "string") return first.msg;
  }
  if (typeof data?.message === "string") return data.message;

  return "Request failed";
}

async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = sessionStorage.getItem("tripmate_access");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ? (options.headers as Record<string, string>) : {}),
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
    const payload = await response.json().catch(() => undefined);
    const message = extractDetailMessage(payload);
    throw new ApiRequestError(message, response.status, payload);
  }
  return response.json() as Promise<T>;
}

export const tripPlansApi = {
  async generatePlan(tripVacancyId: number): Promise<void> {
    const response = await fetchWithAuth(
      `${BASE}/api/v1/trip-vacancies/${tripVacancyId}/generate-plan`,
      { method: "POST" },
    );
    if (!response.ok) {
      const payload = await response.json().catch(() => undefined);
      const message = extractDetailMessage(payload);
      throw new ApiRequestError(message, response.status, payload);
    }

    // Some backends may return an empty body. We don't need the response
    // contents here; the UI will fetch recommendations from GET later.
    await response.text().catch(() => undefined);
  },

  async getTripPlanByTripVacancyId(
    tripVacancyId: number,
  ): Promise<TripPlanResponse> {
    const response = await fetchWithAuth(
      `${BASE}/api/v1/trip-plans/${tripVacancyId}`,
      { method: "GET" },
    );
    return handleResponse<TripPlanResponse>(response);
  },
};

