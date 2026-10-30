# 0011. Partial Cancellation, Split Booking, and Customer Deposit Retention Ledger

- **Status**: accepted
- **Date**: 2026-10-30

## Context

In multi-passenger travel bookings (e.g., family or group departures), it is common for a single passenger to withdraw while the remaining travelers proceed. In FIT TOUR operations, customers frequently request deposit retention (Bảo lưu cọc) instead of a cash refund, with the intent to apply these funds to a future tour departure.

Historically, ERP systems handle cancellations crudely:
1. Decreasing the pax count directly on the active booking recalculates the gross price down, but leaves the entire deposited sum attached to the remaining passengers. This artificially inflates the remaining travelers' payments and erases the audit trail of the canceled traveler's deposit.
2. Leaving the pax count unchanged flags the booking as carrying severe overdue debt (e.g., D-7 alert fires for unpaid remaining balance on the canceled passenger's seat), confusing accounting and dispatch.
3. Tracking retained deposits via informal CRM notes or spreadsheet sidecars leads to lost funds, staff friction, and disputes upon re-booking.

## Decision

We establish a formalized 3-tier domain architecture for Partial Cancellations and Deposit Retention:

### 1. Atomic Split Booking Engine
- When a specific member in a multi-pax booking cancels with retention, the system executes a non-destructive split:
  - **Active Leg (Booking A)**: Decreased by 1 seat, gross price reduced to 1 pax, retaining only the active traveler's share of deposit. Passenger manifests, visas, and airline ticketing lists are updated cleanly.
  - **Archived Leg (Booking B)**: Created with status `HỦY - BẢO LƯU CỌC`, documenting the specific canceled passenger, the tour context, the gross deposit, and any operational deduction/cancellation penalty fees. The tour seat is restored immediately to available capacity.

### 2. Customer Credit Ledger (`customer_credits`) & Expiry Hard Cap
- Retained funds are deposited into a dedicated customer-level credit account (`customer_credits`) with immutable ledger transactions (`customer_credit_transactions`):
  - `CREDIT`: Inflow from split booking retention.
  - `DEBIT`: Drawdown applied toward a future tour booking deposit.
  - `EXPIRED`: Written off to other revenue upon reaching expiration milestone.
- **Credit Ownership Flexibility**: Default credited to the canceling passenger, with an optional toggle to assign credit to the booking's lead payer.
- **Strict 12-Month Hard Cap (Trần Thời Hạn Tối Đa 12 Tháng)**: Sales staff are strictly constrained to choosing a validity period of `<= 12 months` (e.g., 3, 6, 9, or maximum 12 months from the cancellation date). System UI enforces `max="12"` and backend rejects any expiration date exceeding `cancellation_date + 365 days`.
- **Partial Drawdown**: The ledger supports partial drawdowns (e.g., drawing 6M from a 10M credit note leaves 4M remaining until the original expiry date).

### 3. Integrated ERP UI & 1-Click Credit Drawdown
- **Operational List**: A dedicated `[Bảo lưu & Hủy chỗ]` action per member in `OpTourBookingListModal`.
- **New Booking Creation**: When entering a customer's phone or ID, the system detects active retained credits and surfaces a visual badge with a 1-click `[Cấn trừ tiền bảo lưu]` action.
- **Formal Voucher**: Generates a standardized printable/downloadable "Phiếu Xác Nhận Bảo Lưu Tiền Cọc" for transparency and client reassurance.

## Consequences

- Financial integrity: Complete segregation between active tour cashflow and retained prepaid liabilities.
- Zero false debt alarms: Remaining travelers show exact real-world balances; D-7 alerts only fire on legitimate unpaid balances.
- Operational speed: Eliminates manual ledger bookkeeping and spreadsheet reconciliation across sales, operations, and accounting.

