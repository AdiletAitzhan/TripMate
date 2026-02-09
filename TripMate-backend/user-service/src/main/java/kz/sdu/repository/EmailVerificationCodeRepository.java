package kz.sdu.repository;

import kz.sdu.entity.EmailVerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmailVerificationCodeRepository extends JpaRepository<EmailVerificationCode, String> {
}

