package kz.sdu.controller;

import jakarta.mail.MessagingException;
import kz.sdu.clients.notification.NotificationEmailDto;
import kz.sdu.clients.notification.VerificationCodePayload;
import kz.sdu.clients.notification.PasswordResetLinkPayload;
import kz.sdu.service.EmailService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/notification")
@AllArgsConstructor
public class NotificationController {

    private final EmailService emailService;

    /**
     * Sends a welcome email to the given address.
     */
    @PostMapping("/welcome-message")
    public void sendWelcomeMessage(@RequestBody NotificationEmailDto notificationEmailDto) throws MessagingException {
        emailService.sendWelcomeMessage(notificationEmailDto.email());
    }

    /**
     * Sends a verification code email (registration / resend).
     */
    @PostMapping("/verification-code")
    public void sendVerificationCode(@RequestBody VerificationCodePayload payload) throws MessagingException {
        emailService.sendVerificationCode(payload.email(), payload.code());
    }

    /**
     * Sends a password reset link with the already generated token.
     */
    @PostMapping("/password-reset-link")
    public void sendPasswordResetLink(@RequestBody PasswordResetLinkPayload payload) throws MessagingException {
        emailService.sendPasswordResetLink(payload.email(), payload.token());
    }
}
