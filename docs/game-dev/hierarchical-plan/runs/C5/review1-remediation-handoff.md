# C5 review 1 remediation handoff — 2026-11-18

Worktree HEAD `793447a27851ec914bb4258072c6730ad8e291db`; dirty tree includes the six delivered C4 dependency files and C5 changes. C4 files and historical handoffs were not edited in this remediation. No browser or production build was made.

`node scripts/world-map/dual-grid-build.mjs` exited 0 and printed `wrote 6 debug maps` after the fixes. Index SHA-256: `e1d936bcb62779289dbdb5e2d9bd246fd8a77114e7811f888f77f01fb55ca10d`. A separate PowerShell `Get-FileHash` comparison found all 22 input, atlas, mapping, display and PNG hashes in that index match the actual files. This checks current bytes, not reproducibility or a checkout after landing. Garden PNG was inspected at native 640×480; this is a diagnostic, not production preview or actor clearance.

Review findings .1–.5: macro positions are validated before projection; expected six IDs and unique fixed paths are required; verifier reconstructs display metadata and content from the hash-checked source/config and checks settings/counts; bridge decks occupy the full cell with rails only on declared edges; attributes preserve the bytes in hashed inputs and generated JSON/PNG. The two existing C7 attributes remain. Actual checkout/land on the target tree is still pending; attributes alone do not change pre-existing working files. Independent pixel expectations and negative fixtures have been added but **not run**.

| C5 criterion | Evidence and remaining debt |
| --- | --- |
| 1 | Six regenerated PNGs/JSON and actual hashes above; the test suite, two-export reproducibility, negative fixtures and post-land checkout are pending. No PASS claimed. |
| 2 | This separate handoff and index record actual source/code/artifact hashes and generation; historical reports remain unchanged. No product build claimed. |
| 3 | `source-ac-coverage.md`, guide supplement and pipeline README retain the nine-source-AC owner/evidence/debt matrix and pipeline decisions; source task status unchanged. |

The proposed `node --test tests/world-map.test.mjs tests/world-map-dual-grid.test.mjs tests/world-map-dual-grid-debug.test.mjs` remains unapproved and was not run. Core owns approval and verification. Earlier C1–C3 logical and C4 verification belong to their own snapshots; they do not verify this snapshot. C6 owns layout/camera/full actor bounds, C7 placement/schema, D2/E production assets/frames/runtime. G-AC-11/13 are addressed only by the diagnostic slice; no production clearance or playtest is asserted.

Knowledge: applied [k:01M7DE8V43RRQF5CG91ESM8A48], [k:01M7M9A2T3F8ZEF0A79XNV3NY8] and [k:01M7DE9PW92SQPTK2C258X2H1E]. No new candidate: raw-byte checkout and provenance pitfalls already have equivalent entries; review findings are specific to this implementation and unverified by tests.
