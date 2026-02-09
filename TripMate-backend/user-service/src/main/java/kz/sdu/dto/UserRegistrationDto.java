package kz.sdu.dto;

import jakarta.validation.constraints.*;
import kz.sdu.entity.Gender;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRegistrationDto {

    @Email
    @NotBlank
    private String email;

    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @Pattern(regexp = "^\\+?[0-9]{7,20}$", message = "Invalid phone number format")
    private String phoneNumber;

    @NotBlank
    @Size(max = 100)
    private String firstName;

    @NotBlank
    @Size(max = 100)
    private String lastName;

    @NotNull
    private LocalDate dateOfBirth;

    @Size(max = 20)
    private String gender;

    @Size(max = 500)
    private String bio;

    @Size(max = 100)
    private String city;

    @Size(max = 100)
    private String country;
}
