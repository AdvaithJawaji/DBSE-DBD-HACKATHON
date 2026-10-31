@echo off
echo =========================================================================
echo    CODESPARK HACKATHON 2026 - Problem AT-37: Smart Apartment Management
echo    Resident360 Platform Launcher (Java Spring Boot + React + Python ML)
echo =========================================================================
echo.

set MAVEN_CMD=C:\Users\HP\Downloads\apache-maven-3.9.6\bin\mvn.cmd

echo [1/3] Starting Python ML Engine & Gateway on port 8000...
start "Python ML & Gateway (Port 8000)" cmd /k "cd /d C:\Users\HP\Downloads\DBSE-Project\society-management-platform\api-gateway && .\venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Java Spring Boot Backend on port 8080...
start "Java Spring Boot Backend (Port 8080)" cmd /k "cd /d C:\Users\HP\Downloads\DBSE-Project\society-management-backend && %MAVEN_CMD% spring-boot:run"

timeout /t 5 /nobreak >nul

echo [3/3] Starting React.js Frontend on port 5173...
start "React Frontend (Port 5173)" cmd /k "cd /d C:\Users\HP\Downloads\DBSE-Project\society-management-platform\frontend && npm run dev -- --host"

echo.
echo =========================================================================
echo  All services launched successfully!
echo.
echo  - Frontend Web & Mobile App:  http://localhost:5173
echo  - Java Spring Boot REST API:  http://localhost:8080
echo  - Python AI/ML Predictor:     http://localhost:8000/api/ai/predict-maintenance
echo.
echo  Demo Credentials:
echo    Admin:     admin1 / password123
echo    Resident:  resident_a101 / password123
echo =========================================================================
pause
