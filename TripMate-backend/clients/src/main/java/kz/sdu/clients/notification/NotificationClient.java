package kz.sdu.clients.notification;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient("notification")
public interface NotificationClient {

    /**
     * Send a welcome email to the given address.
     */
    @PostMapping("/api/notification/welcome-message")
    void sendWelcomeMessage(@RequestBody NotificationEmailDto notificationEmailDto);

    /**
     * Send a verification code email.
     */
    @PostMapping("/api/notification/verification-code")
    void sendVerificationCode(@RequestBody VerificationCodePayload verificationCodePayload);

    /**
     * Send a password reset link that contains an already generated token.
     */
    @PostMapping("/api/notification/password-reset-link")
    void sendPasswordResetLink(@RequestBody PasswordResetLinkPayload payload);
}
