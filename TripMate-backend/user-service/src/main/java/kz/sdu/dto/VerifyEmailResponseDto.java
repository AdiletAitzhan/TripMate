package kz.sdu.dto;

import lombok.Builder;

@Builder
public record VerifyEmailResponseDto(
        boolean success,
        VerifyEmailResponseDataDto data,
        ApiErrorDto error
) {
}

