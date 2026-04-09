# SBOM (Software Bill of Materials) Report

**Generated**: 2025-12-19
**Standard**: CycloneDX v1.6
**Scope**: Production Dependencies

## Critical Supply Chain Verification
- [x] **Audit**: `npm audit` passed (0 vulnerabilities).
- [x] **Lockfile**: `package-lock.json` is present and sync.
- [x] **SBOM**: Generated at `web/sbom.json`.

## Key Dependencies
| Package | Version | License | Justification |
| :--- | :--- | :--- | :--- |
| `next` | 14+ | MIT | Core Framework |
| `react` | 19.2.1 | MIT | UI Library |
| `zod` | 4.2.1 | MIT | Data Validation (Contracts) |
| `@vercel/postgres` | 0.10.0 | MIT | Database Driver |
| `@google/generative-ai` | 0.24.1 | Apache-2.0 | AI Inference |

*Note: This is a summary. Full machine-readable SBOM is in `sbom.json`.*
