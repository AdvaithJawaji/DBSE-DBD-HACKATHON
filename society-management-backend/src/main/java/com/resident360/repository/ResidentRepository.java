package com.resident360.repository;
import com.resident360.model.Resident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;
public interface ResidentRepository extends JpaRepository<Resident, Long> {
    Optional<Resident> findByUser_Id(Long userId);
    List<Resident> findByFlat_FlatNumber(String flatNumber);
    List<Resident> findByFlat_Block(String block);
    @Query("SELECT r FROM Resident r JOIN r.flat f ORDER BY f.flatNumber")
    List<Resident> findAllWithFlats();
}
