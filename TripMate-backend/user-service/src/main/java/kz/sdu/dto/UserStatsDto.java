package kz.sdu.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserStatsDto {
    private int tripsCompleted;
    private int countriesVisited;
    private int citiesExplored;
    private int travelBuddiesMet;
    private Long totalDistance;
    private int daysTravel;
    private Double rating;
    private int reviewCount;
}
