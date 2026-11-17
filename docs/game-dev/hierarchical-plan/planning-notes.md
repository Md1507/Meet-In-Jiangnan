# Ghi nhận trong lúc lập kế hoạch

Đây là kết quả kiểm cấu trúc tài liệu, không phải kiểm thử game.

## Strict lint nhận nhầm dấu so sánh là placeholder

Draft G5 dùng cùng một dòng AC/TSK có `>=51/60`, `<=3/30` và `>=12`.
Lệnh thực tế: `bint task lint 01M7JGES444Q9XVXYMSQQ17Q1X --strict --json`.
Lệnh thoát 1 và trả `placeholder_text` cho AC-1 trong requirement.md và TSK-1 trong tasks.md.
Thông báo: `AC-1 còn placeholder (<…>, …, TODO, TBD); viết tiêu chí cụ thể`.
Đã đổi dấu so sánh thành “ít nhất” và “tối đa”, giữ nguyên số và ngưỡng chấp nhận.
Lần lint sau sửa qua; kết quả từng phiếu nằm trong validation.json.
Đã lưu cảnh báo `01M7JGVCD90DSNAVVXBF0ZJVKQ` ở trạng thái candidate, chờ người duyệt.

## Phạm vi các runner được đối chiếu

Runner campus hiện tại chọn cứng packet của phiếu campus cũ và ghi lại manifest.json.
B2 có đầu việc thêm output-dir và truyền cùng gốc tới fixtures/browser trước khi B3–B5 dùng.
Đầu ra mới ghi dưới runs của từng task; dữ liệu nguồn và báo cáo lịch sử giữ nguyên byte.

Entrypoint verify-m4-technical-prep hiện tại chạy preflight và contract tests.
H3 có entrypoint acceptance riêng dùng lại các helper capture/fault/offline để exercise thật.
Preflight thành công không được dùng thay evidence privacy/offline trên build ứng viên.

Chưa chạy các runner sản phẩm, browser hoặc model trong lần lập kế hoạch này.
