package com.resident360.controller;

import com.resident360.model.Complaint;
import com.resident360.model.Visitor;
import com.resident360.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired private ComplaintRepository complaintRepository;
    @Autowired private VisitorRepository visitorRepository;
    @Autowired private BillRepository billRepository;
    @Autowired private ResidentRepository residentRepository;
    @Autowired private FacilityBookingRepository bookingRepository;

    /** Dashboard stats for admin */
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats(HttpServletRequest request) {
        long totalResidents = residentRepository.count();
        long openComplaints = complaintRepository.countByStatus(Complaint.ComplaintStatus.OPEN);
        long visitorsInside = visitorRepository.countByStatus(Visitor.VisitorStatus.CHECKED_IN);
        long totalBills = billRepository.count();
        long totalBookings = bookingRepository.count();

        return ResponseEntity.ok(Map.of(
            "total_residents", totalResidents,
            "open_complaints", openComplaints,
            "visitors_inside", visitorsInside,
            "total_bills", totalBills,
            "total_bookings", totalBookings
        ));
    }

    /**
     * Python ML component: Predict maintenance demand.
     * Calls the Python analytics service (port 5007) which runs ML predictions.
     * As per hackathon requirement: Python is used only as supporting AI component.
     */
    @GetMapping("/predict/maintenance")
    public ResponseEntity<?> predictMaintenance() {
        try {
            RestTemplate restTemplate = new RestTemplate();
            // Python analytics service with ML prediction
            String pythonServiceUrl = "http://localhost:5007/api/analytics/predict/maintenance";
            Object prediction = restTemplate.getForObject(pythonServiceUrl, Object.class);
            return ResponseEntity.ok(prediction);
        } catch (Exception e) {
            // Fallback: rule-based prediction from DB data
            long highPriority = complaintRepository.findByPriority(Complaint.Priority.HIGH).size();
            long critical = complaintRepository.findByPriority(Complaint.Priority.CRITICAL).size();
            String demand = (highPriority + critical > 5) ? "HIGH" : (highPriority + critical > 2) ? "MEDIUM" : "LOW";
            return ResponseEntity.ok(Map.of(
                "predicted_demand", demand,
                "high_priority_complaints", highPriority,
                "critical_complaints", critical,
                "recommendation", demand.equals("HIGH")
                    ? "Schedule immediate maintenance team deployment"
                    : "Normal maintenance schedule sufficient",
                "source", "rule-based-fallback"
            ));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "Analytics"));
    }
}
