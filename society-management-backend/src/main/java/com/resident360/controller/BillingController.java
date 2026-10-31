package com.resident360.controller;

import com.resident360.model.Bill;
import com.resident360.model.Bill.BillStatus;
import com.resident360.model.Resident;
import com.resident360.repository.BillRepository;
import com.resident360.repository.ResidentRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/billing")
public class BillingController {

    @Autowired private BillRepository billRepository;
    @Autowired private ResidentRepository residentRepository;

    @GetMapping
    public ResponseEntity<?> getBills(HttpServletRequest request) {
        String role = (String) request.getAttribute("userRole");
        Long userId = (Long) request.getAttribute("userId");

        if ("ADMIN".equals(role)) {
            return ResponseEntity.ok(billRepository.findAll());
        }
        Optional<Resident> resident = residentRepository.findByUser_Id(userId);
        if (resident.isEmpty()) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(billRepository.findByResident_Id(resident.get().getId()));
    }

    @PatchMapping("/{id}/pay")
    public ResponseEntity<?> payBill(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return billRepository.findById(id).map(bill -> {
            if (bill.getStatus() == BillStatus.PAID) {
                return ResponseEntity.badRequest().body(Map.of("message", "Bill already paid"));
            }
            bill.setStatus(BillStatus.PAID);
            bill.setPaidDate(java.time.LocalDate.now());
            bill.setPaymentMethod("ONLINE");
            billRepository.save(bill);
            return ResponseEntity.ok(Map.of("message", "Payment successful", "bill_id", bill.getId()));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary() {
        BigDecimal collected = billRepository.totalCollected();
        BigDecimal outstanding = billRepository.totalOutstanding();
        long total = billRepository.count();
        long paid = billRepository.findByStatus(BillStatus.PAID).size();
        long pending = billRepository.findByStatus(BillStatus.PENDING).size();
        return ResponseEntity.ok(Map.of(
            "total_bills", total,
            "paid", paid,
            "pending", pending,
            "total_collected", collected != null ? collected : BigDecimal.ZERO,
            "total_outstanding", outstanding != null ? outstanding : BigDecimal.ZERO
        ));
    }
}
