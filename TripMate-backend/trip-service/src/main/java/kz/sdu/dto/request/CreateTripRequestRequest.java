package kz.sdu.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import kz.sdu.dto.common.BudgetDto;
import kz.sdu.dto.common.DestinationDto;
import kz.sdu.dto.common.PreferencesDto;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateTripRequestRequest {

    @Valid
    @NotNull
    private DestinationDto destination;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    private Boolean flexibleDates;

    @Valid
    private BudgetDto budget;

    @Valid
    private PreferencesDto preferences;

    private Boolean notifyOnMatch;
}