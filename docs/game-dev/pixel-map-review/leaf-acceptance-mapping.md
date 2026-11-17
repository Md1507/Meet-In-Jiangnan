# Đối chiếu AC từng leaf

AC trích nguyên ý từ plan origin được hash trong additional-provenance.json; ba phiếu C1/C6/C7 dùng requirement runtime mới nhất được hash. Các delta là đề xuất bổ sung, không thay phiếu hay nhận PASS. Scope/cạnh live ở implementation-handoff.md và live-dependencies.md.

## C1 — 01M7JGEHEY5Y1MB253HBZSW5NH

Nguồn: `C:\Users\LENOVO\AppData\Local\bint\state\Game-fd2129962cbf\runtime\tasks\01M7JGEHEY5Y1MB253HBZSW5NH\requirement.md`

- AC-1: Parser đối chiếu đủ 6x300 ô, 18 landmark, 20 cạnh có hướng, 40 warp và 2 cầu; macro/detail masks cùng terrain16px tái lập, unknown asset metadata để pending và gói chạy độc lập.
- AC-2: Có bàn giao riêng C1 ghi source/build hoặc hash đầu vào thực, kết quả kiểm chứng và giới hạn; chỉ đối chiếu AC trong phạm vi, giữ nguyên báo cáo lịch sử.


**Delta/test đề xuất:** parser sáu map parity và thiếu asset pending; kiểm source hash.

## C2 — 01M7JGEHP0ARF9FZM5RJ9KKM82

Nguồn: `D:\Project\Game\docs\game-dev\hierarchical-plan\tasks\C2.md`

- AC-1: Fixtures độc lập phủ 16 mask và atlas mapping; incremental bằng full rebuild, tọa độ offset -8 đúng, giữ nguyên hashes logic/collision của sáu map.
- AC-2: Có bàn giao riêng C2 ghi source/build hoặc hash đầu vào thực, kết quả kiểm chứng và giới hạn; chỉ đối chiếu AC trong phạm vi, giữ nguyên báo cáo lịch sử.


**Delta/test đề xuất:** mask adjacency 16 cases, incremental/full, không đổi logic/collision.

## C3 — 01M7JGEHWWVBN1YHAQ4EA5H92Z

Nguồn: `D:\Project\Game\docs\game-dev\hierarchical-plan\tasks\C3.md`

- AC-1: Biên1x1/1xN/Nx1 và 10 cặp cổng hai chiều không hở/crop lệch hoặc wrap; multi-material/bridge không bị nền mặc định che lỗi, collision và route nguồn giữ nguyên.
- AC-2: Có bàn giao riêng C3 ghi source/build hoặc hash đầu vào thực, kết quả kiểm chứng và giới hạn; chỉ đối chiếu AC trong phạm vi, giữ nguyên báo cáo lịch sử.


**Delta/test đề xuất:** seam đa vật liệu, shoreline/bridge và biên map; fixture hai chiều.

## C4 — 01M7JGEJ3QZ9KY8998VP1QWE2V

Nguồn: `D:\Project\Game\docs\game-dev\hierarchical-plan\tasks\C4.md`

- AC-1: Known vectors và10.000 tọa độ kiểm weights hợp lệ/phân bố trong ±3 điểm phần trăm; reload/traversal cho cùng kết quả, variant/frame không đổi edge-alpha silhouette hoặc masks logic.
- AC-2: Có bàn giao riêng C4 ghi source/build hoặc hash đầu vào thực, kết quả kiểm chứng và giới hạn; chỉ đối chiếu AC trong phạm vi, giữ nguyên báo cáo lịch sử.


**Delta/test đề xuất:** variant deterministic và edge alpha; known vectors.

## C5 — 01M7JGEJAPKMBMPT65MZD09PKG

Nguồn: `D:\Project\Game\docs\game-dev\hierarchical-plan\tasks\C5.md`

- AC-1: Sáu debug PNG và JSON/index tái lập từ đúng input/config/code/atlas hashes; missing atlas/underlay bị phát hiện; output ghi debug rõ và không được gọi production preview hoặc bằng chứng clearance.
- AC-2: Có bàn giao riêng C5 ghi source/build hoặc hash đầu vào thực, kết quả kiểm chứng và giới hạn; chỉ đối chiếu AC trong phạm vi, giữ nguyên báo cáo lịch sử.


**Delta/test đề xuất:** debug 6 map với grid/IDs/collision/warp/interaction, hash; không gọi clean production.

## C6 — 01M7JGEJHJ3AH22K3384TP7DGW

Nguồn: `C:\Users\LENOVO\AppData\Local\bint\state\Game-fd2129962cbf\runtime\tasks\01M7JGEJHJ3AH22K3384TP7DGW\requirement.md`

- AC-1: Có mapping đồng đều được kiểm cả full collider/visual trên cổng, cửa, cầu và 6 map; lỗi cổng32px không lọt38px bị test bắt; contract final-art có nguồn/phiên bản và bằng chứng duyệt phần thay đổi không gian trước sản xuất, thiếu duyệt giữ gate pending.
- AC-2: Có bàn giao riêng C6 ghi source/build hoặc hash đầu vào thực, kết quả kiểm chứng và giới hạn; chỉ đối chiếu AC trong phạm vi, giữ nguyên báo cáo lịch sử.


**Delta/test đề xuất:** art16/world48 conversion, sweep collider và camera approval; âm bản cổng32/actor38.

## C7 — 01M7JGEJRKKR7TMBKF5HN658D0

Nguồn: `C:\Users\LENOVO\AppData\Local\bint\state\Game-fd2129962cbf\runtime\tasks\01M7JGEJRKKR7TMBKF5HN658D0\requirement.md`

- AC-1: Có requirement matrix cho 6 map, schema reject thiếu metadata/duplicate ID/path/hash và số liệu chưa biết không giả; contract scale/layout đã duyệt là đầu vào bắt buộc của mọi task final-art.
- AC-2: Có bàn giao riêng C7 ghi source/build hoặc hash đầu vào thực, kết quả kiểm chứng và giới hạn; chỉ đối chiếu AC trong phạm vi, giữ nguyên báo cáo lịch sử.


**Delta/test đề xuất:** schema draft/production, unique path/ID, PNG/dimensions/anchor/variants/hash; negative fixtures.

## D1 — 01M7JGEJZE661T4SF5EMD5WYXS

Nguồn: `D:\Project\Game\docs\game-dev\hierarchical-plan\tasks\D1.md`

- AC-1: Finding .12 được kiểm full bounds và giải quyết theo C6; 5 asset hiện có hoặc phần thay thế được định danh, hash/bytes/alpha/anchor/footprint đồng bộ và assembler preview đọc đúng JSON/asset; source layout/gameplay không bị sửa để hợp art.
- AC-2: Có bàn giao riêng D1 ghi source/build hoặc hash đầu vào thực, kết quả kiểm chứng và giới hạn; chỉ đối chiếu AC trong phạm vi, giữ nguyên báo cáo lịch sử.


**Delta/test đề xuất:** street PNG thật và 5 IDs, F/P/s, port, full bounds; QA native/integer.

## D2 — 01M7JGEK6J09C3ST6A55GCQVVH

Nguồn: `D:\Project\Game\docs\game-dev\hierarchical-plan\tasks\D2.md`

- AC-1: Atlas production bao phủ mọi required mask/material pair trên 6 map, alpha/edge signature qua variant và frame hợp lệ, kích thước/mapping/hash/license đúng; có QA1x/integer zoom và phần thẩm mỹ chưa duyệt nêu rõ.
- AC-2: Có bàn giao riêng D2 ghi source/build hoặc hash đầu vào thực, kết quả kiểm chứng và giới hạn; chỉ đối chiếu AC trong phạm vi, giữ nguyên báo cáo lịch sử.


**Delta/test đề xuất:** atlas PNG thật, pair masks, corner/T/cross, shoreline/bridge, alpha và seams.

## D3 — 01M7JGEKDQYNJ34915JZQC9NKS

Nguồn: `D:\Project\Game\docs\game-dev\hierarchical-plan\tasks\D3.md`

- AC-1: Props có alpha/metadata/hash/license thực, không bake actor/UI/Hán tự; placement candidate vào vùng cấm bị validator loại, reuse có ID ổn định và không tự thêm collider.
- AC-2: Có bàn giao riêng D3 ghi source/build hoặc hash đầu vào thực, kết quả kiểm chứng và giới hạn; chỉ đối chiếu AC trong phạm vi, giữ nguyên báo cáo lịch sử.


**Delta/test đề xuất:** vegetation/props PNG alpha, anchor, exclusion, placement và full bounds.

## D4 — 01M7JGEKMYNVVH3EM7KPEVKK4S

Nguồn: `D:\Project\Game\docs\game-dev\hierarchical-plan\tasks\D4.md`

- AC-1: Bộ dorm có sprite production runtime-ready, dimensions/alpha/hash/bytes/provenance/license và QA kích thước dùng; footprint/entrance/clearance đúng layout đã duyệt, không thay bằng tranh kín nền.
- AC-2: Có bàn giao riêng D4 ghi source/build hoặc hash đầu vào thực, kết quả kiểm chứng và giới hạn; chỉ đối chiếu AC trong phạm vi, giữ nguyên báo cáo lịch sử.


**Delta/test đề xuất:** dorm PNG công trình theo landmark/entrance/footprint, parity và QA.

## D5 — 01M7JGEKW1CCBB7SYHNM6KCXXZ

Nguồn: `D:\Project\Game\docs\game-dev\hierarchical-plan\tasks\D5.md`

- AC-1: Bộ gate có sprite production runtime-ready, dimensions/alpha/hash/bytes/provenance/license và QA kích thước dùng; footprint/entrance/clearance đúng layout đã duyệt, không thay bằng tranh kín nền.
- AC-2: Có bàn giao riêng D5 ghi source/build hoặc hash đầu vào thực, kết quả kiểm chứng và giới hạn; chỉ đối chiếu AC trong phạm vi, giữ nguyên báo cáo lịch sử.


**Delta/test đề xuất:** gate PNG theo landmark/entrance/footprint, parity và QA.

## D6 — 01M7JGEM2ZFXYF39R8NG3N8CJG

Nguồn: `D:\Project\Game\docs\game-dev\hierarchical-plan\tasks\D6.md`

- AC-1: Bộ library có sprite production runtime-ready, dimensions/alpha/hash/bytes/provenance/license và QA kích thước dùng; footprint/entrance/clearance đúng layout đã duyệt, không thay bằng tranh kín nền.
- AC-2: Có bàn giao riêng D6 ghi source/build hoặc hash đầu vào thực, kết quả kiểm chứng và giới hạn; chỉ đối chiếu AC trong phạm vi, giữ nguyên báo cáo lịch sử.


**Delta/test đề xuất:** library PNG theo landmark/entrance/footprint, parity và QA.

## D7 — 01M7JGEM9V3KNNR9X93QJP3TKG

Nguồn: `D:\Project\Game\docs\game-dev\hierarchical-plan\tasks\D7.md`

- AC-1: Bộ canteen có sprite production runtime-ready, dimensions/alpha/hash/bytes/provenance/license và QA kích thước dùng; footprint/entrance/clearance đúng layout đã duyệt, không thay bằng tranh kín nền.
- AC-2: Có bàn giao riêng D7 ghi source/build hoặc hash đầu vào thực, kết quả kiểm chứng và giới hạn; chỉ đối chiếu AC trong phạm vi, giữ nguyên báo cáo lịch sử.


**Delta/test đề xuất:** canteen PNG theo landmark/entrance/footprint, parity và QA.

## D8 — 01M7JGEMH46E3C0EX73140XVQ8

Nguồn: `D:\Project\Game\docs\game-dev\hierarchical-plan\tasks\D8.md`

- AC-1: Bộ garden có sprite production runtime-ready, dimensions/alpha/hash/bytes/provenance/license và QA kích thước dùng; footprint/entrance/clearance đúng layout đã duyệt, không thay bằng tranh kín nền.
- AC-2: Có bàn giao riêng D8 ghi source/build hoặc hash đầu vào thực, kết quả kiểm chứng và giới hạn; chỉ đối chiếu AC trong phạm vi, giữ nguyên báo cáo lịch sử.


**Delta/test đề xuất:** garden PNG, water/shoreline/bridge, footprint và QA.

## D9 — 01M7JGEMR2W40MBMTP3HJW87DT

Nguồn: `D:\Project\Game\docs\game-dev\hierarchical-plan\tasks\D9.md`

- AC-1: Player và6 NPC đọc được ở scale đã chốt, frame/anchor/bounds metadata đủ; đứng/đi/tương tác không lệch chân hoặc cắt tại cổng, mọi thay đổi chỉ art và nguồn/license có căn cứ.
- AC-2: Có bàn giao riêng D9 ghi source/build hoặc hash đầu vào thực, kết quả kiểm chứng và giới hạn; chỉ đối chiếu AC trong phạm vi, giữ nguyên báo cáo lịch sử.


**Delta/test đề xuất:** PNG actor pivot, direction, bounds, full collider tại cửa/cổng/cầu.

## D10 — 01M7JGEMYT5EKFZFNMANFHTXWR

Nguồn: `D:\Project\Game\docs\game-dev\hierarchical-plan\tasks\D10.md`

- AC-1: 1280x720 không cắt Hán/pinyin/nút chính, bàn phím có focus rõ và đóng panel trả canvas; mức gợi ý, recorder/fallback state phân biệt được; screenshot/QA giới hạn thẩm mỹ nêu thật.
- AC-2: Có bàn giao riêng D10 ghi source/build hoặc hash đầu vào thực, kết quả kiểm chứng và giới hạn; chỉ đối chiếu AC trong phạm vi, giữ nguyên báo cáo lịch sử.


**Delta/test đề xuất:** UI riêng: readability và focus/scale, không áp đặt terrain requirement.

## E1 — 01M7JGEN60AFS7BX0MGZW6Z46G

Nguồn: `D:\Project\Game\docs\game-dev\hierarchical-plan\tasks\E1.md`

- AC-1: Loader resolve được bộ phố và shared library trong checkout tự đủ; missing/hash/dimension/path/duplicate/placement mismatch bị từ chối, không phụ thuộc đường dẫn máy donor.
- AC-2: Có bàn giao riêng E1 ghi source/build hoặc hash đầu vào thực, kết quả kiểm chứng và giới hạn; chỉ đối chiếu AC trong phạm vi, giữ nguyên báo cáo lịch sử.


**Delta/test đề xuất:** loader path/hash/dimensions/duplicate/missing PNG fixtures, không hardcode count.

## E2 — 01M7JGENCSCQPQZFXBG61FT5ER

Nguồn: `D:\Project\Game\docs\game-dev\hierarchical-plan\tasks\E2.md`

- AC-1: Một PNG fixture được dựng từ JSON+manifest+sprite thật, alpha/layer/camera/anchor đúng và lỗi input trả nonzero; mọi output có input/code/output hashes, không dùng ảnh gen độc lập làm assembled preview.
- AC-2: Có bàn giao riêng E2 ghi source/build hoặc hash đầu vào thực, kết quả kiểm chứng và giới hạn; chỉ đối chiếu AC trong phạm vi, giữ nguyên báo cáo lịch sử.


**Delta/test đề xuất:** renderer nearest integer, alpha, anchor/occlusion/layers, split clean/debug.

## E3 — 01M7JGENKNAFEX8T13MDDZNEZK

Nguồn: `D:\Project\Game\docs\game-dev\hierarchical-plan\tasks\E3.md`

- AC-1: Map street có preview/export dựng từ chính JSON/files đã giao, source/output hashes tái lập; asset references/route/clearance không thiếu, camera1x và grayscale QA có ghi kết quả, playtest runtime còn riêng.
- AC-2: Có bàn giao riêng E3 ghi source/build hoặc hash đầu vào thực, kết quả kiểm chứng và giới hạn; chỉ đối chiếu AC trong phạm vi, giữ nguyên báo cáo lịch sử.


**Delta/test đề xuất:** street PNG preview, F/P/s, ports và F-06 sweep.

## E4 — 01M7JGENTM7YS6FKJEMRQ711Q1

Nguồn: `D:\Project\Game\docs\game-dev\hierarchical-plan\tasks\E4.md`

- AC-1: Map dorm có preview/export dựng từ chính JSON/files đã giao, source/output hashes tái lập; asset references/route/clearance không thiếu, camera1x và grayscale QA có ghi kết quả, playtest runtime còn riêng.
- AC-2: Có bàn giao riêng E4 ghi source/build hoặc hash đầu vào thực, kết quả kiểm chứng và giới hạn; chỉ đối chiếu AC trong phạm vi, giữ nguyên báo cáo lịch sử.


**Delta/test đề xuất:** dorm PNG preview, spawn/NPC/port/route parity và sweep.

## E5 — 01M7JGEP1DYX2ZAE9JJRDZDXA8

Nguồn: `D:\Project\Game\docs\game-dev\hierarchical-plan\tasks\E5.md`

- AC-1: Map gate có preview/export dựng từ chính JSON/files đã giao, source/output hashes tái lập; asset references/route/clearance không thiếu, camera1x và grayscale QA có ghi kết quả, playtest runtime còn riêng.
- AC-2: Có bàn giao riêng E5 ghi source/build hoặc hash đầu vào thực, kết quả kiểm chứng và giới hạn; chỉ đối chiếu AC trong phạm vi, giữ nguyên báo cáo lịch sử.


**Delta/test đề xuất:** gate PNG preview, spawn/NPC/port/route parity và sweep.

## E6 — 01M7JGEP8DBGXME0Y2NA2C6CKA

Nguồn: `D:\Project\Game\docs\game-dev\hierarchical-plan\tasks\E6.md`

- AC-1: Map library có preview/export dựng từ chính JSON/files đã giao, source/output hashes tái lập; asset references/route/clearance không thiếu, camera1x và grayscale QA có ghi kết quả, playtest runtime còn riêng.
- AC-2: Có bàn giao riêng E6 ghi source/build hoặc hash đầu vào thực, kết quả kiểm chứng và giới hạn; chỉ đối chiếu AC trong phạm vi, giữ nguyên báo cáo lịch sử.


**Delta/test đề xuất:** library PNG preview, spawn/NPC/port/route parity và sweep.

## E7 — 01M7JGEPFDN5M065BK9ECQVX1R

Nguồn: `D:\Project\Game\docs\game-dev\hierarchical-plan\tasks\E7.md`

- AC-1: Map canteen có preview/export dựng từ chính JSON/files đã giao, source/output hashes tái lập; asset references/route/clearance không thiếu, camera1x và grayscale QA có ghi kết quả, playtest runtime còn riêng.
- AC-2: Có bàn giao riêng E7 ghi source/build hoặc hash đầu vào thực, kết quả kiểm chứng và giới hạn; chỉ đối chiếu AC trong phạm vi, giữ nguyên báo cáo lịch sử.


**Delta/test đề xuất:** canteen PNG preview, spawn/NPC/port/route parity và sweep.

## E8 — 01M7JGEPPTS7EFJ4HXFSCSWW4P

Nguồn: `D:\Project\Game\docs\game-dev\hierarchical-plan\tasks\E8.md`

- AC-1: Map garden có preview/export dựng từ chính JSON/files đã giao, source/output hashes tái lập; asset references/route/clearance không thiếu, camera1x và grayscale QA có ghi kết quả, playtest runtime còn riêng.
- AC-2: Có bàn giao riêng E8 ghi source/build hoặc hash đầu vào thực, kết quả kiểm chứng và giới hạn; chỉ đối chiếu AC trong phạm vi, giữ nguyên báo cáo lịch sử.


**Delta/test đề xuất:** garden PNG preview, shoreline/bridge và route/sweep.

## E9 — 01M7JGEPXW0BTSNBZ5QZB7TCRF

Nguồn: `D:\Project\Game\docs\game-dev\hierarchical-plan\tasks\E9.md`

- AC-1: Runtime nạp đủ 6 map và asset production trên build tự đủ,40 warp/input/camera/save giữ đúng; actor không xuyên/che sai vật cản, tải chậm/lỗi/callback cũ không ghi đè cảnh mới, offline manifest chứa tài nguyên cần.
- AC-2: Có bàn giao riêng E9 ghi source/build hoặc hash đầu vào thực, kết quả kiểm chứng và giới hạn; chỉ đối chiếu AC trong phạm vi, giữ nguyên báo cáo lịch sử.


**Delta/test đề xuất:** six-map offline/runtime, direct PNG, 40 warp, save/quest, stale-load integration.
