# TSK-28 — rà nội dung chương

Ngày 14/11/2026; phiếu nguồn `01M78EYZ58EHGP3R83ZKVZ0AVH`.
Revision đã kiểm: `3c08fb4fd082d2010202c48f181a73a9f6b60762458bec1f6dcbf5180799729d`.
Phạm vi: nhánh nhiệm vụ, liên kết bài học, hướng dẫn và đường tiếp tục.
Đây là kiểm kỹ thuật nội dung; không phải duyệt chất lượng tiếng Trung/audio
hay kết quả playtest của người dùng.

## Lỗi đã sửa

Khi làm xong một bước nhưng quest nhiều bước còn đang mở, chọn lại chủ đề cũ
trước đây làm mất ngữ cảnh nhiệm vụ. `scenarioGuidance()` nay trả nhánh `replay`,
hiển thị “Luyện lại bước đã xong” và bước tiếp theo cùng NPC/địa điểm theo buổi.
Phản hồi thành công nói rõ không nhận lại thưởng nhiệm vụ. Engine vẫn quyết
định tiến trình và thưởng; thay đổi này chỉ sửa hướng dẫn.

Regression bao phủ `arrival`, `classroom`, `shopping`: đi tới NPC bằng bàn phím,
mở E, chọn lại bước cũ, đổi hint 3→1→2, gửi câu đúng, kiểm bước và quan hệ không
bị cộng lặp. Kiểm engine còn bao phủ hoàn thành muộn và hai thứ tự chuẩn bị ngày 6.

## Nhánh và nhịp bảy ngày

| Ngày / quest | Việc trong thế giới | Điều kiện / đường tiếp tục |
| --- | --- | --- |
| 1 / arrival | Chào mentor → giới thiệu với bạn → nhận phòng với cán bộ | Mở ngay ngày 1; chỉ rõ bước còn thiếu theo lịch NPC |
| 2 / breakfast | Gọi một cốc nước nóng ở nhà ăn | Sau arrival; có thể luyện trước nhưng không hoàn thành quest sớm |
| 3 / classroom | Hỏi đường tới thư viện và giờ học | Sau breakfast; làm đủ hai bước mới có thưởng |
| 4 / shopping | Hỏi giá và chọn hai bánh bao | Sau classroom; có thể luyện lại từng bước |
| 5 / delivery | Nhận bưu kiện | Sau shopping; sai ý có gợi ý và thử lại |
| 6 / chuẩn bị | Bài câu 10 và tự viết 我 | Sau delivery; chọn thứ tự tùy ý, chưa kết thúc trước ngày 7 |
| 7 / welcome | Mời bạn cùng ăn cơm ngày mai | Cần lời mời trong quest, bài câu 10 và quiz 我; sau kết thúc vẫn ôn được |

Cả sáu quest được kiểm nhánh chưa mở, đang làm, sai, đóng/mở lại, thành công,
reload và luyện lại. Nhánh chưa mở của arrival không thể xuất hiện trong save
hợp lệ vì quest mở từ ngày 1. Đóng hội thoại giữ tiến độ đã gửi, không lưu câu
nháp. Quest không hết hạn khi qua ngày dự kiến; có thể hoàn thành muộn.

Ba mức hint luôn mở lại được và người chơi tự chọn mức ít hỗ trợ hơn. Chưa có
cơ chế tự giảm hint theo ngày; không coi thao tác chọn hint là bằng chứng đó.
Thời gian làm quen, độ khó và pacing thực tế chờ TSK-29.

## Liên kết nội dung học

| Bài câu | Tình huống / công dụng |
| --- | --- |
| 1–2 | Giới thiệu và nhận phòng ngày 1 |
| 3 | Báo đèn phòng hỏng, luyện tự chọn với bạn cùng phòng |
| 4 | Gọi nước ở nhà ăn |
| 5–6 | Số lượng và hỏi giá ở phố |
| 7–8 | Hỏi đường và giờ học |
| 9 | Nhận bưu kiện |
| 10 | Lời mời, bắt buộc để kết thúc chương |

`chapter-context.ts` có ngữ cảnh cho đủ 20 chữ. Chữ 我 ở nhiệm vụ cuối là bắt
buộc; 19 chữ còn lại là luyện tự chọn, không tuyên bố mỗi chữ là một bước truyện.
Sổ tay và tiến bộ nói/câu/nét giữ riêng; kết thúc bằng gõ ghi `keyboard`.

12 tình huống có 72 audio mẫu tổng hợp `synthetic-espeak-ng`, nguồn/license/hash
được kiểm bởi `test:content`. Trạng thái vẫn `pending-human`; người dùng đã cho
phép hoãn người rà tiếng Trung tới đợt có user thật. Kiểm schema/ý định không
chứng minh phát âm, pinyin hoặc nội dung ngôn ngữ đã được người có năng lực duyệt.

## Bằng chứng

- `node --experimental-strip-types tests/chapter.test.ts`: 17/17, bao gồm nhánh
  sáu quest và hai thứ tự chuẩn bị ngày 6.
- `node --experimental-strip-types scripts/game-dev-fixtures.mjs` và
  `node --experimental-strip-types tests/game-dev-content.test.mjs`: sinh save
  qua engine và kiểm tham chiếu lesson/character/narrative hợp lệ.
- `npm run test:content`: 6 vùng, 6 NPC, 6 quest, 12 tình huống, 72 audio,
  10 bài câu, 20 chữ; human review còn mở.
- Log trình duyệt: [`tsk28-browser.log`](../evidence/tsk28-browser.log).
  Kết quả và ảnh: [`browser.json`](../playtest/01M7AWMZ6C065JP5EHAZABVRFS/evidence/tsk28-content-audit-20261114/browser.json).
  Chromium 158.0.8127.18, qua ở 1280×720 và 1920×1080, không có pageerror
  hoặc response lỗi trong lượt chạy; sáu vùng qua cả hai hướng và ba buổi.
- M2/M3 đo lại sau sửa source: [`chapter-evidence-latest.log`](../evidence/chapter-evidence-latest.log),
  [`gate-m2.json`](../evidence/gate-m2.json), [`gate-m3.json`](../evidence/gate-m3.json).
- `verify:m0-m1` qua trong runner M2/M3; validator trả `[]` với cấu hình gate
  hiện tại. Bốn gate corpus/referenceMachine/realImeAndMic/M4 vẫn deferred.
  [`tsk28-snapshot.json`](../evidence/tsk28-snapshot.json) ghi revision và hash
  build/save/report; kết quả validator không đồng nghĩa mọi AC đã đạt.

TSK-29 đã được người dùng chơi và xác nhận ổn ở mức MVP; visual polish để giai
đoạn sau. TSK-30 vẫn phải đối chiếu các gate AI, privacy, thiết bị và corpus.
Audit này không đóng thay các gate đó.
