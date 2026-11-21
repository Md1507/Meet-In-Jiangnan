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

## Dual-Grid diagnostic and production gates

Data for all six maps → display/debug validation → layout, camera and full actor bounds gate → shared asset library → production Map Renderer. [C5 supplement](dual-grid/guide-supplement.md) and [debug index](dual-grid/index.json) describe the diagnostic output and its provenance. The fixture is not production art or clearance evidence.

| Guide | Decision |
| --- | --- |
| 16px density, current camera/palette, midpoint seams, chunky low-contrast detail | Accept within existing project contracts |
| 16 masks per layer/pair, junction/bridge handling, silhouette and palette tuning | Adapt to project data and light |
| 24px, fixed shadows, 2–3 tile characters; 3–5 variants and animation/props | Defer changes; production variants follow C6/C7 gates |

Retain the five steps: world-plan, gameplay, art, polish and world-review. Retain the three components and their roles: Map Generator owns authoritative data; Image Generation receives an approved brief after the layout/camera gate; Map Renderer consumes data, manifest and approved assets. No role or model change is implied. Use native or integer-nearest inspection on large regions, corridors and seams; distribution checks do not replace human visual review.
