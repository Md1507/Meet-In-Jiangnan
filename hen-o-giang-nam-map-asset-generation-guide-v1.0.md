# Map & Asset Generation Guide
## Hẹn ở Giang Nam

**Phiên bản:** 1.0  
**Trạng thái:** Quy chuẩn nền tảng cho pipeline Map + Asset  
**Nguồn quy hoạch chính:** `ascii-maps.md` — *ASCII blockouts — Campus network v1*  
**Phong cách hình ảnh:** 2D pixel art, top-down 3/4 (Stardew Valley-like flattened perspective)  
**Tile strategy:** Hybrid  
**Đầu ra:** Structured map data (JSON) + asset sprites/tilesets + assembled visual preview

---

## 1. Mục tiêu và nguyên tắc cốt lõi

AI phải thiết kế và xây dựng **bản đồ game**, không chỉ tạo một bức tranh environment art.

Bản đồ được cấu thành từ dữ liệu địa hình, tile, công trình, props và gameplay. Hình ảnh cuối cùng phải được lắp ghép từ chính dữ liệu này.

### 1.1. Nguyên tắc Map-first, Asset-driven

1. `ascii-maps.md` là nguồn quy hoạch có thẩm quyền cho sáu khu vực hiện tại.
2. Giữ nguyên kích thước, tọa độ landmark, vị trí lối ra và quan hệ kết nối đã được định nghĩa trong Map Guide.
3. Tạo terrain trước, sau đó mới đặt công trình, props và các đối tượng gameplay.
4. Mỗi asset phải có ID, kích thước, anchor, footprint, vị trí và quy tắc hiển thị rõ ràng.
5. Map JSON, asset manifest và hình ảnh assembled preview phải mô tả **cùng một bản đồ**.
6. Không tạo một background minh họa độc lập rồi đặt asset ngẫu nhiên lên trên.
7. Không tự ý thêm vật thể làm thay đổi đường đi, collider, spawn, exit hoặc gameplay đã duyệt.
8. Nếu Map Guide thiếu dữ liệu hoặc có mâu thuẫn, phải ghi nhận và hỏi/đề xuất xác nhận; không tự ý sửa nguồn.

### 1.2. Phân biệt ba loại đầu ra

- **Map data:** dữ liệu có cấu trúc, dùng để kiểm tra và đưa vào game.
- **Asset files:** sprite, tileset, spritesheet hoặc file hình ảnh riêng của từng asset.
- **Assembled preview:** hình ảnh xem trước được render từ map data và asset đã khai báo.

Assembled preview không thay thế map data hoặc asset files.

---

## 2. Nguồn quy hoạch: ASCII blockouts

### 2.1. Quy ước tọa độ và kích thước

Mỗi khu vực có kích thước macro **20 cột × 15 hàng**.

- Trục X: `0–19`, tăng từ trái sang phải.
- Trục Y: `0–14`, tăng từ trên xuống dưới.
- Cách truy cập: `layout[y][x]`.
- Mỗi hàng phải có đúng 20 ký tự.
- Mỗi map phải có đúng 15 hàng.

ASCII map là **Macro Layout**, thể hiện quy hoạch cấp khu vực. Nó không có nghĩa mỗi ký tự là một sprite hay một hình ảnh hoàn chỉnh.

### 2.2. Tile ID và ký hiệu

| Ký hiệu | Tile ID | Ý nghĩa | Quy tắc cơ bản |
|---|---:|---|---|
| `.` | 0 | Cỏ | Có thể đi |
| `:` | 1 | Đường | Có thể đi |
| `#` | 2 | Khối cản | Không đi qua, trừ khi được định nghĩa riêng |
| `~` | 3 | Nước | Không đi qua |
| `N`, `E`, `S`, `W` | 9 | Warp tại cạnh tương ứng | Điểm chuyển map |
| `=` | 1 | Đường cầu | Có thể đi; là biến thể đường/cầu, không phải tile ID mới |
| `D`, `R`, `A`, `I`, `G`, `L`, `Q`, `C`, `H`, `F`, `P`, `T` | 2 | Landmark được chú giải trên ô cản | Ký tự định danh công trình/địa điểm, không phải Tile ID mới |
| `s` | 2 | Vị trí bảng chỉ đường gắn tường | Chú giải asset trên ô cản, không phải Tile ID mới |

**Lưu ý quan trọng:** `#` và các ký tự landmark đều được mã hóa thành Tile ID 2 ở lớp macro, nhưng không có nghĩa tất cả đều phải được render thành một bức tường giống nhau. Landmark cần được diễn giải thành footprint/công trình tương ứng trong Structure Layer. Không được biến mọi ô `#` thành tường xây nếu điều đó làm sai kiến trúc.

### 2.3. Sáu khu vực hiện tại

| Map ID | Tên khu vực | Landmark theo nguồn |
|---|---|---|
| `dorm` | Ký túc xá | `D` khối nhà ở; `R` khối sinh hoạt; `s` bảng chỉ đường |
| `gate` | Cổng trường | `A` nhà trực/đón tiếp; `I` thông tin trường; `G` trụ cổng phía trong; `s` bảng khuôn viên |
| `library` | Thư viện | `L` khối thư viện; `Q` cánh học tập; `s` bảng chỉ đường |
| `canteen` | Nhà ăn | `C` khối phục vụ; `H` khối nhà ăn; `s` bảng chỉ đường |
| `street` | Phố dịch vụ sinh viên | `F` quầy bánh bao/hàng thiết yếu; `P` điểm nhận bưu kiện; `s` bảng chỉ đường |
| `garden` | Vườn/Kênh | `T` pavilion đọc/nghỉ; `s` bảng chỉ đường gắn pavilion |

Không tự ý đổi tên Map ID, landmark ID hoặc ý nghĩa landmark.

### 2.4. Đồ thị kết nối giữa các map

Các cặp cạnh kết nối theo `ascii-maps.md`:

| Map nguồn | Cạnh | Map đích | Cạnh đích |
|---|---|---|---|
| `dorm` | east | `gate` | west |
| `dorm` | north | `garden` | south |
| `dorm` | south | `canteen` | north |
| `gate` | west | `dorm` | east |
| `gate` | east | `library` | west |
| `gate` | north | `street` | south |
| `library` | west | `gate` | east |
| `library` | north | `canteen` | south |
| `library` | east | `garden` | west |
| `library` | south | `street` | north |
| `canteen` | south | `library` | north |
| `canteen` | west | `street` | east |
| `street` | east | `canteen` | west |
| `street` | west | `garden` | east |
| `street` | south | `gate` | north |
| `street` | north | `library` | south |
| `garden` | east | `street` | west |
| `garden` | south | `dorm` | north |
| `garden` | west | `library` | east |

**Quy tắc warp:** tọa độ warp ở hai đầu phải tương ứng đúng theo cạnh và vị trí đã đánh dấu trong ASCII map. Với các cửa ở cạnh bắc/nam, kiểm tra cặp X; với cửa ở cạnh đông/tây, kiểm tra cặp Y. Không chỉ kiểm tra tên map đích mà phải kiểm tra cả tọa độ và vùng địa hình tiếp giáp.

### 2.5. Quy tắc bảo toàn Macro Layout

- Không tự dịch chuyển landmark để bố cục trông đẹp hơn.
- Không tự mở thêm lối đi xuyên qua `#` hoặc `~`.
- Không thu hẹp, mở rộng hoặc đổi hướng các tuyến đường chính.
- Không biến `=` thành vật trang trí: đây là phần đường cầu có thể đi.
- Không tạo lối đi mới chỉ vì asset được đặt ở vị trí đó.
- Nếu cần thay đổi quy hoạch, phải đề xuất bản cập nhật ASCII Map riêng và chờ duyệt.

---

## 3. Camera và quy ước phối cảnh

### 3.1. Camera chính thức: Top-down 3/4

Chọn góc nhìn top-down 3/4 theo hướng thể hiện gần với Stardew Valley, không phải phối cảnh isometric hình thoi.

Quy ước:

- Mặt đất được nhìn từ trên xuống; chiều sâu không gian thể hiện chủ yếu theo trục dọc màn hình.
- Có thể nhìn thấy mặt đứng phía trước của công trình, tường, mái hiên và vật thể có chiều cao.
- Chiều cao công trình được thể hiện theo kiểu “flattened pop-up book”: phần chiều cao được ép/chiếu lên trên mặt phẳng bản đồ, trong khi chiều sâu trên mặt đất vẫn đọc được.
- Không tự chuyển sang isometric 2:1 hoặc phối cảnh phối tụ.
- Nhân vật, mặt đất, đường, cây, công trình và cầu phải tuân thủ cùng một quy ước camera.
- Cầu, cổng, cầu thang và hành lang phải được vẽ theo quan hệ thực tế với hướng đường và địa hình, không chỉ xoay sprite cho vừa khung hình.

### 3.2. Kiểm tra phối cảnh

Một asset bị xem là không đạt nếu:

- Mặt đất của asset nghiêng theo một hướng khác với tilemap.
- Mặt tiền công trình nhìn chính diện hoàn toàn trong khi mặt đất lại top-down mà không theo quy ước phối cảnh.
- Cây/cột/lan can không có điểm tiếp xúc hợp lý với mặt đất.
- Cầu không thể hiện rõ mặt đi bộ và hai đầu kết nối.
- Bóng đổ cho thấy nguồn sáng mâu thuẫn với các asset khác.

---

## 4. Tile strategy: Hybrid

### 4.1. Quy ước cơ sở

Dùng hệ thống hybrid:

- **Terrain tiles:** dùng ô lưới cơ sở 16 × 16 px làm đơn vị mặc định cho tile nền.
- **Large assets:** kích thước tự do theo pixel, nhưng phải căn chỉnh theo world grid và có footprint tính bằng ô lưới.
- **Buildings:** có thể rộng/cao nhiều ô, không ép vào một tile duy nhất.
- **Trees and large props:** sprite có thể cao hơn footprint tiếp xúc đất; cần khai báo anchor và collision riêng.
- **Decorative details:** có thể dùng kích thước nhỏ hơn/mảnh hơn, nhưng không được làm sai pixel density.

16 × 16 px là quy ước tile terrain mặc định, không phải giới hạn kích thước của mọi asset. Nếu engine hiện tại dùng tile size khác, phải khai báo conversion rõ ràng thay vì âm thầm thay đổi dữ liệu.

### 4.2. Macro-to-detail expansion

Macro Layout 20 × 15 được chuyển thành tilemap chi tiết bằng một hệ số mở rộng được khai báo trong project config.

Ví dụ nếu một ô macro tương ứng 4 × 4 terrain tiles:

- Macro width: 20 → detailed width: 80 tiles.
- Macro height: 15 → detailed height: 60 tiles.

Đây chỉ là ví dụ về cách mở rộng, không phải yêu cầu bắt buộc mọi ô macro phải có cùng một hình thức nội dung. Công trình, cây lớn và cầu có footprint riêng, có thể phủ nhiều ô.

Không được tự ý chọn hệ số mở rộng khác nhau giữa các map. Hệ số phải được lưu trong cấu hình chung của project.

### 4.3. Autotiling và terrain transitions

Terrain phải được tạo theo quan hệ với các ô lân cận, không chỉ tô từng ô riêng lẻ.

Cần hỗ trợ:

- Grass interior, edge, corner và variation.
- Dirt/path interior, edge, corner, T-junction và cross-junction.
- Stone paving và stone border.
- Water interior, shoreline, inner/outer corner.
- Grass-to-dirt, grass-to-stone và land-to-water transitions.
- Bridge deck, bridge edge/rail và bridge-to-bank transition.
- Các biến thể trang trí không làm thay đổi walkability.

Mỗi bộ autotile phải có quy tắc adjacency rõ ràng và test các trường hợp góc, cạnh, giao lộ. Không để khe hở, đường viền sai hướng hoặc tile nước/đất bị ghép không tự nhiên.

---

## 5. Các layer bắt buộc

Bản đồ cần được chia thành các layer logic. Tên layer có thể được chuyển đổi theo engine, nhưng ý nghĩa phải được giữ nguyên.

### 5.1. Terrain Layer

Chứa các tile nền:

- Grass, dirt, stone, paved ground.
- Water và shoreline.
- Road/path và các biến thể.
- Bridge walk surface.
- Terrain transition và ground decoration nhẹ.

Terrain Layer xác định địa hình nền và không tự động quyết định toàn bộ collision của asset phía trên.

### 5.2. Structure Layer

Chứa công trình và cấu trúc lớn:

- Nhà ở, khối sinh hoạt, nhà trực, khối thông tin.
- Thư viện, cánh học tập.
- Khối phục vụ và khối nhà ăn.
- Quầy bánh bao, điểm nhận bưu kiện.
- Pavilion, cổng, cầu và mái che.

Mỗi structure phải có footprint, entrance, collision shape, anchor và rendering layer.

### 5.3. Props & Decoration Layer

Chứa vật thể nhỏ và trang trí:

- Cây, bụi cây, hoa, chậu cây.
- Đèn, biển báo, bảng thông tin.
- Ghế, bàn, xe đạp, thùng rác.
- Đồ vật trang trí kiến trúc.

Không thêm props để lấp khoảng trống một cách tùy tiện. Mọi props phải có lý do bố trí và không cản đường đi quan trọng.

### 5.4. Gameplay Layer

Chứa dữ liệu không nhất thiết nhìn thấy:

- Player spawn.
- NPC spawn.
- Warp zones.
- Interaction points.
- Quest/event triggers.
- Walkability và collision metadata.
- Các vùng gameplay đã được duyệt.

Không để việc thay đổi hình ảnh làm thay đổi ID, quest, save, collider, spawn, exit, font hoặc nội dung học hiện có.

### 5.5. Rendering / Occlusion Layer

Quy định thứ tự hiển thị:

- Ground phía dưới.
- Các vật thể đặt trên mặt đất.
- Nhân vật và NPC.
- Phần thân/tán cây hoặc mái hiên cần che nhân vật khi nhân vật đi phía sau.
- Foreground elements.

Vật thể cao cần có anchor tại điểm tiếp xúc mặt đất. Không dùng góc trên trái của sprite làm điểm xác định vị trí gameplay nếu điểm đó không phải điểm đặt chân.

---

## 6. Asset specification

### 6.1. Mỗi asset phải có manifest

Mỗi asset cần có tối thiểu:

| Field | Mục đích |
|---|---|
| `asset_id` | ID duy nhất, ổn định |
| `asset_type` | terrain, building, vegetation, prop, bridge, signage, character... |
| `file` | Đường dẫn file sprite/tileset |
| `pixel_size` | Kích thước sprite thực tế |
| `grid_footprint` | Số ô grid chiếm dụng |
| `anchor` | Điểm neo trong sprite |
| `origin` | Tọa độ đặt trong map |
| `collision` | Hình dạng/vùng va chạm |
| `walkable_area` | Vùng có thể đi, nếu có |
| `interaction_point` | Điểm tương tác, nếu có |
| `render_layer` | Lớp hiển thị |
| `variant_group` | Nhóm biến thể có thể thay thế |
| `style_tags` | Vật liệu, màu sắc, phong cách |

### 6.2. Quy tắc footprint, anchor và collision

- `origin` phải dùng một quy ước duy nhất: góc trên trái của vùng grid được asset chiếm dụng.
- `anchor` xác định điểm đặt sprite so với world grid; cây và công trình cao thường neo tại chân/điểm tiếp xúc đất.
- `footprint` mô tả vùng chiếm chỗ logic, không nhất thiết bằng toàn bộ bounding box hình ảnh.
- `collision` phải khai báo riêng; không mặc định toàn bộ footprint đều cản.
- Cửa ra vào phải nối trực tiếp với vùng walkable.
- Sprite có phần tán/mái vươn qua lối đi không đồng nghĩa phần hình ảnh đó là collider.
- Không tạo collider mới chỉ vì có thêm chi tiết trang trí.

### 6.3. Asset generation phải bắt nguồn từ map

Quy trình xác định asset:

1. Đọc Macro Layout và landmark.
2. Xác định chức năng của từng landmark theo bối cảnh game.
3. Tạo asset manifest cho những asset thật sự cần.
4. Tạo sprite/tileset theo manifest.
5. Đặt asset vào map bằng tọa độ và anchor đã khai báo.
6. Kiểm tra footprint, collision, entrance và đường đi.
7. Render assembled preview từ dữ liệu map.

Không tạo asset trước rồi tự tìm vị trí để nhét vào map nếu việc đó làm thay đổi quy hoạch.

---

## 7. Art direction: Giang Nam đương đại, 2026

### 7.1. Bản sắc hình ảnh

Game là “Hẹn ở Giang Nam”: trải nghiệm học tiếng Trung qua đời sống sinh viên quốc tế tại một trường đại học hiện đại ở Giang Nam năm 2026.

Kết hợp:

- Bối cảnh đại học Trung Quốc đương đại.
- Không khí Giang Nam: tường sáng, mái ngói tối, gỗ, gốm, đá lát, cây xanh và yếu tố nước.
- Các chi tiết đời sống sinh viên hiện đại: bảng thông tin, xe đạp, cửa hàng tiện ích, quầy ăn uống, biển chỉ dẫn.
- Cảnh quan có cảm giác ấm áp, thân thiện, hơi ẩm và có sức sống.

Không biến toàn bộ khuôn viên thành phố cổ. Kiến trúc hiện đại phải là nền chính; yếu tố Giang Nam tạo bản sắc qua mái, vật liệu, cây, nước, sân và chi tiết trang trí.

### 7.2. Tham chiếu Stardew Valley

Tài liệu PDF tham khảo mô tả một số nguyên tắc đặc trưng:

- Một sprite thường dùng khoảng 6–8 màu; asset phức tạp có thể cần nhiều hơn.
- Hạn chế đen/trắng tuyệt đối; màu tối và sáng vẫn nên mang sắc độ.
- Outline thường là màu tối nhất của asset.
- Tái sử dụng màu và giới hạn palette giúp sprite đồng nhất.
- Dùng màu có độ bão hòa rõ; chỉ giảm độ bão hòa khi có lý do nghệ thuật.
- Dùng dithering để mô tả một số vùng chuyển sáng tối.
- Dùng solid shading cho drop shadow hoặc cả một mặt nằm trong bóng.
- Dùng dithering cho vùng bóng cong hoặc vùng chỉ bị che sáng một phần.
- Bóng có thể chuyển hue, không chỉ đơn giản là cùng màu nhưng tối hơn.
- Phối cảnh Stardew Valley không phải top-down/isometric thuần; chiều cao được làm phẳng theo kiểu “pop-up book”, còn chiều sâu vẫn đọc theo trục dọc.

Các nguyên tắc này là định hướng tham khảo, không phải luật cứng cho mọi asset. Giữ sự nhất quán quan trọng hơn việc áp dụng máy móc.

### 7.3. Palette và shading

- Mỗi asset nhỏ nên bắt đầu với palette gọn khoảng 6–8 màu; chỉ tăng khi hình dạng hoặc vật liệu thực sự cần.
- Không dùng pure black hoặc pure white làm màu mặc định.
- Outline là màu tối nhất trong palette của asset.
- Dùng color-shifted shadows: bóng có thể nghiêng về xanh, tím, nâu hoặc màu lạnh tùy vật liệu/ánh sáng.
- Dithering dùng có chủ đích, không phủ dày toàn bộ sprite.
- Drop shadow trên mặt đất nên rõ và có hình dạng dễ đọc.
- Tái sử dụng các màu chung cho mái ngói, đá, gỗ, tường, lá và nước để các khu vực thuộc cùng một thế giới.

### 7.4. Pixel density

- Giữ pixel grid nhất quán.
- Không trộn pixel art sắc cạnh với texture painterly hoặc blur gradient.
- Không dùng anti-aliasing mịn làm mất cảm giác pixel.
- Không phóng to sprite bằng nội suy làm nhòe pixel.
- Chi tiết nhỏ phải còn đọc được ở kích thước hiển thị thực tế.
- Các asset cùng nhóm phải có mức độ chi tiết tương đương.

### 7.5. Ưu tiên readability

Art không được cạnh tranh với nội dung học:

- Chữ Hán.
- Pinyin.
- Nghĩa tiếng Việt.
- Objective, hint và hộp hội thoại.

Nhà ăn phải nhận diện được ở kích thước canvas nhỏ. Seller phải có silhouette/trang phục dễ phân biệt. Các điểm tương tác và lối đi quan trọng cần có độ tương phản đủ tốt.

---

## 8. Quy tắc kiến trúc và quy hoạch không gian

### 8.1. Functional architecture

Công trình phải thể hiện chức năng qua hình khối, cửa vào, mặt tiền và cách tổ chức không gian, không chỉ bằng biển hiệu.

- Khối nhà ở phải đọc được là nơi cư trú.
- Khối sinh hoạt cần có dấu hiệu của không gian chung.
- Nhà trực/đón tiếp và khối thông tin cần dễ nhận biết gần cổng.
- Thư viện và cánh học tập cần có nhận diện phù hợp chức năng học tập.
- Nhà ăn cần thể hiện rõ khu phục vụ và khu ăn uống.
- Phố dịch vụ cần thể hiện rõ quầy hàng và điểm nhận bưu kiện.
- Pavilion phải có công năng nghỉ/ngồi đọc.

### 8.2. Entrance và circulation

- Cửa công trình phải nối trực tiếp với vùng walkable.
- Không đặt cột, cây, ghế hoặc props lên tuyến đường bắt buộc.
- Lối đi chính và lối đi phụ phải có phân cấp dễ đọc.
- Vỉa hè, sân, đường nội bộ và khu vực trang trí phải phân biệt được bằng vật liệu/biên dạng.
- Không dùng một mảng lát đá lớn không rõ chức năng để lấp đầy không gian.

### 8.3. Bridge and water

- Cầu phải kết nối hai vùng đất/bờ đối diện.
- Trục cầu phải phù hợp với hướng tuyến đường mà nó kết nối; khi băng qua kênh ngang thì lối cầu nối hai bờ phía trên/dưới.
- Mặt cầu phải là vùng đi được liên tục.
- Lan can, thành cầu và chân cầu không được che kín toàn bộ mặt đi bộ.
- Hai đầu cầu phải chuyển tiếp tự nhiên sang đường/bờ.
- Không đặt cầu như một vật thể trang trí nổi trên mặt nước.
- Phần vòm kiến trúc và mặt đường đi phải được thể hiện theo camera đã chọn.

### 8.4. Trees and large props

- Xác định vị trí chân cây/anchor, không lấy mép tán làm tọa độ đặt.
- Tán cây có thể phủ lên nhiều ô nhưng collision thường chỉ ở thân hoặc vùng được thiết kế.
- Không để tán cây che landmark, cửa vào, warp hoặc điểm tương tác quan trọng.
- Không đặt cây lớn lên đường chính nếu Map Guide không chỉ định.

---

## 9. Gameplay và bối cảnh hiện có

### 9.1. Gameplay slice tại nhà ăn

Nguồn `bối-cảnh-game.txt` xác định lát cắt hiện tại là ngày 2 tại nhà ăn:

- Người chơi bắt đầu ở sân nhà ăn, nhìn thấy quầy phục vụ và khu ăn uống.
- Di chuyển bằng WASD hoặc phím mũi tên.
- Đến gần NPC bán hàng, nhấn E để mở hội thoại.
- Người chơi đọc chữ Hán, pinyin và nghĩa tiếng Việt.
- Người chơi chọn gợi ý và nhập câu `我要一杯热水。`
- Câu sai cho phép thử lại; câu đúng hoàn thành nhiệm vụ.
- Esc đóng hội thoại và focus quay lại canvas.
- Reload vẫn giữ tiến độ; hoàn thành lại không nhận thưởng lần hai.

Bố cục gameplay phải giữ nguyên:

- Hai khối công trình lớn nằm bên trái và bên phải.
- Lối đi trung tâm và hai hành lang thoáng để người chơi đi qua.
- Seller đứng gần khu trung tâm, trong bounds nhân vật hiện có.
- Hai lối ra dẫn tới thư viện và phố.
- Không thêm tường, bàn, cây hoặc vật thể khiến người chơi hiểu nhầm là collider mới.

Không được thay đổi ID, quest, save, collider, spawn, exit, font hoặc nội dung học khi chỉ đang làm mới art.

### 9.2. Ưu tiên khi có xung đột

Nếu yêu cầu thẩm mỹ xung đột với gameplay đã duyệt:

1. Giữ nguyên gameplay và navigation.
2. Giữ nguyên Macro Layout và warp.
3. Điều chỉnh asset, kích thước hình ảnh hoặc rendering layer.
4. Nếu vẫn không thể giải quyết, báo cáo xung đột và đề xuất lựa chọn để người dùng duyệt.

---

## 10. JSON output specification

Mỗi map cần xuất dữ liệu có cấu trúc. Có thể dùng nhiều file JSON theo map và một file world manifest tổng.

### 10.1. Cấu trúc đề xuất

```json
{
  "schema_version": "1.0",
  "map_id": "garden",
  "display_name": "Vườn/Kênh",
  "dimensions": {
    "macro_width": 20,
    "macro_height": 15,
    "detail_tiles_per_macro_cell": 4,
    "terrain_tile_px": 16
  },
  "macro_layout": [
    "####################"
  ],
  "terrain_layer": {
    "tilemap": [],
    "autotile_ruleset": "jiangnan_terrain_v1"
  },
  "structure_layer": [
    {
      "asset_id": "pavilion_reading_01",
      "origin_macro": [15, 3],
      "footprint_macro": [1, 1],
      "anchor": "ground_contact",
      "entrances": [],
      "collision": [],
      "render_layer": "structure"
    }
  ],
  "props_layer": [],
  "gameplay_layer": {
    "player_spawn": null,
    "npc_spawns": [],
    "interaction_points": [],
    "warps": []
  },
  "validation": {
    "macro_dimensions_valid": false,
    "warp_links_valid": false,
    "walkable_paths_valid": false,
    "asset_collisions_valid": false
  }
}
```

Đoạn trên chỉ là schema minh họa. `macro_layout` phải chứa đủ 15 hàng đúng theo map thực tế; `terrain_layer.tilemap` phải chứa dữ liệu chi tiết đầy đủ. Không được dùng dữ liệu rút gọn làm file xuất cuối cùng.

### 10.2. Quy tắc JSON

- JSON phải parse được bằng parser tiêu chuẩn.
- Không thêm comment vào JSON.
- Không dùng dấu phẩy thừa.
- Tọa độ dùng mảng `[x, y]` hoặc object `{ "x": x, "y": y }`, nhưng phải nhất quán toàn project.
- Giữ nguyên Map ID và Asset ID sau khi đã được duyệt.
- Dùng `null` khi dữ liệu chưa được xác định; không tự bịa tọa độ.
- Dữ liệu thiếu phải được liệt kê trong validation report.
- Không đánh dấu validation là `true` nếu chưa thực sự kiểm tra.

### 10.3. World manifest

Cần một manifest tổng để mô tả sáu map, các kết nối và thư viện asset dùng chung.

World manifest phải có:

- Danh sách map ID.
- Kích thước macro của từng map.
- Danh sách warp connections.
- Danh sách asset dùng chung.
- Palette/style version.
- Grid/tile configuration.
- Phiên bản schema.

---

## 11. Asset generation và assembled preview

### 11.1. Asset generation

AI tạo asset theo từng nhóm có kiểm soát:

1. Terrain tileset.
2. Water/shoreline/bridge tileset.
3. Building sprites.
4. Vegetation sprites.
5. Props and signage.
6. Character/NPC sprites nếu được yêu cầu.

Mỗi lần tạo phải nêu rõ asset ID, kích thước dự kiến, anchor, palette, hướng camera và nền trong suốt nếu cần tách sprite.

Không gộp nhiều asset độc lập thành một ảnh nền không thể tách hoặc không có metadata.

### 11.2. Giới hạn của công cụ tạo ảnh

Công cụ tạo ảnh có thể hỗ trợ concept, sprite và tileset, nhưng không nên được xem là công cụ bảo đảm tọa độ pixel hoặc dữ liệu collision chính xác.

Vì vậy:

- Dùng AI image generation để tạo hình ảnh asset.
- Dùng JSON/manifest để xác định vị trí và thuộc tính asset.
- Dùng map renderer/game engine để lắp ghép chính xác.
- Dùng validation script để kiểm tra cấu trúc, warp, collision và đường đi.

Nếu công cụ ảnh không thể tạo spritesheet đúng grid hoặc sprite trong suốt đúng yêu cầu, phải ghi rõ giới hạn và chuyển sang quy trình cắt/chỉnh sửa/kiểm tra bằng công cụ đồ họa. Không tuyên bố asset đã sẵn sàng cho engine chỉ dựa trên một ảnh concept.

### 11.3. Assembled preview

Preview phải được render từ cùng dữ liệu JSON và asset manifest.

Preview cần thể hiện:

- Terrain và chuyển tiếp địa hình.
- Công trình tại đúng vị trí.
- Props tại đúng vị trí.
- Lối đi và cầu.
- Warp/exit có thể bật overlay debug.
- Grid/coordinate overlay có thể bật khi review.

Không được tạo preview bằng một prompt độc lập rồi tuyên bố nó khớp với JSON nếu chưa render từ dữ liệu.

---

## 12. Validation checklist

### 12.1. Macro map validation

- [ ] Mỗi map có đúng 20 cột × 15 hàng.
- [ ] Tất cả ký hiệu đều thuộc bộ ký hiệu đã định nghĩa.
- [ ] Landmark giữ đúng tọa độ.
- [ ] Warp nằm đúng cạnh và đúng tọa độ.
- [ ] `=` được xử lý là đường cầu có thể đi.
- [ ] Không có lối đi tự phát xuyên qua vật cản/nước.

### 12.2. Connectivity validation

- [ ] Mỗi warp có map đích hợp lệ.
- [ ] Cạnh nguồn và cạnh đích đối ứng.
- [ ] Tọa độ warp khớp theo trục cạnh.
- [ ] Địa hình ở hai đầu không tạo khoảng đứt.
- [ ] Có thể đi từ vùng chơi chính đến warp.
- [ ] Không có warp mồ côi hoặc kết nối một chiều ngoài chủ ý.

### 12.3. Terrain validation

- [ ] Autotile đúng cạnh/góc/giao lộ.
- [ ] Không có khe hở giữa tile.
- [ ] Mép nước khớp với địa hình.
- [ ] Cầu nối đúng hai bờ.
- [ ] Walkability khớp với tile logic.
- [ ] Biến thể trang trí không làm thay đổi collision.

### 12.4. Asset validation

- [ ] Mọi asset có ID duy nhất.
- [ ] Pixel size, anchor và footprint được khai báo.
- [ ] Không asset nào chắn entrance hoặc warp ngoài chủ ý.
- [ ] Collision không bao phủ phần hình ảnh không cần cản.
- [ ] Render order đúng.
- [ ] Pixel density, palette và camera nhất quán.
- [ ] Asset dùng chung giữa các map không bị lệch style.

### 12.5. Gameplay validation

- [ ] Player spawn hợp lệ.
- [ ] NPC spawn nằm trong vùng có thể tiếp cận.
- [ ] Interaction point có thể đến gần.
- [ ] Lối đi quan trọng không bị props che.
- [ ] Không thay đổi quest/save/ID/font/nội dung học.
- [ ] Art không làm giảm khả năng đọc chữ Hán, pinyin và UI.

### 12.6. Visual review

- [ ] Map dễ đọc ở kích thước canvas mục tiêu.
- [ ] Công trình có chức năng kiến trúc rõ ràng.
- [ ] Đường đi nhìn liên tục và có logic.
- [ ] Cầu, cổng và hành lang kết nối đúng địa hình.
- [ ] Màu sắc có phân cấp, không quá nhiễu.
- [ ] Các landmark dễ nhận diện.

---

## 13. Quy trình production chuẩn

### Phase 1 — Parse & lock map

- Đọc `ascii-maps.md`.
- Parse sáu macro layout.
- Kiểm tra 20 × 15.
- Trích xuất landmark và warp.
- Tạo connectivity graph.
- Báo cáo lỗi trước khi sinh asset.
- Đóng băng bản quy hoạch đã duyệt.

### Phase 2 — Generate terrain

- Chuyển macro layout thành detailed tilemap.
- Tạo terrain tileset và autotile rules.
- Xây dựng đường, bờ nước và cầu.
- Kiểm tra walkability và kết nối.

### Phase 3 — Generate asset manifest

- Liệt kê asset cần thiết theo từng map.
- Xác định vị trí, footprint, anchor, collision và render layer.
- Phân biệt asset bắt buộc, asset dùng chung và asset trang trí.
- Không tạo asset chưa có chức năng hoặc vị trí hợp lệ.

### Phase 4 — Generate sprites/assets

- Tạo terrain tileset.
- Tạo công trình.
- Tạo cây và props.
- Kiểm tra palette, pixel density, camera và silhouette.
- Duyệt asset trước khi lắp ghép.

### Phase 5 — Assemble

- Nạp map JSON.
- Nạp terrain và asset manifest.
- Render các layer theo đúng thứ tự.
- Tạo preview có thể bật grid/warp/collision overlay.

### Phase 6 — Validate & export

- Chạy toàn bộ validation checklist.
- Xuất JSON, asset manifest, sprite/tileset và preview.
- Báo cáo asset còn thiếu, lỗi map và vấn đề gameplay.
- Chỉ đánh dấu hoàn thành khi dữ liệu và hình ảnh cùng khớp.

---

## 14. Prompt vận hành cho AI Map & Asset Generator

Sử dụng prompt dưới đây như chỉ thị vận hành cho mỗi lần tạo map:

> Bạn là hệ thống thiết kế và xây dựng bản đồ game 2D pixel art cho dự án **Hẹn ở Giang Nam**.
>
> Hãy đọc `ascii-maps.md` làm nguồn quy hoạch chính thức. Dự án hiện có sáu map: `dorm`, `gate`, `library`, `canteen`, `street`, `garden`. Mỗi map có macro layout 20 × 15, tọa độ `layout[y][x]`.
>
> **Camera:** top-down 3/4 theo quy ước flattened perspective gần với Stardew Valley; không dùng isometric hình thoi.  
> **Tile strategy:** hybrid; terrain dùng tile cơ sở 16 × 16 px, asset lớn có kích thước tự do nhưng căn theo grid và khai báo footprint/anchor.  
> **Visual direction:** pixel art Giang Nam đương đại năm 2026, tham khảo nguyên tắc palette, outline, color-shifted shading, dithering và flattened perspective trong tài liệu art style PDF.
>
> ### Bắt buộc thực hiện
>
> 1. Parse và bảo toàn chính xác macro layout, landmark, warp và kết nối.
> 2. Tạo terrain tilemap chi tiết từ macro layout bằng autotiling và terrain transitions.
> 3. Tạo asset manifest trước khi tạo sprite; mỗi asset có ID, kích thước, origin, footprint, anchor, collision và render layer.
> 4. Tạo sprite/tileset dựa trên asset manifest và quy hoạch map.
> 5. Lắp ghép bản đồ từ JSON + asset files, không dùng một background minh họa thay thế.
> 6. Tạo assembled preview từ cùng dữ liệu đã dùng để render map.
> 7. Chạy validation cho dimensions, landmark, warp, path connectivity, collision, entrances và visual consistency.
>
> ### Không được phép
>
> - Không tự ý sửa ASCII map.
> - Không tự thêm đường, cửa, cầu, vật cản hoặc warp.
> - Không đặt asset chỉ để lấp khoảng trống.
> - Không để cây, bàn, ghế, cột hoặc mái che chắn tuyến đường gameplay.
> - Không tự thay đổi ID, quest, save, collider, spawn, exit, font hoặc nội dung học.
> - Không tạo hình ảnh preview độc lập rồi tuyên bố nó khớp với JSON.
> - Không đánh dấu kiểm tra thành công nếu chưa kiểm tra.
>
> ### Đầu ra bắt buộc
>
> A. `world_manifest.json`  
> B. JSON đầy đủ cho từng map  
> C. Terrain tileset và autotile rules  
> D. Asset manifest cho từng map và asset dùng chung  
> E. Sprite/tileset files  
> F. Assembled map preview được render từ dữ liệu  
> G. Validation report gồm lỗi, cảnh báo và asset còn thiếu
>
> Nếu có dữ liệu không rõ hoặc xung đột, dừng phần bị ảnh hưởng, ghi rõ vấn đề và yêu cầu xác nhận. Không tự suy diễn thành dữ liệu gameplay mới.

---

## 15. Nguyên tắc duyệt cuối cùng

Một map chỉ được duyệt khi đồng thời đạt ba điều kiện:

1. **Structural correctness:** JSON và Macro Layout đúng, warp và đường đi kết nối hợp lệ.
2. **Visual correctness:** terrain, kiến trúc và asset thống nhất camera, palette, tỷ lệ và phong cách.
3. **Gameplay correctness:** nhân vật đi được đúng nơi, collider/interaction/warp hoạt động và không phá vỡ gameplay hiện có.

Một bức ảnh đẹp không đủ để được xem là map hoàn chỉnh. Một JSON hợp lệ nhưng hình ảnh lắp ghép sai cũng không đủ. **Map data, asset và assembled preview phải là ba biểu diễn đồng bộ của cùng một thế giới game.**
