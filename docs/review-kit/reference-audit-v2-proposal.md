# Đề xuất reference-audit-v2 — chưa phê duyệt

Mục đích: cung cấp audit tham chiếu có thể kiểm lại khi chưa có người rà tiếng
Trung hoặc sáu người thu âm. Giữ nguyên gate MVP, ngưỡng quality và mọi báo cáo
lịch sử; không gán `reviewer.kind=human` cho đối chiếu tự động.

Nguồn nội dung đã đọc là chuẩn chính thức GF 0025-2021 (2021, không phải giáo
trình): Appendix A, trang in 170/174/178, trang PDF 176/180/184. Coordinator đã
render và đọc các mục modal, interrogative, quantity/modifier và question; audit
kiểm lại SHA-256 file PDF local. Những từ xuất hiện chỉ sinh candidate chưa xác
nhận theo ngữ cảnh. Không tính chúng thành số câu được chuẩn hỗ trợ.

Hai giáo trình từ 2020 trở đi có metadata NXB: *语法学习手册（初等）*, ấn bản
2022-01, ISBN 9787561959862 ([BLCUP](https://www.blcup.com/PInfo/index/11228));
*词汇速记速练手册（一级）*, 2022-11, ISBN 9787561961223
([BLCUP](https://www.blcup.com/PInfo/index/11438)). Chưa đọc nội dung sách hoặc
sample nên chưa dùng chúng làm bằng chứng từng câu. Năm này là publication của
sách theo metadata đã được coordinator kiểm, không phải ngày cập nhật web hay
reprint suy đoán. K-State không rõ năm không thuộc nguồn giáo trình chính.

CC-CEDICT export snapshot 2026-11-13 là từ điển bổ trợ, CC BY-SA 4.0, ghi công
CC-CEDICT contributors qua MDBG; không gọi là giáo trình 2026. Báo cáo giữ mục
từ, pinyin gốc, phép tách tham lam và kết quả so âm tiết bỏ thanh điệu cho từng
câu. `segmental-match-tones-unchecked` chưa xác nhận tone sandhi, nghĩa Việt,
ngữ dụng, sự tự nhiên hoặc phát âm.

Đã có đối chiếu thật 72 câu trong evidence phiên `review4-resume/reference`.
Không có audio độc lập exact phrase đã xác minh license/speaker/transcript;
30 output để rà chất lượng cũng ghi unavailable. Không nhân bản FLEURS thành
audio game hoặc gọi TTS là người bản ngữ. Tatoeba cần license theo từng audio
và exact phrase/context; AISHELL-1 chung không chứng minh 24 positive của game.
Không tải mặc định gói 15 GB.

Để xem xét profile này, người dùng cần thấy bảng mismatch/uncertain theo câu,
coverage gaps và rủi ro còn lại. Chưa đủ nội dung giáo trình 2020+ để duyệt cả
câu, chưa đủ evidence output/audio hoặc người rà. Nếu phê duyệt profile thay
thế sau này, cần hợp đồng version riêng công khai phần nào được kiểm và phần
nào còn thiếu; các ngưỡng kỹ thuật/quality cũ vẫn giữ.
