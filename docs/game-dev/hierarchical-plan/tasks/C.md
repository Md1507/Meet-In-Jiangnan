# Yêu cầu — C: Terrain, Dual-Grid và hợp đồng không gian

Phiếu: 01M7JGEE67FZHK5A1W7E6TSJ6J. Loại: group. Cha: 01M7JF6C7ESFJSP30JNK5QM01B.

## Mục tiêu và phạm vi
Dữ liệu sáu map trước; display terrain và full actor clearance trước final art.

Phạm vi ghi: `docs/game-dev/hierarchical-plan/**`. Nguồn: 01M7DE19CK6RBTTHB1TWVQY2ZS AC1..8; 01M7FYN3NA9M6SGQCXF917ZD10 AC1/2; Dual-Grid AC3/4; campus port/arrival; Dual-Grid AC5/6; Dual-Grid AC7/8/9; Street finding .12; campus AC2/4/8; [k:01M7DE9PM7AGR97AHC45J63GNW]; Pipeline AC5/9/10; street manifest và Dual-Grid requirements. Ánh xạ hợp đồng game gốc: G-AC1, G-AC11, G-AC13; số AC của phiếu này là độc lập.

## Yêu cầu chức năng
1. Mọi task lá của nhóm C hoàn tất theo tiêu chí riêng; không có task con đang làm, bị chặn hoặc chưa có bằng chứng mà phiếu nhóm được đóng.
2. Có bảng tổng hợp nhóm C liên kết source/build hoặc hash đầu vào, dependency đã tích hợp và bằng chứng từng task; mọi gate chưa đủ điều kiện được giữ mở, không sửa evidence lịch sử.
3. Dependency bắt buộc trước thực thi: C1 (01M7JGEHEY5Y1MB253HBZSW5NH), C2 (01M7JGEHP0ARF9FZM5RJ9KKM82), C3 (01M7JGEHWWVBN1YHAQ4EA5H92Z), C4 (01M7JGEJ3QZ9KY8998VP1QWE2V), C5 (01M7JGEJAPKMBMPT65MZD09PKG), C6 (01M7JGEJHJ3AH22K3384TP7DGW), C7 (01M7JGEJRKKR7TMBKF5HN658D0).

## Tiêu chí chấp nhận
- [ ] AC-1: Mọi task lá của nhóm C hoàn tất theo tiêu chí riêng; không có task con đang làm, bị chặn hoặc chưa có bằng chứng mà phiếu nhóm được đóng.
- [ ] AC-2: Có bảng tổng hợp nhóm C liên kết source/build hoặc hash đầu vào, dependency đã tích hợp và bằng chứng từng task; mọi gate chưa đủ điều kiện được giữ mở, không sửa evidence lịch sử.

## Ngoài phạm vi
Thực thi sản phẩm trực tiếp trên phiếu tổng hợp; phiếu này điều phối các phiếu con có scope riêng.

## Câu hỏi mở
Không có câu hỏi cản trở lập kế hoạch. Điều kiện đầu vào hoặc gate đã được ghi thành dependency và tiêu chí của task tương ứng; chưa đáp ứng thì giữ pending, không mặc định đã duyệt.

---

# Kế hoạch — C: Terrain, Dual-Grid và hợp đồng không gian

## Nguồn và hiện trạng
01M7DE19CK6RBTTHB1TWVQY2ZS AC1..8; 01M7FYN3NA9M6SGQCXF917ZD10 AC1/2; Dual-Grid AC3/4; campus port/arrival; Dual-Grid AC5/6; Dual-Grid AC7/8/9; Street finding .12; campus AC2/4/8; [k:01M7DE9PM7AGR97AHC45J63GNW]; Pipeline AC5/9/10; street manifest và Dual-Grid requirements. Đã đọc hợp đồng MVP, báo cáo hoàn thành/TSK-30, task show của 14 phiếu nguồn và các plan pipeline/Dual-Grid. Source-snapshot.json ghi trạng thái lúc lập, không là build/test mới. MVP TSK-29 đã chấp nhận; Pinyin và M4 technical preparation đã done; campus/pipeline/street còn phần chưa tích hợp.

## Hướng triển khai và lựa chọn
Dữ liệu sáu map trước; display terrain và full actor clearance trước final art.

Chọn tái sử dụng và khép khoảng thiếu theo task nhỏ đã lập thay vì dựng lại subsystem hoặc chạy cả phiếu lớn. Phiếu tổng hợp chỉ tổng hợp bằng chứng của các con; implement diễn ra ở task lá.

## Giả định và mâu thuẫn
Phiếu done không đồng nghĩa toàn bộ module đã có trong checkout thực. Runtime campus có contract tile48world-unit/world960x720/viewport960x540; terrain16px và expansion2 trước đây là ứng viên offline. C6 phải giải quyết mapping và clearance, không được đồng nhất các đơn vị hoặc tự coi scale/layout mới đã duyệt. Corpus, IME/mic và người rà còn gate riêng; hoãn sau MVP không phải đã đạt toàn bộ AC.

## Phụ thuộc và thứ tự
C1 (01M7JGEHEY5Y1MB253HBZSW5NH), C2 (01M7JGEHP0ARF9FZM5RJ9KKM82), C3 (01M7JGEHWWVBN1YHAQ4EA5H92Z), C4 (01M7JGEJ3QZ9KY8998VP1QWE2V), C5 (01M7JGEJAPKMBMPT65MZD09PKG), C6 (01M7JGEJHJ3AH22K3384TP7DGW), C7 (01M7JGEJRKKR7TMBKF5HN658D0)

Không chạy b-do/game-dev cho cả nhóm; chọn task lá sẵn sàng từ bảng điều phối.

## Khu vực sửa và vùng ảnh hưởng
`docs/game-dev/hierarchical-plan/**`. Liên quan G-AC1, G-AC11, G-AC13. Bản export tài liệu và metadata điều phối là đầu ra trực tiếp; scope sản phẩm nằm trong từng phiếu lá.

## Bước và trách nhiệm
| Bước | TSK | Đầu ra | Phụ thuộc | Bằng chứng |
| --- | --- | --- | --- | --- |
| Điều phối | TSK-1 | Terrain, Dual-Grid và hợp đồng không gian | dependency của phiếu | tiêu chí AC-1 |
| Tổng hợp | TSK-2 | bàn giao đúng snapshot | đầu ra trước | report/protocol thủ công hoặc evidence task con |

Không giả làm workflow implementation; dependencies ngăn đóng phiếu tổng hợp sớm.

## Rủi ro và rollback
Rủi ro: thiếu dependency trong patch, metadata/hash lệch bytes, clearance chỉ tính điểm, callback cũ hoặc report nhầm snapshot. Kiểm theo tiêu chí task và validators thực; fail/pending không được đổi thành pass. Giữ baseline và patch riêng; rollback đúng patch/asset hoặc chọn semantic fallback, không reset cây chung/xóa tiến độ/hạ ngưỡng.

## Chiến lược kiểm chứng
Không có lệnh sản phẩm cho phiếu tổng hợp. Chỉ đánh giá tiêu chí khi mọi dependency done; tổng hợp evidence từng phiếu con.

Gate cần người thật chỉ được đóng từ protocol đã làm. Lượt lập kế hoạch chỉ chạy task lint và kiểm cấu trúc dependency; không chạy product tests, inference, benchmark, browser hoặc tự phát hành.

## Checklist nhất quán
AC-1 được TSK-1 bao phủ, điều kiện xong khớp nguyên văn. AC-2 được TSK-2 bao phủ, điều kiện xong khớp nguyên văn. Scope có đủ các tệp nêu ở trên. Mọi dependency có ID thật. Trạng thái planned chỉ chứng minh đủ kế hoạch, không là met của tiêu chí.

## Knowledge và MCP
Áp dụng [k:01M7FD5MSA8DHMHTYVMNVCGVBN] cho khép dependency; [k:01M7DE8V43RRQF5CG91ESM8A48] cho provenance; [k:01M7DE9PW92SQPTK2C258X2H1E] cho kế thừa MVP/gate; [k:01M7DE9NXV29H337BAG6GCG5SE] cho AI; [k:01M7DE9PM7AGR97AHC45J63GNW] cho layout trước art. Không thêm knowledge: không có phát hiện mới đủ căn cứ ngoài các mục đã tồn tại; không tạo candidate trùng.
MCP lập kế hoạch: context_for_task/context_for_paths và cite_knowledge đã dùng tại repository gốc. Chưa dùng Codegraph/DeepWiki để xác nhận source/module mới của các task tương lai; thực thi phải dùng checkout thực và ghi công cụ áp dụng/lý do không áp dụng.

---

# Công việc — C

- [ ] TSK-1 [AC-1]: Dữ liệu sáu map trước; display terrain và full actor clearance trước final art. — xong khi: Mọi task lá của nhóm C hoàn tất theo tiêu chí riêng; không có task con đang làm, bị chặn hoặc chưa có bằng chứng mà phiếu nhóm được đóng.
- [ ] TSK-2 [AC-2]: Đối chiếu tiêu chí bằng evidence thực và ghi bàn giao trong scope — xong khi: Có bảng tổng hợp nhóm C liên kết source/build hoặc hash đầu vào, dependency đã tích hợp và bằng chứng từng task; mọi gate chưa đủ điều kiện được giữ mở, không sửa evidence lịch sử.

Các phiếu con: C1 (01M7JGEHEY5Y1MB253HBZSW5NH), C2 (01M7JGEHP0ARF9FZM5RJ9KKM82), C3 (01M7JGEHWWVBN1YHAQ4EA5H92Z), C4 (01M7JGEJ3QZ9KY8998VP1QWE2V), C5 (01M7JGEJAPKMBMPT65MZD09PKG), C6 (01M7JGEJHJ3AH22K3384TP7DGW), C7 (01M7JGEJRKKR7TMBKF5HN658D0). Cha không tự đợi con chỉ nhờ parent_id; depends_on được đặt tường minh.
