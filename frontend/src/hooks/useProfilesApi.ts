import { useCallback } from "react";
import { profilesApi } from "../api/profilesApi";
import type {
  ProfileCreateRequest,
  ProfileUpdateRequest,
  ProfileResponse,
  ProfileDetailResponse,
  LanguageResponse,
  InterestResponse,
  TravelStyleResponse,
  CountryResponse,
  CityResponse,
} from "../types/profile";
import type { MessageResponse } from "../types/auth";

export function useProfilesApi() {
  // Profile CRUD
  const createProfile = useCallback(
    async (data: ProfileCreateRequest): Promise<ProfileResponse> => {
      return profilesApi.create(data);
    },
    [],
  );

  const getMyProfile = useCallback(async (): Promise<ProfileDetailResponse> => {
    return profilesApi.getMyProfile();
  }, []);

  const getProfile = useCallback(
    async (profileId: number): Promise<ProfileDetailResponse> => {
      return profilesApi.getProfile(profileId);
    },
    [],
  );

  const updateMyProfile = useCallback(
    async (data: ProfileUpdateRequest): Promise<ProfileResponse> => {
      return profilesApi.updateMyProfile(data);
    },
    [],
  );

  const deleteMyProfile = useCallback(async (): Promise<MessageResponse> => {
    return profilesApi.deleteMyProfile();
  }, []);

  // Profile Photo
  const uploadProfilePhoto = useCallback(
    async (file: File): Promise<ProfileResponse> => {
      return profilesApi.uploadProfilePhoto(file);
    },
    [],
  );

  const deleteProfilePhoto = useCallback(async (): Promise<ProfileResponse> => {
    return profilesApi.deleteProfilePhoto();
  }, []);

  // Languages
  const setLanguages = useCallback(
    async (languageIds: number[]): Promise<MessageResponse> => {
      return profilesApi.setLanguages(languageIds);
    },
    [],
  );

  const addLanguage = useCallback(
    async (languageId: number): Promise<MessageResponse> => {
      return profilesApi.addLanguage(languageId);
    },
    [],
  );

  const removeLanguage = useCallback(
    async (languageId: number): Promise<MessageResponse> => {
      return profilesApi.removeLanguage(languageId);
    },
    [],
  );

  // Interests
  const setInterests = useCallback(
    async (interestIds: number[]): Promise<MessageResponse> => {
      return profilesApi.setInterests(interestIds);
    },
    [],
  );

  const addInterest = useCallback(
    async (interestId: number): Promise<MessageResponse> => {
      return profilesApi.addInterest(interestId);
    },
    [],
  );

  const removeInterest = useCallback(
    async (interestId: number): Promise<MessageResponse> => {
      return profilesApi.removeInterest(interestId);
    },
    [],
  );

  // Travel Styles
  const setTravelStyles = useCallback(
    async (travelStyleIds: number[]): Promise<MessageResponse> => {
      return profilesApi.setTravelStyles(travelStyleIds);
    },
    [],
  );

  const addTravelStyle = useCallback(
    async (travelStyleId: number): Promise<MessageResponse> => {
      return profilesApi.addTravelStyle(travelStyleId);
    },
    [],
  );

  const removeTravelStyle = useCallback(
    async (travelStyleId: number): Promise<MessageResponse> => {
      return profilesApi.removeTravelStyle(travelStyleId);
    },
    [],
  );

  // Options
  const getAllLanguages = useCallback(async (): Promise<LanguageResponse[]> => {
    return profilesApi.getAllLanguages();
  }, []);

  const getAllInterests = useCallback(async (): Promise<InterestResponse[]> => {
    return profilesApi.getAllInterests();
  }, []);

  const getAllTravelStyles = useCallback(async (): Promise<
    TravelStyleResponse[]
  > => {
    return profilesApi.getAllTravelStyles();
  }, []);

  const getCountries = useCallback(async (): Promise<CountryResponse[]> => {
    return profilesApi.getCountries();
  }, []);

  const getCities = useCallback(
    async (countryId: number): Promise<CityResponse[]> => {
      return profilesApi.getCities(countryId);
    },
    [],
  );

  return {
    // Profile
    createProfile,
    getMyProfile,
    getProfile,
    updateMyProfile,
    deleteMyProfile,
    uploadProfilePhoto,
    deleteProfilePhoto,
    // Languages
    setLanguages,
    addLanguage,
    removeLanguage,
    // Interests
    setInterests,
    addInterest,
    removeInterest,
    // Travel Styles
    setTravelStyles,
    addTravelStyle,
    removeTravelStyle,
    // Options
    getAllLanguages,
    getAllInterests,
    getAllTravelStyles,
    getCountries,
    getCities,
  };
}
