# TSK-26 — checklist gameplay và phản hồi

Revision kiểm tra: `35945386f74aa3d9df8564c7975cf4fd15d3023fd2d549868a76f273ac384fb3`

Bổ sung ngày 14/11/2026: chuyển vùng bằng cạnh màn hình có bằng chứng riêng ở
[`edge-transition.md`](../evidence/edge-transition.md); revision trên thuộc lượt
kiểm tra trước thay đổi này.

TSK-26 được đối chiếu trên chapter mặc định sau khi chạy lại `tests/chapter-evidence.mjs`.
Checklist này tách phần có bằng chứng tự động khỏi phần cần người chơi xác nhận cảm giác.

## Bằng chứng kỹ thuật

| Điều kiện | Kết quả | Bằng chứng |
| --- | --- | --- |
| Dấu hiệu tương tác khi ở gần NPC hoặc cạnh màn hình | Đạt | `#chapter-near` hiển thị `E · Nói chuyện với …` khi gần NPC và hướng dẫn đi tới cạnh màn hình để sang vùng kế tiếp; chuyển vùng xảy ra tự động khi chạm mép ngang. |
| Mục tiêu và bước hiện tại | Đạt | `#chapter-quests` hiển thị quest, bước `✓/○`, nhánh đang làm/chưa mở/luyện lại và hướng dẫn theo ngày. |
| E, focus và đóng panel | Đạt | Chapter runner đã qua di chuyển/E; `chapter.test.ts` và browser flow kiểm tra focus textarea khóa di chuyển, Esc/Đóng trả focus về canvas. |
| Chuyển vùng không kẹt vật cản | Đạt | `chapter.test.ts` kiểm tra đồ thị cửa nối và collider; kiểm tra chuyển vùng bằng cạnh màn hình được ghi riêng trong `docs/evidence/edge-transition.md`. Các gate revision cũ không được dùng làm bằng chứng cho thay đổi này. |
| Phản hồi đúng, sai, hủy và thử lại | Đạt | `src/chapter/app.ts` cập nhật `#chapter-feedback` cho kết quả luật, lỗi model, hủy và retry; browser flow kiểm tra retry/stale AI. |
| Reload không mất tiến trình, thưởng không lặp | Đạt | Case `chapter-complete`, `reward-once`, `separate-progress-reload` và `gate-m2.json`/`gate-m3.json` cùng revision. |

## Checklist playtest nhanh

Người dùng có thể mở build bằng `npm run dev -- --host 127.0.0.1`, giữ viewport
1280×720 và kiểm các bước sau. Ghi lại bước gây khó chịu hoặc không rõ, không tự
đánh dấu đạt nếu chưa thử bằng tay.

1. Từ ký túc đi tới NPC; xác nhận dòng `E · …` xuất hiện trước khi nhấn E. Giữ phím đi tới cạnh trái/phải để kiểm tra vùng kế tiếp tự mở, không cần nút chuyển vùng.
2. Mở và đóng hội thoại bằng `Esc` và nút `Đóng`; xác nhận focus quay lại canvas,
   phím di chuyển không chui vào textarea.
3. Gửi một câu đúng, một câu sai ý, bấm `Hủy AI`, rồi mở lại và thử tiếp; xác nhận
   phản hồi nói rõ bước còn thiếu và không nhận thưởng hai lần.
4. Đi tới cạnh trái/phải của sáu vùng; xác nhận không bị kẹt ở collider và dòng
   hướng dẫn gần cạnh cho biết tên vùng đích.
5. Tải lại sau khi hoàn thành một bước; xác nhận ngày, quest, vị trí và tiến bộ
   vẫn còn.

Phần đánh giá cảm giác, thời lượng chơi và phản hồi người dùng thuộc TSK-29; tài liệu
này không thay cho playtest người dùng, kiểm IME/mic vật lý hoặc rà tiếng Trung.
