<!-- bint:begin -->
<!-- Khối do Bint quản lý. Không sửa tay: sửa tệp .bint/knowledge/items/<id>.md
rồi chạy `bint bootstrap publish`. Mã [k:<id>] để trích dẫn mục tri thức. -->

## Quy ước của dự án (Bint)

Ghi lại điều bất thường vừa phát hiện (lệnh đặc biệt, chỗ dễ sai) bằng
`bint knowledge add --type warning --paths '<glob>' --evidence <tệp>:<dòng> "<nội dung>"`;
mục do agent ghi chờ người duyệt, không tự có hiệu lực.

### Quy tắc bắt buộc

Khi làm việc với `public/art/**`, `docs/game-dev/art-studies/**`, `docs/game-dev/campus-network-v1/**`, `hen-o-giang-nam-art-style-guide-v0.3.md`:

- **Duyệt layout và camera trước khi sản xuất environment art hoàn chỉnh** [k:01M7DE9PM7AGR97AHC45J63GNW]
  Khi chưa có layout được duyệt, chỉ tạo blockout/concept bố cục; ghi rõ nguồn và phiên bản, kiểm camera cùng luồng đi trước chi tiết/palette/props.
  Ảnh được thích không thay việc duyệt thay đổi đường chơi; đối chiếu footprint, collider, spawn, exit và bounds nhân vật trước asset cuối.
  Prompt ảnh phải nêu sơ đồ không gian và kết nối đường, cửa, cầu; không chỉ liệt kê phong cách và đồ trang trí.

### Điểm dễ sai

Khi làm việc với `scripts/**`, `tests/game-dev-spawn.test.mjs`:

- **Runner Windows phải truyền executable và argv riêng khi đường dẫn có dấu cách** [k:01M7DE8TWTP94W08B6Q83D3HV8]
  Dùng helper scripts/game-dev-spawn.mjs để gọi Node bằng command và argv riêng; helper chỉ bật shell cho npm.cmd trên Windows.
  Không ghép process.execPath vào một chuỗi shell: đường dẫn có dấu cách đã làm runner chapter thất bại qua nhiều vòng review.
  Giữ kiểm hồi quy đường dẫn có dấu cách, truyền nguyên exit code khác 0 và executable không tồn tại.

Khi làm việc với `scripts/**`, `tests/m4-technical-prep.test.mjs`, `docs/evidence/**`, `docs/playtest/**`, `docs/game-dev/**`:

- **Gắn evidence với source, build và manifest thực; không đổi revision báo cáo cũ** [k:01M7DE8V43RRQF5CG91ESM8A48]
  Đối chiếu hash artifact, source/build revision và manifest của bản thực sự được phục vụ; kiểm mọi trường revision lồng nhau để phát hiện metadata mâu thuẫn.
  Giữ báo cáo lịch sử nguyên byte và revision gốc; thiếu provenance là pending, khác snapshot hoặc metadata mâu thuẫn là stale.
  Build/test đã qua trước khi sửa hoặc land không chứng minh snapshot mới; ghi riêng kết quả sau tích hợp và giới hạn của từng phép kiểm.

Khi làm việc với `scripts/build-chapter.py`, `public/art/**`, `src/content/mvp.json`, `public/fonts/**`:

- **Chạy build-chapter.py có thể ghi đè art đã polish** [k:01M7DHX5X1VYK896T964Y5MRET]
  Kiểm tra phạm vi đầu ra trước khi chạy `scripts/build-chapter.py` trên cây có art đã chỉnh.
  Hàm main luôn ghi lại SVG sáu cảnh, `src/content/mvp.json`, font và license; `--download` không phải cờ bật/tắt toàn bộ việc ghi.
  Đừng dùng lệnh dựng toàn chương như một bước chỉ cập nhật thoại hoặc âm thanh; giới hạn việc tái sinh vào đúng asset cần đổi và đối chiếu diff.

Khi làm việc với `scripts/build-chapter.py`, `src/content/**`, `public/fonts/**`:

- **Font đóng gói là subset; JSON mới không tự được thu thập** [k:01M7DHY7WSBX8S2VTGVV4FD93M]
  Khi thêm chữ Hán trong JSON nội dung riêng, đưa các chữ đó vào tập glyph của font đóng gói và kiểm độ phủ.
  Bước subset hiện chỉ lấy đối tượng data của chương chính cộng nội dung `src/**/*.ts`, không đọc các JSON bổ sung như `src/content/ambient-dialogues.json`.
  Đừng suy ra font local đã đủ chữ từ việc máy phát triển vẫn hiển thị được; kiểm font thực thay vì dựa vào fallback của hệ điều hành.

Khi làm việc với `scripts/build-chapter.py`, `src/content/mvp.json`, `public/audio/**`:

- **Đổi text chương không khiến WAV có sẵn được tổng hợp lại** [k:01M7DHY26H9GB5937E2A88F8X4]
  Khi đổi lời thoại chương chính, tái tạo đúng WAV bị ảnh hưởng và đồng bộ tham chiếu/hash.
  `scripts/build-chapter.py` chỉ tổng hợp khi đường dẫn WAV chưa tồn tại, nhưng vẫn ghi text mới cùng hash của file đang có vào dữ liệu.
  Đừng coi chạy lại generator hoặc hash PASS là bằng chứng lời đọc đã khớp text mới; nghe đối chiếu câu và audio.

Khi làm việc với `scripts/mvp-evidence.mjs`, `scripts/verify-m4-technical-prep.mjs`, `tests/mvp-evidence.test.mjs`, `tests/m4-technical-prep.test.mjs`:

- **Kiểm cả giá trị URL/header và coverage khi đánh giá privacy** [k:01M7DE9NPMM5P28MAMGZZSWGFE]
  Chỉ whitelist tên header hoặc kiểm bodyBytes=0 vẫn có thể bỏ lọt câu học trong query URL, Referer hoặc giá trị header hợp lệ.
  Giữ trace thô, kiểm cả giá trị header và URL tĩnh cùng origin, xử lý header lạ/__proto__/trùng tên và lỗi capture.
  Đánh giá rò rỉ riêng với coverage audio/text/strokes/ASR/LLM: thiếu tuyến là pending, không được che một request rò rỉ đã quan sát.

Khi làm việc với `src/ai/**`, `scripts/models.mjs`, `tests/model-assets.test.mjs`:

- **Cờ local-only không thay kiểm toàn vẹn runtime ONNX và cache** [k:01M7DE8TNCFY9MP6C92REWAC7D]
  Giữ cả weights và runtime MJS/WASM trong manifest có size/SHA-256; kiểm byte trước khi dùng cả cache lẫn mạng.
  Cache model gắn digest manifest, xóa entry hỏng rồi tải lại; lỗi cache không được bỏ qua kiểm toàn vẹn.
  ONNX Runtime tải MJS/WASM ngoài fetch hook Transformers: cấp wasmPaths từ runtime đã kiểm, không chỉ đặt allowRemoteModels=false.

Khi làm việc với `src/audio/**`, `src/ai/**`, `src/main.ts`, `src/chapter/**`:

- **Ràng buộc callback, timeout và kết quả AI với đúng phiên** [k:01M7DE8SPS67YZ16W173G5F599]
  Giữ generation/session/request ID cho recorder, worker và từng hội thoại; hủy request phải dọn timer của request đó.
  Kiểm lại token và revision của draft sau mỗi await giải mã audio hoặc suy luận; bỏ kết quả của phiên cũ.
  Callback stop/progress/timeout đến muộn không được dọn phiên mới hoặc ghi đè câu người chơi vừa sửa.

Khi làm việc với `src/chapter/ambient.ts`, `src/content/ambient-dialogues.json`, `tests/ambient.test.ts`:

- **Phủ định trong hội thoại phụ có thể là đáp án hợp lệ** [k:01M7DHXG1H1TZ48GM2Y66MMXZ2]
  Nhận ý theo câu hỏi và nhánh của từng lượt hội thoại phụ; giữ các cách diễn đạt khác câu mẫu.
  Đừng chặn mọi phủ định: không thích, không bận, quên thẻ và từ chối ngồi đều có nhánh hợp lệ theo ngữ cảnh.
  Đồng thời kiểm toàn câu để không nhận nhầm câu hỏi ngược, câu mâu thuẫn hoặc chỉ trùng từ khóa; chưa hiểu thì hỏi lại, giữ tiến độ.
  Giữ các ca biến thể đúng và ca sai/ngữ cảnh trong `tests/ambient.test.ts` khi mở rộng bộ hiểu.

Khi làm việc với `src/main.ts`, `src/chapter/**`, `src/storage/**`, `tests/browser-flow.mjs`:

- **Giữ transcript gốc và phân loại nguồn bằng nội dung chưa chuẩn hóa** [k:01M7DE8T5MC1DMSFDF09VXECC4]
  Lưu rawTranscript nguyên văn và giữ nó khi người chơi sửa câu hoặc thu lại; chuẩn hóa để chấm ý định riêng với phân loại nguồn.
  Chỉ gắn audio-asr khi draft bằng transcript gốc, kể cả khoảng trắng; câu đã sửa là edited-transcript, câu gõ độc lập là typed.
  Composition giả trong test không kích hoạt OS IME; kiểm draft không đổi khi mô phỏng Enter chọn chữ.

Khi làm việc với `src/main.ts`, `src/chapter/app.ts`, `tests/*flow.mjs`:

- **Khóa di chuyển ở cả keydown và ticker khi focus rời thế giới** [k:01M7DE8SYTEA9G9H5RQF1RE71N]
  Dùng cùng điều kiện quyền điều khiển thế giới ở keydown và ticker; chỉ chặn sự kiện gõ mới vẫn để phím đang giữ tiếp tục di chuyển.
  Xóa tập phím khi blur, chuyển focus sang UI, mở/đóng bảng và chuyển cảnh; trả focus canvas sau khi đóng bảng.
  Kiểm hồi quy bằng giữ WASD/mũi tên rồi chuyển focus sang nút AI, sau đó nhấn phím mới khi trở lại canvas.

Khi làm việc với `src/storage/save.ts`, `src/main.ts`, `tests/browser-flow.mjs`:

- **Snapshot cũ không được xóa tiến bộ hoặc mở lại quyền thưởng của spike** [k:01M7DE8TDEM1GC9NMVD5NP7WSS]
  Trong SaveStore của spike M0/M1, đọc trạng thái current và ghi thưởng, journal, vị trí checkpoint trong cùng giao dịch readwrite.
  Khi lưu từ tab cũ, hợp nhất rewarded và tiến bộ tăng dần; giữ journal đã thưởng thay vì ghi đè toàn bộ snapshot.
  Kiểm hai giao dịch thưởng đồng thời và reload ngay sau gửi: chỉ một phần thưởng, vị trí là lúc tương tác.
<!-- bint:end -->
