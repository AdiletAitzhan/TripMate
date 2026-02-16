package kz.sdu.service.impl;

import kz.sdu.dto.common.BudgetDto;
import kz.sdu.dto.common.DestinationDto;
import kz.sdu.dto.common.PreferencesDto;
import kz.sdu.dto.request.CreateTripRequestRequest;
import kz.sdu.dto.request.UpdateTripRequestRequest;
import kz.sdu.dto.response.TripRequestResponse;
import kz.sdu.dto.response.TripRequestShortResponse;
import kz.sdu.dto.response.TripRequestUpdateResponse;
import kz.sdu.entity.TripRequest;
import kz.sdu.exception.ForbiddenException;
import kz.sdu.exception.NotFoundException;
import kz.sdu.repository.TripRequestRepository;
import kz.sdu.service.TripRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TripRequestServiceImpl implements TripRequestService {

    private final TripRequestRepository repository;

    @Override
    public TripRequestResponse create(UUID userId, CreateTripRequestRequest request) {

        validateDates(request.getStartDate(), request.getEndDate());

        TripRequest entity = TripRequest.builder()
                .userId(userId)
                .destCity(request.getDestination().getCity())
                .destCountry(request.getDestination().getCountry())
                .destCountryCode(request.getDestination().getCountryCode())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .flexibleDates(Boolean.TRUE.equals(request.getFlexibleDates()))
                .budgetAmount(request.getBudget() != null ? request.getBudget().getAmount() : null)
                .budgetCurrency(request.getBudget() != null ? request.getBudget().getCurrency() : null)
                .preferences(request.getPreferences())
                .notifyOnMatch(Boolean.TRUE.equals(request.getNotifyOnMatch()))
                .status("active")
                .matchCount(0)
                .build();

        repository.save(entity);

        return mapToFullResponse(entity);
    }

    @Override
    public Page<TripRequestShortResponse> getMyRequests(UUID userId, String status, Pageable pageable) {

        if (status != null && !status.isBlank()) {
            return repository
                    .findByUserIdAndStatus(userId, status, pageable)
                    .map(this::mapToShortResponse);
        }

        return repository
                .findByUserId(userId, pageable)
                .map(this::mapToShortResponse);
    }

    @Override
    public List<TripRequestResponse> getAllTripRequest() {
        return repository.findAll().stream().map(this::mapToTripRequest).toList();
    }

    private TripRequestResponse mapToTripRequest(TripRequest tripRequest) {
        return TripRequestResponse.builder()
                .id(tripRequest.getId())
                .userId(tripRequest.getUserId())
                .destination(DestinationDto.builder()
                        .city(tripRequest.getDestCity())
                        .country(tripRequest.getDestCountry())
                        .countryCode(tripRequest.getDestCountryCode())
                        .build())
                .startDate(tripRequest.getStartDate())
                .endDate(tripRequest.getEndDate())
                .flexibleDates(tripRequest.getFlexibleDates())
                .budget(BudgetDto.builder()
                        .amount(tripRequest.getBudgetAmount()).currency(tripRequest.getBudgetCurrency()).build())
                .preferences(Optional.ofNullable(tripRequest.getPreferences())
                        .map(p -> PreferencesDto.builder()
                                .mustHave(p.getMustHave())
                                .niceToHave(p.getNiceToHave())
                                .build())
                        .orElse(null))
                .status(tripRequest.getStatus())
                .matchCount(tripRequest.getMatchCount())
                .notifyOnMatch(tripRequest.getNotifyOnMatch())
                .createdAt(tripRequest.getCreatedAt()).build();
    }

    @Override
    public TripRequestResponse getById(UUID userId, UUID requestId) {

        TripRequest entity = repository.findById(requestId)
                .orElseThrow(() -> new NotFoundException("Trip request not found"));

        if (!entity.getUserId().equals(userId)) {
            throw new ForbiddenException("Access denied");
        }

        return mapToFullResponse(entity);
    }

    @Override
    public TripRequestUpdateResponse update(UUID userId, UUID requestId, UpdateTripRequestRequest request) {

        TripRequest entity = repository.findById(requestId)
                .orElseThrow(() -> new NotFoundException("Trip request not found"));

        if (!entity.getUserId().equals(userId)) {
            throw new ForbiddenException("Access denied");
        }

        if (request.getStartDate() != null) {
            entity.setStartDate(request.getStartDate());
        }

        if (request.getEndDate() != null) {
            entity.setEndDate(request.getEndDate());
        }

        if (entity.getStartDate() != null && entity.getEndDate() != null) {
            validateDates(entity.getStartDate(), entity.getEndDate());
        }

        if (request.getBudget() != null) {
            entity.setBudgetAmount(request.getBudget().getAmount());
            entity.setBudgetCurrency(request.getBudget().getCurrency());
        }

        repository.save(entity);

        return TripRequestUpdateResponse.builder()
                .id(entity.getId())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .budget(budgetFromEntity(entity))
                .updatedAt(entity.getUpdatedAt().atOffset(ZoneOffset.UTC))
                .build();
    }

    @Override
    public void delete(UUID userId, UUID requestId) {

        TripRequest entity = repository.findById(requestId)
                .orElseThrow(() -> new NotFoundException("Trip request not found"));

        if (!entity.getUserId().equals(userId)) {
            throw new ForbiddenException("Access denied");
        }

        repository.delete(entity);
    }

    // -----------------------
    // Helpers
    // -----------------------

    private void validateDates(java.time.LocalDate start, java.time.LocalDate end) {
        if (start == null || end == null) return;
        if (start.isAfter(end)) {
            throw new IllegalArgumentException("Start date must be before end date");
        }
    }

    private DestinationDto destinationFromEntity(TripRequest entity) {
        return DestinationDto.builder()
                .city(entity.getDestCity())
                .country(entity.getDestCountry())
                .countryCode(entity.getDestCountryCode())
                .build();
    }

    private BudgetDto budgetFromEntity(TripRequest entity) {
        if (entity.getBudgetAmount() == null && entity.getBudgetCurrency() == null) {
            return null;
        }
        return BudgetDto.builder()
                .amount(entity.getBudgetAmount())
                .currency(entity.getBudgetCurrency())
                .build();
    }

    private TripRequestResponse mapToFullResponse(TripRequest entity) {

        long duration = ChronoUnit.DAYS.between(entity.getStartDate(), entity.getEndDate()) + 1;

        return TripRequestResponse.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .destination(destinationFromEntity(entity))
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .duration((int) duration)
                .flexibleDates(entity.getFlexibleDates())
                .budget(budgetFromEntity(entity))
                .preferences(entity.getPreferences())
                .status(entity.getStatus())
                .matchCount(entity.getMatchCount())
                .notifyOnMatch(entity.getNotifyOnMatch())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private TripRequestShortResponse mapToShortResponse(TripRequest entity) {

        return TripRequestShortResponse.builder()
                .id(entity.getId())
                .destination(destinationFromEntity(entity))
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .budget(budgetFromEntity(entity))
                .status(entity.getStatus())
                .matchCount(entity.getMatchCount())
                .createdAt(entity.getCreatedAt().atOffset(ZoneOffset.UTC))
                .build();
    }
}
