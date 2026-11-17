# C3 — bàn giao worktree

Baseline `5228d1d664a384e92506a43843df016080606226`; chưa land, không có build production. SHA-256 bytes thực sau sửa:

| Tệp | SHA-256 |
| --- | --- |
| `docs/game-dev/campus-network-v1/maps.json` | `08e23f643b455fc135ef23695bbb3e6aca18ae50bb6b54fc03a7371551818a1d` |
| `docs/game-dev/campus-network-v1/ascii-maps.md` | `9c20af8c85e1194b6a7783e073edf41e6a415c89a8b42ba78e48c5e32da70a95` |
| `scripts/world-map/dual-grid.mjs` | `2485542777bda8a73ccb709d8dc79074d7d9c197326d5d7bc773c7845246e0a5` |
| `scripts/world-map/dual-grid-config.json` | `1cbfa5a16f98aced55619134766cf39e8f59203dd4336cf0df38c04497389550` |
| `scripts/world-map/pipeline.mjs` | `5fd8372b00a5554976c915e1bd5f61527750772c6b421199eb8b8cbc140297a2` |
| `tests/world-map-dual-grid.test.mjs` | `56e1a3ade34d0592ae12fedfa4a02de0d9aebb42ed77c21e053317dba664d811` |
| `docs/game-dev/world-map-pipeline/snapshot.json` | `facee40259f99c8ee2f568bf3833742ec3afecb450c431a89af597aa3b3c2b07` |

Pipeline đã nối sampler chung world/halo vào display và material masks, lấy halo từ port đối ứng và ô cạnh port, xuất seam strips và cầu theo record/láng giềng. Cầu thiếu đầu nối hoặc topology rõ ràng trả pending. Không thay maps/ASCII, collision, warp hay route. 20x15 vẫn là layout nguồn; 10x8 chỉ là candidate downsample. Port biên khác arrival [k:01M7FG738VNZM1G78VR1V56569].

Core verify-1 đã được xác nhận chạy, 12/13 test qua; reciprocal seam thất bại `12 !== 18` ở test cũ, nên pipeline check sau dấu `&&` chưa chạy. Nguyên nhân: test phản chiếu bit mask phía đối ứng dù hai map cùng trục x/y. Ví dụ mask 12 (SW+SE) sau phản chiếu ngang thành 18 vì phép dịch cũ còn đưa bit ra ngoài bốn bit. Hai display ở cùng seam lấy cùng bốn ô theo thứ tự NW/NE/SE/SW: phía ngoài map nguồn được dịch sang biên đối ứng, không phản chiếu. Test mới dựng mẫu tham chiếu độc lập từ hai grid, so từng material/mask của cả hai display và seam strip pipeline, crop, tile port 9/approach 1 cùng hai ca halo thiếu/sai, trên 20 hướng. Không đổi production resolver hay dữ liệu nguồn để sửa phép so.

`node --test --test-name-pattern='reciprocal campus ports' tests/world-map-dual-grid.test.mjs` qua 1/1 sau sửa. `git diff --check` qua, có cảnh báo LF/CRLF. `node scripts/world-map/pipeline.mjs` đã tạo snapshot 6 map/1800 ô ở lượt trước; tạo artifact không phải kiểm thử. Core cần chạy lại lệnh verify đầy đủ đã xác nhận trên snapshot sau sửa; kết quả verify-1 và kiểm hẹp không chứng minh toàn bộ snapshot mới [k:01M7DE8V43RRQF5CG91ESM8A48].

AC-1 chưa có bằng chứng hoàn tất đầy đủ sau sửa: Core verify lại còn chờ; ASCII chỉ đánh dấu deck, không cung cấp lớp nước dưới cầu. Water underlay là giả định logic cần contract và asset xác nhận, không chứng minh hình học hoặc visual. AC-2 có báo cáo và hash hiện hành, không sửa báo cáo lịch sử. Không suy ra G-AC1/11 đã đạt: atlas PNG, renderer, visual và C6 full integration/human approval vẫn pending; C7 đã done/land nhưng chưa là bằng chứng renderer production. C4/C5 cần kiểm contract sau verify; C6/C7, D2/E2 cần kiểm scale, camera, clearance và asset thật riêng [k:01M7DE9PW92SQPTK2C258X2H1E].

Lượt resume xác nhận lại test hẹp reciprocal 1/1 và `git diff --check` không có lỗi (Git cảnh báo LF/CRLF); bảy SHA-256 ở bảng vẫn khớp bytes. Test hẹp không thay Core verify toàn bộ.

Knowledge: port/arrival và provenance đã có các mục trên; giả định water chưa đủ evidence. Đề xuất chưa lưu vì scope phiếu không cấp ghi knowledge: `bint knowledge add --origin agent --type warning --paths 'tests/world-map-dual-grid.test.mjs' --evidence 'tests/world-map-dual-grid.test.mjs:103-129' --evidence 'scripts/world-map/dual-grid.mjs:5-11' --title 'So seam đối ứng trong cùng hệ trục' 'Khi các map dùng cùng trục x/y, dựng bốn mẫu seam từ hai lưới theo cùng thứ tự NW/NE/SE/SW trước khi so mask; không tự phản chiếu bit chỉ vì hướng cổng đảo.' --json`.

## Review 2.5 — consumer và delivery

Core verify-2 trước sửa review2 qua 13/13 và snapshot check; không chứng minh phiên bản hiện tại. Finding .5 đúng: trước đó chỉ seam gọi resolveMaterials. Nay pipeline duyệt mọi display cell với cùng grid/halo trước khi xuất logical; resolver kiểm underlay và bridge bank/underlay có layer. Test hẹp `node --test --test-name-pattern='snapshot rejects missing interior material contracts' tests/world-map-dual-grid.test.mjs` PASS 1/1: bỏ water layer (đổi riêng bridge underlay trong test để đi tới ô nước), lần lượt bỏ grass-water và road-water pair, và underlay không khai báo đều bị từ chối. Không chạy command verify đầy đủ trong lượt này; Core chạy lại sau bàn giao.

Ba tệp source/config được chuẩn bị CRLF đồng nhất trước khi tái sinh snapshot. Mô phỏng trong Git repo tạm với `core.autocrlf=true`, add rồi checkout-index sang thư mục riêng: SHA-256 từng bản checkout trùng bytes của dual-grid.mjs, dual-grid-config.json, pipeline.mjs trong bảng. Đây là mô phỏng checkout Windows, không chứng minh bytes sau land thật; cần Core đối chiếu snapshot/provenance sau land. Snapshot tái sinh bằng `node scripts/world-map/pipeline.mjs`: 6 map/1800 cell; đây là tạo artifact, không phải verify. `git diff --check` không lỗi, cảnh báo snapshot LF sẽ chuyển CRLF; snapshot được parse JSON, không là input hash của chính nó.

AC-1 còn pending vì hai cầu nguồn 2x2 thiếu topology/đầu nối rõ và water underlay chưa được xác nhận từ nguồn; kiểm tự động mới chờ Core. AC-2 có hash bytes hiện tại và giới hạn nêu trên. Giữ nguyên báo cáo C1/C2; không suy ra PNG/renderer hoặc G-AC1/11 đã đạt. Knowledge: cảnh báo checkout đã có candidate [k:01M7M9A2T3F8ZEF0A79XNV3NY8], không thêm trùng; đề xuất seam chưa lưu ở trên vẫn ngoài scope ghi knowledge.

## Bổ sung bridge nguồn trước review 3

Các kết luận và hash hiện hành trong mục này thay cho hash và trạng thái cầu ở các mục trước; các kết quả verify cũ vẫn là lịch sử. `design.md` dòng 100, 151, 159–160 xác nhận tile 1 là mặt cầu qua kênh, nước X=5..6, hai cầu Y=3..4 và Y=7..8, hai đầu chạm đường. SHA-256 bytes design: `a9b20cd1b9fb6e572562eb32dd8b55cf78e245f007bcdf6ce254109587bce4ac`. Record ASCII và grid thực cho hai deck 2×2. Chọn thuật toán kiểm record hình chữ nhật đầy đủ, tile deck là road, hai đầu toàn bộ mặt cắt là road và hai cạnh dọc toàn bộ deck là water; chỉ nhận đúng một trục, thiếu hoặc mơ hồ trả pending. Đây là lựa chọn bảo thủ cho topology logic, không phải xác nhận visual hay asset. Underlay water dựa vào thiết kế kênh; rails chỉ ở cạnh ngoài, bank chỉ ở đầu nối. Hai cầu garden hiện logical trên consumer snapshot; một record không hợp lệ vẫn trả pending rõ.

SHA-256 bytes hiện tại:

| Tệp | SHA-256 |
| --- | --- |
| `docs/game-dev/campus-network-v1/maps.json` | `08e23f643b455fc135ef23695bbb3e6aca18ae50bb6b54fc03a7371551818a1d` |
| `docs/game-dev/campus-network-v1/ascii-maps.md` | `9c20af8c85e1194b6a7783e073edf41e6a415c89a8b42ba78e48c5e32da70a95` |
| `scripts/world-map/dual-grid.mjs` | `a9739f290ccb5a5ab585e748245cb68d53b47390a9390f64a8996d6894b12c63` |
| `scripts/world-map/dual-grid-config.json` | `1cbfa5a16f98aced55619134766cf39e8f59203dd4336cf0df38c04497389550` |
| `scripts/world-map/pipeline.mjs` | `5fd8372b00a5554976c915e1bd5f61527750772c6b421199eb8b8cbc140297a2` |
| `tests/world-map-dual-grid.test.mjs` | `5c517cf3d2b63c24e43be899582aff1fa148692991087567e20d6c8784ac6631` |
| `docs/game-dev/world-map-pipeline/snapshot.json` | `3cf0aa433a6d81e1b762cdf4c972e3166284d973685658f47ce56dc3a38010a2` |

`node --test --test-name-pattern='material junction|garden bridges' tests/world-map-dual-grid.test.mjs`: 2/2 PASS sau sửa; kiểm cả hai cầu nguồn, consumer snapshot, cầu dọc, thiếu ô/row/deck/bank/nước và layer. Các regression material/pair, seam, collision và route trước đó nằm trong Core verify-3 PASS trước sửa bridge; chưa coi là kiểm toàn bộ snapshot mới. `node scripts/world-map/pipeline.mjs` tái sinh snapshot 6 map/1800 ô; `git diff --check` không lỗi, có cảnh báo snapshot LF/CRLF. Chưa chạy lại verify đầy đủ: Core chạy command đã xác nhận sau bàn giao. Ba input source/config chuẩn CRLF, mô phỏng repo Git tạm `core.autocrlf=true` add/checkout-index cho cả ba file cho SHA-256 trùng bytes trên; cần đối chiếu sau land thực. Không đổi source gameplay, collision, layout, warp hoặc ASCII.

AC-1 tự đánh giá theo kiểm hẹp mới cùng bằng chứng Core verify-3 trước sửa; kết quả tích hợp toàn bộ sau sửa còn chờ Core. AC-2 có provenance và giới hạn ở đây. D2 atlas PNG, renderer E2, C6 full integration/human approval và clearance vẫn pending; không kết luận G-AC1/11 production. [k:01M7DE8V43RRQF5CG91ESM8A48]

Knowledge: đã đối chiếu danh sách toàn bộ gồm candidate; [k:01M7M9A2T3F8ZEF0A79XNV3NY8] đã ghi rủi ro checkout tương tự, không thêm trùng. Đề xuất seam chưa lưu ở mục trên vẫn có evidence và lệnh cụ thể; scope phiếu không cho ghi knowledge. Topology bridge ở đây là contract và lựa chọn cụ thể của C3 đã ghi trong code/test/report, không thêm mục chung khi chưa có phát hiện lặp lại độc lập.
