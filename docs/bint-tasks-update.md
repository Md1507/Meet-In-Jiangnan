# Công việc
Đồng bộ ngày 13/11/2026 với game-dev cho phiếu `01M78EYZ58EHGP3R83ZKVZ0AVH`. Giữ ID và checkbox TSK-1..24 của lịch sử, không coi chúng là đo lại trên bản hiện tại. Thêm TSK-25..30 cho thiết kế, cảm giác chơi, art/content và playtest; tất cả việc mới chưa hoàn thành.

M0–M4 là milestone sản phẩm, sáu bước game-dev là quy trình của từng lát cắt. Tiếp tục phần game/art/content độc lập khi chờ AI/thiết bị/người rà; phần phụ thuộc trực tiếp và đóng M4 vẫn cần đủ gate. Không chạy lại việc đã làm hoặc tự mở rộng phạm vi. Phiếu tổng/phiếu kỹ thuật đang có giữ b-do, trạng thái và quyền kiểm chứng hiện hành.

Phân công chính: design TSK-25; gameplay TSK-1..9/12/15..17/26 theo phần logic; art TSK-10/27; content TSK-11/13/14 theo phần dữ liệu/20/28; polish TSK-18/19/21..24/29/30 và tích hợp; review đối chiếu tất cả. TSK nhiều phần được chia thành đầu việc của phiếu con khi thực thi, giữ ánh xạ ID nguồn. Mỗi việc dưới đây vẫn là hợp đồng v1 với AC và điều kiện xong.

## M0 — Kiểm chứng kỹ thuật
- [x] TSK-1 [AC-1]: (Liên quan thêm AC-13.) Dựng TypeScript, Vite, PixiJS và các script kiểm chứng trong phạm vi đã cho — xong khi: mở được một cảnh desktop, typecheck/build chạy được và package-lock khóa phiên bản tương thích.
- [ ] TSK-2 [AC-9]: (Liên quan thêm AC-10, AC-13.) Dựng ModelManager và worker, thử Whisper Tiny đa ngôn ngữ cùng Qwen3 0.6B ONNX bằng dtype phù hợp — xong khi: hai model suy luận thật tại browser, có manifest revision/hash/license/byte, gói AI không quá 800 MiB và không tải mọi biến thể.
- [ ] TSK-3 [AC-5]: (Liên quan thêm AC-9, AC-14.) Spike thu âm, giải mã, resample và nhận tiếng Trung — xong khi: thu tối đa 20 giây, nghe lại, chặn mẫu im lặng, dừng track khi đóng và có transcript từ model cho ít nhất 5 câu thử tại máy.
- [ ] TSK-4 [AC-6]: (Liên quan thêm AC-7.) Spike IME và Hanzi Writer với một chữ mục tiêu — xong khi: nhập và chọn chữ bằng Chinese Pinyin IME thật không gửi nhầm Enter, đồng thời hoàn thành được cả ba chế độ nét trên chữ 我.
- [ ] TSK-5 [AC-14]: (Liên quan thêm AC-9, AC-13.) Lập bộ nhãn độc lập và đo khả thi AI trên máy chuẩn — xong khi: có đủ 60 câu và 40 đoạn audio theo plan.md, báo kết quả chất lượng, cold/warm latency, memory cùng version phần cứng/phần mềm; chưa qua ngưỡng thì chưa đóng mốc M0.

## M1 — Vòng chơi nhà ăn hoàn chỉnh
- [x] TSK-6 [AC-1]: (Liên quan thêm AC-11.) Tạo cảnh nhà ăn, di chuyển, va chạm, NPC và lớp HTML hội thoại — xong khi: đi bằng WASD/phím mũi tên, dùng E mở NPC, focus ô nhập khóa di chuyển và chữ Hán/pinyin rõ ở 1280x720.
- [x] TSK-7 [AC-4]: (Liên quan thêm AC-9.) Tạo DialogueScenario và IntentEvaluator kết hợp dữ liệu biên soạn với model — xong khi: cảnh gọi nước nhận 3 biến thể đúng, từ chối câu phủ định, validate schema và bỏ kết quả worker của hội thoại đã đóng.
- [x] TSK-8 [AC-2]: (Liên quan thêm AC-5, AC-8.) Ghép một nhiệm vụ gọi món với mentor và luyện nói — xong khi: chơi trọn đi tới quán, nghe mẫu, thu hoặc gõ câu, nhận phản ứng, nhận thưởng đúng một lần và lưu câu vào sổ tay có mức gợi ý.
- [x] TSK-9 [AC-12]: (Liên quan thêm AC-10.) Dựng lưu cơ bản cùng đường chơi khi model lỗi — xong khi: lỗi model không mất bước nhiệm vụ, chuyển nhập chữ được và tải lại phục hồi cảnh gọi món với tiến bộ đã có.

## M2 — Chương bảy ngày
- [x] TSK-10 [AC-11]: (Liên quan thêm AC-1.) Sản xuất và nối đủ sáu khu vực theo art brief Giang Nam hiện đại — xong khi: đi qua mọi cửa nối, không xuyên vật cản và mỗi vùng có asset nhận diện riêng cùng nguồn/license.
- [ ] TSK-11 [AC-2]: Viết dữ liệu sáu NPC và sáu nhiệm vụ trong bảy ngày — xong khi: walkthrough từ nhập học tới ngày đón tân sinh viên hoàn tất, mentor giảm hỗ trợ và nhiệm vụ cuối có nói, viết câu cùng viết tay.
- [x] TSK-12 [AC-3]: (Liên quan thêm AC-2.) Dựng thời gian ba buổi, lịch NPC, bốn sinh hoạt và bốn sự kiện có điều kiện — xong khi: cùng seed và hành động cho cùng chuỗi sự kiện, cooldown/ngày đúng, có hẹn lại và không sự kiện nào chặn truyện.
- [x] TSK-13 [AC-4]: (Liên quan thêm AC-14.) Biên soạn đủ mười hai tình huống với biến thể đời thường và thông tin bắt buộc — xong khi: mỗi cảnh có ít nhất 3 câu đúng, 1 sai ý, chữ Hán/pinyin/nghĩa/ngữ cảnh/audio đầy đủ và test ý định cho tất cả cảnh qua.

## M3 — Viết và củng cố kỹ năng
- [ ] TSK-14 [AC-6]: Làm đủ mười bài viết câu, phản hồi ý định và thành phần còn thiếu — xong khi: hoàn thành được 10 bài qua IME, không mất câu khi composition và phản hồi phân biệt câu sai ý với câu đúng nhưng diễn đạt khác.
- [x] TSK-15 [AC-7]: (Liên quan thêm AC-11.) Bundle dữ liệu hai mươi chữ và triển khai ba chế độ luyện nét — xong khi: từng chữ có nét mẫu và thứ tự hợp lệ, viết sai được gợi ý/thử lại, không gọi CDN dữ liệu và giữ đủ giấy phép engine cùng dữ liệu.
- [x] TSK-16 [AC-8]: (Liên quan thêm AC-12.) Dựng sổ tay, ba mức mentor và lịch ôn 1/3/7 ngày — xong khi: nói, viết câu và viết tay có tiến bộ riêng; câu sửa transcript không tính thành ASR chưa sửa, lịch ôn đến hạn cả khi tiếp tục sau ngày 7.
- [x] TSK-17 [AC-12]: Hoàn thiện IndexedDB, version, backup, export/import — xong khi: reload khôi phục đầy đủ state nêu trong AC-12, save hỏng phục hồi bản trước, import sai schema bị từ chối và xóa model không làm mất save.

## M4 — Hoàn thiện và nghiệm thu
- [ ] TSK-18 [AC-10]: Hoàn thiện tải lười, progress, hủy/thử lại, cache version và fallback — xong khi: các ca 404, quota, mất mạng, device lost, thiếu WebGPU/WASM và timeout đều có đường tiếp tục giữ tiến độ; tác vụ quá 20 giây hủy được.
- [ ] TSK-19 [AC-9]: (Liên quan thêm AC-10.) Self-host runtime, weights, font và dữ liệu, bổ sung offline cache và kiểm lưu lượng — xong khi: sau khi cache đủ có thể reload offline và hoàn thành một nhiệm vụ, network log không có upload audio/text/nét viết hay truy cập hub/CDN/ASR ngoài.
- [ ] TSK-20 [AC-14]: (Liên quan thêm AC-11.) Hoàn thiện art, audio mẫu và rà nội dung ngôn ngữ — xong khi: 100% nội dung bắt buộc được người có năng lực tiếng Trung rà và ghi nhận, audio khớp lời, 30 đầu ra model có ít nhất 27 đầu ra phù hợp và bảng nguồn/license đầy đủ.
- [ ] TSK-21 [AC-1]: (Liên quan thêm AC-5, AC-6, AC-7, AC-10.) Kiểm khả dụng bàn phím, IME thật, mic, resize và browser — xong khi: hai độ phân giải trong plan.md đọc rõ, focus/Enter đúng, mic từ chối hoặc bị rút không treo và có biên bản Chromium/Edge cùng smoke Firefox/Safari đường chơi chữ.
- [ ] TSK-22 [AC-13]: Đo FPS và ngân sách tải, tối ưu cảnh cùng tác vụ AI — xong khi: cảnh 10 NPC đạt trung vị ít nhất 50 FPS trong 60 giây trên cấu hình ghi rõ, gói mở chơi không quá 30 MiB và manifest AI không quá 800 MiB, có báo cáo khi suy luận đồng thời.
- [ ] TSK-23 [AC-13]: (Liên quan thêm AC-2, AC-3, AC-4, AC-8, AC-12.) Hoàn thiện unit/content/E2E và script verify:mvp — xong khi: lệnh kiểm chứng đã được người xác nhận trước khi chạy, toàn bộ kiểm tra logic và nội dung trong plan.md qua, hai walkthrough độc lập bằng nói và bằng gõ đều không kẹt truyện.
- [ ] TSK-24 [AC-14]: (Liên quan thêm AC-5, AC-9, AC-13.) Nghiệm thu model thật và tổng hợp bằng chứng theo AC — xong khi: bộ 60 câu đạt ít nhất 54 đúng, ít nhất 27/30 câu hợp ý được nhận và tối đa 2/30 sai ý được nhận; audio đạt 18/24 câu đúng, nhận sai tối đa 1/8 câu sai và 0/8 nhiễu; p95 ASR không quá 15 giây và LLM không quá 12 giây theo giao thức, mọi AC có bằng chứng trong docs và giới hạn còn lại được ghi rõ.


## Bổ sung — thiết kế và chất lượng game

- [ ] TSK-25 [AC-2]: (design; liên quan thêm AC-3, AC-8; thực hiện trước phần game bổ sung.) Đối chiếu chương hiện có với mục tiêu bảy ngày, vòng chơi và nhịp hỗ trợ trong plan — xong khi: mỗi ngày có mục tiêu, hành động, phản ứng/kết quả, lựa chọn phụ và đường tiếp tục; TSK được giao cho gameplay/art/content/polish, chỉ rõ phần tái sử dụng và phụ thuộc kỹ thuật/nghiệm thu còn mở.
- [ ] TSK-26 [AC-1]: (gameplay; liên quan thêm AC-2, AC-12; phụ thuộc TSK-25.) Hoàn thiện cảm giác điều khiển, chỉ dẫn mục tiêu, tương tác và phản hồi trong phần còn thiếu — xong khi: mỗi tương tác chính có dấu hiệu có thể thấy, E/focus/đóng UI hoạt động nhất quán, chuyển cảnh không kẹt vật cản, đúng/sai/hủy có phản hồi và thử lại/reload không mất tiến trình hoặc nhận thưởng lặp; có bằng chứng kỹ thuật và checklist để người dùng kiểm cảm giác chơi.
- [ ] TSK-27 [AC-11]: (art; liên quan thêm AC-1; phụ thuộc brief TSK-25 và hợp đồng gameplay.) Rà tính nhất quán art của sáu khu vực, NPC và UI, chỉ sửa/sản xuất tài nguyên còn thiếu — xong khi: có bảng asset ID/path/size/frame/pivot/nguồn/license/nơi dùng, từng cảnh có mốc nhận diện và lối đi rõ, asset cuối được nạp thật, chữ Hán/pinyin không cắt ở hai viewport trong plan, các mục chờ người dùng xem được ghi rõ.
- [ ] TSK-28 [AC-2]: (content; liên quan thêm AC-3, AC-4, AC-6, AC-7, AC-8, AC-14; phụ thuộc TSK-25 và ID gameplay/art.) Rà kịch bản, pacing và gắn bài học với việc trong thế giới — xong khi: mỗi quest có nhánh vào/chưa đủ điều kiện/sai/hủy/đã xong, không nhánh cụt hoặc lặp vô nghĩa; đủ số nội dung theo AC, hint giảm dần nhưng mở lại được, bài câu/nét dùng trong truyện, text/pinyin/nghĩa/audio có nguồn và trạng thái rà trung thực; không dùng kết quả schema thay duyệt ngôn ngữ.
- [ ] TSK-29 [AC-1]: (polish; liên quan thêm AC-2, AC-3, AC-8, AC-11; phụ thuộc lát cắt TSK-26..28 đủ để chơi.) Bàn giao playtest để người dùng thực hiện và xử lý phản hồi trong phạm vi — xong khi: người dùng có bản build/revision, điểm vào/save và checklist làm quen/nhà ăn/chương/kỹ năng/phục hồi, phản hồi đã nhận có bước tái hiện và mức cản trở, lỗi được sửa/đối chiếu hoặc ghi rõ còn mở; thời lượng/nhịp chơi có ghi nhận thực tế nếu đã đo, không tự điền kết quả khi chưa được cung cấp.
- [ ] TSK-30 [AC-9]: (polish; liên quan thêm AC-5, AC-6, AC-10, AC-13, AC-14; trước nghiệm thu tổng.) Đồng bộ kết quả kỹ thuật và nghiệm thu trên snapshot cuối, phối hợp phiếu kỹ thuật đang có mà không làm chồng phạm vi — xong khi: .27/.28 của phiếu 01M7A5E5VAK7KM5VWYPMF6T3GC được đối chiếu trạng thái mới nhất, chỉ kết quả đã tích hợp/đo đúng revision mới được dùng; verify/privacy/model/corpus/thiết bị/người rà được phân đạt hoặc chưa đạt bằng bằng chứng thật, không land/approve/đóng gate thay người dùng.

## Bằng chứng lịch sử và phần còn lại

Các ghi nhận bên dưới thuộc checkpoint trước lần đồng bộ này, không mô tả tất cả kết quả mới của phiếu kỹ thuật. Review 5 của phiếu kỹ thuật đã có số đo model/latency/memory mới nhưng còn medium .27 và low .28, chưa land và chưa thay nghiệm thu trên cây gốc. Đọc task show/checkpoint mới nhất trước khi xử lý; không lấy lỗi khởi tạo model cũ làm blocker hiện tại nếu đã có bằng chứng mới. Các checkbox cũ không được đánh dấu thêm trong lần sửa kế hoạch.
- `docs/mvp-completion-status.md`: đối chiếu 14 AC, phạm vi chứng minh và giới hạn; không coi kết quả fallback bằng chữ là nghiệm thu AI.
- `docs/evidence/gate-m2.json`, `gate-m3.json` và `chapter-cases/`: chạy UI thực cùng assertion engine, gắn revision build/source. Chương bàn phím, 10 bài/20 quiz con trỏ, lịch ôn và save qua.
- `docs/evidence/chapter-built-diagnostic.json`: ba browser engine qua đường chữ trên HTTPS; Chromium hoàn thành quest offline. 10 nhân vật, median60.006 FPS/60.014s trên AMD Radeon D3D11, cấu hình/driver ghi rõ. Chưa đo khi suy luận đồng thời nên TSK-22 vẫn mở.
- `docs/evidence/chapter-technical-check.log`: kiểm tra kỹ thuật narrow `verify:m0-m1`, không phải lệnh tổng đã được người xác nhận.
- TSK-2/5/24: Qwen WebGPU init lỗi9950264, Whisper thực có transcript nhưng chất lượng chưa qua; corpus60/40 và warm latency/memory chưa đủ. TSK-3/4/14/21 còn kiểm thiết bị thật; người dùng xác nhận chưa có người rà hoặc chưa kiểm được thiết bị.
- TSK-11: cấu trúc bảy ngày và ending bàn phím đã triển khai/qua UI; chưa dùng đó để đóng toàn bộ việc có bước nói trong kết thúc. TSK-18/19 còn fault matrix và network trace HTTPS đủ mọi đường dữ liệu khi model thực chạy. TSK-20 chờ người rà thật, không tự duyệt audio tổng hợp. TSK-23 chưa có hai walkthrough thiết bị thật và lệnh verify tổng chưa xác nhận.
- Hai finding medium .13/.14 đã sửa kèm16 regression contract tests. Finding high về MVP chưa nghiệm thu vẫn còn; không tự đánh dấu done.
