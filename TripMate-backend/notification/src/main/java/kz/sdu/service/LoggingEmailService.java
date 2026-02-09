package kz.sdu.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import kz.sdu.config.FrontendProperties;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;
import org.springframework.core.env.Environment;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Locale;

@Service
@AllArgsConstructor
public class LoggingEmailService implements EmailService {
    private static final Logger log = LoggerFactory.getLogger(LoggingEmailService.class);

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private FrontendProperties frontendProperties;
    private final MessageSource messageSource;


    @Override
    public void sendVerificationCode(String email, String code) throws MessagingException {
        log.info("Verification code for {}: {}", email, code);
        Context context = new Context();
        context.setVariable("code", code);
        context.setVariable("minutes", 10);
        String body = templateEngine.process(
                "mail/verification-email",
                context
        );
        sendEmail(
                email,
                "mail.verification.subject",
                body
        );
    }

    @Override
    public void sendPasswordResetLink(String email, String token) throws MessagingException {
        log.info("Password reset token for {}: {}", email, token);
        Context context = new Context();
        context.setVariable(
                "resetLink",
                frontendProperties.getUrl() + "/reset-password?token=" + token
        );
        String body = templateEngine.process(
                "mail/reset-password-email",
                context
        );
        sendEmail(email,
                "mail.reset-password.subject",
                body);

    }


    public void sendWelcomeMessage(String email) throws MessagingException {
        String body = templateEngine.process(
                "mail/welcome-email",
                new Context()
        );
        sendEmail(
                email,
                "mail.welcome.subject",
                body

        );
    }

    private void sendEmail(String to, String header, String html) throws MessagingException {
        String subject = messageSource.getMessage(
                header,
                null,
                Locale.forLanguageTag("ru")
        );

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(html, true);

        mailSender.send(message);
    }
}

