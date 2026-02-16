package kz.sdu.dto.response;


import kz.sdu.dto.common.BudgetDto;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class TripRequestUpdateResponse {

    private UUID id;

    private LocalDate startDate;
    private LocalDate endDate;

    private BudgetDto budget;

    private OffsetDateTime updatedAt;
}
