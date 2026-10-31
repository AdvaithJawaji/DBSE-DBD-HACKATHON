package com.resident360.controller;

import com.resident360.model.Visitor;
import com.resident360.model.Visitor.VisitorStatus;
import com.resident360.repository.FlatRepository;
import com.resident360.repository.VisitorRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/visitors")
public class VisitorController {

    @Autowired private VisitorRepository visitorRepository;
    @Autowired private FlatRepository flatRepository;

    public static class VisitorRequest {
        @NotBlank private String name;
        private String phone;
        private String flatNumber;
        private String purpose;
        private String vehicleNumber;
        private String hostName;

        public VisitorRequest() {}

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getFlatNumber() { return flatNumber; }
        public void setFlatNumber(String flatNumber) { this.flatNumber = flatNumber; }

        public String getPurpose() { return purpose; }
        public void setPurpose(String purpose) { this.purpose = purpose; }

        public String getVehicleNumber() { return vehicleNumber; }
        public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }

        public String getHostName() { return hostName; }
        public void setHostName(String hostName) { this.hostName = hostName; }
    }

    @GetMapping
    public ResponseEntity<?> getVisitors(HttpServletRequest request) {
        return ResponseEntity.ok(visitorRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> addVisitor(@Valid @RequestBody VisitorRequest req) {
        Visitor visitor = new Visitor();
        visitor.setName(req.getName());
        visitor.setPhone(req.getPhone());
        visitor.setPurpose(req.getPurpose());
        visitor.setVehicleNumber(req.getVehicleNumber());
        visitor.setHostName(req.getHostName());
        visitor.setStatus(VisitorStatus.EXPECTED);

        if (req.getFlatNumber() != null) {
            flatRepository.findByFlatNumber(req.getFlatNumber()).ifPresent(visitor::setFlat);
        }
        Visitor saved = visitorRepository.save(visitor);
        return ResponseEntity.status(201).body(Map.of("message", "Visitor added", "visitor_id", saved.getId()));
    }

    @PostMapping("/{id}/checkin")
    public ResponseEntity<?> checkIn(@PathVariable Long id) {
        return visitorRepository.findById(id).map(v -> {
            v.setStatus(VisitorStatus.CHECKED_IN);
            v.setEntryTime(LocalDateTime.now());
            visitorRepository.save(v);
            return ResponseEntity.ok(Map.of("message", "Visitor checked in successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/checkout")
    public ResponseEntity<?> checkOut(@PathVariable Long id) {
        return visitorRepository.findById(id).map(v -> {
            v.setStatus(VisitorStatus.CHECKED_OUT);
            v.setExitTime(LocalDateTime.now());
            visitorRepository.save(v);
            return ResponseEntity.ok(Map.of("message", "Visitor checked out successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        long insideCount = visitorRepository.countByStatus(VisitorStatus.CHECKED_IN);
        long expectedCount = visitorRepository.countByStatus(VisitorStatus.EXPECTED);
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        List<Visitor> todayVisitors = visitorRepository.findTodaysVisitors(todayStart);
        long todayEntries = todayVisitors.stream().filter(v -> v.getEntryTime() != null).count();
        long todayExits = todayVisitors.stream().filter(v -> v.getExitTime() != null).count();
        return ResponseEntity.ok(Map.of(
            "visitors_inside", insideCount,
            "expected_visitors", expectedCount,
            "today_entries", todayEntries,
            "today_exits", todayExits
        ));
    }
}
