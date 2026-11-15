# Nguồn tham khảo: 301 câu đàm thoại tiếng Hoa

Cập nhật ngày 14/11/2026 từ bộ tài liệu người dùng cung cấp. Tài liệu này bổ sung
nguồn và hướng biên soạn cho chương bảy ngày; phần áp dụng dưới đây là kế hoạch,
chưa phải bài học hoặc audio mới đã có trong game.

Cập nhật tiếp: [bản hội thoại NPC đời thường](../game-dev/ambient-conversations.md)
đã được tích hợp với bốn NPC phụ, tám câu hỏi và 42 voiceline tổng hợp từ nội dung
biên soạn mới. Các ánh xạ giáo trình/chương chính bên dưới vẫn là hướng tham khảo;
chưa ghép bản thu MP3 của bộ sách vào game.

## Nguồn đã kiểm tra

- Thư mục local: `D:\Project\Game\[hanka.edu.vn] 301 cau dam thoai tieng Hoa - pdf - video-mp3`.
- PDF: `[hanka.edu.vn] PDF-301 Câu đàm thoại tiếng Hoa/[hanka.edu.vn] PDF-301 Câu đàm thoại tiếng Hoa.pdf`.
  Có 82 trang; số trang dưới đây tính từ trang đầu PDF, bắt đầu bằng 1.
- SHA-256 PDF: `a15542888bd501010939d66c83ab9d3383bafcf101944c0a2ec5d083dde9f4b8`.
- 40 MP3, tổng 165.908.785 byte; 40 video FLV, tổng 197.787.625 byte;
  PDF 18.452.264 byte. Tổng tài liệu học khoảng 364,4 MiB.
- MP3 có hai cách đặt tên: `Track_01.mp3` đến `Track_20.mp3` (bài 4–9 không
  có số 0 đầu), rồi `21_Track_21.mp3` đến `40_Track_40.mp3`.
  Video đặt tên `301 Câu đàm thoại tiếng Hoa Video bài NN.flv`, từ 01 đến 40.

Đã trích xuất văn bản toàn PDF bằng `pdftotext -enc UTF-8 -layout`, kiểm tiêu đề
các bài và xem ảnh trang 1, 35, 56. Lỗi mất dấu trong lần đọc đầu do encoding;
không cần OCR toàn bộ sách. Chưa nghe MP3 hoặc xem video để xác nhận lời,
thời lượng, mốc cắt hay sự tương ứng giữa các định dạng.

Tên thư mục ghi hanka.edu.vn; lớp văn bản PDF còn chứa tên KOKONO và nội dung
tự biên soạn CHINEMASTER ở trang 50. Chưa xác định đây là bản nguyên gốc hay
bản tổng hợp. Có đủ nhãn bài 1–40 nhưng bài 8–11 gộp ở trang 35–36; không suy
ra mỗi bài PDF tương ứng một track hay mọi bài đều có đủ năm phần.

Nguồn dùng để tham khảo nội bộ. Chưa có thông tin giấy phép phân phối kèm bộ
tài liệu; chưa sao chép PDF/MP3/video vào `public/` hoặc gói phát hành. Thư mục
nguồn được giữ local và loại khỏi Git. Nguồn này bổ sung cho các nguồn đã có,
không thay bằng chứng rà tiếng Trung/audio trong quy trình nghiệm thu hiện hành.

## Đối chiếu với 12 tình huống hiện có

ID đối chiếu từ `src/content/mvp.json`. “Chưa xác định” nghĩa là chưa tìm được
tham chiếu đủ trực tiếp trong lượt khảo sát, không khẳng định toàn bộ nguồn
không có nội dung đó. Các liên hệ đều theo chủ đề, chưa xác nhận từng câu.

| Tình huống / bài câu trong game | Bài và trang PDF | Hướng dùng |
| --- | --- | --- |
| `greeting` / không có bài câu riêng | 1–2, tr. 1–8 | Chào hỏi và phép lịch sự; giữ bối cảnh gặp mentor |
| `introduction` / `lesson-1` | 4–5, tr. 14–22 | Tên, thân phận sinh viên, giới thiệu bạn cùng phòng |
| `repeat` / không có bài câu riêng | Chưa xác định | Giữ nguồn hiện tại; biên soạn yêu cầu nhắc lại riêng |
| `checkin` / `lesson-2` | Chưa xác định | Giữ tình huống nhận phòng ký túc; không suy từ câu chào hỏi |
| `room_problem` / `lesson-3` | Chưa xác định | Giữ mục tiêu báo đèn hỏng; không thay bằng hỏi kích thước phòng |
| `order_water` / `lesson-4` | 18, tr. 46 chỉ liên quan ăn uống | Chưa có tham chiếu trực tiếp cho yêu cầu một cốc nước nóng |
| `quantity` / `lesson-5` | 12, tr. 37–38 | Tham khảo cách nói số lượng; đổi ngữ cảnh áo len sang bánh bao và rà lượng từ |
| `price` / `lesson-6` | 12, tr. 38; 24, tr. 54 | Hỏi giá; giữ đối tượng “món đồ này” trong quest mua đồ |
| `directions` / `lesson-7` | 25–26, tr. 55–58 | Vị trí, hướng đi, địa điểm; đổi đích đến thành thư viện |
| `schedule` / `lesson-8` | 8–11 gộp, tr. 35–36; 24, tr. 54 | Hỏi giờ, lịch hẹn và giờ vào học; không coi giờ đi làm là giờ học |
| `parcel` / `lesson-9` | Chưa xác định | Giữ nội dung nhận bưu kiện đã có; không gán bài hỏi đường tới bưu điện |
| `invitation` / `lesson-10` | 8–11 gộp, tr. 36; 18, tr. 46 | Lời mời và hẹn giờ; giữ ngày mai/cùng nhau/ăn cơm của quest cuối |

## Cách bổ sung vào trải nghiệm học

Hai phương án được cân nhắc: chuyển cả 40 bài thành tiến trình mới, hoặc chọn
phần liên quan để làm sâu các tình huống đang có. Chọn phương án thứ hai vì
phù hợp bảy ngày đầu và tái sử dụng NPC, quest, sổ tay, lịch ôn. Mở rộng 40 bài
thành chương riêng thuộc phạm vi sau MVP.

Ưu tiên biên soạn theo thứ tự: chào hỏi/giới thiệu ngày 1 → hỏi đường/giờ học
ngày 3 → giá/số lượng ngày 4 → lời mời ngày 6–7. Nhận phòng, báo hỏng, gọi
nước và bưu kiện tiếp tục dùng nội dung hiện tại cho tới khi có nguồn phù hợp.

Mỗi phần được biên soạn theo cấu trúc người dùng đề xuất:

| Phần | Áp dụng vào game và dữ liệu hiện có |
| --- | --- |
| Mẫu câu | Gắn `scenarios.positive` với `utterances`; giữ chữ Hán, pinyin, nghĩa và ý định |
| Đàm thoại | Dùng `prompt`/`reply` và ngữ cảnh NPC; người chơi phải tự diễn đạt trước khi có phản hồi |
| Từ vựng | Chọn từ cần cho mục tiêu, đưa vào gợi ý mức 2; bảng từ riêng là phần cần triển khai thêm |
| Ngữ pháp | Giải thích ngắn sau lần thử hoặc khi người chơi yêu cầu; phần ghi chú riêng chưa có trong schema |
| Bài tập | Tái sử dụng `sentenceLessons` và ôn sổ tay; câu sai/thiếu ý có gợi ý, thử lại được |

Ví dụ bàn giao cho `directions`: mục tiêu tìm thư viện → nhìn thấy mentor và
biển chỉ dẫn → hỏi vị trí bằng nói hoặc IME → NPC xác nhận/nhắc phần thiếu →
engine ghi bước quest và sổ tay theo luật hiện có. Giữ ba mức hint, cho đóng
rồi mở lại, luyện lại không cộng thưởng; không thêm điều kiện phải học hết
giáo trình để mở quest. Câu hỏi địa điểm khác chỉ được nhận khi đích đến khớp
mục tiêu; tài liệu tham khảo không tự mở rộng bộ chấp nhận câu.

## Kiểm tra trước khi tích hợp nội dung và audio

1. Lưu bài/trang, câu biên soạn, ID game, pinyin, nghĩa, đáp án/biến thể và
   trạng thái rà cho từng mục. Giữ ID hiện hành; chỉ sửa trường/schema cần thiết.
2. Rà câu và bản dịch theo ngữ cảnh. Trang 56 có câu `这个故事精彩吗？`
   nhưng dịch thành “Câu chuyện này rất đặc sắc.”; đây là câu hỏi, cần sửa nghĩa
   trước khi sử dụng. Không lấy mọi câu hoặc pinyin từ bản tổng hợp làm đáp án chuẩn.
3. Với MP3/video: nghe/xem, xác nhận bài, transcript và người nói, rồi mới ghi
   mốc bắt đầu/kết thúc và ánh xạ utterance. Không gán track theo số tên tệp.
4. Nếu dùng bản thu nguồn trong sản phẩm, cần thông tin quyền sử dụng và
   manifest/license/hash tương ứng. Nếu dùng audio tổng hợp hiện tại, tiếp tục
   ghi đúng nguồn tổng hợp; MP3 tham khảo không tự xác nhận audio đó đã đạt.
5. Khi dữ liệu chạy thay đổi, chạy `npm run test:content`, typecheck và kiểm
   logic liên quan: câu đúng, sai đích, thiếu slot, phủ định, luyện lại, save/load.
   Nhờ người có năng lực rà mẫu câu/pinyin/nghĩa/audio theo gate hiện hành.
6. Bàn giao playtest ngắn tại mentor, cửa hàng và lời mời: người chơi hiểu mục
   tiêu, tự sửa sau gợi ý, tiếp tục quest, reload giữ tiến trình và ôn sau kết thúc.
   Chưa có kết quả playtest hay rà audio mới từ lần bổ sung nguồn này.

Các tài liệu kế hoạch/AC/TSK chuẩn vẫn thuộc phiếu Bint; bản bổ sung nguồn này
không thay trạng thái, ngưỡng hay kết quả nghiệm thu đã ghi.
