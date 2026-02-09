package kz.sdu.service;

import kz.sdu.dto.*;
import kz.sdu.entity.Interest;
import kz.sdu.entity.UserEntity;
import kz.sdu.entity.UserPreferences;
import kz.sdu.repository.InterestRepository;
import kz.sdu.repository.UserProfileRepository;
import kz.sdu.repository.UserPreferencesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final String DEFAULT_INTEREST_CATEGORY = "other";

    private final UserProfileRepository userRepository;
    private final InterestRepository interestRepository;
    private final UserPreferencesRepository userPreferencesRepository;
    private final MinioService minioService;

    public UserProfileResponseDto getCurrentUserProfile(Jwt jwt) {
        UserEntity user = getEntityById(jwt.getSubject());
        UserPreferences prefs = userPreferencesRepository.findByUserId(user.getId()).orElse(null);
        return UserProfileResponseDto.builder()
                .success(true)
                .data(toProfileData(user, prefs, true))
                .build();
    }

    @Transactional
    public UpdateProfileResponseDto updateProfile(String userId, UpdateProfileRequestDto req) {
        UserEntity user = getEntityById(userId);
        if (req.getFullName() != null) {
            String[] parts = splitFullName(req.getFullName());
            user.setFirstName(parts[0]);
            user.setLastName(parts[1]);
        }
        if (req.getLocation() != null) {
            if (req.getLocation().getCity() != null) user.setCity(req.getLocation().getCity());
            if (req.getLocation().getCountry() != null) user.setCountry(req.getLocation().getCountry());
        }
        if (req.getBio() != null) user.setBio(req.getBio());
        if (req.getPhone() != null) user.setPhoneNumber(req.getPhone());
        user = userRepository.save(user);
        return UpdateProfileResponseDto.builder()
                .success(true)
                .data(UpdateProfileDataDto.builder()
                        .id(user.getId().toString())
                        .fullName(fullName(user))
                        .location(toLocationDto(user))
                        .bio(user.getBio())
                        .phone(user.getPhoneNumber())
                        .updatedAt(user.getUpdatedAt().toInstant(ZoneOffset.UTC))
                        .build())
                .build();
    }

    @Transactional
    public PhotoUploadResponseDto uploadPhoto(String userId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only images allowed");
        }
        UserEntity user = getEntityById(userId);
        String photoUrl = minioService.uploadPhoto(file, user.getId());
        user.setProfilePhotoUrl(photoUrl);
        userRepository.save(user);
        return PhotoUploadResponseDto.builder()
                .success(true)
                .data(PhotoUploadDataDto.builder().photoUrl(photoUrl).build())
                .build();
    }

    @Transactional
    public UpdatePreferencesResponseDto updatePreferences(String userId, UpdatePreferencesRequestDto req) {
        UserEntity user = getEntityById(userId);

        if (req.getInterests() != null && !req.getInterests().isEmpty()) {
            List<Interest> interests = resolveInterestsByName(req.getInterests());
            user.setInterests(interests);
        }

        UserPreferences prefs = userPreferencesRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    UserPreferences p = UserPreferences.builder()
                            .user(user)
                            .updatedAt(LocalDateTime.now())
                            .build();
                    return userPreferencesRepository.save(p);
                });

        if (req.getMinAge() != null) prefs.setMinAge(req.getMinAge());
        if (req.getMaxAge() != null) prefs.setMaxAge(req.getMaxAge());
        if (req.getPreferredGender() != null) prefs.setPreferredGender(req.getPreferredGender());
        if (req.getBudgetRange() != null) {
            prefs.setMinBudget(req.getBudgetRange().getMin() != null ? BigDecimal.valueOf(req.getBudgetRange().getMin()) : null);
            prefs.setMaxBudget(req.getBudgetRange().getMax() != null ? BigDecimal.valueOf(req.getBudgetRange().getMax()) : null);
        }
        prefs = userPreferencesRepository.save(prefs);
        userRepository.save(user);

        List<String> interestNames = user.getInterests() != null
                ? user.getInterests().stream().map(Interest::getName).collect(Collectors.toList())
                : List.of();

        return UpdatePreferencesResponseDto.builder()
                .success(true)
                .data(UpdatePreferencesDataDto.builder()
                        .interests(interestNames)
                        .minAge(prefs.getMinAge())
                        .maxAge(prefs.getMaxAge())
                        .preferredGender(prefs.getPreferredGender())
                        .budgetRange(BudgetRangeDto.builder()
                                .min(prefs.getMinBudget() != null ? prefs.getMinBudget().intValue() : null)
                                .max(prefs.getMaxBudget() != null ? prefs.getMaxBudget().intValue() : null)
                                .build())
                        .updatedAt(prefs.getUpdatedAt().toInstant(ZoneOffset.UTC))
                        .build())
                .build();
    }

    public UserPublicProfileResponseDto getUserById(String requestedUserId) {
        UserEntity user = getEntityById(requestedUserId);
        UserPreferences prefs = userPreferencesRepository.findByUserId(user.getId()).orElse(null);
        return UserPublicProfileResponseDto.builder()
                .success(true)
                .data(toPublicProfileData(user, prefs))
                .build();
    }

    public UserStatsResponseDto getMyStats(String userId) {
        UserStatsDto stats = UserStatsDto.builder()
                .tripsCompleted(0)
                .countriesVisited(0)
                .citiesExplored(0)
                .travelBuddiesMet(0)
                .totalDistance(0L)
                .daysTravel(0)
                .rating(null)
                .reviewCount(0)
                .build();
        return UserStatsResponseDto.builder()
                .success(true)
                .data(stats)
                .build();
    }

    private UserEntity getEntityById(String userId) {
        UUID id = UUID.fromString(userId);
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private List<Interest> resolveInterestsByName(List<String> names) {
        if (names == null || names.isEmpty()) return new ArrayList<>();
        List<Interest> result = new ArrayList<>();
        for (String name : names) {
            if (name == null || name.isBlank()) continue;
            Interest interest = interestRepository.findByNameIgnoreCase(name.trim())
                    .orElseGet(() -> interestRepository.save(Interest.builder()
                            .name(name.trim())
                            .category(DEFAULT_INTEREST_CATEGORY)
                            .build()));
            result.add(interest);
        }
        return result;
    }

    private UserProfileDataDto toProfileData(UserEntity u, UserPreferences prefs, boolean includeEmail) {
        List<String> interestNames = u.getInterests() != null
                ? u.getInterests().stream().map(Interest::getName).collect(Collectors.toList())
                : List.of();

        UserProfileDataDto.UserProfileDataDtoBuilder b = UserProfileDataDto.builder()
                .id(u.getId().toString())
                .fullName(fullName(u))
                .dateOfBirth(u.getDateOfBirth() != null ? u.getDateOfBirth().toString() : null)
                .age(age(u.getDateOfBirth()))
                .gender(u.getGender() != null ? u.getGender().name().toLowerCase() : null)
                .location(toLocationDto(u))
                .profilePhoto(u.getProfilePhotoUrl())
                .bio(u.getBio())
                .interests(interestNames)
                .preferences(toPreferencesDto(prefs))
                .verification(VerificationDto.builder()
                        .email(u.isEmailVerified())
                        .phone(u.isPhoneVerified())
                        .id(false)
                        .build())
                .stats(defaultStats())
                .memberSince(u.getCreatedAt() != null ? u.getCreatedAt().toInstant(ZoneOffset.UTC) : null)
                .profileComplete(u.isProfileComplete());
        if (includeEmail) b.email(u.getEmail());
        return b.build();
    }

    private UserPublicProfileDataDto toPublicProfileData(UserEntity u, UserPreferences prefs) {
        List<String> interestNames = u.getInterests() != null
                ? u.getInterests().stream().map(Interest::getName).collect(Collectors.toList())
                : List.of();

        return UserPublicProfileDataDto.builder()
                .id(u.getId().toString())
                .fullName(fullName(u))
                .age(age(u.getDateOfBirth()))
                .gender(u.getGender() != null ? u.getGender().name().toLowerCase() : null)
                .location(toLocationDto(u))
                .profilePhoto(u.getProfilePhotoUrl())
                .bio(u.getBio())
                .interests(interestNames)
                .preferences(toPreferencesDto(prefs))
                .verification(VerificationDto.builder()
                        .email(u.isEmailVerified())
                        .phone(u.isPhoneVerified())
                        .id(false)
                        .build())
                .stats(defaultStats())
                .memberSince(u.getCreatedAt() != null ? u.getCreatedAt().toInstant(ZoneOffset.UTC) : null)
                .build();
    }

    private static UserStatsDto defaultStats() {
        return UserStatsDto.builder()
                .tripsCompleted(0)
                .countriesVisited(0)
                .citiesExplored(0)
                .travelBuddiesMet(0)
                .totalDistance(0L)
                .daysTravel(0)
                .rating(null)
                .reviewCount(0)
                .build();
    }

    private static String fullName(UserEntity u) {
        if (u.getFirstName() != null && u.getLastName() != null) {
            return (u.getFirstName() + " " + u.getLastName()).trim();
        }
        if (u.getFirstName() != null) return u.getFirstName();
        if (u.getLastName() != null) return u.getLastName();
        return "";
    }

    private static String[] splitFullName(String fullName) {
        if (fullName == null || fullName.isBlank()) return new String[]{"", ""};
        String t = fullName.trim();
        int i = t.indexOf(' ');
        if (i <= 0) return new String[]{t, ""};
        return new String[]{t.substring(0, i), t.substring(i + 1).trim()};
    }

    private static Integer age(LocalDate dateOfBirth) {
        if (dateOfBirth == null) return null;
        return Period.between(dateOfBirth, LocalDate.now()).getYears();
    }

    private static LocationDto toLocationDto(UserEntity u) {
        if (u.getCity() == null && u.getCountry() == null) return null;
        return LocationDto.builder()
                .city(u.getCity())
                .country(u.getCountry())
                .build();
    }

    private static PreferencesDto toPreferencesDto(UserPreferences p) {
        if (p == null) return null;
        BudgetRangeDto budget = (p.getMinBudget() != null || p.getMaxBudget() != null)
                ? BudgetRangeDto.builder()
                .min(p.getMinBudget() != null ? p.getMinBudget().intValue() : null)
                .max(p.getMaxBudget() != null ? p.getMaxBudget().intValue() : null)
                .build()
                : null;
        if (budget == null && p.getMinAge() == null && p.getMaxAge() == null && p.getPreferredGender() == null) {
            return null;
        }
        return PreferencesDto.builder()
                .minAge(p.getMinAge())
                .maxAge(p.getMaxAge())
                .preferredGender(p.getPreferredGender())
                .budgetRange(budget)
                .build();
    }
}
