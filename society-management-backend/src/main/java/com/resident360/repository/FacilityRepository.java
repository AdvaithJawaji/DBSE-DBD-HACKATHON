package com.resident360.repository;
import com.resident360.model.Facility;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface FacilityRepository extends JpaRepository<Facility, Long> {
    List<Facility> findByStatus(Facility.FacilityStatus status);
    List<Facility> findByCategory(String category);
}
