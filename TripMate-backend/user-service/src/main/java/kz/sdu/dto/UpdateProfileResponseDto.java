package kz.sdu.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UpdateProfileResponseDto {
    private boolean success;
    private UpdateProfileDataDto data;
}
