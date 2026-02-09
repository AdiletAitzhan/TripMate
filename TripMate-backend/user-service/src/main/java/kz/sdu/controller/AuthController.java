package kz.sdu.controller;

import jakarta.validation.Valid;
import kz.sdu.dto.*;
import kz.sdu.service.AuthService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/auth")
@AllArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<UserLoginResponseDto> login(@Valid @RequestBody UserLoginRequestDto req) {
        UserLoginResponseDto userLoginResponseDto = authService.login(req);
        if (userLoginResponseDto.success()) {
            return new ResponseEntity<>(userLoginResponseDto, HttpStatus.ACCEPTED);
        }
        return new ResponseEntity<>(userLoginResponseDto, HttpStatus.UNAUTHORIZED);
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<RegisterResponseDto> register(@Valid @RequestBody UserRegistrationDto req) {
        RegisterResponseDto response = authService.register(req);
        if (response.success()) {
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        }
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    @PostMapping("/verify-email")
    public ResponseEntity<VerifyEmailResponseDto> verifyEmail(@Valid @RequestBody VerifyEmailRequestDto req) {
        VerifyEmailResponseDto responseDto = authService.verifyEmail(req);
        if (responseDto.success()) {
            return new ResponseEntity<>(responseDto, HttpStatus.ACCEPTED);
        }
        return new ResponseEntity<>(responseDto, HttpStatus.BAD_REQUEST);
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<SimpleMessageResponseDto> resendVerification(@Valid @RequestBody ResendVerificationRequestDto req) {
        SimpleMessageResponseDto responseDto = authService.resendVerification(req);
        if (responseDto.success()) {
            return new ResponseEntity<>(responseDto, HttpStatus.ACCEPTED);
        }
        return new ResponseEntity<>(responseDto, HttpStatus.BAD_REQUEST);

    }

    @PostMapping("/forgot-password")
    public ResponseEntity<SimpleMessageResponseDto> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDto req) {
        return new ResponseEntity<>(authService.forgotPassword(req), HttpStatus.ACCEPTED);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<SimpleMessageResponseDto> resetPassword(@Valid @RequestBody ResetPasswordRequestDto req) {
        SimpleMessageResponseDto responseDto = authService.resetPassword(req);
        if (responseDto.success()) {
            return new ResponseEntity<>(responseDto, HttpStatus.OK);
        }
        return new ResponseEntity<>(responseDto, HttpStatus.BAD_REQUEST);

    }

    @PostMapping("/refresh-token")
    public ResponseEntity<RefreshTokenResponseDto> refreshToken(@Valid @RequestBody RefreshTokenRequestDto req) {
        RefreshTokenResponseDto responseDto = authService.refreshToken(req);
        if (responseDto.success()) {
            return new ResponseEntity<>(responseDto, HttpStatus.OK);
        }
        return new ResponseEntity<>(responseDto, HttpStatus.BAD_REQUEST);
    }

    @PostMapping("/logout")
    public ResponseEntity<SimpleMessageResponseDto> logout(@Valid @RequestBody LogoutRequestDto req) {
        SimpleMessageResponseDto responseDto = authService.logout(req);
        if (responseDto.success()) {
            return new ResponseEntity<>(responseDto, HttpStatus.OK);
        }
        return new ResponseEntity<>(responseDto, HttpStatus.BAD_REQUEST);
    }

    @PostMapping("/google")
    public ResponseEntity<UserLoginResponseDto> google(@Valid @RequestBody GoogleAuthRequestDto req) {
        UserLoginResponseDto responseDto = authService.google(req);
        if (responseDto.success()) {
            return new ResponseEntity<>(responseDto, HttpStatus.OK);
        }
        return new ResponseEntity<>(responseDto, HttpStatus.BAD_REQUEST);
    }
}
