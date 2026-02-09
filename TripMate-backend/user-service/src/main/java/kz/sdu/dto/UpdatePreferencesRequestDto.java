package kz.sdu.dto;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePreferencesRequestDto {
    private List<String> interests;
    private Integer minAge;
    private Integer maxAge;
    private String preferredGender;
    @Valid
    private BudgetRangeDto budgetRange;
}
