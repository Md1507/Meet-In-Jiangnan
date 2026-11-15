# M4: phiếu thu và rà nội dung — pending

TSK-6/7 chuẩn bị công cụ; chưa thu corpus, chưa kiểm thiết bị, chưa có người
rà ngôn ngữ và chưa playtest. Chuẩn bị kỹ thuật không phải nghiệm thu MVP.
Không tự điền verdict, không tải lên hoặc đưa audio riêng tư vào repository hay
evidence. Người thu giữ recording và kit trong thư mục riêng ngoài repository;
chỉ chia sẻ bằng chứng đã được phép và không chứa audio riêng tư.

## Collector corpus

Sau khi được phép chạy công cụ, tạo kit mới bằng
`node scripts/prepare-mvp-review.mjs --output-dir <thu-muc-moi-ngoai-repo>`.
Điền `binding.json` theo bản được tạo, không sửa revision/hash để tái sử dụng
phiên cũ. Với 60 hàng text, ghi câu, scenario, nhãn đúng/sai, quyền sử dụng và
người rà nhãn; khai nguồn heldout, người xác nhận độc lập và toàn bộ ví dụ
prompt. Giữ 30 đúng/30 sai, từng câu duy nhất, không đưa heldout vào prompt.
Với 40 hàng audio, ghi 24 đúng, 8 sai ý, 8 im lặng/nhiễu; mỗi hàng có ID người
nói ẩn danh, quyền sử dụng, người rà nhãn, scenario, nguồn bản thu thật, hash,
thời lượng WAV 3–8 giây, transcript tham chiếu khi có lời. Tệp WAV phải ở trong
kit riêng để validator đọc, không đưa vào repo. Không dùng TTS hay FLEURS.

Collector hiện yêu cầu sáu người nói ở nhóm đúng, trong khi README và gate MVP
hiện nêu tối thiểu ba. Đây là khác biệt hiện hữu cần điều phối rà sau merge;
không hạ kiểm tra hoặc tuyên bố gate đạt dựa trên collector. Bộ kiểm có thể
phát hiện nguồn bị khai rõ là TTS/FLEURS, nhưng không xác minh được tính trung
thực của nguồn, quyền, danh tính hay độc lập prompt; cần người kiểm thực tế.
Chạy `node scripts/prepare-mvp-review.mjs --validate <thu-muc-kit-ngoai-repo>`
chỉ sau xác nhận kiểm chứng của phiếu. Thiếu dữ liệu phải trả readiness fail;
`dataReady` không chứng minh chất lượng, người rà hay gate MVP đã đạt.

## Phiếu thao tác và rà

Ghi người thao tác, ngày, source/build revision, OS, browser/version, IME,
microphone và save/điểm vào trong `manual-devices.pending.json`. Với từng ca
ghi expected, actual, trạng thái và đường dẫn bằng chứng không chứa audio riêng;
để pending nếu chưa thực hiện. Người rà ghi tên, năng lực, verdict và ghi chú
trong `content-review.pending.json`; so chữ Hán, pinyin có dấu, nghĩa, ngữ cảnh,
audio và nhãn corpus với đúng revision. Mẫu tối thiểu và output model thật theo
README; không coi rà tự động hoặc text tổng hợp là người có chuyên môn duyệt.

| Ca | Thao tác | Expected | Trạng thái |
| --- | --- | --- | --- |
| IME thật | Gõ Pinyin, chọn ứng viên bằng Enter, sau đó Enter gửi | Enter đầu không gửi sớm; câu gửi đúng | pending |
| Mic thật | Thu, nghe, xem transcript, sửa và thu lại | Có thể sửa/thử lại, transcript và tiến trình giữ đúng | pending |
| Mic denied | Từ chối quyền | Thông báo và đường tiếp tục phù hợp | pending |
| Mic unplugged | Rút thiết bị khi đang thu | Lỗi rõ, thử lại hoặc dùng đường khác | pending |
| Codec | Thử môi trường không hỗ trợ | Thông báo và phục hồi, không mất tiến độ | pending |

## Playtest chapter cuối — chưa thực hiện

Ghi build/revision và save đầu vào; đi nhánh chính đến kết thúc, thử câu sai và
phản hồi, hủy/quay lại rồi thử lại, reload giữa tiến trình và kiểm reward chỉ
một lần. Thử offline sau khi cache, save/export/import hợp lệ và khôi phục sau
save hỏng; ghi expected/actual, hash hoặc ảnh/log được phép. Nếu không có người,
thiết bị hay phản hồi thì giữ từng ca pending; không suy diễn từ schema.
