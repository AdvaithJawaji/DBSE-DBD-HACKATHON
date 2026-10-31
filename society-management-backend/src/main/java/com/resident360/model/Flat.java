package com.resident360.model;

import jakarta.persistence.*;

@Entity
@Table(name = "flats")
public class Flat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "flat_number", nullable = false, length = 20)
    private String flatNumber;

    @Column(length = 5)
    private String block;

    @Column
    private Integer floor;

    @Column(name = "flat_type", length = 10)
    private String flatType;

    public Flat() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFlatNumber() { return flatNumber; }
    public void setFlatNumber(String flatNumber) { this.flatNumber = flatNumber; }

    public String getBlock() { return block; }
    public void setBlock(String block) { this.block = block; }

    public Integer getFloor() { return floor; }
    public void setFloor(Integer floor) { this.floor = floor; }

    public String getFlatType() { return flatType; }
    public void setFlatType(String flatType) { this.flatType = flatType; }
}
