package kz.sdu.clients.notification;

import lombok.Builder;

@Builder
public record PasswordResetLinkPayload(String email, String token) {
}

