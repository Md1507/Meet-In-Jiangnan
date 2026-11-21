# Dual-Grid guide supplement — C5 diagnostic

Source: the stored requirement/plan/tasks of 01M7FYN3NA9M6SGQCXF917ZD10; the pasted top-down guide is not a separate source file in this checkout. Existing project guides retain their original bytes. This supplement does not approve a camera, layout or final art.

| Decision | Guidance |
| --- | --- |
| Accept | Keep project 16px density, current camera and palette; place transition seams at edge midpoints, with no forced edge for masks 0 and 15. Deliberate chunky detail and low contrast support readability. Decoration is separate from collision. |
| Adapt | Use 16 masks per binary layer/material pair, allow empty mask to skip, and treat junctions and bridges separately. Use a two-pixel brush or individual pixels where silhouette requires it; adjust luminance, hue, saturation and shadows to the established palette and lighting. Do not insert grass between unrelated materials. |
| Defer | 24px tiles, fixed shadow direction and 2–3 tile characters are not project changes. Request 3–5 interior variants, production animation and props only after C6/C7 gates and D2/D3 delivery. |

Off-grid placement declares an integer anchor, coordinate space, layer, bounds and clearance; excludes doors, warps, bridges, NPCs and routes; has empty collision and creates no new collider. C4 owns synthetic contract fixtures; C6 owns full actor clearance, C7 schema and D3 actual placement. Unapproved placement remains pending.

Animation declares material/version, ordered frame IDs, durations and shared global phase. Every frame and variant must retain its logical mask and edge-alpha signature, including at ports. C4 validates synthetic frames; D2/D3 supply real frames and E checks them in the production renderer. No duration or production PNG is approved here.

Review large regions, corridors and seams at native 1× or integer nearest zoom, then inspect real variants for repetition and palette after the gate. C4 deterministic distribution is not an aesthetic review. Preserve layout, collision, gameplay and roles.

The C5 fixture is diagnostic only: world grid white, display grid violet, blocked cells red diagonals, port yellow, arrival cyan and bridge magenta. Source macro 20×15 expands to detail 40×30, display 41×31 and a 640×480 crop; display origin is (16u−8,16v−8). The 32 art px to 48 world unit relationship is a C6 candidate, not approval. Read [index](index.json) for actual hashes. No production pixels, seamless campus, full actor clearance or playtest is established by this fixture.
