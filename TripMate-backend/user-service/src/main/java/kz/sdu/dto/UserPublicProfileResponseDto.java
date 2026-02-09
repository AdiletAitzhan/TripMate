package kz.sdu.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserPublicProfileResponseDto {
    private boolean success;
    private UserPublicProfileDataDto data;
}
