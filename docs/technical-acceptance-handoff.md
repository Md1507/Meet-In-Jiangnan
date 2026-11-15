# Bàn giao diagnostic trước hợp nhất .16

## Sửa logging theo review5 (.27–.28), 14/11/2026

Xem [gói kiểm logging mới](evidence/task-01M7A5E5VAK7KM5VWYPMF6T3GC/review5-logging-repair/README.md).
Runner dùng một cấu hình log tại launch boundary, thu stderr native vào tệp
ngoài worktree, giữ riêng nguồn fallback và đợi stream ghi xong khi đóng host.
`browserLog` lấy từ launch thực tế. Regression HTTPS chờ dòng SSL native thật
trước khi đóng browser, vẫn kiểm lỗi chứng chỉ và hash `debug.log` trong checkout.
Kết quả benchmark/audit trước đó giữ nguyên snapshot và giới hạn của từng phiên;
lượt sửa logging này không đo lại model hay công nhận nghiệm thu tích hợp .16.
Review độc lập và kiểm chứng Core của lượt này do coordinator thực hiện sau b-feat.

## Sửa tập trung theo review4 (.23–.26)

Kết quả mới được lưu riêng tại
[`review4-focused`](evidence/task-01M7A5E5VAK7KM5VWYPMF6T3GC/review4-focused/README.md).
Các JSON của lượt trước giữ nguyên byte. Nhãn privacy `validated` của lượt
`review4-resume` chưa đủ làm bằng chứng AC2: probe oscillator cũ chưa chạy
callback ghi âm của chapter. Lượt mới thay bằng stream tổng hợp đi qua nút
Thu âm/Dừng thu, LocalRecorder, callback phát lại/giải mã, PCM và worker ASR
production; vẫn không chứng minh mic hay người nói thật. Canary regression
thực thi LocalRecorder/callback giải mã và giữ request rò rỉ bị chặn với đủ
query, header, body. Không đổi validator/allowlist privacy.

Snapshot mới kiểm byte/SHA-256/kích thước của cả `public/models`,
`public/runtime` và bản `dist/models`, `dist/runtime` thực phục vụ, trước/sau
lượt. RSS phải đọc đủ root/children của mỗi mẫu; thiếu quyền/PID hoặc tổng
rỗng không được gắn `measured`, không dùng peak 0 thay số đo không có.
Fault model hash nhắm ONNX pinned, fault runtime hash nhắm module MJS và
WASM-unavailable nhắm WASM. Observer gọi nguyên hàm WebCrypto digest, ghi hash
thực của byte sai trước khi production từ chối; không sửa kết quả hash hoặc
đường kiểm integrity. Transformers có thể bọc lỗi thành ModelFileNotFoundError:
runner chỉ chấp nhận khi đã quan sát đúng digest sai, đúng ONNX, lỗi từ chối
đúng đường dẫn và retry khỏe sau gỡ injection. Không suy checksum từ chuỗi lỗi
chung. Giữ URL/hash/độ dài và từng sự kiện trong raw report.

Log native Chromium cần cô lập cả thư mục làm việc của browser host. Chỉ
truyền CHROME_LOG_FILE/--log-file vẫn có dòng lọt về cwd trong môi trường này.
Helper khởi chạy host ở Temp, giữ log/stderr cùng thư mục và trả PID browser
cho sampler; cwd build/test không đổi. Không xóa `debug.log` đã có, không
tắt capture hay bỏ kiểm readonly. Regression 40/40 PASS và hash log giữ nguyên
trong lượt kiểm cuối; xem bằng chứng phiên mới cho chi tiết thực thi.

Review độc lập của sửa tập trung vẫn do coordinator thực hiện sau b-feat.
MVP tổng và các gate người thật/reference profile vẫn theo phần còn lại dưới
đây; chưa có nghiệm thu tích hợp sau `.16`.

## Cập nhật lượt sol tiếp tục sau checkpoint

Kết quả hiện hành nằm trong
[`review4-resume`](evidence/task-01M7A5E5VAK7KM5VWYPMF6T3GC/review4-resume/README.md).
Các ghi nhận review1/review3 bên dưới là lịch sử, không mô tả công cụ mới nhất.
Bằng chứng JSON lịch sử được giữ nguyên.

Runner mới đã thực thi benchmark production trên HTTPS/Edge 157: ASR WASM và
Qwen WebGPU đều đủ cold riêng +3 warmup +20 mẫu, p95 lần lượt 2260,48 ms và
2152,06 ms. Full capture năm tuyến qua validator privacy M4 hiện hành, không đổi
allowlist; regression canary giữ cả payload ở page/worker/SW/blocked request.
RSS cây tiến trình browser lấy mẫu 100 ms, 3359 mẫu, peak 5946564608 byte, không
phải weights hoặc dedicated VRAM. Source/build/model hash ổn định trong lượt.

Manual chapter có kiểm setup-only headless, kết thúc bằng đóng trang và giữ
snapshot IndexedDB chỉ đọc; không có thao tác IME/mic thật. Source/build được
build tại worktree và kiểm đầu/cuối, kể cả tài nguyên model pinned. Sampler dùng
Python absolute path; server HTTPS diagnostic cho phép đọc blob WASM cục bộ đã
kiểm hash. Đây chưa chứng minh cấu hình deployment bên ngoài.

Readiness có output phiên riêng, ca đủ dữ liệu tổng hợp và nhiều ca sai trong
regression; pending kit thực vẫn bị từ chối vì chưa có corpus/audio/output đã
thu. Audit mới có 72 đối chiếu âm tiết bỏ thanh điệu, và chỉ ghi grammar candidate
chưa xác nhận thay vì số câu được nguồn hỗ trợ. GF2021 là chuẩn chính thức đã
đọc Appendix A; hai giáo trình 2022 chỉ có metadata, chưa dùng để duyệt câu.
Xem [profile tham chiếu đề xuất](review-kit/reference-audit-v2-proposal.md).

Benchmark được ghi trước các sửa selector/handshake của fault runner sau đó;
snapshot exact của từng lượt nằm trong JSON. Mã chapter/model/worker không đổi,
nhưng không gán các lượt khác revision thành cùng snapshot. Fault exploratory
có lỗi được giữ; dùng kết quả lượt cuối với sourceCheck stable cho kiểm fault.
Review độc lập của vòng này do coordinator thực hiện sau b-feat.

Phần còn lại: sau hợp nhất .16 ở luồng riêng, build và đo tích hợp trên đúng
snapshot mới. Khi người dùng báo sẵn sàng: Enter chọn chữ trong IME rồi Enter
riêng để gửi; thu tối đa 20 giây, nghe/chép/sửa/thu lại, kiểm stop track và
denied/unplug/codec. Chưa có 40 audio game từ sáu speaker hoặc người rà đủ năng
lực; audit tham chiếu chưa thay gate cũ và không đóng MVP tổng.

## Cập nhật review3 — chưa hoàn tất

Phiên `review3` lưu kết quả mới, không sửa evidence cũ. ASR chạy 3 warmup và 20 lượt 5 giây qua worker, p95 thời gian từ `running` đến kết quả 5106,7 ms trên môi trường hiện tại; mỗi lượt tạo worker mới, browser cache ấm. Đây là Vite diagnostic trước .16, không phải bản build nghiệm thu máy chuẩn. Qwen WebGPU thất bại ở warmup đầu với lỗi 9950264; không có p95 LLM. Chưa tách được cold download và init, chưa đo working set cây tiến trình hoặc VRAM. Benchmark không được coi là đạt. `review3/benchmark.json` giữ pha và lỗi thực.

Chromium HTTPS tự động đi qua UI và offline quest; fault matrix gắn nhãn automated-browser-offline cho ca này, còn các ca khác chưa chạy. Đây không phải thao tác IME/mic hay bằng chứng privacy đầy đủ. Trace adapter gọi cùng kiểm tra M4, nhưng lượt này mới có text/strokes; audio/ASR/LLM và service worker chưa được chứng minh. Không xuất báo cáo privacy đạt từ phiên này. Nguồn script thay đổi sau khi phép đo bắt đầu; revision trong artifact chỉ mô tả thời điểm bắt đầu, không phải snapshot cuối.

Runner manual giờ tự build và phục vụ `dist` trong worktree, lưu revision đầu/cuối và giữ snapshot IndexedDB định kỳ; chưa có kiểm thử chứng minh đầy đủ khi đóng trang hoặc kiểm thiết bị thật. Chế độ readiness báo thiếu người rà, output và audio; validator hiện chưa bao phủ độc lập text corpus và chất lượng, luôn báo incomplete. Không dùng nó thay validator gate.

Audit `review3/reference-audit-d0ca0c42-0425-4987-9726-7ab45f3f8d53.json` đối chiếu 72 câu với CC-CEDICT: 72 khớp âm tiết theo phân đoạn tham lam, 40 câu có dấu hiệu cấu trúc đối chiếu GF 0025-2021 Appendix A. So sánh bỏ thanh điệu, giới hạn 500 nhánh và không chứng minh câu, nghĩa Việt, ngữ cảnh hay audio. Hai giáo trình 2022 chỉ có metadata nhà xuất bản, chưa đọc nội dung sách. Không có audio exact-phrase đã kiểm license/speaker, không có 30 output thật hoặc reviewer; `reference-audit-v1` chỉ là đề xuất riêng chưa thay gate. Sau hợp nhất .16 cần chốt source/build, chạy lại toàn bộ diagnostic tích hợp, hoàn thiện memory/fault/coverage và review độc lập. Khi người dùng sẵn sàng mới thao tác IME/mic; không giả lập thành thiết bị thật.

## Cập nhật sau review vòng 1

Các ghi nhận bên dưới về hash và tải từ điển mô tả lần chạy trước; tình trạng mới như sau. Ba tệp runtime/license đã được sao chép nguyên byte từ cây gốc chỉ đọc theo ngoại lệ provision; từng SHA-256 khớp nguồn và `node scripts/models.mjs` thành công. `npm run build` thành công. `node --test tests/device-evidence-protocol.test.mjs tests/mvp-evidence.test.mjs tests/acceptance-runners.test.mjs` đạt 21/21. Chromium HTTPS chạy lại UI và offline thành công tại `docs/evidence/task-01M7A5E5VAK7KM5VWYPMF6T3GC/review1/`; đây là diagnostic của snapshot trước .16. Di chuyển và chọn topic tự động đã tới ô chapter trong Chromium; không phải kiểm IME hoặc mic thật. Runner vẫn chưa chứng minh server/build/source khớp nhau, chưa dùng làm bằng chứng thiết bị.

ASR smoke qua năm mẫu FLEURS và lưu `review1/asr-smoke.json`; không phải 5 giây cố định, 3+20, hay corpus của game. LLM smoke `review1/dialogue-smoke.json` thất bại khởi tạo Qwen WebGPU `9950264`; không có số p95. Chưa có runner benchmark 3+20, lấy mẫu peak memory hoặc fault matrix hoàn chỉnh. Offline ở trên là một kiểm tự động thực, không chứng minh các tình huống thiết bị còn lại. GPU driver metadata bị từ chối. Trace Chromium hiện lưu URL, header và body, nhưng chưa chứng minh đủ worker/service worker hoặc đầy đủ các tuyến nhạy cảm; không công nhận privacy từ diagnostic này.

Audit `review1/reference-audit-6eb3ce9e-ab6e-4a3b-aa95-0d918223c070.json` đối chiếu 72 câu với export CC-CEDICT do coordinator tải (hash và giấy phép trong JSON); mọi câu được tách tham lam thành các mục từ tìm thấy nhưng toàn bộ vẫn uncertain về pinyin câu, nghĩa, ngữ cảnh và audio. Tách từ có thể sai, không có nhận định chất lượng câu hay kết luận human review. Ba mươi output thật và audio tham chiếu có license/speaker/transcript phù hợp đều chưa có. Có thể đề xuất profile `reference-audit-v1` riêng để người dùng xem, với các giới hạn này; chưa thay hợp đồng gate cũ và không khẳng định tương đương rà người thật. Cần validator readiness và audit chi tiết hơn trước khi xem profile là hoàn chỉnh.

Sau khi hợp nhất .16, build lại và chốt source/build, chạy lại các phép đo trên cùng bản chapter. Phần thao tác tối thiểu còn lại: khi người dùng báo sẵn sàng, kiểm IME chọn chữ bằng Enter rồi gửi riêng; thu/nghe/chép/sửa/thu lại tối đa 20 giây, kiểm dừng track, denied/unplug/codec. Không tự ghi âm. Gate corpus/audio và rà người thật vẫn pending; review độc lập sau sửa cũng chưa hoàn tất.

Snapshot nguồn: `cc1de299fe78a6394d047b7bceb5177358e00842`, worktree của tác vụ 01M7A5E5VAK7KM5VWYPMF6T3GC. Đây chưa phải bản tích hợp với .16. Đo lại trên source và build được chốt sau khi hợp nhất; không dùng kết quả này thay bằng chứng MVP tổng.

- `npm ci --offline`: thành công. `npm run build`: thành công, play bundle 7.521.669 byte.
- `node scripts/models.mjs`: thất bại: `public/runtime/ort-wasm-simd-threaded.asyncify.mjs`, `public/licenses/models/whisper-MIT.txt`, `public/licenses/models/qwen-Apache-2.0.txt` không khớp hash manifest. Không dùng kết quả này xác nhận model/runtime; không sửa các tệp sản phẩm ngoài phạm vi.
- `node scripts/bench-chapter.mjs`: Chromium báo `passed: true`, offline thành công, không có page/console error. Xem JSON phiên mới trong thư mục evidence cùng ID tác vụ; đây là kiểm UI/offline tổng hợp, không phải benchmark AI, microphone hay IME thật. GPU driver query bị từ chối, báo cáo ghi rõ giới hạn. Trace có thể chứa dữ liệu nhạy cảm; lưu cục bộ, kiểm trước khi chia sẻ. Coverage worker/service worker chưa được chứng minh, không dùng để công nhận privacy.
- `node --test tests/device-evidence-protocol.test.mjs tests/mvp-evidence.test.mjs`: 19 kiểm thử đạt. `node --test tests/acceptance-runners.test.mjs`: 2 kiểm thử đạt; đây là kiểm thử tổng hợp của capture.

## Còn thiếu

Runner manual chapter đã được cập nhật selector và đọc state nhưng chưa được kiểm trên thiết bị thật; chưa chứng minh build đang phục vụ khớp source khai báo hoặc provenance đầy đủ. Không dùng nó làm bằng chứng nghiệm thu trước khi bổ sung và kiểm các phần đó. Cần thao tác thật IME: chọn chữ bằng Enter rồi gửi riêng; mic: thu tối đa 20 giây, nghe, chép, sửa, thu lại, kiểm track ngừng và lỗi denied/unplug/codec. Chỉ thu sau khi người dùng báo sẵn sàng. Không coi sự kiện tổng hợp là thao tác người thật.

Chưa có benchmark 3 warmup + 20 lần/model, peak memory theo PID hay fault matrix đầy đủ. Lỗi hash phải được xử lý đúng phạm vi trước khi chạy model; đo tích hợp chỉ sau .16. Chưa có validator corpus/audio mới hoặc review độc lập. Gate cũ cho 60 text, 40 audio và rà người thật vẫn pending; không chuyển thành đạt bằng dữ liệu thay thế.

## Nguồn tham chiếu và rủi ro

Trang [CC-CEDICT](https://www.mdbg.net/chinese/dictionary?page=cc-cedict) công bố export CC BY-SA 4.0, chữ giản/phồn, pinyin và nghĩa tiếng Anh. Thử tải export `.txt.gz` ngày 2026-11-13 thất bại do kết nối mạng; chưa có file/hash, chưa thể thực hiện audit thực. Từ điển cũng không chứng minh toàn bộ ngữ cảnh hay nghĩa tiếng Việt. [Tatoeba](https://tatoeba.org/en/downloads) có metadata giấy phép theo từng audio; chưa có mẫu được xác minh transcript, quyền và người nói. [AISHELL-1](https://www.openslr.org/33/) công bố Apache 2.0 và dữ liệu tiếng phổ thông; không tự chứng minh mẫu phù hợp tình huống game. Chưa tải tập 15 GB.

Chỉ sau khi có audit thực và các mismatch/uncertain cụ thể mới đề xuất profile tham chiếu riêng để người dùng xem. Profile đó không tự thay gate cũ, không giả reviewer.kind=human và không xem tự động tương đương người rà.

Chẩn đoán thêm hash: cả ba tệp không khớp đều trở về đúng SHA-256 manifest khi tính trên bản chuyển CRLF sang LF trong bộ nhớ. Đây là dấu hiệu khác biệt line ending của checkout, không phải bằng chứng byte trên đĩa đã đúng; chưa sửa `public/**`. JSON diagnostic được tạo trước các chỉnh sửa runner manual sau đó, nên revision trong JSON là revision của lần chạy đó, không phải revision cuối của toàn bộ thay đổi.
