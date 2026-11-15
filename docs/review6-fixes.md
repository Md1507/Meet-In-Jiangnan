# Sửa bốn lỗi medium của review 6 — VZ0AVH

Ngày 2026-11-13. Phạm vi: finding `.9`, `.10`, `.11`, `.12` của tác vụ
`01M78EYZ58EHGP3R83ZKVZ0AVH`. Đây là bản sửa để review lại, không phải nghiệm thu MVP.

| Finding | Nguyên nhân | Bản sửa và kiểm chứng |
| --- | --- | --- |
| `.9` Hủy trong decode vẫn chạy ASR | Chỉ hủy worker; callback decode giữ quyền khởi chạy model | `src/main.ts:26`: hủy tăng version audio/AI, dừng recorder/model; hủy, xóa cache, đóng và pagehide dùng chung. Chặn AI mới khi xóa cache; callback ASR/LLM kiểm session/version/draft. `tests/review6-flow.mjs` giữ decode và kết quả model rồi hủy/xóa; không gọi ASR, không ghi kết quả cũ; retry qua. |
| `.10` Hội thoại che nút hủy | Nút thuộc vùng trang phía sau lớp fixed | `src/main.ts:12`, `src/style.css:2`: chuyển controls đang có listener vào toolbar sticky trong hội thoại, trả về khi đóng. Browser 1280×720 kiểm elementFromPoint đúng nút và click thật; cuộn sổ tay dài vẫn bấm được. |
| `.11` Sổ tay tự thêm từ | Suy metadata theo tiền tố, gộp các câu khác nhau | `src/game/intent.ts:3`: bảng metadata chính xác cho bảy dạng đã được chấp nhận; cùng chuẩn hóa với evaluate. `src/main.ts:42` dùng lookup và fallback rõ ràng cho câu chưa biết. Unit và browser kiểm đủ bảy pinyin; câu không có 谢谢 không có xièxie/cảm ơn. |
| `.12` Gate MVP qua bằng thư mục | Chỉ tin passed và existsSync | `scripts/verify-mvp.mjs` gọi validator trong `scripts/mvp-evidence.mjs`: tệp thường không rỗng/JSON đúng loại, hash artifact, revision source/build, cấu trúc và tham chiếu nội dung, ngưỡng corpus/FPS/p95/size tính lại, coverage M2/M3 và case log có assertion, rà nội dung/IME-mic thật và network. Hợp đồng tại `docs/mvp-evidence.md`; 14 test độc lập có pass-path tổng hợp và reject-path cho exploit cũ, thiếu/sai evidence hoặc metrics. |

Kết quả cuối:

- `npm run verify:m0-m1`: **PASS**, exit 0. Typecheck/build; 21 unit hiện có
  (gồm test metadata mới) + 14 test hợp đồng evidence = 35; model/runtime/license
  hash và kiểm runtime hỏng; browser-flow và review6-flow đều qua.
- `node --test tests/mvp-evidence.test.mjs`: **14/14 PASS** trước lượt tổng.
- Gọi riêng `validateMvp(process.cwd())` trên repository hiện tại trả lỗi thiếu
  `docs/mvp-gates.json`, `passed: false`, đúng trạng thái sản phẩm. Không tạo
  gate thành công giả. Chưa có manifest/nội dung đầy đủ M2–M4.
- Không chạy `npm run verify:mvp` hay `bint task verify`: verify.command của phiếu
  tổng chưa được người xác nhận. Không chạy lại benchmark inference nặng.

Browser dùng adapter model/recorder và AudioContext điều khiển; đây là bằng chứng
điều phối bất đồng bộ/UI, không phải inference thật, OS IME hoặc mic thiết bị thật.
Fixture hợp đồng MVP chỉ tồn tại trong thư mục tạm, không phải bằng chứng nghiệm thu.
Validator kiểm tính nhất quán của report; người nghiệm thu còn cần kiểm nguồn
log và danh tính người rà, vì JSON không tự chứng minh tính trung thực.

Giữ nguyên các cải tiến đang có của phiếu khác trong shared workspace, gồm
snapshot reward, nguồn transcript, điều khiển focus và kiểm browser tương ứng.
Không commit/land/approve hoặc sửa trực tiếp trạng thái nội bộ của Bint.

AC8 vẫn thiếu lịch ôn và tiến bộ ba kỹ năng; AC10 vẫn thiếu kiểm đầy đủ thiết bị,
offline và device loss; AC13 vẫn thiếu số đo máy chuẩn và luồng/nội dung toàn MVP.
Các AC tổng không chuyển sang đạt chỉ từ bốn bản sửa này. Finding high `.8` về
phần MVP còn thiếu không thuộc phạm vi đã giải quyết.
