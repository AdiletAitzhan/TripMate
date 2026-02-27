import { useCallback } from "react";
import { tripVacanciesApi } from "../api/tripVacanciesApi";
import type {
  TripVacancyCreateRequest,
  TripVacancyUpdateRequest,
  TripVacancyResponse,
} from "../types/tripRequest";
import type { MessageResponse } from "../types/auth";

interface TripVacancyFilters {
  skip?: number;
  limit?: number;
  destination_city?: string | null;
  destination_country?: string | null;
  status?: string | null;
  start_date_from?: string | null;
  start_date_to?: string | null;
}

export function useTripVacanciesApi() {
  const createVacancy = useCallback(
    async (data: TripVacancyCreateRequest): Promise<TripVacancyResponse> => {
      return tripVacanciesApi.create(data);
    },
    [],
  );

  const getAllVacancies = useCallback(
    async (filters?: TripVacancyFilters): Promise<TripVacancyResponse[]> => {
      return tripVacanciesApi.getAll(filters);
    },
    [],
  );

  const getMyVacancies = useCallback(
    async (skip = 0, limit = 100): Promise<TripVacancyResponse[]> => {
      return tripVacanciesApi.getMyVacancies(skip, limit);
    },
    [],
  );

  const getVacancyById = useCallback(
    async (id: number): Promise<TripVacancyResponse> => {
      return tripVacanciesApi.getById(id);
    },
    [],
  );

  const updateVacancy = useCallback(
    async (
      id: number,
      data: TripVacancyUpdateRequest,
    ): Promise<TripVacancyResponse> => {
      return tripVacanciesApi.update(id, data);
    },
    [],
  );

  const deleteVacancy = useCallback(
    async (id: number): Promise<MessageResponse> => {
      return tripVacanciesApi.delete(id);
    },
    [],
  );

  const updateVacancyStatus = useCallback(
    async (id: number, status: string): Promise<TripVacancyResponse> => {
      return tripVacanciesApi.updateStatus(id, status);
    },
    [],
  );

  return {
    createVacancy,
    getAllVacancies,
    getMyVacancies,
    getVacancyById,
    updateVacancy,
    deleteVacancy,
    updateVacancyStatus,
  };
}
