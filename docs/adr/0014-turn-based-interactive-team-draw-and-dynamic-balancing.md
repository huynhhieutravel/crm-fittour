# 0014. Turn-based Interactive Team Draw and Dynamic Balancing

Date: 2026-10-31

## Context

FIT TOUR Company Trip 2026 at Dalat organizes 28 active participants (excluding 4 organizing committee members) into 3 teambuilding competition squads:
1. Phượng Hoàng Lửa (Đội 1)
2. Đại Ngàn Xanh (Đội 2)
3. Vượt Sóng Tuyền Lâm (Đội 3)

Previously, squads were pre-calculated upon page load with full roster populated upfront. The company management requested an interactive turn-based draw experience where:
- Roster begins in an **Empty State** (0/10, 0/9, 0/9 members).
- Individual participants take turns spinning the wheel to determine their squad.
- User identity is automatically matched if logged into ERP, or selected from the remaining unassigned roster.
- Roster distribution must enforce dynamic constraints: balanced gender ratio (Nam/Nữ), uniform Business Unit (BU) cross-pollination, and avoidance of duplicate first names within the same squad.

## Decision

1. **State Initialization & Empty State**:
   - Squad rosters start empty.
   - Unassigned members are tracked in an active pool (`unassigned_pool` of 28 members).
   - Once a member spins and is assigned to a squad, they are removed from the unassigned pool and permanently added to the target squad.

2. **Visual & Interaction Mechanism**:
   - On both Mobile and Desktop, a central visual wheel renders the 3 squads with distinct brand color palettes (Red/Emerald/Sky).
   - The selected participant's avatar and nickname are featured in the wheel hub: *"Đang quay cho: [Avatar] [Tên] (@Nickname)"*.
   - When the spin button is triggered, the wheel animates with tick sounds and stops at the calculated target squad with celebratory confetti.

3. **Dynamic Constrained Balancing Algorithm**:
   - **Hard Quotas**:
     - Max squad capacity: 1 squad of 10 pax, 2 squads of 9 pax.
     - Max gender capacity per squad: hard cap of 5 males and 5 females per squad.
     - Squads that have reached their capacity for the current participant's gender are locked out (probability weight = 0).
   - **Soft Penalty Scoring**:
     - *Name Collision Penalty*: If a squad already has an individual sharing the participant's primary first name (e.g. "Hoàng", "Huy", "Hiếu", "Trang"), its assignment weight is heavily penalized (weight $\times 0.05$) to favor open squads.
     - *BU Uniformity*: Squads with fewer representatives from the participant's Business Unit receive higher probability weight to ensure inter-departmental bonding.

4. **Multi-device Shared State (Central Source of Truth)**:
   - To support participants accessing from both their personal mobile phones and the central stage screen, squad assignments are persisted to the server database / backend state (`/api/outing/teams`), ensuring instant multi-device synchronization without split-brain outcomes.
   - A fallback to browser `localStorage` is maintained for offline resilience.

## Status

Accepted.

## Consequences

- Participants experience genuine excitement and suspense during their personal spin.
- Squads remain strictly balanced in numbers, gender, and departmental distribution without human bias.
- Real-time synchronization guarantees that multiple participants cannot select or overwrite the same roster slot.

