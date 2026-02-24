import type { TripRequestResponse } from "../types/tripRequest";

// Mock trip requests data - will be modified in-memory for CRUD operations
let mockTripRequests: TripRequestResponse[] = [
  {
    id: "trip-001",
    userId: "user-001",
    destination: {
      city: "Paris",
      country: "France",
      countryCode: "FR",
    },
    startDate: "2026-06-15",
    endDate: "2026-06-22",
    duration: 7,
    flexibleDates: true,
    budget: {
      amount: 2500,
      currency: "USD",
    },
    preferences: {
      mustHave: {
        ageRange: { min: 25, max: 45 },
        gender: ["any"],
        verifiedOnly: true,
      },
    },
    interests: ["history", "food", "museums", "photography"],
    status: "active",
    matchCount: 3,
    notifyOnMatch: true,
    createdAt: "2026-02-20T10:30:00Z",
  },
  {
    id: "trip-002",
    userId: "user-001",
    destination: {
      city: "Tokyo",
      country: "Japan",
      countryCode: "JP",
    },
    startDate: "2026-09-01",
    endDate: "2026-09-14",
    duration: 13,
    flexibleDates: false,
    budget: {
      amount: 4000,
      currency: "USD",
    },
    preferences: {
      mustHave: {
        ageRange: { min: 20, max: 50 },
        gender: ["any"],
        verifiedOnly: false,
      },
    },
    interests: ["anime", "food", "technology", "nightlife"],
    status: "active",
    matchCount: 5,
    notifyOnMatch: true,
    createdAt: "2026-02-18T14:20:00Z",
  },
  {
    id: "trip-003",
    userId: "user-002",
    destination: {
      city: "Barcelona",
      country: "Spain",
      countryCode: "ES",
    },
    startDate: "2026-07-10",
    endDate: "2026-07-20",
    duration: 10,
    flexibleDates: true,
    budget: {
      amount: 1800,
      currency: "EUR",
    },
    preferences: {
      mustHave: {
        ageRange: { min: 25, max: 40 },
        gender: ["female"],
        verifiedOnly: true,
      },
    },
    interests: ["architecture", "food", "beaches", "shopping"],
    status: "active",
    matchCount: 2,
    notifyOnMatch: true,
    createdAt: "2026-02-22T09:15:00Z",
  },
  {
    id: "trip-004",
    userId: "user-003",
    destination: {
      city: "New York",
      country: "USA",
      countryCode: "US",
    },
    startDate: "2026-05-05",
    endDate: "2026-05-12",
    duration: 7,
    flexibleDates: false,
    budget: {
      amount: 3200,
      currency: "USD",
    },
    preferences: {
      mustHave: {
        ageRange: { min: 30, max: 60 },
        gender: ["any"],
        verifiedOnly: true,
      },
    },
    interests: ["business", "food", "museums", "broadway"],
    status: "active",
    matchCount: 1,
    notifyOnMatch: false,
    createdAt: "2026-02-19T16:45:00Z",
  },
  {
    id: "trip-005",
    userId: "user-001",
    destination: {
      city: "Rome",
      country: "Italy",
      countryCode: "IT",
    },
    startDate: "2026-08-20",
    endDate: "2026-08-27",
    duration: 7,
    flexibleDates: true,
    budget: {
      amount: 2200,
      currency: "EUR",
    },
    preferences: {
      mustHave: {
        ageRange: { min: 25, max: 50 },
        gender: ["any"],
        verifiedOnly: false,
      },
    },
    interests: ["history", "food", "art", "hiking"],
    status: "active",
    matchCount: 4,
    notifyOnMatch: true,
    createdAt: "2026-02-21T11:00:00Z",
  },
];

let nextId = 6;

export const mockDataStore = {
  getAll(): TripRequestResponse[] {
    return [...mockTripRequests];
  },

  getByUserId(userId: string): TripRequestResponse[] {
    return mockTripRequests.filter((req) => req.userId === userId);
  },

  getById(id: string): TripRequestResponse | undefined {
    return mockTripRequests.find((req) => req.id === id);
  },

  create(
    data: Omit<TripRequestResponse, "id" | "createdAt" | "matchCount">,
  ): TripRequestResponse {
    const newRequest: TripRequestResponse = {
      ...data,
      id: `trip-${String(nextId++).padStart(3, "0")}`,
      createdAt: new Date().toISOString(),
      matchCount: 0,
    };
    mockTripRequests.push(newRequest);
    return newRequest;
  },

  update(
    id: string,
    data: Partial<TripRequestResponse>,
  ): TripRequestResponse | undefined {
    const index = mockTripRequests.findIndex((req) => req.id === id);
    if (index === -1) return undefined;

    mockTripRequests[index] = {
      ...mockTripRequests[index],
      ...data,
    };
    return mockTripRequests[index];
  },

  delete(id: string): boolean {
    const index = mockTripRequests.findIndex((req) => req.id === id);
    if (index === -1) return false;

    mockTripRequests.splice(index, 1);
    return true;
  },
};
