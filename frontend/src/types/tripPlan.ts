export interface RecommendedPlaceResponse {
  id: number;
  place_id: string;
  name: string;
  created_at: string;

  category?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  short_description?: string | null;
  why_people_go?: string | null;
  why_recommended?: string | null;
  highlights?: string[] | null;
  tags?: string[] | null;
  best_season?: string[] | null;
  audience?: string[] | null;
  estimated_cost?: string | null;
  ticket_price?: string | null;
  visit_duration_minutes?: number | null;
  best_time_of_day?: string | null;
  rating?: string | null;
  reviews_count?: number | null;
  image_url?: string | null;
  opening_hours?: Record<string, unknown> | null;
  contact_information?: Record<string, unknown> | null;
  age_range?: Record<string, unknown> | null;
}

export interface TripPlanResponse {
  id: number;
  trip_vacancy_id: number;
  generation_requested_at?: string | null;
  generated_at?: string | null;
  created_at: string;
  updated_at: string;
  recommended_places: RecommendedPlaceResponse[];
}

