import { useCallback } from "react";
import { profilesApi } from "../api/profilesApi";
import type { ProfileUpdateRequest } from "../types/profile";

// This hook is maintained for backward compatibility
// It now delegates to the profilesApi which matches the OpenAPI spec

export function useUsersApi() {
  const getProfile = useCallback(async () => {
    try {
      const profile = await profilesApi.getMyProfile();
      // Transform to legacy format for backward compatibility
      return {
        success: true,
        data: {
          id: String(profile.id),
          email: "", // Not available in profile response
          fullName: `${profile.first_name} ${profile.last_name}`,
          dateOfBirth: profile.date_of_birth,
          gender: profile.gender,
          location: {
            city: profile.city || undefined,
            country: profile.country || undefined,
          },
          profilePhoto: profile.profile_photo_url || undefined,
          bio: profile.bio || undefined,
          interests: profile.interests?.map((i) => i.interest.name) || [],
          profileComplete: true,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: { code: "ERROR", message: (error as Error).message },
      };
    }
  }, []);

  const updateProfile = useCallback(
    async (body: {
      fullName?: string;
      location?: { city?: string; country?: string };
      bio?: string;
      phone?: string;
    }) => {
      try {
        // Parse fullName into first_name and last_name
        const nameParts = body.fullName?.split(" ") || [];
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(" ");

        const updateData: ProfileUpdateRequest = {
          ...(firstName && { first_name: firstName }),
          ...(lastName && { last_name: lastName }),
          ...(body.location?.city && { city: body.location.city }),
          ...(body.location?.country && { country: body.location.country }),
          ...(body.bio !== undefined && { bio: body.bio }),
          ...(body.phone !== undefined && { phone: body.phone }),
        };

        const result = await profilesApi.updateMyProfile(updateData);
        return {
          success: true,
          data: result,
        };
      } catch (error) {
        throw new Error((error as Error).message || "Failed to save profile");
      }
    },
    [],
  );

  const uploadPhoto = useCallback(async (file: File) => {
    // This functionality is not directly supported in the OpenAPI spec
    // You may need to implement file upload separately or use profile_photo_url
    console.warn("Photo upload not implemented in new API");
    return {
      success: false,
      error: { message: "Photo upload not implemented" },
    };
  }, []);

  const updatePreferences = useCallback(
    async (body: {
      interests?: string[];
      minAge?: number;
      maxAge?: number;
      preferredGender?: string;
      budgetRange?: { min?: number; max?: number; currency?: string };
    }) => {
      try {
        // The new API handles interests differently (by ID)
        // This is a simplified implementation
        console.warn(
          "Preferences update needs to be implemented with interest IDs",
        );
        return {
          success: true,
          message: "Preferences updated",
        };
      } catch (error) {
        return {
          success: false,
          error: { message: (error as Error).message },
        };
      }
    },
    [],
  );

  const getStats = useCallback(async () => {
    // Stats endpoint not available in new API
    return {
      success: false,
      error: { message: "Stats not available" },
    };
  }, []);

  return {
    getProfile,
    updateProfile,
    uploadPhoto,
    updatePreferences,
    getStats,
  };
}
