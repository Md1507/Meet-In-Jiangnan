# TSK-30 — đồng bộ snapshot nghiệm thu

Ngày 14/11/2026. Snapshot playtest TSK-28/29: `3c08fb4fd082d2010202c48f181a73a9f6b60762458bec1f6dcbf5180799729d`.
Sau tích hợp scripts M4, revision kiểm tra mới nằm trong
[`cross-ticket-sync.json`](../evidence/cross-ticket-sync.json), M2/M3 được đo lại.

TSK-28 đã tích hợp. TSK-29 đã được người dùng playtest và xác nhận ổn ở mức MVP;
phản hồi được ghi tại `docs/evidence/tsk29-user-playtest.md`. Tài liệu này
chỉ đồng bộ trạng thái bằng chứng; không thay người dùng approve hay đóng gate.
Kết quả từ phiếu kỹ thuật được đối chiếu trong
[`cross-ticket-sync-01M7C38XW37C4G9BP5073EG01M.md`](../evidence/cross-ticket-sync-01M7C38XW37C4G9BP5073EG01M.md).

| Gate / AC | Trạng thái snapshot | Bằng chứng hoặc việc còn lại |
| --- | --- | --- |
| M2 / AC1–4 | Đạt smoke tự động | `docs/evidence/gate-m2.json`, chapter evidence; không phải duyệt chất lượng model tự do |
| M3 / AC6–8 | Đạt smoke tự động | `docs/evidence/gate-m3.json`; IME hệ điều hành thật vẫn tách riêng |
| AC5 mic | Chưa đóng | Có phiên headed thật và giới hạn trong `docs/device-evidence.md`; cần report gate chapter cùng revision |
| AC6 IME | Chưa đóng | Có composition thật nhưng thiếu trace compositionend/Enter rõ ràng |
| AC9 privacy/trace | Đã có kết quả kỹ thuật, gate G còn mở | T-AC2 đã met: 73 request/5 tuyến ở revision 102dcb0a. App/guidance và runner của cây game khác; giữ report T làm bằng chứng có giới hạn. |
| AC13 máy chuẩn | Đã có harness/số đo, gate G còn mở | T-AC5 met cho chuẩn bị: cold inference/RSS/budget mới, p95/FPS lịch sử giữ revision gốc; chưa có FPS khi inference mới. |
| AC14 corpus/audio | Hoãn | User cho phép hoãn người rà tiếng Trung; corpus 60/40 và audio vẫn không được tuyên bố đạt |
| M4 | Technical preparation T hoàn tất; gate G còn mở | T-AC3/4 có 6 fault và offline/save passed. Cần liên kết/chấp nhận bằng chứng trên bản game cuối; không yêu cầu dựng lại harness. |

Phiếu kỹ thuật `01M7C38XW37C4G9BP5073EG01M` đã done và landed; cả 8 AC met
trong phạm vi technical preparation. T-AC1 là entrypoint, T-AC3 fault, T-AC4
offline/save, T-AC2 capture và T-AC6 inventory. Không đồng nhất số AC này với
14 AC của phiếu game. Report gắn revision khác nên giữ phạm vi đo ban đầu.

Trước tích hợp M4, `npm run verify:mvp` **exit 0**; log lịch sử nằm trong
[`tsk30-verify-mvp.log`](../evidence/tsk30-verify-mvp.log). Lệnh này không được
dùng để tự chuyển Bint sang done vì `verify_confirmed` của phiếu vẫn false và
các gate deferred/chưa đóng nêu trên vẫn còn. `docs/evidence/tsk28-snapshot.json`
là chỉ mục bản playtest trước tích hợp. Log M2/M3 sau tích hợp là
`docs/evidence/cross-ticket-chapter-check.log`; chỉ mục hash mới là
`docs/evidence/cross-ticket-sync.json`. Không sửa revision trong report lịch sử.

## Bước tiếp theo

1. Giữ snapshot hiện tại làm mốc MVP đã playtest; visual polish để giai đoạn sau.
2. Nếu phát sinh lỗi mới, tái hiện và sửa trước khi cập nhật snapshot.
3. Đối chiếu các gate AC5/6/9/13/14 và M4 với report T đã có. Chỉ bổ sung phép
   đo khi khác biệt sản phẩm liên quan hoặc thiếu dữ liệu; không lặp FPS/p95
   hay yêu cầu playtest lại chỉ để đồng bộ hai phiếu.
4. Chỉ khi có bằng chứng thật và người dùng xác nhận lệnh verify tổng mới xem
   xét đóng MVP; hiện tại phiếu vẫn `in_review`.
