# World-map data pipeline — C1 baseline

`pipeline.mjs` is a checkout-relative, data-only generator for the campus v1
maps. It reads `docs/game-dev/campus-network-v1/maps.json` and
`ascii-maps.md`, compares every `layout[y][x]`, and writes the deterministic
`snapshot.json` beside this document. The generator does not import a donor
checkout and does not produce art or runtime assets.

Run from the repository root:

```powershell
node scripts/world-map/pipeline.mjs
node --test tests/world-map.test.mjs
node scripts/world-map/pipeline.mjs --check
```

The snapshot carries SHA-256 values for both source files, `config.json`, and
the generator. Logical terrain uses a 16px tile, a 2×2 candidate macro mask,
cardinal/diagonal adjacency, and walkable IDs `0`, `1`, and `9`. Asset fields
remain `null` with `pending` status until a later art/renderer task supplies
production metadata.
