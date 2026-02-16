package kz.sdu.dto.common;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MustHaveDto {

    private AgeRangeDto ageRange;

    private List<String> gender;

    private Boolean verifiedOnly;
}
