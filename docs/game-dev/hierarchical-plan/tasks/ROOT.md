# Yêu cầu — ROOT: Hoàn thiện Hẹn ở Giang Nam

Phiếu: 01M7JF6C7ESFJSP30JNK5QM01B. Loại: root. Cha: không có.

## Mục tiêu và phạm vi
Điều phối toàn bộ backlog đã phân rã; chỉ thực thi từng task lá và tổng hợp bằng chứng đúng phạm vi, giữ các kết quả MVP đã được chấp nhận.

Phạm vi ghi: `docs/game-dev/hierarchical-plan/**`. Nguồn: 14 AC phiếu MVP; yêu cầu mới chia toàn bộ plan thành cha con; mọi phiếu nguồn. Ánh xạ hợp đồng game gốc: G-AC1, G-AC2, G-AC3, G-AC4, G-AC5, G-AC6, G-AC7, G-AC8, G-AC9, G-AC10, G-AC11, G-AC12, G-AC13, G-AC14; số AC của phiếu này là độc lập.

## Yêu cầu chức năng
1. Bản desktop chạy trên HTTPS bằng PixiJS, có 6 khu vực liên thông, di chuyển WASD hoặc phím mũi tên, va chạm và tương tác NPC bằng phím E.
2. Chơi trọn chương mở đầu 7 ngày trong năm 2026 với 6 nhiệm vụ cốt truyện, 6 NPC gồm mentor, và một kết thúc kiểm tra giao tiếp đã học.
3. Dependency bắt buộc trước thực thi: A (01M7JGEDRBMFT0FV3YJPNC85MV), B (01M7JGEDZ4BW4S4D20X09NF483), C (01M7JGEE67FZHK5A1W7E6TSJ6J), D (01M7JGEECZDCXCNSJ2VJXFHJ7T), E (01M7JGEEKZ2K6QGTG2NP555EFR), F (01M7JGEEV1G7GFSKSCFM1TT8KB), G (01M7JGEF24Y6W9R7M982M8PVTC), H (01M7JGEF8Y9M6M2FQN9MW59X1E).

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
- [ ] AC-15: Campus v1 có runtime, dữ liệu terrain, shared asset library và renderer production cho đủ sáu map; conversion/camera/full actor clearance được chốt trước final art, mọi preview xuất từ đúng JSON/manifest/asset.
- [ ] AC-16: Cây task cha con và dependency được kiểm nhất quán; chỉ đóng kế hoạch tổng khi mọi phiếu nhóm và phiếu lá hoàn tất đúng bằng chứng, giữ nghiệm thu MVP và báo cáo lịch sử.

## Ngoài phạm vi
Thực thi sản phẩm trực tiếp trên phiếu tổng hợp; phiếu này điều phối các phiếu con có scope riêng.

## Câu hỏi mở
Không có câu hỏi cản trở lập kế hoạch. Điều kiện đầu vào hoặc gate đã được ghi thành dependency và tiêu chí của task tương ứng; chưa đáp ứng thì giữ pending, không mặc định đã duyệt.

---

# Kế hoạch — ROOT: Hoàn thiện Hẹn ở Giang Nam

## Nguồn và hiện trạng
14 AC phiếu MVP; yêu cầu mới chia toàn bộ plan thành cha con; mọi phiếu nguồn. Đã đọc hợp đồng MVP, báo cáo hoàn thành/TSK-30, task show của 14 phiếu nguồn và các plan pipeline/Dual-Grid. Source-snapshot.json ghi trạng thái lúc lập, không là build/test mới. MVP TSK-29 đã chấp nhận; Pinyin và M4 technical preparation đã done; campus/pipeline/street còn phần chưa tích hợp.

## Hướng triển khai và lựa chọn
Điều phối toàn bộ backlog đã phân rã; chỉ thực thi từng task lá và tổng hợp bằng chứng đúng phạm vi, giữ các kết quả MVP đã được chấp nhận.

Chọn tái sử dụng và khép khoảng thiếu theo task nhỏ đã lập thay vì dựng lại subsystem hoặc chạy cả phiếu lớn. Phiếu tổng hợp chỉ tổng hợp bằng chứng của các con; implement diễn ra ở task lá.

## Giả định và mâu thuẫn
Phiếu done không đồng nghĩa toàn bộ module đã có trong checkout thực. Runtime campus có contract tile48world-unit/world960x720/viewport960x540; terrain16px và expansion2 trước đây là ứng viên offline. C6 phải giải quyết mapping và clearance, không được đồng nhất các đơn vị hoặc tự coi scale/layout mới đã duyệt. Corpus, IME/mic và người rà còn gate riêng; hoãn sau MVP không phải đã đạt toàn bộ AC.

## Phụ thuộc và thứ tự
A (01M7JGEDRBMFT0FV3YJPNC85MV), B (01M7JGEDZ4BW4S4D20X09NF483), C (01M7JGEE67FZHK5A1W7E6TSJ6J), D (01M7JGEECZDCXCNSJ2VJXFHJ7T), E (01M7JGEEKZ2K6QGTG2NP555EFR), F (01M7JGEEV1G7GFSKSCFM1TT8KB), G (01M7JGEF24Y6W9R7M982M8PVTC), H (01M7JGEF8Y9M6M2FQN9MW59X1E)

Không chạy b-do/game-dev cho cả nhóm; chọn task lá sẵn sàng từ bảng điều phối.

## Khu vực sửa và vùng ảnh hưởng
`docs/game-dev/hierarchical-plan/**`. Liên quan G-AC1, G-AC2, G-AC3, G-AC4, G-AC5, G-AC6, G-AC7, G-AC8, G-AC9, G-AC10, G-AC11, G-AC12, G-AC13, G-AC14. Bản export tài liệu và metadata điều phối là đầu ra trực tiếp; scope sản phẩm nằm trong từng phiếu lá.

## Bước và trách nhiệm
| Bước | TSK | Đầu ra | Phụ thuộc | Bằng chứng |
| --- | --- | --- | --- | --- |
| Điều phối | TSK-1 | Hoàn thiện Hẹn ở Giang Nam | dependency của phiếu | tiêu chí AC-1 |
| Tổng hợp | TSK-2 | bàn giao đúng snapshot | đầu ra trước | report/protocol thủ công hoặc evidence task con |

Không giả làm workflow implementation; dependencies ngăn đóng phiếu tổng hợp sớm.

## Rủi ro và rollback
Rủi ro: thiếu dependency trong patch, metadata/hash lệch bytes, clearance chỉ tính điểm, callback cũ hoặc report nhầm snapshot. Kiểm theo tiêu chí task và validators thực; fail/pending không được đổi thành pass. Giữ baseline và patch riêng; rollback đúng patch/asset hoặc chọn semantic fallback, không reset cây chung/xóa tiến độ/hạ ngưỡng.

## Chiến lược kiểm chứng
Không có lệnh sản phẩm cho phiếu tổng hợp. Chỉ đánh giá tiêu chí khi mọi dependency done; tổng hợp evidence từng phiếu con.

Gate cần người thật chỉ được đóng từ protocol đã làm. Lượt lập kế hoạch chỉ chạy task lint và kiểm cấu trúc dependency; không chạy product tests, inference, benchmark, browser hoặc tự phát hành.

## Checklist nhất quán
AC-1 được TSK-1 bao phủ, điều kiện xong khớp nguyên văn. AC-2 được TSK-2 bao phủ, điều kiện xong khớp nguyên văn. AC-3 được TSK-3 bao phủ, điều kiện xong khớp nguyên văn. AC-4 được TSK-4 bao phủ, điều kiện xong khớp nguyên văn. AC-5 được TSK-5 bao phủ, điều kiện xong khớp nguyên văn. AC-6 được TSK-6 bao phủ, điều kiện xong khớp nguyên văn. AC-7 được TSK-7 bao phủ, điều kiện xong khớp nguyên văn. AC-8 được TSK-8 bao phủ, điều kiện xong khớp nguyên văn. AC-9 được TSK-9 bao phủ, điều kiện xong khớp nguyên văn. AC-10 được TSK-10 bao phủ, điều kiện xong khớp nguyên văn. AC-11 được TSK-11 bao phủ, điều kiện xong khớp nguyên văn. AC-12 được TSK-12 bao phủ, điều kiện xong khớp nguyên văn. AC-13 được TSK-13 bao phủ, điều kiện xong khớp nguyên văn. AC-14 được TSK-14 bao phủ, điều kiện xong khớp nguyên văn. AC-15 được TSK-15 bao phủ, điều kiện xong khớp nguyên văn. AC-16 được TSK-16 bao phủ, điều kiện xong khớp nguyên văn. Scope có đủ các tệp nêu ở trên. Mọi dependency có ID thật. Trạng thái planned chỉ chứng minh đủ kế hoạch, không là met của tiêu chí.

## Knowledge và MCP
Áp dụng [k:01M7FD5MSA8DHMHTYVMNVCGVBN] cho khép dependency; [k:01M7DE8V43RRQF5CG91ESM8A48] cho provenance; [k:01M7DE9PW92SQPTK2C258X2H1E] cho kế thừa MVP/gate; [k:01M7DE9NXV29H337BAG6GCG5SE] cho AI; [k:01M7DE9PM7AGR97AHC45J63GNW] cho layout trước art. Không thêm knowledge: không có phát hiện mới đủ căn cứ ngoài các mục đã tồn tại; không tạo candidate trùng.
MCP lập kế hoạch: context_for_task/context_for_paths và cite_knowledge đã dùng tại repository gốc. Chưa dùng Codegraph/DeepWiki để xác nhận source/module mới của các task tương lai; thực thi phải dùng checkout thực và ghi công cụ áp dụng/lý do không áp dụng.

---

# Công việc — ROOT

- [ ] TSK-1 [AC-1]: Điều phối toàn bộ backlog đã phân rã; chỉ thực thi từng task lá và tổng hợp bằng chứng đúng phạm vi, giữ các kết quả MVP đã được chấp nhận. — xong khi: Bản desktop chạy trên HTTPS bằng PixiJS, có 6 khu vực liên thông, di chuyển WASD hoặc phím mũi tên, va chạm và tương tác NPC bằng phím E.
- [ ] TSK-2 [AC-2]: Đối chiếu tiêu chí bằng evidence thực và ghi bàn giao trong scope — xong khi: Chơi trọn chương mở đầu 7 ngày trong năm 2026 với 6 nhiệm vụ cốt truyện, 6 NPC gồm mentor, và một kết thúc kiểm tra giao tiếp đã học.
- [ ] TSK-3 [AC-3]: Đối chiếu tiêu chí bằng evidence thực và ghi bàn giao trong scope — xong khi: Có 4 hoạt động hàng ngày và 4 sự kiện bất ngờ có điều kiện; cùng seed cho cùng chuỗi sự kiện, mỗi sự kiện tối đa một lần mỗi ngày và không khóa nhiệm vụ chính.
- [ ] TSK-4 [AC-4]: Đối chiếu tiêu chí bằng evidence thực và ghi bàn giao trong scope — xong khi: Có 12 tình huống giao tiếp đời thường; mỗi tình huống chấp nhận ít nhất 3 cách diễn đạt đúng và từ chối ít nhất 1 câu sai ý trong bộ kiểm thử.
- [ ] TSK-5 [AC-5]: Đối chiếu tiêu chí bằng evidence thực và ghi bàn giao trong scope — xong khi: Luyện nói ghi âm tối đa 20 giây, nghe lại, nhận bản chép tiếng Trung từ model tại máy và sửa hoặc thu lại; nghiệm thu smoke trên chương hiện tại với một mic thật và một ca phục hồi; không hiển thị điểm thanh điệu hay phát âm suy từ bản chép.
- [ ] TSK-6 [AC-6]: Đối chiếu tiêu chí bằng evidence thực và ghi bàn giao trong scope — xong khi: Luyện viết câu có 10 bài qua bộ gõ pinyin của hệ điều hành, hỗ trợ composition tiếng Trung; nghiệm thu smoke một bài bằng IME thật trên chương hiện tại, không gửi câu khi Enter đang chọn chữ và phản hồi theo ý định cùng thành phần câu.
- [ ] TSK-7 [AC-7]: Đối chiếu tiêu chí bằng evidence thực và ghi bàn giao trong scope — xong khi: Luyện viết tay có 20 chữ Hán, chế độ tô nét, gợi nét và tự viết chữ mục tiêu; phản hồi thứ tự nét, cho thử lại và lưu tiến bộ riêng.
- [ ] TSK-8 [AC-8]: Đối chiếu tiêu chí bằng evidence thực và ghi bàn giao trong scope — xong khi: Mentor hỗ trợ 3 mức gợi ý; sổ tay lưu câu, nghĩa, pinyin và lịch ôn sau 1, 3, 7 ngày trong game, với tiến bộ nói, viết câu và viết tay tách biệt.
- [ ] TSK-9 [AC-9]: Đối chiếu tiêu chí bằng evidence thực và ghi bàn giao trong scope — xong khi: Whisper Tiny đa ngôn ngữ và model hội thoại nhỏ được lượng tử hóa chạy trong browser qua worker; có một trace HTTPS trên bản phát hành phủ audio, câu trả lời, nét viết, ASR và LLM; toàn bộ audio, câu trả lời và nét viết không gửi lên mạng.
- [ ] TSK-10 [AC-10]: Đối chiếu tiêu chí bằng evidence thực và ghi bàn giao trong scope — xong khi: Có tiến trình tải, hủy và thử lại model, cache có phiên bản và nút xóa; mất WebGPU thử ASR bằng WASM, lỗi hoặc quá hạn chuyển sang gõ và hội thoại biên soạn mà giữ tiến độ.
- [ ] TSK-11 [AC-11]: Đối chiếu tiêu chí bằng evidence thực và ghi bàn giao trong scope — xong khi: Đồ họa pixel nguyên bản thể hiện cả đại học hiện đại năm 2026 và khu phố Giang Nam; 6 khu vực có nhận diện riêng, chữ Hán cùng dấu pinyin đọc rõ ở 1280x720 và tài sản có nguồn cùng giấy phép.
- [ ] TSK-12 [AC-12]: Đối chiếu tiêu chí bằng evidence thực và ghi bàn giao trong scope — xong khi: Tải lại khôi phục vị trí, ngày, nhiệm vụ, quan hệ và tiến bộ học; lưu có schema version, xuất nhập JSON và phục hồi bản lưu trước khi dữ liệu lỗi.
- [ ] TSK-13 [AC-13]: Đối chiếu tiêu chí bằng evidence thực và ghi bàn giao trong scope — xong khi: Lệnh npm run verify:mvp được định nghĩa để kiểm tra kiểu, nội dung, logic và luồng chơi; đo cảnh 10 NPC đạt trung vị ít nhất 50 FPS trong 60 giây trên máy chuẩn ghi rõ cấu hình, gói chơi đầu không quá 30 MiB và gói AI tải riêng không quá 800 MiB.
- [ ] TSK-14 [AC-14]: Đối chiếu tiêu chí bằng evidence thực và ghi bàn giao trong scope — xong khi: Toàn bộ nội dung học bắt buộc có chữ giản thể, pinyin có dấu, nghĩa tiếng Việt, ngữ cảnh và âm thanh mẫu; bộ kiểm chứng AI gồm 60 câu chưa dùng làm ví dụ và 40 bản ghi có nhãn, đạt ngưỡng smoke tại plan.md trước khi coi MVP hoàn tất.
- [ ] TSK-15 [AC-15]: Đối chiếu tiêu chí bằng evidence thực và ghi bàn giao trong scope — xong khi: Campus v1 có runtime, dữ liệu terrain, shared asset library và renderer production cho đủ sáu map; conversion/camera/full actor clearance được chốt trước final art, mọi preview xuất từ đúng JSON/manifest/asset.
- [ ] TSK-16 [AC-16]: Đối chiếu tiêu chí bằng evidence thực và ghi bàn giao trong scope — xong khi: Cây task cha con và dependency được kiểm nhất quán; chỉ đóng kế hoạch tổng khi mọi phiếu nhóm và phiếu lá hoàn tất đúng bằng chứng, giữ nghiệm thu MVP và báo cáo lịch sử.

Các phiếu con: A (01M7JGEDRBMFT0FV3YJPNC85MV), B (01M7JGEDZ4BW4S4D20X09NF483), C (01M7JGEE67FZHK5A1W7E6TSJ6J), D (01M7JGEECZDCXCNSJ2VJXFHJ7T), E (01M7JGEEKZ2K6QGTG2NP555EFR), F (01M7JGEEV1G7GFSKSCFM1TT8KB), G (01M7JGEF24Y6W9R7M982M8PVTC), H (01M7JGEF8Y9M6M2FQN9MW59X1E). Cha không tự đợi con chỉ nhờ parent_id; depends_on được đặt tường minh.
