package kz.sdu.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class UserEntity {

    @Id
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "phone_number", unique = true, length = 20)
    private String phoneNumber;

    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "auth_provider", nullable = false, length = 20)
    private AuthProvider authProvider = AuthProvider.LOCAL;

    @Column(name = "is_email_verified", nullable = false)
    private boolean emailVerified = false;

    @Column(name = "is_phone_verified", nullable = false)
    private boolean phoneVerified = false;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Column(length = 20)
    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Column(columnDefinition = "text")
    private String bio;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String country;

    @Column(name = "profile_photo_url", columnDefinition = "text")
    private String profilePhotoUrl;

    @ManyToMany(fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "user_interests",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "interest_id")
    )
    @Builder.Default
    private List<Interest> interests = new ArrayList<>();

    @OneToOne(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private UserPreferences preferences;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Computed: profile is complete when required fields are set.
     */
    public boolean isProfileComplete() {
        return firstName != null && !firstName.isBlank()
                && lastName != null && !lastName.isBlank()
                && dateOfBirth != null;
    }
}
