# Hợp đồng layout môi trường — v0.3

**Phạm vi lịch sử:** hợp đồng hai cạnh cho study v0.3. Theo yêu cầu thiết kế
lại campus, layout và kết nối mới nằm ở [network v1](../campus-network-v1/design.md)
và [maps.json](../campus-network-v1/maps.json), có 3–4 hướng/map. Không áp
dải đường hoặc hai footprint v0.3 như ràng buộc bắt buộc cho blockout mới;
runtime chưa được chuyển đổi sang JSON v1 trong lượt thiết kế này.

Nguồn định hướng: [art guide v0.3](hen-o-giang-nam-art-style-guide-v0.3.md), skill `environment-art`, feedback người dùng cho hai concept vườn/kênh và phố/cửa hàng. Đây là layout study, chưa thay collider hoặc runtime.

## Quy tắc chung

- Toàn bộ sáu khu thuộc cùng campus đại học Giang Nam: phố dịch vụ sinh viên,
  vườn/kênh, cổng phía trong, khu ở và khu học đều là các phần nối liền trong
  trường. Giữ graph hiện có; không thêm khu ngoài trường hoặc đổi đường chơi.
- Mỗi brief ghi khu trái/phải; từng cặp mép khớp camera, scale, vật liệu,
  bề rộng và cao độ đường. Dùng khối CAMPUS CONTINUITY trong phần 18.6 art
  guide; asset của một khu phải nhìn như phần tiếp nối của campus chung.

- World và camera giữ `960×540`; hai cạnh trái/phải là cổng chuyển khu hiện hữu.
- Dải đường chính ngang đề xuất `y=348..412` (tâm `y=380` để giữ player spawn), mở liên tục từ `x=0..960`. Đây là trục nối khu, không đặt nước, cây, bồn, cầu, NPC hoặc vật thể đặc ở hai miệng ngoài.
- Camera v0.3-2 là top-down orthographic với mặt đứng nông: mái/top plane và ground cùng trục; facade không dựng chính diện cao; mặt đứng đề xuất không quá `16 world units` trong study.
- Phân biệt ba cấp giao thông bằng hình học và value: đường chính; vỉa hè/sân; lối vào công trình hoặc lối phụ. Không dùng chỉ đường giả do họa tiết lát.
- Mọi cửa nhìn thấy phải có sân/vỉa hè/lối dẫn rõ. Mọi tuyến vẽ là đi được phải bắt đầu, kết thúc hoặc nối vào mạng lưới có lý do.
- Cỏ, bụi và cây hậu cảnh không cắt tuyến. Vật thể trông đặc phải nằm trong footprint/collider đã có; không thêm collider để hợp tranh.
- Hai mẫu hiện là study kín nền. Khi sản xuất phải tách background, actor/NPC và props có alpha; không raster hóa UI/học liệu vào nền.

## Garden — phố ← vườn → ký túc xá

| Vùng | Vai trò | Điều kiện đọc được |
|---|---|---|
| `y=348..412` | Đường chính nối hai mép | Một dải đá liên tục; không bị cỏ/nước/cầu chia cắt |
| `y=220..316` | Bờ kênh và đường ven nước | Bờ kè tách nước; các đường phụ nhập vào đường chính |
| `x=410..550, y=180..348` | Cầu qua kênh | Deck dọc vuông góc kênh, hai đầu nối sân/đường; không kết thúc ở cỏ hoặc mép nước |
| `x=64..336, y=64..280` | Pavilion trái | Cửa có lối dẫn trực tiếp xuống sân/đường ven nước rồi tới đường chính |
| `x=624..896, y=64..280` | Dấu hiệu hướng ký túc | Notice/bike rack nằm trong footprint; không chiếm miệng đường |
| ngoài footprint | Cảnh quan | Liễu/bụi/hoa chỉ làm mép và hậu cảnh; không che chân NPC hoặc nút giao |

Kiểm logic: đường chính không bị kênh cắt; cầu chỉ nối hai bờ của kênh; pavilion có entrance-to-path; các mảng cỏ có đường vòng hoặc không nằm trên tuyến.

## Street — nhà ăn ← phố → vườn

| Vùng | Vai trò | Điều kiện đọc được |
|---|---|---|
| `y=348..412` | Phố đi bộ nội bộ + xe đạp tốc độ thấp | Chạy đủ hai mép, rộng vừa phải và liên tục; không phải làn ô tô |
| `y=280..348` | Vỉa hè/sân trước | Một dải liên tục trước hai cửa hàng, không phải hai nhánh rời |
| `x=64..336` | Cửa hàng bánh bao/hàng thiết yếu | Mặt tiền và cửa nhìn vào vỉa hè chung; lối xe đạp không lấn đường |
| `x=624..896` | Điểm nhận bưu kiện | Cửa/tủ nhận hàng nhìn vào vỉa hè chung; courier có chỗ đứng |
| `x=336..624, y=150..280` | Sân chung/arcade khu phố | Sân mở có mái hiên ngói nông/pergola cùng ngôn ngữ; ghế/bảng tin lùi khỏi dòng đi; không tạo khối kín mới |
| cỏ/props | Lề và nhịp phố | Không che cửa, không tạo đường giả, không chặn lane chính |

Kiểm logic: cửa hàng quan hệ với cùng một tuyến phố; khoảng giữa có chức năng; lối vào trực tiếp; phân cấp mặt đường/vỉa hè/sân rõ ở grayscale.

## Trình tự kiểm

1. Xem blockout ở kích thước gameplay, kiểm tuyến trái → phải, cửa → sân/vỉa hè, cầu → hai bờ.
2. Kiểm vùng an toàn của NPC/player, không dùng chi tiết trang trí để che layout sai.
3. Chỉ sau khi layout rõ mới thêm mái, cây, vật liệu, road-edge và markings. Feedback mép đường tự nhiên được gom vào vòng chỉnh sau khi đủ các khu.
4. Không coi concept đã tạo là bằng chứng loader/collider/scene transition hoạt động. Runtime test cần build riêng.

## Lý do quyết định và phương án loại

- **Một đường chính ngang xuyên hai mép:** phù hợp với chuyển khu trái/phải hiện có và giúp người chơi đọc ngay hướng đi. Loại phương án đường cong đẩy vào góc vì dễ tạo miệng nối lệch cao độ hoặc bị trang trí che.
- **Kênh thu gọn thành vùng phía trên đường chính:** giữ bản sắc Giang Nam nhưng trả lại tỷ trọng cho đường, cửa và NPC. Loại kênh chạy gần như toàn chiều ngang khung hình vì feedback cho rằng không gian bị dàn trải và giao thông bị chia cắt.
- **Cầu là nhánh phụ có hai đoạn tiếp cận:** cho phép landmark có lý do sử dụng mà không biến cầu thành cổng chuyển khu. Loại cầu cắt trực tiếp qua đường chính hoặc kết thúc ở bờ cỏ.
- **Sân chung/arcade giữa hai cửa hàng:** biến khoảng trống thành nút giao có công năng và nối hai mặt tiền vào cùng một vỉa hè. Loại hai mô hình độc lập trên nền trống hoặc thêm một khối nhà kín mới làm collider.
- **Phân cấp đường chính–vỉa hè–sân bằng value/vật liệu:** giúp đọc ở grayscale và tránh phụ thuộc chữ/mũi tên. Chi tiết mép lát tự nhiên sẽ tinh chỉnh sau khi đủ sáu khu, theo yêu cầu người dùng; không dùng road markings để che layout sai.
- **Camera top-down với mặt đứng nông:** giữ ground, công trình và actor trong cùng quy ước; loại facade chính diện vì làm công trình trông như mô hình đặt lên bản đồ.
- **Phố đi bộ + xe đạp tốc độ thấp:** khớp bối cảnh campus và tránh suy diễn làn xe cơ giới khi gameplay chưa có xe; loại dải asphalt tối rộng không có công năng rõ.
