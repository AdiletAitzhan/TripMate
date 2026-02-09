package kz.sdu.dto;

import lombok.Builder;

@Builder
public record RefreshTokenResponseDataDto(
        String accessToken,
        String refreshToken
) {
}

