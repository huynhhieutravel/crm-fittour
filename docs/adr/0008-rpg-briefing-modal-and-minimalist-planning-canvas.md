# 0008. RPG Quest Briefing Modal and Minimalist Planning Canvas

- **Status**: accepted
- **Date**: 2026-10-27

## Context

During user testing of the BU Planning Studio, Business Unit Managers (BUMs) reported that interactive focus popovers (speech bubbles) and static instruction banners inside the form created visual clutter and distraction while entering financial numbers. 

Users specifically requested an RPG-style tutorial experience:
1. Provide a comprehensive Quest Briefing Modal initially explaining: "Bước 1 nhập gì, Bước 2 nhập gì, Bước 3 nhập gì" and the business impact ("tác dụng").
2. Once the briefing is dismissed/closed, the system must stay completely quiet ("dừng luôn khi tắt").
3. The main input canvas must be ultra-minimalist, focusing strictly on required data inputs without intrusive popups or clutter.

## Decision

1. **Dedicated RPG Quest Briefing Modal**:
   - All walkthrough instructions ("Ghi gì", "Tác dụng gì", step-by-step guidance) are encapsulated into a high-visibility, clean RPG Quest Briefing Modal.
   - The briefing outlines the 3 concrete business steps:
     - **Bước 1: Điền Doanh Thu**: Mục tiêu doanh số toàn năm cam kết, tự trích 1% ngân sách MKT.
     - **Bước 2: Điền Số Đoàn**: Tổng số tour dự kiến tổ chức để phân bổ vào Lịch đoàn & Ma trận 12T.
     - **Bước 3: Điền Số Khách**: Tổng lượng khách mục tiêu, tự tính sĩ số TB pax/đoàn.
   - A single prominent CTA button (`[🚀 Đã Hiểu Nhiệm Vụ — Bắt Đầu Nhập Liệu!]`) dismisses the modal.
   - Once dismissed, the system remains 100% silent: no focus popovers, no tooltips, and no auto-triggering speech bubbles.

1.1. **Interactive RPG Game Tutorial Boxtext (Single Focused Pointer)**:
   - Replaced static guidance bars with a true RPG-style game tutorial boxtext that hovers directly above the active target card with a downward pointing arrow (`chỉ ngay đó`).
   - Interactive step sequence:
     - **Bước 1 (Doanh Thu)**: Boxtext highlights Doanh Thu card with glowing border and points down at the input. Clicking the box or `[Nhấn để sang Bước 2 ➔]` plays level chime and moves pointer to Bước 2.
     - **Bước 2 (Số Đoàn)**: Boxtext shifts to Số Đoàn card, explaining group target and action impact. Clicking advances to Bước 3.
     - **Bước 3 (Số Khách)**: Boxtext shifts to Số Khách card, explaining pax calculation. Clicking `[🚀 Hoàn Tất & Nhập Liệu! ✕]` dismisses the tour completely ("như game ấy, xong là mất").
   - Can be re-triggered anytime via `[💡 Hướng Dẫn Chặng 1]` in the header. Once dismissed, leaves the canvas 100% quiet and minimalist.

2. **Ultra-Minimalist Form Canvas**:
   - Strip all static descriptive text blocks, decorative speech bubbles, and inline preset pills from the form layout.
   - Each KPI card retains only the essential elements:
     - Field label with clean status tag (`✓ Xong` / `⚡ Cần điền`).
     - Large, high-legibility input box with thousand separators formatting (`.000.000`).
     - Real-time formatted currency / unit preview (`15.000.000.000 ₫`, `15 Đoàn`, `150 Khách`).

3. **Streamlined Marketing 1% Metric**:
   - Replaced the full-width green marketing notice banner with an elegant, single-line auto-calculated metric right beneath the Revenue target (`⚡ Hạn mức MKT 1% tự trích: 150.000.000 ₫`).
   - The operational policy explanation is preserved inside the RPG Quest Briefing Modal.

4. **Explicit Reopening via Header**:
   - The briefing modal can be re-accessed at any time by clicking `[💡 Hướng Dẫn Chặng {x}]` in the studio top header.

## Consequences

- Form canvas becomes distraction-free, fast, and familiar like a clean spreadsheet.
- First-time users still receive full context on demand via the RPG Quest Briefing Modal.
- Cognitive load during data entry is reduced to zero.
