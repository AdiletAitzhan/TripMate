package kz.sdu.controller;

import jakarta.validation.Valid;
import kz.sdu.dto.*;
import kz.sdu.service.UserService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Slf4j
@RestController
@AllArgsConstructor
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponseDto> getMyProfile(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(userService.getCurrentUserProfile(jwt));
    }

    @PutMapping("/me")
    public ResponseEntity<UpdateProfileResponseDto> updateProfile(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody UpdateProfileRequestDto request) {
        return ResponseEntity.ok(userService.updateProfile(jwt.getSubject(), request));
    }

    @PostMapping(value = "/me/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PhotoUploadResponseDto> updateProfilePhoto(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam("photo") MultipartFile photo) {
        log.info("jwt subject: {}", jwt.getSubject());
        return ResponseEntity.ok(userService.uploadPhoto(jwt.getSubject(), photo));
    }

    @PutMapping("/me/preferences")
    public ResponseEntity<UpdatePreferencesResponseDto> updatePreferences(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody UpdatePreferencesRequestDto request) {
        return ResponseEntity.ok(userService.updatePreferences(jwt.getSubject(), request));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserPublicProfileResponseDto> getUserById(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID userId) {
        return ResponseEntity.ok(userService.getUserById(userId.toString()));
    }

    @GetMapping("/me/stats")
    public ResponseEntity<UserStatsResponseDto> getMyStats(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(userService.getMyStats(jwt.getSubject()));
    }
}
