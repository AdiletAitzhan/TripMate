package kz.sdu.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetRangeDto {
    private Integer min;
    private Integer max;
    private String currency;
}
