package kz.sdu.repository;

import kz.sdu.entity.Interest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface InterestRepository extends JpaRepository<Interest, UUID> {

    Optional<Interest> findByNameIgnoreCase(String name);
}
