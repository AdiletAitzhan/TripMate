package kz.sdu.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VerificationDto {
    private boolean email;
    private boolean phone;
    private boolean id;
}
