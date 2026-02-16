import { useCallback } from "react"
import { useFetchWithAuth } from "./useFetchWithAuth"
import type {
  CreateTripRequestRequest,
  TripRequestPageResponse,
  TripRequestResponse,
  TripRequestUpdateResponse,
  UpdateTripRequestRequest,
} from "../types/tripRequest"

const BASE = import.meta.env.VITE_API_BASE_URL ?? ""

function apiUrl(path: string): string {
  const base = BASE.replace(/\/$/, "")
  const p = path.startsWith("/") ? path : `/${path}`
  return `${base}${p}`
}

function extractError(data: unknown): string {
  const d = data as { error?: { message?: string }; message?: string }
  return d?.error?.message ?? d?.message ?? "Request failed"
}

export function useTripRequestsApi() {
  const fetchWithAuth = useFetchWithAuth()

  const getAllRequests = useCallback(async () => {
    const res = await fetchWithAuth(apiUrl("/api/trip-requests"))
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(extractError(data))
    return data as { success: boolean; data: TripRequestResponse[] }
  }, [fetchWithAuth])

  const getMyRequests = useCallback(
    async (params?: {
      status?: string
      page?: number
      limit?: number
    }) => {
      const sp = new URLSearchParams()
      if (params?.status) sp.set("status", params.status)
      sp.set("page", String(params?.page ?? 1))
      sp.set("limit", String(params?.limit ?? 10))
      const res = await fetchWithAuth(
        apiUrl(`/api/trip-requests/me?${sp}`)
      )
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(extractError(data))
      return data as { success: boolean; data: TripRequestPageResponse }
    },
    [fetchWithAuth]
  )

  const createRequest = useCallback(
    async (body: CreateTripRequestRequest) => {
      const res = await fetchWithAuth(apiUrl("/api/trip-requests"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(extractError(data))
      return data as { success: boolean; data: TripRequestResponse }
    },
    [fetchWithAuth]
  )

  const getById = useCallback(
    async (requestId: string) => {
      const res = await fetchWithAuth(
        apiUrl(`/api/trip-requests/${requestId}`)
      )
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(extractError(data))
      return data as { success: boolean; data: TripRequestResponse }
    },
    [fetchWithAuth]
  )

  const updateRequest = useCallback(
    async (requestId: string, body: UpdateTripRequestRequest) => {
      const res = await fetchWithAuth(
        apiUrl(`/api/trip-requests/${requestId}`),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(body),
        }
      )
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(extractError(data))
      return data as { success: boolean; data: TripRequestUpdateResponse }
    },
    [fetchWithAuth]
  )

  const deleteRequest = useCallback(
    async (requestId: string) => {
      const res = await fetchWithAuth(
        apiUrl(`/api/trip-requests/${requestId}`),
        { method: "DELETE" }
      )
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(extractError(data))
      return data as { success: boolean; message?: string }
    },
    [fetchWithAuth]
  )

  return {
    getAllRequests,
    getMyRequests,
    createRequest,
    getById,
    updateRequest,
    deleteRequest,
  }
}
