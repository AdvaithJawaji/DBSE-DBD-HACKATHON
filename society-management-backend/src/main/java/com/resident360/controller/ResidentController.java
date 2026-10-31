package com.resident360.controller;

import com.resident360.model.Resident;
import com.resident360.repository.FlatRepository;
import com.resident360.repository.ResidentRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/residents")
public class ResidentController {

    @Autowired private ResidentRepository residentRepository;
    @Autowired private FlatRepository flatRepository;

    @GetMapping
    public ResponseEntity<?> getAllResidents(HttpServletRequest request) {
        return ResponseEntity.ok(residentRepository.findAllWithFlats());
    }

    @GetMapping("/flats")
    public ResponseEntity<?> getAllFlats() {
        return ResponseEntity.ok(flatRepository.findAll());
    }

    @GetMapping("/flat/{flatNumber}")
    public ResponseEntity<?> getByFlat(@PathVariable String flatNumber) {
        return ResponseEntity.ok(residentRepository.findByFlat_FlatNumber(flatNumber));
    }

    @GetMapping("/block/{block}")
    public ResponseEntity<?> getByBlock(@PathVariable String block) {
        return ResponseEntity.ok(residentRepository.findByFlat_Block(block));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return residentRepository.findByUser_Id(userId)
            .map(r -> ResponseEntity.ok(Map.of(
                "id", r.getId(),
                "name", r.getName(),
                "phone", r.getPhone() != null ? r.getPhone() : "",
                "email", r.getEmail() != null ? r.getEmail() : "",
                "flat_number", r.getFlat() != null ? r.getFlat().getFlatNumber() : "",
                "block", r.getFlat() != null ? r.getFlat().getBlock() : "",
                "move_in_date", r.getMoveInDate() != null ? r.getMoveInDate().toString() : ""
            )))
            .orElse(ResponseEntity.status(404).body(Map.of("message", "Resident profile not found")));
    }
}
