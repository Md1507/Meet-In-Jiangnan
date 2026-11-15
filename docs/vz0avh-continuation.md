# Tiếp tục VZ0AVH — 2026-11-13

Phiếu tổng: `01M78EYZ58EHGP3R83ZKVZ0AVH` (ID người dùng nhập `VZ0AH`). Tiếp tục trên cây shared hiện tại; không commit, không approve hoặc tự đánh dấu hoàn tất. Phần M0/M1 kế thừa phiếu `01M78GXHE4NMBKNHHNQ0A8QBN8`. Không coi việc kiểm kỹ thuật qua là nghiệm thu toàn bộ game.

## Thay đổi

- `src/audio/recorder.ts`, `src/main.ts`: cố định callback theo lần thu, hủy bản thu khi đóng, gắn phiên và phiên bản draft ngay lúc bắt đầu. Bản thu đến trễ hoặc người dùng đã gõ không ghi đè câu mới. Thu lại giữ nguồn của transcript cũ cho đến khi có draft thay thế. Chặn phím E mở hội thoại lọt vào textarea.
- `src/ai/model.worker.ts`, `ModelManager.ts`: hash/byte model và runtime, cache theo digest manifest, đọc cache có kiểm chứng; lỗi quota/cache không làm mất dữ liệu đã kiểm hash. Giữ MIME runtime khi import Blob. Tiến trình tải có số byte, hủy, timeout và bỏ cả progress của worker cũ. Thử WebGPU có `shader-f16`, giữ ASR WASM và đường gõ khi model lỗi. Tắt thinking bằng `tokenizer_encode_kwargs.enable_thinking=false`, giới hạn Qwen 64 token.
- `tests/model-manager.test.ts`, `tests/browser-flow.mjs`, `tests/model-assets.test.mjs`: kiểm timeout/retry, stale progress, runtime hỏng, IME, bản thu trễ, nguồn audio/edited/typed, chống thưởng lặp và reload. Browser adapter chỉ chứng minh wiring; không coi là model thật.
- `scripts/fetch-fleurs.py`, các script `bench-*`, `tests/fixtures`: bộ audio công khai và phép đo thật, nguồn/hash/license cụ thể. `package.json` có lệnh chạy lại và đưa ca runtime hỏng vào verify kỹ thuật. Báo cáo cũ có các sửa riêng từ tiến trình Bint M0/M1 trong cùng cây; báo cáo này không coi mọi thay đổi trong cây là do một lượt tạo ra.

## Bằng chứng

| Kiểm tra | Kết quả |
| --- | --- |
| `npm run verify:m0-m1` | PASS (exit 0): typecheck/build, 20 unit test, model/runtime/license hash, runtime hỏng và browser adapter. |
| `node scripts/models.mjs` | 657.015.925 byte model + runtime, dưới 800 MiB; kiểm SHA-256 và size. |
| `python scripts/fetch-fleurs.py` | 40 WAV Mandarin gốc, 3–8 giây, có transcript, SHA-256 và CC BY 4.0; khoảng 15,6 MB fixture, không tải cùng game. |
| `npm run bench:asr` | 40/40 inference thật trên Node CPU; CER 61,82%, cold init 1.894 ms, p95 sau ba mẫu đầu 1.541 ms. Không đủ chất lượng để tự nghiệm thu. |
| `node scripts/bench-browser-ai.mjs --asr-only` | Năm mẫu qua worker Whisper thật trên Chromium 158.0.8127.18; kết quả và lưu lượng trong `m0-browser-asr-results.json`. |
| `node scripts/bench-browser-ai.mjs --dialogue-only` | Qwen nạp được sau sửa cache/MIME nhưng browser chọn WASM và quá hạn inference 20 giây; tổng elapsed gồm tải/init khoảng 62 giây. Không có kết quả Qwen browser đạt. |
| `npm run bench:intent` | Qwen Node CPU sau sửa thinking: 30/30 câu hợp ý được nhận, 14/30 câu sai ý bị nhận sai, tổng 46/60; chưa đạt ngưỡng 54/60 và tối đa 2 false positive. Nhãn do agent soạn, chưa được người có năng lực tiếng Trung rà. |

Kết quả JSON gốc giữ từng input/output, phần cứng và giới hạn phép đo. `m0-intent-before-results.json` lưu cấu hình cũ có tiền tố `<think>` làm parser từ chối mọi câu hợp ý. Không chỉnh nhãn theo kết quả model. Các phép đo Qwen và browser có thời gian chạy trùng nhau, nên latency của chúng chỉ là chẩn đoán dưới tải, không phải benchmark máy chuẩn hoặc so sánh tốc độ hai backend. Phép đo audio Node ban đầu chạy riêng. CER không chuẩn hóa phồn thể về giản thể; không dùng CER để chấm phát âm.

Không ghi nhận upload hoặc request ra ngoài origin trong các log browser. Điều này chỉ bao phủ các phiên suy luận được đo, chưa chứng minh offline toàn sản phẩm, mọi đường nét viết hoặc phiên micro thật.

## Đối chiếu MVP tổng

| AC | Trạng thái còn thiếu |
| --- | --- |
| 1 | Có PixiJS, di chuyển/va chạm/NPC/E và browser nhà ăn; thiếu sáu vùng và HTTPS triển khai. |
| 2 | Có một quest thưởng một lần và reload; thiếu chương bảy ngày, sáu quest/NPC, kết thúc tích hợp ba kỹ năng. |
| 3 | Chưa có bốn hoạt động, bốn sự kiện, clock/seed/cooldown. |
| 4 | Một cảnh nhận ba mẫu và từ chối phủ định/sai slot; thiếu 12 tình huống. Bộ thử độc lập còn false positive ở raw Qwen, không cho model cấp thưởng trực tiếp. |
| 5 | Có recorder 20 giây, nghe lại, resample/gate im lặng, năm transcript browser thật và kiểm nguồn; chưa kiểm mic/codec thiết bị thật qua UI. |
| 6 | IME composition được kiểm mô phỏng; thiếu 10 bài và OS IME thật. |
| 7 | Có chữ 我 local; thiếu 20 chữ và kiểm đủ ba chế độ/progress riêng. |
| 8 | Có mentor ba mức và sổ tay của quest; thiếu lịch ôn 1/3/7 cùng ba kỹ năng tách biệt. |
| 9 | Whisper browser thật và Qwen Node thật; Qwen browser quá hạn. Network chỉ được kiểm trong các phiên ghi log. |
| 10 | Có tải/progress/hủy/retry/cache version/xóa và fallback; chưa phủ đủ offline, device loss và mọi lỗi cache/GPU. |
| 11 | Còn cảnh nhà ăn hình học; thiếu art sáu vùng, font/asset và rà hiển thị hoàn chỉnh. |
| 12 | Có save/reward/backup IndexedDB; thiếu schema/version, export/import và state đầy đủ của chương. |
| 13 | Verify kỹ thuật thực đã có; thiếu content/E2E toàn MVP, FPS 60 giây/10 NPC, máy chuẩn và xác nhận verify của phiếu tổng. |
| 14 | Đã có 60 câu chẩn đoán và 40 audio mở nhưng chưa phải bộ được rà/đủ nhãn game, không xác nhận sáu người; chất lượng Qwen chưa đạt. Thiếu audio mẫu từng câu và người rà. |

Giữ tất cả AC tổng là chưa đạt khi chưa đủ bằng chứng. Mốc M0 còn vấn đề chất lượng và hiệu năng model; chưa mở sản xuất hàng loạt M2–M4 khi gate của kế hoạch chưa qua. Bước review có thể kiểm các bản sửa kỹ thuật ngay, không cần coi chúng là MVP hoàn chỉnh.
