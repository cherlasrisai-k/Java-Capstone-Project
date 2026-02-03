## Testing Strategy

### Frontend
- **Unit & Component Tests**: React Testing Library + Jest targeting ≥70% coverage for hooks, auth context, and dashboard widgets.
- **Integration/UI Tests**: Cypress component tests for login, registration, patient metric upload, doctor workflow.
- **E2E**: Cypress runs against ephemeral backend stack; covers patient onboarding → data upload → doctor review + notification flow.

### Backend
- **Unit Tests**: JUnit 5 + Mockito for service classes (e.g., `AuthService`, alert engine).
- **Integration Tests**: Testcontainers spins up MySQL + Kafka; verifies repository mappings and REST controllers.
- **Contract Tests**: Spring Cloud Contract ensures request/response compatibility between frontend and microservices.
- **Performance**: k6 scripts load test `/health-data` ingestion and consultation scheduling.
- **Security**: REST Assured tests confirm RBAC rules; dependency scanning via OWASP Dependency Check/Snyk.

