# Bàn giao playtest chapter — pending-user

Phiếu 01M7AWMZ6C065JP5EHAZABVRFS, worktree riêng; chưa có phản hồi người chơi. HEAD nền 3bfbedb19b1a89abdaf4c57bd33f329fba9e3767 không định danh thay đổi chưa commit. Lượt polish chạy `node scripts/game-dev-verify.mjs` exit 0, runId b009e5fd-262c-45be-9814-2bcaf583c5b5; `manifest.json` ghi sourceDigest `376cc7830565595955def50e79bb4e11e7aa4728ca8f88b524bbf8ab7457e943`, buildDigest `c6d1483504599cb9a3599cf1b010655847e243f72e7f4f4756af4aed2338f4e8`, hash từng file, fixture và ảnh. Đây là bản trong worktree, chưa land; Core sẽ verify lại theo flow.

Chạy bản đã build bằng `npx vite preview --host 127.0.0.1`, mở địa chỉ được in ra. Trước khi thử, xuất save thật qua **Lưu & cài đặt → Xuất bản lưu JSON**. Dùng profile trình duyệt riêng; trong profile đó chọn **Lưu & cài đặt → Nhập bản lưu JSON**. Nhập thay save hiện tại của profile; không thử phục hồi trên dữ liệu thật. Các save được sinh qua `node --experimental-strip-types scripts/game-dev-fixtures.mjs`, kiểm bằng validChapter; invalid-schema cố ý sai và phải bị từ chối. Kiểm tự động đã nhập cả sáu file qua UI profile riêng.

| Fixture | SHA-256 |
| --- | --- |
| new-game.json | e15a2463ca816ff601657bf3db2f298d7cf581646c0b48bfa81a00b79379c14f |
| canteen-before.json | 26a009e190be85d9f273a0e5db8f78a939a80db8c61721976e382a47972b050f |
| canteen-after.json | 88a80a4e4840fc8375e2f15aa345aa4b898bb83a31513fc65f7781b967250a73 |
| day6-preparation.json | ace7f65cd6d706977c65e55b439ecacc37a8164cb39f9afd374e78d6444ca823 |
| day7-ending-ready.json | fb463a2b79e70a1b7d2d80dd9b5d9cd904b9b40bad2fb7a1a7167af6bf627a61 |
| invalid-schema.json | 595f138400d16b45ccf9dcb12d9f1075e4db221b86fbb6f45fc050979aa49f99 |

## Checklist — tất cả pending-user

- PT-1 / new-game: tìm NPC, đi WASD/mũi tên, E, Escape và đổi buổi; mong đợi chỉ dẫn theo lịch và focus về world. Ghi vị trí lạc hoặc UI che.
- PT-2 / canteen-before: thử 我不要热水。 và 我要两杯热水。 rồi câu đúng; mong đợi sai không tiến, gợi ý giúp sửa, đúng cập nhật quest/sổ tay.
- PT-3 / canteen-before và canteen-after: hủy, mở lại, giữ phím khi chuyển focus, luyện lại và reload; mong đợi không di chuyển lúc nhập, không thưởng lại, nguồn gõ giữ nguyên.
- PT-4 / day6-preparation: mở bài lời mời và chữ 我 theo thứ tự tùy chọn, tiếp tục ngày 7; mong đợi có lý do, có đường quay lại.
- PT-5 / day7-ending-ready hoặc new-game: hoàn tất lời mời hoặc đi toàn chương; mong đợi kết thúc keyboard đúng và còn đường ôn. Ghi thời lượng nếu tự đo.
- PT-6 / canteen-before: thử IME hệ điều hành, mic, thu lại và quiz nét nếu thiết bị sẵn; mong đợi gõ/nói/nét tách biệt, lỗi mic có đường gõ. Ghi các ca chưa thử.
- PT-7 / profile riêng: xuất/reload, nhập invalid-schema, hủy và thử phục hồi; mong đợi từ chối save sai và giữ tiến độ. Không phá save thật.
- PT-8 / hai viewport 1280×720 và 1920×1080: xem sáu vùng/NPC/biển, Hán/pinyin, Tab, âm lượng và tùy chọn nghĩa; ghi ảnh, zoom và chỗ bị cắt.

Phản hồi: build/runId/sourceDigest và fixture SHA; hệ điều hành, browser, viewport, thiết bị, scene/ngày/buổi; từng bước và nội dung nhập; expected/actual; ảnh/log; mức chặn tiếp tục/có cách vòng/nhỏ và thời lượng thực đo nếu có. Chưa có playtest, kiểm thiết bị thật hay rà ngôn ngữ; audio tổng hợp vẫn pending-human. Không dùng kết quả lát cắt thay AC5/6/9/14 hoặc M4 của phiếu nguồn.
