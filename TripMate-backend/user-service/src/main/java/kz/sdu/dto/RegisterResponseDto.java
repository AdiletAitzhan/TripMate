package kz.sdu.dto;

import lombok.Builder;

@Builder
public record RegisterResponseDto(
        boolean success,
        RegisterResponseDataDto data,
        ApiErrorDto error
) {
}

