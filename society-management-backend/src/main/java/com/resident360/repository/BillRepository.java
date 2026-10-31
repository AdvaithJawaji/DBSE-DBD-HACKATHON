package com.resident360.repository;
import com.resident360.model.Bill;
import com.resident360.model.Bill.BillStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.List;
public interface BillRepository extends JpaRepository<Bill, Long> {
    List<Bill> findByResident_Id(Long residentId);
    List<Bill> findByStatus(BillStatus status);
    @Query("SELECT SUM(b.amount) FROM Bill b WHERE b.status = 'PAID'")
    BigDecimal totalCollected();
    @Query("SELECT SUM(b.amount) FROM Bill b WHERE b.status = 'PENDING' OR b.status = 'OVERDUE'")
    BigDecimal totalOutstanding();
}
