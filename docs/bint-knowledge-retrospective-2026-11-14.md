# Hồi cứu knowledge game-dev — 14/11/2026

Yêu cầu: kiểm tra skill game-dev và bổ sung lỗi lặp lại, quyết định quan trọng từ các lượt cũ. Lô nhập: `nguon:hoi-cuu-game-dev-2026-11-14`.

## Khả năng của game-dev

Skill [game-dev](../.agents/skills/game-dev/SKILL.md) được sinh bởi bint sync từ [flow](../.bint/flows/game-dev.yml).
Flow có design, gameplay, art, content, polish, review; chưa có bước thu thập bài học hay gọi knowledge add/evolve sau lượt chạy.
Sáu skill con trong .bint/skills đều yêu cầu truy xuất knowledge và cite mục đã dùng. Đây là hỗ trợ tiêu thụ knowledge; nó chưa tạo knowledge tự động.
Bước review ghi finding vào phiếu, không tự chuyển tất cả finding thành knowledge.

Đợt này áp dụng quy trình [b-knowledge](../.agents/skills/b-knowledge/SKILL.md) cho tài liệu bàn giao đã có và đối chiếu mã/tests hiện tại.
Không khởi chạy lại game-dev, không chỉnh skill sinh tự động, flow, trạng thái phiếu hoặc kết quả nghiệm thu.
Mỗi mục được ghi qua CLI với origin agent, phạm vi, bằng chứng có fingerprint và inputs; toàn bộ ở trạng thái candidate.
Theo b-knowledge: “mọi mục bạn ghi đều ở trạng thái candidate và chờ người duyệt”.

## Kết quả

13 mục: 8 warning, 4 decision, 1 rule. Nội dung gọn, mỗi mục có phạm vi cụ thể.
Những finding về lỗi đã sửa được chuyển thành cảnh báo phòng hồi quy, không tuyên bố lỗi cũ còn tồn tại.

| ID / loại | Nội dung | Finding lịch sử hoặc nguồn quyết định |
| --- | --- | --- |
| [01M7DE8SPS67YZ16W173G5F599](../.bint/knowledge/items/01M7DE8SPS67YZ16W173G5F599.md) · warning | Ràng buộc callback, timeout và kết quả AI với đúng phiên | `01M78EYZ58EHGP3R83ZKVZ0AVH.5`, `01M78EYZ58EHGP3R83ZKVZ0AVH.7`, `01M78EYZ58EHGP3R83ZKVZ0AVH.9`, `01M78GXHE4NMBKNHHNQ0A8QBN8.3`, `01M78GXHE4NMBKNHHNQ0A8QBN8.4`, `01M78GXHE4NMBKNHHNQ0A8QBN8.13` |
| [01M7DE8SYTEA9G9H5RQF1RE71N](../.bint/knowledge/items/01M7DE8SYTEA9G9H5RQF1RE71N.md) · warning | Khóa di chuyển ở cả keydown và ticker khi focus rời thế giới | `01M78GXHE4NMBKNHHNQ0A8QBN8.26` |
| [01M7DE8T5MC1DMSFDF09VXECC4](../.bint/knowledge/items/01M7DE8T5MC1DMSFDF09VXECC4.md) · warning | Giữ transcript gốc và phân loại nguồn bằng nội dung chưa chuẩn hóa | `01M78GXHE4NMBKNHHNQ0A8QBN8.7`, `01M78GXHE4NMBKNHHNQ0A8QBN8.14`, `01M78GXHE4NMBKNHHNQ0A8QBN8.20`, `01M78GXHE4NMBKNHHNQ0A8QBN8.24` |
| [01M7DE8TDEM1GC9NMVD5NP7WSS](../.bint/knowledge/items/01M7DE8TDEM1GC9NMVD5NP7WSS.md) · warning | Snapshot cũ không được xóa tiến bộ hoặc mở lại quyền thưởng của spike | `01M78GXHE4NMBKNHHNQ0A8QBN8.5`, `01M78GXHE4NMBKNHHNQ0A8QBN8.19`, `01M78GXHE4NMBKNHHNQ0A8QBN8.23` |
| [01M7DE8TNCFY9MP6C92REWAC7D](../.bint/knowledge/items/01M7DE8TNCFY9MP6C92REWAC7D.md) · warning | Cờ local-only không thay kiểm toàn vẹn runtime ONNX và cache | `01M78GXHE4NMBKNHHNQ0A8QBN8.2`, `01M78GXHE4NMBKNHHNQ0A8QBN8.15`, `01M78GXHE4NMBKNHHNQ0A8QBN8.16` |
| [01M7DE8TWTP94W08B6Q83D3HV8](../.bint/knowledge/items/01M7DE8TWTP94W08B6Q83D3HV8.md) · warning | Runner Windows phải truyền executable và argv riêng khi đường dẫn có dấu cách | `01M7AWMZ6C065JP5EHAZABVRFS.5`, `01M7AWMZ6C065JP5EHAZABVRFS.8` |
| [01M7DE8V43RRQF5CG91ESM8A48](../.bint/knowledge/items/01M7DE8V43RRQF5CG91ESM8A48.md) · warning | Gắn evidence với source, build và manifest thực; không đổi revision báo cáo cũ | `01M7A5E5VAK7KM5VWYPMF6T3GC.3`, `01M7A5E5VAK7KM5VWYPMF6T3GC.9`, `01M7A5E5VAK7KM5VWYPMF6T3GC.21`, `01M7A5E5VAK7KM5VWYPMF6T3GC.25`, `01M7C38XW37C4G9BP5073EG01M.4`, `01M7C38XW37C4G9BP5073EG01M.8`, `01M7C38XW37C4G9BP5073EG01M.9` |
| [01M7DE9NPMM5P28MAMGZZSWGFE](../.bint/knowledge/items/01M7DE9NPMM5P28MAMGZZSWGFE.md) · warning | Kiểm cả giá trị URL/header và coverage khi đánh giá privacy | `01M78EYZ58EHGP3R83ZKVZ0AVH.13`, `01M78EYZ58EHGP3R83ZKVZ0AVH.15`, `01M7A5E5VAK7KM5VWYPMF6T3GC.4`, `01M7A5E5VAK7KM5VWYPMF6T3GC.11`, `01M7A5E5VAK7KM5VWYPMF6T3GC.16`, `01M7A5E5VAK7KM5VWYPMF6T3GC.17` |
| [01M7DE9NXV29H337BAG6GCG5SE](../.bint/knowledge/items/01M7DE9NXV29H337BAG6GCG5SE.md) · decision | AI cục bộ chỉ gợi ý; engine quyết định tiến trình và phần thưởng | `docs/game-dev/requirement.md:46`, `src/chapter/app.ts:118`, `tests/chapter.test.ts:106` |
| [01M7DE9P5C6RTCYKGE9QMBBERM](../.bint/knowledge/items/01M7DE9P5C6RTCYKGE9QMBBERM.md) · decision | Đường chơi bằng bàn phím không được cộng tiến bộ luyện nói bằng âm thanh | `docs/game-dev/requirement.md:32-44`, `src/chapter/engine.ts:61-69`, `tests/chapter.test.ts:162-170` |
| [01M7DE9PCT1YVE7DNJPPSMR3T1](../.bint/knowledge/items/01M7DE9PCT1YVE7DNJPPSMR3T1.md) · decision | Sáu khu cùng campus; mạng v1 là thiết kế mới chưa tích hợp runtime | `docs/game-dev/art-studies/README.md:3-12`, `docs/game-dev/campus-network-v1/design.md:3-6`, `docs/game-dev/campus-network-v1/design.md:18-49` |
| [01M7DE9PM7AGR97AHC45J63GNW](../.bint/knowledge/items/01M7DE9PM7AGR97AHC45J63GNW.md) · rule | Duyệt layout và camera trước khi sản xuất environment art hoàn chỉnh | `hen-o-giang-nam-art-style-guide-v0.3.md:909-927`, `hen-o-giang-nam-art-style-guide-v0.3.md:941-951` |
| [01M7DE9PW92SQPTK2C258X2H1E](../.bint/knowledge/items/01M7DE9PW92SQPTK2C258X2H1E.md) · decision | Tách hoàn tất công cụ kỹ thuật, nghiệm thu game và kiểm thiết bị thật | `docs/evidence/cross-ticket-sync-01M7C38XW37C4G9BP5073EG01M.md:3-24`, `docs/evidence/cross-ticket-sync-01M7C38XW37C4G9BP5073EG01M.md:45-48` |

Finding lịch sử được đọc từ runtime/tasks/<task-id>/review.json trong state Bint trên máy.
Knowledge trỏ bằng chứng chính về mã/tests/tài liệu trong repository, không phụ thuộc việc lưu đường dẫn log ngoài repository.

## Kiểm chứng

- bint knowledge verify: 13 mục, 0 lỗi, 0 cảnh báo.
- bint knowledge list --json: 13 candidate, origin agent, cùng nhãn lô; mỗi mục có evidence và input.
- bint context "callback timeout transcript" --json: trả hai candidate liên quan, label reference, nhắc chưa duyệt.
- bint context --paths src/chapter/app.ts --json: entries rỗng trong phép thử này. Không khẳng định chỉ thêm candidate đã khiến hook đường dẫn tự chèn chúng.
- git check-ignore .bint/knowledge/items/<id>.md: bị ignore bởi /.bint/ trong .gitignore. Knowledge đã lưu local; chưa đổi chính sách Git của repository.

Để duyệt các mục, người dùng chạy `bint knowledge review`.
Đợt này chỉ hoàn thành việc thêm candidate và kiểm chứng nội dung, chưa duyệt hay publish quy tắc vào AGENTS.md.

## Những điều bỏ hoặc giới hạn

- Không chép nguyên finding cũ về thiếu package/runner/asset thành lỗi hiện tại: nhiều phần đã triển khai và sửa.
- Không dùng checkpoint cũ trong handoff để kết luận gate hiện tại còn mở hoặc đã đạt; giữ quyết định tách phạm vi nghiệm thu.
- Không chuyển EPERM của sandbox hoặc state chỉ đọc trong phiên trước thành lỗi sản phẩm hay nguyên nhân đã chứng minh của toàn bộ lịch sử knowledge trống.
- Không ghi thư mục, danh sách framework hoặc thông lệ chung thành knowledge.
- Giới hạn bài học hợp nhất SaveStore ở spike M0/M1; chapter có schema và cơ chế revision riêng, không suy quy tắc hợp nhất tiến trình cho mọi loại dữ liệu.
- Campus network v1 là định hướng layout mới; chưa coi việc kiểm dữ liệu là đã đổi runtime hay duyệt mọi concept v0.3.
- Chưa hồi cứu từng dòng mọi log agent hoặc toàn bộ art guide; đã ưu tiên finding lặp nhiều vòng, tài liệu bàn giao và quyết định liên quan trực tiếp.
