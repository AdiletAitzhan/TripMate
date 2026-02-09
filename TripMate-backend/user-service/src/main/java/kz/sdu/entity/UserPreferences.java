package kz.sdu.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user_preferences")
public class UserPreferences {

    @Id
    @Column(name = "user_id", columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @Column(name = "min_age")
    private Integer minAge;

    @Column(name = "max_age")
    private Integer maxAge;

    @Column(name = "preferred_gender", length = 20)
    private String preferredGender;

    @Column(name = "min_budget", precision = 10, scale = 2)
    private BigDecimal minBudget;

    @Column(name = "max_budget", precision = 10, scale = 2)
    private BigDecimal maxBudget;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
