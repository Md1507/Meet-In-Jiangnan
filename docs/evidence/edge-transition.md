# Chuyển khu bằng cạnh màn hình — 14/11/2026

Yêu cầu: đi tới cạnh màn hình để sang khu liền kề, thay cho nút chuyển khu.
QoL liên quan được để lại cho đợt sau.

## Hành vi hiện tại

- Đi bằng WASD hoặc phím mũi tên tới cạnh trái/phải để tự chuyển khu.
- Không còn cụm nút `#chapter-exits`; phím E chỉ tương tác NPC.
- Hai lối ra dùng thứ tự hiện có trong nội dung: `exits[0]` là trái,
  `exits[1]` là phải. Cạnh trên/dưới vẫn là biên va chạm.
- Khi đang tải cảnh, khóa di chuyển và E, xóa phím giữ cùng chỉ dẫn NPC cũ.
  Token cảnh ngăn lượt tải cũ mở khóa một lượt tải mới hơn.
- Cảnh mới dùng spawn sẵn có; giữ nguyên save/schema, collider, tiến trình và
  luật phần thưởng. Chưa bổ sung xuất hiện từ mép đối diện, hiệu ứng chuyển cảnh
  hay tiếp tục đi bằng phím đang giữ; muốn đi tiếp thì thả và nhấn lại.

| Khu hiện tại | Cạnh trái | Cạnh phải |
| --- | --- | --- |
| Ký túc | Vườn | Cổng trường |
| Cổng trường | Ký túc | Thư viện |
| Thư viện | Cổng trường | Nhà ăn |
| Nhà ăn | Thư viện | Phố |
| Phố | Nhà ăn | Vườn |
| Vườn | Phố | Ký túc |

## Kiểm chứng

| Kiểm tra | Kết quả | Bằng chứng |
| --- | --- | --- |
| `npm run typecheck` | PASS | Chạy trước build cuối |
| `node --experimental-strip-types tests/chapter.test.ts` | 17/17 PASS | [Log unit](edge-transition-unit.log) |
| `npm run build` | PASS; gói chơi 7.532.228 byte, dưới 30 MiB | [Log build](edge-transition-build.log) |
| `GAME_DEV_RUN_ID=edge-transition-20261114-verified node tests/game-dev-flow.mjs` | PASS ở 1280×720 và 1920×1080 trên Chromium 158.0.8127.18 | [Log preview](edge-transition-game-dev-flow-verified.log), [report và ảnh](../playtest/01M7AWMZ6C065JP5EHAZABVRFS/evidence/edge-transition-20261114-verified/browser.json) |
| `npm run test:browser` | PASS, gồm tải asset chậm và khóa input trong lúc chuyển khu | [Log browser](edge-transition-browser-verified.log) |

Revision mã nguồn/build và SHA-256 của các tệp/bằng chứng được ghi trong
[`edge-transition-snapshot.json`](edge-transition-snapshot.json).

Flow preview chạy bản production vừa build, tự đi qua đủ sáu khu theo cả hai
hướng bằng mũi tên phải và phím A; kiểm spawn không nằm trong collider, không có
nút chuyển khu, focus/nhập chữ khóa di chuyển, save/reload và không nhận thưởng
lặp. Các asset cảnh trả HTTP 200, không có page error ở cả hai viewport.

Ca browser bổ sung giữ request ảnh của khu kế tiếp chưa hoàn tất, đi vào cạnh
phải rồi giữ W và nhấn E: vị trí và khu không đổi thêm, dialog vẫn đóng. Sau
khi thả request, cảnh mới ở đúng spawn; đi cạnh trái quay về khu ban đầu.
Bộ regression còn kiểm chương bảy ngày, mười bài viết câu, hai mươi chữ Hán
bằng pointer quiz, composition guard và phục hồi bản lưu.

Runner đã đổi từ giữ phím theo số mili giây sang chờ tên khu hoặc chỉ dẫn NPC
thật, và luôn nhả phím bằng `finally`. Import có thông báo đang nhập trước khi
hoàn tất, tránh runner nhận thông báo hoàn tất còn sót từ lần nhập trước.

Những lượt kiểm thất bại trước đó được giữ trong log riêng; chúng không phải
bằng chứng PASS. Lượt preview cuối phía trên đã chạy lại sau build cuối.

## Phạm vi và tích hợp với phiếu asset

Thực hiện trong `D:\Project\Game`. Không sửa hoặc land worktree asset của phiếu
`01M7CF7RN745T2FTG6AXP6RM58`.

Các tệp có thể trùng khi tích hợp art: `src/chapter/app.ts`,
`src/chapter/chapter.css`, `tests/game-dev-flow.mjs`. Giữ cơ chế mép trái/phải,
khóa tải cảnh, hướng dẫn mới, việc bỏ `#chapter-exits` và các ca kiểm bàn phím
khi kết hợp với thay đổi art. `src/content/mvp.json` và tài sản hình không đổi
trong thay đổi này.

README và checklist TSK-26/TSK-29 đã cập nhật điều khiển. Playtest người dùng
trước đây vẫn được ghi theo thời điểm thực hiện; không tự coi người dùng đã
playtest cơ chế mới. Không thay revision hoặc nâng nhãn các gate MVP cũ bằng
bằng chứng của thay đổi này; benchmark, thiết bị và chất lượng art không đo lại.
