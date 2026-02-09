package kz.sdu.clients.notification;

import lombok.Builder;

@Builder
public record VerificationCodePayload(String email, String code) {
}
