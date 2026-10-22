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

**Departure Cashflow Hub (Sổ Tay Khởi Hành & Dòng Tiền)**:
The unified operational and financial dashboard in FIT TOUR CRM aggregating tour departure capacity, real-time cash flow, and debt collection progress across Business Units.
_Avoid_: External note app, manual ledger, separate tracking sheet

**Transparent BU Scope**:
The data access model in FIT TOUR CRM where users default to their personal / assigned Business Unit perspective, but have unrestricted permissions to switch and monitor other BUs' departure and cashflow metrics.
_Avoid_: Hard data silo, cross-department data masking

**Debt Collection Stages (Phân Tầng Công Nợ Booking)**:
The three standardized debt recovery tiers: Fully Paid (100%), Partial Deposit (Cọc dở dang), and Zero Deposit / Overdue (Nợ 100% chưa cọc).
_Avoid_: Rough status, vague payment state

**Quick Logistics Ledger (Sổ Tay Ghi Nhận Hậu Cần Nhanh)**:
An inline-editable metadata layer on tour departures and bookings capturing operational counts per category (SIM types, rooming allocations, surcharges, and demographics) with quantity breakdown without forcing individual passenger-by-passenger entry into the core booking transaction table.
_Avoid_: Hardcoded booking schema, separate paper notes, manual calculation


