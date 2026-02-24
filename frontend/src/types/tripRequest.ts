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
