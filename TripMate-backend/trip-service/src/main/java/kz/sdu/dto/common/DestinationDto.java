package kz.sdu.dto.common;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DestinationDto {

    private String city;
    private String country;
    private String countryCode;
}
