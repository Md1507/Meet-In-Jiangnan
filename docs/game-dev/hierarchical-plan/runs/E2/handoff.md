# E2 — bàn giao công việc đang thực hiện

Snapshot nền `35abb87ad1210baf1fb7cb90356823bc897f2cf7`; các tệp E2 là thay đổi chưa commit trong worktree. Không có build hoặc output renderer đã được kiểm chứng. SHA-256 byte thực tại thời điểm bàn giao:

| Tệp | SHA-256 |
| --- | --- |
| scripts/world-map/render.mjs | 03cde0414aa21059af448dd072fc7fb055dd348a274a021c2d09f98505249fc6 |
| scripts/world-map/assemble.mjs | 8237497978ec63b4cb9598e56b0eaba5ff495172b90741961a2e1e777e81b324 |
| tests/world-map-render.test.mjs | b3f61dbddad3bc8bbd6db4cee23ad2f3850af930add636ad8557b0cfaFF6b82a |
| tests/fixtures/world-map-render/manifest.json | fcc97c6053ac4936e7a45119bf8c4b1bc1b33a971c54e226918ed5169034c11a |
| tests/fixtures/world-map-render/reference.json | 942df3dcb0ac280c3b49b70442a55ba345ec7cf1de448e83ccB43fdbb0c701f8 |
| tests/fixtures/world-map-render/scene.json | 473bc8b50b006fc7f69f6f1b5e93b53b61a083b229efff5089c8b4d8953ead67 |
| tests/fixtures/world-map-render/public/art/sheet.png | 5a43ec1305804c9be3f99944cc19630ecb0839f0743c32deffd29357409efe54 |

Fixture do `node tests/fixtures/world-map-render/create-fixture.mjs` tạo thành công; đây là tạo đầu vào, không phải chạy renderer hoặc test. Dữ liệu C6 giả trong fixture chỉ để kiểm component, không phải duyệt layout, clearance hay asset production. Python WindowsApps không khởi chạy được; lượt thử đã ghi task error. `node --test tests/world-map-render.test.mjs tests/world-map-assets.test.mjs` và lệnh tương đương chưa chạy vì cổng xác nhận của phiếu chưa mở. Không có kết quả PASS hoặc hash PNG đầu ra để báo.

Scene dùng tọa độ, anchor và camera nguyên theo art pixel; `scale` nguyên là nearest-neighbor đồng nhất. `bindings` ánh xạ ID logic sang ID sheet E1 và crop tường minh, không ngầm định thứ tự atlas. Đây là adapter tạm, cần đối chiếu contract D2 khi ổn định. Các layer hình dùng thứ tự cố định; cảnh báo collision/interaction/warp/actor là overlay riêng, nhãn và màu nằm trong sidecar, chưa được vẽ thành chữ trên ảnh. Không có chuyển đổi world↔art C6 tự động; consumer phải cung cấp tọa độ đúng. Hai file xuất PNG và sidecar dùng tạo độc quyền, nhưng nếu ghi sidecar thất bại thì PNG có thể còn lại mà không có provenance; cần xử lý trước khi sử dụng như công cụ production.

AC-1 E2 chưa thể nhận đạt: chưa chạy verify và chưa tạo, kiểm output; overlay còn thiếu nhãn trực tiếp trên ảnh. AC-2 có báo cáo snapshot và giới hạn tại đây, nhưng kết quả verify đang chờ Core. G-AC11/13 và Pipeline AC10 không được coi là đạt từ fixture; E3/E9 còn tích hợp ảnh thật, D2 atlas, chuyển đổi C6, camera và full actor clearance. Không sửa maps, collider, gameplay hoặc báo cáo lịch sử.

CodeGraph được gọi với đường dẫn checkout này; index có 13 tệp pending và query `loadAssets` không có kết quả, nên đối chiếu trực tiếp `asset-loader.mjs`, `asset-schema.mjs` và test E1. Không sync hoặc tạo index. Áp dụng [k:01M7DE8V43RRQF5CG91ESM8A48], [k:01M7DE9PW92SQPTK2C258X2H1E] và candidate [k:01M7MC38HN82YGG6EW6BMT9EK4]. Candidate atlas đã tồn tại, không thêm trùng; không có phát hiện khác đủ kiểm chứng để ghi knowledge mới.
