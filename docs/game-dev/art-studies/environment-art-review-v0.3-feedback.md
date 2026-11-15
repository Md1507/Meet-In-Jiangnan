# Rà soát environment art theo guide v0.3

Ngày 2026-11-14. Nguồn: feedback người dùng cho hai ảnh vườn/kênh và phố/cửa hàng; [environment-art skill](../../.agents/skills/environment-art/SKILL.md); [art guide v0.3](hen-o-giang-nam-art-style-guide-v0.3.md). Các ảnh trước là visual studies, chưa được duyệt runtime.

## Quy ước camera chốt cho vòng tiếp theo

Chọn **top-down orthographic với mặt đứng nông**:

- Mặt đất, đường, nước và vỉa hè nằm trên cùng hệ trục nhìn từ trên.
- Công trình được đọc bằng mặt phẳng mái/top plane, footprint, mép hiên và một dải mặt đứng nông; không dựng mặt tiền chính diện cao rồi đặt lên nền top-down.
- Cửa, cửa sổ, lan can, cột và mái hiên bám cùng trục mặt bằng; độ sâu mặt đứng đề xuất không quá `16 world units` trong study.
- Chân nhân vật là anchor trên mặt đất. Bóng, mái và cây không được làm người chơi hiểu sai vị trí đứng.
- Renderer hiện là nền tĩnh + actor Pixi, chưa có foreground/occlusion động. Vì vậy mái che/cây đặt ngoài dòng đi hoặc thu thành hiên nông; không hứa actor đi dưới mái chỉ nhờ thứ tự vẽ.

**Lợi ích:** thống nhất sáu khu và giữ chân NPC/cửa/lối đi dễ đọc. **Phương án loại:** phối cảnh 3/4 mạnh hoặc facade chính diện, vì làm kiến trúc trông như mô hình dán lên bản đồ.

## Vườn/kênh — lỗi và hướng sửa

- Kênh chạy ngang; cầu phải có trục dọc, vuông góc kênh. Trong ảnh mới, mặt cầu là một dải top plane đi bộ nhìn thấy được; lan can/parapet là dải hẹp hai bên; vòm chỉ là dấu hiệu bên hông nông, không phải một mặt đứng vòm lớn nhìn chính diện.
- Hai đầu cầu nối trực tiếp vào đường/sân hai bờ bằng đoạn tiếp cận có cùng vật liệu và bề rộng. Không đặt chân cầu vào nước, cỏ hoặc bồn cây.
- Đường chính xuyên mép giữ `y=348..412`, kênh nằm phía trên; cầu là nhánh phụ nhập vào đường chính, không phải cổng chuyển khu.
- Pavilion trái có cửa quay về sân đệm, từ sân có lối rõ tới tuyến ven kênh và đường chính. Cây/bụi/hoa phân thành hậu cảnh và mép trang trí; không che nút giao hoặc chân NPC.
- Thu gọn kênh và gom hoạt động quanh pavilion/cầu để tránh khung hình bị dàn ngang.

## Phố/cửa hàng — lỗi và hướng sửa

- Hai công trình phải cùng một quy ước top-down nông: mái/top plane, mặt đứng thấp, hiên và cửa cùng trục với vỉa hè. Không dùng facade gần chính diện.
- Chức năng giao thông chốt là **phố đi bộ nội bộ của campus, có xe đạp tốc độ thấp**, không có làn ô tô. Vì vậy đường chính dùng stone paving trung tính, không dùng một dải asphalt tối rộng mà không có công năng.
- Phân cấp mới: đường chính `y=348..412`; vỉa hè chung `y=280..348`; lối vào cửa là các apron ngắn nối trực tiếp vào vỉa hè; phía trên là sân chung/arcade mở.
- Sân chung giữa hai cửa hàng dùng mái hiên ngói nông hoặc pergola gỗ cùng ngôn ngữ vật liệu; cột nằm ngoài dòng đi. Ghế/bảng tin ở phần lùi, không đặt vào lane.
- Cửa hàng trái đọc là quầy bánh bao/hàng thiết yếu qua quầy, cửa phục vụ và khu xe đạp có quy hoạch; cửa hàng phải đọc là điểm nhận bưu kiện qua lockers, scanner, khu chờ và courier. Không chỉ đổi props trong hai mặt tiền giống nhau.
- Thu chiều cao công trình và tăng diện tích sân/vỉa hè có chức năng để cân lại khung hình. NPC đứng trong pocket gần cửa hoặc sân chung, không tách khỏi khu phố trên đường trống.

## Không duyệt hai concept cũ

Hai ảnh chi tiết trước **chưa đạt để tích hợp** vì còn lỗi camera, giao thông và quan hệ công trình–mặt bằng. Bản tiếp theo phải đi qua blockout/camera check trước khi thêm chi tiết. Mép lát tự nhiên và auto-tiling vẫn là vòng polish sau khi đủ sáu khu, nhưng không được dùng lý do đó để bỏ qua quy hoạch/camera.

## Checklist vòng mới

- [ ] Camera ground/building/bridge/actor cùng quy ước.
- [ ] Bridge deck nhìn thấy như mặt đi bộ; hai đầu nối đường/bờ.
- [ ] Main path, sidewalk, entrance, courtyard có value và chức năng riêng.
- [ ] Không có facade chính diện ghép lên ground top-down.
- [ ] Mái che/cột/ghế/cây không nằm trên dòng đi khi renderer chưa có occlusion.
- [ ] Chức năng hai cửa hàng khác nhau cả ở footprint và không gian tiếp cận.
- [ ] Kích thước study thật, prompt/job/hash được lưu; chưa đánh dấu AC hoặc runtime.
