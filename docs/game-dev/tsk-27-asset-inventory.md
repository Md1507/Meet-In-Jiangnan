# TSK-27 — asset inventory và viewport handoff

Revision đối chiếu: `35945386f74aa3d9df8564c7975cf4fd15d3023fd2d549868a76f273ac384fb3`.

Kiểm kê chi tiết đã có tại [asset-inventory.md](01M7AWMZ6C065JP5EHAZABVRFS/asset-inventory.md).
Đối chiếu với `src/content/mvp.json`, `src/chapter/app.ts`, `public/licenses/` và
`docs/evidence/gate-m3.json` cho thấy:

- Sáu scene SVG có path, SHA-256, kích thước 960×540 và license; manifest scene
  nối đủ vòng, asset được tải trong `changeScene`.
- Sáu NPC có nhãn tên/vai trò, vị trí và lịch; player/ambient giữ bounds và hitbox
  đã có. Dấu `E`, exit, objective, hint và feedback là HTML có focus-visible.
- Font Noto, dữ liệu Hanzi và audio local có license tương ứng; không có CDN asset.
- Runner chapter đã qua viewport 1280×720 và 1920×1080 cho pinyin, nét và dialog.

Các mục cần người xem trực tiếp vẫn được ghi rõ: nhận diện landmark dorm/library/
canteen, clipping chữ dài, cảm giác scale pixel và độ dễ đọc trên màn hình thật.
Đây là phần chuyển sang playtest, không tự coi kiểm tĩnh là đánh giá thẩm mỹ.
