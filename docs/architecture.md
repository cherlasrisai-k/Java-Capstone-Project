## Architecture Overview

### Frontend
- Vite + React single-page app written in JavaScript.
- React Router v7 organizes patient vs doctor experiences with guarded routes.
- Auth context manages JWT access tokens (in-memory) and refresh workflow via HttpOnly cookie.
- Axios client auto-injects tokens + correlation IDs, React Query caches data, notifications stream via SSE.

### Backend

| Service | Responsibility | Data Store |
| --- | --- | --- |
| `auth-service` | Registration, login, issuing JWTs, managing refresh cookies | MySQL (`telemed_auth`) |
| `patient-service` | Patient profiles, demographics, onboarding workflows | MySQL (`telemed_patient`) |
| `health-data-service` | Vitals ingestion, alert computation, data aggregation | MySQL (`telemed_health`) |
| `consultation-service` | Scheduling, teleconsultation metadata, doctor notes | MySQL (`telemed_consultation`) |
| `prescription-service` | Medication plans, renewals, pharmacy integrations | MySQL (`telemed_prescription`) |
| `notification-service` | Email/SMS/in-app events, SSE/WebSocket fan-out | MySQL (`telemed_notification`) |

Shared libraries live in `backend/common`. `common-security` provides JWT parsing, principal resolution hooks, and auto-configuration to keep service security consistent.

Services expose RESTful APIs secured with bearer tokens. Observability is provided through Spring Boot Actuator endpoints and can be wired into OpenTelemetry once collectors are added.