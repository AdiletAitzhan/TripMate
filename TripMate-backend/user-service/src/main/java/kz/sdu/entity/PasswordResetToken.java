package kz.sdu.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "password_reset_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetToken {
    @Id
    @Column(nullable = false, updatable = false)
    private UUID token;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @CreationTimestamp
    private LocalDateTime createdAt;
}

