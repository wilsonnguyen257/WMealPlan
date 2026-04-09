# High-Assurance Rebuild Plan: WMealPlan

## Philosophy
We are moving from "functional" software to **High-Assurance Software**. Every line of code is a liability. We prioritize correctness, verifiability, and defensive design over speed.

## Phase 1: The "Skeptical" Foundations
Before code, we define truth.

1.  **Formal Specification (`specs/FORMAL_SPEC.md`)**:
    *   We will define the system state using State Machine definitions (conceptually similar to TLA+).
    *   Data structures will be defined with rigorous types and constraints (Zod schemas).
2.  **Threat Modeling (`specs/THREAT_MODEL.md`)**:
    *   **STRIDE Analysis**: We will analyze Spoofing, Tampering, Repudiation, Info Disclosure, DoS, and Elevation of Privilege.
    *   **Mitigation Strategy**: Every identified threat must have a documented countermeasure.
3.  **Constraints (NFRs)**:
    *   **Latency**: AI Response < 10s (P95).
    *   **Availability**: Graceful degradation if AI/DB is down.
    *   **Security**: Zero API Key exposure to client.

## Phase 2: Verifiable Implementation (Defensive Coding)
We do not write code to work; we write it to handle failure.

1.  **Tech Stack Selection**:
    *   **Next.js 14+ (App Router)**: Enforced separation of Client/Server.
    *   **TypeScript (Strict)**: `noImplicitAny`, `strictNullChecks` enabled.
    *   **Zod**: Runtime schema validation for **Design by Contract**.
    *   **Vitest**: Unit testing framework.
2.  **TDD Workflow**:
    *   Write the test -> Fail -> Write code -> Pass -> Refactor.
    *   No feature is "done" without a passing test.
3.  **Static Analysis**:
    *   **ESLint**: Strict rules set.
    *   **Husky**: Pre-commit hooks to prevent bad commits.

## Phase 3: The Quality Gates
Definition of Done (DoD):
*   [ ] Formal Spec updated.
*   [ ] Unit Tests passed (100% coverage for core logic).
*   [ ] Linting passed (0 errors).
*   [ ] Security Scan passed (npm audit).

## Phase 4: Hardening the Supply Chain
*   **SBOM**: We will generate a lockfile and audit dependencies.
*   **Minimal Dependencies**: We will resist adding libraries unless necessary to reduce attack surface.

## Phase 5: Production & Observability
*   **Logging**: Structured logging for all API interactions (hiding PII).
*   **Error Boundaries**: React Error Boundaries to catch UI crashes.

---
**Next Steps**:
1. Create Specifications.
2. Initialize Environment.
3. Begin TDD for Core Logic.
