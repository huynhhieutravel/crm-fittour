# 0006. Multi-BU Standard Financial & Marketing Master Plan Template and Schema

- **Status**: accepted
- **Date**: 2026-10-26

## Context

Following the comprehensive audit of the BU5 2027 Market Plan, leadership requested expanding the planning framework to all Business Units (BU1 through BU5) via a standardized Google Sheet template in Google Drive (`https://drive.google.com/drive/folders/1PrRGuJvoqABCPRDFSCOtompUUM-B1OgW`).

An evaluation of the legacy BU5 Google Sheet revealed several architectural deficiencies that prevented it from being cloned directly as an enterprise-wide template:
1. **Incomplete Costing & Data Gaps**: Several rows lacked direct costing (e.g. Namibia) or had unhandled division-by-zero errors (Baikal survey route).
2. **Two-Tier Disconnection**: Tab `P&L sản phẩm` (30 groups • 33.03B VND) and Tab `Lịch khởi hành` (27 groups • 31.65B VND) were disjointed without explicit reconciliation or grouping flags.
3. **Absence of Marketing Cashflow Formulas**: The legacy sheet contained only a static 1% formula on the schedule tab; the entire 15-month lead-time cashflow disbursement and quarterly rollups were hardcoded in code rather than calculated in the spreadsheet.
4. **Lack of Validation & Tamper Protection**: Freeform inputs allowed mixed date formats, missing pax counts, and broken formulas when shared among multiple unit managers.

## Decision

1. **Standardized 4-Tab Financial & Marketing Architecture**:
   Establish a strict, interconnected 4-tab template structure:
   - **`1_THIET_LAP_BU` (SETUP_METADATA)**: Unit identifier (BU1–BU5), leader, plan year, company marketing quota (1.00%), and cashflow distribution mode.
   - **`2_PNL_SAN_PHAM` (PRODUCT_PNL)**: Master catalog defining selling price, direct land/airfare/visa costs, fixed tour-leader overhead, automatically calculating Gross Profit, Gross Margin, and Dynamic Break-Even Pax.
   - **`3_LICH_BAY_DONG_TIEN_MKT` (DEPARTURE_CASHFLOW)**: Single source of truth for tour departures, incorporating dynamic 15-month lead-time marketing disbursement formulas and 5-quarter aggregations.
   - **`4_KICH_BAN_KINH_DOANH` (SCENARIOS_SUMMARY)**: Executive sensitivity dashboard automatically calculating 80% Cautious, 100% Base Approved, and 110% Upside Growth scenarios linked directly from Tabs 2 and 3.

2. **Single-Source Departure Classification Flag**:
   In Tab 3, mandate a classification column with values:
   - `[Chính thức]` (Locked airline allotment & committed departures, e.g. 27 groups).
   - `[Mở rộng / Dự phòng]` (Contingency expansion capacity unlocked when waitlists surge, e.g. +3 groups).
   This eliminates discrepancies between operational schedules and P&L ceilings while maintaining a single dataset.

3. **Dual Distribution Artifacts**:
   Generate two production-ready Excel workbooks natively convertible to Google Sheets:
   - `FIT_TOUR_BU_MASTER_PLAN_TEMPLATE_2027.xlsx`: Pristine blank template with validation, dropdowns, and instructions for other BUs.
   - `FIT_TOUR_BU5_KE_HOACH_CHI_TIET_2027.xlsx`: Benchmark reference pre-populated with BU5's audited 2027 data.

## Consequences

- All 5 Business Units will utilize an identical financial schema, ensuring apples-to-apples performance comparisons for executive leadership.
- Accounting and CFO offices gain instant visibility into quarterly marketing cash requirements across all units.
- Standardized tabular schemas enable future automated 1-click Google Sheet ingestion directly into the FIT Tour CRM database.
