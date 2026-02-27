import { useCallback } from "react";
import { useFetchWithAuth } from "./useFetchWithAuth";
import { useAuth } from "../context/useAuth";
import type {
  CreateTripRequestRequest,
  TripRequestPageResponse,
  TripRequestResponse,
  TripRequestUpdateResponse,
  UpdateTripRequestRequest,
} from "../types/tripRequest";
import { mockTripRequestsApi } from "../api/mockTripRequestsApi";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "";
const USE_MOCK = false;

function apiUrl(path: string): string {
  const base = BASE.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

function extractError(data: unknown): string {
  const d = data as { error?: { message?: string }; message?: string };
  return d?.error?.message ?? d?.message ?? "Request failed";
}

export function useTripRequestsApi() {
  const fetchWithAuth = useFetchWithAuth();
  const { user } = useAuth();

  const getAllRequests = useCallback(async () => {
    if (USE_MOCK) {
      return mockTripRequestsApi.getAllRequests();
    }
    const res = await fetchWithAuth(apiUrl("/api/v1/trip-vacancies"));
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(extractError(data));
    return data as { success: boolean; data: TripRequestResponse[] };
  }, [fetchWithAuth]);

  const getMyRequests = useCallback(
    async (params?: { status?: string; page?: number; limit?: number }) => {
      if (USE_MOCK && user?.id) {
        return mockTripRequestsApi.getMyRequests(user.id, params);
      }
      const sp = new URLSearchParams();
      if (params?.status) sp.set("status", params.status);
      sp.set("page", String(params?.page ?? 1));
      sp.set("limit", String(params?.limit ?? 10));
      const res = await fetchWithAuth(
        apiUrl(`/api/v1/trip-vacancies/me?${sp}`),
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(extractError(data));
      return data as { success: boolean; data: TripRequestPageResponse };
    },
    [fetchWithAuth, user],
  );

  const createRequest = useCallback(
    async (body: CreateTripRequestRequest) => {
      if (USE_MOCK && user?.id) {
        return mockTripRequestsApi.createRequest(user.id, body);
      }
      const res = await fetchWithAuth(apiUrl("/api/v1/trip-vacancies"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(extractError(data));
      return data as { success: boolean; data: TripRequestResponse };
    },
    [fetchWithAuth, user],
  );

  const getById = useCallback(
    async (requestId: string) => {
      if (USE_MOCK) {
        const result = await mockTripRequestsApi.getById(requestId);
        if (!result.success)
          throw new Error(result.error?.message ?? "Not found");
        return { success: true, data: result.data! };
      }
      const res = await fetchWithAuth(
        apiUrl(`/api/v1/trip-vacancies/${requestId}`),
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(extractError(data));
      return data as { success: boolean; data: TripRequestResponse };
    },
    [fetchWithAuth],
  );

  const updateRequest = useCallback(
    async (requestId: string, body: UpdateTripRequestRequest) => {
      if (USE_MOCK) {
        const result = await mockTripRequestsApi.updateRequest(requestId, body);
        if (!result.success)
          throw new Error(result.error?.message ?? "Update failed");
        return { success: true, data: result.data! };
      }
      const res = await fetchWithAuth(
        apiUrl(`/api/v1/trip-vacancies/${requestId}`),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(body),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(extractError(data));
      return data as { success: boolean; data: TripRequestUpdateResponse };
    },
    [fetchWithAuth],
  );

  const deleteRequest = useCallback(
    async (requestId: string) => {
      if (USE_MOCK) {
        const result = await mockTripRequestsApi.deleteRequest(requestId);
        if (!result.success)
          throw new Error(result.error?.message ?? "Delete failed");
        return { success: true, message: result.message };
      }
      const res = await fetchWithAuth(
        apiUrl(`/api/v1/trip-vacancies/${requestId}`),
        { method: "DELETE" },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(extractError(data));
      return data as { success: boolean; message?: string };
    },
    [fetchWithAuth],
  );

  return {
    getAllRequests,
    getMyRequests,
    createRequest,
    getById,
    updateRequest,
    deleteRequest,
  };
}
