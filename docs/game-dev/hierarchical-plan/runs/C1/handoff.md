# C1 handoff — baseline parser and terrain package

This handoff covers only the C1 data contract. It preserves the historical
`maps.json`, `ascii-maps.md`, and existing reports byte-for-byte. The new
generator and snapshot are independent of the donor worktree and use paths
relative to this checkout.

## Inputs and provenance

| Artifact | SHA-256 |
| --- | --- |
| `docs/game-dev/campus-network-v1/maps.json` | `08e23f643b455fc135ef23695bbb3e6aca18ae50bb6b54fc03a7371551818a1d` |
| `docs/game-dev/campus-network-v1/ascii-maps.md` | `9c20af8c85e1194b6a7783e073edf41e6a415c89a8b42ba78e48c5e32da70a95` |
| `scripts/world-map/config.json` | `f3b1dbfa31878c2f973cd5884f9e0e52e13ee1b08d02ddd983aea146a2f996d3` |
| `scripts/world-map/pipeline.mjs` | `5998ef6f9fa55b036b18c4380fdf5ad08c51d74f41d83b81c40608734cf4c88e` |
| `docs/game-dev/world-map-pipeline/snapshot.json` | `23a9ad04f0783528f1156e56249b48077fb560c0156aad464c2cadbcebbda66d` |

The worktree was based on Git revision
`075ef95cebf3822f004037c74ae7a9ff4eabeee3`; the source/config/generator
hashes above identify the actual C1 files, including the uncommitted patch.

## Acceptance evidence

- **AC-1:** `node --test tests/world-map.test.mjs` — 5 tests passed. The
  snapshot reports 6 maps, 1,800 cells, 18 annotations, 20 directed graph
  edges, 40 warp objects, and 2 garden bridges. Each map has a 20×15 detail
  mask, a 10×8 macro mask at expansion 2, 16px terrain cells, inward road
  arrivals, and `asset: null`/`status: pending` metadata.
- **AC-2:** This handoff and `snapshot.json` record the input, config,
  generator, and output hashes. `node scripts/world-map/pipeline.mjs --check`
  passed against the current snapshot. The check is limited to offline data;
  it does not claim PNGs, autotile sprites, renderer/camera integration,
  collider/actor clearance, runtime warps, or human playtest.

## Reproduction

```powershell
node scripts/world-map/pipeline.mjs
node --test tests/world-map.test.mjs
node scripts/world-map/pipeline.mjs --check
```
