# C4 — review 1 fix update

Task `01M7JGEJ3QZ9KY8998VP1QWE2V`, base `6f4efed1b724fe2832213e7e3f864bdea3bec2ed`. This update records the worktree after review finding 1; the original handoff remains historical.

The weights and frame alpha validators now require every index to be an own property and each value to be a valid integer in its allowed range. Regression cases cover holes and inherited indices for both arrays, alongside the existing dense cases. These assertions have not been executed.

Actual SHA-256 of worktree bytes:

| File | SHA-256 |
| --- | --- |
| `scripts/world-map/dual-grid.mjs` | `74d8e01700f7c995dbe14171a2d7f74978cdab5d921be40e18da87644c34c901` |
| `scripts/world-map/dual-grid-config.json` | `356f35f1a4ec7e1540d908b0aa9a216315e784a04d84fb6aac66de8ac90391c4` |
| `tests/world-map-dual-grid.test.mjs` | `04d40d0547da462617634dcebe03ba3a13f2348e065925e5c3e5ec0ca89d2924` |
| `docs/game-dev/world-map-pipeline/snapshot.json` | `30621342074929d78c579838b63df3648ad0ad3540867a75188d1362fb5404c5` |

`node scripts/world-map/pipeline.mjs` regenerated the allowed snapshot, exit 0, reporting 6 maps and 1,800 cells. Its diff from baseline changes only the two source hashes; the code and config hashes above match its `dualGridSources`. `git diff --check` exited 0 with a Git warning that the LF snapshot will be converted to CRLF when Git next touches it. The source and test files use Windows CRLF; recheck actual source bytes and snapshot after integration.

C4 AC-1 remains pending: neither the test suite nor `pipeline.mjs --check` has been run after this fix; their proposed combined command awaits user confirmation through Core. The generator result does not establish their PASS. C4 AC-2 is supported by this report and the original handoff, limited to the actual worktree and the checks described here. Dual-Grid AC5/6 are covered only by the prepared offline contract and tests; G-AC11 production acceptance is not established. Real atlas/frame alpha, placement zones, renderer and post-land provenance still require D2/E3/E9 integration and checks. No historical report was edited. Applied provenance guidance [k:01M7DE8V43RRQF5CG91ESM8A48].

Knowledge: no new item. The sparse-array behavior is a general JavaScript language pitfall; the project-specific regression is recorded in the code and pending tests, without an independently verified new project contract.
