# E-Telemedicine Platform

Cloud-native telemedicine solution composed of a React (Vite) SPA and Spring Boot microservices deployed.

## Repository Structure

```
frontend/                 React SPA for patients and doctors (Vite + React Router)
backend/                  Maven multi-module project (Java 17, Spring Boot 3)
  common/common-security  Shared JWT utilities + auto-configuration
  services/*              Independent microservices (auth, patient, health-data, etc.)
docs/                     Architecture + testing strategy notes
```

## Local Development

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
mvn clean package
java -jar services/auth-service/target/auth-service-0.0.1-SNAPSHOT.jar
```

Each service exposes its own `application.yml` with dedicated MySQL schema names. Update credentials/secrets before running locally.

## Documentation

- `docs/architecture.md` – macro/micro architecture overview.
- `docs/testing-strategy.md` – coverage, automation, and quality gates.