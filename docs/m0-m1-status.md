# M0/M1: trạng thái và bằng chứng

## Cập nhật sau tiếp tục: model live, thiết bị và hướng nét (2026-11-13)

Core `logs/verify-16.log` PASS trên snapshot sau thay đổi hướng nét: typecheck/build, unit, assets/hash/license, content, browser flow, review6, chapter và stroke-guide-flow. Review vòng 7 không có critical/high/medium, có một low .27 về nhãn diagnostic. Sau đó cây chung có thay đổi khác và nhãn diagnostic được sửa; Core cần verify lại cây cuối. `node tests/device-evidence-protocol.test.mjs` PASS trên bản sửa nhãn, gồm worker production nhận đủ byte nhưng sai SHA và trả lỗi trước inference. Người dùng từng nhận xét viết tay hoạt động tốt; chưa có nghiệm thu thủ công cho mũi tên mới.

| AC | Tự đối chiếu phạm vi phiếu con |
|---|---|
| 1 | Đạt bằng chứng thực thi: kiểm manifest/hash/license và stale/cancel ở Core verify-15; [Whisper live](evidence/2026-11-13T07-46-21-989Z-eb45b692-a1a5-4dc5-a9b9-ad1d559a34ce.json) và [Qwen live](evidence/2026-11-13T07-46-46-765Z-01aa4e59-8216-466c-8196-542629d138a5.json) có output thật. Hash worker/manager/manifest hiện trùng báo cáo. Whisper fixture sai nội dung; không suy ra chất lượng. |
| 2 | Đạt chức năng trong phạm vi AC theo Core verify-15 và [phiên mic snapshot](evidence/phone-tts-0142f5e7-d670-465a-a353-30c2a67890e4.json): im lặng bị chặn, thu lại, nghe lại, decode và transcript dùng được; test tự động kiểm fallback và provenance. Nguồn tiếng Trung là giọng tổng hợp phát qua điện thoại, không phải người nói. |
| 3 | Đạt kỹ thuật theo Core verify-16 và review 7: IME mô phỏng, khóa focus, Hanzi local và browser hướng nét, pointer, retry, cleanup. Pinyin thật có compositionstart/update nhưng không quan sát compositionend; chưa nghiệm thu thủ công mũi tên mới. |
| 4 | Đạt theo Core verify-15: NPC, E, va chạm và khóa UI qua browser adapter. |
| 5 | Đạt theo Core verify-15: biến thể đúng, phủ định, slot/schema và guard cảnh; không suy ra chất lượng corpus Qwen. |
| 6 | Đạt theo Core verify-15 cho quest, fallback, mentor, save/reward; phiên mic snapshot gửi transcript nguyên văn và có một mục sổ tay. Vị trí setup là tổng hợp, test browser tự động kiểm di chuyển. |
| 7 | Đạt phạm vi kỹ thuật theo Core verify-16: các kiểm thực và browser flow adapter PASS, gồm stale/error/cancel và save/reward. Core cần verify lại cây sau sửa diagnostic; adapter không phải inference thật. |
| 8 | Tài liệu và bằng chứng phân biệt snapshot/live và gate tổng; 60 câu/40 audio được rà, máy chuẩn, kiểm IME/viết tay đầy đủ, người rà và MVP tổng vẫn mở. |

Các bảng bên dưới là lịch sử. Chi tiết nguồn, hash và giới hạn của từng phiên nằm tại [bằng chứng thiết bị](device-evidence.md#bằng-chứng-live-và-phone-tts-sau-restart-2026-11-13).

## Đối chiếu mới nhất — snapshot và cây live (2026-11-13)

Core `logs/verify-14.log` PASS `verify:m0-m1` trên cây tại thời điểm Core chạy, gồm typecheck/build, unit, assets, content và browser flow adapter; không chứng minh inference thật. Các bảng cũ bên dưới là lịch sử. [Bằng chứng thiết bị và snapshot](device-evidence.md#bằng-chứng-snapshot-sau-restart-2026-11-13) ghi hash và giới hạn; worker/manager/manifest live đã khác snapshot. Runner live vừa sửa lỗi phase và cần điều phối đo lại; chưa có kết quả inference live sau sửa này.

| AC | Đánh giá và bằng chứng |
|---|---|
| 1 | **Chưa đủ** cho live: Core kiểm manifest/assets/cancel/stale; snapshot có Whisper WASM và Qwen WebGPU trả output thật, nhưng mã model live khác và cần chạy lại. |
| 2 | **Chưa đủ**: Core kiểm wiring, fallback và provenance; snapshot đã thu mic thật, nghe rõ và ASR trả text, nhưng lời nói là tiếng Việt, không chứng minh nhận tiếng Trung hay toàn bộ trường hợp thiết bị thật. |
| 3 | **Chưa đủ**: Core kiểm IME mô phỏng, focus và Hanzi local; trace Microsoft Pinyin thật có compositionstart/update, không thấy compositionend, chưa có nghiệm thu viết tay thủ công. |
| 4 | **Đạt kỹ thuật tự động**: Core verify-14 kiểm va chạm, NPC, E và focus; setup trong trace thủ công là tổng hợp, không chứng minh di chuyển người thật. |
| 5 | **Đạt logic trong phạm vi AC**: Core kiểm câu đúng, phủ định, slot/schema và guard; một output Qwen thật trên snapshot không thay bộ chất lượng có người rà. |
| 6 | **Chưa đủ**: Core kiểm quest, fallback, thưởng một lần, save/reload, mentor; phiên mic cho thấy sửa transcript và nhận thưởng, nhưng chỉ một click ghi trong trace, không xuất provenance và không chứng minh toàn bộ luồng lời nói tiếng Trung. |
| 7 | **Đạt**: Core verify-14 PASS các kiểm thực và browser adapter; adapter không là inference. Kiểm protocol runner mới chạy riêng, không thuộc snapshot verify-14. |
| 8 | **Đạt**: tài liệu nêu từng AC, nguồn và giới hạn bằng chứng, gate mở và lệnh chạy; không tuyên bố MVP đạt. |

Các gate bộ 60 câu/40 audio được người rà, chất lượng tiếng Trung, máy chuẩn, IME/viết tay đầy đủ và MVP tổng vẫn mở. Mic thật và một phần IME đã được thử có giới hạn như trên; không nói là chưa từng thử.

> Tài liệu này giữ lịch sử spike. Trạng thái chương chơi hiện tại, kết quả mới
> và các điều kiện chưa đạt nằm ở [đối chiếu toàn MVP](mvp-completion-status.md).

**Verify-8 và vòng sửa finding .26:** Bint Core `logs/verify-8.log` PASS trên snapshot trước vòng sửa này: typecheck, build, unit, hash/license, runtime hỏng và cả hai luồng Chromium, gồm Review6. Adapter là kiểm wiring, không phải inference thật. Vòng này dùng chung điều kiện quyền điều khiển cho keydown và ticker, xóa phím khi focus UI, trả focus về canvas khi đóng hội thoại và bỏ key repeat sau khi mất quyền. `tests/review6-flow.mjs` thêm kiểm giữ D/W/mũi tên khi click hai nút AI, trở lại canvas và nhấn mới. Snapshot mới qua typecheck/build và 21 unit logic; sandbox trả `spawn EPERM` khi chạy nhóm Node test còn lại và Chromium trước assertion. Cần Bint Core chạy verify trên snapshot mới; không suy PASS cho regression mới từ verify-8.

**Verify-9 và sửa kiểm tra bất đồng bộ:** Bint Core `logs/verify-9.log` qua typecheck, build, unit và kiểm tài nguyên, chạy Chromium nhưng dừng tại kiểm câu phủ định sau từ chối mic: test đọc feedback cũ ngay sau click trong khi `submit` đợi ghi lần thử vào IndexedDB. `tests/browser-flow.mjs` nay chờ đúng thông báo từ chối câu trước khi tiếp tục kiểm câu gõ đúng và nguồn `typed`; không thay điều kiện đánh giá. `node --check` qua cho cả hai browser flow. Lần chạy `npm run test:browser` sau sửa bị sandbox chặn `spawn EPERM` trước assertion; cần Core chạy lại toàn bộ trên snapshot này, chưa có kết quả browser mới.

Chưa nghiệm thu M0, M1 hay MVP tổng. Chạy `npm install`, `node scripts/models.mjs` để kiểm hash và `npm run dev`; WASD/mũi tên di chuyển, E tương tác, Esc đóng. `node scripts/models.mjs --download` tải file thiếu từ revision khóa và kiểm size/SHA-256. Model không đưa vào Git. `npm run verify:m0-m1` chạy typecheck, build, unit, kiểm hash/license, ca runtime hỏng và Playwright với adapter cố định chỉ trong Vite development. Bằng chứng model: [tiếp tục VZ0AVH](vz0avh-continuation.md), [audio mở](open-audio.md).

| AC | Bằng chứng và khoảng thiếu |
|---|---|
| 1 | Manifest khóa model/runtime, SHA/size/license, tổng 657015925 byte. Cache theo digest và có nút xóa riêng. Whisper browser thật qua năm mẫu; Qwen browser WASM quá hạn. Ca runtime hỏng bị từ chối; chưa nghiệm thu M0. |
| 2 | Verify-8 kiểm audio/edited/typed, transcript có khoảng trắng và ASR pending sau đóng/mở hoặc sửa draft. Whisper lời nói chạy thật riêng; chưa kiểm thiết bị micro và codec thật trong UI. |
| 3 | Composition qua browser adapter, Hanzi Writer/dữ liệu local có sẵn. IME hệ điều hành và viết tay thủ công còn cần kiểm. |
| 4 | Verify-8 qua đi tới NPC, E, hội thoại, va chạm và khóa UI trong adapter; regression focus nút AI mới chờ Core chạy trên snapshot mới. |
| 5 | Unit ba mẫu, phủ định, slot/schema qua. Qwen Node bộ 60 câu chẩn đoán đạt 46/60, nhận sai 14 câu; luật cảnh vẫn kiểm riêng và model không cấp thưởng. Qwen browser quá hạn. |
| 6 | Verify-8 qua quest, thưởng một lần, reload, model/mic lỗi, mentor ba mức, transaction đồng thời và vị trí lưu trước đóng UI. |
| 7 | `verify:m0-m1` qua ở Bint Core verify-8 trước sửa .26; bản mới chờ Core chạy lại do sandbox chặn spawn. Inference thật có log riêng; chưa phải nghiệm thu con người. |
| 8 | Báo cáo này và README mô tả lệnh, chứng cứ và các gate còn thiếu. |

## Inference thật riêng

Ngày 2026-11-13, Windows x64, Ryzen 7 6800HS, RAM 14.702.026.752 byte, Node 22.17.1, ONNX Runtime Node CPU, model local (không phải browser):

- `node scripts/bench-qwen.mjs`: Qwen3 0.6B revision `79346d370dfae34801d26993fda9ae2372900fd0`, q4f16, tải 5534 ms, sinh 876 ms, RSS sau chạy 1.458.417.664 byte. Input `Say hello.`, output ` I'm a student who is in the`. Đây là phép thử thực thi, không đánh giá intent.
- `node scripts/bench-whisper.mjs`: Whisper Tiny đa ngôn ngữ revision `ff4177021cc41f7db950912b73ea4fdf7d01d8e7`, q8, tải 1288 ms, suy luận 696 ms, RSS sau chạy 485.920.768 byte. Input một giây im lặng tổng hợp, output `我`. Đây không phải giọng nói hay bằng chứng độ chính xác ASR; gate im lặng của UI phải chặn mẫu này. RSS là snapshot `process.memoryUsage()`, không phải peak hay benchmark máy chuẩn.

Lượt tiếp tục phiếu tổng đã bổ sung 40 WAV FLEURS có transcript và CC BY 4.0; Whisper chạy thật trên 40 mẫu Node CPU và năm mẫu browser. Qwen có bộ chẩn đoán 60 câu chưa được người rà duyệt; cấu hình tắt thinking bằng tokenizer đã sửa lỗi tiền tố `<think>` làm JSON không đọc được. Kết quả mới nằm trong `m0-fleurs-results.json`, `m0-intent-results.json`, `m0-browser-asr-results.json` và `m0-browser-dialogue-results.json`. Qwen browser WASM quá hạn; luật cảnh và fallback gõ vẫn hoạt động. Chưa có benchmark theo giao thức máy chuẩn, sáu người nói được xác nhận hoặc bộ audio tình huống đúng/sai/nhiễu theo kế hoạch.

Gate tổng vẫn thiếu: bộ 60 câu/40 audio, máy chuẩn, IME và mic thật, người rà và M2–M4. Không tự coi M0/M1/MVP đã đạt. `verify:mvp` chạy verify kỹ thuật và đọc docs/mvp-gates.json: mỗi gate cần passed=true cùng đường dẫn bằng chứng tồn tại; các gate hiện thiếu nên chưa đạt. Tệp gate là dữ liệu nghiệm thu cần người có thẩm quyền cung cấp, không tự tạo kết quả đạt.

## Lịch sử vòng sửa bổ sung sau review 4

Các kết quả thất bại và giới hạn browser trong phần lịch sử này đã được thay thế bởi verify-8 ở đầu tài liệu; chúng chỉ mô tả snapshot tại thời điểm đó.

`logs/verify-5.log` của Bint Core đã qua typecheck, build, 20 unit, kiểm tài nguyên và chạy Chromium, nhưng thất bại tại assertion nguồn transcript. Trong phép thử, `compositionstart` giả không kích hoạt IME hệ điều hành; nhấn Enter thật chèn thêm xuống dòng vào textarea, nên draft thực sự khác transcript và được phân loại `edited-transcript`. Adapter hiện phát `keydown` có `isComposing` trong composition giả và kiểm draft không đổi, giữ nguyên assertion `audio-asr` và raw transcript có khoảng trắng. Đây là mô phỏng, không thay kiểm IME thật. Sau sửa, `npm run verify:m0-m1` trong sandbox qua typecheck/build/20 unit/hash nhưng tiến trình con của test tài nguyên trả status null; `npm run test:browser` bị spawn EPERM trước assertion. Chưa có kết quả Bint Core cho bản sửa này; cần chạy lại và không xem verify-5 là PASS.

`src/main.ts` so sánh nguyên văn draft với transcript gốc để giữ nguồn audio khi có khoảng trắng; `src/storage/save.ts` ghi snapshot vị trí và thưởng trong cùng giao dịch, hợp nhất tiến độ tăng dần và giữ journal đã thưởng. `tests/browser-flow.mjs` thêm kiểm vị trí cũ tại thời điểm gửi/reload chưa đóng, transcript khoảng trắng, ASR pending sau đổi phiên/sửa draft, nút hủy, ba mức mentor, va chạm, khóa UI và hai transaction thưởng đồng thời. `node --check tests/browser-flow.mjs` qua; các assertion mới chưa có kết quả browser do EPERM. Bằng chứng verify-4 chỉ áp dụng bản trước sửa. Adapter không chứng minh inference, mic hoặc IME thật.

## Cập nhật bằng chứng Core verify-10 và nghiệm thu thiết bị (2026-11-13)

Core `logs/verify-10.log` PASS trên snapshot sau sửa .26: typecheck/build, 21 unit logic, 14 kiểm gate, hash/license 657015925 byte, runtime hỏng và cả `browser-flow` lẫn `review6-flow`. Review vòng 6 không có finding mới, xác nhận điều kiện focus và test giữ phím trên hai nút AI. Các đoạn trước nói snapshot sửa .26 còn chờ Core chỉ là lịch sử, được thay bằng kết quả này. Adapter chỉ kiểm hành vi kỹ thuật, không là inference thật.

| AC | Đối chiếu hiện tại |
|---|---|
| 1 | **Chưa đủ**: manifest/hash/cache/cancel qua Core; Whisper browser fixture và Qwen Node thực thi thật; Qwen browser WASM quá hạn 20 giây, chưa đủ bằng chứng browser/model. |
| 2 | **Chưa đủ**: Core qua wiring audio, provenance, fallback gõ và stale; chưa kiểm mic, codec, nghe lại và lời nói thật trên thiết bị. |
| 3 | **Chưa đủ**: Core qua composition mô phỏng, focus, dữ liệu/nét local; IME OS và viết tay thực chưa kiểm. |
| 4 | **Đạt phần kỹ thuật tự động**: Core verify-10 qua NPC, va chạm, E, UI và focus; keyboard accessibility thực vẫn cần người thử. |
| 5 | **Đạt phần logic phạm vi AC**: Core qua ba câu, phủ định, slot/schema và guard cảnh; kết quả Qwen 46/60 trong corpus chẩn đoán chưa được người rà, không suy ra chất lượng model đạt. |
| 6 | **Chưa đủ**: Core qua gõ khi model/mic lỗi, ba mức mentor, thưởng một lần, lưu/khôi phục; đường nói qua mic thật chưa nghiệm thu. |
| 7 | **Đạt**: Core verify-10 chạy verify:m0-m1 thực, bao gồm adapter browser cho stale/error/cancel và save/reward; adapter không là inference model thật. |
| 8 | **Đạt**: tài liệu này, README và [hướng dẫn thiết bị](device-evidence.md) ghi lệnh, từng AC và gate còn mở; không tuyên bố M0/MVP tổng đạt. |

Runner [device-evidence.mjs](../scripts/device-evidence.mjs) tạo phiên JSON mới với GPU, backend, hash, network, raw output và các mốc tải/khởi tạo/inference; probe synthetic audio được dán nhãn. Sandbox thử Edge bị `spawn EPERM` trước browser, không chứng minh lỗi sản phẩm. Cần điều phối chạy phép đo browser thật theo hướng dẫn; không tự lấy micro, cài IME hay thay đổi quyền máy. Gate mic/IME thật, người rà corpus 60 câu/40 audio, chất lượng Qwen/browser, máy chuẩn và MVP tổng tiếp tục mở.

## Cập nhật Edge và Core verify-11

Core `logs/verify-11.log` PASS typecheck/build, unit, asset và hai browser flow adapter. Probe Edge thật qua audio tổng hợp; không phải mic. Qwen Edge WebGPU thất bại trước inference vì factory runtime `.jsep` bị ép vào backend đòi `webgpuInit`. [Điều tra và phương án sửa đề xuất](device-evidence.md#điều-tra-backend-edge-ngày-2026-11-13) ghi hash và giới hạn chứng cứ; chưa thay runtime và chưa chứng minh inference browser thành công. Tình trạng AC giữ như bảng verify-10: 1, 2, 3, 6 chưa đủ; 4, 5, 7, 8 có bằng chứng kỹ thuật phạm vi tương ứng. Các gate thiết bị thật, chất lượng model, corpus có người rà, máy chuẩn và MVP tổng vẫn mở.

## Runtime asyncify mới — chờ Core và phép đo browser (2026-11-13)

Core verify-11 PASS áp dụng snapshot trước thay runtime; verify-12 thất bại khi Vite reload trong browser flow, không phải PASS cho snapshot mới. Manifest nay khóa cặp asyncify cùng package ORT, kiểm SHA-256 và ngân sách 655531023 byte; xem [chi tiết và lệnh thử](device-evidence.md#triển-khai-cặp-asyncify-và-kiểm-lại-2026-11-13). `npm run typecheck`, build, unit audio/recorder/intent/model manager, `node scripts/models.mjs` và `npm run test:content` qua trong sandbox; verify đầy đủ dừng tại `node --test` do spawn EPERM, test asset độc lập cũng bị chặn spawn. Hai phép Edge mới chưa khởi động browser do EPERM. Cần Core verify lại snapshot này và đo Whisper WASM/Qwen WebGPU qua runner; chưa suy ra backend đã hoạt động.

AC 1, 2, 3, 6 vẫn chưa đủ bằng chứng theo bảng trên. AC 4, 5, 7 có bằng chứng Core verify-11 trên snapshot trước thay runtime; phần sửa mới cần Core kiểm lại. AC 8 giữ tài liệu và gate rõ ràng. Mic/IME thật, chất lượng Qwen, corpus được người rà, máy chuẩn và MVP tổng vẫn mở.
