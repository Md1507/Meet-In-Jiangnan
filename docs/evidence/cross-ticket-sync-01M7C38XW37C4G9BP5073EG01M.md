# Đồng bộ kết quả hai phiếu — 14/11/2026

**G** = phiếu game `01M78EYZ58EHGP3R83ZKVZ0AVH` (14 AC).
**T** = phiếu kỹ thuật `01M7C38XW37C4G9BP5073EG01M` (8 AC).
Hai bộ số AC khác nhau; T-AC2 không phải G-AC2, T-AC5 không phải G-AC5.

Phiếu T đã **done**, cả 8 AC có tự đánh giá cuối `met`. Bint ghi landed lúc
`2026-11-14T07:20:44Z`, tree `c185a7a8f412491f7f335dc817270ab9ada5d6bd`.
Core verify-3 exit 0, 57/57 PASS; review vòng 4 không có finding mới nhưng việc
đọc diff qua Bint khi review bị giới hạn bởi quyền ghi Git object. Đây là kết
quả hoàn tất technical preparation, không đồng nghĩa 14 AC game đều đạt.

## Ánh xạ bằng chứng

| AC phiếu T (đã met) | Đóng góp sang phiếu G | Kết quả đã có / giới hạn |
| --- | --- | --- |
| T-AC1: entrypoint | G-AC13, TSK-23/30 | Build + 57 regression qua trên tree T. M2/M3 của G đo lại riêng sau khi scripts được tích hợp. |
| T-AC2: HTTPS capture | G-AC9, TSK-19/30 | Report A: 73 raw request, đủ audio/text/strokes/ASR/LLM, không lỗi capture/privacy. Audio oscillator/FLEURS là fixture; capture không có request service-worker, canary SW là kiểm riêng. |
| T-AC3: fault matrix | G-AC10, TSK-18 | Report B: GPU device lost, WASM thiếu, ngắt tải giữa luồng, sai hash model/runtime/WASM đều passed, có recovery và giữ tiến độ. GPU loss là injection. |
| T-AC4: offline/save | G-AC9/12, TSK-17/19 | Report B: offline quest, export/import, từ chối schema sai, rollback đúng backup và xóa cache giữ save đều passed. |
| T-AC5: benchmark harness | G-AC13/14, TSK-22/24 | Report A: play 7,547,614 byte; AI 682,947,939 byte; RSS peak 6,054,891,520 byte; có cold ASR/LLM. Warm p95 và FPS khi inference chưa đo mới. |
| T-AC6: inventory | G-AC13/14, TSK-23/30 | Hash/source/build/manifest/provenance và regression phát hiện stale/mismatch đã có. Bản checkout landed có đổi xuống dòng: ghi hash gốc và hash bản landed riêng. |
| T-AC7: manual kit | G-AC5/6/14, TSK-20/21/24/29 | Collector và checklist đã hoàn thành. Không đồng nghĩa mic/IME/corpus/người rà đã nghiệm thu. Playtest TSK-29 của G đã được người dùng xác nhận và được bổ sung ngược vào tasks của T. |
| T-AC8: phân loại readiness | G-TSK30 | Đồng bộ bảng này cùng tasks/handoff hai phiếu; giữ riêng phần công cụ hoàn tất và gate sản phẩm còn mở. |

Report A: [`1794639513182…json`](task-01M7C38XW37C4G9BP5073EG01M/1794639513182-47a2f986-6667-4d76-b9a6-cc5bdd87c27f.json),
revision `102dcb0a8891449a3f4a206bedbdc202a4d4f820c9799a5f7967d1eda00f3417`, exit 0.
Report B: [`1794638623212…json`](task-01M7C38XW37C4G9BP5073EG01M/1794638623212-0a2d5d7d-954a-41ae-b189-825e3dcad1dd.json),
revision `2f769d7fe288a664e1ddbcc98502722f331db2dc0811413fd90ad2ef34c157fe`.
B có các ca fault/save passed, nhưng **tổng exit 1** do privacy/bundle lúc đo;
không đổi kết quả tổng của B thành PASS.

## Phạm vi kế thừa và phần còn lại

Đã có phép đo và công cụ cho trace/fault/offline/save; không ghi chúng là
“chưa từng chạy” nữa. Các số đo giữ revision gốc. Cây game có khác biệt trong
app/guidance và các script diagnostic-faults, game-dev-fixtures, mvp-evidence
(đã đối chiếu riêng khác biệt xuống dòng với worktree nguồn). Do đó không sao
chép trạng thái gate từ T sang G theo số AC hoặc đổi revision report cũ.

FPS lịch sử 60.006/60 giây/10 NPC và warm p95 ASR 3,695.39 ms, LLM 6,105.65 ms
(3 warm-up + 20 mẫu) giữ nguyên revision được ghi trong phụ lục tasks T. Không
lặp benchmark nặng trong lượt đồng bộ tài liệu này.

TSK-29 của G đã được người dùng chấp nhận ở mức MVP, visual/UI để giai đoạn
sau; không yêu cầu playtest lại. Gate realImeAndMic, referenceMachine, corpus
và M4 vẫn giữ giới hạn của chúng. Nghiệm thu tiếng Trung được hoãn theo yêu
cầu người dùng; playtest tổng quát không thay kiểm Enter của OS IME hoặc corpus.

Chi tiết hash, trạng thái Bint và đối chiếu file ghi trong
[`cross-ticket-sync.json`](cross-ticket-sync.json). M2/M3 sau tích hợp có log
[`cross-ticket-chapter-check.log`](cross-ticket-chapter-check.log); bằng chứng
trước tích hợp được giữ trong `pre-sync-20261114/` và `tsk28-snapshot.json`.
