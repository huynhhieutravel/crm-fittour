# 0015. Zero-Regression Security Hardening and Guarded Media Protection

Date: 2026-10-31

## Context

An external security audit (`docs/security-audit-2026-10-31/REPORT.md`) performed an isolated inspection of commit `4921b64` and reported 17 security findings (4 Critical, 11 High, 2 Medium), recommending extensive refactoring including:
- Re-architecting the entire Media system into private storage with signed short-lived URLs.
- Rewriting RBAC and ownership scopes across 79 route files and 68 controllers.
- Enforcing strict payload signature checks on Facebook CAPI, Zalo Webhooks, and Telegram.
- Forcing dependency major version upgrades (`npm audit`).

However, FIT TOUR CRM is a mission-critical, live operational platform handling daily customer leads, marketing ad spend, tour reservations, cashflow vouchers, and staff communications. A blanket implementation of the auditor's suggestions would trigger catastrophic regressions:
1. **Broken UI and Media**: Converting `/uploads` into private signed URLs immediately breaks thousands of tour itinerary images, hotel photos, vouchers, and avatar displays across the web and ERP.
2. **Dropped Marketing Leads**: Overhauling webhook signatures on live endpoints without sandbox staging causes Meta Ads and Zalo webhooks to fail with HTTP 400/401, discarding incoming customer leads and wasting ad spend.
3. **Session Lockouts**: Modifying JWT 14-day token lifecycles and database middleware abruptly invalidates active sales and accounting sessions.
4. **Historical Data Corruption**: Any broad database migration risks corrupting historical transactions.

## Decision

1. **Full Master Backup Prerequisite**:
   - Before any security patch is applied, a complete snapshot is created via `scripts/create_master_backup.sh`.
   - Snapshot includes: PostgreSQL production dump (`fittour_crm` in `.sql.gz` and `.dump`), all media uploads (`server/public/uploads`), production environment configurations (`.env`, SSL certs, Nginx configs, Zalo tokens), and an automated recovery script (`restore.sh`).

2. **Risk-Tiered Remediation Strategy**:
   - **Tier 0 (Zero-Regression Isolated Fixes)**: Fix isolated vulnerabilities that have zero dependencies on business workflows.
     - *S01 (Dev-login bypass)*: Completely disable the bypass route in production (`NODE_ENV === 'production'`).
     - *S03 (RAG Path Traversal)*: Sanitize file paths using `path.basename()` and strictly enforce document directory confinement.
     - *S12 (Sensitive Tracking)*: Remove tracked log files and dummy databases from Git index without deleting server files.
   - **Tier 1 (Guarded Destructive Operations)**:
     - *S02 (Media)*: Retain public static read access for `/uploads` to preserve all image rendering in the ERP. Add authentication and authorization strictly to destructive actions (`POST /upload`, `DELETE /:filename`, `POST /bulk-delete`) to eliminate unauthorized file tampering.
     - *S04 (User Privilege Escalation)*: Restrict `PUT /api/users/:id` so non-admin users cannot modify other users' roles, emails, or active status.
   - **Tier 2 (Freeze Business-Critical Integrations)**:
     - Defer modifications to Facebook CAPI, Zalo Webhooks (S09, S10), WebSockets (S11), and dependency upgrades (S14) to a dedicated staging environment to guarantee uninterrupted lead generation and sales.

3. **Strict Compliance with Data Invariance**:
   - Zero batch updates or retroactive modifications to existing records in the database.

## Status

Accepted.

## Consequences

- The most critical attack vectors (arbitrary admin token minting, file system traversal, unauthorized file deletion, and user account takeover) are definitively closed.
- Existing ERP workflows, tour images, customer receipts, and marketing leads remain 100% operational with zero regressions.
- A fully verified 1.1GB Disaster Recovery Master Archive is preserved, allowing instant one-click rollback if any anomaly is detected.

