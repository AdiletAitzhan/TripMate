package kz.sdu.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class UpdateProfileDataDto {
    private String id;
    private String fullName;
    private LocationDto location;
    private String bio;
    private String phone;
    private Instant updatedAt;
}
