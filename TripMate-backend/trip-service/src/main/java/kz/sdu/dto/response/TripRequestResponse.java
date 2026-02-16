package kz.sdu.dto.response;


import kz.sdu.dto.common.BudgetDto;
import kz.sdu.dto.common.DestinationDto;
import kz.sdu.dto.common.PreferencesDto;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class TripRequestResponse {

    private UUID id;
    private UUID userId;

    private DestinationDto destination;

    private LocalDate startDate;
    private LocalDate endDate;
    private Integer duration;

    private Boolean flexibleDates;

    private BudgetDto budget;

    private PreferencesDto preferences;

    private String status;
    private Integer matchCount;

    private Boolean notifyOnMatch;

    private LocalDateTime createdAt;
}
