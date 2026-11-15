# Bàn giao art M4 — 01M7C38XW37C4G9BP5073EG01M

TSK-5: no-op đối với sản xuất art. Kiểm kê chỉ đọc dựa trên HEAD
`7ff4d13e2883fcea79f8c14523afd2a75aa49696`, worktree có các tệp gameplay M4
chưa theo dõi; không có diff tracked trong `src`, `public/art` và
`public/licenses`. Các cảnh hiện tại vẫn là tham chiếu MVP tạm, không phải art
cuối. Không phát hiện lỗi đọc được cụ thể từ việc rà tĩnh; chưa xem UI trên
snapshot này vì kiểm chứng UI đang chờ xác nhận verify của phiếu.

Kiểm kê chi tiết ID, path, kích thước, frame, pivot, hitbox, license và nơi dùng
đã có tại [asset-inventory.md](01M7AWMZ6C065JP5EHAZABVRFS/asset-inventory.md).
Đây là tài liệu của lát cắt trước, không phải bằng chứng nghiệm thu snapshot M4.
Đối chiếu SHA-256 tệp thực tế với bảng đó: cả sáu SVG đều khớp:

| ID / path | Byte | SHA-256 |
| --- | ---: | --- |
| dorm / `public/art/dorm.svg` | 12482 | `5f9cb063ba22cd5d8c0f85969a468d4779dd3fc10a52b8c8d4af8d291b55fbe5` |
| gate / `public/art/gate.svg` | 12484 | `45ddca9971ed4c6fb5b53e266b2b54d0f58c42015bc1da71e21f22705c6ccab1` |
| library / `public/art/library.svg` | 12650 | `ef47c79439ce3846f98c7cd4d73bc568c44a96cfe8072a07104544a7fb333521` |
| canteen / `public/art/canteen.svg` | 12661 | `5147fe8c8fcb6dd08a492f25131898c0e4112dc7080a7578361688a13d670b91` |
| street / `public/art/street.svg` | 12780 | `330cea842f1b1037106091cd359cc068469dad2491e97ae93d364c799faa4c34` |
| garden / `public/art/garden.svg` | 13434 | `1361976b3091c46d8413392e3afdbdb82ec19a1d48e2b2448ca0d02a34bcd7f4` |

Theo kiểm kê trước, mỗi cảnh là SVG tĩnh 960×540, viewBox 240×135, một
frame, gốc (0,0); collider là dữ liệu gameplay riêng. Mã hiện tại vẫn tải
`scene.art.path` qua `Assets.load` và đặt nền 960×540. Sáu NPC, player và
ambient được vẽ bằng Pixi Graphics; UI là DOM/CSS, không có sprite sheet.
Thông số chi tiết và các ID nằm trong kiểm kê liên kết. License cảnh được dự án
khai báo CC0-1.0 tại `public/licenses/chapter-original.txt`; font Noto có OFL
tại `public/licenses/noto-OFL.txt`, nguồn liệt kê tại
`public/licenses/chapter-sources.json`. Không tạo asset hoặc license mới.

Truy vấn `bint context` cho art inventory trả 0 mục; không có mục tri thức nào
được áp dụng. Kiểm tra trên là đọc mã, metadata và hash, không chứng minh tải
thành công trong build, chất lượng nhận diện hay kích thước thực ở viewport.

Sau khi được phép kiểm UI trên build cuối, cần xem sáu cảnh, lối ra và NPC
theo lịch tại 1280×720 và 1920×1080; kiểm chữ Hán/pinyin, cắt chữ, focus,
hover, disabled, dialog, resize, lớp hiển thị và thông báo lỗi tải cảnh. Người
dùng playtest nhận diện cảnh/NPC, đặc biệt nhà ăn, và cung cấp kết quả; hiện
đều pending. Không đánh dấu AC-8 met chỉ từ kiểm kê này.
