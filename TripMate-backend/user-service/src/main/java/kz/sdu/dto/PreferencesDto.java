package kz.sdu.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PreferencesDto {
    private Integer minAge;
    private Integer maxAge;
    private String preferredGender;
    private BudgetRangeDto budgetRange;
}
