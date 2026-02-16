package kz.sdu.dto.common;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PreferencesDto {

    @Valid
    private MustHaveDto mustHave;

    @Valid
    private NiceToHaveDto niceToHave;
}
