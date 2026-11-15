# Review nghiệm thu MVP — vòng 10, 13/11/2026

> Đây là báo cáo lịch sử. `.16` đã sửa, TSK-29 đã được người dùng chấp nhận;
> phiếu M4 mới đã hoàn tất technical preparation với trace/fault/offline/save.
> Trạng thái sau đồng bộ ở [bảng hai phiếu](evidence/cross-ticket-sync-01M7C38XW37C4G9BP5073EG01M.md).

Kết luận: chưa đủ điều kiện nghiệm thu MVP theo plan hiện hành. Vòng này phát
hiện một lỗi medium thực tế ở bộ hiểu câu, ngoài các phần kiểm chứng còn thiếu.
Không sửa implementation trong bước review.

Revision được rà: `9491e1202cb093aedfe748e33a551e4505a3e90dfc5910a9af78c01c9e867822`.
[Bằng chứng chẩn đoán](evidence/review10-diagnostics.json) lưu đầu vào, kết quả,
hash artifact và giải thích revision. `validateMvp` hiện báo 7 lỗi: 5 gate thiếu,
M2/M3 khác revision; không phải 7 lỗi chức năng.

## Lỗi sản phẩm khiến chất lượng chưa đạt

`src/chapter/content.ts:15` chỉ nhận một nhóm mẫu hẹp. Câu đúng
`我想喝一杯热水。` bị `interpret('order_water', text)` trả `accepted:false`.
`validScenarioProposal({intent:'order_water',accepted:true}, ..., text)` cũng
trả false, nên model hiểu đúng vẫn không vượt được chốt luật. Luồng gửi câu
ở `src/chapter/app.ts` dùng trực tiếp bộ luật này.

Chẩn đoán toàn bộ bộ câu hiện có bằng luật production: TP **6/30**, FP **0/30**,
tổng **36/60**. Ngưỡng smoke hiện hành của plan là TP ≥24/30, FP ≤3/30, tổng ≥51/60. Đây là phép đo
luật, không phải inference browser; nhãn dataset chưa được người rà duyệt.
Không kết luận mọi nhãn đều đúng, nhưng các câu yêu cầu đơn giản đủ tái hiện
việc từ chối diễn đạt hợp lệ. Cần mở rộng hiểu cấu trúc/ý định mà vẫn chặn
phủ định, sai số lượng, sai món và câu mâu thuẫn; không chỉ thêm nguyên văn
bộ heldout vào danh sách ví dụ.

Báo cáo model Node cũ đạt 46/60, FP14/30 cũng không phải chất lượng bản phát
hành hiện tại: prompt/schema/backend khác. Luật hiện chặn được bốn ví dụ model
cũ nhận sai đã kiểm riêng, nhưng làm mất nhiều câu đúng. Model chạy được một
câu và gameplay qua các câu mẫu chưa chứng minh đạt bộ kiểm chất lượng.

## Các gói việc cần đóng để nghiệm thu

| Gói | Vì sao chưa đóng | Kết quả cần có | Ai thực hiện |
| --- | --- | --- | --- |
| Hiểu câu / AC14 | Luật từ chối các cách nói đúng; chưa kiểm pipeline browser trên corpus đã rà | Sửa lỗi, giữ regression câu sai; corpus 60 câu độc lập 30 đúng/30 sai đạt ngưỡng smoke TP≥24, FP≤3, tổng≥51 theo plan | Kỹ thuật + người rà nhãn |
| Thiết bị / AC5,6 | Mic/Pinyin thật đã thử trên spike; thiếu tích hợp chapter và các ca lỗi | Trên chapter hiện tại: IME chọn chữ không gửi, Enter sau mới gửi; thu ≤20s, nghe, chép, sửa/thu lại, ngừng track, ít nhất một ca denied/unplug/codec | Người thao tác thiết bị + kỹ thuật ghi log |
| Quyền riêng tư / AC9,M4 | Diagnostic AI HTTP thiếu header/body; trace spike bỏ query, chưa đủ năm đường | Capture bản HTTPS phát hành khi dùng audio/text/strokes/ASR/LLM; giữ URL/header/body đầy đủ và kiểm không upload/ngoài origin; chạy fault matrix M4 | Kỹ thuật |
| Máy chuẩn / AC14 | Có FPS/budget nhưng chưa warm p95/memory | Mỗi model 2 warm-up +12 lượt; ASR5s p95≤18s, LLM≤64token p95≤14s, cold load/init riêng và peak memory có phương pháp | Kỹ thuật trên cấu hình ghi rõ |
| Corpus/audio/người rà / AC14 | 40 FLEURS không có speakerID/nhãn game; 72 audio vẫn pending-human | 40 mẫu3–8s:24 đúng từ≥3người,8 sai,8 nhiễu có quyền dùng; nhận≥16/24, sai≤2/8, nhiễu0/8; báo CER. Người có năng lực rà mẫu12 câu phủ12 tình huống và12 output,≥80% phù hợp | Thu thập/kỹ thuật + người có năng lực tiếng Trung |

Runner hiện tại `scripts/manual-device-acceptance.mjs` mặc định trỏ frozen
snapshot, dùng `#scene`, `#answer`, `#dialog`, journal của spike. Chapter dùng
`#chapter-*`. Chỉ đổi `--url` chưa đủ vì runner sẽ chờ sai selector. Cần bổ sung
chế độ thu cho chapter, đúng snapshot/source hash. Trace hiện lưu
`origin+pathname`, không lưu query/header/body: không dùng nó để chứng minh
không có payload bị bỏ khỏi báo cáo. Thiếu compositionend riêng lẻ là giới hạn
trace, không phải bằng chứng IME bị hỏng hay điều kiện nghiệm thu bổ sung.

## Vì sao M2/M3 lại báo cũ

Sau review9, script `device-evidence-protocol.mjs` đổi tên sự kiện
`asset-verified` thành `asset-read-complete` để mô tả đúng giai đoạn đọc byte.
`mvpRevision` hash cả thư mục scripts, nên sửa chẩn đoán cũng đổi revision.
Tính thử digest trong bộ nhớ với duy nhất tên event cũ cho đúng revision review9
`128b1d659ef4bfc8510859a1f5559d057081d8eaa1c556953300635667d79afd`.
Cả tám artifact review9 đối chiếu đều giữ nguyên SHA-256. Vì vậy không có bằng
chứng game/build hồi quy; gate vẫn yêu cầu bộ báo cáo khớp revision hiện tại.
Không sửa revision của log cũ để vượt kiểm.

Test protocol mới đã chạy PASS, kể cả phản hồi đủ byte nhưng sai SHA bị chặn
trước inference. 49 tests, browser flows và FPS ở review9 giữ giá trị lịch sử;
vòng này không chạy lại bộ nặng vì khác biệt đã cô lập ở công cụ chẩn đoán.

## Thứ tự kết thúc

1. Sửa lỗi hiểu câu; hoàn thiện runner chapter, bộ thu network và benchmark/fault runner.
2. Rà nhãn corpus, chuẩn bị audio đúng phân bố và có quyền sử dụng; tổ chức người rà nội dung.
3. Chốt mã/runtime/nội dung, rồi chạy thiết bị thật, inference corpus, máy chuẩn và M4 trên cùng bản.
4. Sinh đủ bảy gate từ kết quả thật, đo lại M2/M3 sau thay đổi cuối cùng.
5. Khi không còn thiếu bằng chứng, người dùng xác nhận lệnh `npm run verify:mvp`
   trong Bint rồi mới chạy kiểm chứng tổng. Việc xác nhận lệnh không thay chất lượng.

Bint còn thiếu xác nhận lệnh tổng; đây là điều kiện quy trình riêng, không phải
nguyên nhân mic/IME hoặc AI bị lỗi. Vòng này không approve, không chạy verify
chưa xác nhận và không đánh dấu done.
