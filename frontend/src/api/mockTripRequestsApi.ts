import type {
  CreateTripRequestRequest,
  TripRequestPageResponse,
  TripRequestResponse,
  TripRequestUpdateResponse,
  UpdateTripRequestRequest,
} from "../types/tripRequest";
import { mockDataStore } from "./mockTripRequestsData";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function calculateDuration(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export const mockTripRequestsApi = {
  async getAllRequests(): Promise<{
    success: boolean;
    data: TripRequestResponse[];
  }> {
    await delay(400);
    return {
      success: true,
      data: mockDataStore.getAll(),
    };
  },

  async getMyRequests(
    userId: string,
    params?: { status?: string; page?: number; limit?: number },
  ): Promise<{ success: boolean; data: TripRequestPageResponse }> {
    await delay(350);

    let requests = mockDataStore.getByUserId(userId);

    // Filter by status if provided
    if (params?.status) {
      requests = requests.filter((req) => req.status === params.status);
    }

    // Pagination
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const total = requests.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedRequests = requests
      .slice(startIndex, endIndex)
      .map((req) => ({
        id: req.id,
        destination: req.destination,
        startDate: req.startDate,
        endDate: req.endDate,
        budget: req.budget,
        status: req.status,
        matchCount: req.matchCount,
        createdAt: req.createdAt,
      }));

    return {
      success: true,
      data: {
        requests: paginatedRequests,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    };
  },

  async createRequest(
    userId: string,
    body: CreateTripRequestRequest,
  ): Promise<{ success: boolean; data: TripRequestResponse }> {
    await delay(500);

    const duration = calculateDuration(body.startDate, body.endDate);

    const newRequest = mockDataStore.create({
      userId,
      destination: body.destination,
      startDate: body.startDate,
      endDate: body.endDate,
      duration,
      flexibleDates: body.flexibleDates ?? false,
      budget: body.budget,
      preferences: body.preferences,
      status: "active",
      notifyOnMatch: body.notifyOnMatch ?? true,
    });

    return {
      success: true,
      data: newRequest,
    };
  },

  async getById(
    requestId: string,
  ): Promise<{
    success: boolean;
    data?: TripRequestResponse;
    error?: { message: string };
  }> {
    await delay(300);

    const request = mockDataStore.getById(requestId);
    if (!request) {
      return {
        success: false,
        error: { message: "Trip request not found" },
      };
    }

    return {
      success: true,
      data: request,
    };
  },

  async updateRequest(
    requestId: string,
    body: UpdateTripRequestRequest,
  ): Promise<{
    success: boolean;
    data?: TripRequestUpdateResponse;
    error?: { message: string };
  }> {
    await delay(450);

    const existing = mockDataStore.getById(requestId);
    if (!existing) {
      return {
        success: false,
        error: { message: "Trip request not found" },
      };
    }

    const updates: Partial<TripRequestResponse> = {};
    if (body.startDate) updates.startDate = body.startDate;
    if (body.endDate) updates.endDate = body.endDate;
    if (body.budget) updates.budget = body.budget;

    const updated = mockDataStore.update(requestId, updates);
    if (!updated) {
      return {
        success: false,
        error: { message: "Failed to update trip request" },
      };
    }

    return {
      success: true,
      data: {
        id: updated.id,
        startDate: updated.startDate,
        endDate: updated.endDate,
        budget: updated.budget,
        updatedAt: new Date().toISOString(),
      },
    };
  },

  async deleteRequest(
    requestId: string,
  ): Promise<{
    success: boolean;
    message?: string;
    error?: { message: string };
  }> {
    await delay(400);

    const deleted = mockDataStore.delete(requestId);
    if (!deleted) {
      return {
        success: false,
        error: { message: "Trip request not found" },
      };
    }

    return {
      success: true,
      message: "Trip request deleted successfully",
    };
  },
};
