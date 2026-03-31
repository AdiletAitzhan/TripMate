// Trip Vacancy Types - matching OpenAPI spec

export interface TripVacancyCreateRequest {
  destination_city_id: number;
  destination_country_id: number;
  start_date: string;
  end_date: string;
  min_budget?: number | string | null;
  max_budget?: number | string | null;
  people_needed: number;
  description?: string | null;
  planned_activities?: string | null;
  planned_destinations?: string | null;
  transportation_preference?: string | null;
  accommodation_preference?: string | null;
  min_age?: number | null;
  max_age?: number | null;
  gender_preference?: string | null;
}

export interface TripVacancyUpdateRequest {
  destination_city_id?: number | null;
  destination_country_id?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  min_budget?: number | string | null;
  max_budget?: number | string | null;
  people_needed?: number | null;
  description?: string | null;
  planned_activities?: string | null;
  planned_destinations?: string | null;
  transportation_preference?: string | null;
  accommodation_preference?: string | null;
  min_age?: number | null;
  max_age?: number | null;
  gender_preference?: string | null;
  status?: string | null;
}

export interface DestinationCityObj {
  id: number;
  name: string;
  country_id: number;
}

export interface DestinationCountryObj {
  id: number;
  name: string;
}

/** Extract display name from destination_city or destination_country (handles both object and string formats) */
export function destinationName(val: DestinationCityObj | DestinationCountryObj | string | null | undefined): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  return val.name ?? "";
}

export interface TripVacancyResponse {
  id: number;
  requester_id: number;
  destination_city: DestinationCityObj | string;
  destination_country: DestinationCountryObj | string;
  start_date: string;
  end_date: string;
  min_budget?: string | null;
  max_budget?: string | null;
  people_needed: number;
  description?: string | null;
  planned_activities?: string | null;
  planned_destinations?: string | null;
  transportation_preference?: string | null;
  accommodation_preference?: string | null;
  min_age?: number | null;
  max_age?: number | null;
  gender_preference?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

// Legacy types for backward compatibility
export interface DestinationDto {
  city?: string;
  country?: string;
  countryCode?: string;
}

export interface BudgetDto {
  amount?: number;
  currency?: string;
}

export interface AgeRangeDto {
  min?: number;
  max?: number;
}

export interface MustHaveDto {
  ageRange?: AgeRangeDto;
  gender?: string[];
  verifiedOnly?: boolean;
}

export interface NiceToHaveDto {
  similarInterests?: "high" | "medium" | "low";
  similarBudget?: "high" | "medium" | "low";
}

export interface PreferencesDto {
  mustHave?: MustHaveDto;
  niceToHave?: NiceToHaveDto;
}

export interface CreateTripRequestRequest {
  destination: DestinationDto;
  startDate: string;
  endDate: string;
  flexibleDates?: boolean;
  budget?: BudgetDto;
  preferences?: PreferencesDto;
  notifyOnMatch?: boolean;
}

export interface UpdateTripRequestRequest {
  startDate?: string;
  endDate?: string;
  budget?: BudgetDto;
}

export interface TripRequestResponse {
  id: string;
  userId: string;
  destination: DestinationDto;
  startDate: string;
  endDate: string;
  duration?: number;
  flexibleDates?: boolean;
  budget?: BudgetDto;
  preferences?: PreferencesDto;
  interests?: string[];
  status?: string;
  matchCount?: number;
  notifyOnMatch?: boolean;
  createdAt?: string;
}

export interface TripRequestShortResponse {
  id: string;
  destination: DestinationDto;
  startDate: string;
  endDate: string;
  budget?: BudgetDto;
  status?: string;
  matchCount?: number;
  createdAt?: string;
}

export interface PaginationDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TripRequestPageResponse {
  requests: TripRequestShortResponse[];
  pagination: PaginationDto;
}

export interface TripRequestUpdateResponse {
  id: string;
  startDate: string;
  endDate: string;
  budget?: BudgetDto;
  updatedAt: string;
}
