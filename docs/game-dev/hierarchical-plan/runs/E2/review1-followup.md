# E2 — bổ sung sau review 1, 2026-11-18

Snapshot nền `35abb87ad1210baf1fb7cb90356823bc897f2cf7`; thay đổi chưa commit. SHA-256 byte thực trong worktree:

| Đầu vào | SHA-256 |
| --- | --- |
| scripts/world-map/render.mjs | f2b21bd8c1f97c4add46bc273df31e37041fa9c9c88b4629426484d4e15565ee |
| scripts/world-map/assemble.mjs | 68f126b14959bf6baab7d6c2d3a48351a4568c0ebc1b5b40abd905bab264bf5b |
| tests/world-map-render.test.mjs | 744774e9f90cbf1fe0fdcfd5db08fcaf19bd05ba561149963a5b24f8abd08e8a |
| tests/fixtures/world-map-render/manifest.json | fcc97c6053ac4936e7a45119bf8c4b1bc1b33a971c54e226918ed5169034c11a |
| tests/fixtures/world-map-render/reference.json | 942df3dcb0ac280c3b49b70442a55ba345ec7cf1de448e83ccb43fdbb0c701f8 |
| tests/fixtures/world-map-render/scene.json | 473bc8b50b006fc7f69f6f1b5e93b53b61a083b229efff5089c8b4d8953ead67 |
| tests/fixtures/world-map-render/public/art/sheet.png | 5a43ec1305804c9be3f99944cc19630ecb0839f0743c32deffd29357409efe54 |

Review .1: CLI dành riêng cả ba tên output trước khi ghi, từ chối file sẵn có và cố dọn các file lần gọi tạo nếu lỗi; nếu dọn thất bại thông báo rõ. Đây không phải giao dịch filesystem chống crash hoặc quan sát đồng thời; không dùng chung đích xuất giữa các tiến trình. Test chuẩn bị cho thành công, sidecar/debug tồn tại và không ghi đè.

Review .2: debug PNG có chú giải bitmap đánh số theo khung, gồm loại và nhãn; hỗ trợ terrain ID và grid qua loại `terrain`/`grid`, cùng world/display/footprint/warp/actor/collision/interaction. Clean PNG riêng. Nhãn dùng ASCII chữ, số, dấu cách và `.:/_-`; khung quá nhỏ, ngoài camera hoặc chồng lấn có thể che số: cần bố trí overlay QA phù hợp. Test chuẩn bị hai footprint cùng loại và so pixel chú giải. Không có kết quả kiểm trực quan.

Review .3: E1 chỉ kiểm physical sheet/reference/C6, không kiểm scene. Mọi output ghi `validation.status=component-only`, `sceneContract=pending`, kể cả scene scale/anchor khác reference. Interface tạm: bindings ánh xạ ID logic sang một ID sheet đã qua E1 và crop nguyên pixel tường minh; placements chứa layer/order, vị trí và anchor art-pixel; camera art-pixel và scale nguyên nearest. Không suy ra layout, unit conversion hoặc camera C6 từ gate E1. E3/E9 phải đối chiếu contract D2, map/unit, anchor/layer/order, camera/scale và full actor clearance trước production; không xem fixture C6 giả là phê duyệt thật.

Kiểm chứng: `Get-FileHash` đọc bytes đầu vào; `git diff --check` không báo lỗi nhưng không kiểm các file untracked. Chưa chạy renderer, test, hoặc lệnh tương đương vì verify chưa được người dùng xác nhận. Do đó không có output PNG/hash đầu ra thực hoặc PASS; test mới cũng chưa được xác nhận chạy. AC-1 vẫn thiếu bằng chứng output; AC-2 báo snapshot và kết quả kiểm tra thực tế cùng giới hạn tại đây. G-AC11/13 và Pipeline AC10 chưa được chứng minh từ fixture, production visual và tích hợp D2/E3/E9 pending. Báo cáo trước giữ nguyên.

Knowledge: áp dụng [k:01M7DE8V43RRQF5CG91ESM8A48], [k:01M7DE9PW92SQPTK2C258X2H1E], [k:01M7DE8TWTP94W08B6Q83D3HV8]. Candidate atlas [k:01M7MC38HN82YGG6EW6BMT9EK4] đã tồn tại; không thêm trùng. Không có phát hiện khác đủ bằng chứng mới để thêm.
