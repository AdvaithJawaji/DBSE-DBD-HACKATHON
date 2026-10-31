# 🏢 Resident360 — Smart Community & Apartment Management Platform

> **🏆 CODESPARK HACKATHON 2026 | KL University — Department of CSE (Bachupally Campus)**  
> **Track 6:** Smart Community & Residential  
> **Problem Statement AT-37:** Smart Apartment Management System  
> **Repository:** [https://github.com/AdvaithJawaji/DBSE-DBD-HACKATHON](https://github.com/AdvaithJawaji/DBSE-DBD-HACKATHON)

---

## 📌 Executive Summary & Problem AT-37 Compliance

**Resident360** is an enterprise-grade apartment and residential society management platform designed to automate and digitize day-to-day community operations. The system strictly complies with the **CODESPARK 2026 Full-Stack Java** architecture guidelines:

* **Primary Backend:** **Java with Spring Boot 3.2.5** providing RESTful APIs, Spring MVC, and role-based security (`society-management-backend`).
* **Persistence & ORM:** **MySQL 8.0** relational database with **Spring Data JPA & Hibernate** mappings.
* **Security & RBAC:** **Spring Security 6.x + JWT + BCrypt** hashing (`ROLE_ADMIN`, `ROLE_RESIDENT`, `ROLE_SECURITY`).
* **Supporting Python Component:** **Python Predictive Maintenance Demand Engine** (`predict_maintenance.py`) implementing regression and seasonality modeling for upcoming service requests (Problem AT-37 recommended innovation).
* **Frontend:** **React 18 + Vite + Tailwind CSS + PWA** with real-time analytics, mobile-ready layout, and live society occupancy map.

---

## 📁 Repository Folder Structure

```text
DBSE-Project/
│
├── .vscode/                                 # VS Code Workspace & Task configurations
│   └── tasks.json                           # 1-Click VS Code build and launch tasks
│
├── society-management-backend/              # PRIMARY BACKEND: Java Spring Boot 3.2.5
│   ├── pom.xml                              # Maven configuration (Spring Boot, Security, JPA, JWT, MySQL)
│   └── src/
│       ├── main/
│       │   ├── java/com/resident360/
│       │   │   ├── Resident360Application.java  # Spring Boot Main Application Entrypoint
│       │   │   ├── config/
│       │   │   │   └── SecurityConfig.java      # Spring Security 6 stateless filter & CORS config
│       │   │   ├── controller/                  # Spring REST Controllers
│       │   │   │   ├── AnalyticsController.java # Dashboard metrics & ML prediction proxy
│       │   │   │   ├── AuthController.java      # JWT login & profile endpoints
│       │   │   │   ├── BillingController.java   # Maintenance invoices & payment settlement
│       │   │   │   ├── ComplaintController.java # Ticket submission & SLA resolution
│       │   │   │   ├── FacilityController.java  # Amenity reservations & conflict checking
│       │   │   │   ├── ResidentController.java  # Resident profiles & flat occupancy
│       │   │   │   └── VisitorController.java   # Visitor gate pass & entry logs
│       │   │   ├── model/                       # JPA Entities (Hibernate ORM)
│       │   │   │   ├── Bill.java                # Maintenance & utility bills
│       │   │   │   ├── Complaint.java           # Maintenance complaints & service requests
│       │   │   │   ├── Facility.java            # Society amenities
│       │   │   │   ├── FacilityBooking.java     # Slot reservations
│       │   │   │   ├── Flat.java                # Apartment units (Block, Floor, Flat#)
│       │   │   │   ├── Resident.java            # Resident details & user relationship
│       │   │   │   ├── Role.java                # Role entity (ADMIN, RESIDENT, SECURITY)
│       │   │   │   ├── User.java                # User credentials & BCrypt hash
│       │   │   │   └── Visitor.java             # Visitor log entries
│       │   │   ├── repository/                  # Spring Data JPA Repositories
│       │   │   │   ├── BillRepository.java
│       │   │   │   ├── ComplaintRepository.java
│       │   │   │   ├── FacilityBookingRepository.java
│       │   │   │   ├── FacilityRepository.java
│       │   │   │   ├── FlatRepository.java
│       │   │   │   ├── ResidentRepository.java
│       │   │   │   ├── RoleRepository.java
│       │   │   │   ├── UserRepository.java
│       │   │   │   └── VisitorRepository.java
│       │   │   └── security/
│       │   │       ├── JwtAuthFilter.java       # OncePerRequestFilter for Bearer tokens
│       │   │       └── JwtUtil.java             # Token generation, claims extraction & validation
│       │   └── resources/
│       │       └── application.properties       # MySQL connection, JWT secret & server port 8080
│
├── society-management-platform/             # FULL-STACK EXTENSION & SUPPORTING SERVICES
│   ├── api-gateway/                         # Python FastAPI Gateway & ML Service
│   │   ├── main.py                          # Unified API Gateway & routing
│   │   └── predict_maintenance.py           # Python ML Component: Maintenance Demand Predictor
│   │
│   ├── frontend/                            # Presentation Layer (React 18 + Vite)
│   │   ├── src/
│   │   │   ├── components/                  # UI Components (HeroBanner, SocietyMap, Analytics, etc.)
│   │   │   │   ├── AnalyticsDashboard.jsx   # Live charts & AI Predictive Forecast widget
│   │   │   │   ├── BillingList.jsx          # Digital maintenance bill settlement
│   │   │   │   ├── ComplaintList.jsx        # Ticket filing modal & admin resolution
│   │   │   │   ├── FacilityBooking.jsx      # Amenity scheduling & slot selector
│   │   │   │   ├── HeroBanner.jsx           # Aesthetic Glassmorphism Dashboard header
│   │   │   │   ├── SocietyMap.jsx           # Interactive Apartment Unit Map (22 flats, 3 blocks)
│   │   │   │   └── VisitorList.jsx          # Security register & visitor pass manager
│   │   │   ├── pages/                       # Dashboard, Login, Admin views
│   │   │   ├── context/                     # AuthContext, NotificationContext, ToastContext
│   │   │   └── App.jsx                      # App root router & layout
│   │   ├── vite.config.js                   # Vite dev server & proxy settings
│   │   └── package.json
│   │
│   ├── database/                            # MySQL Schema & Seeding
│   │   ├── schema.sql                       # Complete table definitions & foreign key constraints
│   │   └── seeds.sql                        # Initial seed data for flats, residents & roles
│   │
│   └── services/                            # Node.js microservices (Auth, Billing, Visitors, etc.)
│
├── HACKATHON_AT37_DOCUMENTATION.md          # Official Architecture & ER Diagrams, API Catalog
├── start-hackathon-stack.bat                # 1-Click Batch launcher for all services
├── .gitignore                               # Production gitignore rules
└── README.md                                # Project Documentation & Getting Started Guide
```

---

## 🚀 Key Functional Modules

1. **Residents & Apartments Management:**
   * Tracking 22 apartment units distributed across Block A, Block B, and Block C.
   * Over 115 residents with family distributions, phone numbers, and move-in records.
   * Interactive Society Map with live occupancy indicators.

2. **Maintenance & Service Requests:**
   * Resident portal to file complaints (Plumbing, Electrical, HVAC/Lift, Sanitation, Security).
   * Priority queueing (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) with SLA monitoring.
   * Admin resolution pipeline with technician assignment and instant notifications.

3. **Billing & Maintenance Invoicing:**
   * Automated monthly maintenance fee generation.
   * Status lifecycle tracking: `PENDING` ➔ `PAID` / `OVERDUE`.
   * Digital payment simulation and aggregate revenue analytics.

4. **Smart Visitor & Security Pass System:**
   * Pre-authorization of expected guests with destination flat numbers and vehicle IDs.
   * Security guard gate console for 1-click check-in and check-out timestamping.
   * Live statistics on active visitors currently on premises.

5. **Community Amenities & Facility Booking:**
   * Reservations for Clubhouse, Tennis Court, Swimming Pool, and Gymnasium.
   * Automated slot collision detection preventing double-booking.

6. **Python ML Component — Maintenance Demand Predictor:**
   * Hybrid linear trend & occupancy-weighted seasonality regression model.
   * Evaluates historical ticket volumes, occupancy pressure, and seasonal factors.
   * Outputs 30-day ticket forecasts, weekly forward trends, block vulnerability heatmap, and AI-recommended technician allocations.

---

## 🛠️ Technology Stack Summary

| Layer | Technologies Used |
|---|---|
| **Primary Backend** | Java 17/25, Spring Boot 3.2.5, Spring MVC, REST APIs |
| **Security & Auth** | Spring Security 6, Stateless JWT (JSON Web Tokens), BCrypt |
| **Database & ORM** | MySQL 8.0, Spring Data JPA, Hibernate ORM |
| **Supporting AI/ML**| Python 3.10+, FastAPI, Scikit-learn/NumPy regression modeling |
| **Frontend UI** | React 18, Vite, Tailwind CSS, Recharts, Lucide Icons, PWA |
| **Build & Tooling** | Apache Maven 3.9+, Node.js 18+, npm |

---

## ⚡ How to Run the Project

### Option 1: 1-Click Launch (Windows)
Double-click `start-hackathon-stack.bat` in the project root to start all services simultaneously.

### Option 2: Run in VS Code
1. Open this folder in **VS Code**.
2. Press **`Ctrl + Shift + B`** (or go to **Terminal > Run Build Task...**).
3. Select **`Start All Services (Codespark AT-37)`**.

### Option 3: Manual Terminal Commands

#### 1. Java Spring Boot Backend (Port 8080)
```powershell
cd society-management-backend
mvn spring-boot:run
```
*Health Check:* `http://localhost:8080/api/auth/health`

#### 2. Python ML Component & Gateway (Port 8000)
```powershell
cd society-management-platform\api-gateway
.\venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```
*ML Endpoint:* `http://localhost:8000/api/ai/predict-maintenance`

#### 3. React Frontend (Port 5173)
```powershell
cd society-management-platform\frontend
npm run dev -- --host
```
*Access UI:* `http://localhost:5173`

---

## 🔑 Demo Credentials

| Role | Username | Password | Access Level |
|---|---|---|---|
| **Administrator** | `admin1` | `password123` | Full administrative control, all flats, billing ledger, analytics |
| **Resident (Flat A101)** | `resident_a101` | `password123` | Personal invoices, ticket registration, facility bookings |

---

## 👥 Hackathon Team Submission
* **Event:** CODESPARK HACKATHON 2026
* **Institution:** KL University — Bachupally Campus
* **Department:** Department of Computer Science & Engineering
* **Industry Partner:** Yellowspot Technologies
* **Track:** Track 6 — Smart Community & Residential (AT-37)
