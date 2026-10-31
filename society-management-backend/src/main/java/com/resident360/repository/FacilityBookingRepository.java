package com.resident360.repository;
import com.resident360.model.FacilityBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;
public interface FacilityBookingRepository extends JpaRepository<FacilityBooking, Long> {
    List<FacilityBooking> findByUser_Id(Long userId);
    List<FacilityBooking> findByFacility_Id(Long facilityId);
    @Query("SELECT fb FROM FacilityBooking fb WHERE fb.facility.id = :facilityId AND fb.bookingDate = :date AND fb.status = 'CONFIRMED'")
    List<FacilityBooking> findConflicting(Long facilityId, LocalDate date);
    long countByUser_Id(Long userId);
}
