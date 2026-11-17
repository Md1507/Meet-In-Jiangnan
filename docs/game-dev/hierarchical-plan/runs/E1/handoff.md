# E1 — handoff, snapshot worktree

HEAD `ab9a13d5020dddf832c0e2db072b3943a3804626`; không có build. `.gitattributes` untracked đã có từ bước chuẩn bị dependency, không thuộc thay đổi E1. C7 và input không sửa. SHA-256 raw:

- `scripts/world-map/asset-schema.mjs`: `8155ddf33929b8f29eb0691ca8b3c46d3a99778487ca3a0bf8297b515440d869`; `tests/world-map-assets.test.mjs`: `8322ffc800cda56955f72f1b9c1af78f03a51dabea79f94aecf1acd59f9d36ee`.
- `contracts/asset-requirements.json`: `2b2be0cc842567b82a27bffae2a0217553f3f0cf0ac62473026e2a7a7e4ebdc4` (thuộc `docs/game-dev/world-map-pipeline`).
- `maps.json`: `08e23f643b455fc135ef23695bbb3e6aca18ae50bb6b54fc03a7371551818a1d`; `ascii-maps.md`: `9c20af8c85e1194b6a7783e073edf41e6a415c89a8b42ba78e48c5e32da70a95` (thuộc `docs/game-dev/campus-network-v1`).
- `C7inputs/shared_asset_manifest.json`: `64bd953a99d1aca1de8686b7ce18d281e1909f90e092d04de4c4d521740d5b0a`; `C7inputs/street-asset-manifest.json`: `739ff9d6535468f7db1fd76312a4389598a03c10d55e04761581d0c767913b6b`. Chúng không khớp hash khóa `c11c66be...` / `b6dde97f...` trong test, dù phiếu cho biết baseline đã restore. Không normalize hoặc đổi hash để che lỗi; orchestrator cần chuẩn bị đúng bytes reviewed và chạy lại regression.
- Loader `9c9bd8c96eb87cc53bb76be88a1f494cfc97781b862b86b2300781ac0a3dc335`; CLI `c66b9eacb676965b04f1ea3bc392509ec274a5bedf0a63fe70c09b804ab8e8ce`; test loader `ca48bb5e855b82b52350f6f6aff3279952417e7603697c8c452b2e5e522b7af9`.

## Cơ chế và kiểm thử

`loadAssets({root, manifest, reference, production})` nhận root tuyệt đối; reference mô tả input maps/ASCII và hash, đơn vị tile, bounds map, metadata theo ID, alpha policy và placement. C7 kiểm schema/CRC/giải nén; E1 kiểm containment trước khi C7 đọc, unfilter alpha thực, so binding/placement và hash input. C6 digest và reference là input do consumer cung cấp từ nguồn tin cậy, không tự chứng minh người duyệt. CLI nhận ROOT MANIFEST REFERENCE; input JSON tương đối root. Entries chỉ xuất khi status ready. Fixture không là production hay phê duyệt C6.

`node --test tests/world-map-asset-loader.test.mjs`: exit 0, 10/10 trên snapshot code/test hash trên. RGB và RGBA 3×3 với filter 0–4 kiểm alpha thực; kiểm alpha policy, missing/hash/bytes/dimension, path và junction thoát root, duplicate từng trường, metadata, variant, license, parity, shared map, placement và CLI thành công/thất bại từ cwd có dấu cách. Lần đầu 8/9 do test giả định helper trả stdout; đã sửa assertion và chạy lại. Reference placement và license vẫn do consumer cung cấp; chưa chứng minh tính đầy đủ production.

`node --test tests/world-map-assets.test.mjs tests/world-map-asset-loader.test.mjs` chạy trước test loader cuối: exit 1, 4/5; test C7 `six-map requirements` lỗi tại `tests/world-map-assets.test.mjs:32` vì shared raw hash trên. Test C7 production và ba test E1 lúc đó qua. Đây là kiểm trực tiếp, không phải kết quả Core verify; sau test loader cuối chưa chạy lại combined. Không có browser, build, visual hoặc human clearance.

## AC và consumer

AC-1 chưa đạt nguyên văn: chưa có thư viện phố/shared production và C6 thật; fixture chỉ chứng minh một phần cơ chế. D1/D2/D3 cung cấp PNG, policy, license và placement thực; E1/E2 phải kiểm lại parity, actual bytes, alpha, anchors, footprint, atlas/variants và provenance trên checkout tích hợp. E3–E8 kiểm layout/camera/actor clearance; E9 kiểm runtime/build, warp/input/save/quest. Không khẳng định Pipeline AC9/10 hoặc G-AC11/13 đạt. AC-2: handoff này ghi snapshot, hash và giới hạn; lịch sử không sửa.

Knowledge: [k:01M7DE8V43RRQF5CG91ESM8A48], [k:01M7DE8TWTP94W08B6Q83D3HV8], [k:01M7DE9PW92SQPTK2C258X2H1E]. Không thêm: CRLF đã có candidate [k:01M7M9A2T3F8ZEF0A79XNV3NY8]; chưa có phát hiện mới khác đủ căn cứ.


Lượt bổ sung: đo lại raw C7inputs đầu lượt vẫn là `64bd953a99d1aca1de8686b7ce18d281e1909f90e092d04de4c4d521740d5b0a` / `739ff9d6535468f7db1fd76312a4389598a03c10d55e04761581d0c767913b6b`, không phải bytes khóa. Không sửa fixtures hoặc attributes; cần orchestrator đối chiếu checkout trước combined verify. Không chạy lại combined hoặc tương đương trong lượt này vì command chưa được xác nhận; kết quả cũ ở trên là lịch sử, không phải Core result cho snapshot mới.

## Cập nhật sau delivery và sửa review 1

Các hash CRLF và trạng thái chờ delivery ở trên là lịch sử trước delivery. Raw SHA-256 hiện tại của `C7inputs/shared_asset_manifest.json` là `c11c66be849e1843997b57e325acf3862041f2bfe46271ff9a1f1b965fb3b359`, và `street-asset-manifest.json` là `b6dde97fb14c09ab977aa9ff0f5e82db2dd43ead9dbc279f4588beb71b612bad`; orchestrator đã chuyển nguyên bytes đã review. Không thay schema/test C7. Core verify-1 chạy command hai test đã xác nhận: exit 0, 12/12, tree `4f85f0379d632b899e9ff12e2a731d72a2d09a92`, trước sửa finding .1; không áp kết quả đó cho code mới.

Finding .1: dùng `isDeepStrictEqual` cho binding và placement, không phụ thuộc thứ tự khóa object, vẫn giữ thứ tự array. Regression parse manifest và reference/placement độc lập, đảo khóa lồng nhau gồm anchor, dimensions và collision.offset; kiểm thay giá trị và thứ tự mảng vẫn báo mismatch. Sau sửa, `node --test tests/world-map-asset-loader.test.mjs` exit 0, 11/11. Raw SHA-256 loader `0fd6d6685be3c946ed8b59db9c6b73d177795a052f7acad4e11bb68e1dc92d8e`, test loader `a22eaafdd4cbea37ff6de28d3de0128ae59c1a695493c045527777d06c89ef17`, CLI `c66b9eacb676965b04f1ea3bc392509ec274a5bedf0a63fe70c09b804ab8e8ce`. Core combined verify sau sửa do Core chạy; chưa có kết quả tại lúc bàn giao này.

Tiêu chí E1 hiện hành nghiệm thu cơ chế fixture, không nghiệm thu thư viện production hay C6 thật. E2 nhận API và trạng thái pending/error, không coi reference fixture là authority. E3 chạy loader trên manifest, placement, PNG phố/shared, license và C6 thực khi được bàn giao; E9 kiểm thư viện sáu map và readiness/runtime trên snapshot cuối. Các kiểm này, human clearance và Pipeline AC9/10, G-AC11/13 toàn hệ thống vẫn pending. Không có build mới.

Knowledge: không thêm mục mới; tình huống raw bytes đã có candidate [k:01M7M9A2T3F8ZEF0A79XNV3NY8], còn phép so object là lỗi đã sửa trong phạm vi này, chưa có phát hiện dự án mới đủ điều kiện.
