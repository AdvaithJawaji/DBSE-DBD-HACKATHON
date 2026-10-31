package com.resident360.repository;
import com.resident360.model.Complaint;
import com.resident360.model.Complaint.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByResident_Id(Long residentId);
    List<Complaint> findByStatus(ComplaintStatus status);
    List<Complaint> findByPriority(Complaint.Priority priority);
    long countByStatus(ComplaintStatus status);
    @Query("SELECT c FROM Complaint c JOIN c.resident r JOIN r.flat f ORDER BY c.priority, c.createdAt DESC")
    List<Complaint> findAllSortedByPriority();
}
