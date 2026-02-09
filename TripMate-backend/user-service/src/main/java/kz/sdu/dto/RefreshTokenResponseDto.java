package kz.sdu.dto;

import lombok.Builder;

@Builder
public record RefreshTokenResponseDto(
        boolean success,
        RefreshTokenResponseDataDto data,
        ApiErrorDto error
) {
}

