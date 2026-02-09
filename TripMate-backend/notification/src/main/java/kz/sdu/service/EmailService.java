package kz.sdu.service;

import jakarta.mail.MessagingException;

public interface EmailService {
    void sendVerificationCode(String email, String code) throws MessagingException;

    void sendPasswordResetLink(String email, String token) throws MessagingException;

    void sendWelcomeMessage(String email) throws MessagingException;
}

