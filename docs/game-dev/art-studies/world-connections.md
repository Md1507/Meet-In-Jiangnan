# Kết nối bản đồ giữa sáu khu

**Cập nhật thiết kế:** mạng mới và nguồn tạo blockout/asset từ đây là
[campus network v1](../campus-network-v1/design.md), [JSON 20×15](../campus-network-v1/maps.json)
và [Warp Matrix](../campus-network-v1/warp-matrix.csv): 10 tuyến hai chiều,
3–4 khu liền kề mỗi map, có cổng Bắc/Nam. Phần hai cạnh bên dưới là ghi nhận
runtime/study v0.3; chưa phải bộ kết nối mới và không ghi đè dữ liệu v1.

Ngày 2026-11-14. Nguồn: `src/content/mvp.json`, `src/chapter/app.ts`, `src/chapter/engine.ts` ở **D:/Project/Game** và yêu cầu mới của người dùng về di chuyển sang cạnh màn hình. Đây là hợp đồng thiết kế art, chưa phải bản sửa runtime.

Art guide hiện hành là [v0.3](hen-o-giang-nam-art-style-guide-v0.3.md), SHA-256 `c405b97a302d949f15ca01756c3b10875aecf8dc5c103ebd84ac13ac8ba432b0`. Bản này yêu cầu blockout mặt bằng và phân cấp giao thông trước khi thêm chi tiết.

## Tuyến hiện hữu

**Phạm vi chốt:** cả sáu khu đều nằm trong cùng khuôn viên đại học Giang
Nam. Phố là cụm dịch vụ sinh viên nội bộ; vườn/kênh là cảnh quan của trường;
cảnh cổng ở phía trong khu đón tiếp. Không có chặng gameplay ra thành phố.
Mỗi concept và asset phải thể hiện một phần của campus liên thông này.

| Khu | Đi qua cạnh trái tới | Đi qua cạnh phải tới |
| --- | --- | --- |
| Ký túc xá (`dorm`) | Vườn (`garden`) | Cổng trường (`gate`) |
| Cổng trường (`gate`) | Ký túc xá (`dorm`) | Thư viện (`library`) |
| Thư viện (`library`) | Cổng trường (`gate`) | Nhà ăn (`canteen`) |
| Nhà ăn (`canteen`) | Thư viện (`library`) | Phố (`street`) |
| Phố (`street`) | Nhà ăn (`canteen`) | Vườn (`garden`) |
| Vườn (`garden`) | Phố (`street`) | Ký túc xá (`dorm`) |

Đây là vòng liên kết logic của game, không phải bản vẽ địa lý gồm sáu màn hình nằm trên một đường thẳng. Chưa đổi graph để thêm cổng bắc/nam hoặc tạo bản đồ thế giới phẳng mới.

## Lối nối trong art

- Với study v0.3 cũ, brief mỗi cảnh ghi hai khu liền kề trong bảng trên; dùng khối CAMPUS
  CONTINUITY ở phần 18.6 art guide cho mọi lần tạo/chỉnh asset. Chưa có ảnh
  liền kề thì dùng mẫu mép chung và ghi chưa kiểm cặp, không tự nhận đã khớp.
- So từng cặp mép ở cùng tỷ lệ chơi: vật liệu/bề rộng/cao độ lối đi, camera,
  scale và cách chuyển cây/công trình phải tiếp tục hợp lý. Dùng chung bộ
  gạch, ngói, gỗ, đèn và ngôn ngữ nhận diện trường; từng khu vẫn có công năng riêng.

- World `960×540`. Sau feedback v0.3-2, đề xuất dải đường nối thống nhất `y=348..412`, tâm `y=380`, mở hoàn toàn tại `x=0` và `x=960`. Player spawn hiện tại `(480,380)` nằm trong dải này. Đây là quy ước art mới cần đối chiếu từng asset sản xuất, không phải thay đổi runtime đã đạt.
- Mỗi cặp nối phải khớp cao độ, bề rộng đường, hướng đi và vật liệu ở đoạn sát mép. Ví dụ phải nhà ăn ↔ trái phố: sân/đường đá sáng xám ấm; phải phố ↔ trái vườn: vẫn đường đá đó, cây xanh tăng dần sau đoạn nối.
- Không đặt cây, hàng rào, xe đạp, quầy, nước, cầu/bậc hoặc bóng tối khó đọc tại miệng đường. Không tạo ngõ/cầu dẫn tới cạnh trên/dưới khi không có exit tương ứng.
- Dùng ranh giới vật liệu, silhouette và khoảng trống để chỉ đường; chữ hoặc mũi tên không thể thay cho lối đi thật. Các phần lề vẫn là nền đi được theo collider hiện hữu.
- Tất cả vật thể trông như vật cản phải nằm trong hai footprint hiện có `[64,64,336,280]` và `[624,64,896,280]`. Chưa thêm collider để hợp tranh. NPC nền minh họa phải có khoảng trống tránh miệng đường; sau này là layer/actor riêng, không vẽ chết vào nền sản xuất.
- Mẫu nhà ăn hiện có vẫn là reference phong cách. Khi người dùng quay lại bổ sung, cần điều chỉnh footprint và làm lối ra rõ theo hợp đồng này; không tự ghi nhận mẫu cũ đã khớp kết nối.

## Phân biệt art với hành vi code đã đọc

Trong cây chính, `app.ts` tự gọi chuyển khu khi input đẩy `x<32` hoặc `x>928`, có `sceneTransitioning` chống gọi chồng; E dùng cho NPC. Worktree phiếu nhà ăn cũ vẫn có cách E tại lối ra. Không dùng worktree cũ để ghi đè thay đổi người dùng đang có ở cây chính.

Trigger hiện tại áp dụng theo x trên cả cạnh, chưa kiểm dải y của đường minh họa. `engine.ts#travel` còn đặt người chơi về spawn giữa cảnh `(480,380)`, chưa xuất hiện tại mép đối ứng và chưa giữ nguyên y. Art có thể làm kết nối dễ đọc nhưng chưa tự tạo chuyển cảnh liền mạch. Nếu triển khai arrival ở mép hoặc giới hạn trigger theo miệng đường, phải là thay đổi gameplay riêng được kiểm hai chiều; lượt làm mẫu này chưa sửa code đó.

## Tham khảo Stardew Valley

[Pelican Town — Stardew Valley Wiki](https://stardewvalleywiki.com/Pelican_Town) mô tả các lối nối theo vị trí: tây bắc tới Bus Stop/Farm, tây nam tới Forest, nam tới Beach, bắc tới Mountain. Từ đó áp dụng nguyên tắc thiết kế cho dự án: mỗi exit có đích cụ thể và một đường dẫn dễ nhận ra. Đây là suy luận thiết kế, không phải sao chép bố cục hoặc tuyên bố engine hai game giống nhau. Không đưa ảnh map, tileset hoặc sprite của Stardew vào asset game.

## Kiểm trước khi đưa vào runtime

Đối chiếu cặp mép với cảnh bên cạnh, kiểm đường không cụt/che, vị trí actor và ranh giới art so với collider; thử đi cả hai chiều trên build chứa asset mới. Kiểm code/schema không thay quest/save/lịch/ID. Mẫu chưa tích hợp không phải bằng chứng đi qua khu thành công.

## Ghi nhận từ người dùng — chỉnh sau khi có đủ các khu

Người dùng nhận xét các đường viền/mép đường và đoạn đường dẫn vào kiến trúc hiện chưa tự nhiên; yêu cầu ghi lại, tiếp tục làm các khu còn lại rồi mới chỉnh đồng bộ. Đây là việc **hoãn theo yêu cầu**, không phải hạng mục đã đạt hoặc lý do sửa ngay mẫu phố.

Reference mới: [Auto-tiles & markings](references/road-auto-tiling-reference.png), do người dùng gửi. Tham khảo cách tổ chức góc trong/góc ngoài, nối chữ T/ngã tư, chuyển đường–vỉa hè–cỏ và tiếp giáp vật liệu. Không mặc định đổi sân trường thành đường nhựa hoặc thêm vạch giao thông ở mọi khu.

Khi chỉnh đồng bộ:

- Tổ chức mép lát theo hình dáng lối đi, cửa và hiên; tránh hai đường viền song song kéo cứng qua mọi bề mặt.
- Xử lý chỗ đường gặp mặt tiền bằng sân đệm, ngưỡng cửa hoặc đổi nhịp lát phù hợp, tránh cảm giác một dải đường dán lên kiến trúc. Độ rộng đường tiếp cận phải tương quan với cửa/quầy.
- Có góc trong/góc ngoài và kết thúc viền đúng; chuyển vật liệu đá–đất–cỏ có chọn lọc, biến thể vừa đủ và cùng pixel density.
- Phân biệt đường viền phẳng với bó vỉa/bậc thật; không tạo vật trông như chướng ngại ở vùng collider vẫn cho đi được. Giữ hai miệng nối và vùng tương tác rõ.
- Xem các cặp mép cảnh cạnh nhau ở tỷ lệ chơi để thống nhất bề rộng, vật liệu và bóng; không chỉ đánh giá từng tranh riêng khi phóng to.

Chưa sửa ảnh, tile hoặc runtime theo reference này. Cần quay lại mục này sau khi hoàn thành mẫu của các khu còn lại.

Feedback concept vườn và phố đã được ghi chính thức trong art guide v0.3. Hai ảnh chi tiết hiện tại được xem là study bị lỗi layout cần sửa theo [environment-layout-contract-v0.3](environment-layout-contract-v0.3.md); không dùng chúng làm nền sản xuất cuối trước khi blockout được kiểm.

Rà soát bổ sung camera/công năng được ghi ở [environment-art-review-v0.3-feedback](environment-art-review-v0.3-feedback.md): top-down orthographic với mặt đứng nông; phố là phố đi bộ campus + xe đạp tốc độ thấp; cầu ưu tiên mặt cầu đi bộ và hai đoạn tiếp cận.
