package kz.sdu.dto;

import lombok.Builder;

@Builder
public record SimpleMessageResponseDto(
        boolean success,
        String message,
        ApiErrorDto error
) {
}

