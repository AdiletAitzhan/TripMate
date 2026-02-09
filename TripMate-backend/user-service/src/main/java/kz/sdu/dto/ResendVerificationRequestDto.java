package kz.sdu.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResendVerificationRequestDto {
    @Email
    @NotBlank
    private String email;
}

