# TSK-29 — playtest ngắn trên bản hiện tại

Trạng thái: **đã hoàn tất ở mức MVP** theo xác nhận của người dùng ngày
14/11/2026. Người dùng báo checklist đã thử và chấp nhận; không báo lỗi chặn.
Không có số đo thời lượng hoặc danh sách thiết bị được cung cấp.
Phiếu `01M78EYZ58EHGP3R83ZKVZ0AVH`, sau sửa TSK-28 ngày 14/11/2026.

Cơ chế chuyển vùng bằng cạnh màn hình được bổ sung sau lượt playtest đã chấp nhận.
PT-1 bên dưới mô tả điều khiển mới; bằng chứng tự động của thay đổi nằm tại
[`edge-transition.md`](../evidence/edge-transition.md), không thay thế xác nhận
playtest trước đó bằng một xác nhận mới.

## Mở và chọn điểm thử

Chạy `npx vite preview --host 127.0.0.1` tại thư mục dự án rồi mở địa chỉ terminal
in ra. Đây là bản production trong `dist`, không cần tải model để thử bằng gõ.
Revision và hash build/save/report được ghi trong
[`tsk28-snapshot.json`](../evidence/tsk28-snapshot.json).
Packet/manifest cũ trong thư mục playtest là lịch sử, không định danh bản này.

Trước khi nhập fixture, xuất save thật trong **Lưu & cài đặt → Xuất bản lưu JSON**,
hoặc thử bằng profile trình duyệt riêng. Nhập fixture sẽ thay save của profile đó.
Các điểm vào ở [`saves/`](../playtest/01M7AWMZ6C065JP5EHAZABVRFS/saves/).

## Checklist tối thiểu

| Ca | Save | Thao tác và kết quả cần quan sát |
| --- | --- | --- |
| PT-1 Làm quen | `new-game.json` | Đi WASD/mũi tên, tới NPC, E mở, Esc đóng; giữ hướng đi tới cạnh trái/phải để tự sang khu kế tiếp. Dòng mục tiêu giúp tìm đúng người; khi gõ thì nhân vật đứng yên. |
| PT-2 Sai → sửa → lưu | `canteen-before.json` | Tìm Vương a di, chủ đề gọi nước. Gửi `我不要热水。`, rồi `我想喝一杯热水。`. Câu đầu không qua; câu sau hoàn thành, vào sổ tay. Reload giữ tiến độ, luyện lại không tăng thưởng. |
| PT-3 Hướng dẫn vừa sửa | `arrival-partial-replay.json` | Đến mentor, chọn chào hỏi đã xong. Có nhãn luyện lại và hướng dẫn bước tiếp theo; chọn hint ít hơn rồi mở lại hint đầy đủ vẫn được. |
| PT-4 Chuẩn bị và kết thúc | `day6-preparation.json` | Mở bài lời mời, gửi `明天我们一起去吃饭吧。`; tự viết 我 bằng quiz. Sang ngày 7 và mời Tiểu Vũ. Nếu chỉ muốn thử kết thúc, dùng `day7-ending-ready.json`. |
| PT-5 Hình và khả năng đọc | Bất kỳ | Xem ở 1280×720: chữ Hán, pinyin và nút có đọc/bấm được không; chỉ rõ vùng hoặc bảng gây khó nhìn. |

Mic/IME đã có một phiên smoke thiết bị riêng với giới hạn ghi tại
[`device-evidence.md`](../device-evidence.md). Không bắt người dùng lặp toàn bộ
benchmark để đánh giá cảm giác chơi. Nếu thử mic/IME trong lượt này, ghi riêng
kết quả nghe lại và hai lần Enter chọn chữ/gửi; không coi playtest bằng gõ là
bằng chứng nói thật. Muốn kiểm toàn chương có thể bắt đầu từ new-game; thời
lượng chỉ ghi nếu người chơi thực đo.

## Gửi phản hồi

Chỉ cần ghi **PT số mấy → đã làm gì → thấy gì**, thêm ảnh nếu tiện. Nêu lỗi có
chặn tiếp tục hay vẫn làm tiếp được. Chưa thử ca nào thì để trống ca đó.

Phản hồi hiện tại không nêu lỗi cần tái hiện. TSK-29 được đóng ở mức MVP; phần
làm đẹp UI/đồ họa, bố cục và polish trực quan để giai đoạn sau. TSK-30 tiếp tục
đối chiếu gate nghiệm thu kỹ thuật còn mở.
