# Hợp đồng bằng chứng MVP, schema 1

`npm run verify:mvp` chạy kiểm tra kỹ thuật M0/M1, sau đó gọi
`validateMvp` trong `scripts/mvp-evidence.mjs`. Mọi lỗi làm exit code khác 0.
Không có `passed: true` nào thay thế nội dung hoặc số đo. Đã có manifest
`src/content/mvp.json` và cấu hình `docs/mvp-gates.json`; các báo cáo còn thiếu
vẫn làm MVP **chưa đạt**; gate deferred phải có lý do và được báo riêng. Xem trạng thái hiện tại ở `docs/mvp-completion-status.md`.
Lệnh tổng trong phiếu Bint chưa được xác nhận; phiên này chỉ chạy các kiểm tra
hẹp và kiểm riêng `validateMvp`, không chạy `bint task verify` hoặc tự approve.

Có thể kiểm riêng hợp đồng mà không chạy verify tổng:

```powershell
node --test tests/mvp-evidence.test.mjs
node --input-type=module -e "import {validateMvp} from './scripts/mvp-evidence.mjs'; console.log(validateMvp(process.cwd()))"
```

Test tạo fixture tổng hợp trong thư mục tạm rồi dọn; không phải audio thật,
inference, kết quả người rà hoặc bằng chứng hiệu năng sản phẩm.

## Đầu vào và định danh bản đo

`docs/mvp-gates.json` là object có `schemaVersion: 1`, `content` là artifact
trỏ tới manifest nội dung trong `src/`, và các gate nghiệm thu dưới đây. Gate có
`deferred: true` phải nêu lý do và không được coi là số đo đạt.
`{ "evidence": "docs/<tên-báo-cáo>.json" }`:

- `corpus60Text40Audio` (deferred sau MVP)
- `referenceMachine`
- `realImeAndMic`
- `m2`
- `m3`
- `m4`

Artifact luôn có dạng `{ "path": "đường/dẫn/tương/đối", "sha256": "64 ký tự hex thường" }`.
Mọi đường dẫn được resolve và phải ở trong repository; thư mục, tệp rỗng,
artifact sai hash hoặc JSON sai định dạng đều bị từ chối. JSON tối đa 20 MiB.

Mỗi báo cáo có envelope:

```json
{
  "schemaVersion": 1,
  "kind": "m2",
  "recordedAt": "2026-11-13T00:00:00Z",
  "revision": "SHA-256 do mvpRevision sinh ra cho bản đã đo"
}
```

Build trước khi đo. Lấy revision bằng export `mvpRevision(root)` của
`scripts/mvp-evidence.mjs`. Digest bao gồm tên và byte của `src/`, `scripts/`,
`public/`, `dist/`, package/lock/index và cấu hình Vite/TypeScript ở gốc. Loại
`public/{models,runtime}` và `dist/{models,runtime}` khỏi digest; các byte AI lớn
được bước `test:assets` kiểm riêng theo hash/size của model manifest trong `src/`.
Tệp báo cáo/log đặt ngoài các thư mục được hash, ví dụ `docs/evidence/`.
Thay mã, nội dung, asset, cấu hình hoặc build phải đo lại; không sửa revision
của kết quả cũ để biến nó thành kết quả mới.

## Manifest nội dung

Manifest có `schemaVersion: 1`, `year: 2026`, `days: 7`, `startScene`, `endingQuest`.
Mỗi danh sách dùng object có `id` duy nhất, không rỗng:

| Trường | Tối thiểu | Dữ liệu được kiểm |
| --- | ---: | --- |
| `scenes` | 6 | `exits` là ID scene; tất cả tới được từ start; `art`, `license` là artifact |
| `npcs` | 6 | `scene` tồn tại; có `role: "mentor"` |
| `quests` | 6 | `day` 1–7, `npc`, `scenario`, `requires` là các ID quest; không chu trình/phụ thuộc ngày tương lai; ending ở ngày 7 |
| `activities`, `events` | 4 mỗi loại | `scene` hợp lệ, `condition` không rỗng |
| `scenarios` | 12 | `npc`, `positive` ít nhất 3 ID utterance, `negative` ít nhất 1; không trùng câu sau chuẩn hóa |
| `utterances` | theo mọi câu bắt buộc | `text` có chữ Hán, `pinyin` có dấu, `meaningVi`, `context`, `audio`, `license` |
| `sentenceLessons` | 10 | `scenario` tồn tại |
| `characters` | 20 | `character` là một chữ Hán không trùng, `data`, `license` là artifact; JSON nét có `strokes` và `medians` cùng độ dài, không rỗng |

Đây là kiểm cấu trúc và tài nguyên. Ý nghĩa ngôn ngữ, giản thể, chất lượng art,
audio và việc UI dùng đúng nội dung còn cần luồng chơi và người rà.

## Số liệu và kết quả từng gate

Ngưỡng dưới đây được giảm ngày 14/11/2026 theo yêu cầu người dùng cho MVP.
Kết quả cũ giữ nguyên; thay ngưỡng không biến report thiếu/cũ thành report đạt.

`corpus60Text40Audio` có `dataset` (artifact JSON), `execution:
"browser-worker-real-model"`, `textResults`, `audioResults`, `cer`:

- Dataset: `promptExamples` là mảng câu ví dụ trong prompt; `texts` đúng 60
  object `{id,text,expected}` với 30 đúng/30 sai, không trùng hoặc lọt vào câu
  bắt buộc/ví dụ. `audio` đúng 40 object `{id,file,license,label,speaker,text}`.
  `file`, `license` là artifact; WAV thực dài 3–8 giây; đường dẫn audio không
  trùng, 32 đoạn có lời không trùng hash. Nhãn gồm 24 `positive`, 8 `negative`,
  8 `noise`; câu đúng có ít nhất ba speaker; các đoạn có lời có transcript nhãn.
- `textResults`: đúng ID dataset, `{id,accepted,output}`; tính lại TP ≥24,
  FP ≤3, tổng đúng ≥51. Không tin các trường tổng hợp người viết báo cáo thêm.
- `audioResults`: đúng ID dataset, `{id,accepted,transcript}`; nhận đúng ≥16/24,
  nhận sai ≤2/8 và 0/8 nhiễu. CER phải khớp khoảng cách chỉnh sửa các transcript
  trên 32 đoạn có lời, bỏ dấu câu/khoảng trắng; không chấm phát âm từ CER.

`referenceMachine` có `machine` với `os`, `cpu`, `gpu`, `driver`, `browser`,
`browserVersion`, `ramGiB`, `memoryMethod`; `peakMemoryMiB`; `viewport` 1280×720,
`npcCount` ≥6 và `frameMs` là khoảng cách từng frame. Tổng thời gian ≥60 giây
(dung sai cộng số thực 1e-6 ms), median FPS tính lại ≥50. `asr`, `llm` có
`warmups` ≥2, `samplesMs` ít nhất 3, `coldDownloadMs`, `coldInitMs`, `backend`,
`dtype`, `modelRevision`. ASR đo `audioSeconds: 5`, p95 ≤18.000 ms; LLM đo
`maxNewTokens: 64`, p95 ≤14.000 ms (nearest rank). Tổng byte thực của `dist/`
ngoài models/runtime ≤30 MiB; tổng byte model+runtime trong manifest ≤800 MiB.
Máy chuẩn và tính đại diện của cấu hình vẫn cần người nghiệm thu đánh giá.

`realImeAndMic` có `method: "manual-real-devices"`, `tester`, `browser`, `ime`,
`microphone`; bắt buộc các case `ime-candidate-enter`, `mic-record-playback` và
ít nhất một trong `mic-denied`, `mic-unplugged`, `unsupported-codec`. Adapter không
được dùng thay thiết bị thật; hai ca lỗi còn lại là khuyến nghị.

Rà nội dung/audio bởi người có năng lực tiếng Trung được **defer sau MVP** theo
quyết định nghiệm thu hiện tại. Không tạo report giả cho phần này và không dùng
việc chưa rà để tuyên bố chất lượng ngôn ngữ; khi có user thật, bổ sung một gate
review độc lập với hash content/corpus của bản phát hành.

`m2` có `days: [1,2,3,4,5,6,7]`, các mảng ID `scenes`, `npcs`, `quests`,
`activities`, `events` khớp manifest; `endingQuest` khớp. `scenarioResults`
ánh xạ ID scenario tới `{id:<utterance ID>,accepted:<boolean>}` cho mọi biến
thể, so với nhãn positive/negative. Case: `chapter-complete`, `event-seed-repeat`,
`event-once-per-day`, `events-never-block-story`, `reward-once`.

`m3` có mảng ID `sentenceLessons`, `characters` khớp manifest; `reviewDays:
[1,3,7]`, `hintLevels: [1,2,3]`, `skills: ["speaking","sentence","handwriting"]`.
Case: `trace`, `stroke-hint`, `free-write-retry`, `stroke-order-feedback`,
`separate-progress-reload`, `review-schedule`.

`m4` có artifact `network` trỏ JSON `{origin,exercised,requests}`. `origin`
 là HTTPS, `exercised` phủ audio/text/strokes, còn model/runtime local được
kiểm riêng bằng manifest/hash; `requests` không rỗng,
mỗi `{url,method,bodyBytes,headers}` cùng origin, chỉ GET/HEAD và bodyBytes=0.
URL phải là đúng đường dẫn tệp tĩnh phát hành hoặc tệp trong model/runtime
manifest, không có query, fragment hay credentials. Header phải thuộc tập header
trình duyệt đã cho phép, và giá trị phải thuộc profile desktop tĩnh trong
`staticHeaders` (MIME/locale/encoding hữu hạn, metadata UA có cấu trúc giới hạn,
host/origin khớp chính xác). Header tùy biến, tham số Accept tùy ý, brand UA lạ,
giá trị chứa CR/LF, tên trùng khác hoa/thường và conditional headers
`If-None-Match`/`If-Modified-Since` đều bị từ chối. Thu trace bằng context mới,
không revalidate cache; giá trị chưa hỗ trợ cần điều tra, không bỏ header khỏi
trace để qua gate. Referer cũng phải là URL tĩnh không mang dữ liệu. Profile
này phát hiện payload trực tiếp/percent-encoded, không chứng minh không có kênh
ẩn trong mọi metadata hợp lệ. Chỉ kiểm cùng origin hoặc method/body là không đủ.
Một phiên HTTPS phủ audio/text/strokes là đủ cho MVP; model/runtime local được
kiểm bằng manifest/hash và không cần lặp nhiều browser.
Case bắt buộc: `six-region-art`, `hanzi-pinyin-1280x720`,
`save-import-export`, `corrupt-save-rollback`, `offline-quest`,
`wasm-unavailable`, `download-interrupted`, `model-hash-mismatch`.
Fault runner được phép chủ động gây lỗi GPU/WASM/tải/hash trong browser.
Các ca `gpu-device-lost`, `hanzi-pinyin-1920x1080`, `cache-quota`,
`firefox-text-smoke`, `safari-text-smoke` là khuyến nghị sau MVP, không bắt buộc
trong gate.

Mỗi gate có các case trên dùng `cases: [{id,status:"passed",observed,log}]`.
`log` là artifact JSON: `{schemaVersion:1,kind:"mvp-case",caseId,revision,steps}`.
`steps` không rỗng; mỗi bước `{action,expected,actual}` có actual bằng expected
theo deep equality. Log phải đúng ID case và revision của báo cáo. Một đường
dẫn log chung tùy ý hoặc cờ hoàn tất không thay cho kết quả từng ca.

Bộ kiểm chứng phát hiện thiếu/sai cấu trúc, sai hash, số đo dưới ngưỡng và kết
quả lỗi. Nó không xác thực danh tính người viết hoặc chứng minh báo cáo không
bị bịa. Người nghiệm thu vẫn phải kiểm nguồn log, thực hiện kiểm thử được mô tả
và đối chiếu UI/bản phát hành; tuyệt đối không tự nhận đã có người duyệt.

## Ràng buộc model và dung lượng

Mỗi số đo ASR/LLM phải ghi `model`, `modelRevision`, `dtype`, `backend` khớp
`inference` và model tương ứng trong `src/ai/model-manifest.json`. Một model,
revision hoặc backend khác không thể dùng để nghiệm thu cấu hình đang phát hành.
Qwen hiện là q4f16/WebGPU; không tuyên bố cấu hình đó chạy WASM. ASR dùng q8/WASM.

Worker AI và WASM do bundler phát ra trong `dist/assets/` được tính vào gói AI,
cùng với weights/runtime; chúng không nằm trong gói chơi đầu/offline bằng chữ.
Kiểm kích thước vẫn tính toàn bộ audio/font/art/hanzi của chương vào gói chơi.
`scripts/build-offline.mjs` sinh danh sách SHA-256/size của bộ chơi; service worker
chỉ dùng cache sau khi kiểm đủ mọi tệp và ghi dấu hoàn thành.
