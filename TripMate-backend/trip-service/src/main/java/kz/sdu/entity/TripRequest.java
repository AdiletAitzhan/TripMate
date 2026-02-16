package kz.sdu.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;
import kz.sdu.dto.common.BudgetDto;
import kz.sdu.dto.common.PreferencesDto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "trip_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "dest_city", nullable = false, length = 100)
    private String destCity;

    @Column(name = "dest_country", nullable = false, length = 100)
    private String destCountry;

    @Column(name = "dest_country_code", length = 10)
    private String destCountryCode;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "flexible_dates", nullable = false)
    @Builder.Default
    private Boolean flexibleDates = false;

    @Column(name = "budget_amount", precision = 10, scale = 2)
    private BigDecimal budgetAmount;

    @Column(name = "budget_currency", length = 3)
    private String budgetCurrency;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "preferences", columnDefinition = "jsonb")
    private PreferencesDto preferences;

    @Column(name = "notify_on_match", nullable = false)
    @Builder.Default
    private Boolean notifyOnMatch = false;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "active";

    @Column(name = "match_count", nullable = false)
    @Builder.Default
    private Integer matchCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
