# Mẫu khu vườn ven kênh

Khu tiếp theo sau phố cửa hàng · bưu kiện trong vòng hiện hữu: **phố ← vườn → ký túc xá**. Mẫu được dựng sau khi người dùng yêu cầu tiếp tục sang khu mới; nhà ăn và phố vẫn là reference, chưa tích hợp runtime.

Feedback vườn/kênh của người dùng đã làm rõ các lỗi layout: cầu chưa nối hai bờ, cỏ cắt tuyến, pavilion thiếu lối vào, bố cục quá dàn ngang và cây chưa phân biệt hậu cảnh/collider. Theo guide v0.3, làm lại mặt bằng trước bằng [blockout](layout-blockout.svg); ảnh chi tiết hiện tại chỉ là study tham khảo.

Feedback bổ sung xác định lỗi camera của cầu: kênh ngang, cầu dọc vuông góc; mặt cầu phải đọc như mặt đi bộ top-down, vòm/lan can là lớp phụ nông, không phải mặt đứng chính diện. Quy tắc này nằm trong [review v0.3](../environment-art-review-v0.3-feedback.md) và áp dụng cho cầu thang/cổng/hành lang sau này.

## Hợp đồng cảnh

- Đường đá ngang phải nối tới cả mép trái và mép phải, cùng cao độ với phố; không đặt vật cản ở hai miệng nối.
- Kênh chạy song song ở phía trên đường, có bờ đá rõ. Cầu vòm chỉ nằm ở khu trên, có đường tiếp cận riêng và không được đọc thành đường chuyển khu chính.
- Liễu, bụi hoa, gốm và đá tạo bản sắc Giang Nam; pavilion kính, notice board và giá xe đạp gợi trường đại học 2026.
- Giữ khoảng trống đi bộ, NPC nhỏ và chân nhìn rõ; không thêm collider/runtime, ID, quest, save hoặc nội dung học.

Prompt đầy đủ ở [visual-target-prompt.txt](visual-target-prompt.txt). Quy tắc sáu khu và việc chỉnh mép đường sau cùng ở [world-connections.md](../world-connections.md).

## Kết quả mẫu đầu tiên

[Xem visual target](visual-target-1/generated.png). Ảnh được tạo bằng **Codex (local CLI)** qua Agent Sprite Forge, dùng mẫu phố làm reference phong cách. PNG thực tế `1672×941`, `3,058,855` byte, SHA-256 `c9d080b23d74338ec0da65d9a6fdad0dbaa43c8f3c99757169d9a6acb4715954`; receipt ở [job.json](visual-target-1/job.json).

Quan sát hiện tại: đường đá ngang và hai miệng nối đọc rõ; kênh song song, cầu nằm ngoài hành lang chính; pavilion kính, liễu, bồn gốm và cây tạo khác biệt với phố. Đây là đánh giá kỹ thuật của agent, chưa phải phản hồi duyệt art của người dùng. Đường và viền vẫn thuộc hạng mục chỉnh sau khi hoàn thành các khu còn lại theo [ghi nhận mép đường](../world-connections.md#ghi-nhận-từ-người-dùng--chỉnh-sau-khi-có-đủ-các-khu).

Giới hạn: ảnh là study kín nền, chưa tách actor/alpha, chưa chuẩn hóa pixel grid hoặc footprint/collider, chưa kiểm seam thực với phố hoặc ký túc xá trong build. Chưa sửa `public/art`, manifest, code, quest, save, ID hay Bint task.

Các lỗi layout trên chưa được xem là đã sửa trong ảnh chi tiết. Sau khi blockout được kiểm, sẽ tạo bản concept mới với cầu có hai đoạn tiếp cận, đường chính không bị cỏ chia cắt, lối pavilion nối vào mạng đường và lớp cảnh quan được phân vùng.

### Bản chỉnh theo v0.3

[Mở bản chỉnh](visual-target-v03-1/generated.png). Bản này đã gom kênh về một vùng trung tâm phía trên đường chính, đưa hai đầu cầu vào các đoạn đường/sân rõ, nối cửa pavilion với mạng đường và tách mảng cỏ khỏi tuyến chính. Đây là kiểm layout bằng mắt ở ảnh study; chưa chứng minh seam, collider hay chuyển scene trong game.

PNG thực tế `1671×941`, `3,243,590` byte theo receipt, SHA-256 `9eac36c4ada07eb295abb1f4bfb22d5a0513152c63ef434a6445fc44f67788d4`; prompt ở [layout-refinement-prompt.txt](layout-refinement-prompt.txt), receipt ở [job.json](visual-target-v03-1/job.json). Việc chỉnh mép đường tự nhiên vẫn để vòng cuối sau khi đủ sáu khu.

Prompt vòng tiếp theo đã khóa camera và bridge deck ở [camera-layout-refinement-v03-2.txt](camera-layout-refinement-v03-2.txt); ảnh v0.3-1 chưa được coi là đạt vì cầu còn cần kiểm top-plane, mặt đứng nông và hai đầu tiếp cận.
