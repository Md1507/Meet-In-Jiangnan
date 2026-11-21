# C5 handoff — 18 November 2026

Checkout HEAD `793447a27851ec914bb4258072c6730ad8e291db`; dirty worktree includes six C4 files delivered by orchestrator and C5 changes. The C4 files are inputs, not C5-owned edits. No browser or production build was made. Node `v22.17.1`; `node scripts/world-map/dual-grid-build.mjs` exited 0 and printed `wrote 6 debug maps`. Earlier generation attempts failed first on the terrain/dual-grid obstacle naming difference and then on missing legend glyphs; both were logged through `bint task error`. The CLI reported runtime log saved but could not update the origin mirror due to access denial.

[index.json](../../../world-map-pipeline/dual-grid/index.json) SHA-256 `7e702ddef7d463aba5e4c0d8e004adaf35096c0ef4d984f9233134c65f617516` records actual raw source/config/code, atlas/mapping and each display/PNG digest. The index itself is not self-hashed. This is an offline diagnostic, not a production build or clearance. C4 selector is called with the recorded seed; the diagnostic atlas does not yet supply variant-specific art. The source 20×15 remains separate from the projected 40×30 and 41×31; candidate 32 art px to 48 world units awaits C6. Source graph and masks were not edited. The garden image was inspected at native size; human inspection of the other maps and comparative seam/port review remain pending.

| C5 criterion | Evidence and outstanding verification |
| --- | --- |
| 1 six reproducible debug outputs | Six files and index generated; renderer reads back serialized JSON, atlas PNG and mapping. Reproducibility, negative fixtures and overlay checks are authored in the C5 test but **not run**. Full acceptance remains pending. |
| 2 separate handoff and provenance | This report and index record actual inputs and the one successful generation, with no production build claim. Historical reports were not edited. Final validation result remains pending. |
| 3 coverage and guide | [Source AC coverage](source-ac-coverage.md), supplement and pipeline README document ownership and debt. Source task status is untouched. |

The proposed command `node --test tests/world-map.test.mjs tests/world-map-dual-grid.test.mjs tests/world-map-dual-grid-debug.test.mjs` was not run: Core reports it unapproved. No test PASS, reproducibility PASS or post-land integration is claimed. C1–C3 handoffs establish earlier logical results only; the C4 handoff reports its separately verified delivery, not verification of this checkout's C5 outputs. D2/E own production asset/frame/runtime checks, C6 owns layout/camera/full actor bounds and C7 placement/schema gate. No playtest or device validation was done.

The C5 tests need review and execution after approval; in particular, explicit independent coverage of all port directions, thin grids, seam alignment, nested metadata consistency and two exports remains required before claiming all planned checks. The renderer's bridge treatment is schematic; actual bridge/bank/shore and animation frames remain downstream. G-AC-11 and G-AC-13 are addressed only for this diagnostic slice, not accepted globally.

Knowledge: applied [k:01M7DE8V43RRQF5CG91ESM8A48] for actual hashes/history, [k:01M7DE9PW92SQPTK2C258X2H1E] for separating technical evidence from acceptance, and [k:01M7FG738VNZM1G78VR1V56569] for ports versus arrivals. No new entry: provenance and port pitfalls already exist; the obstacle-name mismatch is a local integration detail without a verified reusable rule beyond the existing implementation evidence.


