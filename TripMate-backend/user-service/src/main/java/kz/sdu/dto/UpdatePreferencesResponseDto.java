package kz.sdu.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UpdatePreferencesResponseDto {
    private boolean success;
    private UpdatePreferencesDataDto data;
}
