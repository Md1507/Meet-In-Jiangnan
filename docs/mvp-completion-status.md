# Trạng thái MVP sau đồng bộ hai phiếu — 14/11/2026

> Review 10 là lịch sử: xem [bảng đồng bộ hiện tại](evidence/cross-ticket-sync-01M7C38XW37C4G9BP5073EG01M.md)
> và [báo cáo TSK-30](game-dev/tsk-30-closeout.md).
> Phát hiện lịch sử: luật production từng chỉ nhận 6/30 câu đúng trong bộ chẩn đoán,
> từ chối cả `我想喝一杯热水。`; `.16` đã sửa và regression hiện tại pass. M2/M3
> đã chạy lại trên build cuối, không còn stale revision.

**Người dùng đã playtest và chấp nhận ở mức MVP**, TSK-29 hoàn tất; visual/UI
polish để sau. Phiếu M4 `01M7C38XW37C4G9BP5073EG01M` đã done và landed,
cả 8 AC met ở phạm vi chuẩn bị kỹ thuật, Core verify 57/57 PASS.
AC5/6 của phiếu game có một phiên thiết bị thật với
composition, thu/playback/ASR và track cleanup, nhưng report đang chờ đóng theo
schema gate. Reference-machine và M4 được deferred để đo lại cùng snapshot sau sửa
provenance diagnostic. AC14 corpus game-intent và human review được deferred sau MVP.

M2/M3 được đo lại sau khi tích hợp scripts M4. Revision và hash ở
[`cross-ticket-sync.json`](evidence/cross-ticket-sync.json); log tại
[`cross-ticket-chapter-check.log`](evidence/cross-ticket-chapter-check.log).
Snapshot playtest TSK-28/29 giữ nguyên `3c08fb4f…` trong `tsk28-snapshot.json`.

## Sửa lỗi và kiểm chứng

Các số đo review trước bên dưới giữ phạm vi lịch sử. Capture mới của phiếu M4
đã đủ 5 tuyến/73 request, có 6 fault và offline/save passed; không còn ghi
những việc này là chưa từng thực hiện. Report vẫn giữ revision T ban đầu.

- `.15`: kiểm cả giá trị header thay vì chỉ tên. Payload trong Accept,
  If-None-Match và các header khác bị từ chối; profile desktop tĩnh giới hạn
  MIME/locale/encoding/UA, host/origin chính xác, không nhận conditional headers.
  Xem [hợp đồng](mvp-evidence.md); không xóa header khỏi trace để vượt gate.
- `node --test tests/mvp-evidence.test.mjs`: 19/19 PASS, gồm ngưỡng smoke và regression mới
  chặn payload và chấp nhận metadata Chromium/Edge, Firefox, Safari có cấu trúc.
- `node --experimental-strip-types tests/chapter-evidence.mjs`: PASS. Chạy
  typecheck/build, 49 unit/contract tests, hash/license/runtime hỏng, content và
  browser flows. Chương 7 ngày, 10 bài, 20 quiz Hanzi bằng con trỏ, hint/retry,
  save/reload/import/rollback/conflict và hướng dẫn hướng nét mới đều PASS.
  [M2](evidence/gate-m2.json) (5 case), [M3](evidence/gate-m3.json) (6 case)
  đã được đo lại đúng revision; [log](evidence/chapter-technical-check.log) lưu đầu ra thực.
- `node --test tests/device-evidence-protocol.test.mjs`: PASS; runner chỉ coi
  output không rỗng sau inference-start, đúng request/session là kết quả.
- `node scripts/bench-chapter.mjs --fps --cross-browser`: PASS HTTPS local,
  Chromium/Firefox/WebKit. Chromium hoàn thành quest khi offline; 10 NPC,
  1280×720, đo ít nhất 60 giây, median **60.006 FPS** trên GPU D3D11 thật.
  [Báo cáo](evidence/chapter-built-diagnostic.json) ghi version, cấu hình và mọi frame.
  WebKit trên Windows không thay nghiệm thu Safari/macOS thật.
- Gói chơi thực (kể offline manifest): **7,536,836 byte**; gói AI gồm
  model/runtime/worker/WASM: **682,947,939 byte**, dưới 30/800 MiB.
- `validateMvp` riêng: trả về `[]`; lệnh tổng `npm run verify:mvp` chạy thành công với
  M2/M3 hiện hành và các gate reference-machine, realImeAndMic, M4 được ghi deferred
  có lý do trong `docs/mvp-gates.json`. Đây là smoke gate, chưa phải đóng toàn bộ AC.

Bằng chứng cũ trước khi đo lại được giữ nguyên byte ở
`docs/evidence/archive/pre-review9/`; các path bên trong báo cáo cũ vẫn là path
ở thời điểm đo, không phải gate mới. Không sửa revision của kết quả cũ.

## Đối chiếu từng AC

| AC | Tự đối chiếu | Bằng chứng / phần còn thiếu |
| --- | --- | --- |
| 1 | met | Build HTTPS, sáu vùng, WASD/va chạm/E và focus qua UI. Chưa public deployment. |
| 2 | met | M2 mới: bảy ngày, sáu quest/NPC, ending bàn phím; không gắn nhãn audio. |
| 3 | met | M2/engine: bốn activity/event, seed, điều kiện, cooldown và không khóa truyện. |
| 4 | met | 12 cảnh, biến thể đúng/sai và câu ghép/chống mâu thuẫn qua unit; chưa suy thành chất lượng AI tự do. |
| 5 | smoke evidence | Phiên Edge headed mới ghi 48 kHz track, 5 lần recorder start/stop, blob WebM, decode, playback và ASR local; cần đóng thành report gate cùng revision. |
| 6 | deferred | Phiên thật ghi compositionstart/update và chọn chữ trên chapter, nhưng không ghi compositionend/Enter rõ ràng; cần một lượt ngắn bổ sung để đóng điều kiện Enter. |
| 7 | met | M3/UI mới: 20 quiz, tô/gợi/thứ tự nét, retry, tiến bộ riêng; hướng dẫn nét mới qua browser. |
| 8 | met | M3 mới: ba mức hint, sổ tay câu/pinyin/nghĩa/audio, lịch ôn 1/3/7 và kỹ năng riêng. |
| 9 | supporting evidence / gate deferred | T-AC2/4 đã met: raw HTTPS 5 tuyến/73 request và offline quest/save. Khác app/guidance/runner nên chưa chuyển thành gate G cùng revision. |
| 10 | met, thêm evidence T | Manager/browser có regression; T-AC3 thêm 6 fault passed với lỗi quan sát/recovery/giữ tiến độ. Báo cáo fault tổng exit1 do privacy/bundle khi đo; không gọi tổng report là PASS. |
| 11 | met | Sáu art pixel nguyên bản, font/pinyin/nét local có license; kiểm UI 1280×720/1920×1080 trước đây và smoke build mới. Duyệt ngôn ngữ/audio thuộc AC14. |
| 12 | met | UI mới kiểm reload world/quest/relation/skills, bad import, backup và stale-tab conflict. |
| 13 | supporting evidence / gate deferred | T-AC1/5/6 đã met: verify 57/57, harness/inventory, budget dưới ngưỡng, cold/RSS; p95 và FPS lịch sử giữ revision gốc. Không lặp benchmark nặng trong lượt đồng bộ. |
| 14 | deferred | Corpus game-intent 60/40 và người rà tiếng Trung sẽ bổ sung sau MVP khi có user thật. |

## Bằng chứng mới đã rà

Kết quả từ phiếu kỹ thuật `01M7C38XW37C4G9BP5073EG01M` đã được đối chiếu trong
[bảng đồng bộ hai phiếu](evidence/cross-ticket-sync-01M7C38XW37C4G9BP5073EG01M.md).
T-AC1→G-AC13, T-AC2→G-AC9, T-AC3→G-AC10, T-AC4→G-AC9/12,
T-AC5→G-AC13/14, T-AC6→G-TSK23/30, T-AC7→G-AC5/6/14,
T-AC8→G-TSK30. Không đồng nhất số AC của hai phiếu.

[Whisper WASM](evidence/2026-11-13T07-46-21-989Z-eb45b692-a1a5-4dc5-a9b9-ad1d559a34ce.json)
và [Qwen WebGPU](evidence/2026-11-13T07-46-46-765Z-01aa4e59-8216-466c-8196-542629d138a5.json)
trên Edge 157 có inference-start đến result lần lượt 3,492/2,587 ms.
SHA-256 worker/manager/manifest khớp live; weight thực khớp manifest. Qwen trả
JSON order_water đúng cho một câu; Whisper FLEURS còn sai nhiều chữ. Không thấy
request ngoài origin hoặc ngoài GET/HEAD trong hai phiên. Đây là phép chẩn đoán
HTTP một mẫu, không phải corpus, p95 máy chuẩn hay trace HTTPS tổng.

[Phiên phone TTS](evidence/phone-tts-0142f5e7-d670-465a-a353-30c2a67890e4.json)
và [xác nhận người dùng](evidence/phone-tts-human-confirmation-0142f5e7.json)
đã bổ sung mẫu tiếng Trung thật đi qua microphone máy: yêu cầu 我要一杯热水,
transcript 给我一杯热水; người dùng xác nhận nghe rõ và nội dung phù hợp. Không
khẳng định khớp từng chữ, giọng người thật, chất lượng corpus hoặc phiên bản live.
Bằng chứng Pinyin/mic và giới hạn snapshot được mô tả thêm ở [device evidence](device-evidence.md).
