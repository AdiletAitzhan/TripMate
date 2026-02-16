package kz.sdu.repository;

import kz.sdu.entity.TripRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TripRequestRepository extends JpaRepository<TripRequest, UUID> {

    Page<TripRequest> findByUserId(UUID userId, Pageable pageable);

    Page<TripRequest> findByUserIdAndStatus(UUID userId, String status, Pageable pageable);
}
