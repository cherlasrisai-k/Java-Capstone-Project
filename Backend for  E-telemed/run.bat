@echo off
echo ===== STARTING E-TELEMEDICINE PLATFORM MICROSERVICES =====

REM ----------------------------------------------------------
REM SERVICE DISCOVERY
REM ----------------------------------------------------------
start "SERVICE-DISCOVERY" cmd.exe /k ^
    "cd /d C:\Users\SriVenkataPrabhas.G1\SpringBoot Workspace\e-telemedicine-platform\service-discovery ^
    && mvn install ^
    && mvn spring-boot:run"

REM ----------------------------------------------------------
REM API GATEWAY
REM ----------------------------------------------------------
start "API-GATEWAY" cmd.exe /k ^
    "cd /d C:\Users\SriVenkataPrabhas.G1\SpringBoot Workspace\e-telemedicine-platform\api-gateway ^
    && mvn install ^
    && mvn spring-boot:run"

REM ----------------------------------------------------------
REM CONFIG SERVER
REM ----------------------------------------------------------
start "CONFIG-SERVER" cmd.exe /k ^
    "cd /d C:\Users\abc\projects\spring-cloud-config-server ^
    && mvn spring-boot:run"

REM ----------------------------------------------------------
REM AUTH SERVICE
REM ----------------------------------------------------------
start "AUTH-SERVICE" cmd.exe /k ^
    "cd /d C:\Users\abc\projects\spring-boot-microservice-auth ^
    && mvn spring-boot:run"

REM ----------------------------------------------------------
REM CURRENCY INSERTION SERVICE
REM ----------------------------------------------------------
start "CURRENCY-INSERTION" cmd.exe /k ^
    "cd /d C:\Users\abc\projects\currency-insertion-service ^
    && mvn spring-boot:run"

REM ----------------------------------------------------------
REM CURRENCY EXCHANGE SERVICE
REM ----------------------------------------------------------
start "CURRENCY-EXCHANGE" cmd.exe /k ^
    "cd /d C:\Users\abc\projects\currency-exchange-service ^
    && mvn spring-boot:run"

REM ----------------------------------------------------------
REM CURRENCY CONVERSION SERVICE
REM ----------------------------------------------------------
start "CURRENCY-CONVERSION" cmd.exe /k ^
    "cd /d C:\Users\abc\projects\currency-conversion-service ^
    && mvn spring-boot:run"

echo ===== ALL SERVICES LAUNCHED =====
pause