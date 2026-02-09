package kz.sdu.dto;

import lombok.Builder;

import java.util.UUID;

@Builder
public record RegisterResponseDataDto(
        UUID userId,
        String email,
        boolean verificationRequired,
        String message
) {
}

