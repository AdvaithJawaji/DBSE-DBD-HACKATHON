package com.resident360.model;

import jakarta.persistence.*;

@Entity
@Table(name = "facilities")
public class Facility {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 10)
    private String icon;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private FacilityStatus status = FacilityStatus.AVAILABLE;

    @Column
    private Integer capacity;

    @Column(length = 100)
    private String timings;

    @Column(name = "booking_fee")
    private Double bookingFee;

    @Column(length = 100)
    private String category;

    public enum FacilityStatus { AVAILABLE, OCCUPIED, MAINTENANCE, CLOSED }

    public Facility() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public FacilityStatus getStatus() { return status; }
    public void setStatus(FacilityStatus status) { this.status = status; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public String getTimings() { return timings; }
    public void setTimings(String timings) { this.timings = timings; }

    public Double getBookingFee() { return bookingFee; }
    public void setBookingFee(Double bookingFee) { this.bookingFee = bookingFee; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
