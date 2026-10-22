# 0002. Departure Cashflow Hub Architecture and Transparent Logistics Ledger

- **Status**: accepted
- **Date**: 2026-10-22

## Context

FIT TOUR Sales and Operations representatives previously relied on external ad-hoc spreadsheets and independent web tools (such as `visacheckk.com`) to monitor tour departure occupancy, cashflow collection, passenger rooming, and SIM cards. 

This created multiple issues:
1. Sales representatives lacked a direct, actionable view of their outstanding customer receivables and departure seat availability.
2. Forcing SIM requests and rooming configurations into the core `bookings` schema introduced unnecessary friction during quick booking workflows.
3. Tour guides (HDVs) and external land operators needed mobile access to rooming and logistics manifests without requiring ERP credentials and without exposing sensitive financial figures (revenues, sales margins, booking values).

## Decision

1. **Dual-Perspective Dashboard (Departure Cashflow Hub)**:
   - Provide two switchable views within a single module:
     - **Operations & BU Overview**: Aggregates macro cash flow, debt risk by tour route, monthly revenue trends, rooming, SIM distribution, and extra surcharges.
     - **Personal Sales & Debt Tracking**: Focuses on individual sales targets, seat availability, overdue customer balances, and 1-click debt follow-up.
   - Implement **Transparent BU Scope**: Users default to their personal / assigned BU context, but can freely switch filters across all BUs without hard data silos.

2. **Decoupled Quick-Logistics Ledger with Quantity-per-Category**:
   - Rather than complicating the core booking transaction table, logistics metadata is maintained as a flexible, inline-editable layer on the departure ledger.
   - For group bookings (multi-pax), logistics supports **Quantity per Status/Category** (e.g., for a 10-pax booking: 5 Physical SIMs, 3 eSIMs, 2 None; 2 DBL rooms, 2 TWIN rooms, 2 SGL rooms; 8 ADL, 2 CHD).
   - This enables rapid group adjustments without requiring individual passenger-by-passenger data entry upfront, feeding real-time numbers directly into operations donut charts.

3. **Public Mobile-Optimized Guide Links (`/tai-lieu/doan/:token`)**:
   - Generate secure, public token-based URLs accessible without ERP authentication.
   - Strictly whitelist operational fields (Pax name, gender, room assignment, SIM status, special notes) while completely omitting all financial data (contract prices, paid deposits, remaining debt).

## Consequences

- Seamless cash collection tracking for Sales with zero duplicate data entry.
- Real-time visibility into tour occupancy and debt recovery.
- Strict operational data separation protecting financial privacy for external tour guides.
