package kz.sdu.dto;

import lombok.Builder;

@Builder
public record UserLoginResponseDto(
        boolean success,
        UserLoginResponseDataDto data,
        ApiErrorDto error
) {
}

