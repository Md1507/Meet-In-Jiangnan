# Yêu cầu

Đồng bộ ngày 13/11/2026 cho phiếu `01M78EYZ58EHGP3R83ZKVZ0AVH` và workflow `game-dev`.
Các AC-1..AC-14 giữ nguyên hợp đồng hiện hành; cập nhật này bổ sung đặc tả phát triển game và cách kế thừa hiện trạng.

## Mục tiêu và phạm vi
Tạo game nhập vai đời sống trên trình duyệt bằng PixiJS, đồ họa pixel nhìn từ trên xuống, lấy việc thực hành tiếng Trung làm cách tương tác với thế giới. Người chơi là sinh viên nhận học bổng sang đại học Trung Quốc năm 2026 và bắt đầu học ngôn ngữ khi đến nơi; mentor đi cùng trong hành trình thích nghi. Vòng lặp: gặp nhu cầu đời sống → nghe/đọc → tự nói hoặc viết → thấy phản ứng của NPC → nhận gợi ý → thử lại → dùng lại trong tình huống mới.

Phạm vi triển khai của phiếu là MVP “7 ngày đầu du học”, dự kiến 60–90 phút cho lượt đầu, chia thành phiên 10–20 phút; đây là mục tiêu thiết kế cần người dùng playtest. Dự án đã có chapter, nội dung, đồ họa và lưu tiến trình; phần việc tiếp theo kế thừa mã/tài nguyên đã có, không dựng mới mặc định. Lần đồng bộ này chỉ cập nhật kế hoạch, chưa triển khai thêm. Không đặt đích đạt một cấp HSK sau bảy ngày.

Đã xác nhận từ người dùng: desktop trước, mobile sau; luyện viết gồm gõ câu qua pinyin và viết tay chữ Hán; dùng model nhẹ có sẵn chạy trực tiếp trong browser. Suy luận không phụ thuộc máy chủ AI. Tải trang và tải trọng số là tải tệp tĩnh; audio, câu nhập và nét bút ở lại thiết bị.

Tên tạm đề xuất: **Hẹn ở Giang Nam**. Trường và thành phố hư cấu thuộc vùng Giang Nam, giao diện hỗ trợ tiếng Việt, tiếng Trung phổ thông và chữ giản thể. Tên riêng chưa được chốt vẫn là đề xuất; số lượng nội dung và phong cách đã đưa vào AC hiện hành phải được giữ khi tiếp tục, không tự sửa vì kế hoạch cũ gọi chúng là đề xuất. Học bổng trong cốt truyện có giai đoạn dự bị ngôn ngữ, giải thích việc nhân vật chưa biết tiếng Trung; không mô phỏng quy chế tuyển sinh một trường có thật.

## Yêu cầu chức năng
1. **Thế giới và điều khiển.** Sáu khu vực nối bằng lối đi/chuyển cảnh: ký túc xá; cổng trường và phòng sinh viên; giảng đường và thư viện; nhà ăn; phố cửa hàng và điểm nhận bưu kiện; vườn ven kênh. WASD/phím mũi tên để đi, E tương tác, Escape đóng bảng. Khi gõ, viết hoặc nói, khóa điều khiển thế giới để tránh nhập chữ làm nhân vật di chuyển.

2. **Nhân vật và quan hệ.** Sáu NPC có lịch trình và cách nói riêng: mentor Lín lǎoshī; bạn cùng phòng Xiǎoyǔ; cán bộ sinh viên Zhōu lǎoshī; cô nhà ăn Wáng āyí; bạn bán hàng Ā Jié; người phụ trách bưu kiện Liú shīfu. Mentor có giờ hẹn và xuất hiện theo truyện; bảng trợ giúp có thể mở khi cần. Quan hệ mở thêm hội thoại và lời mời, không tăng chỉ bằng lặp một câu đúng.

3. **Cốt truyện bảy ngày.**

| Ngày | Tình huống và nhiệm vụ | Năng lực thực hành |
| --- | --- | --- |
| 1 | Mentor đón, nhận phòng và làm quen bạn cùng phòng; nhiệm vụ 1 | Chào, tự giới thiệu, nhờ nói chậm |
| 2 | Tự gọi bữa sáng ở nhà ăn; nhiệm vụ 2 | Gọi món, số lượng, cảm ơn |
| 3 | Tìm giảng đường và giới thiệu ở câu lạc bộ; nhiệm vụ 3 | Hỏi đường, tên và ngành học |
| 4 | Mua đồ dùng cho phòng; nhiệm vụ 4 | Hỏi giá, chọn số lượng, nhắn món cần mua |
| 5 | Nhận bưu kiện và nhờ bạn giúp; nhiệm vụ 5 | Báo tên, xác nhận thông tin, mô tả ngắn |
| 6 | Chuẩn bị bảng nhắn và lời mời cho ngày đón tân sinh viên; phần đầu nhiệm vụ 6 | Viết câu, luyện chữ và hẹn thời gian |
| 7 | Hoàn tất nhiệm vụ 6: chủ động mời bạn, mua món đã hẹn, ghi lời nhắn | Vận dụng trong hoàn cảnh mới, mentor giảm gợi ý |

Nhiệm vụ cuối có bước nói, viết câu và viết tay; có lựa chọn tiếp tục bằng bàn phím khi không dùng được microphone, nhưng không ghi nhận là đã hoàn thành luyện nói bằng âm thanh. Lời thoại thể hiện người mới học với hỗ trợ Việt/pinyin có thể bật tắt. Không yêu cầu tự phát biểu dài ngay ngày đầu.

4. **Sinh hoạt và sự kiện.** Bốn hoạt động lặp: ăn ở nhà ăn, trò chuyện bạn cùng phòng, làm việc vặt/mua đồ, ôn với mentor. Bốn sự kiện MVP: mưa khiến đổi đường và hỏi lối; nhà ăn hết món cần đổi lựa chọn; bạn nhờ mua hộ; nhận nhầm thông báo lấy hàng cần hỏi lại. Mỗi sự kiện có điều kiện về ngày, vị trí và tiến độ; RNG có seed, cooldown theo ngày, kết quả được lưu. Không để sự kiện lấy mất vật phẩm bắt buộc hoặc chiếm NPC khiến truyện kẹt. Có ba buổi/ngày; hội thoại và bài tập không tiêu hao thời gian thực, người chơi chủ động kết thúc buổi, nhiệm vụ lỡ hẹn có lịch hẹn lại.

5. **Giao tiếp linh hoạt trong tình huống.** Mười hai tình huống: chào hỏi; giới thiệu; nhờ nhắc lại; nhận phòng; báo vấn đề trong phòng; gọi món; số lượng/yêu cầu món; hỏi giá; hỏi đường; hỏi lịch; nhận bưu kiện; mời bạn. Nhận câu người chơi tự nói hoặc gõ, xác định ý định và thông tin cần có theo cảnh; không chỉ so khớp nguyên văn câu mẫu. Ví dụ tại quán: “我要一杯热水。” (Wǒ yào yì bēi rè shuǐ.), “给我一杯热水，谢谢。” (Gěi wǒ yì bēi rè shuǐ, xièxie.) và “来杯热水吧。” (Lái bēi rè shuǐ ba.) cùng có thể yêu cầu một cốc nước nóng; “我不要热水。” thể hiện phủ định, không được chấm cùng ý. Độ tự nhiên và lịch sự tùy quan hệ, không mặc định một cách nói luôn phù hợp mọi NPC.

6. **Luyện nói tại máy.** Bấm bắt đầu/dừng rõ ràng, hiển thị trạng thái thu và giới hạn 20 giây; nghe lại, xem bản chép, thu lại hoặc sửa bản chép trước khi gửi ý định. Gắn nhãn câu đã sửa để tách khỏi kết quả ASR. Mẫu tiếng Trung có audio biên soạn, phát lại và nghe chậm; người học nghe so sánh với bản thân. Whisper Tiny là bộ nhận giọng nói, không phải bộ đo thanh điệu. MVP phản hồi mức truyền đạt ý và từ/cấu trúc; không hứa đo chính xác phát âm hay thanh điệu. Im lặng, tiếng nhiễu và ASR không chắc chắn dẫn tới yêu cầu thử lại, không quy thành lỗi kiến thức.

7. **Viết câu bằng pinyin.** Mười bài: tên sinh viên, giới thiệu ngắn, lời nhắn bạn cùng phòng, yêu cầu món, số lượng món, danh sách mua, câu hỏi giá, câu hỏi địa điểm, xác nhận bưu kiện, lời mời. Nhập chữ Hán bằng Chinese Pinyin IME của hệ điều hành vào ô HTML, có hướng dẫn bật IME; không xây bộ chuyển pinyin riêng. Pinyin có dấu dùng để hỗ trợ đọc, không coi chuỗi Latin thô là câu Hán đã viết đúng. Hỗ trợ compositionstart/compositionend và isComposing; không gửi bằng Enter khi đang chọn chữ. Phản hồi gồm đã truyền đạt được gì, phần thiếu và một cách nói tự nhiên hơn.

8. **Viết tay chữ Hán.** Hai mươi chữ mục tiêu: 你、好、我、是、学、生、人、中、国、大、小、一、二、三、口、水、日、月、来、去. Dùng chuột hoặc bút/cảm ứng khi có; ô luyện chữ lớn, hỗ trợ xóa và thử lại. Ba mức: tô nét → gợi nét → tự viết chữ đã chỉ định. Kiểm thứ tự và đường nét theo dữ liệu chữ mục tiêu, không hứa OCR tự do cả đoạn hoặc chấm thư pháp. Dùng chữ đã học vào bảng nhắn, nhãn đồ vật và tương tác, tránh tách thành minigame không liên quan.

9. **Mentor và tiến bộ.** Ba mức trợ giúp: nhắc ý cần nói → gợi từ/pinyin → mẫu câu và audio; người chơi chọn mức. Sổ tay lưu chữ, pinyin, nghĩa, audio và ngữ cảnh; ôn sau 1/3/7 ngày game, ngày 7 có thể tiếp tục chế độ sinh hoạt sau truyện để ôn mục đến hạn. Lưu riêng: giao tiếp nói đã thu âm, viết câu, viết nét; ghi mức trợ giúp và lần làm độc lập. Thất bại cho thử lại ngay; không trừ mạng, mất học bổng hoặc buộc cày tiền để học.

10. **AI cục bộ và chế độ dự phòng.** Thử Whisper Tiny đa ngôn ngữ cho ASR và Qwen3 0.6B ONNX lượng tử hóa cho phân loại ý định, gợi biến thể và hội thoại ngắn. Runtime Transformers.js/ONNX, worker riêng cho suy luận, renderer PixiJS độc lập. Model không trực tiếp cấp tiền, vật phẩm hay đặt trạng thái quest. Đầu ra phải qua kiểm tra schema, điều kiện cảnh và dữ liệu biên soạn; khi không hợp lệ thì dùng phản hồi đã soạn. Model tải riêng theo nhu cầu, có tổng dung lượng, tiến trình, hủy, thử lại và xóa cache. Giữ đường chơi bằng gõ và hội thoại biên soạn nếu máy không đáp ứng.

11. **Mỹ thuật và âm thanh.** Ảnh người dùng là tham chiếu góc nhìn, mật độ chi tiết, tỉ lệ nhân vật và cảm giác khám phá. Đề xuất tile 16×16, sprite nhân vật khoảng 16×32, phối cảnh trên xuống, bảng màu xanh cây/xám ngói/trắng tường/đỏ nhấn. Ký túc xá, cửa kính, biển phòng, điện thoại, xe đạp điện và thanh toán số trong truyện thể hiện năm 2026; phố ven kênh có mái ngói, cầu đá và sân vườn. Giữ bản sắc một vùng, mở rộng vùng khác về sau. Chữ Hán/UI học tập dùng font rõ ở độ phân giải màn hình, không ép nét chữ vào pixel thấp. Không sao chép tileset, sprite, nhân vật, bản đồ hay nhạc Stardew Valley. Âm thanh mẫu phải đúng câu, có quyền sử dụng.

12. **Lưu và khả dụng.** Lưu local bằng IndexedDB sau tương tác quan trọng và khi chuyển buổi; schema có phiên bản, backup, xuất/nhập JSON có kiểm tra. Không lưu audio sau phiên thu mặc định. Có âm lượng riêng, bật/tắt pinyin và nghĩa, nghe lại, điều khiển bàn phím và trạng thái focus rõ. Mic chỉ được yêu cầu khi người chơi bấm luyện nói. Game và model cần tải lần đầu; chế độ offline chỉ được công bố sau khi bộ tài nguyên cần thiết đã cache và đã kiểm tra.

13. **Chất lượng trải nghiệm game.** Mỗi buổi có mục tiêu rõ và lựa chọn khám phá/sinh hoạt tự nguyện; hội thoại và luyện chữ dẫn tới phản ứng của NPC hoặc thay đổi có nghĩa trong nhiệm vụ, quan hệ hay sổ tay. Giảm trợ giúp theo tiến trình nhưng luôn mở lại được. Tinh chỉnh điều khiển, dấu hiệu tương tác, chuyển cảnh, nhịp câu và phản hồi lỗi; không kéo dài phiên bằng lặp bài hoặc đợi model. Người dùng tự playtest theo checklist và ghi kết quả trên bản build cụ thể; agent không tự xác nhận đã playtest. Chi tiết ngày, đầu ra art/content và checklist ở plan.md; các TSK bổ sung ánh xạ vào AC hiện có.

14. **Tổ chức phát triển.** Mỗi lát cắt mới đi qua design → gameplay → art → content → polish → review của game-dev. Design đọc kế hoạch/checkpoint và công việc đã đạt, phân nhiệm TSK cùng hợp đồng asset/content trước khi triển khai. Các bước không liên quan ghi no-op; không mở thêm phạm vi chỉ để đủ bước. Phiếu b-do đang chạy vẫn giữ workflow cũ; phiếu game-dev mới tham chiếu kế hoạch này và chỉ nhận phần còn thiếu. Kiểm thử áp lực agent có tính phí và chạy thử workflow được bỏ theo yêu cầu người dùng; lint, kiểm chứng kỹ thuật và review của Bint giữ nguyên.

## Tiêu chí chấp nhận
- [ ] AC-1: Bản desktop chạy trên HTTPS bằng PixiJS, có 6 khu vực liên thông, di chuyển WASD hoặc phím mũi tên, va chạm và tương tác NPC bằng phím E.
- [ ] AC-2: Chơi trọn chương mở đầu 7 ngày trong năm 2026 với 6 nhiệm vụ cốt truyện, 6 NPC gồm mentor, và một kết thúc kiểm tra giao tiếp đã học.
- [ ] AC-3: Có 4 hoạt động hàng ngày và 4 sự kiện bất ngờ có điều kiện; cùng seed cho cùng chuỗi sự kiện, mỗi sự kiện tối đa một lần mỗi ngày và không khóa nhiệm vụ chính.
- [ ] AC-4: Có 12 tình huống giao tiếp đời thường; mỗi tình huống chấp nhận ít nhất 3 cách diễn đạt đúng và từ chối ít nhất 1 câu sai ý trong bộ kiểm thử.
- [ ] AC-5: Luyện nói ghi âm tối đa 20 giây, nghe lại, nhận bản chép tiếng Trung từ model tại máy và sửa hoặc thu lại; nghiệm thu smoke trên chương hiện tại với một mic thật và một ca phục hồi; không hiển thị điểm thanh điệu hay phát âm suy từ bản chép.
- [ ] AC-6: Luyện viết câu có 10 bài qua bộ gõ pinyin của hệ điều hành, hỗ trợ composition tiếng Trung; nghiệm thu smoke một bài bằng IME thật trên chương hiện tại, không gửi câu khi Enter đang chọn chữ và phản hồi theo ý định cùng thành phần câu.
- [ ] AC-7: Luyện viết tay có 20 chữ Hán, chế độ tô nét, gợi nét và tự viết chữ mục tiêu; phản hồi thứ tự nét, cho thử lại và lưu tiến bộ riêng.
- [ ] AC-8: Mentor hỗ trợ 3 mức gợi ý; sổ tay lưu câu, nghĩa, pinyin và lịch ôn sau 1, 3, 7 ngày trong game, với tiến bộ nói, viết câu và viết tay tách biệt.
- [ ] AC-9: Whisper Tiny đa ngôn ngữ và model hội thoại nhỏ được lượng tử hóa chạy trong browser qua worker; có một trace HTTPS trên bản phát hành phủ audio, câu trả lời, nét viết, ASR và LLM; toàn bộ audio, câu trả lời và nét viết không gửi lên mạng.
- [ ] AC-10: Có tiến trình tải, hủy và thử lại model, cache có phiên bản và nút xóa; mất WebGPU thử ASR bằng WASM, lỗi hoặc quá hạn chuyển sang gõ và hội thoại biên soạn mà giữ tiến độ.
- [ ] AC-11: Đồ họa pixel nguyên bản thể hiện cả đại học hiện đại năm 2026 và khu phố Giang Nam; 6 khu vực có nhận diện riêng, chữ Hán cùng dấu pinyin đọc rõ ở 1280x720 và tài sản có nguồn cùng giấy phép.
- [ ] AC-12: Tải lại khôi phục vị trí, ngày, nhiệm vụ, quan hệ và tiến bộ học; lưu có schema version, xuất nhập JSON và phục hồi bản lưu trước khi dữ liệu lỗi.
- [ ] AC-13: Lệnh npm run verify:mvp được định nghĩa để kiểm tra kiểu, nội dung, logic và luồng chơi; đo cảnh 10 NPC đạt trung vị ít nhất 50 FPS trong 60 giây trên máy chuẩn ghi rõ cấu hình, gói chơi đầu không quá 30 MiB và gói AI tải riêng không quá 800 MiB.
- [ ] AC-14: Toàn bộ nội dung học bắt buộc có chữ giản thể, pinyin có dấu, nghĩa tiếng Việt, ngữ cảnh và âm thanh mẫu; bộ kiểm chứng AI gồm 60 câu chưa dùng làm ví dụ và 40 bản ghi có nhãn, đạt ngưỡng smoke tại plan.md trước khi coi MVP hoàn tất.

## Ngoài phạm vi
Bản mobile hoàn chỉnh; nhiều người chơi; máy chủ tài khoản và đồng bộ cloud; mô phỏng cả thành phố hoặc đủ bốn mùa; nông trại và chiến đấu; huấn luyện/fine-tune model; dịch vụ AI trả phí; đối thoại vô hạn không có bối cảnh; chấm thanh điệu tự động có độ tin cậy giáo dục; OCR viết tay tự do; chứng chỉ HSK. Tính năng kiểm phát âm chuyên sâu cần một phiếu nghiên cứu và bộ dữ liệu đối chiếu riêng.

## Câu hỏi mở
Không phát sinh câu hỏi chặn cập nhật kế hoạch: desktop, IME/viết tay, model tại browser và người dùng tự playtest đã được chỉ định. Chất lượng AI, tích hợp/thiết bị và nội dung chưa đủ bằng chứng vẫn là phần việc còn mở, không phải kết quả đã được xác nhận. Giữ nguyên ngưỡng nghiệm thu; không tự thay yêu cầu người rà bằng audit tham chiếu.

