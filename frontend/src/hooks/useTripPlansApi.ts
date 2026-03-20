import { useCallback } from "react";
import { tripPlansApi } from "../api/tripPlansApi";
import type { TripPlanResponse } from "../types/tripPlan";

export function useTripPlansApi() {
  const generatePlan = useCallback(async (tripVacancyId: number) => {
    return tripPlansApi.generatePlan(tripVacancyId);
  }, []);

  const getTripPlanByTripVacancyId = useCallback(
    async (tripVacancyId: number): Promise<TripPlanResponse> => {
      return tripPlansApi.getTripPlanByTripVacancyId(tripVacancyId);
    },
    [],
  );

  return { generatePlan, getTripPlanByTripVacancyId };
}

