# Kế hoạch game và workflow game-dev

Kế hoạch điều phối hiện hành từ 16/11/2026: [cây task cha–con toàn game](hierarchical-plan/README.md),
gồm một phiếu tổng, tám nhóm và 54 task lá đã có yêu cầu, kế hoạch, tiêu chí và dependency.
Thực hiện từng task lá theo [thứ tự triển khai](hierarchical-plan/execution.md).
Các kế hoạch và ghi nhận bên dưới giữ làm nguồn lịch sử; trạng thái hiện tại đọc từ Bint.

Đồng bộ ngày 13/11/2026. Phiếu tổng: `01M78EYZ58EHGP3R83ZKVZ0AVH`.

- [Yêu cầu](requirement.md): mục tiêu, chức năng, 14 AC giữ nguyên và trách nhiệm playtest.
- [Kế hoạch](plan.md): hiện trạng, thiết kế game, sáu bước, kiến trúc đang có, milestone và nghiệm thu.
- [Công việc](tasks.md): giữ TSK-1..24 và checkbox lịch sử, thêm TSK-25..30 chưa hoàn thành.
- [Nguồn 301 câu đàm thoại tiếng Hoa](../learning-sources/301-conversation.md): bổ sung ngày 14/11/2026, kiểm kê PDF/MP3/video và đối chiếu với 12 tình huống hiện có; phần áp dụng đang ở mức kế hoạch biên soạn.
- [Hội thoại NPC đời thường](ambient-conversations.md): bản tích hợp đầu với bốn NPC, tám câu hỏi, nhận nhiều cách nói đúng ý, ba mức gợi ý và 42 voiceline tổng hợp.

Artifact của phiếu Bint là nguồn chuẩn. Ba tệp này là bản xuất đồng bộ; khi sửa tiếp, ghi qua
`bint task write` rồi cập nhật bản xuất cùng nội dung. `docs/bint-tasks-update.md` là bản tương thích
của tasks cho các liên kết/checkpoint cũ, cũng được đồng bộ trong lần này.

## Những điểm đã điều chỉnh

1. Bỏ mô tả repository trống; dùng `src/chapter/`, nội dung/asset và save hiện có, không dựng lại kiến trúc giả định.
2. Bổ sung vòng chơi ngắn/vòng một buổi, mục tiêu bảy ngày, lựa chọn khám phá, nhịp hỗ trợ,
   phản hồi tương tác, điều hướng và lý do dùng ba kỹ năng trong truyện.
3. Tách đầu ra đồ họa và nội dung: brief/ID/schema, asset tích hợp, nhánh hội thoại, audio và nguồn/license.
4. Cho tiếp tục phần game độc lập khi chờ nghiệm thu AI; các phần phụ thuộc và điều kiện phát hành vẫn giữ gate gốc.
5. Thay ước lượng dựng mới bằng lập phạm vi/ước lượng cho backlog còn lại.
6. Ghi nhận phiếu kỹ thuật ở worktree riêng, review 5 còn .27/.28; không nhận kết quả chưa tích hợp thành nghiệm thu tổng.
7. Người dùng tự playtest. Bỏ kiểm thử áp lực agent và chạy thử workflow có tính phí;
   lint, kiểm chứng kỹ thuật của Bint và review vẫn giữ.

## Dùng kế hoạch này với game-dev

Flow nguồn nằm ở `.bint/flows/game-dev.yml`, các skill nguồn ở `.bint/skills/game-*/`.
`bint sync` đã xuất skill điều phối `/game-dev` và sáu skill chuyên môn cho Codex.
Nếu phiên đang mở chưa nhận slash command mới, mở phiên mới hoặc dùng CLI Bint.

Sáu bước theo thứ tự:

| Bước | Skill | Role |
| --- | --- | --- |
| design | game-plan | planner |
| gameplay | game-core | implementer |
| art | game-art | implementer |
| content | game-content | implementer |
| polish | game-polish | implementer |
| review | game-review | reviewer |

Các role/model lấy từ `.bint/config.yml` hiện có, không cần thêm role mới.
Design luôn chạy để tiếp nhận kế hoạch; bước không có việc liên quan báo no-op.
Mỗi implement giữ verify; review chỉ đọc, vòng sửa quay về polish và có thể sửa mọi mảng trong scope.

Nên giao một lát cắt có thể chơi được hoặc một nhóm việc phụ thuộc nhau, ví dụ:

```text
/game-dev Theo docs/game-dev/plan.md và docs/game-dev/tasks.md, thực hiện lát cắt
nhà ăn thuộc TSK-25 và phần nhà ăn của TSK-26..28. Đọc phiếu nguồn
01M78EYZ58EHGP3R83ZKVZ0AVH và checkpoint mới nhất, giữ phần đã hoàn thành.
Không sửa phần đang do phiếu kỹ thuật 01M7A5E5VAK7KM5VWYPMF6T3GC phụ trách.
Chuẩn bị checklist để tôi tự playtest, không tự ghi kết quả playtest.
```

Hoặc khởi chạy tương đương qua CLI khi người dùng muốn bắt đầu công việc:

```powershell
bint run game-dev 'Theo docs/game-dev/plan.md và docs/game-dev/tasks.md, lập và thực hiện lát cắt nhà ăn TSK-25 và phần nhà ăn của TSK-26..28; kế thừa hiện trạng, giữ phạm vi riêng của phiếu kỹ thuật, bàn giao để tôi tự playtest.' --json
```

Đây là ví dụ sử dụng, chưa được chạy trong lần tạo workflow/cập nhật kế hoạch.
Phiếu tổng và phiếu kỹ thuật hiện có vẫn dùng b-do; không chuyển workflow giữa chừng,
không đưa ID phiếu cũ vào `bint run game-dev --task`.
Phiếu mới đọc nguồn và ánh xạ AC/TSK; không thừa kế tự động trạng thái met hoặc xác nhận lệnh verify.

## Trạng thái xác minh

Lint skill và flow kiểm cấu trúc, task lint strict kiểm hợp đồng v1.
Các kiểm này không gọi model, không chứng minh gameplay/AI đạt hoặc người dùng đã playtest.
Chưa chạy pressure tests, workflow smoke run hoặc playtest trong lần cập nhật này theo yêu cầu người dùng.
Không đổi cấu hình role/model, AC, workflow/state hoặc verify approval của các phiếu hiện có.
