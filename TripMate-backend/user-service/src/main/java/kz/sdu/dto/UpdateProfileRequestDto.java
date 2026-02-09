package kz.sdu.dto;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequestDto {
    private String fullName;
    @Valid
    private LocationDto location;
    private String bio;
    private String phone;
}
