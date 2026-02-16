package kz.sdu.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
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

@Tag(name = "Notification", description = "Отправка email-уведомлений (внутренний API для других сервисов)")
@Slf4j
@RestController
@RequestMapping("/api/notification")
@AllArgsConstructor
public class NotificationController {

    private final EmailService emailService;

    @Operation(summary = "Приветственное письмо", description = "Отправка приветственного письма на указанный email после регистрации.")
    @ApiResponse(responseCode = "200", description = "Письмо отправлено")
    @PostMapping("/welcome-message")
    public void sendWelcomeMessage(@RequestBody NotificationEmailDto notificationEmailDto) throws MessagingException {
        emailService.sendWelcomeMessage(notificationEmailDto.email());
    }

    @Operation(summary = "Код верификации", description = "Отправка письма с кодом верификации (регистрация или повторная отправка).")
    @ApiResponse(responseCode = "200", description = "Письмо отправлено")
    @PostMapping("/verification-code")
    public void sendVerificationCode(@RequestBody VerificationCodePayload payload) throws MessagingException {
        emailService.sendVerificationCode(payload.email(), payload.code());
    }

    @Operation(summary = "Ссылка сброса пароля", description = "Отправка письма со ссылкой для сброса пароля (токен генерируется вызывающим сервисом).")
    @ApiResponse(responseCode = "200", description = "Письмо отправлено")
    @PostMapping("/password-reset-link")
    public void sendPasswordResetLink(@RequestBody PasswordResetLinkPayload payload) throws MessagingException {
        emailService.sendPasswordResetLink(payload.email(), payload.token());
    }
}
