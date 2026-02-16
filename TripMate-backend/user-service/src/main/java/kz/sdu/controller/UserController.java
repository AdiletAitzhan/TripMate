package kz.sdu.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
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

@Tag(name = "Users", description = "Профиль и настройки пользователя")
@Slf4j
@RestController
@AllArgsConstructor
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @Operation(summary = "Мой профиль", description = "Получить профиль текущего пользователя. Требуется Bearer token.")
    @ApiResponse(responseCode = "200", description = "Профиль пользователя")
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponseDto> getMyProfile(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(userService.getCurrentUserProfile(jwt));
    }

    @Operation(summary = "Обновить профиль", description = "Обновить данные профиля текущего пользователя.")
    @ApiResponse(responseCode = "200", description = "Профиль обновлён")
    @PutMapping("/me")
    public ResponseEntity<UpdateProfileResponseDto> updateProfile(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody UpdateProfileRequestDto request) {
        return ResponseEntity.ok(userService.updateProfile(jwt.getSubject(), request));
    }

    @Operation(summary = "Загрузить фото", description = "Загрузка/обновление фото профиля (multipart/form-data, параметр 'photo').")
    @ApiResponse(responseCode = "200", description = "Фото загружено")
    @PostMapping(value = "/me/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PhotoUploadResponseDto> updateProfilePhoto(
            @AuthenticationPrincipal Jwt jwt,
            @Parameter(description = "Файл изображения") @RequestParam("photo") MultipartFile photo) {
        log.info("jwt subject: {}", jwt.getSubject());
        return ResponseEntity.ok(userService.uploadPhoto(jwt.getSubject(), photo));
    }

    @Operation(summary = "Обновить предпочтения", description = "Обновить предпочтения поездок (интересы, бюджет и т.д.).")
    @ApiResponse(responseCode = "200", description = "Предпочтения обновлены")
    @PutMapping("/me/preferences")
    public ResponseEntity<UpdatePreferencesResponseDto> updatePreferences(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody UpdatePreferencesRequestDto request) {
        return ResponseEntity.ok(userService.updatePreferences(jwt.getSubject(), request));
    }

    @Operation(summary = "Публичный профиль по ID", description = "Получить публичный профиль пользователя по его UUID.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Профиль найден"),
            @ApiResponse(responseCode = "404", description = "Пользователь не найден")
    })
    @GetMapping("/{userId}")
    public ResponseEntity<UserPublicProfileResponseDto> getUserById(
            @AuthenticationPrincipal Jwt jwt,
            @Parameter(description = "UUID пользователя") @PathVariable("userId") UUID userId) {
        return ResponseEntity.ok(userService.getUserById(userId.toString()));
    }

    @Operation(summary = "Моя статистика", description = "Получить статистику текущего пользователя (поездки, совпадения и т.д.).")
    @ApiResponse(responseCode = "200", description = "Статистика")
    @GetMapping("/me/stats")
    public ResponseEntity<UserStatsResponseDto> getMyStats(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(userService.getMyStats(jwt.getSubject()));
    }
}
