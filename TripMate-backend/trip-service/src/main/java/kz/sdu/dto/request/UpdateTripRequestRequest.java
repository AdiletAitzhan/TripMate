package kz.sdu.dto.request;

import jakarta.validation.Valid;
import kz.sdu.dto.common.BudgetDto;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateTripRequestRequest {

    private LocalDate startDate;
    private LocalDate endDate;

    @Valid
    private BudgetDto budget;
}
