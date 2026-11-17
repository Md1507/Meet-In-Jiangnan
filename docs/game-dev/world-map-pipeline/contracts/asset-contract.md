# C7 — contract khai báo asset (draft)

`asset-requirements.json` là inventory nhu cầu, không phải manifest runtime hay danh sách asset đã sản xuất. Mỗi ID nguồn đã biết là một entry `assets.id` riêng, giữ nguyên namespace cùng nơi dùng; `sourceIds` và `sourceManifests` giữ dấu vết. Nhu cầu không có ID nguồn (vegetation chung) có `sourceIds: []` và pending. Mỗi entry có nơi dùng và mô tả vị trí theo ASCII; nó không phải placement cuối. Các trường `null` chưa biết, `pending` chưa có bằng chứng; không suy số đo từ study. Không sao chép study làm production. Hai bản input data-only trong `C7inputs` giữ nguyên bytes và hash donor để kiểm đối chiếu; phải kiểm hash nguồn khi tích hợp.

## Ma trận đầu vào

Terrain ghi các cặp **macro ID kề cạnh** trong `maps.json`, bỏ ô warp 9; 0=cỏ, 1=đường, 2=cản, 3=nước theo ASCII. Đây là nhu cầu khảo sát, không khẳng định mỗi cặp là vật liệu hay atlas. Snapshot C1 đã land; đối chiếu tích hợp C1, variant, mask và terrain detail C2 còn chờ. Các ID architecture trong inventory bám chú giải landmark ASCII; cầu garden bám `=`; biển bám `s`. Vegetation là nhu cầu dùng chung dự kiến, vị trí chưa được duyệt. Các asset đều chưa có đường dẫn PNG, kích thước, license hoặc hash được xác minh; inventory không khẳng định không có PNG khác ngoài repository.

| Map | Cặp macro | Architecture | Vegetation | Props |
|---|---|---|---|---|
| dorm | 0-1, 0-2, 1-2 | residence, community | campus | wall-sign |
| gate | 0-1, 0-2, 1-2 | reception, information, gate-pillar | campus | wall-sign |
| library | 0-1, 0-2, 0-3, 1-2 | library, study-wing | campus | wall-sign |
| canteen | 0-1, 0-2, 1-2 | service, dining-hall | campus | wall-sign |
| street | 0-1, 0-2, 1-2 | food-stall, parcel-point | campus | wall-sign |
| garden | 0-1, 0-2, 0-3, 1-2, 1-3, 2-3 | pavilion, bridge | campus | wall-sign |

## Hợp đồng kiểm máy

`validateManifest(manifest, {root, production})` trả `errors`, `pending`, `gate`, `ready`. Inventory pending chỉ cho phép `null` ở trường chưa biết; thiếu key, giá trị sai kiểu, trùng ID/path/hash khác null đều là lỗi. Production bắt buộc tất cả trường: ID chữ thường với dấu gạch ngang, gạch dưới và namespace phân cách bằng dấu chấm; path PNG canonical dưới `public/art/`; size byte và SHA-256 thật; kích thước PNG nguyên dương; grid footprint nguyên dương; anchor tọa độ hữu hạn; collision `none` hoặc rectangle (offset, width, height); layer, thứ tự vẽ nguyên, interaction `none` hoặc reference; variants mảng (rỗng chỉ khi đã xác nhận không có); nguồn, license, placement, category, map dùng và ba trạng thái. `sourceStatus` phải `available`; runtime/preview có thể pending vì asset production không đồng nghĩa đã tích hợp.

Validator chỉ hỗ trợ PNG không interlace, RGB hoặc RGBA 8 bit, chứa duy nhất chunks IHDR, IDAT và IEND; kiểm thứ tự, CRC, giải nén toàn bộ scanline/filter, kích thước, bytes và digest. Indexed/palette, bit depth khác, interlace, mọi chunk khác (kể cả metadata) bị từ chối: producer cần xuất lại PNG RGB/RGBA 8 bit không interlace và bỏ chunks bổ sung. File hỏng có hash khớp vẫn bị từ chối. Consumer vẫn phải xác thực quan hệ variant khi tích hợp, duyệt theo ID nguồn, không giả định số công trình. Paths là tương đối repository và không được thoát root qua symlink. C6 gate đọc JSON từ tệp thật, đối chiếu digest với `sha256` và `expectedSha256` do consumer lấy từ snapshot được tin cậy; mọi `sourceInputs` ở top-level hoặc trong `scale/layout/camera/clearance` phải là object chứa hash đúng kiểu khớp `manifest.sourceInputs`, thiếu/sai kiểu là pending và khác hash là stale. Tệp phải có `scale`, `layout`, `camera`, `clearance`, mỗi mục có `status: approved` và `evidence` không rỗng. Consumer chịu trách nhiệm xác minh authority và tính hiện hành của expected digest/evidence; fixture tự tạo không là phê duyệt. Mọi task final-art và placement cuối phải dùng C6 đã duyệt và khớp snapshot, đồng thời kiểm actor bounds, đường đi, collider, spawn, exit, cầu và camera thực tế. Không thay gameplay để hợp art.

`maps.json`/ASCII vẫn là nguồn bố cục; warp `from_x/from_y` là port biên, `to_x/to_y` là arrival bên trong map đích, không dùng lẫn nhau. Tích hợp C1 phải đối chiếu tất cả ô, masks, landmarks, hai cầu, ports/arrivals và ID/variants với inventory này; không coi dữ liệu C7 là kết quả parser C1. Dual-Grid hiện chỉ cung cấp quy tắc material/mask và format key, chưa cung cấp variant PNG. C6 còn pending nên không có production PASS hay clearance.
