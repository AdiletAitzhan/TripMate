package kz.sdu.controller;

import kz.sdu.dto.ApiErrorDto;
import kz.sdu.dto.SimpleMessageResponseDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<SimpleMessageResponseDto> handleValidation(MethodArgumentNotValidException ex) {
        FieldError fe = ex.getBindingResult().getFieldErrors().stream().findFirst().orElse(null);
        String message = fe != null ? (fe.getField() + " " + fe.getDefaultMessage()) : "Validation error";
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(SimpleMessageResponseDto.builder()
                .success(false)
                .error(ApiErrorDto.builder()
                        .code("VALIDATION_ERROR")
                        .message(message)
                        .build())
                .build());
    }
}

