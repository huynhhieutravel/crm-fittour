# 0009. Single-Fire D-7 Debt Warning Policy and Direct Departure Booking Drawer Linking

- **Status**: accepted
- **Date**: 2026-10-29

## Context

In travel operations, the 7-day milestone before tour departure (D-7) is a critical operational deadline. After D-7, flight tickets, hotel vouchers, and visa arrangements are finalized. If a customer still carries an unpaid balance (`remaining_debt > 0`), the agency faces immediate financial and cancellation risks.

Previous proposals suggested recurring daily email digests and repeating popups whenever a sales representative logs in or switches tabs. However, high-volume recurring reminders introduce notification fatigue, causing staff to dismiss alerts without taking action. Furthermore, generic "Nhắc Zalo" links failed to connect staff to the operational booking context where passenger lists, ticket statuses, and receipts reside.

## Decision

1. **Targeted Recipient Scope**:
   - Debt notifications are delivered strictly to the sales consultant responsible for creating/managing the booking (`bookings.created_by`).
   - Management and accounting monitor macro debt through the Departure Cashflow Hub rather than receiving individual booking pings.

2. **D-7 Boundary & Single-Fire Policy (Chính sách Cảnh báo Một lần)**:
   - The alert triggers when `days_until_departure <= 7` and `paid < total_price`.
   - **Zero Daily Spam**: Both the in-app ERP popup and the personal email are executed **exactly once per debt booking**.
   - Alert timestamps (`debt_email_sent_at`, `debt_popup_shown_at`) are persisted in the database so that acknowledgment on one device (e.g., laptop) permanently suppresses repeat popups on other devices (e.g., mobile).

3. **Direct Departure Booking Drawer Linking (Deep-link UX)**:
   - Alerts do not launch third-party chat directly. Instead, both the email CTA button and the ERP popup deep-link directly into Operational Tours:
     `/op-tours?open_departure_id={departure_id}&highlight_booking_id={booking_id}`
   - The application automatically opens the **"Khách đặt chỗ"** modal (`OpTourBookingListModal`) for that specific tour departure and highlights the debtor row, giving the consultant instant access to passenger vouchers, payment histories, and direct action.

4. **Automated Cron Schedule**:
   - A cron engine executes daily at 08:30 AM to identify bookings newly entering the `<= 7 days` window that have not yet been notified.
   - Bookings created late (e.g., booked at D-4 or D-2) with outstanding balances are caught and processed in the next morning run.

## Consequences

- Zero alert fatigue: Sales staff receive high-priority, non-spammy notifications.
- Complete device synchronization: Popups are never duplicated across mobile and desktop sessions.
- Operational speed: 1-click transition from alert straight to the departure's booking manifest.

