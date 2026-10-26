# 0004. BU5 Financial Planning Reconciliation, Gross Profit Standards, and Break-Even Thresholds

- **Status**: accepted
- **Date**: 2026-10-26

## Context

The BU5 Adventure & Exotic 2027 Master Plan presented apparent discrepancies between operational tour schedules and financial planning models:
1. **Departure Count Discrepancy**: Tab 1 (Cashflow Matrix) and Tab 3 (Operational Departures) listed **27 confirmed departures** (31.646 Billion VND revenue), whereas Tab 4 (P&L Sheet) and Tab 5 (Base Scenario) modeled **30 departures** (33.034 Billion VND revenue). This arose because Egypt (+2 departures) and Morocco (+1 departure) have expansion slots ready if demand peaks.
2. **Terminology Ambiguity**: The term "Lợi nhuận" was used for `Revenue - Direct Tour Cost`, which in managerial accounting is **Gross Profit (Lãi gộp)**. It omitted the dedicated 1.00% Marketing customer acquisition budget (~330 Million VND) and fixed overhead.
3. **Lack of Risk & Break-even Metrics**: All projections assumed a fixed 10 pax/group. Without an explicit break-even threshold, leadership lacked a concrete trigger point for running vs. consolidating/cancelling departures when bookings fall short.

## Decision

1. **Two-Tier Plan Reconciliation**:
   - Establish a clear distinction between:
     - **Operational Departure Plan (27 departures • 31.646 Billion VND)**: Locked airline allotments, visa timetables, and marketing cashflow.
     - **P&L Capacity Ceiling (30 departures • 33.034 Billion VND)**: The theoretical 100% capacity target including 3 contingent expansion groups.
   - Display a prominent Reconciliation Card on the executive dashboard to explicitly explain this relationship.

2. **Standardized Managerial Financial Terminology**:
   - Rename `Lợi nhuận` to **`Lãi Gộp Kế Hoạch (Gross Profit)`**.
   - Introduce **`Lãi Đóng Góp Sau Marketing (Contribution Margin after MKT)`** (`Gross Profit - 1% MKT Budget`), revealing net cash generation (~4.35 Billion VND / 13.2%).

3. **Break-Even Threshold (6 Pax Rule)**:
   - Institute an operational break-even standard of **6 pax/group** across BU5 exotic routes to cover Tour Leader airfare/visa and ground transportation overhead.
   - Categorize group sizes: `< 6 pax` (Critical/Surcharge or Reschedule), `6–7 pax` (Break-even), `8–10+ pax` (Target Profitable).

4. **In-Cell Pareto 80/20 Visual Indicators**:
   - Embed lightweight proportional progress bars within the Product column to immediately surface pillar routes (Mongolia, Murmansk Aurora, Alaska driving ~42% of revenue) without causing horizontal table sprawl.

## Consequences

- Full consensus between Sales, Operations, and Executive Leadership (CEO/CFO).
- Zero ambiguity regarding committed operational departures vs. expansion ceilings.
- Clear financial decision-making framework for tour departure greenlighting.
