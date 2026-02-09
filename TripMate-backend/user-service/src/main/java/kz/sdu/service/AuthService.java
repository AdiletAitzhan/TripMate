package kz.sdu.service;

import kz.sdu.clients.notification.NotificationClient;
import kz.sdu.clients.notification.NotificationEmailDto;
import kz.sdu.clients.notification.PasswordResetLinkPayload;
import kz.sdu.clients.notification.VerificationCodePayload;
import kz.sdu.dto.*;
import kz.sdu.entity.*;
import kz.sdu.keycloak.KeycloakAdminFactory;
import kz.sdu.keycloak.OidcTokenClient;
import kz.sdu.repository.UserProfileRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@AllArgsConstructor
public class AuthService {

    private static final SecureRandom RNG = new SecureRandom();

    private final OidcTokenClient oidcTokenClient;
    private final KeycloakAdminFactory keycloakAdminFactory;
    private final UserProfileRepository userProfileRepository;
    private final NotificationClient notificationClient;
    private final GoogleTokenVerifier googleTokenVerifier;
    private final VerificationService verificationService;


    public UserLoginResponseDto login(UserLoginRequestDto req) {
        try {
            Map<String, Object> tokens = oidcTokenClient.passwordGrant(req.getEmail(), req.getPassword());
            String accessToken = (String) tokens.get("access_token");
            String refreshToken = (String) tokens.get("refresh_token");

            UserRepresentation user = findKeycloakUserByEmail(req.getEmail());
            ensureUserProfileIfMissing(user);

            UserEntity profile = userProfileRepository.findByEmail(req.getEmail()).orElse(null);
            UserLoginResponseDto loginResponseDto = UserLoginResponseDto.builder()
                    .success(true)
                    .data(UserLoginResponseDataDto.builder()
                            .user(toAuthUser(user, profile, false))
                            .accessToken(accessToken)
                            .refreshToken(refreshToken)
                            .build())
                    .build();
            return loginResponseDto;
        } catch (HttpClientErrorException e) {
            UserLoginResponseDto loginResponseDto = UserLoginResponseDto.builder()
                    .success(false)
                    .error(ApiErrorDto.builder()
                            .code("INVALID_CREDENTIALS")
                            .message("Invalid email or password")
                            .build())
                    .build();

            return loginResponseDto;
        }
    }

    @Transactional
    public RegisterResponseDto register(UserRegistrationDto req) {
        UserRepresentation existing = findKeycloakUserByEmailOrNull(req.getEmail());
        if (existing != null) {
            return RegisterResponseDto.builder()
                    .success(false)
                    .error(ApiErrorDto.builder()
                            .code("EMAIL_EXISTS")
                            .message("Email already registered")
                            .build())
                    .build();
        }

        UUID userId = createKeycloakUserDisabled(req);
        ensureUserProfileById(userId, req);

        String code = generateCode6();

        // Persist verification code and send it via notification service
        verificationService.createVerificationCode(req.getEmail(), code, req.getPassword());
        notificationClient.sendVerificationCode(VerificationCodePayload.builder()
                .email(req.getEmail())
                .code(code)
                .build());

        return RegisterResponseDto.builder()
                .success(true)
                .data(RegisterResponseDataDto.builder()
                        .userId(userId)
                        .email(req.getEmail())
                        .verificationRequired(true)
                        .message("Verification code sent to email")
                        .build())
                .build();
    }

    @Transactional
    public VerifyEmailResponseDto verifyEmail(VerifyEmailRequestDto req) {
        EmailVerificationCode code = verificationService.getVerificationCode(req.getEmail())
                .orElse(null);

        if (code == null || code.getExpiresAt().isBefore(LocalDateTime.now()) || !code.getCode().equals(req.getCode())) {
            return VerifyEmailResponseDto.builder()
                    .success(false)
                    .error(ApiErrorDto.builder()
                            .code("INVALID_CODE")
                            .message("Invalid or expired verification code")
                            .build())
                    .build();
        }

        UserRepresentation user = findKeycloakUserByEmail(req.getEmail());
        enableAndVerifyEmail(user.getId());
        verificationService.deleteVerificationCode(req.getEmail());
        userProfileRepository.findByEmail(req.getEmail()).ifPresent(profile -> {
            profile.setEmailVerified(true);
            userProfileRepository.save(profile);
        });
        notificationClient.sendWelcomeMessage(NotificationEmailDto.builder()
                .email(req.getEmail())
                .build());

        Map<String, Object> tokens = oidcTokenClient.passwordGrant(req.getEmail(), code.getRawPassword());
        return VerifyEmailResponseDto.builder()
                .success(true)
                .data(VerifyEmailResponseDataDto.builder()
                        .verified(true)
                        .accessToken((String) tokens.get("access_token"))
                        .refreshToken((String) tokens.get("refresh_token"))
                        .build())
                .build();
    }

    @Transactional
    public SimpleMessageResponseDto resendVerification(ResendVerificationRequestDto req) {
        if (!verificationService.verificationCodeExists(req.getEmail())) {
            return SimpleMessageResponseDto.builder()
                    .success(false)
                    .error(ApiErrorDto.builder()
                            .code("VERIFICATION_NOT_PENDING")
                            .message("No pending verification for this email")
                            .build())
                    .build();
        }

        String newCode = generateCode6();
        verificationService.updateVerificationCode(req.getEmail(), newCode);
        notificationClient.sendVerificationCode(VerificationCodePayload.builder()
                .email(req.getEmail())
                .code(newCode)
                .build());

        return SimpleMessageResponseDto.builder()
                .success(true)
                .message("Verification code sent")
                .build();
    }

    @Transactional
    public SimpleMessageResponseDto forgotPassword(ForgotPasswordRequestDto req) {
        // Always 200 per your contract
        UserRepresentation user = findKeycloakUserByEmailOrNull(req.getEmail());
        if (user != null) {
            UUID token = verificationService.createPasswordResetToken(req.getEmail());

            // Send reset link via notification service (notification does not manage tokens)
            notificationClient.sendPasswordResetLink(PasswordResetLinkPayload.builder()
                    .email(req.getEmail())
                    .token(token.toString())
                    .build());
        }

        return SimpleMessageResponseDto.builder()
                .success(true)
                .message("Password reset link sent to email")
                .build();
    }

    @Transactional
    public SimpleMessageResponseDto resetPassword(ResetPasswordRequestDto req) {
        UUID token;
        try {
            token = UUID.fromString(req.getToken());
        } catch (IllegalArgumentException e) {
            return SimpleMessageResponseDto.builder()
                    .success(false)
                    .error(ApiErrorDto.builder()
                            .code("INVALID_TOKEN")
                            .message("Invalid reset token")
                            .build())
                    .build();
        }

        PasswordResetToken tokenEntity = verificationService.getPasswordResetToken(token)
                .orElse(null);

        if (tokenEntity == null || tokenEntity.getExpiresAt().isBefore(LocalDateTime.now())) {
            return SimpleMessageResponseDto.builder()
                    .success(false)
                    .error(ApiErrorDto.builder()
                            .code("INVALID_TOKEN")
                            .message("Invalid reset token")
                            .build())
                    .build();
        }

        UserRepresentation user = findKeycloakUserByEmail(tokenEntity.getEmail());
        setPassword(user.getId(), req.getNewPassword());
        verificationService.deletePasswordResetToken(token);

        return SimpleMessageResponseDto.builder()
                .success(true)
                .message("Password reset successful")
                .build();
    }

    public RefreshTokenResponseDto refreshToken(RefreshTokenRequestDto req) {
        try {
            Map<String, Object> tokens = oidcTokenClient.refreshToken(req.getRefreshToken());
            return RefreshTokenResponseDto.builder()
                    .success(true)
                    .data(RefreshTokenResponseDataDto.builder()
                            .accessToken((String) tokens.get("access_token"))
                            .refreshToken((String) tokens.get("refresh_token"))
                            .build())
                    .build();
        } catch (HttpClientErrorException e) {
            return RefreshTokenResponseDto.builder()
                    .success(false)
                    .error(ApiErrorDto.builder()
                            .code("INVALID_REFRESH_TOKEN")
                            .message("Invalid refresh token")
                            .build())
                    .build();
        }
    }

    public SimpleMessageResponseDto logout(LogoutRequestDto req) {
        try {
            oidcTokenClient.logout(req.getRefreshToken());
        } catch (Exception ignored) {
        }
        return SimpleMessageResponseDto.builder()
                .success(true)
                .message("Logged out successfully")
                .build();
    }

    public UserLoginResponseDto google(GoogleAuthRequestDto req) {
        try {
            GoogleUserPayload googleUser =
                    googleTokenVerifier.verifyGoogleToken(req.getIdToken());

            Map<String, Object> tokens;
            try {
                tokens = oidcTokenClient.tokenExchangeGoogle(req.getIdToken());
            } catch (HttpClientErrorException e) {
                // Keycloak token exchange not configured — fallback: find or create user, then password grant
                UserRepresentation user = findKeycloakUserByEmailOrNull(googleUser.getEmail());
                if (user == null) {
                    String tempPassword = createKeycloakUserFromGoogle(googleUser);
                    tokens = oidcTokenClient.passwordGrant(googleUser.getEmail(), tempPassword);
                    user = findKeycloakUserByEmail(googleUser.getEmail());
                } else {
                    throw new RuntimeException("User exists but Keycloak token exchange is not configured");
                }
                ensureUserProfileIfMissing(user);
                UserEntity profile = userProfileRepository.findByEmail(googleUser.getEmail()).orElse(null);
                return UserLoginResponseDto.builder()
                        .success(true)
                        .data(UserLoginResponseDataDto.builder()
                                .user(toAuthUser(user, profile, true))
                                .accessToken((String) tokens.get("access_token"))
                                .refreshToken((String) tokens.get("refresh_token"))
                                .build())
                        .build();
            }

            UserRepresentation user = findKeycloakUserByEmail(googleUser.getEmail());
            ensureUserProfileIfMissing(user);
            UserEntity profile = userProfileRepository.findByEmail(googleUser.getEmail()).orElse(null);

            return UserLoginResponseDto.builder()
                    .success(true)
                    .data(UserLoginResponseDataDto.builder()
                            .user(toAuthUser(user, profile, false))
                            .accessToken((String) tokens.get("access_token"))
                            .refreshToken((String) tokens.get("refresh_token"))
                            .build())
                    .build();
        } catch (Exception e) {
            log.warn("Google auth failed", e);
            return UserLoginResponseDto.builder()
                    .success(false)
                    .error(ApiErrorDto.builder()
                            .code("GOOGLE_AUTH_FAILED")
                            .message(e.getMessage() != null ? e.getMessage() : "Google authentication failed")
                            .build())
                    .build();
        }
    }

    /**
     * Creates a Keycloak user from Google payload with a random password.
     * Returns the generated password for immediate password grant.
     */
    private String createKeycloakUserFromGoogle(GoogleUserPayload googleUser) {
        String tempPassword = UUID.randomUUID().toString().replace("-", "") + "A1!";
        UserRepresentation u = new UserRepresentation();
        u.setEmail(googleUser.getEmail());
        u.setUsername(googleUser.getEmail());
        u.setEnabled(true);
        u.setEmailVerified(Boolean.TRUE.equals(googleUser.getEmailVerified()));
        String name = googleUser.getName();
        if (name != null && !name.isBlank()) {
            int space = name.indexOf(' ');
            if (space > 0) {
                u.setFirstName(name.substring(0, space));
                u.setLastName(name.substring(space + 1).trim());
            } else {
                u.setFirstName(name);
            }
        }
        CredentialRepresentation cred = new CredentialRepresentation();
        cred.setType(CredentialRepresentation.PASSWORD);
        cred.setTemporary(false);
        cred.setValue(tempPassword);
        u.setCredentials(List.of(cred));
        users().create(u);
        return tempPassword;
    }

    private UsersResource users() {
        Keycloak kc = keycloakAdminFactory.admin();
        return kc.realm("tripmate").users();
    }

    private UserRepresentation findKeycloakUserByEmail(String email) {
        UserRepresentation user = findKeycloakUserByEmailOrNull(email);
        if (user == null) throw new RuntimeException("USER_NOT_FOUND");
        return user;
    }

    private UserRepresentation findKeycloakUserByEmailOrNull(String email) {
        List<UserRepresentation> list = users().searchByEmail(email, true);
        return list == null || list.isEmpty() ? null : list.getFirst();
    }

    private UUID createKeycloakUserDisabled(UserRegistrationDto req) {
        UserRepresentation u = new UserRepresentation();
        u.setEmail(req.getEmail());
        u.setUsername(req.getEmail());
        u.setEnabled(false);
        u.setEmailVerified(false);
        u.setFirstName(req.getFirstName());
        u.setLastName(req.getLastName());

        CredentialRepresentation cred = new CredentialRepresentation();
        cred.setType(CredentialRepresentation.PASSWORD);
        cred.setTemporary(false);
        cred.setValue(req.getPassword());
        u.setCredentials(List.of(cred));

        var response = users().create(u);
        try {
            String location = response.getLocation() != null ? response.getLocation().toString() : null;
            if (location == null) throw new RuntimeException("CREATE_FAILED");
            String id = location.substring(location.lastIndexOf('/') + 1);
            return UUID.fromString(id);
        } finally {
            response.close();
        }
    }

    private void enableAndVerifyEmail(String userId) {
        UserRepresentation rep = users().get(userId).toRepresentation();
        rep.setEnabled(true);
        rep.setEmailVerified(true);
        users().get(userId).update(rep);
    }

    private void setPassword(String userId, String newPassword) {
        CredentialRepresentation cred = new CredentialRepresentation();
        cred.setType(CredentialRepresentation.PASSWORD);
        cred.setTemporary(false);
        cred.setValue(newPassword);
        users().get(userId).resetPassword(cred);
    }

    private void ensureUserProfileIfMissing(UserRepresentation user) {
        if (user == null || user.getId() == null) return;
        UUID id;
        try {
            id = UUID.fromString(user.getId());
        } catch (Exception e) {
            return;
        }
        if (userProfileRepository.existsById(id)) return;
        userProfileRepository.save(UserEntity.builder()
                .id(id)
                .email(user.getEmail())
                .firstName(user.getFirstName() != null ? user.getFirstName() : "")
                .lastName(user.getLastName() != null ? user.getLastName() : "")
                .dateOfBirth(LocalDate.of(2000, 1, 1))
                .active(true)
                .build());
    }

    private void ensureUserProfileById(UUID id, UserRegistrationDto req) {
        if (userProfileRepository.existsById(id)) return;
        LocalDate dob = req.getDateOfBirth() != null ? req.getDateOfBirth() : null;
        UserEntity.UserEntityBuilder b = UserEntity.builder()
                .id(id)
                .email(req.getEmail())
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .dateOfBirth(dob)
                .gender(parseGender(req.getGender()))
                .authProvider(AuthProvider.LOCAL)
                .active(true);
        if (req.getCity() != null) b.city(req.getCity());
        if (req.getCountry() != null) b.country(req.getCountry());
        if (req.getBio() != null) b.bio(req.getBio());
        userProfileRepository.save(b.build());
    }

    private AuthUserDto toAuthUser(UserRepresentation user, UserEntity profile, boolean isNewUser) {
        UUID id = null;
        try {
            id = user.getId() != null ? UUID.fromString(user.getId()) : null;
        } catch (Exception ignored) {
        }
        String name = profile != null && profile.getFirstName() != null ? profile.getFirstName() : user.getFirstName();
        boolean profileComplete = profile != null && profile.isProfileComplete();
        return AuthUserDto.builder()
                .id(id)
                .email(user.getEmail())
                .name(name)
                .isNewUser(isNewUser)
                .profileComplete(profileComplete)
                .build();
    }

    private static String generateCode6() {
        int v = RNG.nextInt(1_000_000);
        return String.format("%06d", v);
    }

    private static LocalDate parseDate(String yyyyMmDd) {
        try {
            return LocalDate.parse(yyyyMmDd);
        } catch (Exception e) {
            return null;
        }
    }

    private static Gender parseGender(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return Gender.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
