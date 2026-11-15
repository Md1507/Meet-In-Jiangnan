# Audio mở dùng thử ASR

Nguồn: [Google FLEURS](https://huggingface.co/datasets/google/fleurs), cấu hình Mandarin `cmn_hans_cn`, split `dev`, revision `70bb2e84b976b7e960aa89f1c648e09c59f894dd`. Giấy phép [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); ghi công Google FLEURS contributors. Giữ nguyên WAV và transcript nguồn, không chỉnh sửa âm thanh.

`python scripts/fetch-fleurs.py` tải trực tiếp từ archive khóa revision và chỉ lấy 40 bản ghi mono 16 kHz dài 3–8 giây đầu tiên đủ điều kiện. Script đọc archive tuần tự và dừng khi đủ, không giải nén đường dẫn từ archive lên máy. Danh sách file, transcript, thời lượng và SHA-256 nằm tại `tests/fixtures/fleurs/manifest.json`. Các audio chỉ dùng làm fixture kiểm tra, không tự tải hoặc phát trong game.

`node scripts/bench-fleurs.mjs` chạy Whisper Tiny q8 thật qua ONNX Runtime Node CPU, đối chiếu hash từng audio, báo transcript, CER, cold init và latency từng mẫu vào `docs/m0-fleurs-results.json`. CER bỏ dấu câu/khoảng trắng, chuẩn hóa NFKC, không chuyển phồn thể về giản thể. RSS snapshot và process peak ghi riêng, không coi là RAM riêng của model.

Lượt chạy ngày 2026-11-13 trên Ryzen 7 6800HS, RAM 14.702.026.752 byte, Node 22.17.1: đủ 40 mẫu, cold init 1.894 ms, p95 37 lượt sau ba mẫu đầu 1.541 ms, CER 61,82%. RSS snapshot 481.075.200 byte, process peak 533.610.496 byte. Số CER cao cho thấy chưa thể coi Whisper Tiny đã đạt chất lượng; cả chữ phồn thể so với nhãn giản thể cũng bị tính khác nhau trong phép đo này. Đây là số đo trên bộ đọc tổng quát, không thay kết quả hiểu ý trong game.

`node scripts/bench-browser-ai.mjs` dùng Chromium Playwright, Vite cổng 4187, worker thật và năm audio đầu để kiểm ASR trong browser, sau đó gọi Qwen với một câu gọi nước. Không bật adapter. Log đầu ra, lỗi, browser version và request method/URL ghi vào `docs/m0-browser-ai-results.json`. Mã thoát khác 0 khi model lỗi, không đủ năm bản chép hoặc có request ra ngoài/upload. Đó là kiểm tra suy luận và lưu lượng, không xác nhận model hiểu đúng câu. Chưa kiểm HTTPS triển khai, micro thật hoặc IME hệ điều hành.

Đây là bộ đọc tiếng Trung tổng quát có nhãn transcript, chưa phải bộ nghiệm thu 40 đoạn của trò chơi. Không có nhãn 24 câu đúng ý/8 câu sai ý/8 mẫu nhiễu và không có speaker ID để xác nhận sáu người. Chưa có người Việt mới học hoặc người rà nội dung. Không dùng số CER này để chấm phát âm/thanh điệu hay tự đánh dấu AC-14 đạt. Audio mẫu hội thoại trong sản phẩm vẫn cần khớp câu biên soạn và được rà.
