package com.resident360.repository;
import com.resident360.model.Visitor;
import com.resident360.model.Visitor.VisitorStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;
public interface VisitorRepository extends JpaRepository<Visitor, Long> {
    List<Visitor> findByStatus(VisitorStatus status);
    List<Visitor> findByFlat_FlatNumber(String flatNumber);
    @Query("SELECT v FROM Visitor v WHERE v.createdAt >= :since ORDER BY v.createdAt DESC")
    List<Visitor> findTodaysVisitors(LocalDateTime since);
    long countByStatus(VisitorStatus status);
}
