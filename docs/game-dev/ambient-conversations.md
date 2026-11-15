# Hội thoại đời thường với NPC phụ

Ngày 14/11/2026. Theo yêu cầu mới: NPC hỏi, người chơi tự trả lời, luôn có gợi ý;
đúng ý là đủ, không bắt chép nguyên câu mẫu. Bản đầu đã tích hợp vào game.

## Tính khả thi và lựa chọn

Game đã có phím E, hội thoại HTML, ba mức hint, microphone/ASR local và save.
Chín nhân vật nền đã có trong cảnh; bản này dùng bốn vị trí trong số đó làm
NPC trò chuyện, không thêm bản đồ hoặc tăng số sprite cho cảnh benchmark.

| Phương án | Lợi ích | Chi phí / giới hạn | Quyết định |
| --- | --- | --- | --- |
| Hội thoại tự sinh hoàn toàn | Chủ đề và cách trả lời mở rộng | Model nhỏ còn phải đo chất lượng, độ trễ, phủ định và tính nhất quán | Chưa dùng cho bản đầu |
| NPC có câu hỏi và nhánh biên soạn; nhận nhiều cách diễn đạt | Có phản hồi tức thì, chạy offline, kiểm được lời thoại và thử lại | Phạm vi hiểu hữu hạn; cần bổ sung biến thể từ playtest | Đã triển khai |

Mỗi lượt nhận ý theo câu hỏi hiện tại, từ đồng nghĩa, chủ ngữ có thể lược bỏ,
trật tự thông dụng và cách trả lời ngắn. Không so độ giống câu mẫu theo phần trăm.
Có thể từ chối hoặc nói chưa quen; đó là nhánh hợp lệ. Các câu hỏi về địa điểm,
sở thích và mục đích vẫn cần thông tin liên quan. Chưa hiểu thì hỏi lại trung tính,
không kết luận người chơi sai ngữ pháp/phát âm. Chưa có cơ chế hiểu mọi cách nói
tự nhiên hoặc chấm chất lượng ngôn ngữ bằng model.

## Nội dung đã có

| NPC | Nơi gặp | Hai lượt hỏi | Các hướng trả lời |
| --- | --- | --- | --- |
| Sinh viên An | Thư viện | Có phải sinh viên mới? Muốn đi đâu? | Mới đến/không phải; địa điểm hoặc chưa quyết định |
| Cô Bình | Phố cửa hàng | Thích cuộc sống ở đây không? Có sở thích gì? | Thích/chưa quen/không thích; hoạt động hoặc chưa có sở thích |
| Ông Trần | Vườn | Hôm nay có bận không? Muốn ngồi nghỉ không? | Bận/rảnh; nhận lời/từ chối |
| Bảo vệ | Cổng trường | Đến làm gì? Có mang thẻ sinh viên không? | Học/tìm bạn/nhận hàng; có/chưa mang/quên mang |

Có 8 câu hỏi, 17 nhánh trả lời, 17 câu mẫu và 17 phản hồi: tổng 42 voiceline.
Text/pinyin/nghĩa ở `src/content/ambient-dialogues.json`. Audio WAV local ở
`public/audio/ambient/`, hash/transcript/nguồn ở `public/licenses/ambient-audio.json`.
Giọng Microsoft Huihui Desktop qua Windows SAPI, tổng hợp cục bộ, chưa có người
rà ngôn ngữ/audio. Không dùng các đoạn MP3 chưa đối chiếu trong bộ sách.

Phản hồi người dùng: giọng hiện tại chưa phù hợp giới tính của từng NPC. Theo
yêu cầu người dùng, để chỉnh ở đợt polish audio sau: chọn giọng theo giới tính,
độ tuổi và vai trò nhân vật, rồi nghe rà độ nhất quán trước khi thay bộ WAV.

Phản hồi bổ sung: giọng đọc thiếu ổn định, nghe như các từ bị ghép lại, không
liền mạch. Đây là vấn đề chất lượng tổng hợp/ngắt nhịp riêng với việc chọn giới
tính; nguyên nhân chính xác chưa được xác nhận bằng nghe đối chiếu. Script hiện
tổng hợp cả câu trong một lần gọi SAPI, không nối các tệp audio từng từ. Đợt
polish cần so sánh giọng/bộ TTS khác và cách xử lý dấu câu, tốc độ; nghe kiểm cả
câu hỏi, câu mẫu và phản hồi ở tốc độ thường/chậm, chú ý nhịp câu, thanh điệu,
độ liền mạch, âm lượng và sự nhất quán giữa các câu. Không coi đổi giới tính,
pitch hay giảm tốc độ là đã sửa xong lỗi này.

Nguồn chủ đề: [bộ 301 câu](../learning-sources/301-conversation.md); câu hỏi và
nhánh được biên soạn cho bối cảnh game, không nhập toàn bộ giáo trình.

## UX và luật hoạt động

1. NPC có nhãn “Trò chuyện · E”, đứng ở lối đi phía dưới. Bản đồ ghi nơi gặp.
   Đến gần, nhấn E; game chọn NPC gần nhất và mở thẳng câu hỏi đầu.
2. Có chữ Hán, pinyin/nghĩa theo cài đặt, Nghe NPC và Nghe chậm. Không tự phát
   âm thanh. Gợi ý 1 nhắc ý, 2 cho từ khóa, 3 hiện các câu mẫu và nút nghe;
   gợi ý không điền hộ ô trả lời.
3. Người chơi gõ hoặc thu ≤20 giây. Bản chép hiện ra để kiểm tra/sửa trước khi gửi.
   Không dùng được mic/model vẫn gõ tiếp được. Bản chép không phải điểm phát âm.
4. Hiểu ý → phản hồi đúng nhánh, có thể nghe; nút Tiếp theo giữ quyền điều khiển
   nhịp cho người chơi. Chưa hiểu → giữ câu đang soạn, mở gợi ý và thử lại.
5. Esc/tạm biệt lúc nào cũng được. Save chỉ lưu chỉ số lượt đã hiểu cho từng NPC;
   mở lại/reload tiếp tục câu kế. Hoàn thành cho phép trò chuyện lại với câu trả lời khác.
6. Hội thoại tự chọn không thay quest, quan hệ, điểm kỹ năng hoặc điều kiện kết thúc.
   Trả lời bằng chữ không bị ghi thành luyện nói. Không lưu bản thu hoặc toàn văn
   câu trả lời của phần này vào save. Gửi lặp không bỏ qua câu tiếp theo.

Ví dụ bảo vệ: câu mẫu là `我来拿快递。`; người chơi nói `来领取我的包裹`
vẫn nhận phản hồi nhắc chuẩn bị mã lấy hàng. Với ông Trần, `今天我没空` và
`不坐了谢谢` là hai câu trả lời hợp lệ, không bị ép nhận lời ngồi lại.

## Kỹ thuật và kiểm chứng

- `ambient.ts`: dữ liệu, nhận ý theo lượt, chuyển lượt và kiểm progress.
- `ambient-panel.ts`: hội thoại, hint, audio, IME, thu/chép, hủy và dọn tài nguyên.
- `app.ts`: nhãn, phím E/chọn người gần nhất và bản đồ; dùng thế giới hiện có.
- `engine.ts`: trường `chats` tùy chọn trong save v2. Save cũ thiếu trường vẫn hợp lệ;
  kiểm ID, số nguyên và giới hạn lượt trước khi nhận save mới.
- `scripts/build-ambient-audio.ps1`: tái tạo audio bằng giọng tiếng Trung local đã cài.
  Chạy trên Windows: `powershell -NoProfile -File scripts/build-ambient-audio.ps1`.
- `npm run test:content`: kiểm cả nội dung cũ và NPC phụ, nguồn, transcript,
  hash, header/thời lượng WAV. Audio mới 5,93 MiB; gói chơi đo được khoảng
  13,2 MiB, dưới giới hạn 30 MiB hiện hành.
- Typecheck, build và toàn bộ 63 unit test đã qua. Unit mới kiểm câu khác mẫu,
  phủ định/ngữ cảnh, trạng thái lượt, gửi lặp, save cũ và export/import.
- `scripts/ambient-browser-check.js` chạy như expression qua Orca eval trên
  origin dev thử riêng `http://127.0.0.1:5180/`: bốn NPC qua gợi ý, câu chưa hiểu,
  câu khác mẫu, IME Enter mô phỏng, đóng/mở, tải/giải mã giọng đọc và E ở cổng.
  Đã kiểm reload giữ progress; viewport 1280×720 được kiểm bố cục. Tự focus ô
  nhập dùng `preventScroll` để giữ câu hỏi ở đầu bảng khi mở lượt mới.

Đây là kiểm kỹ thuật và UX smoke, chưa phải người dùng playtest hay IME/mic thật.
Không thay gate hoặc kết quả nghiệm thu đã ghi cho chương chính.

## Người dùng thử tiếp

- Tìm mỗi người bằng bản đồ/nhãn và phím E; xem có khó phân biệt NPC nhiệm vụ với
  NPC trò chuyện không. Quan sát số lần đi nhầm hoặc không nhận ra người có thể nói chuyện.
- Trả lời bằng cách nói tự nhiên của mình; ghi nguyên câu và câu hỏi khi NPC chưa hiểu.
  Ưu tiên bổ sung biến thể hợp ý bị bỏ sót, không hạ kiểm phủ định hoặc nhận mọi từ trùng.
- Thử đủ ba mức hint; nhận xét có thể tự sửa sau từ khóa hay phải xem toàn câu.
- Thử cả đồng ý và từ chối; Esc giữa hai lượt, tải lại rồi tiếp tục, hoàn thành và luyện lại.
- Thử microphone/IME thật, nghe giọng ở âm lượng/chậm khác nhau. Rà nghĩa, pinyin,
  lời đọc và độ tự nhiên trước khi coi phần học mới đã được nghiệm thu.

Chưa có baseline độ khó hoặc thời gian hoàn thành từ người chơi. Nếu thường xuyên
bị hỏi lại dù trả lời đủ ý, mở rộng bộ hiểu theo các câu đã ghi; đánh giá model ngữ
nghĩa cho bước sau khi có bộ câu độc lập và bằng chứng độ trễ/chất lượng phù hợp.
