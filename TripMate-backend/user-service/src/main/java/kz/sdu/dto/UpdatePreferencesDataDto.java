package kz.sdu.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class UpdatePreferencesDataDto {
    private List<String> interests;
    private Integer minAge;
    private Integer maxAge;
    private String preferredGender;
    private BudgetRangeDto budgetRange;
    private Instant updatedAt;
}
