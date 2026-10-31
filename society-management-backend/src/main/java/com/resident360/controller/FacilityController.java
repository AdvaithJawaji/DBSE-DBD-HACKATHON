package com.resident360.controller;

import com.resident360.model.Facility;
import com.resident360.model.FacilityBooking;
import com.resident360.model.FacilityBooking.BookingStatus;
import com.resident360.model.User;
import com.resident360.repository.FacilityBookingRepository;
import com.resident360.repository.FacilityRepository;
import com.resident360.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/facilities")
public class FacilityController {

    @Autowired private FacilityRepository facilityRepository;
    @Autowired private FacilityBookingRepository bookingRepository;
    @Autowired private UserRepository userRepository;

    public static class BookingRequest {
        @NotNull private Long facilityId;
        private String bookingDate;
        private String timeSlot;
        private Integer numGuests;
        private String notes;

        public BookingRequest() {}

        public Long getFacilityId() { return facilityId; }
        public void setFacilityId(Long facilityId) { this.facilityId = facilityId; }

        public String getBookingDate() { return bookingDate; }
        public void setBookingDate(String bookingDate) { this.bookingDate = bookingDate; }

        public String getTimeSlot() { return timeSlot; }
        public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }

        public Integer getNumGuests() { return numGuests; }
        public void setNumGuests(Integer numGuests) { this.numGuests = numGuests; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    @GetMapping
    public ResponseEntity<?> getFacilities() {
        return ResponseEntity.ok(facilityRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getFacility(@PathVariable Long id) {
        return facilityRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/bookings")
    public ResponseEntity<?> getBookings(HttpServletRequest request) {
        String role = (String) request.getAttribute("userRole");
        Long userId = (Long) request.getAttribute("userId");
        if ("ADMIN".equals(role)) {
            return ResponseEntity.ok(bookingRepository.findAll());
        }
        return ResponseEntity.ok(bookingRepository.findByUser_Id(userId));
    }

    @PostMapping("/bookings")
    public ResponseEntity<?> createBooking(@Valid @RequestBody BookingRequest req,
                                            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");

        Facility facility = facilityRepository.findById(req.getFacilityId()).orElse(null);
        if (facility == null) return ResponseEntity.status(404).body(Map.of("message", "Facility not found"));

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return ResponseEntity.status(401).body(Map.of("message", "User not found"));

        LocalDate bookDate = req.getBookingDate() != null ? LocalDate.parse(req.getBookingDate()) : LocalDate.now();

        // Check conflicts
        List<FacilityBooking> conflicts = bookingRepository.findConflicting(facility.getId(), bookDate);
        boolean hasConflict = conflicts.stream()
            .anyMatch(b -> b.getTimeSlot() != null && b.getTimeSlot().equals(req.getTimeSlot()));
        if (hasConflict) {
            return ResponseEntity.status(409).body(Map.of("message", "This slot is already booked"));
        }

        FacilityBooking booking = new FacilityBooking();
        booking.setFacility(facility);
        booking.setUser(user);
        booking.setBookingDate(bookDate);
        booking.setTimeSlot(req.getTimeSlot());
        booking.setNumGuests(req.getNumGuests());
        booking.setNotes(req.getNotes());
        booking.setStatus(BookingStatus.CONFIRMED);

        FacilityBooking saved = bookingRepository.save(booking);
        return ResponseEntity.status(201).body(Map.of(
            "message", "Booking confirmed!",
            "booking_id", saved.getId()
        ));
    }

    @PatchMapping("/bookings/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id) {
        return bookingRepository.findById(id).map(b -> {
            b.setStatus(BookingStatus.CANCELLED);
            bookingRepository.save(b);
            return ResponseEntity.ok(Map.of("message", "Booking cancelled"));
        }).orElse(ResponseEntity.notFound().build());
    }
}
