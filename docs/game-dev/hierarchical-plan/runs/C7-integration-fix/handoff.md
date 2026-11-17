# C7 — sửa provenance sau land

Baseline worktree `6762212ed13f877298514f736eaba085b5e0628d`; không có build mới. Log Core của tác vụ C7 `01M7JGEJRKKR7TMBKF5HN658D0/logs/verify-4.log` ghi `node --test tests/world-map-assets.test.mjs` thất bại 1/2 tại phép so SHA-256 shared: actual `64bd953a99d1aca1de8686b7ce18d281e1909f90e092d04de4c4d521740d5b0a`, expected `c11c66be849e1843997b57e325acf3862041f2bfe46271ff9a1f1b965fb3b359`. Handoff C7 ghi hash nguồn đã review của cả hai input. Không sửa handoff hoặc kết quả review cũ.

## Phụ thuộc và phạm vi

| Đầu vào / consumer | Evidence và giả định | Việc độc lập / kiểm còn lại |
| --- | --- | --- |
| Hai input C7 và test provenance | Blob baseline có đúng hai hash đã review; test đọc byte trực tiếp. `core.autocrlf=true` trong worktree. | Khôi phục blob và kiểm checkout độc lập; Core verify snapshot và sau land còn pending. |
| C7 review và handoff | Handoff C7 ghi hai hash; verify-4 là lỗi tích hợp sau land. | Giữ nguyên lịch sử và findings. Không cần thay contract hoặc gameplay. |
| Core land và verify | Chưa land, lệnh verify phiếu chưa được xác nhận. | Core cần chạy verify được xác nhận trên snapshot và kiểm lại sau land; checkout thử không chứng minh land thực. |

Ba đường dẫn requirement.md, plan.md, tasks.md do `bint task show` chỉ tới không tồn tại trong runtime của phiếu này; nội dung phiếu, handoff C7 và verify-4 là đầu vào hiện có.

## Byte và kiểm chứng

Trước sửa, working tree shared có 362 CRLF, SHA-256 `64bd953a99d1aca1de8686b7ce18d281e1909f90e092d04de4c4d521740d5b0a`; street có 194 CRLF, SHA-256 `739ff9d6535468f7db1fd76312a4389598a03c10d55e04761581d0c767913b6b`. Cả hai blob HEAD không có CRLF và khớp hash C7. Sai khác này và `core.autocrlf=true` xác nhận chuyển dòng khi checkout là nguyên nhân trong môi trường này; verify-4 dừng ở shared nên không chứng minh một assertion street riêng đã chạy.

Đã lấy byte trực tiếp từ blob HEAD đã đối chiếu hash, không nhập executable hoặc thay source ID. `.gitattributes` đặt `-text` riêng cho hai đường dẫn fixture, ngăn chuyển đổi dòng ở Git. `git check-attr text` trả `unset` cho cả hai và `unspecified` cho `asset-requirements.json` lân cận. Hash thực sau khôi phục:

| Fixture | SHA-256 |
| --- | --- |
| shared_asset_manifest.json | `c11c66be849e1843997b57e325acf3862041f2bfe46271ff9a1f1b965fb3b359` |
| street-asset-manifest.json | `b6dde97fb14c09ab977aa9ff0f5e82db2dd43ead9dbc279f4588beb71b612bad` |

Một repository tạm được `git init`, đặt `core.autocrlf=true`, `git add` attributes và hai fixture, rồi `git checkout-index --all --prefix=<thư mục tạm>`: hash checkout lần lượt đúng như bảng, cả hai có 0 CRLF. Đây là thử nghiệm add/checkout qua index Git, không phải land thật hoặc verify Core. `git hash-object` của hai fixture khớp object HEAD tương ứng `d5d1255cc399ecce9104be79029d51dfff6002bb` và `c6f734c27709b4befeb962b57b136b4d00267af1`.

`node --test --test-name-pattern='six-map requirements' tests/world-map-assets.test.mjs`: PASS 1/1 trên worktree sau sửa, bao gồm so hash raw của hai input. Không sửa test hoặc expected hash. Lệnh đầy đủ của phiếu chưa được xác nhận, Core verify snapshot và verify sau land đều **pending**; không suy PASS sau land từ checkout thử. Attributes không tự viết lại file CRLF đã tồn tại: vì hai blob đã giống HEAD, land có thể chỉ đưa attributes mà không checkout lại fixture. Core cần kiểm hash raw ở cây đích sau land và khôi phục checkout từ blob với attributes có hiệu lực nếu cần, rồi chạy verify được xác nhận. Không chạy build, renderer hay gameplay.
