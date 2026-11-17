# Critical review — phố / Hẹn ở Giang Nam

> **Review correction:** Kiểm lại finding clearance, render có kiểm hash link, provenance và dependency snapshot được ghi bên dưới. Các đề xuất C/D/E vẫn cần orchestrator đối chiếu trạng thái live trước triển khai.

## Provenance và kết luận

Review đọc trực tiếp checkout donor `C:/Users/LENOVO/AppData/Local/bint/state/Game-fd2129962cbf/worktrees/01M7G4A8J4DQ4K797CFQ1MFR3D`, revision `446a24f803bfc685346ef9cdbfd906223283a5d8`. Checkout có thay đổi untracked ở kit phố; trạng thái và SHA-256 từng input được ghi trong [source-input-hash.json](source-input-hash.json). Nguồn origin khác revision/dirty được khóa riêng tại [additional-provenance.json](additional-provenance.json); trạng thái và dependencies live tại [live-dependencies.md](live-dependencies.md). Preview canonical có input digest `4a98fe05abf9d87a8dafb9ecb5934b5ece25d009fd93a4ec4a3bffc3651b99b8`.

Kết luận: pipeline hiện tạo một preview SVG data-derived có giá trị quan sát cấu trúc, route và footprint; overlay một điểm không chứng minh full actor clearance. Nó chưa phải pipeline bản đồ 2D pixel-based production: terrain là các `rect`/`path` SVG sinh từ Tile ID, buildings/props là SVG vector độc lập, không có PNG tileset/sprite, không có neighbor-mask autotiling, và assembler dùng `preserveAspectRatio="none"` cho mọi linked asset. `shape-rendering="crispEdges"` chỉ làm cạnh sắc trong raster preview.

Đã tự xem bốn ảnh [overlay 1×](evidence/verified-overlay-1x.png), [overlay 4×](evidence/verified-overlay-4x.png), [clean 1×](evidence/verified-clean-1x.png), [clean 4×](evidence/verified-clean-4x.png). Sharp/libvips rasterize SVG tại 320×240 và 1280×960; năm href được resolve từ vị trí SVG, đọc bytes và nhúng data URI trong bộ nhớ, không đổi artwork. Công cụ/version/hash từng input, link và output ở [verified-render.json](evidence/verified-render.json), script tái lập cùng thư mục. Clean là output `--no-overlay` đã có, không phải sửa vẽ. Raster debug không phải PNG production. Log planner xác nhận lệnh Chromium cũ nhưng không ghi resource load; không dùng ảnh cũ làm bằng chứng loading.

## A. Current Pipeline Assessment

- Canvas `320x240`, `viewBox 0 0 320 240`, `20x15` macro cells, `16px` terrain cell. Camera metadata là top-down orthographic, shallow 3/4 flattened, non-isometric.
- `assemble.mjs:20` vẽ một `rect` 16x16 cho từng số tile; `tileFill` chỉ có năm màu. Terrain linked asset được chèn sau lớp rect ở `assemble.mjs:22-29`, không phải spritesheet sampling.
- Linked assets đều là SVG. Terrain 320x240 cho footprint 20x15, buildings 80x64 cho footprint 5x4, props 16x16 cho footprint 1x1; các kích thước hiện khớp footprint ×16 nên chưa có bằng chứng méo tỉ lệ ở năm asset này; source SVG dùng primitives `rect`/`path` và `shape-rendering="crispEdges"`.
- Placement dùng tọa độ macro và layer terrain → architecture → architecture-detail/prop theo thứ tự JSON. Metadata giữ F(4,3), P(15,3), s(7,5), bike bay (12,2), entrances/interaction và bốn hai-cell edge ports.
- Manifest donor **đề xuất** 1 macro tile = 16 world-px, chưa được chứng minh tương thích runtime 48 world-unit; actor visual 16x45, collider 16x38, bottom-center anchors từ `src/chapter/app.ts:37` và `:185`. Đây là contract review, chưa chứng minh runtime đã nạp kit.
- Overlay canonical bật: grid, footprint, entrances, warp boxes và visual/collider actor bounds được thêm ở `assemble.mjs:31-47`. `--no-overlay` chỉ tạo clean structural output tạm.
- Đây là SVG debug/structural output. Nó không phải SVG embedding real pixel sprites, PNG blitting từ tileset, hay pixel tilemap renderer. Autotiling hiện là ánh xạ Tile ID → fill màu; không có outer/inner corners, T/cross, shoreline, bridge/bank hay 16-mask lookup.

## B. Problems Found

Chi tiết máy đọc được ở [findings.json](findings.json); mỗi finding phân facts/inference/pending và trỏ path:line.

### Critical

- **F-01:** Năm asset được manifest phố tham chiếu đều là SVG; trong `public/art/street-kit` không có PNG. Assembler chỉ phát `rect` và `<image>` tới năm SVG. Đây là khoảng cách định dạng production, không phải đánh giá thẩm mỹ.
- **F-02:** `preserveAspectRatio="none"` và width/height theo footprint làm mất native ratio/pixel density của asset nếu dimensions thay đổi. Contract mới phải giữ native pixels và nearest-neighbor integer scale.

### Major

- **F-03:** Không có adjacency/autotiling; Tile ID chỉ chọn màu.
- **F-04:** Preview canonical chứa overlay debug; clean visual output chưa là artifact canonical.
- **F-05:** Validator kiểm bytes/SHA, metadata, footprint, warp, walkability và connectivity nhưng không kiểm PNG, nearest sampling, stretch, atlas/mask coverage hoặc visual layer order.
- **F-05 bổ sung — mở rộng placement (fact và inference tĩnh):** `assemble.mjs:22-29` duyệt mảng placement và tìm asset theo ID, không hardcode số công trình khi vẽ; terrain không cần vẽ lại để thêm entry và placement. Tuy nhiên validator vẫn cố định một số asset/landmark bắt buộc (`validate.mjs:88-101`), kiểm metadata, bounds, warp và một số điều kiện route (`:106-131`, `:158-176`). Vòng `:114-117` chỉ `occupied.add` mà không kiểm ô đã có, nên không có kiểm từ chối chồng footprint tổng quát; terrain phủ toàn map và các layer có thể cố ý chồng, vì vậy hợp đồng mới cần phân biệt layer/loại va chạm thay vì cấm mọi overlap. Đây là phân tích mã, không chứng minh một placement cụ thể đã lọt toàn bộ validator. Hai source SHA-256 được khóa trong [inventory](source-input-hash.json): assembler `528681b27b9fef6b3a7ca3dad5e066593ddc679878c3dff8ffae0f87921fb3a4`, validator `71923ae5739d50e94a32416e3d37b22223f0c090671c1c663a45645756c6ed92`.
- **F-06 — full actor clearance thất bại theo contract donor:** `street-placement.json:20-27` mô tả collider 16×38 anchor (8,22), `asset-manifest.json:11` đề xuất 16 art px/macro; `validate.mjs:160-176` flood theo tâm ô. W/E rows 6–9 là [2,9,9,2], miệng y=112..144 cao 32: anchor cần ≥134 và ≤128, vô nghiệm. Tâm F(4,6), P(15,6), s(7,6) cho collider top=82 chồng ô cản hàng 5 đến y=96; ngay cả dịch anchor trong hàng 6 cũng không đủ. Fact này tái kiểm theo donor review .12, `src/chapter/app.ts:185` và các hash inventory; Core 10/10 và overlay một điểm không kiểm sweep. **Pending:** conversion art16/runtime48, camera và clearance được duyệt; không kết luận runtime hiện hữu đã lỗi. Giữ dữ liệu landmark/collider và sửa contract sau quyết định, không thu collider hay đổi layout.
- **F-07:** Ảnh render đã xem cho thấy trục đường hình chữ thập rõ, hai công trình cân hai bên; nửa dưới trống, lưới gạch và nét cỏ lặp đều, chuyển grass/path/stone cắt thẳng không có góc chuyển vật liệu. Mái teal dạng hình thang và facade phẳng đơn giản; cửa trái dễ nhận hơn cửa/hộc bên phải. Notice board nhỏ sát nhà trái, bike rack rất nhỏ cạnh nhà phải; tính tiếp cận thực chưa chứng minh vì F-06. Gợi ý phố dịch vụ nhưng còn thiếu đặc trưng campus Giang Nam đương đại và phân cấp vật liệu; không đủ kiểm tall-sprite occlusion. Nước vắng ở phố: N/A, garden cần shoreline/bridge riêng.

### Minor / pending

- **F-08:** Sáu map có trong tài liệu nguồn; sự đầy đủ của PNG library chung và runtime PNG renderer chưa được kiểm chứng toàn diện. Water/shoreline không xuất hiện trong ảnh phố đã xem nên kết quả visual water là N/A; năng lực garden và năm map còn lại phải được kiểm ở C/D/E.

## C. Components to Preserve

- `maps.json`/ASCII semantics, map and asset IDs, macro 20x15, tile semantics, landmarks, eight source warp records, interior arrival coordinates, spawn/NPC/interaction/quest/save contracts.
- Manifest provenance fields, SHA/bytes/license intent, placement footprints/anchors/layers, entrances, interaction cells and actor visual/collider source references.
- Validator checks for duplicate IDs/paths, actual bytes/SHA, source-map parity, in-bounds footprints, walkability, warp arrival interiority, point-cell entrance checks and connectivity; không coi các kiểm này chứng minh full actor clearance.
- SVG debug output as an audit view: it remains useful for grid, IDs, collision, footprint, warp and actor review after a PNG renderer exists.
- Camera/layout packet as a source for this street slice, not an approval of final art or full clearance. Applying [k:01M7DE9PM7AGR97AHC45J63GNW] means any final art still waits for layout/camera/clearance approval; this review does not approve a new route.

## D. Components to Replace

- Replace SVG primitive terrain export with production PNG terrain atlas/spritesheets containing real pixel texture and explicit native dimensions.
- Replace SVG building/prop files with transparent PNG sprites where production art is required; do not rasterize these placeholders and relabel the result.
- Replace Tile ID color lookup with an adjacency resolver that selects masks/variants for each material pair and bridge/bank case.
- Replace `preserveAspectRatio="none"` placement with a renderer that samples native pixels, uses nearest-neighbor integer display scaling, preserves alpha and records a ground anchor/occlusion order.
- Keep SVG/debug assembler as a separate output mode; add a clean PNG visual preview that has no grid, collider, warp, placeholder or debug overlay.

## E. Recommended Architecture

Use one shared data contract with separate layers: terrain, decoration/vegetation, structure, props, collision, interaction and warp. A manifest entry must carry unique ID, canonical path, native width/height, grid footprint, ground anchor, collision policy, render order, interaction metadata and variants, with no hardcoded asset count.

**Kiểm mở rộng đề xuất, chưa thực thi:** fixture thêm một shop/kiosk/decor bằng manifest entry hợp lệ và placement trên vùng được phép, không đổi terrain hay số lượng cố định, phải render và kiểm được; fixture đối chứng phải reject footprint structure/prop xung đột landmark hoặc route được bảo vệ, ngoài bounds, collision sai, lối vào/interaction không tiếp cận được hoặc không đủ full actor bounds. Chồng terrain nền hay layer trang trí được phép phải có policy rõ ràng. Kiểm cả thứ tự placement và sweep collider để không suy ra an toàn từ BFS tâm ô; không thêm công trình vào donor. Mapping: C7 `01M7JGEJRKKR7TMBKF5HN658D0` định nghĩa schema/policy; E1 `01M7JGEN60AFS7BX0MGZW6Z46G` kiểm entry/path/metadata; E2 `01M7JGENCSCQPQZFXBG61FT5ER` duyệt/render entry và thứ tự layer không hardcode; E3 `01M7JGENKNAFEX8T13MDDZNEZK` kiểm placement phố, landmark/route/access và full bounds theo contract C6. Đây là AC/fixture đề xuất cho các leaf hiện hữu, chưa sửa phiếu hoặc chứng minh implementation.

The renderer should convert macro/world/display explicitly: preserve 20x15 layout and runtime 48 world-unit semantics, keep terrain art at 16px native cells, and make any macro/detail expansion an explicit contract rather than an inferred scale. Draw terrain from PNG atlas frames with nearest-neighbor integer scaling; draw tall transparent sprites from a bottom-center/ground anchor, sorted by ground y and layer. Do not use anisotropic stretch.

For autotiling, use an adjacency mask resolver. A Dual-Grid implementation may use 16 corner masks per binary material pair, but it must declare coverage for each material pair, multi-material junctions and bridge/bank overlays; sixteen masks alone do not cover every material or bridge case. Support outer/inner corners, straight, T/cross, grass-path, grass-water/shoreline and bridge/bank as named cases with fixtures.

Produce two outputs from the same JSON/manifest/assets: (1) clean PNG visual preview for art QA, and (2) debug SVG or PNG with grid, IDs, collision, footprints, warp and interaction overlays. Runtime consumes the same PNG library directly; no gameplay or save rule changes are part of this handoff.

## F. Implementation Plan

1. **Replan C/D/E from this review.** Keep existing C1–C7, D1–D10 and E1–E9 IDs; reassess individual dependencies as below. Add this report as the review input; do not create a parallel tree or mark planned work as implemented.
2. **C — contract and grid first.** C1/C2 establish six-map input and mask resolver; C3/C4 close multi-material seams and deterministic variants; C5 keeps debug exports separate; C6 resolves 16px/48-world-unit/full actor clearance and camera gate; C7 defines manifest and six-map need matrix. C6/C7 are prerequisites for final art.
3. **D — production PNG library.** D1 preserves the street slice and resolves finding F-02 using C6. D2 supplies terrain atlas/masks and variants. D3 adds shared vegetation/props with exclusion zones. D4–D8 supply dorm/gate/library/canteen/garden assets while reusing the shared library. D9 handles actor sprites; D10 is UI-only. Every asset must have real bytes/hash/license and native-size QA.
4. **E — renderer and map exports.** E1 validates canonical paths and real asset bytes. E2 implements layer order, nearest sampling, anchor/occlusion and split clean/debug outputs. E3–E8 assemble each map from its JSON and manifest, checking routes, landmarks, ports, arrivals and full actor clearance. E9 integrates production assets into runtime with generation-safe loading and preserves gameplay contracts.
5. **Acceptance gates.** Do not call a map production-ready until clean PNG output has been rendered from PNG assets, debug output passes structural checks, source/build/manifest hashes agree, and layout/camera/full actor clearance evidence is present. Missing PNGs stay pending and are listed, never inferred.

### Six-map coverage and missing PNG library

| Map | Source coverage observed | PNG production status | Required next work |
| --- | --- | --- | --- |
| street | 20x15 layout, F/P/s, 8 warps, five SVG assets | Missing terrain/building/prop PNGs | D1, D2, E3 |
| dorm | 20x15 layout, 6 warps | No map-specific PNGs observed | D4, E4 |
| gate | 20x15 layout, 6 warps | No map-specific PNGs observed | D5, E5 |
| library | 20x15 layout, 8 warps | No map-specific PNGs observed | D6, E6 |
| canteen | 20x15 layout, 6 warps | No map-specific PNGs observed | D7, E7 |
| garden | 20x15 layout, 6 warps; water/bridge needs are layout requirements | No map-specific PNGs observed | C3, D8, E8 |

Missing PNG categories are therefore: shared terrain atlas and material-pair variants; street buildings and props; dorm, gate, library, canteen and garden structures; vegetation/props and bridge/bank/shoreline overlays; player/NPC production sprites if existing runtime art cannot satisfy C6/C7. No filename or asset is claimed present without a hash in the review inventory.

### Deep analysis record

**Assumptions and conflicts.** The donor packet calls the SVG slice “production-ready”, while direct file inspection proves it is SVG-only and overlay-canonical; the Task2 handoff requirement explicitly makes PNG the production format. The review treats the packet as structural input and flags the format claim as stale for the next phase. The source checkout is untracked in the donor worktree, so provenance is recorded as a snapshot, not as a landed product revision.

**Options and rationale.** Keeping SVG as production would preserve current assembly but cannot satisfy native PNG, pixel-density, atlas and direct game2D consumption requirements. Replacing everything with hand-authored per-map images would satisfy visuals but duplicate terrain and risk route drift. The chosen architecture keeps JSON/manifest/validator/SVG debug, adds a shared PNG atlas and data-driven renderer, and limits new art to missing asset entries.

**Impact.** C touches world-map data/mask/debug contracts; D touches shared PNG art and per-map asset entries; E touches loader/renderer/preview exports and runtime integration. Existing gameplay, save, quest, warp, spawn, NPC and interaction consumers remain interfaces to preserve.

**Risks and rollback.** Risks are native-size stretch, mask gaps at multi-material seams, tall-sprite occlusion, missing manifest provenance and stale async scene loads. Detect with C2–C7 fixtures, E1/E2 structural failures, six-map previews and E9 generation-token tests. Roll back by retaining the current SVG/debug path and reverting only the new PNG/renderer task patch; never rewrite maps or widen colliders to fit art.

**Test strategy.** Use C fixtures for all 16 masks, material pairs, corners, bridges/banks and deterministic variants; verify full actor visual/collider bounds at ports, entrances and bridges. Use E1/E2 tests for real byte/hash/dimension/path checks, nearest/integer scale, layer order, anchors, clean/debug separation and nonzero failure on missing inputs. Use E3–E9 per-map source/output hash, route/landmark/arrival/clearance checks and runtime loading/cancellation tests. Human palette and gameplay-scale review remain separate gates.

**Checklist.** AC-1 is covered by TSK-1, F-01/F-02/F-03/F-04/F-05 with path/line evidence; AC-2 by TSK-2 and render-evidence; AC-3 by TSK-3 and preserve/replace plus missing-library table; AC-4 by TSK-4 and C/D/E mapping; AC-5 by TSK-5 and provenance/scope record. Every planned task must retain a measurable done condition and a file scope that covers its output.

## Knowledge and MCP

- Applied `[k:01M7DE9PM7AGR97AHC45J63GNW]` for layout/camera/clearance before final art and `[k:01M7DE8V43RRQF5CG91ESM8A48]` for source/build/manifest/hash provenance. Đã đọc danh sách đầy đủ gồm candidate; không thêm tri thức: finding về cổng 32/collider 38 đã có trong review nguồn .12 và cần chốt conversion trước khi có quy tắc ổn định; provenance và gate đã có [k:01M7DE8V43RRQF5CG91ESM8A48], [k:01M7DE9PM7AGR97AHC45J63GNW].
- Codegraph cg_status và cg_explore qua Bint gateway dùng donor checkout trong inventory: 81 files, index 2026-11-15T18:26:08.922Z, báo 0 thay đổi; đã đối chiếu assembler và hashes trên đĩa. Backend node:sqlite; version MCP không được trả về. DeepWiki N/A vì assembler dùng Node built-ins, không cần tài liệu thư viện công khai. Orca 1.4.257 `orca open --json` thất bại runtime_open_timeout; Python alias cũ lỗi; đã dùng executable Python312 thật để kiểm môi trường và Sharp/libvips để rasterize độc lập; xem evidence mới. No MCP lookup is being presented as a verification result.
