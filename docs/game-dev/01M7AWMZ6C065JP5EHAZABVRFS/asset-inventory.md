# Kiểm kê art — lát cắt 01M7AWMZ6C065JP5EHAZABVRFS

Ngày 14/11/2026. Căn cứ: art brief trong plan của phiếu và `contract.md` của gameplay; truy vấn `bint context` cho chapter/art/docs trả 0 mục. Đây là kiểm kê từ mã và file, chưa phải nghiệm thu hình ảnh hoặc playtest.

## Cảnh

Các ID `scene.<id>` là ký hiệu kiểm kê; ID dữ liệu là cột đầu. `src/content/mvp.json` trỏ tới file và SHA bên dưới; `src/chapter/app.ts` `changeScene` gọi `Assets.load`, đặt background 960×540 tại (0,0). Tất cả SVG: 960×540, viewBox 240×135, pixel vector scale nội tại 4, 1 frame tĩnh, FPS không áp dụng, không có vùng trong suốt (nền phủ kín); sprite origin (0,0). Hai collider mỗi cảnh [64,64,336,280] và [624,64,896,280]; spawn (480,380). Va chạm lấy từ dữ liệu, không suy từ pixel. Nguồn: vector chapter gốc, `public/licenses/chapter-original.txt`, CC0-1.0 theo khai báo dự án. Không đổi file, hash hay license.

| ID | Path | SHA-256 | Dấu hiệu đã có / quyết định |
| --- | --- | --- | --- |
| dorm | `public/art/dorm.svg` | `5f9cb063ba22cd5d8c0f85969a468d4779dd3fc10a52b8c8d4af8d291b55fbe5` | Chi tiết cửa sổ/phòng; giữ nguyên, cần kiểm nhận diện ký túc thực tế. |
| gate | `public/art/gate.svg` | `45ddca9971ed4c6fb5b53e266b2b54d0f58c42015bc1da71e21f22705c6ccab1` | Hình cổng và bảng; giữ nguyên. |
| library | `public/art/library.svg` | `ef47c79439ce3846f98c7cd4d73bc568c44a96cfe8072a07104544a7fb333521` | Dãy chi tiết dạng sách; giữ nguyên, cần kiểm nhận diện thư viện. |
| canteen | `public/art/canteen.svg` | `5147fe8c8fcb6dd08a492f25131898c0e4112dc7080a7578361688a13d670b91` | Quầy và cốc; giữ nguyên, ưu tiên kiểm nhà ăn. |
| street | `public/art/street.svg` | `330cea842f1b1037106091cd359cc068469dad2491e97ae93d364c799faa4c34` | Mái/biển đỏ và kiện hàng; giữ nguyên. |
| garden | `public/art/garden.svg` | `1361976b3091c46d8413392e3afdbdb82ec19a1d48e2b2448ca0d02a34bcd7f4` | Kênh nước và kết cấu vườn; giữ nguyên. |

Các file cộng 76.491 byte; một texture 960×540 RGBA tương đương khoảng 1,98 MiB chưa tính overhead/caching; sáu texture khoảng 11,87 MiB nếu đồng thời giữ nguyên kích thước. Đây là ước tính, không phải đo bộ nhớ GPU. Khi tải lỗi, mã báo lỗi và giữ texture trước đó; cần kiểm hành vi đó trong bước polish. Không thay đổi geometry, đường đi, exit hoặc hash.

## Nhân vật procedural

Nguồn hiển thị `src/chapter/app.ts` `person`/`npcDetails`; ID, màu, lịch và tên ở `src/content/mvp.json`. Một pose tĩnh 16×45, bounds x=-8..8, y=-28..17; origin (0,0), chân gần y+16, không có bitmap hay vùng trong suốt tách riêng, FPS không áp dụng. Mỗi NPC được tạo một `Graphics`, chỉ hiện khi lịch khớp; vị trí (360+200*i,325). Sau sửa .11, nhãn tách tên/nghề, wrap 180 world units, căn giữa và đặt đáy tại y-37 theo chiều cao thực. Interaction theo khoảng cách tới origin <75, không có collider NPC. Nguồn hình gốc là mã procedural của dự án; chi tiết trang phục mới do Codex vẽ bằng Pixi Graphics theo brief của dự án, không dùng asset bên ngoài. Quyền sử dụng chi tiết mới theo CC0-1.0 của vector chapter gốc (`chapter-original.txt`); mã nguồn theo quyền hiện có của dự án.

| ID | Màu | Nhận diện ngoài màu / nhãn mới |
| --- | --- | --- |
| mentor | `#4e7769` | Cổ áo và dải trước; Giáo viên |
| roommate | `#b87482` | Tóc hai bên; Bạn cùng phòng |
| officer | `#5b829a` | Cổ áo và thẻ; Phụ trách sinh viên |
| seller | `#b67c46` | Tạp dề và túi; Nhà ăn |
| shopkeeper | `#706d9e` | Dải áo và túi; Chủ cửa hàng |
| courier | `#57977c` | Mũ và túi hàng; Giao hàng |

Chi tiết chỉ vẽ trong bounds cũ, không thay origin hoặc tầm E. `player` cùng `person` màu `#456f9c`, hitbox x±8, y-22..y+16; không thêm walk cycle. `ambient.0..8` dùng cùng pose, màu luân phiên, bob sin ±3 world units theo thời gian, không tương tác; không phải NPC nhiệm vụ. Quyết định no-op player/ambient: giữ hình và chuyển động hiện có; không yêu cầu sprite sheet mới.

## UI và tài nguyên dùng lại

| ID / source-symbol | Nơi dùng, kích thước / pivot / hitbox | Trạng thái và quyết định |
| --- | --- | --- |
| `ui.interact` `app.ts#chapter-near` | DOM bên dưới canvas, kích thước theo chữ; pivot và collider vật lý N/A | Chữ E + tên hoặc đích; `role=status`, không chỉ dùng màu. |
| `ui.exit` `app.ts#chapter-exits` | Nút DOM theo nội dung; hit target là hộp nút, không có collider vật lý | Mũi tên trái/phải và tên đích; thứ tự theo exits. |
| `ui.objective` `#chapter-quests` | Panel DOM responsive; kích thước theo nội dung, pivot N/A | Dấu ○/✓ và chỉ dẫn bằng chữ. |
| `ui.hint`, `ui.feedback` `#chapter-body` | Dialog tối đa 800px, chiều cao tối đa viewport trừ 32px; nút/textarea là DOM hit target | Các mức gợi ý và feedback bằng chữ; CSS có hover, focus-visible, disabled. Giữ layout, cần kiểm cắt chữ, focus và cuộn ở hai viewport. |
| `font.Jiangnan` `public/fonts/NotoSansCJKsc-Regular.otf` | CSS `@font-face` cho Hán, fallback hệ thống; glyph/line-height phụ thuộc trình duyệt | Noto CJK SIL OFL-1.1, `public/licenses/noto-OFL.txt`, revision trong `chapter-sources.json`; chưa xác nhận glyph hiển thị thực tế. |
| Dữ liệu nét / engine | `public/hanzi/*.json`, HanziWriter; khung 300×300 padding 20 | Dữ liệu Arphic Public License `public/licenses/ARPHICPL.txt`; engine MIT `public/licenses/hanzi-writer-MIT.txt`. |
| Audio hiện có | Utterance trỏ WAV qua `mvp.json`, phát trong panel/sổ tay | eSpeak-NG tổng hợp, nguồn/giấy phép công cụ trong `chapter-original.txt` và `chapter-sources.json`; rà người thật pending. |

UI là HTML/CSS gốc của dự án; không có animation frame/FPS, pivot hay vùng trong suốt của sprite. Canvas CSS `image-rendering:pixelated`, renderer antialias=false; kích thước hiển thị co giãn nên scale trên màn hình không luôn nguyên. Không thêm asset bitmap, font, audio hoặc license bên ngoài.

## Bàn giao kiểm tra còn chờ

- TSK-13/polish: chạy bản tích hợp cuối và ghi revision/build; tại 1280×720 và 1920×1080 kiểm font Hán/pinyin có dấu, nhãn NPC dài, clipping, cuộn dialog, focus/hover/disabled, lớp và resize. Kiểm sáu cảnh, lối trái/phải, tên NPC theo lịch, dấu E, scene load/error và việc hình không che mục tiêu. Xác nhận cả landmark dorm/library và ưu tiên canteen có nhận diện đủ.
- Người dùng tự playtest nhận diện sáu vùng/NPC, nhất là nhà ăn; kết quả pending. Kiểm screenshot kỹ thuật không thay playtest. Không đánh dấu AC-4 met khi các bằng chứng này chưa có.
- Các thông số tài nguyên trên được đối chiếu tĩnh, không phải kết quả đo bộ nhớ GPU hay FPS. Lệnh verify đã được xác nhận; Bint giữ cổng kiểm chứng cuối.

## Rà lại bước art sau sửa .11

Không thêm hay thay asset: sáu SVG giữ nguyên hash ở bảng trên; nhãn procedural đã được gameplay điều chỉnh theo bounds, không đổi tọa độ nhân vật hoặc tầm tương tác. Run `293ec08d-6c5c-44d4-8f25-952bc3085432` ghi tám lệnh exit 0, asset sáu cảnh tải thành công và kiểm bounds nhãn theo sáu vùng, ba buổi, hai viewport. Kiểm này không thay việc xem ảnh UI Hán/pinyin đầy đủ; polish cần rà ảnh và kiểm lại trên snapshot cuối. Playtest nhận diện vẫn pending-user. `bint context` cho chapter/art/docs trả 0 mục.
