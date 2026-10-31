package com.resident360.controller;

import com.resident360.model.Complaint;
import com.resident360.model.Complaint.ComplaintStatus;
import com.resident360.model.Complaint.Priority;
import com.resident360.model.Resident;
import com.resident360.repository.ComplaintRepository;
import com.resident360.repository.FlatRepository;
import com.resident360.repository.ResidentRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    @Autowired private ComplaintRepository complaintRepository;
    @Autowired private ResidentRepository residentRepository;
    @Autowired private FlatRepository flatRepository;

    public static class ComplaintRequest {
        @NotBlank private String title;
        private String category;
        private String description;
        private String priority;

        public ComplaintRequest() {}

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
    }

    public static class StatusUpdateRequest {
        private String status;
        private Long assignedTo;

        public StatusUpdateRequest() {}

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public Long getAssignedTo() { return assignedTo; }
        public void setAssignedTo(Long assignedTo) { this.assignedTo = assignedTo; }
    }

    @GetMapping
    public ResponseEntity<?> getComplaints(HttpServletRequest request) {
        String role = (String) request.getAttribute("userRole");
        Long userId = (Long) request.getAttribute("userId");

        if ("ADMIN".equals(role)) {
            return ResponseEntity.ok(complaintRepository.findAllSortedByPriority());
        } else {
            Optional<Resident> resident = residentRepository.findByUser_Id(userId);
            if (resident.isEmpty()) return ResponseEntity.ok(List.of());
            return ResponseEntity.ok(complaintRepository.findByResident_Id(resident.get().getId()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createComplaint(@Valid @RequestBody ComplaintRequest req,
                                              HttpServletRequest request) {
        String role = (String) request.getAttribute("userRole");
        Long userId = (Long) request.getAttribute("userId");

        if (!"RESIDENT".equals(role)) {
            return ResponseEntity.status(403).body(Map.of("message", "Only residents can create complaints"));
        }

        Optional<Resident> residentOpt = residentRepository.findByUser_Id(userId);
        if (residentOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "Resident profile not found"));
        }

        Resident resident = residentOpt.get();
        Complaint complaint = new Complaint();
        complaint.setResident(resident);
        complaint.setFlat(resident.getFlat());
        complaint.setTitle(req.getTitle());
        complaint.setCategory(req.getCategory());
        complaint.setDescription(req.getDescription());

        try {
            complaint.setPriority(Priority.valueOf(req.getPriority() != null ? req.getPriority() : "LOW"));
        } catch (IllegalArgumentException e) {
            complaint.setPriority(Priority.LOW);
        }

        Complaint saved = complaintRepository.save(complaint);
        return ResponseEntity.status(201).body(Map.of(
            "message", "Complaint registered successfully",
            "complaint_id", saved.getId()
        ));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> updateComplaint(@PathVariable Long id,
                                              @RequestBody StatusUpdateRequest req,
                                              HttpServletRequest request) {
        String role = (String) request.getAttribute("userRole");
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body(Map.of("message", "Admin only"));
        }

        return complaintRepository.findById(id).map(c -> {
            if (req.getStatus() != null) {
                try { c.setStatus(ComplaintStatus.valueOf(req.getStatus())); }
                catch (IllegalArgumentException ignored) {}
            }
            if (req.getAssignedTo() != null) c.setAssignedTo(req.getAssignedTo());
            complaintRepository.save(c);
            return ResponseEntity.ok(Map.of("message", "Complaint updated successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }
}
