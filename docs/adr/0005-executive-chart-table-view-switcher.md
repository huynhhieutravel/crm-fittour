# 0005. Executive Chart-Table View Switcher Architecture

- **Status**: accepted
- **Date**: 2026-10-26

## Context

Financial planning dashboards in FIT TOUR CRM present comprehensive data across multiple dimensions: 15-month cash flow matrices, 11-product P&L calculations, and 3 operational scenarios. While tabular data provides exact arithmetic precision down to the VND, it increases cognitive fatigue for executive leadership (CEO/CFO). Conversely, permanently stacking large data visualization charts directly on top of massive tables causes excessive page length and information clutter.

## Decision

1. **Segmented Executive View Switcher**:
   - Provide an in-header segmented toggle on key analytical sections (P&L Product Table, Monthly Cashflow, and Business Scenarios):
     - `📋 Bảng Dữ Liệu`: Shows the full, audit-ready data table.
     - `📊 Biểu Đồ Trực Quan`: Smoothly switches to the interactive Recharts visual chart.
     - `👁️ Cả Hai (Tùy chọn)`: Allows side-by-side or stacked deep inspection if desired.
2. **Chart Specifications**:
   - **Product Margin Matrix**: Combo Bar (Revenue in Billion VND) + Line (Gross Profit Margin %) with visual benchmarks for Pillars and High-Margin stars.
   - **Scenario Sensitivity Model**: Grouped Bar comparing Revenue vs Gross Profit across Cautious (80%), Base Plan (100%), and Growth (109%).
   - **Seasonality Cashflow Curve**: Multi-layer Area/Bar illustrating lead-time marketing cash disbursements vs peak departure realizations across 15 months.

## Consequences

- Prevents information overload for executives scanning the report quickly.
- Preserves 100% data fidelity: all granular rows, formulas, and notes remain accessible with a single click.
- Clean, modern executive UX compliant with modern dashboard standards.
