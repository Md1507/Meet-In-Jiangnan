# Bàn giao polish

## Tích hợp cuối 14/11 — run b009e5fd-262c-45be-9814-2bcaf583c5b5

TSK-9/10/13: bổ sung kiểm UI cho hoạt động `eat` và sự kiện `soldout`: sai/hủy không ghi hoàn tất, đúng ghi riêng, reload giữ trạng thái, không thưởng quest lặp và không tăng speaking. Điều hướng qua cả hai cửa của sáu vùng bằng mũi tên/WASD và E, kiểm spawn ngoài collider; blur xóa phím, Escape trả focus, nhập liệu không di chuyển. Bộ kiểm trước đó đã đi đến NPC bằng phím, đối chiếu lịch ba buổi, bounds nhãn, nhánh sáu quest và bảy ngày. Không dùng helper thay đổi state để điều hướng.

`node scripts/game-dev-verify.mjs` exit 0: spawn regression, typecheck, build, content, 15 unit, fixture, metadata và Chromium 158 tại 1280×720 và 1920×1080. Manifest trong packet lưu HEAD, source/build/fixture/evidence SHA và kết quả từng lệnh. Đã xem ảnh sáu cảnh, bản đồ và hội thoại ở cả hai viewport bằng công cụ xem ảnh: nhãn và Hán/pinyin trong ảnh không bị cắt; hội thoại 1280 cuộn dọc. Các ảnh chỉ chứng minh những màn hình và thời điểm được chụp, không thay kiểm khả dụng với người chơi. `git diff --check` exit 0, cảnh báo CRLF license đã có.

TSK-12: README packet đã trỏ tới manifest mới; playtest, IME/mic thật và rà ngôn ngữ/audio vẫn pending. Context cho chapter/tests trả không mục tri thức. Không thay gate MVP nguồn hoặc runner phiếu kỹ thuật; Core tiếp tục verify/review theo flow.

Đối chiếu dependency kỹ thuật mới nhất qua `bint task show`: chưa land, lần verify cuối không qua, tiêu chí 4 chưa đạt và worktree của phiếu đó không còn là gốc worktree Git. Đây là trạng thái riêng của dependency, không dùng số đo hay thay nghiệm thu nguồn.

## Gameplay focused repair .11 — 14/11/2026

Nhãn NPC tách tên và nghề thành dòng, wrap 180 world units và đặt theo chiều cao bounds, giữ nguyên vị trí nhân vật và tầm tương tác. Diagnostic chỉ đọc bounds Pixi; browser regression đối chiếu NPC với lịch, tên đầy đủ và bounds không giao nhau trong sáu vùng, ba buổi, hai viewport. Đã xem ảnh sáu vùng 1280×720 và phố ở cả hai viewport của run ff94c2e8-1f3c-4d7a-9f2b-06fc9fe38fa6. Verify trực tiếp `node scripts/game-dev-verify.mjs` run a73cf881-8dc4-4e52-878c-b47e35663237 exit 0; manifest và ảnh theo run này trong packet playtest. Chuyển vùng ở regression bounds dùng nút UI, không chứng minh điều hướng bằng bàn phím.

Chưa có chứng cứ đầy đủ cho AC2: mọi cửa, blur và di chuyển qua sáu vùng bằng bàn phím; AC3: nhánh chưa mở, activity và soldout qua UI; AC4: toàn bộ UI Hán/pinyin ở hai viewport; AC5: mọi nhánh sáu quest và đường tiếp tục bảy ngày qua UI. Các bước sau cần hoàn tất các ca này trước khi kết luận met. IME/mic thật, rà ngôn ngữ và playtest người dùng vẫn pending; kết quả này không thay nghiệm thu MVP nguồn. `bint context --paths src/chapter/app.ts,tests/game-dev-flow.mjs --json` trả không mục.

TSK-26/28: nối metadata nội dung vào hội thoại, nhánh sai/hủy, ngữ cảnh bài câu và chữ viết tay, và hướng dẫn chuẩn bị ngày 6. Tiến trình và thưởng vẫn do engine quyết định. Đây là tích hợp một phần; chưa chứng minh đủ nhánh qua UI. TSK-27 giữ kiểm kê và art từ bước trước; chưa có kiểm thực tế hai viewport. TSK-29 có checklist và save bắt đầu riêng trong `docs/playtest/01M7AWMZ6C065JP5EHAZABVRFS/`, chưa có build, hash hay playtest.

`node --check scripts/game-dev-verify.mjs` và `git diff --check` thành công. Kiểm tĩnh JSON fixture và collider spawn thành công; chưa kiểm import qua ChapterStore/UI. Runner mới gồm typecheck, build, kiểm content và unit chapter, chưa được chạy vì `verify_confirmed=false`. Không suy ra kiểm UI, IME thực, mic, offline, thiết bị, ngôn ngữ hay playtest từ runner. Cần Bint chạy verify sau khi được người xác nhận, lưu hash build đúng snapshot và kiểm UI hai viewport trước khi phát build; không dùng kết quả này thay gate MVP nguồn.

Truy xuất `bint context --paths src/chapter,src/content,docs/playtest --json` trả không mục tri thức. Phiếu kỹ thuật 01M7A5E5VAK7KM5VWYPMF6T3GC còn .27 medium, .28 low theo review5, verify cuối chưa qua và chưa land; không dùng kết quả worktree đó làm bằng chứng tích hợp. Review của phiếu hiện tại chưa có vòng nào. Các AC đã ghi unmet vì thiếu kiểm chứng hoặc nghiệm thu tương ứng; người chơi và người rà ngôn ngữ chưa cung cấp kết quả.

## Focused repair .8–.10 — gameplay 14/11/2026

- Runner gọi Node trực tiếp với argv và `shell:false`; chỉ npm.cmd dùng shell trên Windows. `tests/game-dev-spawn.test.mjs` sao chép executable vào đường dẫn có dấu cách, xác nhận exit 0, exit 23 và lỗi thiếu executable.
- `scripts/game-dev-fixtures.mjs` sinh năm mốc qua engine API và fixture sai schema; kiểm metadata/fixture và UI đã nối vào runner. UI dùng build, profile riêng, import thực, di chuyển bằng phím đến seller, kiểm sai/hủy/đúng/replay/reload, action ngày 6, sáu SVG, font và ảnh hai viewport; không dùng `__chapterTest.npc`. Ảnh kiểm hẹp riêng nằm dưới packet `evidence/manual`; manifest chính thức sinh theo runId trong lần Core chạy.
- Đã chạy build, typecheck, test:content, 15 chapter unit, spawn regression, fixture/metadata và UI Chromium 158.0.8127.18 tại 1280×720 và 1920×1080: qua. Lệnh verify toàn bộ đã được xác nhận nhưng Core chưa chạy trên bản sửa; runner lưu lệnh/exit, HEAD, dirty source digest, build/fixture SHA và ảnh/log theo runId khi Core chạy. Không thay log verify3 exit 1 trước đó.
- Chưa rà trực quan toàn bộ chữ, nhánh sáu quest qua UI, IME hệ điều hành, mic thật, nội dung bởi người và playtest người dùng. Không coi kiểm tự động là nghiệm thu MVP; dependency kỹ thuật .27/.28 giữ riêng. Tri thức `bint context` cho paths liên quan trả 0 mục.

## Đối chiếu polish 14/11 — snapshot hiện tại

Các đoạn đầu là bàn giao lịch sử; hiện tại Core verify-6 exit 0, log runtime/tasks/01M7AWMZ6C065JP5EHAZABVRFS/logs/verify-6.log, manifest runId aa34f928-2164-4590-89a6-8887fad4a35c. Đối chiếu SHA-256 của tất cả 105 source, 133 build, 6 fixture và 15 evidence trong manifest với file hiện tại đều khớp. README packet đã cập nhật kết quả; Core cần verify cuối theo flow sau polish. Không sửa gameplay/art/content trong lượt này: sửa .8–.10 từ gameplay đã tích hợp, art/content rà no-op.

Kiểm hẹp hiện tại: node tests/game-dev-spawn.test.mjs exit 0 (đường dẫn có dấu cách, exit 23 và executable thiếu); node --experimental-strip-types tests/game-dev-content.test.mjs exit 0; git diff --check exit 0 (cảnh báo CRLF license). Manifest verify-6 ghi tám lệnh exit 0, gồm UI Chromium hai viewport; đây không chứng minh mọi nhánh, chuyển cảnh, lịch NPC hay toàn bộ chữ không cắt. Không chạy lại toàn bộ verify thay Core. Playtest người dùng, IME/mic thật và rà ngôn ngữ vẫn pending. bint context --paths src/chapter,src/content,scripts,tests,docs/playtest --json trả 0 mục. Dependency kỹ thuật review5 .27 medium/.28 low chưa land; không dùng kết quả đó thay AC5/6/9/14 hoặc M4 nguồn.
