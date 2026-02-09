package kz.sdu.dto;

import lombok.Builder;

import java.util.UUID;

@Builder
public record AuthUserDto(
        UUID id,
        String email,
        String name,
        Boolean isNewUser,
        boolean profileComplete
) {
}

