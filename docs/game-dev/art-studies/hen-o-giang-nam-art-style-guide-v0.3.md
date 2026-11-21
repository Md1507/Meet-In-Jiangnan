# Hẹn ở Giang Nam --- Art Style Guide

**Phiên bản:** 0.3\
**Phạm vi:** Định hướng hình ảnh tổng thể và sáu khu vực đầu tiên\
**Thể loại hình ảnh:** 2D pixel art, top-down\
**Tài liệu tham chiếu:** `sundropartguide_compress.pdf` (đường dẫn tính từ gốc repository cho cả hai bản guide); nguồn bối cảnh và thiết kế dự án tại mục 12.

------------------------------------------------------------------------

## 1. Mục tiêu nghệ thuật

Xây dựng một thế giới pixel art 2D góc nhìn từ trên xuống, lấy cảm hứng
từ cảm giác ấm áp, giàu màu sắc của **Stardew Valley** và khả năng đọc
không gian, bố cục khám phá của **Core Keeper**.

Đây là định hướng lấy cảm hứng, không phải sao chép nguyên mẫu đồ họa,
tileset, nhân vật hay giao diện của hai trò chơi.

Thế giới game là một trường đại học hiện đại ở vùng Giang Nam, Trung
Quốc, vào năm 2026. Người chơi nhập vai một sinh viên quốc tế trong bảy
ngày đầu làm quen với trường, di chuyển giữa các địa điểm, gặp NPC, nhận
nhiệm vụ và học tiếng Trung thông qua hội thoại trong bối cảnh đời sống
thường ngày: làm thủ tục, hỏi đường và giờ học, ăn uống, mua bánh bao và đồ dùng, nhận kiện và giao tiếp.

**Phạm vi thế giới được chốt:** toàn bộ sáu địa điểm — ký túc xá, cổng
trường, thư viện, nhà ăn, phố và vườn — đều thuộc **cùng một khuôn viên
đại học Giang Nam**. Phố là dãy dịch vụ sinh viên nội khu, vườn/kênh là
cảnh quan của trường. Các khu phải nối thành một mạng đi bộ có thể hiểu
được, không được dựng thành sáu địa điểm rời hoặc một chuyến ra thành phố.

**Thiết kế kết nối mới:** `docs/game-dev/campus-network-v1/design.md` và
`maps.json` bàn giao mạng 3–4 hướng/map, thay định hướng chỉ hai cạnh của
study v0.3. Các mô tả collider và lối trái/phải cũ bên dưới phản ánh runtime
v0.3; không dùng chúng để loại bỏ các lối mới trong bản thiết kế v1. V1 chưa
được tích hợp runtime; art mới phải đối chiếu đúng phiên bản layout đang làm.

**Bổ sung phạm vi:** Campus được chăm sóc là một đại học hiện đại Giang Nam, Trung Quốc năm 2026. Sáu khu hiện định nghĩa không phải danh sách cuối hay đóng; landmark đã có không có nghĩa khu đã hoàn tất. Mọi khu có thể bổ sung công trình, tiện ích, landmark, trang trí hoặc tiểu khu độc lập theo nhận diện chung và riêng, trên layout được duyệt. Ví dụ chỉ minh họa: thêm cửa hàng Phố, tiện ích Ký túc/Cổng, chỗ học Thư viện, quầy/chỗ ăn Nhà ăn hoặc chỗ nghỉ/tiện ích kênh Vườn; không cam kết số lượng hay triển khai.

Không hardcode số lượng công trình **hoặc props** cho từng khu; cả sáu khu
đều có thể mở rộng, và các ví dụ không phải danh sách hạng mục đã chốt.

### Mục tiêu cảm xúc

-   Thân thiện, gần gũi và có cảm giác đời sống sinh viên.
-   Có nét hiện đại của một trường đại học Trung Quốc năm 2026.
-   Có bản sắc Giang Nam qua kiến trúc, cây xanh, vật liệu và cảnh quan.
-   Mỗi khu vực có màu sắc và dấu hiệu nhận diện riêng, nhưng vẫn thuộc
    cùng một thế giới.
-   Không khí thư thái, khuyến khích người chơi quan sát và khám phá.

### Nguyên tắc ưu tiên

**Nguyên tắc cấp cao: Environment Art được xây dựng từ Level Layout đã được
xác định và duyệt; không sửa layout gameplay để khớp một bức tranh.** Layout
quy định đường đi, footprint, vùng tương tác và kết nối; art diễn đạt các
quyết định đó bằng hình ảnh. Chi tiết thực hiện mới nhất nằm ở phần 18.

1.  **Dễ đọc trước, đẹp sau:** người chơi phải nhận ra lối đi, công
    trình, NPC và lối ra ở kích thước hiển thị thực tế.
2.  **Gameplay trước trang trí:** art không được làm người chơi hiểu
    nhầm rằng vật trang trí là vật cản hoặc tương tác được.
3.  **Nhất quán:** sáu khu vực dùng chung quy tắc phối màu, ánh sáng,
    pixel density và cách dựng vật thể.
4.  **Không lấn át nội dung học:** chữ Hán, pinyin, nghĩa tiếng Việt,
    objective, hint và hộp thoại luôn phải nổi bật hơn nền cảnh.

------------------------------------------------------------------------

## 2. Ngôn ngữ hình ảnh tổng thể

### 2.1. Góc nhìn và phối cảnh

-   Dùng **2D top-down** nhất quán cho toàn bộ bản đồ.
-   Mặt đất, sân lát, đường đi và các khu vực có thể di chuyển phải được
    thể hiện rõ trên mặt phẳng.
-   Công trình, cây, quầy hàng và vật thể có chiều cao được vẽ theo một
    quy ước thống nhất: nhìn thấy mặt trên và một phần mặt đứng khi cần
    để nhận diện hình khối.
-   Không thay đổi góc nhìn tùy tiện giữa các khu vực.
-   Tránh phối cảnh xiên quá mạnh khiến người chơi khó xác định vị trí
    chân nhân vật hoặc ranh giới lối đi.

**Quy ước chung được chọn:** 2D top-down nhìn xiên nhẹ kiểu 3/4, với mặt đất
biểu diễn theo trục ngang/dọc của bản đồ; nhìn thấy mái/mặt trên và mặt đứng
phía nam được rút gọn. Đây là một quy ước dựng sprite cố định, không luân
phiên giữa camera top-down và camera chính diện hoặc isometric. Không áp
một góc camera số học mới khi chưa có mẫu chuẩn được kiểm.

- Chọn một mẫu nhà có mái/cửa, một đoạn vỉa hè và sprite nhân vật hiện có
  làm chuẩn. Khóa hướng trục mặt đất, độ sâu mái, độ cao mặt đứng, độ lùi
  cửa và tỷ lệ chân nhân vật trên cùng pixel grid cho cả sáu khu.
- Không ghép mặt tiền phẳng như ảnh chụp ngang với sân nhìn từ trên xuống.
  Mái, mép hiên, cửa, cột và ngưỡng cửa phải cùng hướng nhìn với mặt đất.
- Giữ thiết kế, silhouette và tỷ lệ nhân vật đã chọn; chỉnh hình khối công
  trình cho phù hợp quy ước camera, không vẽ lại nhân vật để cứu phối cảnh.

**Lưu ý từ tài liệu Stardew Valley:** tài liệu PDF mô tả phối cảnh của
Stardew Valley là một kiểu phối cảnh riêng, không hoàn toàn là top-down,
orthographic hay chân dung phẳng. Tài liệu giải thích cách biểu diễn
chiều cao được ép theo mặt phẳng, trong khi chiều sâu vẫn được giữ theo
trục dọc. Vì dự án này yêu cầu top-down rõ ràng, chỉ nên tham khảo
nguyên tắc đơn giản hóa hình khối và tính nhất quán, không bê nguyên
phối cảnh đặc trưng đó vào game.

### 2.2. Hình khối và silhouette

-   Ưu tiên hình khối lớn, dễ nhận ra ngay khi nhìn ở kích thước nhỏ.
-   Mỗi công trình cần có silhouette riêng: ký túc xá không được trông
    giống thư viện; nhà ăn không được lẫn với cửa hàng ngoài phố.
-   Dùng chi tiết kiến trúc có chọn lọc để gợi bối cảnh Trung Quốc hiện
    đại và vùng Giang Nam.
-   Không thêm chi tiết nhỏ chỉ để lấp khoảng trống nếu chúng không đóng
    góp vào nhận diện hoặc không khí.

**Nhận diện công năng:** Mỗi công trình, cửa hàng, dịch vụ và landmark quan trọng hiện tại hoặc tương lai phải dễ hiểu ở tỷ lệ chơi bằng ít nhất hai tín hiệu độc lập: silhouette/mặt tiền đặc trưng, biển hoặc icon có nghĩa, hình thức cửa/kính, thiết bị hay trưng bày. Màu nhấn hỗ trợ nhưng không đủ nếu chỉ đổi màu, chữ nhỏ hoặc props trên cùng mặt tiền chung. Nhóm đồ ăn có thể dùng kem, vàng, nâu, đỏ trầm, biểu tượng bánh/bánh bao hoặc hơi nóng và cửa kính/quầy thực phẩm; bưu kiện dùng teal, lam, xám lạnh, kim loại, icon kiện hàng và tủ nhiều ngăn/khu nhận rõ ràng. Thư viện gợi sách/học; nhà ăn gợi menu, phục vụ và chỗ ăn. Đây là các họ ví dụ, không đổi ID hay công năng F bánh bao/hàng thiết yếu và P bưu kiện đã duyệt; không thêm tương tác gameplay mới. Tên trường, công trình, cửa hàng, dịch vụ và biển hiệu đều là hư cấu do dự án tự sáng tạo, phù hợp campus Giang Nam đương đại năm 2026 và phong cách game; tên tiếng Trung cần tự nhiên, có nghĩa và thể hiện đúng công năng. Tên riêng đi cùng icon và chữ chỉ công năng dễ đọc, không thay thế các tín hiệu đó; chữ dùng lớp live text dễ đọc hiện có, icon phải phân biệt được ở native và tỷ lệ gameplay. Khi đã chọn tên, dùng thống nhất cách viết trong narrative, trường mô tả manifest, live text, biển hiệu và tham chiếu khu vực; tên hiển thị độc lập với Asset ID kỹ thuật ổn định. Chưa có tên cụ thể nào được chốt.

### 2.3. Mật độ chi tiết

Chia chi tiết thành ba cấp:

-   **Cấp 1 --- Gameplay:** lối đi, lối ra, NPC, quầy tương tác, cửa vào
    và các vật thể có chức năng. Phải rõ nhất.
-   **Cấp 2 --- Nhận diện khu vực:** mái ngói, biển hiệu, hàng cây, bàn
    ghế, giá sách, cổng trường và các vật thể giúp người chơi nhận biết
    địa điểm.
-   **Cấp 3 --- Trang trí:** chậu cây, đèn, gạch lát biến thể, hoa văn
    và vật dụng nhỏ. Chỉ dùng khi không gây nhiễu.

Không để chi tiết cấp 3 có độ tương phản hoặc màu sắc nổi bật hơn cấp 1.

------------------------------------------------------------------------

## 3. Quy tắc pixel art

### 3.1. Pixel density và độ phân giải

-   Chọn một độ phân giải thiết kế cơ sở và một tỷ lệ phóng đại cố định
    cho toàn bộ game.
-   Các sprite nhân vật, NPC, công trình, cây cối và vật dụng phải tuân
    theo cùng một pixel grid.
-   Tránh tình trạng một số asset có pixel quá mịn trong khi asset khác
    có pixel quá thô.
-   Không dùng đường viền anti-alias hoặc hiệu ứng làm nhòe khiến pixel
    bị mất nét.
-   Ưu tiên cạnh pixel rõ, mảng màu gọn và silhouette dễ nhận biết.

**Thông số kỹ thuật cần chốt ở giai đoạn triển khai:** độ phân giải
canvas, kích thước tile, kích thước sprite nhân vật, tỷ lệ upscale và
giới hạn kích thước asset. Chưa tự đặt các con số này khi chưa đối chiếu
với cấu trúc game hiện có.

**Phạm vi phê duyệt:** D1v3 chỉ duyệt scale/camera của mẫu Phố; không suy ra các quyết định kỹ thuật mở tại 3.1 và 13 đã chốt cho toàn game.

### 3.2. Đường viền

-   Dùng màu viền tối có sắc độ, không mặc định dùng đen tuyệt đối.
-   Viền giúp tách vật thể khỏi nền và phân biệt các phần chồng lấp.
-   Không bắt buộc mọi vật thể đều có viền dày như nhau.
-   Các vật thể gameplay cần silhouette rõ hơn vật thể trang trí ở nền
    xa.

### 3.3. Bảng màu

Tài liệu hướng dẫn Stardew Valley trong PDF khuyến nghị giới hạn số màu
trên từng sprite, thường khoảng 6--8 màu, đồng thời tái sử dụng màu giữa
các phần của vật thể. Tài liệu cũng khuyến nghị tránh đen và trắng tuyệt
đối, dùng màu viền tối nhất, và duy trì độ bão hòa tương đối cao khi phù
hợp.

Áp dụng cho dự án:

-   Mỗi sprite nhỏ nên bắt đầu với khoảng **6--8 màu chính**; chỉ tăng
    khi kích thước hoặc độ phức tạp thực sự cần thiết.
-   Tái sử dụng màu giữa các asset để tạo sự thống nhất.
-   Dùng màu tối có sắc độ thay cho đen tuyệt đối.
-   Dùng màu sáng ngả sắc thay cho trắng tuyệt đối.
-   Màu sắc tươi và có sức sống, nhưng không tăng saturation đồng loạt
    đến mức gây chói.
-   Màu của khu vực cần có bản sắc riêng, song vẫn nằm trong palette
    tổng thể của trường.

### 3.4. Đổ bóng và chuyển sắc

Tham khảo hai cách xử lý bóng được trình bày trong PDF:

-   **Solid shading:** dùng mảng màu phẳng cho bóng đổ của vật thể lên
    mặt đất hoặc khi cả một mặt của vật thể nằm trong bóng.
-   **Dithering:** dùng có chọn lọc cho vùng chuyển bóng trên bề mặt
    cong hoặc vùng chỉ bị che sáng một phần.

Quy tắc áp dụng:

-   Ưu tiên mảng bóng rõ ràng, không lạm dụng dithering.
-   Dithering phải có mục đích và phù hợp kích thước sprite; không dùng
    như họa tiết trang trí tùy tiện.
-   Bóng không nên làm mất ranh giới giữa đường đi và vật thể.
-   Có thể dùng màu bóng lệch sắc so với màu gốc thay vì chỉ giảm độ
    sáng của cùng một màu.
-   Hạn chế gradient mịn, blur và hiệu ứng ánh sáng làm giảm cảm giác
    pixel art.

------------------------------------------------------------------------

## 4. Màu sắc và chất liệu của thế giới

### 4.1. Palette định hướng

Đây là định hướng màu ở cấp độ cảm quan, chưa phải mã màu cuối cùng:

  -----------------------------------------------------------------------
  Nhóm màu                Vai trò                 Cảm giác
  ----------------------- ----------------------- -----------------------
  Xanh lá                 Cây, bụi cỏ, vườn, cảnh Tươi, thư thái
                          quan                    

  Xanh lam/xanh ngọc      Bóng mát, cửa kính, chi Mát, hiện đại
                          tiết trang trí          

  Kem/vàng nhạt           Tường, nền sáng, công   Ấm, thân thiện
                          trình                   

  Nâu gỗ                  Cửa, bàn ghế, quầy      Gần gũi
                          hàng, nội thất          

  Đỏ gạch/đỏ trầm         Biển hiệu, điểm nhấn    Có bản sắc
                          kiến trúc               

  Xám ấm                  Đá lát, bê tông, đường  Đô thị, trung tính
                          đi                      
  -----------------------------------------------------------------------

Không bắt buộc mọi khu vực dùng đủ các nhóm màu. Mỗi khu vực nên có một
màu chủ đạo và một vài màu phụ để tạo nhận diện.

**Nền và tiện ích campus:** Đường bộ hành chính lát đá; cửa công trình, sân và nơi dùng thường xuyên được lát và kết nối có chủ đích. Lối phụ chọn đá, gạch hoặc bê tông theo cách dùng, gỗ ở nơi hợp lý. Cân bằng mặt lát với cỏ, cây và cảnh quan có ranh giới như bồn hoặc viền vườn. Đèn campus là prop chiếu sáng riêng bằng kim loại/kính, đặt cạnh đường lát hoặc khu công cộng phù hợp, không phải vật bằng đá. Ghế nghỉ, thùng rác, tiện ích công cộng, biển hướng dẫn/bảng tin và chỗ xe đạp đặt hợp lý theo layout; không ngụ ý thêm vật cản đặc trên dữ liệu walkable.

### 4.2. Chất liệu kiến trúc

Kết hợp vật liệu của một khuôn viên đại học hiện đại với một số dấu hiệu
Giang Nam:

-   Tường sơn sáng, bê tông và các mảng kính cho công trình hiện đại.
-   Gạch lát sân, đá lát và nền đường có biến thể pixel nhẹ.
-   Gỗ ở bàn ghế, quầy, cửa và các chi tiết nội thất.
-   Mái ngói, đường mái và chi tiết trang trí gợi kiến trúc Giang Nam ở
    những vị trí phù hợp.
-   Gốm, chậu cây và vật dụng đời sống làm điểm nhấn.
-   Cây xanh và bóng cây góp phần tạo cảm giác không gian có độ ẩm, mát
    và nhiều sức sống.

Không biến toàn bộ trường thành một khu phố cổ. Bản sắc Giang Nam nên
xuất hiện như lớp đặc trưng trong một môi trường đại học đương đại.

------------------------------------------------------------------------

## 5. Nhân vật, NPC và vật dụng

### 5.1. Nhân vật người chơi

-   Silhouette phải tách biệt với nền ở kích thước gameplay.
-   Trang phục mang cảm giác sinh viên hiện đại, đơn giản và phù hợp bối
    cảnh năm 2026.
-   Hướng di chuyển và trạng thái đứng/nghỉ cần dễ phân biệt.
-   Không dùng quá nhiều màu nhỏ hoặc chi tiết li ti trên trang phục.
-   Animation cần giữ đúng vị trí tương đối của nhân vật với tile và
    collider hiện có.

### 5.2. NPC

-   NPC cần có silhouette, màu trang phục hoặc phụ kiện đủ khác nhau để
    người chơi nhận diện.
-   NPC quan trọng trong nhiệm vụ cần nổi bật hơn NPC nền.
-   Có thể dùng bảng màu trang phục để phân biệt vai trò: nhân viên,
    sinh viên, người bán hàng, thủ thư.
-   Không để phụ kiện che khuất hướng nhìn hoặc làm khó xác định vị trí
    tương tác.

**Seller ở nhà ăn:** - Cần có silhouette và trang phục dễ phân biệt với
sinh viên. - Có thể dùng tạp dề, đồng phục hoặc phụ kiện gắn với quầy
phục vụ. - Đứng gần khu vực trung tâm theo bố cục gameplay hiện tại. -
Không thay đổi vị trí, bounds hoặc cơ chế tương tác của NPC chỉ để phù
hợp với art mới.

### 5.3. Chân dung hội thoại

PDF tham khảo gợi ý với chân dung NPC theo phong cách Stardew Valley:
mắt tương đối nhỏ, tương phản sáng tối rõ, bảng màu tiết chế và ít chi
tiết nhỏ. Có thể dùng các nguyên tắc này nếu game có portrait hội thoại.

-   Giữ khuôn mặt dễ đọc ở kích thước hiển thị thực tế.
-   Phân tách rõ tóc, da và quần áo.
-   Không dùng quá nhiều màu cho từng nhóm chi tiết.
-   Biểu cảm cần rõ nhưng không phóng đại đến mức lệch phong cách chung.

### 5.4. Vật dụng

-   Vật dụng tương tác cần khác biệt rõ với vật trang trí.
-   Đồ vật nhỏ nên có silhouette đơn giản, màu sắc có chủ đích.
-   Dùng các vật dụng đúng ngữ cảnh: sách và giá sách ở thư viện; khay,
    cốc và quầy ở nhà ăn; bảng thông báo ở cổng trường hoặc ký túc xá.
-   Không đặt vật thể trang trí vào vị trí có thể khiến người chơi nghĩ
    rằng đó là vật cản hoặc có thể tương tác.

------------------------------------------------------------------------

## 6. Thiết kế sáu khu vực

Sáu khu vực dưới đây là phạm vi của phiên bản hiện tại. Mỗi khu vực cần
có bản sắc riêng nhưng dùng chung ngôn ngữ hình ảnh ở các phần trên.

**Nguyên tắc chung cho cả sáu khu:** Tường, bàn ghế, cây, bồn cây, quầy, menu và các tiện ích là thành phần hợp lý hoặc cần thiết theo công năng; không làm campus trống để né collider. Tránh bố trí sai công năng, lấn lối đi, cửa, warp, NPC hay vùng tương tác, hoặc hình ảnh không khớp collision. Vật đặc phải có footprint và collider hợp lệ theo layout; nếu vị trí đề xuất chưa có collider, ghi thành đề xuất layout/gameplay riêng để người dùng duyệt, không xóa đường, tự thêm collider hay dùng visual-only để đi xuyên.

### 6.1. Ký túc xá

**Vai trò trong thế giới:** không gian sinh hoạt cá nhân và đời sống
thường ngày của sinh viên.

**Cảm giác cần truyền tải:** - Gần gũi, yên tĩnh và có tính riêng tư. -
Có dấu hiệu của một khu nhà ở sinh viên hiện đại. - Có thể tạo cảm giác
ấm áp hơn các khu vực công cộng.

**Đặc trưng hình ảnh:** - Khối nhà nhiều tầng được đơn giản hóa thành
hình khối dễ nhận biết từ top-down. - Tường sáng, cửa sổ, ban công hoặc
mái che thể hiện vừa đủ. - Lối vào, bảng tên tòa nhà và khu vực để xe
nếu phù hợp bố cục. - Cây xanh, bồn cây và ghế nghỉ làm mềm không gian.

**Vật thể gợi ý:** biển số tòa nhà, bảng thông báo, chậu cây, xe đạp,
ghế dài, đèn ngoài trời.

**Cần tránh:** quá nhiều chi tiết cửa sổ giống nhau gây rối; vật trang
trí che lối đi; thiết kế quá cổ kính khiến ký túc xá không còn cảm giác
hiện đại.

**Bổ sung nhận diện:** Cửa sổ và biển nhà ở sinh viên, xe đạp, ghế sinh hoạt chung, chi tiết giặt/phơi và cây nhỏ gợi đời sống cư trú khi layout cho phép.

### 6.2. Cổng trường

**Vai trò trong thế giới:** điểm nhận diện quan trọng, giúp người chơi
hiểu rằng mình đang ở khuôn viên trường đại học.

**Cảm giác cần truyền tải:** - Chào đón, có tính biểu tượng và trang
trọng vừa phải. - Là khu đón tiếp phía trong ranh giới trường, nối khu
ký túc với khu học tập trong cùng campus. - Có dấu hiệu nhận diện của trường.

**Đặc trưng hình ảnh:** - Cổng chính có silhouette rõ, dễ nhận ra từ
xa. - Có tên trường bằng tiếng Trung hoặc bảng tên phù hợp bối cảnh. -
Kết hợp kiến trúc hiện đại với một vài chi tiết gợi Giang Nam. - Sân
hoặc đường dẫn vào trường cần có hướng đi rõ.

**Vật thể gợi ý:** bảng tên trường, trụ cổng, bảng thông báo, bồn cây,
đèn, lối đi lát đá.

**Cần tránh:** cổng quá đồ sộ che khuất khu vực chơi; chữ trên biển hiệu
quá nhỏ; trang trí làm nhầm lẫn ranh giới lối vào.

**Bổ sung nhận diện:** Tên/nhận diện trường, cơ sở bảo vệ, tiếp đón và thông tin, sân vào lát, tiếp cận bộ hành trật tự và cây trồng quy hoạch làm rõ vai trò cổng. Nội dung biển cuối cùng chưa xác định.

### 6.3. Thư viện

**Vai trò trong thế giới:** không gian học tập, tra cứu và tương tác với
các NPC liên quan đến việc học.

**Cảm giác cần truyền tải:** - Yên tĩnh, tập trung, có trật tự. - Hiện
đại và sáng sủa. - Khác biệt rõ với nhà ăn và phố.

**Đặc trưng hình ảnh:** - Công trình có hình khối gọn, nhịp cửa sổ hoặc
mặt tiền dễ nhận diện. - Bảng tên thư viện và biểu tượng sách. - Khu vực
đọc, giá sách, bàn học nếu có phần nội thất. - Tông màu trung tính ấm,
kết hợp xanh lá hoặc xanh lam làm điểm nhấn.

**Vật thể gợi ý:** sách, giá sách, bàn học, ghế, đèn bàn, bảng thông
báo, máy tính.

**Cần tránh:** dày đặc giá sách hoặc bàn ghế làm giảm khả năng đọc lối
đi; dùng quá nhiều chi tiết chữ nhỏ; tạo cảm giác giống nhà ăn.

**Bổ sung nhận diện:** Biển học thuật/sách, cửa kính lớn, chi tiết đọc và học, khoảng ngoài trời yên tĩnh và chỗ xe đạp phù hợp làm rõ công năng thư viện.

### 6.4. Nhà ăn

**Vai trò trong thế giới:** không gian sinh hoạt đông người, nơi người
chơi thực hành hội thoại gọi món hoặc đồ uống.

**Cảm giác cần truyền tải:** - Có sức sống, thân thiện và mang nhịp sinh
hoạt sinh viên. - Dễ nhận ra ngay cả khi nhìn ở kích thước canvas nhỏ. -
Có sự phân biệt rõ giữa khu phục vụ và khu ăn uống.

**Đặc trưng hình ảnh:** - Hai khối công trình lớn nằm bên trái và bên
phải theo bố cục gameplay hiện tại. - Lối đi trung tâm và hai hành lang
thoáng. - Quầy phục vụ có màu sắc và silhouette nổi bật vừa đủ. - Khu ăn
uống được nhận diện qua bàn ghế và các vật dụng phù hợp. - Seller đứng
gần khu trung tâm trong bounds nhân vật hiện có. - Hai lối ra dẫn tới
thư viện và phố.

**Vật thể gợi ý:** quầy phục vụ, bảng menu, khay, cốc, bình nước nóng,
bàn ghế, biển chỉ dẫn.

**Cần tránh:** - Không đặt tường, bàn, cây hoặc vật đặc sai vị trí hay
không khớp footprint và collision được duyệt. - Không đặt vật thể trang trí vào lối đi
trung tâm hoặc hai hành lang. - Không thay đổi vị trí seller, bounds
nhân vật, lối ra hoặc cấu trúc di chuyển. - Không để bảng menu hoặc hiệu
ứng trang trí cạnh tranh với nội dung hội thoại.

**Ngữ cảnh gameplay cần được hỗ trợ:** người chơi đến gần seller, nhấn E
để mở hội thoại, đọc chữ Hán, pinyin và nghĩa tiếng Việt, sau đó thực
hành câu gọi nước nóng "我要一杯热水。".

**Bổ sung nhận diện:** Biển đồ ăn, menu, quầy phục vụ, khu ăn và điểm trả khay thể hiện công năng; bố trí không chặn hành lang, đường tiếp cận hoặc seller. Hai lối ra trên là mô tả lát cắt runtime v0.3; layout campus-network-v1 được duyệt có ba hướng cho Nhà ăn, chưa tích hợp runtime.

### 6.5. Phố

**Vai trò trong thế giới:** phố dịch vụ sinh viên nằm trong khuôn viên
trường, có quầy bánh bao, hàng thiết yếu và điểm nhận bưu kiện. Thể hiện
đời sống nội khu, không phải phố thương mại ngoài trường.

**Cảm giác cần truyền tải:** - Năng động hơn khuôn viên trường. - Có
nhiều dấu hiệu thương mại và sinh hoạt. - Vẫn giữ cảm giác thân thiện,
không quá đông hoặc hỗn loạn.

**Đặc trưng hình ảnh:** - Mặt đường, vỉa hè và mặt tiền cửa hàng phân
biệt rõ. - Biển hiệu, mái che, cửa kính và bảng quảng cáo tạo nhịp điệu
thị giác. - Có thể đưa vào một số chi tiết Giang Nam như chậu gốm, cây
xanh hoặc mái ngói ở vị trí phù hợp. - Các cửa hàng cần có silhouette và
màu chủ đạo khác nhau.

**Vật thể gợi ý:** biển hiệu, cửa hàng nhỏ, xe đạp, đèn đường, ghế, chậu
cây, biển chỉ dẫn.

**Cần tránh:** biển hiệu quá nhiều màu gây rối; chữ trang trí nhỏ không
đọc được; vật thể đặt sát nhau khiến lối đi không rõ.

**Bổ sung nhận diện:** Đây là dịch vụ sinh viên bên trong campus. Giữ F bánh bao/hàng thiết yếu và P bưu kiện; phân biệt đồ ăn với bưu kiện theo các tín hiệu tại 2.2. Mặt lát, tuyến campus, đèn, biển, ghế, thùng rác và cây trồng chỉ đặt tại vị trí hợp lệ. Không tự thêm đường nhựa, làn ô tô hay bãi đỗ xe không liên quan khi thiết kế đã duyệt không có.

### 6.6. Vườn

**Vai trò trong thế giới:** khu vực thư giãn, tạo khoảng nghỉ khỏi các
không gian học tập và đô thị.

**Cảm giác cần truyền tải:** - Bình yên, xanh mát và có tính khám phá. -
Gợi không khí Giang Nam qua cây xanh, gốm, mặt nước hoặc cảnh quan nếu
phù hợp. - Tạo tương phản với kiến trúc và đường phố.

**Đặc trưng hình ảnh:** - Phân chia rõ lối đi và các mảng cây xanh. -
Dùng nhiều sắc độ xanh nhưng vẫn giữ palette có kiểm soát. - Có thể sử
dụng hồ nhỏ, vòi nước, cầu hoặc cụm đá làm điểm nhấn nếu phù hợp bản
đồ. - Cây và bụi cây cần có silhouette rõ, không che khuất nhân vật hoặc
lối đi quan trọng.

**Vật thể gợi ý:** cây, bụi hoa, chậu gốm, ghế đá, đèn sân vườn, hồ nhỏ,
cầu cảnh quan.

**Cần tránh:** cây cối che khuất NPC hoặc lối ra; quá nhiều họa tiết lá
nhỏ; dùng mặt nước hoặc bóng cây làm người chơi nhầm đó là đường đi.

**Bổ sung nhận diện:** Nước, bờ đá, liễu, cầu, pavilion/hiên nghỉ, đường dạo và cây xanh diễn đạt cảnh quan khi có trong layout. Cầu theo layout vuông góc kênh, nối hai bờ bằng mặt đi liên tục. Quy tắc này không thêm cầu hay nước, không đổi hình học trong lần sửa tài liệu.


------------------------------------------------------------------------

## 7. Ánh sáng và thời điểm trong ngày

-   Ánh sáng tổng thể nên mềm, dễ chịu và giữ độ tương phản đủ để nhận
    diện vật thể.
-   Có thể dùng tông sáng ấm vào ban ngày.
-   Bóng cây và bóng công trình nên có hình khối pixel rõ.
-   Nếu có thay đổi thời gian trong ngày, cần giữ độ đọc của gameplay và
    nội dung học.
-   Không dùng hiệu ứng bloom, blur hoặc ánh sáng quá mạnh làm mờ pixel.
-   Hiệu ứng thời tiết hoặc độ ẩm chỉ nên là lớp không khí nhẹ, không
    che sprite hay chữ.

------------------------------------------------------------------------

## 8. UI và khả năng đọc nội dung học

Art environment phải hỗ trợ, không cạnh tranh với phần học tiếng Trung.

-   Khu vực hội thoại cần có độ tương phản tốt với nền.
-   Chữ Hán, pinyin và nghĩa tiếng Việt phải là lớp thông tin dễ đọc
    nhất trong hội thoại.
-   Objective và hint cần có thứ bậc thị giác rõ.
-   Tránh đặt nền có họa tiết dày hoặc màu quá nổi phía sau chữ.
-   NPC tương tác có thể được phân biệt bằng silhouette, vị trí hoặc tín
    hiệu thị giác nhất quán.
-   Không dùng màu sắc duy nhất để truyền tải thông tin quan trọng.

------------------------------------------------------------------------

## 9. Ràng buộc gameplay và kỹ thuật

Đây là các ràng buộc bắt buộc khi làm mới art. Art mới không được tự ý
thay đổi hành vi gameplay hiện có.

-   Giữ nguyên ID.
-   Giữ nguyên quest và nội dung nhiệm vụ.
-   Giữ nguyên save và tiến độ đã lưu.
-   Giữ nguyên collider, spawn và exit.
-   Giữ nguyên font và nội dung học.
-   Không tạo vật thể trang trí có thể bị hiểu nhầm là collider mới.
-   Không di chuyển NPC hoặc thay đổi bounds nếu chưa có yêu cầu
    gameplay riêng.
-   Esc tiếp tục đóng hội thoại và trả focus về canvas.
-   Reload tiếp tục giữ tiến độ.
-   Hoàn thành lại nhiệm vụ không nhận thưởng lần hai.

Đối với lát cắt nhà ăn hiện tại, giữ nguyên bố cục hai khối công trình,
lối đi trung tâm, hai hành lang, seller gần trung tâm và hai lối ra tới
thư viện/phố.

**Bảo toàn theo phiên bản:** Landmark, tọa độ, ASCII 20×15, kết nối, warp, collider, spawn, NPC, interaction, quest và save đã duyệt chỉ đổi khi được phép rõ ràng. Các mô tả hai cạnh/lối của v0.3 là lịch sử runtime; v1 là thiết kế ba/bốn hướng riêng, không chứng minh runtime đã thay đổi.


------------------------------------------------------------------------

## 10. Quy trình tạo asset đề xuất

0.  **Nhận Level Layout đã duyệt:** ghi nguồn/phiên bản, collider, spawn,
    NPC, vùng tiếp cận và hai cạnh chuyển khu. Nếu chưa có, chỉ làm blockout
    đề xuất và kiểm luồng; chưa sản xuất background cuối.
1.  **Chốt visual target trên layout:** tạo một mẫu nhỏ gồm nền đất, đường đi, một
    công trình, một cây và một nhân vật.
2.  **Kiểm tra ở kích thước gameplay:** không chỉ đánh giá asset khi
    phóng to.
3.  **Chốt palette và pixel density:** dùng mẫu đã duyệt làm chuẩn cho
    các asset tiếp theo.
4.  **Tạo tileset môi trường:** nền đất, sân lát, đường, viền khu vực và
    các biến thể cần thiết.
5.  **Tạo landmark từng khu:** cổng trường, khối ký túc xá, thư viện,
    nhà ăn, phố và vườn.
6.  **Tạo props và NPC:** ưu tiên vật thể có tác dụng nhận diện hoặc hỗ
    trợ nhiệm vụ.
7.  **Tích hợp vào bản đồ:** kiểm tra layering, độ rõ của lối đi và
    tương quan với collider.
8.  **Playtest:** kiểm tra khả năng đọc ở kích thước canvas thật và
    trong lúc nhân vật di chuyển.

Không nên sản xuất hàng loạt asset trước khi visual target được duyệt.

**Bổ sung quản lý asset độc lập:** Với mỗi công trình hoặc vật thể công năng tái sử dụng, ghi ID duy nhất, category, kích thước native, đường dẫn sprite, khu dự kiến, nhận diện công năng, ground anchor, footprint, collision, render layer, interaction nếu áp dụng và visual variants. Phân biệt giá trị không có/không áp dụng với chưa xác định; ID, đường dẫn và chi tiết chưa chốt vẫn là unknown; tên và chữ biển hư cấu được tự sáng tạo theo mục 2.2, nhưng chưa chọn thì chưa coi là đã chốt. Tách dữ liệu terrain, decor, structures, props, collision, interaction và warp. Asset pixel production là tile/sprite PNG thật ở native resolution, phóng nearest; SVG debug không phải art production. Có thể thêm công trình độc lập mà không vẽ lại terrain hay thay asset không liên quan. Đây là đặc tả quản lý, không khẳng định renderer đã hỗ trợ.

**Theo phiên bản layout:** Bước 0 ghi mọi cạnh chuyển khu của layout đang áp dụng; hai cạnh là hợp đồng v0.3 lịch sử, không giới hạn thiết kế campus-network-v1 ba/bốn hướng chưa tích hợp runtime.


------------------------------------------------------------------------

## 11. Checklist duyệt art

Một asset hoặc khu vực chỉ nên được duyệt khi đáp ứng các tiêu chí sau:

-   [ ] Đúng phong cách 2D pixel art top-down.
-   [ ] Pixel density nhất quán với các asset đã duyệt.
-   [ ] Palette có kiểm soát, không dùng quá nhiều màu không cần thiết.
-   [ ] Viền và bóng giúp vật thể tách khỏi nền.
-   [ ] Silhouette dễ nhận ra ở kích thước gameplay.
-   [ ] Chất liệu và kiến trúc phù hợp bối cảnh đại học hiện đại vùng
    Giang Nam.
-   [ ] Khu vực có bản sắc riêng nhưng không lệch phong cách tổng thể.
-   [ ] NPC và vật thể tương tác dễ nhận diện.
-   [ ] Không che khuất nhân vật, NPC, lối đi, lối ra hoặc thông tin
    học.
-   [ ] Không tạo hiểu nhầm về collider hoặc tương tác.
-   [ ] Không làm thay đổi ID, quest, save, collider, spawn, exit, font
    hoặc nội dung học.
-   [ ] Khi đặt cạnh các khu vực khác, asset vẫn tạo cảm giác thuộc cùng
    một thế giới.

**Kiểm bổ sung cho campus và công năng:**

- [ ] Công năng công trình rõ qua ít nhất hai tín hiệu độc lập; mặt tiền, biển và điểm nhấn phân biệt các cơ sở.
- [ ] Icon nhận ra ở kích thước native và gameplay; chữ được trình bày dễ đọc.
- [ ] Nền cửa vào và đường phù hợp cách dùng, các tuyến lát nối các tiện ích.
- [ ] Mảng xanh có ranh giới cân bằng với mặt lát; đèn và tiện ích đặt tự nhiên, an toàn.
- [ ] Sáu khu có bản sắc riêng và cùng thuộc campus; có thể bổ sung tiện ích tương lai độc lập.
- [ ] Giữ landmark, tọa độ, ASCII 20×15, kết nối, warp và gameplay đã duyệt; không tạo collision hay cản navigation ngoài ý muốn.


------------------------------------------------------------------------

## 12. Tham chiếu và phạm vi áp dụng

### Nguồn bối cảnh game

Các quyết định của người dùng và mục 1 xác định **Hẹn ở Giang Nam**: đại học hiện đại tại Giang Nam, Trung Quốc năm 2026; sinh viên quốc tế trong bảy ngày đầu nhập học, học tiếng Trung qua nhiệm vụ và hội thoại đời sống như làm thủ tục, hỏi đường/giờ học, ăn uống, mua bánh bao và đồ dùng, nhận kiện, giao tiếp. Sáu khu hiện tại cùng campus và có thể mở rộng; chưa chốt tên trường, thương hiệu, lore hay mọi chi tiết công trình.

Các đường dẫn sau tính từ **gốc repository** cho cả hai bản guide: `docs/game-dev/campus-network-v1/design.md`, `docs/game-dev/campus-network-v1/maps.json` và `docs/game-dev/campus-network-v1/ascii-maps.md` mô tả thiết kế campus v1 chưa tích hợp runtime. `src/content/mvp.json` và `src/content/chapter-context.ts` dùng để đối chiếu runtime/nội dung; phần biên tập tiếng Việt trong chapter-context là synthetic, chưa được người rà duyệt, không phải phê duyệt narrative. Các mô tả runtime v0.3 và thiết kế v1 phải được phân biệt theo phiên bản.

### Tài liệu tham khảo phong cách

`sundropartguide_compress.pdf` (từ gốc repository) — *A Guide To Being Stylish: The Art Style of Stardew Valley*. Đây là tài liệu nhóm Sundrop City giải thích phong cách Stardew Valley cho dự án của họ, không phải guide chính thức của ConcernedApe hay đặc tả layout của game này. Chỉ dẫn màu rực, phô trương dành riêng cho thành phố du lịch của họ không phải định hướng campus.

Các nguyên tắc tham khảo: - Palette giới hạn, thường khoảng 6--8 màu cho
một sprite. - Tránh đen và trắng tuyệt đối; dùng màu viền tối nhất. - Ưu
tiên màu sắc có sức sống và tái sử dụng màu. - Phân biệt solid shading
và dithering theo loại bóng. - Có thể dùng màu lệch sắc để biểu diễn
vùng bóng. - Chân dung NPC đơn giản, mắt nhỏ, tương phản rõ và tiết chế
chi tiết. - Phối cảnh Stardew Valley có đặc trưng riêng, không phải
top-down thuần túy.

### Ảnh tham khảo campus và tileset do người dùng cung cấp

Các đường dẫn sau tính từ **gốc repository** `sample_tileset/`, áp dụng cho
cả bản guide ở gốc và bản sao trong art-studies. Chỉ tham khảo ý tưởng;
nguồn và giấy phép tái phân phối chưa xác định, không đưa trực tiếp ảnh vào
runtime hay xóa watermark. Hai ảnh `sample.png` và `sample1.png` có watermark.

| Tệp (đường dẫn tương đối gốc repository) | Nên học và giới hạn áp dụng |
| --- | --- |
| `sample_tileset/campusmap9preview.jpg` | Tham khảo trục đi bộ lát, quảng trường Cổng và cây có ranh giới, ghế/đèn; không sao chép layout. |
| `sample_tileset/sample.png`, `sample_tileset/sample1.png` | Tham khảo mặt tiền module khác nhau, nền lát, viền cây và giá xe đạp, thùng rác, bảng tin, ghế/đèn cho các khu campus; không sao chép ảnh hoặc watermark. |
| `sample_tileset/map_tiles.jpg` | Tham khảo cạnh, góc, nút giao đường/nước và cây tách lớp cho Vườn và tuyến đi; nét minh họa mượt không phải mẫu pixel đã duyệt. |
| `sample_tileset/demake_jubilife_city_by_phyromatical_dbkp83k-pre.jpg` | Tham khảo bố cục dễ đọc, mặt tiền khác nhau và lát module cho Phố nội khu; không lấy đường nhựa, làn xe, biểu tượng thương hiệu hay bố cục. |
| `sample_tileset/pixel-art-illustration-bench-park-pixelated-bench-park-bench-park-pixelated-for-the-pixel-art-game-and-icon-for-website-and-video-game-old-school-retro-free-vector.jpg` | Tham khảo silhouette ghế nghỉ campus; không sao chép sprite. |
| `sample_tileset/pixel-art-park-lamp-post-urban-furniture-icon-for-8bit-game-on-white-background-vector.jpg`, `sample_tileset/pixel-art-illustration-street-light-pixelated-street-lamp-street-light-or-lamp-icon-pixelated-for-the-pixel-art-game-and-icon-for-website-and-video-game-old-school-retro-free-vector.jpg` | Tham khảo hai silhouette đèn kim loại/kính cho lối lát; không coi ảnh là prop production. |
| `sample_tileset/pixel-forest-set-retro-8-bit-video-game-ui-elements-trees-bushes-and-grass-sprite-asset-background-landscape-objects-isolated-collection-vector.jpg` | Tham khảo silhouette cây, bụi và cỏ cho vùng xanh có ranh giới; không chép asset. |

Các icon tách nền có góc nhìn và tỷ lệ khác nhau: khi thiết kế lại phải
thích ứng camera, palette và mật độ pixel campus đã duyệt, đúng vai trò game
và layout, không dùng ảnh mẫu làm bằng chứng duyệt đường đi hoặc quyền dùng.

### Phân biệt giữa nguồn và định hướng thiết kế

-   Bối cảnh theo quyết định người dùng và mục 1; thiết kế campus v1 và
    nguồn runtime/nội dung được phân biệt như trên, không suy thành phê duyệt narrative.
-   Các nguyên tắc palette, shading, dithering, phối cảnh và portrait
    được rút ra từ PDF tham khảo Stardew Valley.
-   Việc kết hợp các nguyên tắc này thành một phong cách top-down pixel
    art, cùng các đề xuất về màu sắc, vật liệu và thiết kế sáu khu vực,
    là định hướng thiết kế cho dự án.
-   Core Keeper được xem là nguồn cảm hứng về cảm giác khám phá và khả
    năng đọc không gian top-down; tài liệu PDF đính kèm không phải tài
    liệu phân tích phong cách Core Keeper.

------------------------------------------------------------------------

## 13. Những quyết định còn để mở

Các mục dưới đây cần được chốt sau khi xem bản prototype hoặc asset mẫu:

-   Độ phân giải canvas và tỷ lệ upscale.
-   Kích thước tile và kích thước sprite nhân vật.
-   Mức độ chi tiết cụ thể của nhân vật và công trình.
-   Palette màu chính thức dưới dạng mã màu.
-   Quy tắc layer và thứ tự render giữa nhân vật, cây, công trình và
    props.
-   Có hay không chu kỳ ngày/đêm và hiệu ứng thời tiết.
-   Mức độ thể hiện kiến trúc Giang Nam trong từng khu vực.

**Nguyên tắc cuối:** ưu tiên một bộ quy tắc hình ảnh nhất quán và có thể
mở rộng cho cả sáu khu vực, thay vì làm từng khu vực đẹp riêng lẻ nhưng
không cùng một phong cách.


## 14. Bổ sung định hướng màu sắc từ ảnh tham chiếu Giang Nam

Phần này mở rộng palette ở mục 4, dựa trên ba ảnh người dùng cung cấp và đối chiếu thêm với tư liệu về kiến trúc, cảnh quan thủy trấn Giang Nam. Đây là **palette định hướng cho game**, không phải bảng màu chuẩn duy nhất của vùng Giang Nam.

### 14.1. Ba trạng thái màu chủ đạo

#### A. Ban ngày nắng ấm — Willow Sunlight

**Cảm giác:** trong trẻo, xanh mát, giàu sức sống; nắng xuyên qua tán liễu và phản chiếu trên mặt nước.

| Vai trò | Màu tham khảo | Gợi ý sử dụng |
|---|---|---|
| Xanh liễu | `#ADB858` | Tán liễu nhận sáng, cây bụi |
| Xanh olive | `#838A3C` | Tán cây trong bóng nhẹ |
| Vàng nắng | `#D0C155` | Vệt nắng, vùng sáng trên lá và sân |
| Vàng chanh dịu | `#ECE44B` | Điểm sáng nhỏ, không dùng thành mảng lớn |
| Kem ngà | `#EDEAB4` | Tường sáng, đá nhận nắng |
| Nâu gỗ đậm | `#352110` | Khung gỗ, cửa, mái hiên tối |

Các mã màu trên là màu đại diện được lấy gần đúng từ những vùng màu nổi bật trong ảnh tham chiếu thứ nhất. Khi chuyển sang pixel art, cần tinh chỉnh lại để tránh màu vàng quá gắt hoặc các mảng cây bị đồng nhất.

#### B. Trời âm u / sau mưa — Misty Blue-Grey

**Cảm giác:** tĩnh lặng, hơi lạnh, có sương ẩm; kiến trúc và mặt nước mang sắc xanh xám.

| Vai trò | Màu tham khảo | Gợi ý sử dụng |
|---|---|---|
| Xanh xám | `#49667A` | Nước và vùng phản chiếu lạnh |
| Xanh than | `#273842` | Mái ngói, vùng tối của công trình |
| Xám xanh trung | `#364753` | Đá lát, tường trong bóng |
| Xanh đen | `#121F28` | Bóng sâu, mặt nước tối |
| Than lạnh | `#0B141B` | Viền tối nhất, dùng tiết chế |

Đây là palette phụ để tạo thời tiết, cảnh hồi tưởng hoặc một thời điểm trong ngày có sắc thái trầm. Không nên phủ xanh xám lên toàn bộ game nếu gameplay chính cần cảm giác thân thiện, sáng sủa.

#### C. Ban đêm đèn lồng — Lantern Amber

**Cảm giác:** ấm áp, hoài niệm và lung linh; ánh đèn vàng cam tương phản với bầu trời và mặt nước tối.

| Vai trò | Màu tham khảo | Gợi ý sử dụng |
|---|---|---|
| Nâu gỗ | `#7D5231` | Mặt tiền, cửa và khung gỗ |
| Nâu hổ phách | `#A8843B` | Vùng gỗ bắt ánh đèn |
| Nâu đen | `#302E2A` | Công trình trong bóng |
| Xám nâu tối | `#454337` | Mái ngói, nền tối |
| Đen xanh | `#111413` | Bầu trời hoặc bóng sâu, tránh dùng đen tuyệt đối trong sprite |
| Cam vàng đèn | Tạo từ `#A8843B` nâng sáng | Đèn lồng, cửa sổ, phản chiếu trên nước |

Các màu trong ảnh đêm có độ tối cao. Khi đưa vào game, cần nâng độ sáng ở những vùng gameplay quan trọng để nhân vật, NPC, đường đi và lối ra vẫn dễ đọc.

### 14.2. Palette kiến trúc Giang Nam

Ngoài ba trạng thái ánh sáng, cần bổ sung một nhóm màu nền mang tính nhận diện kiến trúc:

- **Tường trắng ngà / trắng vôi:** không dùng trắng tinh; nên hơi ngả kem hoặc xám ấm.
- **Mái ngói đen xám:** dùng xám than có sắc xanh hoặc nâu, không dùng một màu đen phẳng.
- **Gỗ nâu trầm:** dành cho cửa, cột, khung cửa sổ, lan can và mặt tiền.
- **Đá xám:** dùng cho bậc xuống nước, bờ kè, cầu và lối lát.
- **Xanh nước ngả lục:** dùng cho kênh, hồ và vùng phản chiếu cây.
- **Đỏ son / đỏ đèn lồng:** chỉ làm điểm nhấn có chủ đích, tránh biến toàn bộ kiến trúc thành màu đỏ rực.

Đặc trưng “tường trắng, mái ngói tối” (粉墙黛瓦) là một mã nhận diện quan trọng của kiến trúc Giang Nam. Nhiều tư liệu về vùng này cũng nhấn mạnh sự kết hợp giữa nhà ven kênh, cầu đá, đường lát, khung gỗ và hàng liễu. Vì vậy, nên ưu tiên tổ hợp vật liệu này ở các khu vực có liên hệ với cảnh quan Giang Nam, thay vì chỉ thêm mái ngói như một họa tiết trang trí. Tham khảo: [Canadian Centre for Architecture — White Walls and Black Tiles](https://www.cca.qc.ca/en/articles/issues/33/acts-of-looking/96757/white-walls-and-black-tiles), [ThinkChina — Water towns of Jiangnan: An architectural perspective](https://www.thinkchina.sg/culture/water-towns-jiangnan-architectural-perspective-eye-jiangzhehu-series), [Suzhou Municipal Government — Suzhou Old Town](https://english.suzhou.gov.cn/szsenglish/szoldtown/202411/053d9780504b40b49ef016963baab237.shtml).

### 14.3. Cách phối màu trong pixel art

Không đưa nguyên ảnh chụp hoặc toàn bộ dải màu ảnh vào sprite. Hãy chuyển cảm giác màu thành các cụm màu pixel có kiểm soát:

- Mỗi asset nhỏ vẫn nên giới hạn khoảng 6–8 màu chính theo nguyên tắc ở mục 3.
- Mỗi cảnh nên có một palette nền, một palette vật liệu và một nhóm màu nhấn.
- Tán liễu có thể dùng 3–4 sắc xanh vàng; không cần vẽ từng chiếc lá.
- Mặt nước nên dùng các dải xanh lục, xanh xám và điểm phản chiếu sáng, tránh dùng gradient mịn.
- Ánh sáng đèn lồng nên tạo bằng các mảng màu vàng cam rõ ràng và vùng phản chiếu ngắn trên mặt nước.
- Mái ngói và tường cần giữ độ tương phản đủ để công trình không hòa vào nền trời hoặc cây.
- Tránh dùng quá nhiều màu vàng bão hòa cùng lúc. Màu vàng sáng nên dành cho điểm sáng, không phải màu phủ toàn cảnh.

### 14.4. Áp dụng palette cho sáu khu vực

| Khu vực | Palette ưu tiên | Điểm nhấn |
|---|---|---|
| Ký túc xá | Kem ngà, xám ấm, nâu gỗ, xanh cây | Ánh sáng cửa sổ, cây và vật dụng sinh viên |
| Cổng trường | Trắng ngà, xám đá, mái xám đậm, xanh cây | Biển tên trường, chi tiết đỏ son có tiết chế |
| Thư viện | Kem, gỗ nâu, xanh xám, xanh cây dịu | Ánh sáng ấm bên trong, kính và bảng chỉ dẫn |
| Nhà ăn | Kem ấm, nâu gỗ, vàng ấm, xanh lá | Quầy phục vụ và bảng menu dễ nhận biết |
| Phố | Trắng ngà, xám đá, nâu gỗ, đỏ son | Biển hiệu, mái hiên, đèn lồng và cửa hàng |
| Vườn | Xanh liễu, xanh olive, xanh nước, đá xám | Bóng cây, mặt nước và hoa theo mùa |

Nếu có chu kỳ thời gian, ba trạng thái Willow Sunlight, Misty Blue-Grey và Lantern Amber có thể được dùng làm ba preset ánh sáng. Không nhất thiết mọi khu vực phải chuyển sang ban đêm hoặc trời âm u cùng lúc nếu thiết kế nhiệm vụ không yêu cầu.

### 14.5. Bổ sung yếu tố cảnh quan thủy trấn

Có thể đưa một số yếu tố Giang Nam vào môi trường, tùy theo chức năng từng khu:

- Kênh nước chạy song song với đường đi ở khu phố hoặc khu vườn.
- Bờ kè đá, bậc đá dẫn xuống mép nước.
- Cầu đá vòm làm landmark ở khu vườn hoặc khu phố.
- Liễu rủ tạo bóng mát, nhưng tán cây không che nhân vật và lối đi.
- Mặt tiền nhà ven kênh, cửa gỗ, mái ngói tối và hiên nhỏ.
- Đèn lồng hoặc ánh sáng cửa hàng làm điểm nhấn ban đêm.
- Thuyền gỗ chỉ xuất hiện ở nơi có mặt nước và có vai trò cảnh quan rõ ràng.

Không cần đưa tất cả yếu tố này vào cả sáu khu vực. Chọn lọc theo bố cục để tránh biến khuôn viên đại học thành một khu du lịch cổ trấn.

### 14.6. Ranh giới giữa kiến trúc truyền thống và đại học hiện đại

Đây là nguyên tắc quan trọng để giữ đúng bối cảnh năm 2026:

- Công trình chức năng chính như ký túc xá, thư viện và nhà ăn vẫn cần đọc được là công trình đại học hiện đại.
- Có thể sử dụng mái ngói tối, tường sáng, gỗ, sân lát và cây liễu ở cổng, cảnh quan, mái hiên hoặc các chi tiết kiến trúc phụ.
- Không mặc định mọi tòa nhà đều là nhà gỗ cổ hoặc nhà ven kênh.
- Các dấu hiệu hiện đại như biển chỉ dẫn, cửa kính, đèn, bảng thông báo và vật dụng sinh viên cần hiện diện hợp lý.
- Chất Giang Nam nên được cảm nhận qua tổng thể màu sắc, cảnh quan và một số landmark, không chỉ qua việc gắn đèn lồng lên mọi công trình.

### 14.7. Checklist duyệt màu bổ sung

- [ ] Cảnh ban ngày có xanh liễu và nắng vàng nhưng không bị vàng gắt.
- [ ] Cảnh âm u có chiều sâu xanh xám nhưng vẫn đọc rõ nhân vật và đường đi.
- [ ] Cảnh ban đêm có ánh đèn vàng cam, nhưng không làm mất chi tiết kiến trúc.
- [ ] Tường sáng, mái tối, gỗ và đá tạo được cảm giác vật liệu khác nhau.
- [ ] Mặt nước có sắc xanh phù hợp và phản chiếu bằng pixel cluster rõ ràng.
- [ ] Màu đỏ son và vàng đèn được dùng như điểm nhấn, không phủ kín cảnh.
- [ ] Sáu khu vực có sắc thái riêng nhưng không lệch palette tổng thể.
- [ ] Màu nền không cạnh tranh với NPC, chữ Hán, pinyin và hộp hội thoại.

### 14.8. Nguồn tham khảo bổ sung

Các nguồn dưới đây được dùng để kiểm tra đặc trưng kiến trúc và cảnh quan Giang Nam, không phải để khẳng định có một bảng màu chuẩn duy nhất:

1. [Canadian Centre for Architecture — White Walls and Black Tiles](https://www.cca.qc.ca/en/articles/issues/33/acts-of-looking/96757/white-walls-and-black-tiles): giải thích thẩm mỹ tường trắng, mái ngói tối trong kiến trúc Giang Nam.
2. [ThinkChina — Water towns of Jiangnan: An architectural perspective](https://www.thinkchina.sg/culture/water-towns-jiangnan-architectural-perspective-eye-jiangzhehu-series): mô tả nhà ven kênh, cầu, bậc đá, khung gỗ và liễu.
3. [Suzhou Municipal Government — Suzhou Old Town](https://english.suzhou.gov.cn/szsenglish/szoldtown/202411/053d9780504b40b49ef016963baab237.shtml): tư liệu về các ngõ, cây xanh và cảnh đêm ở khu phố cổ Tô Châu.
4. [MDPI — A Study on the Spatial Narrative of Historical Urban Landscape Based on Water–Land Symbiosis](https://www.mdpi.com/2073-445X/14/12/2413): nghiên cứu về cấu trúc không gian lịch sử Tô Châu, quan hệ giữa tuyến nước và tuyến đường.
5. [MDPI — Urban Heritage Conservation of China’s Historic Water Towns](https://www.mdpi.com/2571-9408/2/3/149): nghiên cứu về cấu trúc khu dân cư, nhà ven sông, mặt tiền gỗ và hoạt động thương mại dọc bến nước.

**Ghi chú:** Các mã HEX trong phần 14.1 là mẫu màu đại diện được trích gần đúng từ ảnh người dùng gửi bằng cách gom cụm màu. Chúng là điểm khởi đầu để xây dựng palette pixel art, không phải mã màu lấy từ ảnh gốc ở độ chính xác từng pixel hay quy chuẩn màu lịch sử.

------------------------------------------------------------------------

## 14. Quy tắc quy hoạch không gian và kết nối kiến trúc
**Bổ sung sau khi đánh giá các bản art concept khu vườn/kênh nước và khu phố.**

Phần này là quy tắc bắt buộc cho mọi ảnh concept môi trường, bản đồ nền, tileset và asset kiến trúc. Mục tiêu là bảo đảm thế giới không chỉ đẹp khi nhìn như tranh minh họa mà còn hợp lý khi trở thành một bản đồ game có thể di chuyển.

### 14.1. Thiết kế mặt bằng trước khi trang trí

- Luôn xác định mặt bằng tổng thể trước khi thêm cây, hoa, đèn, NPC và vật trang trí.
- Phải xác định rõ vị trí công trình, cửa ra vào, đường chính, vỉa hè, sân, lối phụ, hàng rào, bờ nước và các lối kết nối.
- Mỗi khoảng trống lớn phải có chức năng cụ thể: quảng trường, sân chờ, sân sinh hoạt, khoảng lùi trước công trình hoặc đường giao thông.
- Không tạo một nền lát đá rộng rồi đặt các tòa nhà rời rạc lên trên mà không có quan hệ không gian.
- Các công trình phải có quan hệ với đường phố và khu vực xung quanh: mặt tiền hướng về đâu, người đi bộ tiếp cận từ đâu, cửa chính nằm ở vị trí nào.
- Bố cục cần có thể giải thích được bằng một sơ đồ mặt bằng đơn giản trước khi chuyển thành hình pixel art.

### 14.2. Quy tắc kết nối cửa ra vào với đường đi

- Mọi cửa chính nhìn thấy được phải có một điểm tiếp cận rõ ràng từ sân, vỉa hè hoặc đường đi.
- Lối đi phải kết thúc tại đúng vị trí cửa hoặc ngưỡng cửa, không lệch sang tường, cửa sổ hay góc công trình.
- Tại cửa chính cần có khoảng đệm hợp lý như bậc thềm, mái hiên, sảnh hoặc một đoạn sân nhỏ nếu phù hợp với kiến trúc.
- Không tạo đường lát đá chỉ chạy gần cửa nhưng không thực sự dẫn tới cửa.
- Không để lối vào bị cây, bồn hoa, cột đèn, xe đạp hoặc props che khuất.
- Nếu công trình có nhiều cửa, cần phân biệt cửa chính, cửa phụ và cửa chỉ có chức năng trang trí.
- Hướng tiếp cận phải dễ đọc ngay cả khi người chơi nhìn bản đồ ở tỷ lệ thu nhỏ.

### 14.3. Quy tắc tổ chức đường giao thông

Mỗi khu vực phải có hệ thống giao thông phân cấp rõ ràng:

1. **Đường chính:** tuyến kết nối các khu vực hoặc dẫn người chơi tới lối ra bản đồ. Phải liên tục, dễ nhận biết và đủ rộng cho hoạt động di chuyển.
2. **Đường nội bộ/vỉa hè:** kết nối đường chính với các công trình, khu chức năng và NPC.
3. **Lối vào công trình:** đoạn đường ngắn dẫn trực tiếp tới cửa hoặc điểm tương tác.
4. **Lối phụ:** đường nhỏ tới vườn, ghế nghỉ, bờ kênh hoặc khu vực phụ; chỉ xuất hiện khi có mục đích.
5. **Khu vực không thể đi:** bồn cây, mặt nước, chân tường, bụi cây dày hoặc khu vực có vật cản phải được thể hiện khác biệt đủ rõ.

Các tuyến đường phải nối thành mạng lưới có chủ đích. Tránh đường cụt vô nghĩa, đường đột ngột biến mất, hoặc lối đi kết thúc giữa bãi cỏ mà không có lý do.

### 14.4. Quy tắc đường đi liên tục và nút giao

- Mọi tuyến đường được thể hiện là có thể đi phải có điểm bắt đầu, điểm kết thúc hoặc kết nối rõ ràng.
- Khi hai tuyến giao nhau, cần tạo nút giao có hình dạng hợp lý, không để mép gạch, bậc thềm hoặc bồn cây cắt ngang một cách ngẫu nhiên.
- Khi đường đổi hướng, cần có đoạn chuyển tiếp đủ rõ; tránh các góc nối khiến người chơi tưởng rằng đường bị chặn.
- Độ rộng đường phải tương đối nhất quán trong cùng một tuyến, trừ khi có chủ đích mở rộng thành quảng trường hoặc thu hẹp thành lối nhỏ.
- Các mảng cỏ, bồn hoa và cây không được chia cắt đường đi nếu không có lối vòng hoặc lối băng qua được thể hiện rõ.
- Không dùng cùng một loại gạch cho cả đường đi và khu vực không thể đi nếu hai khu vực nằm sát nhau và dễ gây nhầm lẫn.
- Không để họa tiết lát nền tạo ra những đường giả giống lối đi.

### 14.5. Quy tắc thiết kế cầu, kênh nước và bờ kè

Áp dụng cho vườn, cảnh quan Giang Nam và các khu vực có yếu tố mặt nước:

- Cầu phải kết nối hai bờ có thể tiếp cận được. Cả hai đầu cầu đều cần nối với đường hoặc sân, không kết thúc ở mép cỏ, tường hay mặt nước.
- Đầu cầu cần có vùng tiếp giáp với bờ: đường dẫn, bậc lên xuống hoặc khoảng sân nhỏ tùy loại cầu.
- Hướng và độ rộng của cầu phải tương thích với lối đi ở hai đầu.
- Bờ kè phải tạo thành ranh giới dễ đọc giữa đất và nước.
- Nếu có bậc xuống nước hoặc bến thuyền, phải thể hiện rõ đó là một điểm tiếp cận riêng, không phải đoạn đường bị thiếu.
- Mặt nước không được có họa tiết hoặc màu sắc giống nền đất đến mức người chơi hiểu nhầm có thể đi qua.
- Cây liễu, hoa súng, đá và lan can không được che mất điểm nối giữa cầu và đường.
- Phản chiếu mặt nước là chi tiết trang trí, không được làm sai lệch hình dạng bờ hoặc vị trí lối đi.

### 14.6. Quy tắc bố trí công trình trong khu phố

- Công trình cần được bố trí theo một trật tự đô thị có thể hiểu được, thay vì đặt rời rạc trên nền trống.
- Các mặt tiền cửa hàng nên có quan hệ với cùng một tuyến phố, vỉa hè hoặc quảng trường.
- Nếu nhiều cửa hàng nằm cạnh nhau, cần có nhịp điệu mặt tiền hợp lý: khoảng cách, chiều cao, mái hiên, biển hiệu và lối vào.
- Nếu hai công trình đứng tách biệt, khoảng trống giữa chúng phải có chức năng: ngõ, sân chung, quảng trường nhỏ, lối đi hoặc khoảng xanh.
- Không tạo khoảng trống lát đá quá lớn chỉ để lấp diện tích canvas.
- Có thể dùng cây, ghế, đèn đường, biển chỉ dẫn và xe đạp để làm giàu không gian, nhưng không dùng props thay thế cho quy hoạch giao thông.
- Không bắt buộc mọi công trình phải đối xứng hoặc thẳng hàng tuyệt đối. Sự bất đối xứng có thể tạo cảm giác tự nhiên, nhưng vẫn phải có logic về tiếp cận và sử dụng.

### 14.7. Quy tắc kiến trúc và mặt bằng công trình

- Phân biệt rõ footprint của công trình với phần mái nhô ra, mái hiên và bóng đổ.
- Cửa chính, cửa sổ, mái hiên và các chi tiết mặt tiền phải có quan hệ hợp lý với nhau.
- Không để cửa chính mở ra tường, bồn cây, mặt nước hoặc một khu vực không thể tiếp cận.
- Các công trình có cùng chức năng hoặc cùng khuôn viên nên có ngôn ngữ vật liệu và tỷ lệ tương thích, nhưng không cần sao chép hoàn toàn.
- Kiến trúc hiện đại cần thể hiện được công năng qua cửa kính, bảng tên, mái che, lối vào và tổ chức không gian.
- Chi tiết Giang Nam như mái ngói, đầu mái cong, tường sáng, khung gỗ và gốm nên được dùng có chọn lọc. Không gắn mái cổ truyền lên mọi công trình bất kể chức năng.
- Không dùng mặt tiền kiểu phối cảnh chính diện cho một asset cần nhìn theo top-down nếu nó làm lệch góc nhìn của toàn bản đồ.

### 14.8. Quy tắc phối cảnh và tính nhất quán không gian

- Chọn một quy ước camera cho toàn bộ bản đồ và tuân thủ trong mọi asset.
- Mặt đất và đường đi phải cùng một hệ phối cảnh; không để gạch lát ở góc nhìn top-down nhưng công trình lại dựng theo phối cảnh phối cảnh chính diện hoặc phối cảnh 3/4 quá mạnh.
- Kích thước nhân vật phải tương thích với cửa, bàn ghế, xe đạp, cây và các công trình.
- Độ rộng cửa và lối đi phải đủ hợp lý so với kích thước nhân vật.
- Không để nhân vật trông quá nhỏ so với công trình hoặc quá lớn so với props.
- Cần xác định điểm đặt chân/điểm neo của NPC và nhân vật so với mặt đất; phần hình ảnh phía trên có thể che khuất theo layer nhưng không được làm sai vị trí di chuyển.
- Bóng đổ, mái nhô và tán cây không được bị hiểu nhầm là phần mặt đất có thể đi.

### 14.9. Quy tắc phân biệt hình ảnh trang trí và gameplay

- Hình ảnh cần thể hiện rõ đâu là mặt sàn có thể đi, đâu là vật cản và đâu là vùng trang trí.
- Không dùng cùng màu, họa tiết và đường viền cho lối đi và bồn cây sát cạnh nhau.
- Các vật thể có khả năng là collider phải được xác định trong thiết kế gameplay trước khi vẽ chi tiết.
- Không tự ý thêm bàn, ghế, hàng rào, chậu cây, cột, biển hiệu hoặc gốc cây vào các tuyến di chuyển đã được duyệt.
- Nếu art concept đề xuất vật thể mới chưa rõ collider, ghi nhận để rà lại layout; không đưa vào asset cuối. Nhãn “visual-only” không hợp thức hóa cột, ghế hay vật trông đặc ở vùng gameplay vẫn cho đi xuyên.
- Không để bóng của cây hoặc mái nhà tạo thành hình dạng giống vật cản trên đường.
- Phải kiểm tra bản đồ ở kích thước gameplay, không chỉ ở ảnh phóng to.

### 14.10. Quy tắc kiểm soát mật độ và khoảng trống

- Không lấp kín mọi khoảng trống bằng cây, hoa, đá hoặc props.
- Cũng không để khoảng trống lớn không có chức năng như khu phố trong concept thứ hai.
- Mỗi khoảng trống phải được phân loại: giao thông, sinh hoạt, cảnh quan, khoảng lùi công trình hoặc vùng không thể đi.
- Mật độ công trình và props cần thay đổi theo chức năng khu vực: phố có thể dày hơn vườn; thư viện có thể gọn và yên tĩnh; cổng trường cần khoảng mở để nhận diện.
- Giữ đủ khoảng trống quanh NPC và điểm tương tác để người chơi tiếp cận dễ dàng.
- Tán cây có thể phủ lên một phần cảnh quan nhưng không được che các lối kết nối quan trọng.

---

## 15. Feedback áp dụng cho hai concept hiện tại

### 15.1. Concept kênh nước và vườn

**Giữ lại:**
- Kênh nước, bờ kè đá và cầu đá làm điểm nhấn.
- Liễu rủ, cây bụi, hoa và palette xanh-vàng.
- Công trình có mái ngói tối và tường sáng.
- Không khí yên bình, nhiều cây xanh của Giang Nam.

**Cần chỉnh sửa:**
- Vẽ lại sơ đồ đường đi trước: xác định tuyến chính ở mỗi bờ, hai đầu cầu và các nhánh kết nối.
- Bảo đảm hai đầu cầu tiếp đất bằng một đoạn đường hoặc khoảng sân rõ ràng.
- Làm rõ lối vào công trình bên trái và kết nối nó với tuyến đường đi bộ.
- Phân định rõ bờ kè, mặt nước, đường lát đá và bồn cây.
- Rà soát các mảng cỏ đang cắt ngang hoặc làm đứt tuyến đường.
- Giảm cảm giác dàn trải bằng cách xác định các vùng chức năng rõ hơn, không nhất thiết phải thêm props.

### 15.2. Concept khu phố và cửa hàng

**Giữ lại:**
- Ngôn ngữ kiến trúc tường sáng, mái ngói tối và cửa kính.
- Biển hiệu, mái hiên và chi tiết cửa hàng.
- Tỷ lệ nhân vật và màu sắc tổng thể nếu phù hợp với sprite chuẩn.

**Cần chỉnh sửa:**
- Xây dựng một tuyến phố có vỉa hè hoặc quảng trường nhỏ làm trục tổ chức.
- Đặt cửa hàng theo quan hệ với tuyến phố; cửa chính phải tiếp cận trực tiếp từ vỉa hè hoặc sân.
- Thiết kế khoảng trống giữa hai cửa hàng thành một không gian có chức năng cụ thể.
- Tránh hai lối lát đá riêng lẻ đâm vuông góc vào một nền lát rộng mà không có tổ chức giao thông.
- Bổ sung nhịp điệu đô thị vừa đủ bằng mặt tiền, mái hiên, biển hiệu, đèn và cây; không dùng props để che lỗi bố cục.
- Kiểm tra hướng mặt tiền và góc nhìn của công trình có thống nhất với camera top-down hay không.

---

## 16. Checklist duyệt Environment Art và Level Layout

Trước khi duyệt một concept khu vực, cần kiểm tra:

### Mặt bằng và luồng di chuyển
- [ ] Có sơ đồ mặt bằng hoặc logic bố cục rõ ràng trước khi hoàn thiện trang trí.
- [ ] Đường chính, đường phụ, vỉa hè và lối vào được phân biệt.
- [ ] Các tuyến đường nối liên tục và không kết thúc vô lý.
- [ ] Các nút giao có hình dạng và chức năng rõ.
- [ ] Không có khoảng trống lớn không xác định được công năng.
- [ ] Người chơi có thể nhận biết đường đi ở kích thước gameplay.

### Công trình
- [ ] Mỗi cửa chính có lối tiếp cận trực tiếp.
- [ ] Cửa không mở ra tường, cây, mặt nước hoặc vật cản.
- [ ] Mặt tiền có quan hệ hợp lý với đường và sân xung quanh.
- [ ] Footprint, mái hiên và phần mái nhô được phân biệt.
- [ ] Kiến trúc tuân thủ cùng một quy ước phối cảnh.

### Cầu, nước và cảnh quan
- [ ] Hai đầu cầu kết nối với đất và đường đi.
- [ ] Bờ kè phân biệt rõ với mặt nước.
- [ ] Cây và bụi hoa không che khuất lối đi quan trọng.
- [ ] Mảng cỏ và bồn cây không chia cắt tuyến giao thông.

### Gameplay và khả năng đọc
- [ ] Không có props trang trí gây hiểu nhầm là collider.
- [ ] Vị trí NPC và điểm tương tác có khoảng tiếp cận.
- [ ] Kích thước nhân vật tương thích với kiến trúc và vật dụng.
- [ ] Layering không che khuất nhân vật hoặc lối ra.
- [ ] Không thay đổi ID, quest, save, collider, spawn, exit, font và nội dung học.

---

## 17. Quy trình làm việc bắt buộc cho concept môi trường mới

Không yêu cầu AI hoặc artist tạo ngay một bức tranh hoàn thiện nhiều chi tiết. Chia công việc thành các bước:

1. **Blockout mặt bằng:** chỉ dùng các khối màu đơn giản để xác định công trình, đường, sân, nước và vùng không thể đi.
2. **Kiểm tra luồng di chuyển:** vẽ tuyến người chơi có thể đi, kiểm tra cửa, cầu, lối ra và các nút giao.
3. **Duyệt kiến trúc:** xác định mặt tiền, cửa chính, footprint, hướng công trình và quan hệ với đường.
4. **Duyệt phối cảnh:** kiểm tra camera, tỷ lệ nhân vật và kích thước props.
5. **Áp dụng palette:** dùng palette Giang Nam đã thống nhất.
6. **Thêm landmark và props:** mái ngói, liễu, gốm, đèn lồng, biển hiệu và các chi tiết nhận diện.
7. **Kiểm tra pixel art:** pixel density, viền, shading và độ rõ ở kích thước thực tế.
8. **Kiểm tra gameplay:** đối chiếu collider, spawn, exit, NPC và các ràng buộc của bản đồ hiện tại.

**Yêu cầu đối với prompt tạo ảnh:** phải mô tả rõ sơ đồ không gian và kết nối đường đi, không chỉ mô tả phong cách, màu sắc và danh sách vật thể. Nếu chưa có layout được duyệt, chỉ tạo blockout hoặc concept bố cục, không tạo bản environment art hoàn chỉnh.

Blockout ở bước 1 phải bám nguồn layout đã duyệt và ghi rõ phiên bản. Nếu là
đề xuất layout mới, phải phân biệt với layout hiện hành; không dùng trạng thái
“ảnh được thích” hoặc “concept đã tạo” thay cho duyệt thay đổi đường chơi.
Khóa camera ở phần 2.1 ngay từ blockout, trước khi duyệt kiến trúc chi tiết.

### Mẫu yêu cầu ngắn cho AI/artist

> Create a coherent, playable 2D top-down environment layout. Design the ground plan and pedestrian circulation before adding decorative details. Every visible entrance must connect directly to a readable path or plaza. All paths must connect logically and must not terminate against walls, water, grass, or decorative objects. Bridges must connect both banks to walkable paths. Clearly distinguish main paths, secondary paths, plazas, building footprints, water, grass, and non-walkable areas. Keep the camera perspective, character scale, and architectural proportions consistent. Do not invent extra obstacles or colliders. Preserve the approved gameplay layout. Use the established Jiangnan-inspired pixel-art palette and architectural language only after the layout is coherent.

---

**Nguyên tắc duyệt cuối cùng:** Một environment art tốt phải trả lời được ba câu hỏi trước khi xét đến độ đẹp: người chơi đang đứng ở đâu, có thể đi tới đâu, và vì sao công trình hoặc vật thể lại nằm ở vị trí đó.

------------------------------------------------------------------------

## 18. Bổ sung: layout làm nguồn chuẩn, camera và công năng sáu khu

### 18.1. Đầu vào và thứ tự ưu tiên

Nguồn gameplay hiện hành: `src/content/mvp.json` (scenes, collider, spawn,
exits) và `src/chapter/app.ts` (bounds nhân vật, tiếp cận NPC, chuyển khu).
Ở bản guide trong `docs/game-dev/art-studies`, các đường dẫn này tính từ
gốc repository. `docs/game-dev/art-studies/environment-layout-contract-v0.3.md`
và các blockout vườn/phố là đề xuất art cần đối chiếu nguồn gameplay; chưa
phải bằng chứng được đổi collider hoặc đường đi.

Thứ tự sửa concept: **camera nhất quán → tổ chức giao thông/công năng → logic
kiến trúc → vật liệu/chi tiết**. Trước các bước đó phải có layout tham chiếu.
Giữ phong cách pixel art Giang Nam, palette ấm, thiết kế nhân vật và nhận
diện hiện có. Đây là bổ sung quy tắc thiết kế, chưa phải lần sửa ảnh hay
thay asset runtime.

Mỗi brief nhận một bản layout có nguồn/phiên bản, footprint, walkable mask,
spawn, vị trí/vùng tiếp cận NPC, cửa/ngưỡng và các miệng chuyển khu. Không có
layout thì chỉ làm sơ đồ đề xuất; không tự suy từ tranh thành layout đã duyệt.
Các tọa độ trong study phải được kiểm lại với collider và toàn bộ bounds
nhân vật: đường vẽ gần cửa chưa chứng minh người chơi đứng tới ngưỡng được.
Cửa biểu đạt công năng không tự trở thành cửa vào nội thất hoặc tương tác mới.

### 18.2. Giao thông và công năng riêng của từng khu

Các dòng dưới đây là brief công năng, không thêm đường/collider/NPC. Mọi cách
bố trí phải nằm trong layout hiện hành; phần vượt layout là đề xuất tách riêng.

| Khu | Tổ chức không gian cần đọc được | Logic kiến trúc và phần tránh |
| --- | --- | --- |
| Ký túc xá | Lối đi bộ tới sảnh ở, vùng chờ ngắn và chỗ xe đạp gọn nếu footprint cho phép | Nhịp cửa sổ/khối ở sinh viên, sảnh nhận diện rõ; tránh mặt tiền cửa hàng và bãi xe chắn cửa |
| Cổng trường | Khoảng đón phía trong trường, lối nội bộ nối ký túc–thư viện; chỉ gợi đường xe khi có cơ sở từ layout | Trụ/cổng có điểm tựa rõ, không che đường nối; không biến thành exit ra thành phố |
| Thư viện | Tiếp cận yên tĩnh tới sảnh/NPC học tập, khoảng đứng đọc thông báo ở bên tuyến chính | Khối học tập gọn, cửa/ô sáng dễ đọc; không lấp đường bằng giá sách hay biến sân thành khu bán hàng |
| Nhà ăn | Phân biệt khu phục vụ, chỗ tiếp cận/xếp hàng và hướng tới khu ăn; giữ lối trung tâm và hành lang đã có | Quầy, cửa phục vụ và mái hiên thể hiện công năng; bàn ghế không chiếm vùng đi hoặc vị trí seller |
| Phố | Dãy dịch vụ nội khu; mặt tiền chung hướng vỉa hè, đường đi bộ/xe đạp và sân chờ | Cửa hàng và điểm nhận bưu kiện có dấu hiệu riêng; không dựng phố ô tô hoặc khu thương mại ngoài trường |
| Vườn | Đường dạo và chỗ nghỉ; bờ nước/cầu chỉ xuất hiện khi phù hợp walkable mask | Pavilion/hiên nghỉ nhỏ, gỗ/đá/mái ngói cùng hệ; tránh nhét đường xe, cầu hoặc nước cắt tuyến đã duyệt |

Sáu khu dùng chung camera, scale nhân vật, pixel density, ngôn ngữ gỗ–đá–ngói
và ánh sáng ấm; không cần cùng hình dạng sân, mật độ props hoặc loại giao
thông. Không thêm ô tô, hệ thống xe chạy hay bó vỉa có va chạm chỉ để phân
loại bề mặt. Mép vật liệu phẳng có thể phân biệt lối đi mà không tạo vật cản.

### 18.3. Vùng giữa hai công trình trong concept phố

**Công năng được chọn cho brief chỉnh sửa:** sân chờ chung cho khách ghé
cửa hàng/nhận bưu kiện và nghỉ ngắn, mở trực tiếp ra vỉa hè; không phải nhà
thứ ba, bãi đỗ xe, sân khấu hoặc bãi lát trống để lấp canvas. Mái, nếu khả
thi, chỉ che phần chờ sát mặt tiền; phần xuyên sân vẫn thoáng và đọc được.

- Cửa hai công trình phải nối trực tiếp với cùng hệ vỉa hè/sân đệm. Nhận
  diện cửa hàng thực phẩm và điểm bưu kiện bằng cửa/quầy/vật liệu, không
  chỉ đổi biển hiệu trên hai khối nhà giống nhau.
- Ưu tiên hiên nông có kết nối chịu lực dễ hiểu với tường/khung công trình
  hiện có. Không vẽ mái lớn trôi nổi; không đặt cột vào sân đang đi được.
  Cột chỉ hợp lệ ở vùng cản đã có và không chắn cửa hoặc vùng đứng NPC.
- Nếu mái chung cần cột mới trên đường đi, thu nhỏ/tách mái thành hiên của
  từng công trình, hoặc giữ sân mở. Không sửa collider để giữ bằng được mái.
  Không tự khẳng định đã tính kết cấu kỹ thuật từ một ảnh concept.
- Ghế, bảng tin và xe đạp đặt gọn ở rìa hợp lệ sát công trình, ngoài cửa,
  góc rẽ và dòng đi bộ. Nếu không có vị trí hợp lệ thì bỏ bớt; “visual-only”
  không cho phép vẽ vật đặc mà người chơi có thể đi xuyên.
- Với renderer nền phẳng hiện có, không phủ mái lên vùng đi khiến nhân vật
  trông đứng trên mái. Chưa có foreground/occlusion thì chỉnh phạm vi mái
  hoặc để sân mở, không hứa tự có che khuất từ metadata.
- Giảm bãi lát vô nghĩa bằng phân vai đường, vỉa hè, khoảng chờ và ngưỡng
  cửa bằng value/vật liệu; không thêm bồn, hàng rào hay cột để lấp chỗ trống.

Phương án loại: một arcade kín hoặc mái lớn với hàng cột giữa sân, vì thay
vùng đi và vượt khả năng renderer hiện tại; không loại bản sắc Giang Nam.
Giữ mái ngói tối, gỗ ấm, đá sáng, tường ngà và điểm sáng ấm trong phạm vi hợp lệ.

### 18.4. Kiểm trước khi duyệt bản chỉnh

- [ ] Brief dẫn layout/phiên bản; chỗ chưa chốt được đánh dấu, không coi study là runtime.
- [ ] So mái/cửa/hiên/cột/vỉa hè với một mẫu camera chung và sprite chuẩn ở tỷ lệ chơi.
- [ ] Vẽ đè đường kiểm spawn → NPC → ngưỡng cửa tiếp cận được → hai mép, tính cả bounds nhân vật.
- [ ] Phân biệt đường xe (nếu có), lối đi bộ, cửa và sân chung bằng hình học/value; đọc được khi bỏ màu.
- [ ] Vùng trung tâm có công năng cụ thể; công trình, mái và điểm tựa có quan hệ hợp lý.
- [ ] Không có props đặc nằm ngoài vùng cản hoặc che cửa, góc rẽ, NPC và hai miệng nối.
- [ ] Cả sáu khu cùng camera/scale/material nhưng có tổ chức theo chức năng riêng.
- [ ] Ghi riêng kết quả review brief, xem ảnh và chạy build; checklist chưa tích không phải bằng chứng đã đạt.

### 18.5. Prompt bàn giao cho lần chỉnh ảnh sau

> Revise the environment against the supplied approved level layout; keep its
> version, walkable mask, footprints, NPC access and exits fixed. Use one
> consistent 2D top-down / shallow three-quarter sprite convention for roofs,
> facades, ground, sidewalks and the existing characters. Preserve the warm
> Jiangnan pixel-art identity. Distinguish pedestrian circulation, any planned
> vehicle road, door thresholds and communal space. The center is a shared
> waiting forecourt for the shops and parcel pickup, with shallow attached
> eaves only where layout and rendering support them. Keep supports and solid
> furniture inside existing blocked zones; omit or simplify them when no valid
> placement exists. Do not invent obstacles, change gameplay routes or mix
> frontal architectural elevations with overhead ground. Review camera first,
> circulation second, architecture third, and decoration last. If the approved
> layout is missing, return a proposed blockout rather than final environment art.

### 18.6. Một campus liên thông cho mọi asset khu vực

Đây là quy ước bắt buộc cho concept, background, tileset và asset kiến trúc:
**cả sáu cảnh thuộc một campus**, có khu ở, khu học, sinh hoạt, dịch vụ và
cảnh quan riêng nhưng cùng một hệ giao thông và nhận diện trường.

- Thiết kế mới giữ vòng **ký túc ↔ cổng trường ↔ thư viện ↔ nhà ăn ↔ phố
  dịch vụ ↔ vườn ↔ ký túc**, thêm ký túc–nhà ăn, cổng–phố, thư viện–vườn
  và trục thư viện–phố. Thư viện/phố có bốn hướng; bốn khu khác có ba hướng.
  Warp Matrix và tọa độ nằm trong `docs/game-dev/campus-network-v1/`.
  Các cụm nối qua đường nội bộ uốn góc, không phải sáu rectangle ghép kín.
- Mỗi brief nêu các cạnh Bắc/Đông/Nam/Tây thực sự có warp và đường tiếp cận
  nối chúng; không tự mở cạnh thứ tư cho khu chỉ có ba cổng. Kiểm cặp mép
  đối ứng về cao độ, bề rộng, vật liệu, camera, scale và dấu hiệu hướng
  tới khu kế bên; không chỉ tạo hai khoảng hở độc lập ở mép ảnh.
- Dùng chung bộ lát đá, gỗ, ngói, cây xanh, đèn và ngôn ngữ chỉ dẫn của
  trường. Chuyển mật độ cây/công trình có chủ đích; không để bước qua mép
  là đổi hẳn thành phố, thời đại, phong cách hoặc tỷ lệ nhân vật.
- Phố là cụm dịch vụ cho sinh viên; vườn và kênh thuộc cảnh quan campus;
  cổng trường là cảnh phía trong khu đón tiếp. Không thêm tuyến ra đô thị,
  quốc lộ, ga tàu hoặc địa điểm ngoài trường từ suy diễn của ảnh tham khảo.
- Không cần dựng toàn campus trong mỗi ảnh. Từng asset thể hiện một phần
  có chức năng rõ, có lối nối hợp lệ và dấu hiệu cùng một trường. Khi chưa
  có cảnh liền kề, dùng mẫu mép chung và ghi trạng thái chưa kiểm cặp ảnh.

Khối bắt buộc cho prompt tạo/chỉnh asset, dùng cùng layout đã duyệt:

> CAMPUS CONTINUITY: All six locations belong to the same Jiangnan university
> campus in 2026. This scene is [area]. Read the NORTH/EAST/SOUTH/WEST ports
> from the campus-network-v1 warp matrix; preserve the three or four actual
> connections and keep unused edges closed. Follow the versioned level layout.
> The shopping street is an internal student-services lane;
> the garden and canal are campus landscaping; the gate scene stays on the
> campus side. Match paired path edges, paving, camera, character scale,
> materials, lighting and campus identity. Do not reinterpret any playable
> area as an off-campus city street or invent new exits. Show one connected
> part of the university rather than an isolated scenic illustration.
