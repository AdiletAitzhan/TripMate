// Offer Types - matching OpenAPI spec

export interface OfferCreateRequest {
  trip_vacancy_id: number;
  message?: string | null;
  proposed_budget?: number | string | null;
}

export interface OfferUpdateRequest {
  message?: string | null;
  proposed_budget?: number | string | null;
  status?: string | null;
}

export interface OfferResponse {
  id: number;
  trip_vacancy_id: number;
  offerer_id: number;
  message?: string | null;
  proposed_budget?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}
