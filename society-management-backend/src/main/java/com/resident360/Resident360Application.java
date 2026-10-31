package com.resident360;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Resident360 — Smart Apartment Management System
 * CODESPARK HACKATHON 2026 | Problem AT-37
 * Team: KL University, Department of CSE
 */
@SpringBootApplication
public class Resident360Application {
    public static void main(String[] args) {
        SpringApplication.run(Resident360Application.class, args);
        System.out.println("\n🏢 Resident360 Spring Boot Backend is running on http://localhost:8080\n");
    }
}
