# TSK-25 — brief lát cắt sau nghiệm thu kỹ thuật

Revision tham chiếu: `9d99b727e51da8a86638fcffe3ddf5f1009a2811dfaa1ea21df8d2cca942cead`.

Brief này đối chiếu chapter hiện có với vòng chơi trong plan và làm hợp đồng cho
TSK-26..30. Nó không thay cho playtest người dùng, rà tiếng Trung hoặc corpus
game-intent đã deferred.

## Vòng chơi chuẩn

Mỗi ngày đi theo chuỗi: nhìn mục tiêu → đi tới NPC hoặc vật thể có dấu hiệu →
nhấn `E` → đọc/nghe ngữ cảnh → nói, gõ hoặc viết theo kỹ năng của bài → nhận
phản hồi chỉ rõ phần đúng/thiếu → quest và journal cập nhật → người chơi có thể
thử lại, đóng bảng hoặc lưu rồi tiếp tục. Lỗi model có đường gõ để tiếp tục;
đóng bảng giữ tiến độ đã ghi, nhưng không giữ câu chưa gửi. Không nhận thưởng lần hai.

## Đối chiếu bảy ngày

| Ngày | Quest hiện có | Hành động chính | Phản ứng và đường tiếp tục | Lựa chọn phụ |
| --- | --- | --- | --- | --- |
| 1 | `arrival`: `mentor`, `roommate`, `officer` | Chào hỏi, tự giới thiệu, nhận phòng | Chỉ rõ bước còn thiếu; sai câu vẫn mở hint/thử lại | Nói chuyện `chat` ở ký túc xá |
| 2 | `breakfast` tại `seller` | Gọi nước ở nhà ăn bằng biến thể đúng | NPC xác nhận món; thiếu slot chỉ rõ cần sửa | `eat` hoặc xem sổ tay |
| 3 | `classroom`: `mentor`, `officer` | Hỏi đường tới thư viện và giờ học | Chỉ bước tiếp theo; người chơi chọn mức gợi ý | `review` ở vườn |
| 4 | `shopping` tại `shopkeeper` | Hỏi giá và chọn số lượng bánh bao | Hai bước độc lập, hoàn thành đủ mới nhận thưởng | `errand` ở phố; luyện bài câu 5/6 |
| 5 | `delivery` tại `courier` | Nhận bưu kiện, hỏi lại thông tin | Sai ý không khóa quest; có thể nghe/gõ lại | `wrong_notice` sau điều kiện |
| 6 | chuẩn bị `welcome` | Ôn lời mời, chọn bài câu hoặc nét | Mentor gợi mục tiêu, không tự điền câu | `favor` ở phố |
| 7 | `welcome` tại `roommate` | Mời bạn và hoàn thành cuộc hẹn | Tổng kết kỹ năng và mở lịch ôn sau ngày 7 | `review` nếu còn bài đến hạn |

Các ID trên lấy trực tiếp từ `src/content/mvp.json`; không tạo ID song song.
`engine.ts` vẫn là nguồn quyết định quest/event/reward, còn model chỉ phân tích
biến thể và không được tự sửa state.

Ba mức hint được người chơi chọn và mở lại bất kỳ lúc nào; chưa có cơ chế tự
giảm hỗ trợ theo ngày. Ngày 6 chuẩn bị cả bài câu 10 và tự viết chữ 我 theo thứ
tự tùy chọn; ngày 7 vẫn phải gặp bạn để mời. Đối chiếu TSK-28:
[`tsk-28-content-audit.md`](tsk-28-content-audit.md).

## Bàn giao theo bước kế tiếp

- **TSK-26 gameplay:** rà dấu hiệu tương tác, objective, focus/đóng UI, collision
  khi đi qua sáu cửa và phản hồi đúng/sai/hủy. Bằng chứng: chapter runner + một
  checklist UI có scene/day/step.
- **TSK-27 art:** lập bảng asset ID/path/size/pivot/license cho sáu scene, NPC,
  icon hint và text viewport 1280×720. Không thay asset đã đạt chỉ vì khác style.
- **TSK-28 content:** kiểm nhánh vào/chưa đủ điều kiện/sai/hủy/đã xong của sáu
  quest; gắn 10 lesson và 20 chữ vào việc trong thế giới; giữ trạng thái rà
  ngôn ngữ là deferred.
- **TSK-29 polish/playtest:** bàn giao build revision này cùng checklist làm
  quen, nhà ăn, chương, ba kỹ năng và phục hồi. Chỉ ghi kết quả sau khi người
  dùng thực hiện.
- **TSK-30 closeout:** đối chiếu report gate, review task kỹ thuật và revision
  cuối; không land/approve thay người dùng.

## Phụ thuộc và giới hạn

TSK-26..28 có thể chạy độc lập trên mã hiện tại. TSK-29 cần bản build ổn định
sau các thay đổi đó. TSK-30 chỉ dùng report gắn đúng revision; corpus 60/40 và
human review vẫn là việc sau MVP theo `docs/mvp-gates.json`.
