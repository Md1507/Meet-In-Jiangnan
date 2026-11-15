# Tài liệu đang chờ người kiểm

Phiếu M4 cho collector, rà ngôn ngữ, thiết bị và playtest: [m4-content-worksheet.md](m4-content-worksheet.md).

Các tệp `.pending.json` là phiếu trống, không phải bằng chứng đã qua. Người dùng
xác nhận ngày 13/11/2026 rằng hiện chưa có người rà hoặc chưa kiểm được thiết bị.
Chạy `node scripts/prepare-mvp-review.mjs` để tạo một thư mục phiên mới; lệnh từ
chối ghi vào thư mục đã tồn tại và giữ nguyên các phiếu cũ.

```powershell
node scripts/prepare-mvp-review.mjs --output-dir docs/review-kit/session-moi
node scripts/prepare-mvp-review.mjs --validate docs/review-kit/session-moi --output-dir docs/review-kit/readiness
```

Validator kiểm binding content/build, 60 text độc lập (30 đúng/30 sai), 40 WAV
khác file/hash có thời lượng thực 3–8 giây, nhóm/nhãn/scenario/sáu speaker/quyền
dùng/transcript, đủ 72 hàng nội dung và 30 output liên kết file kết quả có hash.
`dataReady` chỉ có nghĩa dữ liệu đủ để bắt đầu đánh giá; không chứng minh danh
tính người nói, chất lượng inference hay người rà đã duyệt. `legacyGateApproved`
luôn false. Phiếu thiếu dữ liệu trả exit 1 cùng lỗi từng hàng; test đủ dữ liệu
dùng audio và output tổng hợp có nhãn SYNTHETIC, không phải bằng chứng nghiệm thu.

`text-corpus.pending.json` và `model-outputs.pending.json` được tạo riêng trong
phiên mới. Sau khi source hoặc build đổi phải sinh kit mới với revision tương ứng;
không sửa revision của kit đã thu để bỏ qua kiểm binding.

Phương án tham chiếu khi chưa có người rà/nhóm thu được mô tả trong
[đề xuất reference-audit-v2](reference-audit-v2-proposal.md). Đây là profile chờ
người dùng xem, không thay hợp đồng MVP hiện hành.

- `content-review.pending.json`: 72 câu cần rà chữ giản thể, pinyin theo ngữ cảnh,
  nghĩa Việt, mục tiêu cảnh và từng audio. Mức MVP chỉ cần người có năng lực tiếng
  Trung rà mẫu tối thiểu 12 câu đúng phủ 12 tình huống, nhãn corpus và ít nhất
  12 đầu ra model thật (ít nhất 80% phù hợp, tức 10/12). Ghi tên, năng lực người rà,
  verdict và ghi chú; không bắt buộc chứng chỉ, agent không tự duyệt thay.
- `audio-collection.pending.json`: 40 vị trí thu, chưa có tệp/nhãn/đồng ý sử dụng.
  Cần 24 câu đúng từ ít nhất 3 người, 8 sai ý và 8 im lặng/nhiễu, mỗi đoạn 3–8 giây.
  Lưu ID người nói ẩn danh, quyền sử dụng, transcript tham chiếu và người rà nhãn.
  Không đưa câu đánh giá vào prompt hay ví dụ luyện tập.
- `manual-devices.pending.json`: người kiểm thử Chinese Pinyin IME thật (Enter
  chọn ứng viên không gửi câu), một vòng thu/nghe lại/chép/sửa hoặc thu lại trên
  chapter và một ca từ chối quyền mic, rút thiết bị hoặc codec không hỗ trợ.
  Ghi browser/version, IME, mic và kết quả từng ca. Hai ca lỗi còn lại là mở rộng.

Phiếu cũ có thể vẫn liệt kê 72 câu/30 output và cả ba ca lỗi mic. Chỉ điền mẫu
bắt buộc ở trên khi nghiệm thu MVP; để các mục chưa kiểm là pending và tạo report
gate từ những mục đã có bằng chứng, không đổi pending thành passed.

Audio eSpeak-NG trong `public/audio/` là mẫu tổng hợp cục bộ để thử luồng chơi.
40 tệp FLEURS mở trong `tests/fixtures/fleurs/` dùng chẩn đoán ASR; chúng chưa đáp
ứng bộ ghi âm tình huống game có nhãn và ba người nói. Không dùng hai nguồn đó
thay cho corpus nghiệm thu. Ngưỡng và định dạng báo cáo ở [hợp đồng MVP](../mvp-evidence.md).

Nguồn tài nguyên và revision ở `public/licenses/chapter-sources.json`; giấy phép
font và dữ liệu nét được giữ riêng. Hướng dẫn Qwen q4f16/WebGPU tham khảo
[model card của ONNX Community](https://huggingface.co/onnx-community/Qwen3-0.6B-ONNX/blob/main/README.md).
