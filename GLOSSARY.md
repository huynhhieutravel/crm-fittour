# FIT TOUR CRM — Domain Glossary

Glossary of core domain language and concepts for FIT TOUR CRM, Marketing Ads, and Meta CAPI integration.

## Language

**Lead**:
A prospective customer inquiry originating from marketing channels (Facebook Messenger, Web form, Zalo, Direct).
_Avoid_: Prospect, contact inquiry, message thread

**Customer**:
An established person or corporate representative who has engaged or booked services with FIT TOUR.
_Avoid_: Client, buyer, account, guest

**Booking**:
A reservation for tour seats, whether in HELD (Giữ chỗ), CONFIRMED (Xác nhận), or COMPLETED (Hoàn thành) state.
_Avoid_: Order, invoice, ticket

**QualifiedLead**:
A business milestone where Sales confirms a Lead has genuine tour interest, assigned consultant, and verified contact identity.
_Avoid_: Hot lead, potential customer, verified contact

**Purchase**:
A confirmed commercial conversion on Meta CAPI strictly triggered when a Booking has a valid real deposit or full payment (`paid > 0`).
_Avoid_: Sale, closed deal, transaction

**Auto-Resolution Waterfall**:
The automated multi-level identity matching engine that links unassigned Bookings/Customers to their originating Marketing Lead via Phone (E.164 / Domestic), Email, Facebook PSID, and Tour context.
_Avoid_: Fuzzy matching, lead merge, manual linking

**Ambiguous Match**:
A state where multiple active leads match contact identifiers without sufficient business evidence (different tours, same timeframe) to distinguish attribution safely.
_Avoid_: Conflict error, failed link
