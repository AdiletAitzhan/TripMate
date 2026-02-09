package kz.sdu.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserProfileResponseDto {
    private boolean success;
    private UserProfileDataDto data;
}
