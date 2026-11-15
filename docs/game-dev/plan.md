# Kế hoạch triển khai

Đồng bộ ngày 13/11/2026 với workflow `game-dev`. Phiếu tổng: `01M78EYZ58EHGP3R83ZKVZ0AVH`.
Bộ requirement/plan/tasks của phiếu Bint là nguồn chuẩn; `docs/game-dev/` là bản xuất cùng nội dung để đọc trong repository.
Điều chỉnh ngày 14/11/2026 theo yêu cầu người dùng: giảm ngưỡng và khối lượng nghiệm thu xuống mức MVP thực dụng; đồng bộ plan, tasks, validator và README. Không tự xác nhận thêm AC hay đổi workflow của phiếu đang có.

## Hiện trạng và quyết định
Repository đã có TypeScript/Vite/PixiJS, chương bảy ngày trong `src/chapter/`, nội dung `src/content/mvp.json`, sáu cảnh art, audio mẫu, Hanzi, save/load, model manager/worker và các script kiểm chứng. `src/main.ts` mở chapter mặc định; spike chỉ là đường thử nghiệm trong dev. Không dựng lại bộ khung hoặc ép tách thành các module dự kiến trong plan ban đầu. Phân loại phiếu tổng vẫn standard; không đổi độ sâu hoặc trạng thái.

Các checkbox đã có và báo cáo cũ là lịch sử triển khai, không phải bằng chứng mới cho bản build hiện tại. Phiếu tổng còn AC5/6/9/14 chưa đạt và lệnh verify tổng chưa được người xác nhận. Phiếu kỹ thuật `01M7A5E5VAK7KM5VWYPMF6T3GC` còn ở worktree riêng, review 5 có medium .27 về kiểm log HTTPS chập chờn và low .28 về đường dẫn browserLog. Phiếu đó có kết quả model/latency/memory mới, nhưng chưa được nghiệm thu tích hợp trên cây gốc. Đọc trạng thái/checkpoint mới nhất trước mỗi lượt; không tự land hoặc chạy thêm vòng sửa chỉ vì kế hoạch đã cập nhật.

Giữ ba trụ cột: sống trong một nơi đáng khám phá; dùng tiếng Trung để làm việc có ý nghĩa; trợ giúp giảm dần nhưng luôn cho phép thử lại. Toàn bộ sáu địa điểm nằm trong cùng một khuôn viên đại học; phố là dãy dịch vụ sinh viên nội khu, vườn/kênh là cảnh quan của trường. Giữ kết nối ký túc ↔ cổng trường ↔ thư viện ↔ nhà ăn ↔ phố ↔ vườn ↔ ký túc; mỗi brief/asset phải đối chiếu cặp mép với khu liền kề và dùng chung camera, tỷ lệ, vật liệu. Ưu tiên một tình huống “gọi món” hoàn chỉnh để kiểm tra cả chơi, học và suy luận cục bộ.

## Thiết kế game cần hoàn thiện

**Thiết kế campus mới theo yêu cầu người dùng:** [network v1](campus-network-v1/design.md)
và [JSON 20×15](campus-network-v1/maps.json) giữ vòng cũ, bổ sung ba lối tắt
ký túc–nhà ăn/cổng–phố/thư viện–vườn và trục thư viện–phố. Mỗi khu có 3–4
hướng; chuyển tối đa hai map để tới mọi khu khác. Đây là bàn giao layout,
chưa đổi schema/loader, collider, warp hay trạng thái nghiệm thu runtime.

### Vòng chơi và nhịp tiến trình

Vòng ngắn: nhìn thấy nhu cầu/vật thể/NPC → chọn tương tác → nghe/đọc ngữ cảnh → tự diễn đạt hoặc luyện nét → nhận phản ứng có nghĩa → thay đổi nhiệm vụ/quan hệ/sổ tay → có lý do đi tiếp. Mỗi bài học phải gắn một việc trong đời sống; không dùng chuỗi form và thông báo đúng/sai làm toàn bộ trải nghiệm.

Vòng một buổi: một mục tiêu chính, một lựa chọn sinh hoạt/khám phá tùy ý và cơ hội dùng lại điều đã học. Người chơi chủ động kết thúc buổi, được nhắc việc còn dở và có lịch hẹn lại; không để bỏ lỡ giờ biến thành mất đường truyện. Sau kết thúc vẫn ôn 1/3/7 được.

Mốc 60–90 phút/lượt đầu và phiên 10–20 phút là giả thuyết thiết kế, đo bằng playtest của người dùng rồi điều chỉnh số lượt, độ dài câu và đường đi. Không kéo dài bằng yêu cầu lặp câu, đợi AI hoặc đi bộ qua màn hình trống. Không thêm cơ chế tiền, chiến đấu hoặc phạt thất bại ngoài phạm vi MVP.

### Bảy ngày và đường cong hỗ trợ

| Ngày | Mục tiêu chơi | Lựa chọn/khám phá | Trợ giúp và phản hồi |
| --- | --- | --- | --- |
| 1 | Nhận phòng và tự giới thiệu | Đi cùng mentor hoặc xem gợi ý đường | Dạy di chuyển/E, thử một tương tác có kết quả; gợi ý luôn mở lại được |
| 2 | Tự gọi bữa sáng | Chọn cách nói/số lượng trong tình huống có hỗ trợ | NPC xác nhận món; sai ý phản hồi phần thiếu, không trừ tiến trình |
| 3 | Tìm lớp và làm quen câu lạc bộ | Hỏi NPC hoặc đọc biển, dùng lại câu giới thiệu | Giảm lời dẫn tự động, giữ ba mức hint tự chọn |
| 4 | Mua đồ và viết lời nhắn | Chọn việc phụ hoặc quay lại sổ tay | Thấy lời nhắn được dùng trong truyện, không chỉ nhận điểm bài tập |
| 5 | Nhận bưu kiện và hỏi lại thông tin | Dùng một biến thể đã học trong ngữ cảnh mới | NPC phản hồi theo thông tin người chơi cung cấp |
| 6 | Chuẩn bị lời mời và bảng nhắn | Chọn thứ tự viết câu/luyện nét trong điều kiện quest | Gợi mục tiêu, không tự điền toàn bộ câu trả lời |
| 7 | Mời bạn và hoàn thành cuộc hẹn | Chơi bằng nói hoặc đường bàn phím có nhãn nguồn rõ | Tổng kết điều đã tự làm; không ghi đường gõ thành luyện nói thành công |

Đây là đặc tả cần đối chiếu dữ liệu hiện có, không tuyên bố mọi nhánh đã được triển khai. Content dùng ID/schema hiện hành; gameplay chỉ bổ sung điều kiện/hiệu ứng còn thiếu trong scope.

### Cảm giác điều khiển, thế giới và UI

- Gameplay: chuyển động/va chạm nhất quán, điểm E ở gần mục tiêu có dấu hiệu rõ; phím mở hội thoại không lọt vào ô nhập; đóng UI trả focus đúng nơi. Camera và chuyển cảnh giữ hướng đi, không xuất hiện trong vật cản.
- Phản hồi: phân biệt đang thu/đang xử lý/đã nhận/chưa đủ ý/lỗi thiết bị; hành động quan trọng có phản hồi hình hoặc âm lượng phù hợp. Hủy/thử lại không mất câu đang soạn hoặc nhận thưởng lặp.
- Điều hướng: mỗi vùng có mốc nhận diện, cửa nối và NPC mục tiêu đọc được; objective nêu việc cần làm, không chỉ mã quest. Có lời nhắc vị trí/điều kiện khi nhiệm vụ chưa mở.
- UI học tập dùng font rõ, dấu pinyin không bị cắt, dòng text không tràn ở 1280×720 và 1920×1080. Có trạng thái focus bàn phím, âm lượng và tùy chọn pinyin/nghĩa theo yêu cầu gốc.
- Bốn hoạt động và bốn sự kiện có nguyên nhân trong thế giới, phản hồi/ảnh hưởng quan hệ hoặc ngữ cảnh khi đúng thiết kế; không biến thành nút nhận thưởng vô hạn. Không thêm hệ thống kinh tế mới.

### Đồ họa và nội dung có đầu ra riêng

Art brief giữ pixel/top-down, trường hiện đại năm 2026 và phố Giang Nam. Tile 16×16/sprite khoảng 16×32 là hướng đề xuất, không buộc thay các asset đã phù hợp. Kiểm kê sáu cảnh, silhouette NPC, trạng thái đi/đứng/tương tác, biển chỉ dẫn, icon/hint, palette và tỷ lệ; chỉ sản xuất phần thiếu. Bàn giao mỗi asset bằng ID/path, kích thước/frame/pivot, hitbox liên quan, nơi dùng, nguồn/license và ngân sách. SVG hiện có không bị buộc đổi sang bitmap.

Animation nhân vật giữ gọn: chu kỳ đi bộ chỉ 2–4 frame, ưu tiên 2 frame và tối đa 4 frame cho mỗi chu kỳ; đứng nghỉ tái dùng một frame có sẵn. Không bắt buộc sprite sheet đủ mọi hướng, nhiều trạng thái hoặc animation tương tác riêng ở giai đoạn này. NPC đứng tại chỗ có thể dùng một pose tĩnh. Ưu tiên silhouette dễ nhận diện, chân/anchor ổn định và khớp collider; kiểm kê rõ số frame thực thay vì tăng frame để nghiệm thu art.

Content bàn giao theo từng scene/quest: tiền điều kiện, mục tiêu, nhánh vào/sai/hủy/đã xong, câu và audio, bước tiến trình, điều kiện thưởng và đường thử lại. Bảo toàn tối thiểu 6 NPC/6 quest/12 tình huống/10 bài/20 chữ cùng độ phủ AC. Phân biệt nội dung đúng schema, nội dung tham chiếu đã rà tự động và nội dung được người có năng lực duyệt. Audit tham chiếu giáo trình từ 2020 trở đi trong phiếu kỹ thuật là bằng chứng bổ trợ có nguồn, không tự thay gate human review hiện hành.

## Đồng bộ với workflow game-dev

Mỗi phiếu mới xử lý một lát cắt/milestone còn thiếu; design luôn đọc plan và checkpoint nguồn rồi chuyển phần việc đó thành hợp đồng v1 riêng. Không đưa phiếu b-do đang chạy sang game-dev, không chép AC met hoặc quyền verify đã duyệt từ phiếu khác. Với lát cắt không có art/content, bước tương ứng báo không áp dụng và không phát sinh thêm phạm vi.

| Bước / skill / role | TSK nguồn chịu trách nhiệm chính | Bàn giao |
| --- | --- | --- |
| design / game-plan / planner | TSK-25 | Phạm vi còn lại, thiết kế/nhịp chơi, AC, phân công và phụ thuộc |
| gameplay / game-core / implementer | TSK-1..9, 12, 15..17, 26 theo phần logic | Cơ chế chạy được, state/input/save, ID/schema ổn định, placeholder khi cần |
| art / game-art / implementer | TSK-10, 27 | Asset tích hợp, hợp đồng hiển thị và nguồn/license |
| content / game-content / implementer | TSK-11, 13, 14 theo phần dữ liệu, 20, 28 | Quest/hội thoại/bài học/audio và trạng thái rà |
| polish / game-polish / implementer | TSK-18, 19, 21..24, 29, 30; phần tích hợp còn lại | Tích hợp, xử lý lỗi/review, kiểm chứng, bản bàn giao cho playtest |
| review / game-review / reviewer | Đối chiếu mọi AC/TSK của phiếu mới | Phát hiện qua bint task review; fix quay về polish |

Bảng trên là ánh xạ trách nhiệm chính; các TSK nhiều phần giữ ID gốc và được chia thành TSK mới khi lập phiếu con. Danh sách TSK-1..24 hoàn thành trước đây được tái sử dụng, không chạy lại mặc định. Design chuẩn bị brief/schema nội dung trước gameplay; bước content phía sau sản xuất và tích hợp theo hợp đồng đó. Các bước triển khai giữ verify của Bint; review chỉ đọc, sửa cả gameplay/art/content qua polish trong scope cho phép.

## Lựa chọn và lý do
| Hạng mục | Các hướng cân nhắc | Hướng đề xuất |
| --- | --- | --- |
| Hội thoại | Kịch bản thuần; LLM toàn quyền; kịch bản kết hợp model nhỏ | Kịch bản kiểm soát truyện, model hiểu biến thể và trò chuyện theo cảnh; bảo đảm nhiệm vụ tái hiện được |
| Nhận giọng nói | Web Speech API; model ONNX tại máy; API cloud | ONNX tại máy theo lựa chọn người dùng; Web Speech API có hỗ trợ không đồng đều và có thể gửi audio đến dịch vụ |
| Viết tay | OCR mở; đối chiếu nét của chữ mục tiêu | Đối chiếu nét với Hanzi Writer; phạm vi vừa đủ cho người mới và phản hồi có căn cứ |
| Đồ họa | Một thị trấn cổ; đô thị hiện đại; trường hiện đại cạnh phố ven kênh | Phương án kết hợp làm rõ Trung Quốc năm 2026 và tạo vùng có nét riêng |
| Nền giao diện | Toàn bộ trong PixiJS; PixiJS kết hợp HTML | PixiJS vẽ thế giới, HTML cho nhập IME, hội thoại, sổ tay và ô luyện chữ |

Web Speech API không đáp ứng yêu cầu giữ audio tại máy một cách mặc định trên mọi browser; không dùng nó làm fallback nhận giọng nói. Xem [MDN SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition). PixiJS cung cấp nhiều cách render text; chọn lớp HTML cho nội dung học và input để xử lý IME, focus và chữ Hán rõ nét: [PixiJS Text](https://pixijs.com/8.x/guides/components/scene-objects/text).

## Kiến trúc và luồng dữ liệu
TypeScript + Vite + PixiJS; HTML/CSS cho UI, không cần framework UI nặng trong MVP. Nội dung lưu JSON có schema; logic thời gian, nhiệm vụ, quan hệ và ôn tập là module độc lập renderer. Chọn phiên bản stable tương thích bằng thử nghiệm M0 rồi khóa package-lock; không cài bản main chỉ vì ví dụ tài liệu đang dùng.

Luồng: phím/pointer → điều khiển thế giới → chọn NPC và tình huống → UI nói/gõ/viết → bộ diễn giải ý định → bộ kiểm điều kiện nhiệm vụ → phản ứng NPC và cập nhật tiến độ → lưu. Chỉ lớp quy tắc xác định quest transition, tiền và vật phẩm. Model không được trả “quest completed” để trực tiếp sửa state.

Hợp đồng dữ liệu sau đây là trách nhiệm cần bảo toàn, không yêu cầu tạo lại tên lớp. Dữ liệu nội dung đang ở `src/content/mvp.json`; type `ChapterSave`, `Attempt`, `JournalItem` và các hàm trong `src/chapter/engine.ts` là điểm đối chiếu hiện hành:
- SceneDefinition: map, lớp hiển thị, vùng va chạm, cửa chuyển cảnh và điểm NPC.
- DialogueScenario: intent cho phép, slot bắt buộc, phủ định, quan hệ, phản hồi đã soạn, ví dụ đúng/sai, vocab, audio và pinyin theo ngữ cảnh.
- QuestDefinition/EventDefinition: điều kiện, bước, tác động, lịch hẹn lại và khóa chống nhận thưởng hai lần.
- LearningAttempt: kỹ năng, bài, mức gợi ý, nguồn audio/typed/edited-transcript, kết quả và ngày ôn.
- ModelManifest: model/revision, dtype, file/hash/byte, runtime, license và cache version.
- SaveGame: schemaVersion, vị trí, ngày/buổi, quest flags, quan hệ, RNG state, event history, learning attempts và settings.

Model chạy trong worker; mỗi lần gọi có requestId và sceneSessionId. Khi đóng hội thoại hoặc chuyển cảnh, hủy yêu cầu và bỏ kết quả cũ; giới hạn một lần suy luận nặng tại một thời điểm để giảm tranh GPU với PixiJS. Giữ lịch sử ngắn tối đa khoảng 1.024 token, đầu ra tối đa 64 token cho một phản hồi. Dữ liệu nhập là văn bản, không được render thành HTML hoặc xem như lệnh hệ thống. Mọi object output phải validate và nằm trong tập intent/slot hợp lệ trước khi diễn giải.

## Model, âm thanh và dữ liệu chữ
**ASR hiện hành:** Whisper Tiny đa ngôn ngữ theo `src/ai/model-manifest.json`, dùng transcribe tiếng Trung. Giữ model/revision/dtype/hash đã khóa khi tiếp tục; thay cấu hình chỉ khi có vấn đề đo được và phương án kiểm chứng tương ứng. Kích thước thực lấy từ manifest đã kiểm hash, không dựa vào ước lượng tệp trong đề xuất ban đầu.

**Model hội thoại hiện hành:** Qwen3 0.6B ONNX theo cùng manifest và cấu hình worker hiện có. Không tự đổi model/dtype hoặc tải nhiều biến thể để giải quyết thiếu bằng chứng. Ngân sách AI vẫn 800 MiB; dung lượng tải và RAM là hai số đo riêng. Kết quả ở một backend hoặc worktree không tự chứng minh mọi thiết bị hoặc chapter tích hợp đã đạt.

Transformers.js hỗ trợ WebGPU và cấu hình lượng tử hóa; ưu tiên WebGPU, kiểm tra adapter và tính năng thật, không bắt người chơi bật cờ thử nghiệm. Nếu thiếu GPU: thử ASR WASM, bỏ LLM nặng và giữ hội thoại biên soạn. Việc chọn dtype phải theo model và backend đã thử, không chỉ thay tên tham số. [WebGPU](https://huggingface.co/docs/transformers.js/guides/webgpu), [dtypes](https://huggingface.co/docs/transformers.js/guides/dtypes).

Trọng số, tokenizer, WASM, font và dữ liệu chữ được self-host cùng site, đặt đường dẫn local trong runtime và tắt tự tải model từ hub ở bản phát hành. Chỉ tải weights khi bật AI, hiển thị dung lượng; cache theo revision/hash, kiểm quota, xóa được. Hủy tải không tạo cache “hoàn chỉnh”; lần sau tải lại phần gói thiếu theo khả năng runtime. Service worker chỉ cache bộ cần thiết, báo rõ trạng thái offline-ready. [Cấu hình model local](https://huggingface.co/docs/transformers.js/en/custom_usage), [env](https://huggingface.co/docs/transformers.js/api/env).

Thu âm bằng getUserMedia/MediaRecorder hoặc PCM AudioWorklet theo spike; dừng track sau khi thu và khi đóng bảng. Giải mã về mono, resample theo input model (mục tiêu 16 kHz), kiểm MIME hỗ trợ thay vì hardcode WebM, chặn im lặng bằng mức tín hiệu và thời lượng trước ASR. Không dùng bản chép làm phép đo thanh điệu: nhận đúng chữ không chứng minh đọc đúng âm. HTTPS hoặc localhost cần cho microphone; [MDN getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia).

Dùng audio mẫu thu sẵn cho câu bắt buộc, có xác nhận quyền sử dụng; không cần model TTS trong MVP. Model chỉ gợi cách diễn đạt trong cảnh, kiến thức giải thích bắt buộc lấy từ nội dung biên soạn; không để LLM tự gán pinyin cho chữ đa âm rồi coi đó là đáp án. Với 20 chữ, bundle dữ liệu riêng và dùng charDataLoader; Hanzi Writer hỗ trợ quiz nét cho chữ biết trước, không thay OCR. [Tài liệu Hanzi Writer](https://hanziwriter.org/docs.html). Giữ giấy phép engine MIT và giấy phép dữ liệu Arphic riêng theo [trang license](https://hanziwriter.org/license.html).

## Khu vực mã hiện hành và trách nhiệm
Tiếp tục từ cấu trúc đang có, đọc nơi gọi trước khi sửa. Tách module chỉ khi thay đổi thực sự cần, không tạo đồng loạt các lớp trong sơ đồ dự kiến cũ.

| Khu vực | Trách nhiệm và nơi gọi |
| --- | --- |
| `package.json`, lockfile, `index.html`, `tsconfig.json` | Điểm chạy và các script hiện có; giữ phiên bản đã khóa |
| `src/main.ts`, `src/chapter/app.ts`, `chapter.css` | Chọn chapter/spike, PixiJS world, input/UI, hội thoại và tích hợp kỹ năng |
| `src/chapter/engine.ts` | Quest/event/thời gian, ba kỹ năng, journal, luật tiến trình và schema save |
| `src/chapter/content.ts`, `src/content/mvp.json`, `src/game/intent.ts` | Dữ liệu, diễn giải câu và kiểm điều kiện/schema; phân biệt đường chapter và spike |
| `src/chapter/store.ts`, `src/storage/save.ts`, `public/sw.js` | Save/backup/migration/import và cache/offline |
| `src/ai/ModelManager.ts`, `model.worker.ts`, `model-manifest.json`, `src/audio/` | Worker/model/tải/cache, recorder/PCM và request/session |
| `public/art/`, `audio/`, `fonts/`, `hanzi/`, `licenses/` | Art và nội dung hiện có, nguồn/license/hash |
| `public/models/`, `public/runtime/` | Tài nguyên AI local đã khóa; không sửa weights để qua kiểm |
| `scripts/`, `tests/` | Kiểm kỹ thuật, hợp đồng nội dung/bằng chứng, runner thiết bị/benchmark/privacy |
| `docs/game-dev/`, `docs/review-kit/`, tài liệu nghiệm thu và README | Kế hoạch đồng bộ, playtest người dùng và giới hạn nghiệm thu |

Không chạm cấu hình agent, cấu hình Bint, migrations hoặc CI được bảo vệ. Không commit dump audio người dùng hoặc cache sinh trong lúc chạy. Model dung lượng lớn phân phối dưới tài nguyên tĩnh có manifest, không mặc định đưa hàng trăm MB weights vào lịch sử Git.

## Lộ trình và mốc ra quyết định
| Mốc | Phạm vi | Điều kiện kết thúc |
| --- | --- | --- |
| M0: khép rủi ro kỹ thuật còn lại | Tiếp tục worker/model/mic/IME và corpus hiện có; xử lý finding của phiếu kỹ thuật theo quyền riêng | Có bằng chứng đúng bản tích hợp; model/corpus chưa đạt tiếp tục mở, không làm lại nền tảng đã có |
| M1: củng cố lát cắt nhà ăn | Tái sử dụng vòng chơi đã triển khai, rà hướng dẫn/input/phản hồi/nhịp chơi và save | Người dùng playtest được luồng đi → diễn đạt → NPC phản hồi → tiến trình → ôn/lưu; đường gõ có nhãn riêng |
| M2: rà chất lượng chương bảy ngày | Giữ sáu vùng/NPC/quest và event hiện có; bổ sung nhận diện, nhánh truyện và pacing còn thiếu | Chương tới được kết thúc, hoạt động/sự kiện không kẹt truyện, art/content dùng thật; kết quả người dùng được ghi riêng |
| M3: gắn kỹ năng vào mục tiêu chơi | Giữ 10 bài/20 chữ và sổ tay; rà lý do học, trợ giúp giảm dần, ôn và liên hệ với quest | Mỗi kỹ năng được dùng trong truyện, không bị ép lặp, save giữ nguồn và tiến bộ riêng; còn kiểm thiết bị thật thì chưa đóng AC |
| M4: hoàn thiện MVP | Art, audio, nội dung đã rà, accessibility, offline, benchmark và đóng gói | Toàn bộ AC đạt; thiếu bằng chứng AI/nội dung không được coi hoàn tất chỉ vì fallback hoạt động |

M0–M4 là mốc sản phẩm, không phải sáu bước của workflow. Từ hiện trạng đã triển khai, có thể hoàn thiện phần gameplay/art/content độc lập trong khi chờ thiết bị/người rà ở M0; không khóa mọi việc bằng kết quả AI còn thiếu. Phần phụ thuộc trực tiếp model hoặc cần đóng AC5/9/14 vẫn chờ bằng chứng đạt. Phát hành MVP chỉ khi toàn bộ điều kiện M4 và AC hiện hành đã đủ.

Thứ tự thực hiện tiếp: (1) chốt lát cắt còn thiếu và TSK-25; (2) xử lý dependency kỹ thuật .27/.28 theo phiếu và quyền của nó, không tự land; (3) TSK-26..28 và phần chưa xong của các TSK cũ trên snapshot thống nhất; (4) người dùng playtest, TSK-29 tổng hợp và sửa trong scope; (5) khép TSK-30/18..24 bằng bằng chứng đúng bản tích hợp. Không dùng lại ước lượng dựng mới 10–14 tuần cho backlog còn lại; ước lượng từng lát cắt sau khi đối chiếu hiện trạng và nguồn lực.

Sau MVP: chương một học kỳ, địa điểm và tình huống mới, quan hệ sâu hơn, sự kiện theo mùa đúng lịch, hỗ trợ mobile và nghiên cứu phát âm. Để thành phiếu riêng thay vì kéo vào AC hiện tại.

## Chiến lược kiểm thử và ngưỡng
**npm run verify:mvp** đã được định nghĩa, gồm kiểm kỹ thuật và hợp đồng bằng chứng MVP. Các script hiện có trong package.json gồm typecheck, build, test:unit, test:content, test:assets, test:browser và verify:m0-m1; không tạo lại tên script dự kiến cũ nếu đã có chức năng tương đương. Phiếu tổng vẫn chưa có xác nhận lệnh verify, không tự approve hoặc chạy lách cổng. Kiểm kỹ thuật/adapter không thay inference thật, nghiệm thu ngôn ngữ hoặc playtest. Theo yêu cầu người dùng, bỏ kiểm thử áp lực agent cho sáu skill và bỏ chạy thử workflow có tính phí; giữ lint và các cổng kỹ thuật của Bint. Playtest do người dùng thực hiện.

### Playtest của người dùng

Chạy trên bản build/revision được ghi rõ; dùng save test riêng hoặc new game, không ghi đè save thật. Bàn giao ca thực hiện, không mặc định đã PASS:

| Ca | Thao tác và điều cần quan sát |
| --- | --- |
| Làm quen | Từ new game tìm mục tiêu đầu và dùng E/hội thoại; ghi nơi không biết đi đâu hoặc phải hỏi hướng dẫn ngoài game |
| Vòng chơi nhà ăn | Gọi món bằng câu đúng khác mẫu, thử phủ định/thiếu thông tin, nhận hint, sửa và hoàn tất; xem phản hồi có giúp hiểu lý do |
| Cảm giác chơi | Di chuyển/va chạm/cửa nối, đọc biển và nhận diện NPC; ghi chỗ khó thấy, UI che, chữ/dấu khó đọc, phản hồi chậm hoặc âm thanh khó chịu |
| Chương và nhịp | Đi qua bảy ngày, thử sinh hoạt/sự kiện/lỡ hẹn; ghi khoảng trống đi lại, lặp nhàm chán, độ dài phiên và chỗ kẹt |
| Ba kỹ năng | Dùng nói/IME/nét trong quest; ghi mức hint, mức tự làm và đường fallback; không gọi thao tác bằng gõ là kết quả mic thật |
| Phục hồi | Reload giữa quest, hủy thao tác, lỗi/mất mạng theo ca được chuẩn bị; giữ tiến trình, không thưởng lại và có đường tiếp tục |

Mỗi phản hồi ghi build, ca/save/scene/ngày, bước tái hiện, mong đợi/thực tế, ảnh/log nếu có và mức cản trở. Sửa blocker trước, rồi vấn đề điều khiển/đọc hiểu/nhịp chơi, sau đó thẩm mỹ. Các mục 60–90 phút và 10–20 phút được điều chỉnh dựa trên ghi nhận, không tự ghi số liệu.

- **Logic và nội dung:** unit test phủ định/số lượng/ý định, reward một lần, event seed/cooldown, lịch ôn, ngày sau kết thúc, save migration/rollback và bỏ kết quả worker cũ. Content validator kiểm ID tham chiếu, 6 khu vực/6 NPC/6 quest/4 event, 12 tình huống, đủ 10 bài/20 chữ, audio/font/license và lối tới mọi bước truyện.
- **Bộ câu độc lập (ngưỡng MVP thực dụng):** 60 câu do biên soạn và rà nhãn trước, tách khỏi ví dụ trong prompt: 30 câu hợp ý đa dạng và 30 câu sai ý/thiếu slot/phủ định. Chấp nhận ít nhất 24/30 câu hợp ý; chấp nhận sai tối đa 3/30 câu không hợp; tổng phân loại đúng ít nhất 51/60. Ngoài bộ này, mỗi trong 12 cảnh phải có 3 biến thể đúng và 1 sai như AC-4. Không sửa nhãn để chiều đầu ra model.
- **Bộ âm thanh thật (ngưỡng MVP thực dụng):** 40 đoạn 3–8 giây gồm 24 câu đúng từ ít nhất 3 người; 8 câu sai ý và 8 mẫu im lặng/nhiễu. Với bản chép chưa sửa, nhận đúng ý ít nhất 16/24 câu đúng, chấp nhận sai tối đa 2/8 câu sai ý và 0/8 mẫu im lặng/nhiễu. Báo thêm CER trên 32 đoạn có lời nói để phân biệt lỗi ASR và lỗi suy ý; không quy kết sai âm từ CER. Có quyền sử dụng các fixture và không tải audio thử lên bên thứ ba. Sáu người nói, gồm người Việt mới học, là mục tiêu mở rộng sau MVP.
- **Rà nội dung (mẫu đại diện):** kiểm tự động đủ trường/asset/license cho 100% nội dung; một người có năng lực tiếng Trung rà ít nhất 12 câu đúng, tối thiểu một câu mỗi tình huống, gồm nghĩa Việt, pinyin theo ngữ cảnh và audio; xác nhận nhãn dataset và rà ít nhất 12 đầu ra model ở nhiều cảnh, ít nhất 80% phù hợp (10/12 khi rà 12). Người rà không bắt buộc là giáo viên có chứng chỉ. Mục sai/không chắc chuyển về phản hồi biên soạn hoặc sửa trước phát hành. Rà thủ công toàn bộ 72 câu/audio và 30 output chuyển sang sau MVP; agent không tự nhận đã có người duyệt.
- **Độ trễ và tài nguyên (smoke benchmark):** máy chuẩn đề xuất Windows 11, i5-1135G7, RAM 16 GB, Iris Xe hoặc cấu hình tương đương được ghi rõ; ghi browser/version/driver/revision/dtype. Sau 2 lượt warm-up, đo 12 lượt cho mỗi tác vụ: ASR của đoạn 5 giây p95 không quá 18 giây; LLM đến kết thúc tối đa 64 token p95 không quá 14 giây. Mỗi tác vụ quá 20 giây có nút hủy và chuyển nhập chữ. Báo riêng cold download, cold init và warm inference; memory peak báo số đo/cách đo, không đồng nhất với dung lượng weights. Đây là ngưỡng smoke để phát hiện hồi quy, không phải chứng nhận chất lượng nghiên cứu.
- **Trình duyệt và UI:** nghiệm thu trên một Chromium/Edge desktop có ghi version. Trên chapter hiện tại, kiểm một lần nhập Chinese Pinyin IME thật (Enter chọn chữ không gửi, Enter sau gửi), một vòng mic thật thu ≤20 giây/nghe/chép/sửa hoặc thu lại/ngừng track và ít nhất một ca phục hồi mic (từ chối quyền, rút mic hoặc codec không hỗ trợ). Hai ca lỗi còn lại có thể kiểm bằng adapter/unit và không chặn MVP. Font Hán/pinyin 1280×720 là viewport bắt buộc; 1920×1080, Firefox/Safari thật, fullscreen/resize mở rộng sau MVP.
- **Tải và lỗi M4:** chín ca bắt buộc: nhận diện sáu vùng, chữ Hán/pinyin 1280×720, xuất/nhập save, rollback save hỏng, quest offline, GPU device lost, WASM không sẵn, mất mạng giữa tải và sai hash. Các lỗi GPU/WASM/tải/hash có thể chủ động gây bằng fault runner trong browser; không cần làm hỏng thiết bị thật. Quota/cache và browser khác là khuyến nghị sau MVP. Một phiên HTTPS trên bản tích hợp phải đi qua audio/text/strokes/ASR/LLM, giữ nguyên URL/header/body trong trace và không có upload hoặc request tới hub/CDN/dịch vụ nhận giọng nói. Không cần nhiều phiên trace hay audit bảo mật toàn diện; không dùng analytics truyền hội thoại.
- **Hiệu năng game:** đo cảnh 10 NPC trong 60 giây sau warm-up, trung vị ít nhất 50 FPS ở 1280×720; đo thêm khi model đang chạy và báo nếu cần tạm dừng chuyển động lúc hội thoại. Gói cần để bắt đầu chơi không quá 30 MiB, toàn bộ gói AI được chọn không quá 800 MiB; không gộp AI vào lần tải mở trang.

## Rủi ro, phục hồi và phần chưa kiểm được
Model nhỏ có thể bỏ phủ định, bịa chữ khi im lặng hoặc giải thích sai. Phát hiện bằng tập chưa dùng trong prompt, audio thật và người rà. Giảm bằng schema, slot bắt buộc, kiểm phủ định độc lập, confidence “không chắc”, bản chép sửa được và phản hồi biên soạn. Tắt phần model hội thoại theo cấu hình nếu lỗi, giữ dữ liệu học và nhiệm vụ; ASR chất lượng thấp phải cải thiện hoặc báo lại giới hạn trước phát hành.

Tải model lớn và GPU yếu có thể làm người chơi bỏ cuộc. Lazy load, hiển thị dung lượng và cho chơi bằng chữ ngay; thử WebGPU/WASM, hủy worker và giải phóng session khi lỗi. Renderer ưu tiên WebGL để hạn chế tranh bộ nhớ với inference WebGPU; kiểm thực tế vẫn cần vì cùng dùng một GPU. Quay lại model manifest đã đo đạt nếu revision mới lỗi; không tự nâng revision theo main.

Save và nội dung đổi có thể làm kẹt quest. Migration theo schema, giữ bản backup trước migrate, validate và giao dịch thưởng; lỗi load khôi phục bản trước và cho xuất dữ liệu. Offline cache dùng version tách khỏi save, xóa model không được xóa tiến độ.

Mỹ thuật có nguy cơ thành phố cổ chung chung hoặc lẫn vùng. Dùng một vùng tham chiếu và cảnh đại học hiện đại; moodboard tương lai dẫn nguồn, không cắt ảnh tài sản có bản quyền vào game. Cảm hứng vườn Giang Nam có thể đối chiếu [UNESCO: Classical Gardens of Suzhou](https://whc.unesco.org/en/list/813/); đây là nguồn tham khảo, không chứng minh mọi công trình Trung Quốc cùng phong cách.

Đã có asset/audio và các báo cáo kỹ thuật/model lịch sử; các tệp pending không phải kết quả nghiệm thu. Review 5 của phiếu kỹ thuật ghi nhận số đo ASR/LLM và RSS, nhưng phiếu đó còn finding và chưa land; không chuyển các số đó thành met của phiếu tổng. Cần đối chiếu revision, corpus, thiết bị thật, privacy, người rà và gameplay trên bản tích hợp cuối. Các ngưỡng smoke trên là mức tối thiểu để đóng MVP; lint Bint chỉ xác nhận hợp đồng tài liệu, không xác nhận chất lượng game.

## Checklist nhất quán
AC-1 đến AC-14 giữ đúng từng chữ/thứ tự trong requirement và ticket; chỉ giảm ngưỡng/khối lượng kiểm chứng bổ trợ theo yêu cầu ngày 14/11/2026. TSK-1..30 giữ ID/checkbox lịch sử; mọi AC có TSK phủ và mọi TSK có điều kiện xong đo được. Đường dẫn sản phẩm nằm trong scope; các artifact chuẩn ghi qua bint task write, bản xuất docs được đồng bộ cùng nội dung. Không đổi workflow/verify/criteria của hai phiếu đang có và không tự ghi playtest/AC đạt khi chưa có bằng chứng. Mã validator được kiểm bằng fixture độc lập; report thực vẫn phải đo trên bản cuối.

