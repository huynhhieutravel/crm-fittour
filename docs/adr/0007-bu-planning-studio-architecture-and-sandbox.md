# 0007. BU Planning Studio Architecture, Guided 5-Stage Workflow, and Sandbox Isolation

- **Status**: accepted
- **Date**: 2026-10-27

## Context

Following the creation of the multi-BU Google Sheets template (`FIT TOUR | MASTER Template Kế hoạch BU 2027 — Demo dữ liệu BU5`), leaders and Business Unit Managers (BUMs) require an ERP-native module to input and manage commercial plans step-by-step rather than manipulating massive, fragile spreadsheets. 

A comprehensive evaluation established 15 mandatory acceptance criteria (DoD) covering:
1. Multi-year plan creation (2027, 2028).
2. Dynamic product catalog with automatic status & priority coloring, unit economics, and break-even calculations.
3. Multi-departure batch entry for individual products.
4. Real-time 12-month departure matrix synchronization.
5. Marketing budget allocation and utilization ratio tracking.
6. Actionable delivery task tracker with assignees, deadlines, and overdue alerts.
7. Validation against duplicate product/departure codes and data type mismatches.
8. Background draft autosave and resilient reload recovery.
9. Cross-BU data privacy and edit isolation (per-BU usage).
10. Formal 4-state approval lifecycle with immutable version snapshots.
11. Professional Excel (.xlsx) and PDF export formatting.
12. Multi-device responsive UX (desktop, laptop, mobile).

## Decision

1. **Guided 5-Stage Studio Architecture**:
   Structure the planning interface into 5 cohesive chặng (stages) with a persistent progress stepper, autosave indicators, and deep-dive tab navigation:
   - **Stage 1 (Setup & Targets)**: BU selection, Plan Year (2027/2028), Owner, Marketing Quota (1.00%).
   - **Stage 2 (Product Catalog & Unit Economics)**: Products, Route Groups, Priority, Stage, Selling Price, Variable Cost, Fixed Cost, auto Gross Margin % & Break-even Pax.
   - **Stage 3 (Departure Schedule)**: Multi-batch departures linked to catalog products, calculating passenger volume, revenue, and gross profit.
   - **Stage 4 (12-Month Matrix & Marketing Cashflow)**: Real-time 12-month matrix auto-derived from departures, paired with monthly/quarterly marketing cashflow disbursement.
   - **Stage 5 (Delivery Tracker & Executive Review)**: Milestone task tracker with overdue alerts, executive KPI dashboard, version snapshot history, and Excel/PDF export.

2. **Dedicated Planning Sandbox Layer (Zero Live Operational Pollution)**:
   Create dedicated database tables:
   - `bu_plans`: Plan metadata, year, status (`DRAFT`, `SUBMITTED`, `CHANGES_REQUESTED`, `APPROVED`), marketing budget, creator.
   - `bu_plan_products`: Product catalog, pricing, costing, priority, stage, colors.
   - `bu_plan_departures`: Scheduled departures per product and month.
   - `bu_plan_tasks`: Implementation tasks, assignees, deadlines, status, overdue flag.
   - `bu_plan_versions`: Frozen JSON snapshots of approved plans (v1.0, v1.1).
   This ensures planning experiments and multi-year scenarios never contaminate active `tour_departures` or customer booking pipelines until formal BOD activation.

3. **Per-BU Privacy & Edit Lock (Test 12 Compliance)**:
   - **Write Access**: Strictly locked to assigned BU members and Admin/BOD. Users of BU1 cannot create or edit plans for BU2/BU5.
   - **Draft Read Access**: Drafts and pending submissions are confidential to the owning BU and BOD.
   - **Approved Read Access**: Formally approved plans are visible enterprise-wide in read-only mode to maintain `Transparent BU Scope`.

4. **Localhost-First Development & Seed Testing Sandbox**:
   Build, test, and perform the complete Final Functional & UX/UI QA on localhost with a dedicated test cleanup script before proposing VPS deployment.

## Consequences

- BUMs gain an intuitive, error-proof input experience tailored to non-technical managers.
- Eliminates manual Google Sheet cloning and sync breakage.
- Operational database integrity is 100% safeguarded against test and scenario data.
- Satisfies all 15 mandatory QA acceptance criteria.
