// OpenAPI Schema Types
export interface LanguageResponse {
  id: number;
  name: string;
}

export interface InterestResponse {
  id: number;
  name: string;
}

export interface TravelStyleResponse {
  id: number;
  name: string;
}

export interface UserLanguageResponse {
  id: number;
  language_id: number;
  language: LanguageResponse;
}

export interface UserInterestResponse {
  id: number;
  interest_id: number;
  interest: InterestResponse;
}

export interface UserTravelStyleResponse {
  id: number;
  travel_style_id: number;
  travel_style: TravelStyleResponse;
}

export interface ProfileCreateRequest {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  country?: string | null;
  city?: string | null;
  nationality?: string | null;
  phone?: string | null;
  instagram_handle?: string | null;
  telegram_handle?: string | null;
  bio?: string | null;
  profile_photo_url?: string | null;
}

export interface ProfileUpdateRequest {
  first_name?: string | null;
  last_name?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  country?: string | null;
  city?: string | null;
  nationality?: string | null;
  phone?: string | null;
  instagram_handle?: string | null;
  telegram_handle?: string | null;
  bio?: string | null;
  profile_photo_url?: string | null;
}

export interface ProfileResponse {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  country?: string | null;
  city?: string | null;
  nationality?: string | null;
  phone?: string | null;
  instagram_handle?: string | null;
  telegram_handle?: string | null;
  bio?: string | null;
  profile_photo_url?: string | null;
}

export interface ProfileDetailResponse extends ProfileResponse {
  languages: UserLanguageResponse[];
  interests: UserInterestResponse[];
  travel_styles: UserTravelStyleResponse[];
}

// Legacy types for backward compatibility
export type ProfileLocation = { city?: string; country?: string };

export type ProfilePreferences = {
  interests?: string[];
  minAge?: number;
  maxAge?: number;
  preferredGender?: string;
  budgetRange?: { min?: number; max?: number; currency?: string };
};

export type ProfileData = {
  id?: string;
  email?: string;
  fullName?: string;
  dateOfBirth?: string;
  age?: number;
  gender?: string;
  location?: ProfileLocation;
  profilePhoto?: string;
  bio?: string;
  interests?: string[];
  preferences?: ProfilePreferences;
  profileComplete?: boolean;
  memberSince?: string;
};
