# C4 — terrain variants handoff

Task `01M7JGEJ3QZ9KY8998VP1QWE2V`; base `6f4efed1b724fe2832213e7e3f864bdea3bec2ed` (C3). This is a worktree delta, not a landed revision or production build.

## Inputs and generated snapshot

SHA-256 of actual Windows worktree bytes after the changes:

| Input or output | SHA-256 |
| --- | --- |
| `scripts/world-map/dual-grid.mjs` | `a9f35a1300af89e78afcfd4cd473736f6e70b4e209367143f7287c07e06aa77d` |
| `scripts/world-map/dual-grid-config.json` | `356f35f1a4ec7e1540d908b0aa9a216315e784a04d84fb6aac66de8ac90391c4` |
| `tests/world-map-dual-grid.test.mjs` | `3a4c65ff85f3bfafd8dd714d52ad1418e00d68e1cffc168af2efe0b6292ccb95` |
| `docs/game-dev/world-map-pipeline/snapshot.json` | `348264b88a36c4cbbe6bccaa51eee713d904a2d4cce1cda7118b6b7151692659` |

`node scripts/world-map/pipeline.mjs` regenerated the allowed snapshot, exit 0, reporting 6 maps and 1,800 cells. The snapshot diff changes only the two source hashes; no layout or C3 output changed. Source and config were written with Windows CRLF; the generator writes the snapshot with LF. Recheck the actual bytes after integration because checkout line endings may change the input hashes. `git diff --check` exited 0 with a Git line-ending warning for the generated snapshot.

## Contract and verification status

The selector hashes a versioned JSON array of seed, map, layer, integer coordinate, mask and variant-set ID; default integer weights are 70/20/10. It does not mutate the map or logical mask. The frame contract compares actual alpha values on all four edges and the logical mask, and returns a SHA-256 signature. Decoration requires that signature to match its frames, a world-coordinate anchor inside its bounds, and no intersection with supplied forbidden rectangles. The caller supplies complete forbidden zones and frame alpha; this is not a PNG decoder or a placement engine.

The test file contains independent SHA-256 known vectors, invalid-weight cases, a 10,000-coordinate distribution check, reverse traversal and module reload, frame mutations and forbidden-zone failures. These assertions have **not been run**. The proposed `node --test tests/world-map-dual-grid.test.mjs && node scripts/world-map/pipeline.mjs --check` awaits user confirmation through Core; no claim of a passing distribution, test suite or snapshot check is made. The SHA-256 vector constants were computed independently with .NET SHA-256 over the specified UTF-8 JSON arrays.

| Scope | Status |
| --- | --- |
| C4 AC-1 / Dual-Grid AC5–6 | Implementation and tests prepared; verification pending Core approval and execution. |
| C4 AC-2 | This report records actual input/output hashes, the generator result and limits. |
| G-AC11 | Partial offline contract only; no production art or game acceptance asserted. |

D2 owns the real atlas; E3/E9 must integrate the selector, decode real frame alpha, validate signatures and complete placement exclusion zones against real assets and scene constraints. PNG seams, renderer, production layout/camera/clearance and post-land provenance remain pending. Existing historical reports were not changed. Codegraph was queried against this checkout; external public repository documentation was not needed. Provenance and scope follow [k:01M7DE8V43RRQF5CG91ESM8A48], [k:01M7DE9PW92SQPTK2C258X2H1E] and [k:01M7M9A2T3F8ZEF0A79XNV3NY8].
