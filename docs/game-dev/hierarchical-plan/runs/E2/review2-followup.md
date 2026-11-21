# E2 — bổ sung sau review 2, 2026-11-18

Snapshot nền `35abb87ad1210baf1fb7cb90356823bc897f2cf7`; thay đổi E2 chưa commit. `Get-FileHash -Algorithm SHA256` đo bytes hiện tại:

| Tệp | SHA-256 |
| --- | --- |
| scripts/world-map/render.mjs | 04317a9536b0a0b2c4905ee2828579031189230e12bcabda143727d3ae7db46f |
| scripts/world-map/assemble.mjs | d470b9034a62f52fec233639f89fbd25138e9f567e16d48370543ae37f05373e |
| tests/world-map-render.test.mjs | 480dd3574132a5c45708e0e4c766e5f47348c4ab939824dd98829a2090ecdc58 |
| tests/fixtures/world-map-render/manifest.json | fcc97c6053ac4936e7a45119bf8c4b1bc1b33a971c54e226918ed5169034c11a |
| tests/fixtures/world-map-render/reference.json | 942df3dcb0ac280c3b49b70442a55ba345ec7cf1de448e83ccb43fdbb0c701f8 |
| tests/fixtures/world-map-render/scene.json | 473bc8b50b006fc7f69f6f1b5e93b53b61a083b229efff5089c8b4d8953ead67 |
| tests/fixtures/world-map-render/public/art/sheet.png | 5a43ec1305804c9be3f99944cc19630ecb0839f0743c32deffd29357409efe54 |

Finding .4: chuẩn bị dữ liệu scanline RGB và RGBA nhiều hàng, filter 0–4 và expected pixel viết riêng; kiểm từng cặp layer kề theo hai thứ tự đầu vào, order khác nhau và lỗi ghi sidecar có inject sau khi PNG thực sự được ghi. Injection chỉ qua tham số IO của `main`, mặc định CLI vẫn dùng filesystem Node. Test kiểm xóa các output của lượt và giữ file khác nguyên byte.

Finding .5: số trên ảnh chỉ vẽ khi khung giao camera và bị cắt trong giao; legend vẫn giữ đối tượng ngoài ảnh. Test chuẩn bị các trường hợp ngoài hoàn toàn, giao một phần và nằm trong camera, cùng clean pixels nguyên vẹn.

Kiểm chứng đã làm: đọc mã và đo hash đầu vào. `git diff --check` không báo lỗi nhưng các tệp E2 chưa được track nên không bao phủ chúng. Chưa chạy renderer, test hay lệnh tương đương vì verify chưa được xác nhận; các ca mới chưa có kết quả chạy. Chưa có PNG assembled/hash output được kiểm chứng: AC-1 chưa đạt bằng chứng, không khẳng định PASS. AC-2 có báo cáo snapshot, phép kiểm và giới hạn ở đây; các báo cáo lịch sử giữ nguyên.

Scene vẫn component-only: adapter bindings/crop là tạm thời; đối chiếu metadata D2 thực, đơn vị/map/anchor/layer/order, camera/scale C6 và full actor clearance còn cho E3/E9. Không suy ra Pipeline AC10 hoặc G-AC11/13 production từ fixture này. Kiểm thử và provenance sau tích hợp vẫn cần thực hiện trên snapshot được land. Xuất nhiều tệp có rollback lỗi đồng bộ nhưng không phải giao dịch chống crash hoặc cạnh tranh tiến trình.

Knowledge: áp dụng [k:01M7DE8V43RRQF5CG91ESM8A48]. Candidate [k:01M7MC38HN82YGG6EW6BMT9EK4] đã tồn tại cho binding atlas; không thêm trùng. Hai finding là lỗi và khoảng coverage cục bộ E2, chưa có bằng chứng quy tắc lặp lại mới để thêm knowledge.
