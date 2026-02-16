package kz.sdu.dto.response;

import kz.sdu.dto.common.BudgetDto;
import kz.sdu.dto.common.DestinationDto;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class TripRequestShortResponse {

    private UUID id;

    private DestinationDto destination;

    private LocalDate startDate;
    private LocalDate endDate;

    private BudgetDto budget;

    private String status;

    private Integer matchCount;

    private OffsetDateTime createdAt;
}
