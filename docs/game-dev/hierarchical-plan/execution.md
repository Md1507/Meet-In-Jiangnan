# Cách thực hiện từng task nhỏ

## Quan hệ trong Bint

`parent_id` gom task thành cây; nó không làm cha tự chờ con. Kế hoạch đặt `depends_on` từ từng nhóm tới toàn bộ task lá của nhóm, và từ ROOT tới8nhóm. H8 phụ thuộc các nhóm A–G cùng các task nghiệm thu trước đó. Dependency giữa task lá là cạnh riêng, không suy từ thứ tự tên. Không có task lá phụ thuộc cha của chính nó.

## Quy trình một lượt

1. Chọn đúng một task lá có mọi dependency done trong Bint và source phụ thuộc đã tích hợp. ROOT và A–H chỉ là phiếu tổng hợp; không chạy implementation cho các phiếu đó.
2. Đọc requirement/plan/tasks đã viết của task và live task show. Task b-do có classification.plan=false: đã lập kế hoạch trước, không gọi b-req lại mỗi lượt. File test/lệnh verify mới nêu trong task sẽ được tạo đúng scope trước cổng verify.
3. Tạo worktree từ baseline mới sau dependencies, dùng implement/review đúng phạm vi. Thiếu source donor không được xử lý bằng absolute import; giải quyết dependency trước.
4. Kiểm hẹp phù hợp qua cổng Core; xác nhận lệnh của phiếu cũ không chuyển tự động sang phiếu mới. Gate thủ công cần OS IME, mic, ngườirà hoặc userplaytest thật, shell không thay thế.
5. Đối chiếu các AC nội bộ bằng evidence đúng snapshot, bàn giao patch và land từng task qua Core khi đủ điều kiện. Ghi pending/stale/deferred nếu thiếu; không force done.
6. Sau land, kiểm tích hợp có liên quan trên snapshot mới; chỉ task phụ thuộc liên quan mới phải chờ. Nếu sửa H7 làm stale một phép đo H1..H5 thì tái kiểm phần bị ảnh hưởng trước H8.

## Thứ tự gợi ý

Mỗi hàng chỉ trình bày đợt; dấu / hoặc ; không cấp phép chạy đồng thời, dependency thật ở tasks.json/Bint.

| Đợt | Các task | Mục đích |
| --- | --- | --- |
| 1 | A1 | Kiểm kê nguồn duy nhất trước khi tạo checkout triển khai. |
| 2 | A2→A3→A4; C1→C2→C3→C4→C5 | Baseline tích hợp và data terrain có các tuyến độc lập; mặc định làm tuần tự từng phiếu. |
| 3 | B1→B2/B3/B4→B5; F1; G1 | Khép runtime; audit nội dung và model tái dùng phần đã xong. |
| 4 | C6→C7 | Packet conversion/clearance cụ thể và duyệt thay đổi thật sự trước final-art. |
| 5 | D1; D2; D3; D9; D10; F2→F3/F4; G2→G3/G4→G5/G6 | Phố trước, shared terrain/props, nội dung/font/audio và AI theo dependency trong phiếu. |
| 6 | D4;D5;D6;D7;D8; E1→E2 | Mỗi bộ công trình một phiếu, renderer dùng chung. |
| 7 | E3;E4;E5;E6;E7;E8→E9 | Ghép từng map và nối runtime sau khi đủ sáu map/actor/UI. |
| 8 | H1;H2;H3;H4;H5→H6→H7; F5 | Packet thiết bị thật, trace/offline, máy chuẩn, regression và playtest phần mới; người rà không chặn art/data trước đó. |
| 9 | H8; đóng H và ROOT | Tổng hợp full closure sau đủ mọi dependency. Bản ứng viên vẫn bàn giao được trước F5/corpus nếu giữ deferred trung thực. |

## Lệnh xem và bắt đầu

`bint task ready --parent 01M7JGEDRBMFT0FV3YJPNC85MV --json` xem con trực tiếp sẵn sàng nhómA. Lặp với ID các nhóm khác; ready của ROOT chủ yếu là phiếu tổng hợp, không phải toàn bộ hậu duệ.

Task đầu tiên: A1, `01M7JGEFFSXVZM0R97HS8B159C`. Xem: `bint task show 01M7JGEFFSXVZM0R97HS8B159C`. Khi người dùng yêu cầu triển khai: `bint run b-do --task 01M7JGEFFSXVZM0R97HS8B159C --json`. Không chạy ví dụ này trong lượt lập kế hoạch. Mọi task lá đã có workflow b-do/không plan lại và worktree riêng; không cần tạo thêm task cho cùng việc.

## Gate và thay đổi kế hoạch

C6 phải duyệt conversion/clearance nếu contract thay đổi; D1..D8 không được vượt gate. F5/G4/H1/H2/H6 cần người/dữ liệu thật ở phần tương ứng; giữ pending và vẫn làm task độc lập. Việc user cho hoãn người rà/corpus sau MVP tiếp tục có hiệu lực; không mở lại chấp nhận TSK-29. Fullclosure H8 vẫn chờ đủ bằng chứng.

Phát hiện mới làm thay đổi phạm vi: cập nhật đúng phiếu lá/AC/dependency với lý do và lint lại, không biến quy trình thành plan nối tiếp từng lượt. Phiếu cũ được giữ nguyên lịch sử và không chạy đồng thời với phiếu mới cùng sở hữu file. Không huỷ hoặc reparent phiếu cũ vì CLI task set hiện không có cờ parent; cây mới chỉ tham chiếu nguồn.
