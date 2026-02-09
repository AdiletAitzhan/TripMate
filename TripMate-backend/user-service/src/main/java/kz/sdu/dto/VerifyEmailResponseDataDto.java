package kz.sdu.dto;

import lombok.Builder;

@Builder
public record VerifyEmailResponseDataDto(
        boolean verified,
        String accessToken,
        String refreshToken
) {
}

