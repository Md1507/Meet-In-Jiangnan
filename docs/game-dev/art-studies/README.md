# Các mẫu định hướng art

**Layout mới:** [campus network v1](../campus-network-v1/design.md) bàn giao
[sáu map JSON 20×15](../campus-network-v1/maps.json), [ASCII](../campus-network-v1/ascii-maps.md)
và [Warp Matrix](../campus-network-v1/warp-matrix.csv). Thư viện/Phố là hub;
art mới phải theo các cổng 3–4 hướng của v1. Mẫu và prompt v0.3 bên dưới
giữ làm reference phong cách/lịch sử, không chứng minh đã khớp layout v1.

**Quy ước thế giới:** tất cả sáu địa điểm nằm trong một khuôn viên đại học.
Phố là dãy dịch vụ sinh viên nội khu, vườn/kênh là cảnh quan của trường và
cổng là khu đón tiếp phía trong. Mọi lần tạo/chỉnh asset dùng phần 18.6 art
guide và [hợp đồng kết nối](world-connections.md); không tạo sáu tranh rời.

Art guide: [hen-o-giang-nam-art-style-guide-v0.3.md](hen-o-giang-nam-art-style-guide-v0.3.md), SHA-256 `c405b97a302d949f15ca01756c3b10875aecf8dc5c103ebd84ac13ac8ba432b0`.

Người dùng giữ hướng hình ảnh nhà ăn và yêu cầu thêm NPC. Sau bản nhà ăn có NPC, người dùng yêu cầu chuyển sang khu tiếp theo và sẽ bổ sung nhà ăn sau. Các mẫu khu mới ở đây là nghiên cứu hình ảnh riêng, chưa tích hợp runtime và chưa thay tiêu chí/trạng thái phiếu nhà ăn `01M7CF7RN745T2FTG6AXP6RM58`.

Khu tiếp theo được chọn là **phố cửa hàng · bưu kiện**, nối ngay sau nhà ăn trong tuyến hiện có. Dùng mẫu nhà ăn làm reference phong cách và art guide làm brief; không sao chép mặt tiền hoặc cơ chế từ game tham khảo.

Xem [mẫu phố hiện tại](street/visual-target-2/generated.png) và [ghi chú khu phố](street/README.md).

Người dùng bổ sung: đi tới cạnh màn hình thì sang khu mới, vì vậy từng khu phải có lối đi thật nối tới khu lân cận. Thiết kế từ đây dùng [hợp đồng kết nối](world-connections.md) để tránh vẽ sáu ảnh rời không khớp lối ra.

[Dữ liệu kết nối](world-connections.json) được lấy từ manifest cây chính: 12 exit đối ứng khớp nhau, dải đường đề xuất không đè lên collider của cả sáu khu. Đây là kiểm dữ liệu thiết kế, chưa kiểm tranh hoặc hành vi đi qua cạnh trên build.

Reference phong cách lưu tại [references/](references/README.md), để mẫu mới không phụ thuộc việc giữ worktree cũ. Các lần tạo ảnh dùng Codex (local CLI) qua Agent Sprite Forge commit `25203d03900b46b444bdd72a75768c33d1895ad6`; log/receipt ở `forge-runtime/.forge` và cạnh mỗi ảnh. Không cài skill toàn cục.

**Việc hoãn theo phản hồi mới:** mép đường/viền lát và đoạn nối vào kiến trúc còn cứng. Người dùng muốn hoàn thành mẫu các khu còn lại trước rồi chỉnh đồng bộ; dùng ảnh auto-tiles mới trong references để tham khảo. Không xem phần này là đã nghiệm thu, và chưa sửa lại mẫu phố trong lượt ghi nhận.

Mẫu tiếp theo đã bắt đầu ở [vườn ven kênh](garden/README.md); giữ nguyên quy tắc nối phố ở mép trái và ký túc xá ở mép phải.

Feedback mới được chuyển thành [hợp đồng layout v0.3](environment-layout-contract-v0.3.md) và hai blockout trước trang trí: [vườn](garden/layout-blockout.svg), [phố](street/layout-blockout.svg). Các blockout trả lời trước ba câu: người chơi đứng ở đâu, đi được tới đâu, và vì sao công trình nằm ở đó.

Feedback camera/công năng mới được ghi ở [environment-art-review-v0.3-feedback](environment-art-review-v0.3-feedback.md). Hai concept v0.3 chưa duyệt; cần một vòng chỉnh camera/layout trước khi xem xét asset.

Đã tạo bản chỉnh layout theo blockout: [vườn v0.3](garden/visual-target-v03-1/generated.png) và [phố v0.3](street/visual-target-v03-1/generated.png). Cả hai chỉ là visual study; chưa thay asset runtime hoặc tiêu chí Bint.
