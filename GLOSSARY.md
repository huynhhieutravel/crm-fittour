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

**Dispatch 3D Twin (Trung Tâm Điều Phối 3D)**:
A real-time, interactive 3D digital representation of FIT TOUR's sales operations center simulating consultants, leads, and customer flows.
_Avoid_: Game 3D, mô hình trang trí, màn hình ảo

**Customer Entity (Thực Thể Khách Hàng 3D)**:
A 3D spatial entity representing a prospective or active Lead in the dispatch lounge or at a consultant's desk.
_Avoid_: Con bot, nhân vật game, NPC

**Consultant Station (Bàn Tư Vấn BU)**:
A dedicated 3D workstation assigned to a specific Business Unit (BU1 to BU5) where sales consultants interact with customer entities.
_Avoid_: Bàn làm việc, seat, booth

**SLA Mood Indicator (Chỉ Số Cảm Xúc SLA)**:
A visual real-time emotion state reflecting response delay milestones: Normal (< 1h), Impatient (1–4h), Frustrated (4–12h), and Critical/Abandoned (> 12h).
_Avoid_: Điểm tức giận, trạng thái khách

**Floating Dialogue Pill (Bóng Thoại Thời Gian Thực)**:
A temporary 2D HTML/CSS overlay anchored above 3D entities showing incoming chat snippets (Zalo, Messenger, Web) and fading out after a brief interval.
_Avoid_: Chat bubble tĩnh, bảng phụ đề

**Open Lounge & Cafe Hub (Phòng Lớn & Góc Cafe Tám Chuyện)**:
An open-plan co-working and hospitality lounge where prospective leads can relax with coffee and informal chats prior to or between direct desk consultations.
_Avoid_: Phòng chờ bệnh viện, hàng ghế cứng

**Live In-Scene Chat Console (Khung Chat Tương Tác Trực Tiếp 3D)**:
An interactive messaging console embedded within the 3D space allowing operators to type, send messages, and observe instant 3D character reactions and SLA resets.
_Avoid_: Read-only log, bảng xem thụ động

**Pipeline Pod Architecture (Quy Hoạch Phân Khu Theo Phễu Vận Hành)**:
A zoned spatial layout scaling from Entrance Reception ➔ Cafe Waiting Lounge ➔ BU Consultation Wings ➔ Deposit Closing Booths to cleanly manage 50–100+ concurrent multi-day leads.
_Avoid_: Mặt bằng đơn lẻ, bàn làm việc chật chội

**Floor Decal Typography (Kiến Trúc Đồ Họa Mặt Sàn)**:
Graphic typography baked or projected directly onto the 3D ground plane to designate zones and Business Units without obstructing line-of-sight.
_Avoid_: Biển hiệu 2D che lấp, bảng chữ nổi cồng kềnh

**Interaction Aura (Vòng Sáng Tương Tác)**:
A synchronized floor illumination ring connecting an active sales consultant with their specific seated customer to visualize 1-1 engagement.
_Avoid_: Dây nối ảo, đường kẻ rối mắt

**RTS Roaming Camera**:
An unconstrained tactical camera navigation system supporting right-click dragging, cursor-centric zooming, and WASD keyboard panning across the entire campus.
_Avoid_: Camera xoay quanh điểm chết, góc nhìn cố định

**Desk Hologram Pill (Thẻ Bàn Trực Quan BU & Tour)**:
A streamlined, horizontal glassmorphic badge anchored securely above each consultation desk showing the BU tag, destination tour, SLA mood, and the latest chat snippet with zero overlap.
_Avoid_: Bảng thông tin che người, biển quảng cáo lơ lửng

**Spaced Campus Masterplan (Mặt Bằng Giãn Cách Chuẩn Kiến Trúc)**:
An expanded 72×48 spatial layout providing a minimum 6–8m buffer zone between consultation pods to guarantee zero label collision even from wide camera angles.
_Avoid_: Mặt bằng chật hẹp, bàn dính liền nhau

**Elevated Indicator Stem (Đường Dóng Thẻ Không Gian)**:
A vertical holographic leader line elevating information pills to y=4.0m above desks, guaranteeing 100% unobstructed visibility of characters and furniture underneath.
_Avoid_: Thẻ đè đầu người, bảng chữ che khuất

**Hover Chat Popover (Hộp Thoại Chat Nổi Khi Rê Chuột)**:
A dynamic expansion state on desk hologram pills that reveals the complete 3-4 message dialogue history automatically upon mouse cursor hover.
_Avoid_: Bắt buộc click, xem chat bị gián đoạn

**Staggered Pod Grid (Bố Trí So Le Zíc-Zắc)**:
An isometric spatial layout shifting neighboring consultation desks along both X and Z axes (e.g. z=-2.2 and z=+2.2) so horizontal screen projections never collide.
_Avoid_: Bàn thẳng hàng song song, thẻ chạm mép

**Stationary Camera Dispatch (Giữ Nguyên Góc Nhìn Khi Tương Tác)**:
A non-intrusive interaction model where opening chat consoles preserves the operator's current camera altitude and orientation, eliminating disorienting zoom-in jumps.
_Avoid_: Ép zoom cận cảnh, mất dấu toàn cảnh

**Multi-Day Temporal Filter (Bộ Lọc Dòng Thời Gian Đa Ngày)**:
A unified time scrubber (Today, Yesterday, This Week, Backlog) that filters both 3D entities and live chat streams to mirror real-world multi-shift dispatch centers.
_Avoid_: Hiển thị một cục không có mốc thời gian, thiếu lọc theo ca

**Smart Staggering & Compact LOD (Xếp Lệch Tầng Tự Động & Thẻ Đa Tầng)**:
An intelligent spatial layout algorithm that dynamically staggers vertical and horizontal label offsets for customers sharing the same workstation suite, paired with a compact badge level-of-detail mode to permanently eliminate card overlap.
_Avoid_: Đè chéo chữ, thẻ chồng lấn

**Digital Luxury Twin Architecture (Kiến Trúc Không Gian Số Hạng Sang)**:
A high-fidelity environmental design system featuring zone-specific acoustic BU carpets, warm oak parquet walkways, indoor botanical elements, and warm 3000K spotlights elevating the digital twin to enterprise luxury standards.
_Avoid_: Mô hình hộp kính thô sơ, văn phòng khung dây

**Workload Heatmap Mode (Chế Độ Nhiệt Tải Phòng Điều Phối)**:
A visual operational telemetry overlay illuminating consultation suite floors in amber-red (overloaded queue > 3 leads) or emerald green (available capacity / idle sales) for split-second dispatch decision making.
_Avoid_: Đếm lead thủ công, chia khách cảm tính

**Executive Dark / Night Mode (Chế Độ Giám Sát Ban Đêm)**:
A high-contrast dark theme shifting ground surfaces to deep slate, glass mullions to luminescent sci-fi contours, and desk lamps to warm ambient glows for 24/7 command center and large wall display operations.
_Avoid_: Chói mắt màn hình lớn, giao diện đơn sắc

**Stylized Entity Scale (Tỷ Lệ Nhân Vật Chuẩn Mô Phỏng)**:
A 2.2x to 2.4x enlarged character proportion system (~4.8m height in campus coordinates) inspired by premier management games (The Sims, Two Point) ensuring human figures, posture, and clothing are immediately recognizable from wide isometric viewpoints.
_Avoid_: Nhân vật li ti, người tí hon 10 pixel

**Pedestal Glow Disc (Đĩa Hào Quang Chân Nhân Vật)**:
A dynamic ground-level illumination ring beneath each character entity reflecting their assigned BU color or operational triage urgency, anchoring visual presence and eliminating ghost-like detachment.
_Avoid_: Chấm đen mờ nhạt, mất dấu vị trí người

**Tight Shoulder Callout (Khung Thoại Cận Vai)**:
An ergonomic speech bubble layout anchoring the chat card within 45px–50px of the character's right shoulder, bridged by an unbreakable beacon stem originating precisely from the character's head.
_Avoid_: Tin nhắn từ không khí, thẻ văng xa khỏi người

**Role-Distinct Visual Rigging (Trang Bị Ngoại Hình Phân Biệt Sale & Khách)**:
A clear 3D modeling differentiation equipping Sales Consultants with business attire and call-center communication headsets, while Customers carry travel backpacks, mobile devices, and dynamic casual posture.
_Avoid_: Khối người giống nhau, khó phân biệt vai trò

**Executive Overview Camera (Góc Quay Bao Quát Trụ Sở)**:
A commanding isometric vantage point positioned at `(75, 58, 75)` framing the entire 108m × 64m headquarters across all 5 Business Units, the central reception lounge, and main promenade simultaneously, accessible at any moment via the `🌐 Toàn Cảnh` dock preset.
_Avoid_: Zoom cận quá đà cắt mất phòng ban, mất tầm nhìn tổng thể

**Geometric SVG Speech Arrow (Mũi Tên Chỉ Xuất Phát Từ Đầu Nhân Vật)**:
An unbroken geometric SVG leader tail and colored energy spine rooted at the character's head beacon pin `(0, 0)`, connecting directly into the dialogue card's left edge and dynamically angling to track vertically staggered cards without ever detaching from the speaker.
_Avoid_: Thanh ngang lơ lửng giữa trời, que chỉ đứt rời không chạm người

**Operational Departure Plan (Kế Hoạch Khởi Hành Thực Tế 2027)**:
The operational schedule of 27 confirmed tour departures (24 departure dates, 270 pax, 31.646 Billion VND revenue) constrained by confirmed airline allotments, visa lead times, and ground operator capacity.
_Avoid_: Số liệu ước lượng mơ hồ, chỉ tiêu lý thuyết chưa chốt vé

**P&L Capacity Ceiling (Hạn Mức Kế Hoạch P&L 30 Đoàn)**:
The theoretical full-year commercial target modeled in the P&L sheet (30 departures, 300 pax, 33.034 Billion VND revenue), which includes contingency expansion slots (e.g. +2 Egypt, +1 Morocco) activated when customer waitlists exceed standard group capacity.
_Avoid_: Nhầm lẫn giữa trần năng lực thương mại và lịch khởi hành thực tế

**Tour Gross Profit (Lãi Gộp Kế Hoạch Sản Phẩm)**:
The direct operational surplus generated per tour before allocating marketing budgets and overhead (`Revenue - Total Direct Cost`).
_Avoid_: Lợi nhuận ròng, lợi nhuận sau thuế, lợi nhuận hoạt động

**Contribution Margin After MKT (Lãi Đóng Góp Sau Marketing)**:
The operational margin remaining after deducting direct tour costs and the dedicated 1.00% Marketing customer acquisition budget (`Gross Profit - 1% MKT Budget`).
_Avoid_: Lợi nhuận gộp thô không trừ chi phí thu hút khách

**Tour Break-even Threshold (Điểm Hòa Vốn Đoàn)**:
The minimum number of paying passengers required for a tour departure to cover fixed operating expenditures (Tour Leader airfare/visa, guide, chartered vehicles) without incurring an operational loss.
_Avoid_: Chạy đoàn bất chấp sĩ số, thiếu ngưỡng an toàn tài chính

**Seasonality Cashflow Curve (Biểu Đồ Dòng Tiền & Điểm Rơi Mùa Vụ)**:
A dual-axis temporal visualization correlating early lead-time marketing cash disbursement with delayed revenue realization and tour departure peaks across a 15-month timeline.
_Avoid_: Báo cáo chi tiêu tĩnh, biểu đồ thiếu tính mùa vụ

**Product Margin Matrix (Ma Trận Doanh Thu vs Biên Lợi Nhuận)**:
A strategic portfolio chart plotting total route revenue (Volume) against gross profit margin percentages to categorize products into Pillars (Bò sữa volume), High-Margin Stars (Ngôi sao lợi nhuận), and Experimental routes.
_Avoid_: Bảng số liệu thô không phân nhóm danh mục sản phẩm

**Scenario Sensitivity Model (Mô Hình Độ Nhạy 3 Kịch Bản)**:
A comparative multi-bar visualization benchmarking downside risk (80% Cautious), approved baseline (100% Base Plan), and upside potential (109% Growth) across revenue and gross profit.
_Avoid_: Kịch bản con số rời rạc thiếu trực quan so sánh

**Executive View Switcher (Nút Chuyển Đổi Bảng / Biểu Đồ)**:
An interactive segmented control at the header of major financial and planning modules allowing users to toggle between dense tabular data (`Bảng Chi Tiết`) and executive charts (`Biểu Đồ Trực Quan`), preventing information overload while preserving deep-dive accessibility.
_Avoid_: Nhồi nhét biểu đồ đè lên bảng, trang báo cáo quá dài gây mỏi mắt

**Quarterly Budget Matrix (Ma Trận Ngân Sách Marketing Theo Quý)**:
A dedicated financial allocation tab aggregating campaign marketing expenditures and tour revenues into 5 strategic quarters (Q4/2026 Seed/Chạy trước, Q1/2027 Peak MKT, Q2/2027 Hè, Q3/2027 Peak Revenue, and Q4/2027 Closing) to simplify cashflow authorization, quarterly fund disbursement, and CFO oversight.
_Avoid_: Báo cáo 15 tháng manh mún gây khó khăn cho kế toán phân bổ dòng tiền mặt

**Persistent Executive Callout (Hộp Chi Tiết Kịch Bản Cố Định & Tương Tác)**:
A high-contrast executive information card permanently positioned inside the scenario chart area with interactive tab pills, ensuring key metrics (Revenue, Gross Profit, Margins, Pax, and Strategic Directives) remain immediately readable without requiring mouse hovering or leaving empty white space on display monitors.
_Avoid_: Biểu đồ trống trơn khi không rê chuột, tooltip biến mất làm mất ngữ cảnh



