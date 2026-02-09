package kz.sdu.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class UserPublicProfileDataDto {
    private String id;
    private String fullName;
    private Integer age;
    private String gender;
    private LocationDto location;
    private String profilePhoto;
    private String bio;
    private List<String> interests;
    private PreferencesDto preferences;
    private VerificationDto verification;
    private UserStatsDto stats;
    private Instant memberSince;
}
