package kz.sdu.dto;

import lombok.Builder;

@Builder
public record ApiErrorDto(
        String code,
        String message
) {
}

