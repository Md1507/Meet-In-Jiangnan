# Nghiệm thu browser và thiết bị

Log native của browser và helper được giữ ngoài checkout, trong thư mục phiên
`jiangnan-browser-logs` của Temp. Các runner trả `browserLogs` gồm file log,
thư mục fallback và stderr. Browser host chạy ở thư mục này để giữ cả log native
bỏ qua CHROME_LOG_FILE; tiến trình build/test vẫn dùng cwd ban đầu. Giữ log
thực, không xóa `debug.log` cũ hoặc bỏ kiểm readonly của Bint.

## Runner chapter và diagnostic HTTPS bổ sung

`manual-device-acceptance.mjs` mặc định chapter, tự build/serve đúng worktree và
kiểm source/build/model hash đầu/cuối. `--mode spike` tạo build diagnostic DEV
riêng ở `dist/legacy-spike`, vì spike bị loại khỏi entry production; nó không
được coi là chapter phát hành. Lệnh
`--setup-only` đóng trang tự động và chỉ chứng minh setup/snapshot; không kiểm
IME hoặc mic. Khi chạy tương tác, chờ READY rồi người dùng mới chủ động nhập
IME/Record; runner không cấp quyền mic tự động. Snapshot IndexedDB chỉ đọc, có
timestamp và nhãn incomplete nếu không quan sát được; đóng trang có thể mất
ghi mới hơn snapshot cuối.

```powershell
node scripts/manual-device-acceptance.mjs --browser edge --output-dir docs/evidence/phien-thiet-bi-moi
node scripts/bench-browser-ai.mjs --benchmark --browser edge --output docs/evidence/phien-benchmark-moi.json
node scripts/bench-chapter.mjs --faults --fps --output-dir docs/evidence/phien-fault-moi
```

Chạy tuần tự các phép đo. Runner model dùng worker/ModelManager production từ
build, HTTPS local tự ký, full URL/header/body base64 kể request bị chặn; trace
có thể chứa dữ liệu nhạy cảm và cần giữ local. Canary regression kiểm cả worker
và service worker. Server diagnostic cho phép `connect-src 'self' blob:` để ORT
đọc WASM blob local đã kiểm hash; đây là policy server thử, chưa chứng minh
policy của deployment bên ngoài. Không nới hợp đồng kiểm privacy M4.

FPS của chapter ghi workload từ content và state chỉ đọc: content hiện có sáu
NPC, cảnh đo có thể chỉ một NPC theo lịch. Không ghi cứng 10 NPC hoặc dùng kết
quả này công nhận workload máy chuẩn yêu cầu 10 NPC. Cần phép đo stress đó trên
bản tích hợp; ngưỡng 50 FPS/60 giây/1280×720 vẫn giữ nguyên.

Benchmark tách cold khỏi 3 warmup và 20 lượt, đo `running` tới result, p95
nearest-rank. Mỗi lần gọi tạo worker/pipeline mới: cache browser ấm, không phải
model resident. Network span và init residual có overlap, không gọi residual là
thời gian compile thuần. RSS lấy mẫu cây tiến trình browser mỗi 100 ms bằng
Python/psutil, có raw PID/sample/peak, có thể đếm trùng shared pages và bỏ lỡ
spike; không phải dedicated GPU VRAM hoặc kích thước weights. Có thể chỉ định
`BINT_REFERENCE_PYTHON` và `BINT_REFERENCE_PYTHON_DEPS`. Model/sampler lỗi được
ghi incomplete, không tạo p95 giả. `device-evidence.mjs` giữ tương thích diagnostic
Vite HTTP cũ và nay dùng full capture; dùng runner HTTPS ở trên cho kiểm privacy.

Fault injection sửa môi trường worker trong context tạm, không sửa mã/runtime
sản phẩm. Log có marker/route trigger, lỗi, fallback và retry; GPU chưa tới điểm
tiêm lỗi là inconclusive. Các ca mic denied/unplug/codec và Safari thật vẫn cần
người thao tác, không đồng nhất WebKit automation với Safari.

## Bằng chứng live và phone TTS sau restart (2026-11-13)

[Whisper live WASM](evidence/2026-11-13T07-46-21-989Z-eb45b692-a1a5-4dc5-a9b9-ad1d559a34ce.json) chạy fixture FLEURS trong 3492 ms, có output nhưng không chính xác; đây là chứng cứ thực thi, không chứng minh chất lượng. [Qwen live WebGPU](evidence/2026-11-13T07-46-46-765Z-01aa4e59-8216-466c-8196-542629d138a5.json) chạy 2587 ms và trả JSON order_water, hot/water/1 đúng cho một câu. Edge 157 headless trên AMD RDNA-2, shader-f16; không request ngoài. SHA-256 worker `34d8067080378aba4bfc8511065a4362c810106482f0c84321bc527dd8b79bfa`, manager `236641d05b84c1df659333d43118981072e673df22d8fb4c922362f0e216c543`, manifest `9c2eada6387855cc396194800f1b9f60ac7cdf9440d9bab10645dadf26274c7a` khớp báo cáo và cây live khi đối chiếu. Không coi hai phép này là benchmark máy chuẩn hay kiểm corpus.

[Phiên phone TTS](evidence/phone-tts-0142f5e7-d670-465a-a353-30c2a67890e4.json) kết thúc sạch `browser-page-closed` trên snapshot cũ. Theo [xác nhận người dùng](evidence/phone-tts-human-confirmation-0142f5e7.json), giọng Trung tổng hợp Google Translate phát từ điện thoại vào mic máy thật; lần đầu im lặng bị chặn, thu lại decode mono 48 kHz 3,84 giây, nghe rõ, transcript `给我一杯热水` được gửi nguyên văn, quest thành công và sổ tay có một mục. Câu yêu cầu `我要一杯热水。` khác transcript, văn bản thực trên điện thoại không được chụp: không khẳng định khớp chính xác. Không lưu audio thô; setup vị trí NPC tổng hợp, không là bằng chứng di chuyển người thật. Ba tệp phone và xác nhận đã sao chép nguyên byte và đối chiếu SHA-256 nguồn. [Nhận xét viết tay](evidence/phone-tts-hanzi-feedback-0142f5e7.json) là hồi tưởng người dùng, không phải trace hoàn thành từng nút hay nghiệm thu hướng nét mới.

Phiên Pinyin trước có compositionstart/update đáng tin cậy nhưng không ghi nhận compositionend. Một lần mic khác dùng tiếng Việt, không suy ra chất lượng ASR tiếng Trung. Các gate corpus có người rà, thiết bị/IME đầy đủ, máy chuẩn và MVP tổng vẫn mở.

## Phiên chapter live 2026-11-14

[Log Edge headed](evidence/manual-mvp-live/2026-11-14T05-41-52-036Z-2066cdb4-7cb8-46e8-b329-cb0950f5ff91.json)
đã chạy trên chapter hiện tại: người dùng nhập qua Windows Pinyin và tạo
compositionstart/update, thu mic thật nhiều lượt ở 48 kHz, nhận WebM Opus, decode,
nghe playback, nhận transcript Whisper local, sửa/gửi và thấy track kết thúc. Một
lượt im lặng bị chặn rồi thu lại thành công. Trace không ghi rõ compositionend hoặc
phím Enter trong lần chọn ứng viên, nên AC6 vẫn deferred; report này là bằng chứng
thiết bị thô, chưa được dùng làm gate `realImeAndMic` cho tới khi đóng schema/revision.

## Bằng chứng snapshot sau restart (2026-11-13)

Các tệp sau được sao chép nguyên byte và đối chiếu SHA-256 với nguồn ở `device-acceptance`; [manifest snapshot](evidence/snapshot-20261113T120800-manifest.json) xác định mã đã dùng. Worker, manager và manifest cây live đã khác snapshot: không áp dụng kết quả model cho phiên bản live. Hai lượt Edge 157 headless trên snapshot không có request ngoài: [Whisper WASM, fixture FLEURS](evidence/snapshot-whisper-422df83f-f00f-478b-9004-a51cddf7f953.json) có `inference-start` đến `result` 3963 ms; [Qwen WebGPU AMD RDNA-2, shader-f16](evidence/snapshot-qwen-3fbdda0a-015c-4dc0-9906-f717b0fbf913.json) 7634 ms, trả JSON order_water đúng cho một câu. Cả hai ghi output thực, không phải kết quả adapter; không chứng minh chất lượng corpus hay máy chuẩn.

[Trace thủ công](evidence/manual-8b2343f2-295e-4a49-9158-1ad78d7d2fc3.json), [xác nhận người dùng](evidence/manual-confirmations-13b0da44-6953-4d7c-ada7-d15a8a1645c6.json) và [ghi chú kết thúc observer](evidence/manual-observer-termination-8b2343f2.json) mô tả cùng snapshot. Trace có compositionstart/update tin cậy và phím Process đang composition, không có compositionend được quan sát; người dùng xác nhận Microsoft Pinyin Enter đầu giữ literal `wo`, Enter sau gửi. Mic thật ghi WebM Opus 49290 byte, decode mono 48 kHz 3,24 giây, người dùng nghe lại rõ và track ended; ASR nguyên văn `沒什麼什麼什麼什麼`. Người dùng xác nhận nói tiếng Việt “1234 1234”, không nói câu Trung được gợi ý: không suy luận chất lượng ASR tiếng Trung. Người dùng sửa thành `我要一杯热水` và xác nhận gửi lặp, sổ tay một mục; trace chỉ ghi một click gửi và không xuất provenance đã lưu. Vị trí seller và mở E được thiết lập tổng hợp, không chứng minh di chuyển người thật. Hai phiên manual trước lỗi setup không tính là thành công. File raw vẫn `running` vì Ctrl+C không chạy finalizer; không coi đó là kết thúc sạch.

SHA-256 lần lượt của manifest, Whisper, Qwen, trace, xác nhận, ghi chú là `e3a72de69f81947a48682091a959682c638d2175a2dccfdb5b6a688f09bbcb5e`, `8b8bed96aa339b34d4513b9fbd7539db7fba986cf3ed1cddb2fde38247392`, `5f0687bb9ab7521e90ac196d01cc62fb1203039d89c82f818e52736a5b380731`, `e625a15b06201eda2279c4ff84b7cc05c0c9a451ae14315c50856cb862e885f0`, `bc4b2de954cc7bde3017ed2758cc8272e04b7cedbe6599a13e1c1238ee3cb965`, `6af7325aaca5cf1518a0d4d0adec6db5eab044ac091c3ffc345248b41610b532`.

Runner live đã sửa cách nhận phase: `backend`/`progress`/`running` là trung gian, kết quả chỉ thành công với text không rỗng sau `running` và đúng ID/session; error hoặc message sai bị từ chối. `node tests/device-evidence-protocol.test.mjs` kiểm hợp đồng này. Điều phối cần chạy lại hai lệnh ASR/Qwen dưới đây trên live; không suy kết quả live từ snapshot hoặc chỉ từ `outcome` của báo cáo cũ.

Runner `node scripts/device-evidence.mjs` dùng worker production, model local và profile browser tạm, không dùng adapter hoặc xin micro. Nó chặn request ngoài localhost và mọi method ngoài GET/HEAD. Mỗi lượt tạo tệp JSON mới trong `docs/evidence/` bằng tên thời gian và UUID; không sửa báo cáo cũ. File có thể chứa thông tin máy, đường dẫn và raw output: kiểm tra trước khi chia sẻ.

Từ môi trường điều phối được phép khởi chạy browser, tại thư mục dự án (không chạy song song các phép đo nặng):

```powershell
node scripts/models.mjs
node scripts/device-evidence.mjs --probe-only --browser chromium
node scripts/device-evidence.mjs --browser chromium --timeout-ms 150000
node scripts/device-evidence.mjs --browser edge --headed --timeout-ms 150000
node scripts/device-evidence.mjs --browser chrome --headed --timeout-ms 150000
```

Có thể chọn `edge`/`chrome` không `--headed` để so sánh headless và cửa sổ thật của cùng phiên bản. Runner không thêm flag bật GPU không an toàn, và loại flag `--enable-unsafe-swiftshader` mặc định của Playwright. Kết quả lấy Chromium do Playwright điều khiển, profile tạm và các flags mặc định khác của Playwright; không khẳng định đồng nhất với profile trình duyệt người dùng. Không chọn thiết bị GPU giả. Timeout runner tối đa 300000 ms chỉ để thu chẩn đoán worker và đóng browser, không thay giới hạn 20 giây suy luận của ModelManager; nếu inference vượt 20 giây thì sản phẩm vẫn timeout. Một lượt timeout hoặc lỗi trả mã khác 0. `--probe-only` không chạy model; không dùng nó làm bằng chứng inference.

Báo cáo ghi version browser, OS/CPU/RAM, CDP SystemInfo GPU/driver/feature status nếu browser cho phép, thông tin adapter WebGPU và `shader-f16`, manifest/runtime revision, hash thực weight và hash source worker/manager/manifest. Event network có thời điểm bắt đầu/kết thúc; `worker-start`, `asset-read-complete`, `inference-start` (có backend) và `result`/`error`/`diagnostic-timeout` cho phép quan sát các giai đoạn. `asset-read-complete` chỉ báo đã đọc đủ byte, không chứng minh SHA-256 đã kiểm xong: worker kiểm hash sau chunk cuối và từ chối dữ liệu sai. Các báo cáo raw cũ giữ nhãn legacy `asset-verified`, nhưng nhãn đó cũng chỉ có nghĩa đọc đủ byte, không phải bằng chứng hash đã qua tại thời điểm event. Asset có thể đến từ cache profile hoặc OS: profile tạm là cold browser cache, không đảm bảo cold disk cache; mốc đọc không phải thời gian tải mạng thuần. Không coi một lượt là benchmark máy chuẩn. Request timestamps và sự kiện chỉ ghi điều quan sát được, không chứng minh nguyên nhân nếu thiếu thông tin GPU; cần so sánh các lượt trên cùng máy và kiểm tra `systemInfo`, adapter và backend trước khi kết luận.

Probe audio dùng oscillator tổng hợp vào `MediaRecorder`, decode, resample, kiểm silence gate, dừng track và thử `audio.play()`. Có thể bị chính sách autoplay từ chối vì không có gesture; ghi lỗi này thay vì suy lỗi playback của UI. Đây không phải micro hay lời nói; không lưu audio và không gọi ASR với mẫu tổng hợp. Thử mic thực phải do người dùng chủ động thao tác trong UI: cho phép quyền mic khi được hỏi, nói câu có nội dung, dừng và nghe lại, kiểm transcript nguyên gốc/thu lại/đóng ngừng track; thử từ chối quyền rồi hoàn thành quest bằng gõ. Ghi browser/version, thiết bị, codec, thời gian, input và transcript gốc, kết quả từng bước và người thử vào một file phiên mới; không đưa audio hoặc câu nói riêng tư vào báo cáo khi chưa được phép. Không tự đổi quyền hệ thống.

Để kiểm IME thật, người dùng chọn hoặc cài phương thức nhập phù hợp bằng cài đặt hệ điều hành của mình: nhập chữ Hán vào hội thoại, xác nhận Enter khi composition không gửi, Enter sau khi chọn mới gửi; kiểm focus, đóng/mở, bàn phím và thử ba chế độ viết 我. Ghi phiên bản OS/IME, người thử và kết quả; event giả trong Playwright không thay thế. Không cài ngôn ngữ/driver từ runner.

Kết quả cũ: `m0-browser-dialogue-results.json` ghi Chromium headless 158 Qwen WASM đã vào inference rồi quá hạn sản phẩm, không có request ngoài hoặc upload; nó không ghi GPU/feature nên không chứng minh vì sao WebGPU không được chọn. `m0-browser-asr-results.json` dùng audio FLEURS, không phải mic. Lượt sandbox 2026-11-13 probe Edge bị `spawn EPERM` trước khi browser khởi động: chỉ là giới hạn môi trường, không kết luận lỗi model/GPU. Core `verify-10.log` PASS dùng adapter kiểm kỹ thuật, không phải phép đo model. Chất lượng Qwen, corpus 60 câu/40 audio có người rà, mic/IME thật, máy chuẩn và MVP tổng vẫn cần bằng chứng riêng.

## Điều tra backend Edge ngày 2026-11-13

Hai phiên điều phối thực nằm tại [probe Edge](evidence/2026-11-13T04-45-42-485Z-346bb664-aa1a-44a3-aefd-f136249a0000.json) và [chẩn đoán Qwen Edge](evidence/2026-11-13T04-46-09-122Z-54c66074-4394-4240-bbf4-4b8fb5c6128e.json). Edge 157 headless báo adapter AMD RDNA-2 có shader-f16. Probe synthetic qua codec, decode/resample, silence, playback và stop track; không có micro hoặc lời nói thực. Lượt Qwen xác minh weights tại 6459 ms, báo `webgpuInit is not a function` tại 11242 ms, trước `inference-start`. Trường `outcome: completed` chỉ có nghĩa worker đã kết thúc; phase `error` và mã thoát khác 0 mới mô tả kết quả model. Không có inference Qwen thành công, và kết quả này không chứng minh GPU chậm.

Đối chiếu dependency cài local: Transformers 4.3.2 `src/backends/onnx.js` import `onnxruntime-web/webgpu` và mặc định chọn cặp `.asyncify` cho browser này. Mã ORT được Vite bundle gọi `j().webgpuInit(...)` khi khởi tạo WebGPU. Trong khi đó `src/ai/model.worker.ts` ghi đè `wasmPaths` bằng cặp `.jsep` từ manifest; module `.jsep.mjs` đã khóa có `jsepInit`, không có `webgpuInit`. SHA-256 của module public `c2f80e915e9df63289788a99d434d8c4e00e64e9c1f030f4b80b022458dd2c99` trùng module `.jsep` của package ORT `1.31.0-dev.20260914-8d85527a0`. Đây là bằng chứng trực tiếp về giao diện factory không khớp với mã backend đang gọi, giải thích lỗi quan sát được; chưa chứng minh các bước model tiếp theo sẽ thành công.

Phương án tối thiểu để review riêng là khóa và phục vụ **cả cặp** `ort-wasm-simd-threaded.asyncify.mjs` (53057 byte, SHA-256 `0966b6105cd936744498aa60df7a22cbd47af3374dbc64a9ab561c08a71e3611`) và `.asyncify.wasm` (26861777 byte, SHA-256 `49871f5a4409519797e127440868a6d1923339d9185907f301a5b2a1d90af082`) từ đúng package/version, cập nhật manifest, downloader, kiểm integrity và các kiểm liên quan, rồi thử lại Whisper WASM và Qwen WebGPU trên browser thật. Không chỉ đổi tên module hay bỏ kiểm hash; giữ local-only, giới hạn 20 giây và fallback. Đây là đề xuất chưa triển khai hoặc xác minh, không phải bằng chứng inference hay chấp thuận thay runtime. Sau sửa cần tạo phiên evidence mới và so sánh headless/headed được phép; không sửa các phiên cũ.

## Triển khai cặp asyncify và kiểm lại (2026-11-13)

Cặp đề xuất ở trên đã được thay trong manifest và `public/runtime` bằng đúng hai tệp asyncify của `onnxruntime-web` 1.31.0-dev.20260914-8d85527a0; worker vẫn kiểm byte/SHA-256 trước khi nạp blob local. `node scripts/models.mjs` xác minh toàn bộ model/runtime/license: 655531023 byte < 838860800. `node scripts/models.mjs --download` cũng lấy runtime từ package local đã cài, chỉ copy sau khi kiểm version, kích thước và hash. Test asset kiểm cặp manifest, sự hiện diện `webgpuInit` và từ chối runtime hỏng. Không đổi dtype, fallback hay timeout sản phẩm.

Chạy lại riêng từng phép sau trong phiên điều phối có quyền mở browser; không chạy song song:

```powershell
node scripts/device-evidence.mjs --asr --browser edge --timeout-ms 150000
node scripts/device-evidence.mjs --browser edge --timeout-ms 150000
```

`--asr` dùng WAV FLEURS đầu tiên, kiểm hash fixture và hai weights Whisper, decode/resample trong browser và gọi worker production WASM. Báo cáo mới ghi dataset/revision/license, hash, transcript thô, backend và mốc thời gian; fixture không phải micro. Chẩn đoán timeout 150 giây không thay timeout 20 giây của sản phẩm. Hai lượt sandbox [ASR](evidence/2026-11-13T05-03-03-479Z-fae9ce1d-8498-40a6-8f4d-e7400b04e91d.json) và [Qwen](evidence/2026-11-13T05-03-47-698Z-2ca96273-957e-40d6-b4eb-538c0c26151f.json) đều bị `spawn EPERM` trước browser: chưa có kết quả runtime mới, không chứng minh lỗi sản phẩm hay inference thành công. Cần Core chạy verify và điều phối chạy hai lệnh trên; không thay báo cáo cũ.
