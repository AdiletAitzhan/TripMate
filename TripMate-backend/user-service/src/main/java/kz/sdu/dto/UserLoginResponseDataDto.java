package kz.sdu.dto;

import lombok.Builder;

@Builder
public record UserLoginResponseDataDto(
        AuthUserDto user,
        String accessToken,
        String refreshToken
) {
}

