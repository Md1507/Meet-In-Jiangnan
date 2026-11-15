# Mẫu khu phố cửa hàng · bưu kiện

Ngày: 2026-11-14. Người dùng yêu cầu chuyển sang khu tiếp theo, giữ nhà ăn để bổ sung sau; đồng thời nhắc các khu phải có lối đi nối nhau do chuyển vùng ở cạnh màn hình.

**Mẫu hiện tại: [visual-target-2/generated.png](visual-target-2/generated.png).** Đây là mẫu định hướng chưa được người dùng nhận xét riêng, chưa tích hợp game.

Feedback phố/cửa hàng của người dùng: hai công trình đang đứng rời trên nền trống, lối vào chưa nối thành vỉa hè, thiếu phân cấp đường phố, khoảng giữa chưa có công năng và mặt tiền chưa gắn với mặt bằng. Theo guide v0.3, làm lại bằng [blockout mặt bằng](layout-blockout.svg) trước; ảnh chi tiết hiện tại chỉ là study tham khảo.

Feedback bổ sung xác định concept v0.3 vẫn ghép facade gần chính diện với ground top-down. Vòng kế tiếp dùng top-down orthographic với mặt đứng nông, xác định phố là phố đi bộ campus + xe đạp tốc độ thấp, và làm rõ apron cửa hàng, sidewalk chung, sân arcade cùng ngôn ngữ mái hiên. Chi tiết ở [review v0.3](../environment-art-review-v0.3-feedback.md).

## Hướng hình ảnh

Giữ palette ấm, tường ngà, mái xanh than, gỗ nâu và cây liễu của mẫu nhà ăn. Khu phố có quầy bánh bao/hàng thiết yếu ở trái, điểm nhận bưu kiện với tủ nhận hàng ở phải; xe đạp, tủ đồ uống, máy quét và trang phục sinh viên giữ bối cảnh đại học hiện đại 2026. Pictogram thay chữ trên bảng; chữ học/Hán/pinyin vẫn để DOM.

Mẫu có shopkeeper, courier, sinh viên chính và bốn sinh viên nền. Đây là nhân vật minh họa trong ảnh; chưa có sprite/animation hoặc nội dung hội thoại mới.

## Kết nối lân cận

**Nhà ăn ← mép trái — đường đá xuyên khu phố — mép phải → Vườn.**

[Hợp đồng sáu khu](../world-connections.md) và [dữ liệu đối chiếu](../world-connections.json) quy định hai đầu đường mở cùng cao độ, không dựng vật cản/đường bắc-nam giả. Trong mẫu 2, dải đá sáng và phần cỏ thấp phía phải làm rõ đường đi hơn nền đồng đều của mẫu 1. Miệng trái/phải không có người hoặc vật chắn ở vị trí quan sát.

Chưa có asset vườn mới để so seam, còn mẫu nhà ăn cần chỉnh mép/footprint ở lượt bổ sung sau. Vì vậy chưa tuyên bố cả ba ảnh ghép liền hoặc đi qua hai chiều đã đạt. Viền đường ở mẫu phải tiếp tục được đọc là inlay phẳng, không phải bậc/curb cản đường, khi làm asset cuối.

Phản hồi người dùng sau mẫu 2: mép đường và cách đường dẫn vào kiến trúc chưa tự nhiên. **Giữ lại để chỉnh sau khi hoàn thành mẫu các khu còn lại**, tham khảo [ảnh auto-tiles](../references/road-auto-tiling-reference.png); chưa chỉnh ảnh phố theo ghi nhận này.

## Các lần tạo ảnh và nguồn

- [Mẫu 1](visual-target-1/generated.png): tạo cảnh phố mới, dùng [nhà ăn v2](../references/canteen-style-v2.png) làm reference phong cách. Nhận diện cửa hàng/bưu kiện rõ, nhưng nền sân đồng đều và công trình quá rộng; chưa chọn làm mẫu kết nối.
- [Mẫu 2](visual-target-2/generated.png): chỉnh từ mẫu 1 để tạo dải đường nối rõ, thêm cỏ thấp và thu nhóm công trình. Đã xem ảnh ở độ phân giải gốc. Còn khoảng trống lớn ở phía trên, và mật độ chi tiết/scale cần đánh giá ở kích thước chơi.
- Công cụ: Codex (local CLI) `0.167.2` qua Agent Sprite Forge commit `25203d03900b46b444bdd72a75768c33d1895ad6`, recipe `codex-exec-imagegen/1`. `requestedModel=codex-image_gen`; receipt không cho biết tên model ảnh thực, nên không suy đoán tên model.
- Mỗi bản giữ `prompt.txt`, `job.json`, PNG gốc; prompt biên soạn nằm ở [prompt tạo mới](visual-target-prompt.txt) và [prompt chỉnh lối nối](connection-refinement-prompt.txt). Runtime log, ledger và route proof ở `../forge-runtime/.forge/`.
- Dùng quota đăng nhập CLI; estimate 0 USD của Forge là API spend được ghi, không có nghĩa không tốn quota. Không lấy tileset, sprite hay ảnh bản đồ Stardew làm đầu vào. [MIT công cụ](../sprite-forge-MIT.txt) không tự gán license cho ảnh.

## Giới hạn trước khi tích hợp

Ảnh vẫn là một study kín nền, có người vẽ liền vào tranh, chưa phải bitmap logic 480×270 hoặc asset runtime có alpha/anchor. Prompt không chứng minh tọa độ khớp. Khi sản xuất cần tách nền/sprite, đo grid và palette, đối chiếu hình công trình với toàn bộ collider để tránh vùng trông đi được nhưng bị chặn; giữ shopkeeper `(360,325)`, courier theo lịch và player spawn `(480,380)` ở mã hiện hành. Không đổi geometry/ID/quest/save cho hợp tranh.

Lượt này chỉ thêm ảnh/tài liệu tại `docs/game-dev/art-studies`, không thay `public/art`, manifest, code điều khiển hoặc trạng thái Bint. Không chạy lại review phiếu nhà ăn. Kiểm PNG/hash và dữ liệu kết nối không thay verify/build hay kiểm giao diện sau tích hợp.

Các lỗi layout trên chưa được xem là đã sửa trong ảnh chi tiết. Bản concept tiếp theo phải có một tuyến vỉa hè chung, lối vào trực tiếp từ mặt tiền, sân chung/arcade có chức năng ở giữa và phân tách rõ đường chính–vỉa hè–sân.

### Bản chỉnh theo v0.3

[Mở bản chỉnh](visual-target-v03-1/generated.png). Bản này nối hai cửa hàng vào cùng một dải vỉa hè, thêm sân chung/arcade có mái và ghế, đưa lối vào trực tiếp ra frontage, đồng thời phân biệt đường chính tối với vỉa hè sáng. Khoảng giữa hiện có công năng; đây vẫn là study, chưa phải nền runtime.

PNG thực tế `1672×941`, `2,355,935` byte theo receipt, SHA-256 `94d5263d8de7572dd6efb8eb43d24458051741adf646a91c26edad86d5cb6a9a`; prompt ở [layout-refinement-prompt.txt](layout-refinement-prompt.txt), receipt ở [job.json](visual-target-v03-1/job.json). Mép đường/giao vật liệu sẽ được tinh chỉnh sau khi hoàn thành các khu còn lại.

Prompt vòng tiếp theo đã khóa camera top-down nông, phố đi bộ campus và arcade không che dòng đi ở [camera-layout-refinement-v03-2.txt](camera-layout-refinement-v03-2.txt); ảnh v0.3-1 chưa được đề xuất duyệt vì facade vẫn quá chính diện.

[Kết quả kiểm file](verification.json): hai PNG đều `1672×941`; bản 1 `2.359.144` byte, bản 2 `2.339.779` byte. Header/kích thước, byte và SHA-256 khớp `job.json`; source manifest/app/engine không đổi sau lượt làm mẫu. Kích thước thật khác `--size 1536x864` vì tool native không ép size từ tham số CLI.
