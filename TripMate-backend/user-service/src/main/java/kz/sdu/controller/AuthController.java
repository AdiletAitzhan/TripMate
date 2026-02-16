package kz.sdu.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import kz.sdu.dto.*;
import kz.sdu.service.AuthService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Auth", description = "Аутентификация и регистрация пользователей")
@SecurityRequirements() // эндпоинты без JWT
@RestController
@RequestMapping("api/auth")
@AllArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Вход", description = "Вход по email и паролю. Возвращает access и refresh токены.")
    @ApiResponses({
            @ApiResponse(responseCode = "202", description = "Успешный вход"),
            @ApiResponse(responseCode = "401", description = "Неверные учётные данные")
    })
    @PostMapping("/login")
    public ResponseEntity<UserLoginResponseDto> login(@Valid @RequestBody UserLoginRequestDto req) {
        UserLoginResponseDto userLoginResponseDto = authService.login(req);
        if (userLoginResponseDto.success()) {
            return new ResponseEntity<>(userLoginResponseDto, HttpStatus.ACCEPTED);
        }
        return new ResponseEntity<>(userLoginResponseDto, HttpStatus.UNAUTHORIZED);
    }

    @Operation(summary = "Регистрация", description = "Регистрация нового пользователя. После регистрации требуется верификация email.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Пользователь создан"),
            @ApiResponse(responseCode = "409", description = "Email уже зарегистрирован")
    })
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<RegisterResponseDto> register(@Valid @RequestBody UserRegistrationDto req) {
        RegisterResponseDto response = authService.register(req);
        if (response.success()) {
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        }
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    @Operation(summary = "Верификация email", description = "Подтверждение email по коду из письма.")
    @ApiResponses({
            @ApiResponse(responseCode = "202", description = "Email успешно верифицирован"),
            @ApiResponse(responseCode = "400", description = "Неверный или истёкший код")
    })
    @PostMapping("/verify-email")
    public ResponseEntity<VerifyEmailResponseDto> verifyEmail(@Valid @RequestBody VerifyEmailRequestDto req) {
        VerifyEmailResponseDto responseDto = authService.verifyEmail(req);
        if (responseDto.success()) {
            return new ResponseEntity<>(responseDto, HttpStatus.ACCEPTED);
        }
        return new ResponseEntity<>(responseDto, HttpStatus.BAD_REQUEST);
    }

    @Operation(summary = "Повторная отправка кода верификации", description = "Отправляет новый код верификации на email.")
    @ApiResponses({
            @ApiResponse(responseCode = "202", description = "Код отправлен"),
            @ApiResponse(responseCode = "400", description = "Ошибка (например, email уже верифицирован)")
    })
    @PostMapping("/resend-verification")
    public ResponseEntity<SimpleMessageResponseDto> resendVerification(@Valid @RequestBody ResendVerificationRequestDto req) {
        SimpleMessageResponseDto responseDto = authService.resendVerification(req);
        if (responseDto.success()) {
            return new ResponseEntity<>(responseDto, HttpStatus.ACCEPTED);
        }
        return new ResponseEntity<>(responseDto, HttpStatus.BAD_REQUEST);

    }

    @Operation(summary = "Забыли пароль", description = "Запрос на сброс пароля. На email отправляется ссылка для сброса.")
    @ApiResponse(responseCode = "202", description = "Запрос принят, письмо отправлено")
    @PostMapping("/forgot-password")
    public ResponseEntity<SimpleMessageResponseDto> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDto req) {
        return new ResponseEntity<>(authService.forgotPassword(req), HttpStatus.ACCEPTED);
    }

    @Operation(summary = "Сброс пароля", description = "Установка нового пароля по токену из письма.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Пароль успешно изменён"),
            @ApiResponse(responseCode = "400", description = "Неверный или истёкший токен")
    })
    @PostMapping("/reset-password")
    public ResponseEntity<SimpleMessageResponseDto> resetPassword(@Valid @RequestBody ResetPasswordRequestDto req) {
        SimpleMessageResponseDto responseDto = authService.resetPassword(req);
        if (responseDto.success()) {
            return new ResponseEntity<>(responseDto, HttpStatus.OK);
        }
        return new ResponseEntity<>(responseDto, HttpStatus.BAD_REQUEST);

    }

    @Operation(summary = "Обновление токена", description = "Получение новой пары access/refresh токенов по refresh токену.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Токены обновлены"),
            @ApiResponse(responseCode = "400", description = "Невалидный refresh токен")
    })
    @PostMapping("/refresh-token")
    public ResponseEntity<RefreshTokenResponseDto> refreshToken(@Valid @RequestBody RefreshTokenRequestDto req) {
        RefreshTokenResponseDto responseDto = authService.refreshToken(req);
        if (responseDto.success()) {
            return new ResponseEntity<>(responseDto, HttpStatus.OK);
        }
        return new ResponseEntity<>(responseDto, HttpStatus.BAD_REQUEST);
    }

    @Operation(summary = "Выход", description = "Выход из системы (инвалидация refresh токена). Требуется Bearer token.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Успешный выход"),
            @ApiResponse(responseCode = "400", description = "Ошибка")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/logout")
    public ResponseEntity<SimpleMessageResponseDto> logout(@Valid @RequestBody LogoutRequestDto req) {
        SimpleMessageResponseDto responseDto = authService.logout(req);
        if (responseDto.success()) {
            return new ResponseEntity<>(responseDto, HttpStatus.OK);
        }
        return new ResponseEntity<>(responseDto, HttpStatus.BAD_REQUEST);
    }

    @Operation(summary = "Вход через Google", description = "Аутентификация по Google ID token. Возвращает access и refresh токены.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Успешный вход"),
            @ApiResponse(responseCode = "400", description = "Невалидный Google token")
    })
    @PostMapping("/google")
    public ResponseEntity<UserLoginResponseDto> google(@Valid @RequestBody GoogleAuthRequestDto req) {
        UserLoginResponseDto responseDto = authService.google(req);
        if (responseDto.success()) {
            return new ResponseEntity<>(responseDto, HttpStatus.OK);
        }
        return new ResponseEntity<>(responseDto, HttpStatus.BAD_REQUEST);
    }
}
