# Bàn giao gameplay M4 — 01M7C38XW37C4G9BP5073EG01M

Tác vụ dependency 01M7A5E5VAK7KM5VWYPMF6T3GC đã được đánh dấu done do nhầm theo đính chính của người dùng ngày 14/11/2026; họ định tiếp tục sau xử lý xung đột land. Core 42/42 và review 6 chỉ áp dụng tree 3c2c7953f8fb020dac885230d2d4b55b38273306, không chứng minh mã sau merge. Không mở lại hay sửa lịch sử phiếu cũ. Phải có kiểm tra mới trên snapshot này sau xác nhận lệnh của phiếu M4.

TSK-1: `scripts/verify-m4-technical-prep.mjs` là entrypoint chuẩn bị hẹp, in hash các tệp tích hợp, git HEAD, revision source/build khi dist sẵn, kiểm marker ở các tệp liên quan, ngưỡng smoke và các export; chạy contract test đi kèm khi Bint được phép chạy lệnh. Trạng thái pending là phần chưa có bằng chứng, không phải MVP pass. Chưa kiểm tương thích sau merge bằng thực thi; preflight chỉ kiểm hợp đồng hạn chế, không thay kiểm tra tích hợp.

TSK-2: `captureRequests` hiện giữ URL/header/body thô; adapter `privacyAssessment` phân biệt attempted/exercised và dùng validator hiện có. Chapter runner chỉ công bố text/strokes; chưa có evidence audio/ASR/LLM hoặc coverage service worker trên snapshot. Trace có thể chứa dữ liệu nhạy cảm, chỉ giữ cục bộ. Adapter chưa được nối vào một hành trình HTTPS đủ năm tuyến.

TSK-3: adapter `faultAssessment` không chuyển row thiếu injection, lỗi quan sát, recovery và chứng cứ giữ tiến độ thành passed. `diagnostic-faults.mjs` có các injection hiện hữu nhưng chạy context riêng, chưa chứng minh bảo toàn cùng state; download hiện abort request mục tiêu, chưa chứng minh bị ngắt giữa luồng bytes. WASM hash mismatch chưa có ca riêng. Cần runner/bằng chứng bổ sung trước AC-3.

TSK-4: `bench-chapter.mjs` có offline quest; `diagnostic-faults.mjs` có save/import/schema/rollback, nhưng chưa liên kết thành một phiên/snapshot chứng minh đầy đủ state trước/sau, xóa model giữ save. Không coi TSK-4 hoặc AC-4 đã hoàn tất.

Chưa chạy entrypoint, test, benchmark, model hay UI vì lệnh verify mới chưa được người dùng xác nhận qua Bint. Chưa thực hiện playtest, IME/mic thật hoặc rà người. Các TSK và AC ở trên giữ mở; polish cần tiếp nối các điểm còn thiếu. Không dùng kết quả cũ thay kiểm chứng sau merge.
