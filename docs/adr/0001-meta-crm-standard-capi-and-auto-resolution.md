# 0001. Meta CRM Standard CAPI and Multi-Level Auto-Resolution

- **Status**: accepted
- **Date**: 2026-10-18

## Context

FIT TOUR previously attempted integrating Meta Conversions API via Business Messaging v3 (`action_source: "business_messaging"`). However, Meta returned `HTTP 403 (#200) App does not have page_events permission on the Page`. Modifying app permissions risked disrupting existing customer Messenger communications and Meta Ads token flows.

Furthermore, internal operational analysis revealed a significant attribution gap: Sales representatives frequently create Bookings and Customers directly from the Giữ chỗ interface without clicking the formal "Convert Lead" button. Consequently, 173 unique paying Customers and 89 Bookings (~7.28 billion VND) were disconnected from their originating marketing Leads, starving Meta CAPI of ad attribution data (click IDs, original Lead IDs, and campaigns).

## Decision

1. **Adopt Meta CRM Standard CAPI**:
   - Transmit conversion signals via `action_source: "system_generated"` directly into Dataset `835404925628132`.
   - Keep Business Messaging v3 (`meta_capi_business_messaging_v3_enabled`) permanently OFF until Meta app permissions are explicitly resolved.
   - Enforce transactional Outbox pattern (`meta_capi_events`) with `FOR UPDATE SKIP LOCKED`, exponential backoff retry, and deduplication (`idempotency_key` unique constraints).

2. **Implement Multi-Level Identity Auto-Resolution**:
   - Rather than forcing Sales to alter workflows, implement a deterministic resolution waterfall:
     1. Retain existing valid `customer.lead_id` links.
     2. Match normalized Vietnamese phone numbers (E.164, domestic `0...`, 9-digit suffix).
     3. Fallback to Email (lowercase) and Facebook PSID.
     4. Resolve multi-lead ties by Tour template matching, customer relationship binding, and 60-day recency.
     5. If genuinely ambiguous, flag as `AMBIGUOUS_MATCH` without guessing.
   - Automatically synchronize Lead status to `Chốt đơn` (Won) and `is_sales_qualified = true` only when a Booking has verified financial payment (`paid > 0`).

3. **Attribution Measurement Policy**:
   - Adopt `contract_value`: when a deposit is verified, record Purchase conversion value as the total booking contract amount, reflecting travel industry booking commitments.

## Consequences

- Zero operational friction for Sales representatives.
- Robust, automated Meta CAPI Purchase attribution back to original ad campaigns.
- Legacy CAPI fallback retained safely for non-CRM routes.
- Eliminated risk of Cartesian product inflation and premature Lead closure for unpaid reservations.
