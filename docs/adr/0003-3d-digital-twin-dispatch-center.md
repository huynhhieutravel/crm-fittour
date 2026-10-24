# 0003. 3D Digital Twin Operations & Dispatch Center

- **Status**: accepted
- **Date**: 2026-10-24

## Context

FIT TOUR CRM handles high-value bespoke tour inquiries across multiple channels (Facebook Messenger, Zalo, Website). Operations directors and BU team leads need real-time situational awareness over:
1. Which inbound leads are waiting for assignment in the queue.
2. Which sales consultants are actively engaged vs idle.
3. SLA breaches where customers are waiting without responses for extended hours (1h, 4h, 12h).

Traditional tabular dashboards and flat notification badges fail to give an immediate, intuitive sense of urgency or operational bottleneck across 5 Business Units.

## Decision

1. **Daylight Architectural Aesthetic & Blonde Oak Finish**:
   - Shift from dark diorama to a bright, sun-drenched Scandinavian modern travel agency campus.
   - Warm directional sunlight, soft contact shadows, light blonde wood parquet, floor-to-ceiling glass looking onto distant mountain silhouettes, and living indoor greenery.

2. **Pipeline Pod Architecture for Massive Multi-Day Scale (50–100+ Leads)**:
   - Expand the floor into an architectural masterplan:
     - **Main Gate & Grand Reception**: Check-in and dispatch triage.
     - **VIP Hospitality & Cafe Atrium**: Coffee bar, leather armchairs, brochure lounge.
     - **5 Dedicated BU Wings (BU1–BU5)**: Separate consultation pods with multiple desks, customer booths, and dedicated BU KPI indicators.
   - Support temporal scaling (filtering today's leads vs multi-day backlog) so hundreds of leads can be monitored without visual clutter.

3. **In-Scene Live Interactive Chat (Core Gamification Loop)**:
   - Clicking any customer opens an active messaging console directly inside 3D.
   - Operators can type messages, send quick replies, and trigger instant 3D character reactions:
     - Speech bubble floats over consultant.
     - Customer animates happily.
     - Critical SLA timers (> 4h, > 12h) are immediately "rescued", resetting back to Green (< 1h) and increasing customer satisfaction points!

4. **Desk Hologram Pill & Zero-Collision Spatial Buffers**:
   - Rather than hiding critical operational context or stacking heavy billboards, each consultation desk features a sleek horizontal **Desk Hologram Pill** displaying: `[BU Tag] • Tour Name • SLA Timer • Live Chat Snippet`.
   - By adopting a **Spaced Campus Masterplan (72×48 units)** with a minimum 6–8m buffer zone between pods, these pills never overlap, remaining crystal-clear from any camera altitude.
   - **Elevated Indicator Stem**: Pills are elevated to `y = 4.0m` with a fine holographic stem line dropping to the desk, ensuring 100% unobstructed visibility of consultants and seated customers below.
   - **Hover-to-Expand Full Chat Popover**: Hovering over any desk pill smoothly expands it into a multi-message dialogue feed with zero click friction.

5. **1.7x Chunky Stylized Character Proportions & Staggered Pod Grid**:
   - Characters and furniture are scaled up by 1.7x to give them substantial game presence, clear expressive silhouettes, and visible typing/coffee-drinking animations.
   - Neighboring desks in each BU are staggered along both X and Z axes (e.g., `z = -2.2` and `z = +2.2`) so their projected isometric bounds never touch.

6. **Stationary Camera Dispatch & Multi-Day Temporal Scrubber**:
   - Clicking an entity opens the interactive chat console in-place without forcibly moving or zooming the camera, preserving the operator's bird's-eye situational awareness.
   - A multi-day time filter (`Hôm nay`, `Hôm qua`, `Tuần này`, `Tồn đọng`) dynamically isolates active shifts and multi-day backlogs across both 3D entities and the live activity ticker.

5. **RTS Roaming Camera Controller**:
   - Enable full unconstrained panning via mouse drag and keyboard WASD roaming.
   - Cursor-focused zoom allowing operators to smoothly fly into any desk or queue cluster.

6. **Interaction Aura & 1-1 Pairing Visualization**:
   - Distinct glowing floor circles and reciprocal hover highlights link each consultant with their currently active seated customer.

7. **Scalable Multi-Desk BU Suites with Dedicated Sub-Queues**:
   - Individual BU suites support dynamic staff capacity (e.g. 3 desks for BU1, 2 for BU2) paired with localized waiting lounges for upcoming queued clients.

3. **Spatial Hierarchy**:
   - **Open Lounge & Cafe Hub**: A vibrant, co-working style hospitality space where waiting leads sit with coffee, read brochures, and converse informally before being called.
   - **5 BU Workstation Clusters (BU1–BU5)**: Open consultation desks where sales consultants and seated customers engage in active travel consultations.

4. **Multi-Hour SLA Mood Engine**:
   - Customer entities transition through 4 emotional states based on tour sales response SLA:
     - **Normal (Happy/Neutral)**: < 1 hour.
     - **Impatient (Sốt ruột)**: 1 – 4 hours.
     - **Frustrated (Bực bội / Bốc hỏa)**: 4 – 12 hours.
     - **Critical / Abandoned (Bỏ rơi)**: > 12 hours.

5. **Bidirectional Control**:
   - Raycasting interaction allows clicking any consultant or customer entity to trigger the CRM's native conversation drawer.
   - Drag-and-drop mechanism allows dispatchers to physically reassign customers between desks in 3D.

6. **Procedural Stylized Low-Poly Geometry & Micro-Animations**:
   - Construct furniture, stylized Chibi characters, and props using Three.js procedural primitives (Box, Rounded Cylinder, Sphere) with soft PBR shadows. This achieves near-instant load (< 100ms) with zero external GLTF/network dependencies.
   - Implement subtle idle animations (breathing, typing on laptop, sipping coffee, checking watch) to maintain a vivid, living simulation.

7. **Camera Navigation & Quick-Jump Presets**:
   - OrbitControls with constrained isometric angles and zoom limits.
   - Quick-jump camera buttons for instant cinematic tweening to: Overview, Cafe Lounge, BU1, BU2, BU3, BU4, BU5.

8. **Sandboxed Frontend Prototyping**:
   - Developed as an isolated module driven by a synthetic event stream generator (`Mock Event Generator Bar`) before any production WebSocket wiring.

9. **Stationary Camera Dispatch & Non-Intrusive Console**:
   - Opening customer interactive chat preserves the operator's exact camera vantage point, altitude, and orientation, eliminating disorienting zoom-in/out friction.
   - Highlights the active consultation desk via a glowing sky-blue floor aura, with an optional "🎯 Định vị" action if the dispatcher explicitly wishes to focus in.

10. **Multi-Day Temporal & Multi-Dimensional Filtering**:
    - Provides a temporal ribbon (⚡ Hôm nay, 📅 Hôm qua, 🗓️ Tuần này, 🔥 Tồn đọng >4h, 📂 Tất cả) synchronized simultaneously across 3D entities, desk hologram badges, and the live activity ticker.
    - Accompanied by department (BU) selection and instant multi-field search (Customer name, Tour destination, Consultant name).

11. **Sleek Single-Row Executive Header & Elimination of Verbose Overlays**:
    - Purged bulky multi-line text and redundant floating control tutorials ("Điều khiển: Chuột Phải Kéo...").
    - Compressed the top navigation bar into a 48px executive glassmorphic ribbon combining: Brand capsule (`✨ FIT TOUR 3D`), clean single-line title, multi-day temporal filter ribbon, BU selector, search pill, and a unified telemetry stat capsule (`10 Sales Online • 14 Khách • 96% Hài lòng`).

12. **120×85 Architectural Realism & Glass Office Suites Masterplan**:
    - Transitioned from toy-like floating blocks to a spacious 120m × 85m corporate campus with realistic office architecture:
      - **Dedicated Glass Office Suites (BU1–BU5)**: Real 3.2m physical room envelopes featuring black aluminum mullions, eye-level frosted privacy bands, open entrance portals, and illuminated overhead acrylic signage plaques.
      - **Realistic Workstations**: Modern cantilever oak desks with black steel frames, acoustic felt modesty dividers, dual ultra-wide LED monitors displaying glowing CRM dashboards, mechanical keyboards, mobile 3-drawer under-desk pedestals, and ergonomic mesh swivel chairs.
      - **Grand Circulation Promenades & Greenery**: 10m-wide polished porcelain central boulevard flanked by indoor terrazzo planters with lush tropical foliage (Ficus / Monstera).
      - **Central Core Amenities**: Grand Reception Lobby (22×16m) with curved Italian Carrara marble counter and wood-batten feature wall; Cafe & Barista Atrium (22×16m) with espresso bar and plush sectional sofas; and an Executive Glass Boardroom (20×16m) with walnut conference table, 8 leather swivel armchairs, and 85" video wall.

13. **Elastic Responsive Header & Dynamic Spatial Occlusion Prevention**:
    - Header is engineered with CSS elasticity (`@media (max-width: 1440px)` and `< 1260px`): Auto-compacts padding, search bar width, and gracefully compresses textual badges (`10 Sales Online` ➔ `10 🟢`, `14 Khách` ➔ `14 👤`) preventing any horizontal overflow on 13–14" laptops.
    - Quick-Jump Camera Dock features an interactive toggle (`◀ / ▶`) that slides the rail into a non-intrusive edge tab, guaranteeing zero visual obstruction of BU1 desks.
    - Stationary "🎯 Định vị" camera action dynamically targets the character's real-time walking coordinates (`customer.mesh.position`) rather than static initial spawn points.

14. **Dedicated Full-Width Tour Line & Roomy Hologram Cards**:
    - Hologram pills expanded to 285px (345px on hover), introducing a dedicated `.holo-tour-row` (`TOUR [Destination]`) directly above the live dialogue bubble.
    - Completely eliminates truncation of long tour names (e.g. *Ai Cập Kim Tự Tháp*, *Ladakh Mùa Thu 9N8Đ*) while balancing BU badges and SLA timers into distinct header quadrants.

15. **Interactive Live Dispatch Locomotion & Zero-Dependency Web Audio Micro-SFX**:
    - **Physical Dispatch Workflow**: Dispatchers can reassign waiting lounge guests (c11–c14) directly into any BU suite (BU1–BU5) via one-click chips in the chat console. The 3D character immediately stands up and walks realistically into the room, sits at the desk, activates the glowing consultation aura, and receives an instant welcoming greeting from the assigned sales consultant.
    - **In-Browser Procedural Sound Synthesis**: Integrated pure Web Audio API synthesizer (0 KB external files) generating organic sine/triangle waves: soft bell chime (`880Hz ➔ 1320Hz`) on incoming chats, sparkling chord arpeggio (`C5-E5-G5-C6`) on SLA rescue, and purposeful upward swoosh on desk dispatch, complete with a persistent header toggle (`🔊 / 🔇`).

16. **Side-Callout Hologram Pill Architecture (Zero Character Occlusion)**:
    - **Problem**: In Three.js `CSS2DRenderer`, 2D elements default to `transform: translate(-50%, -50%)`, centering cards directly over 3D character coordinate anchors. In isometric projection (~45° down-angle), cards hung directly over avatars' bodies, hiding characters behind chat boxes.
    - **Solution**: Shifted `.desk-holo-pill` via `margin-left: 175px` and `margin-top: -30px` to float entirely on the **RIGHT** side of each character at eye/head level ($Y = 2.2\text{m}$).
    - **Visual Metaphor**: Added a left-pointing speech bubble arrow (`::before`) colored by BU accent (`var(--bu-accent)`), connected to a horizontal stem line and pulsing neon beacon dot (`::after`) hovering directly above the character's head.
    - **Dual Visibility**: Users can now see both the full animated 3D character (head, clothing, walking motion) on the left AND their active chat card on the right simultaneously.
    - **Hover Expansion**: On hover, `margin-left` expands to `210px` while `width` increases to `355px`, pinning the pointer arrow rock-solid to the character while expanding cleanly outward to the right to reveal the full conversation log.

17. **Smart Staggering & Compact LOD Mode**:
    - **Problem**: When multiple leads occupy the same BU suite simultaneously, right-floating cards collide and occlude adjacent text.
    - **Solution**: Dynamically calculate vertical step offsets ($Y = 2.05\text{m} + k \times 0.65\text{m}$) and horizontal offsets for collocated customers in the same BU pod, coupled with a Level-of-Detail toggle (`⚡ Rút gọn / 💬 Chi tiết`) allowing compact chip view vs expanded cards.

18. **Digital Luxury Environmental Architecture**:
    - **Visual Elevation**: Upgraded flat white floor plane to warm oak parquet hallways with realistic specular reflection, combined with signature acoustic BU carpet floor tiles (Navy BU1, Terracotta BU2, Royal Purple BU3, Emerald BU4, Amber BU5).
    - **Biophilic & Ambient Accents**: Integrated 3D procedural potted office plants (Monstera / Ficus) at corridor intersections, brass executive doorframes, and warm 3000K spotlights rọi directly down onto workstations.

19. **Real-Time Workload Heatmap Mode**:
    - **Dispatcher Telemetry**: Added an operational telemetry toggle (`🔥 Nhiệt Tải`) that scans customer queue depth per BU. Suites exceeding 3 active leads or with overdue inquiries pulse with an amber-red warning floor aura; suites with idle consultants and vacant desks illuminate in welcoming emerald green.

20. **Executive Dark / Night Command Mode**:
    - **24/7 Operations**: Introduced a dedicated dark theme toggle (`🌙 / ☀️`) shifting scene background to deep obsidian slate (`#0b0f19`), turning on workstation amber task lamps, and rendering glass mullions with luminescent sci-fi contours for command-center wall monitors.

21. **Stylized Entity Scale (2.2x Proportion Multiplier)**:
    - **Problem**: 2.05m tall characters on a 120m campus viewed from 85m away projected to only 10–14 pixels on screen, rendering humans virtually invisible and giving the illusion of "messages floating from ghosts in empty air".
    - **Solution**: Scaled character geometry by ~2.25x (head radius 1.25m, total height ~4.8m) matching golden-ratio isometric management games (The Sims, Two Point Campus), making human figures, postures, and apparel vividly prominent.

22. **Pedestal Glow Disc (Ground-Level Human Anchoring)**:
    - **Problem**: Characters blended into neutral floor surfaces without clear grounding.
    - **Solution**: Added a rotating glowing circular pedestal disc beneath every character's feet colored by their BU identity or triage state (Emerald = Idle/Ready, Amber = Impatient, Red = Overdue), immediately anchoring human presence to the floor plan.

23. **Tight Shoulder Callout & Unbreakable Head Stem**:
    - **Problem**: An excessive horizontal CSS offset (`margin-left: 175px–220px`) disconnected speech cards from entities, causing arrows to point into empty hallway space.
    - **Solution**: Reduced shoulder buffer offset to 46px (`margin-left: 188px` on 285px card leaves exactly 46px from avatar center), with stem lines and glowing beacon dots originating directly from the character's head anchor.

24. **Role-Distinct Rigging (Sales Headset vs Customer Backpack)**:
    - **Problem**: Lack of visual role differentiation between internal consultants and visiting clients.
    - **Solution**: Rigged Sales Consultants with formal BU-colored business suits and call-center headsets with microphone booms; rigged Customers with travel backpacks, relaxed casual clothing, and active standing/wandering animations.

25. **Executive Overview Camera & "Toàn Cảnh" Dock Preset (Command-Level Workspace Framing)**:
    - **Problem**: Close zoom (`38, 30, 38`) truncated BU1 and BU5, squishing all 14 leads into a crowded diagonal clump in the screen center and depriving managers of a comprehensive department overview.
    - **Solution**: Defaulted initial camera to `(75, 58, 75)` focusing at `(0, 0, 2)` (119m distance at 35° FOV), perfectly framing the entire 108m × 64m headquarters across all 5 BU pods and the central lounge. Added a dedicated `🌐 Toàn Cảnh` button in the camera dock and re-wired Reset to smoothly glide back to this panoramic bird's-eye view.

26. **Geometric SVG Speech Arrow & Anchor Beacon Pin (Unbreakable Head-to-Card Alignment)**:
    - **Problem**: CSS `::before`/`::after` pseudo-elements on the card could only draw static horizontal sticks that floated in mid-air when cards staggered or elevated, pointing away from avatars.
    - **Solution**: Introduced `.holo-entity-wrapper` where origin `(0, 0)` is strictly locked to the character's head ($Y = 4.15\text{m}$). Positioned a glowing circular target pin directly on the head, accompanied by an inline SVG tapered speech tail with a colored directional spine that connects directly into the card at `x = 48px`. When leads are clustered, the SVG arrow dynamically calculates diagonal vectors (`(0, 76) ➔ (52, 30)`), keeping every dialogue card unmistakably anchored to its human speaker.

## Consequences

- Unprecedented visibility into team workload and lead starvation.
- True-to-life architectural simulation that feels like a real corporate headquarters rather than a primitive game prototype.
- High-touch gamified operational control loop that makes lead dispatching delightful, fast, and tactile.
- Zero risk to production backend during development.
- Higher operational response speed to high-priority customer inquiries.
