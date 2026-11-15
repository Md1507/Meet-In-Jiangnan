# M4 technical preparation — bàn giao vòng sửa

Phiếu `01M7C38XW37C4G9BP5073EG01M`, ngày 14/11/2026. Người dùng đã
cho phép sửa trực tiếp và xác nhận verify; không yêu cầu approve lại.
Theo đính chính người dùng, dependency `01M7A5E5VAK7KM5VWYPMF6T3GC` bị
đánh dấu done do nhầm sau xử lý conflict land. Core 42/42/review 6 chỉ thuộc
tree `3c2c7953f8fb020dac885230d2d4b55b38273306`, không xác nhận merge mới.
Giữ lịch sử và tiếp tục kiểm trong phiếu này; không reopen dependency.

Verify Core mới `2026-11-14T05:41:47Z`, `logs/verify-2.log`: exit 0,
**52/52 PASS**, tree `fbed6da8f17fda5113fe9d861726e353575dfed1`.
Đã build rồi kiểm smoke sau merge, runner/capture và Windows/native logging.
Bint hiện ghi AC-1,3,4,6,7,8 met; AC-2,5 unmet. Verify này thuộc snapshot
trước các sửa bên dưới; cần verify lại bản cuối. Không coi nó là verify:mvp.

| AC / TSK | Bằng chứng và phần còn chờ |
| --- | --- |
| 1 / 1,15 | Verify hẹp build trước bốn suite chạy tuần tự, kiểm conflict/smoke/revision. 52/52 đã đạt; cập nhật sau sửa còn chờ Core verify. |
| 2 / 2,11 | Capture đã chạy đủ năm tuyến, 602 request, captureErrors rỗng. Đã sửa nhận diện header Service-Worker:script và Referer rỗng; request khác vẫn bị kiểm. Favicon mặc định chưa có trong snapshot cũ: giữ full trace rejected và tạo fixture tĩnh cho lượt mới, không lọc trace. Còn chờ lượt capture ngắn sau sửa. |
| 3 / 3,12 | Met từ report người dùng revision 2f769d7f: 6/6 required faults passed, mỗi row có injection/error/retry/fallback và progressPreserved=true trên cùng context/save. Không coi injected GPU loss là thao tác thiết bị thật. |
| 4 / 4,13 | Met cùng report: arrival hoàn tất offline; export/import toàn state, import sai schema, backup rollback và xóa model cache đều passed. exactBackupData=true, không mất tiến độ. |
| 5 / 8 | Report đã có inference cold thật và RSS peak 6185639936 bytes, metadata máy/Edge 157.0.4341.57. Sửa phép cộng nhầm helper WASM: gói chơi thực 7547614 bytes, AI 682947939 bytes, đều dưới 30/800 MiB; chưa có output runner mới sau sửa. Warmup2/mẫu12 có profile/test; p95 cũ 3+20 trên worker/manifest/máy/browser tương thích giữ revision gốc, không coi cold đơn lẻ là p95. FPS nguồn đã đạt, không đo lại; referenceMachine tổng vẫn pending. |
| 6 / 9 | Inventory kiểm mọi alias revision/commit/manifest, bắt mâu thuẫn (.9), stale/missing/hash/provenance; Core verify đã chạy. Report phiên mới có sidecar; lịch sử giữ nguyên byte. |
| 7 / 6,7,14 | [Worksheet](../review-kit/m4-content-worksheet.md) và collector có checklist/quyền/nhãn/phân bố/độc lập prompt. Thiếu dữ liệu/người thì readiness fail/pending. Mic/IME/người rà/corpus/playtest thật chưa thực hiện. Collector sáu speaker khác gate nguồn ba speaker được giữ rõ, không đổi ngưỡng. |
| 8 / 5,10,15 | Mapping TSK-1..15 đã khớp. [Art no-op](m4-art-handoff.md), cảnh MVP là tham chiếu tạm. Tách preparation với nghiệm thu tổng; không tự approve/land/đóng gate. |

## Sửa tối thiểu ở vòng này

- `diagnostic-faults.mjs` và `synthetic-chapter-audio.mjs`: dùng tín hiệu
  `chapter-near` để tới NPC thay giữ phím cố định 650 ms; luôn nhả phím khi
  timeout. Selector chuyển cảnh tính tiền tố mũi tên, chủ đề tính suffix guidance.
- `bench-browser-ai.mjs --offline-only`: chạy quest/save/rollback/UI bằng runner
  hiện có, không inference/model faults/FPS/sampler. Coverage năm tuyến vẫn pending;
  exit 0 của chế độ này chỉ xác nhận phần offline/save được yêu cầu.
- Fault hash dùng `route.fetch({maxRetries:0,maxRedirects:0})`: không để retry hoặc
  redirect thay request đang dùng làm bằng chứng injection.
- `serve-built.mjs` tự tìm OpenSSL trong PATH hoặc Git for Windows; có override
  `BINT_OPENSSL`, không đổi PATH/global config. Lỗi khởi chạy giữ executable và
  `result.error` thay `undefined`; dọn thư mục chứng thư khi setup thất bại.
- `diagnostic-build.mjs` đo gói sản phẩm từ offline manifest đã kiểm hash trước
  khi build helper, giữ nguyên ngưỡng; xuất riêng productBundles. Favicon ICO
  trong dist chỉ là fixture diagnostic, vẫn nằm trong snapshot/capture; không
  đổi public asset hay thêm ngoại lệ URL vào validator.
- Validator chỉ nhận đúng Service-Worker:script và Referer rỗng không chứa dữ liệu;
  vẫn từ chối payload trong header, query, POST, URL ngoài origin/asset list.
- Provision nguyên byte 25 asset pinned từ cây gốc; phục hồi hai license bị khác
  bytes checkout từ đúng bản gốc/hash manifest. `node scripts/models.mjs` exit 0.
  Không đổi model, dtype, prompt, sản phẩm hoặc license nội dung.

Tham khảo [Playwright auto-waiting](https://playwright.dev/docs/actionability),
[route.fetch](https://playwright.dev/docs/api/class-route#route-fetch) và
[service worker](https://playwright.dev/docs/service-workers). Chờ điều kiện thật,
không fake clock cho FPS và không block service worker trong kiểm offline.
MCP context_for_paths trả 0 mục tri thức.

Đã kiểm cú pháp các script sửa; M4 unit **12/12 PASS**, MVP evidence regression
**19/19 PASS**, gồm chống payload/URL lạ và byte/hash mismatch ở bundle manifest.
Đây là unit/adapter, chưa phải bằng chứng chạy quest/fault/model thật.
Lượt `--offline-only` trong phiên agent dừng trước build do `spawnSync node.exe EPERM`:
[report lỗi](../evidence/task-01M7C38XW37C4G9BP5073EG01M/1794637386599-01e2d61f-a28d-4935-a973-8bf5569e29fc.json).
Không có browser/model/FPS chạy ở lượt đó. Bint diff vẫn bị chặn ghi Git object
ở `D:/Project/Game/.git/objects`; không đổi ACL, shell/global config hoặc lách sandbox.

Lượt người dùng `1794638224372-95fa957d-db1a-4a3a-940a-16eb2dc92999.json`
đã build thành công và source stable, nhưng dừng trước browser ở OpenSSL.
Sau sửa đã xác nhận resolver tìm bản Git 3.2.3 khi PATH không chứa OpenSSL,
tạo chứng thư bằng binary thật và kiểm SAN localhost/127.0.0.1. Edge/Chromium,
Python và psutil 7.2.2 đều sẵn có. Chưa coi kiểm chứng thư là lượt tích hợp đạt;
cần chạy lại đúng lệnh bên dưới trong PowerShell thường.

Lượt người dùng mới [1794638623212-0a2d5d7d-954a-41ae-b189-825e3dcad1dd.json](../evidence/task-01M7C38XW37C4G9BP5073EG01M/1794638623212-0a2d5d7d-954a-41ae-b189-825e3dcad1dd.json)
có hash `dcb4feb324bf73175772c474061e5360a0e8b938ff7ec2e41ea7af29afcb86a1`,
source stable; fault/offline/save passed như bảng trên. Tổng exit1 do validator
và phép cộng bundle, không phải lỗi inference hay save. [Phân tích riêng](../evidence/task-01M7C38XW37C4G9BP5073EG01M/privacy-bundle-analysis-1794639313701.json)
giữ nguyên report gốc: 129 input sản phẩm không đổi; 600 request ngoài favicon
qua validator sau sửa, nhưng toàn bộ trace cũ vẫn rejected vì favicon chưa phát hành.
Không bỏ hai request đó để đổi kết quả. Header Service-Worker đối chiếu
[đặc tả W3C](https://w3c.github.io/ServiceWorker/#service-worker-request-header);
favicon mặc định đối chiếu [HTML Standard](https://html.spec.whatwg.org/multipage/links.html#rel-icon).

[Đối chiếu benchmark](../evidence/task-01M7C38XW37C4G9BP5073EG01M/model-benchmark-compatibility-1794637443425.json):
127 input sản phẩm được đối chiếu hash; chỉ app/content chapter khác lịch sử;
worker và manifest trùng. p95 cũ ASR 3695.39 ms, LLM 6105.65 ms, 3 warm-up +
20 mẫu; không đổi chúng thành kết quả revision mới hoặc fault proof mới.
[FPS nguồn](../evidence/task-01M7C38XW37C4G9BP5073EG01M/fps-inherited-reference.json)
giữ median 60.006 FPS/60014.265 ms/10 NPC ở revision `be31d2e`.

## Bước tiếp theo

Chạy trong PowerShell thông thường tại worktree này, nơi Core verify trước đã chạy
thành công. Chỉ chạy capture ngắn; fault/offline/save đã có kết quả, không lặp:

```powershell
node scripts/bench-browser-ai.mjs --m4-smoke
if ($LASTEXITCODE -eq 0) { bint task verify 01M7C38XW37C4G9BP5073EG01M --json }
```

Nếu cần khoanh riêng lỗi quest/save, dùng `--offline-only` thay các flag trên;
không coi output đó đã phủ AC-2/3/5. Report mặc định dùng tên mới có timestamp/UUID,
không ghi đè lịch sử. Đối chiếu report mới trước khi cập nhật AC hoặc resume;
resume ở checkpoint review không tự chạy bù verify.

Năm gate nguồn còn pending: corpus60Text40Audio, referenceMachine, realImeAndMic,
humanReview, m4. Giữ text24/30, FP<=3/30, tổng51/60; audio16/24, sai<=2/8,
nhiễu0/8; ASR18s/LLM14s và warm-up2/mẫu12. TTS/FLEURS/oscillator chỉ diagnostic,
không thay corpus/người rà/mic thật; không lưu/upload audio riêng tư. Chưa nghiệm thu MVP.
