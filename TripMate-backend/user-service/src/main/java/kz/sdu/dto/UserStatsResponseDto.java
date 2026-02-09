package kz.sdu.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserStatsResponseDto {
    private boolean success;
    private UserStatsDto data;
}
