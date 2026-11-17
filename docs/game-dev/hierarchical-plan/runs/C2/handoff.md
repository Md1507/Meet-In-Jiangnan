# C2 — Dual-Grid data handoff

Task 01M7JGEHP0ARF9FZM5RJ9KKM82, worktree baseline `5a8ffb10af898f7c444e0dc53d8ec4950055523f`. This is an uncommitted source snapshot, not a production build. SHA-256 values below are bytes on disk; per-map values in `tests/fixtures/world-map-dual-grid/c1-hashes.json` hash compact JSON of the named data.

## Inputs and output

- maps.json: `08e23f643b455fc135ef23695bbb3e6aca18ae50bb6b54fc03a7371551818a1d`
- ascii-maps.md: `9c20af8c85e1194b6a7783e073edf41e6a415c89a8b42ba78e48c5e32da70a95`
- C1 config: `ba98c229e11f741eb35b14dc3c5ae1f156302472dc95f0e218da4a0dc31e0c67`
- C1 checkout pipeline before (planning capture): `2e0924d2964c7042e31fbbaac3d21d51c94ff15e853c237a5c03ed038034c854`; baseline Git blob bytes: `5998ef6f9fa55b036b18c4380fdf5ad08c51d74f41d83b81c40608734cf4c88e`; C2 pipeline: `d85630dac56abf4e54a2580892356ba3a400d4b8d101c0aba9d10911547b4b6c`
- Dual-Grid code: `3b6b618d42f2f5a315e030f747101d1d9e6ef2d153b2674e2699d8e6d7f6c226`; config: `bbfdee21274855be225fb645d190701301a688bfd209541dd4f591ccb3efbd32`.
- Canonical snapshot before: `235e71cafd0be139bae659be6dea12bcdb0a4cf67de147ef26db9295c1acc699`; after: `189c08e15dd18f42dc3c08ffe9bdeae0a804fcebc8dee0d684e008fbaa96b22b`. Regeneration was required because the generator and its output/provenance changed; the C1 snapshot also captured Git-style input hashes while this checkout has different line-ending bytes. No check was removed.
- C1 handoff unchanged: `bb001feff8b7e626ff6d159af5f6460da9344bc2ae52f14cc2858bba1a6c0853`.
- Review A–F origin inputs read-only: `pixel-map-review/implementation-handoff.md` SHA-256 `804e073228c8291025b20f7894fd13dce1bfe7e83d645ffddf17385212cc8668`, `review-report.md` SHA-256 `2f3192658c326a519a9db6b6ef1d4dce3ca00b258995f0846c3d4bd6e493ca37`. Their production PNG, material-pair, renderer and clearance gates remain downstream.

## Results and scope

The implementation provides corner sampling, sixteen logical atlas slots, isolated saddle components and four-cell updates per old/new material. The atlas slots are logical identifiers, not production PNG assets. Source warp validation checks tile 9, edge, facing and ASCII marker; this patch addresses the input issue behind C1 finding .1 but does not close that finding itself. The six 20×15 source layouts remain the original macro layout. The 10×8 expansion-2 masks are downsampled candidates, not an approved replacement; their hashes and the 20×15 layout/walkability/blocked hashes are recorded per map in the C1 fixture.

- Syntax checks: `node --check` on both implementation modules and both test files passed.
- Focused Node smoke: one old-to-new material replacement produced eight dirty records, old-layer parity and -8 origin; `checkSnapshot()` rebuilt and matched six maps. An independent hash comparison against the captured C1 fixture matched all six layout/walkable/blocked/candidate values.
- Confirmed Core verify `node --test tests/world-map.test.mjs tests/world-map-dual-grid.test.mjs` passed 10/10 tests, exit 0, at 2026-11-16 17:09:46 UTC (log `verify-1.log`; worktree fingerprint `7702058f4148d61ff62e5b1de8ab91eb`, tree `017ff1cd8454a0c992e8e87e3a73420cfbeab476`). It covered all masks, dirty/full parity, six-map hashes, snapshot consistency and warp regressions. This handoff was subsequently updated to record the result, so Core must verify the final worktree again; no later or full-suite PASS is claimed.
- AC1: the confirmed run passed the specified data checks. AC2: this handoff records inputs, verification and limits. Mapping is only C2 AC1/2, source 01M7FYN3NA9M6SGQCXF917ZD10 AC1/2, original G-AC11; no broader acceptance inferred.

C3 must validate boundary/halo/crop, port seams, material pairs and bridge/bank integration; C4 variants and D2 production atlas are separate. C6/C7 scale, camera, layout and full actor clearance, PNG production rendering, runtime/gameplay and human review remain pending. These offline data changes do not establish any of them. After integration, rerun the approved Core verification against the actual landed inputs and compare hashes.

