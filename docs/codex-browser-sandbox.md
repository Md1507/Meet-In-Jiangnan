# Codex Windows sandbox cho Bint

Trên máy Windows của dự án Game, `.bint/local.yml` truyền `-c 'windows.sandbox="elevated"'` riêng cho harness Codex của Bint. Đây là lựa chọn backend sandbox Windows, không tắt sandbox; cấu hình workspace-write, chính sách approval, phạm vi và model vẫn do cấu hình hiện hành quyết định. Tệp local dành riêng cho máy và không cần sửa cấu hình Codex toàn cục.

## Bằng chứng và kiểm tra

Điều tra của coordinator ngày 2026-11-13 (task `01M7A2RHN2ETT46JFJ8JGVJ8NZ`, `epem-investigation.md` trong runtime task) ghi nhận Node spawn thất bại `EPERM` với unelevated; phép thử sandbox elevated riêng dùng workspace profile chạy Node child trả `42` và Playwright Chromium 158.0.8127.18 mở trang, đọc title thành công. Đây chưa phải bằng chứng của agent Bint mới sau override.

Trong một agent Codex mới do Bint khởi chạy, kiểm tra quyền phiên vẫn là workspace-write và approval never, rồi chạy bằng công cụ thực thi thông thường của agent, không lồng `codex sandbox`:

```powershell
node -e 'const r=require("node:child_process").spawnSync(process.execPath,["-e","console.log(42)"],{encoding:"utf8"}); console.log(r); if(r.status!==0) process.exit(1)'
@'
const http = require('node:http');
const { chromium } = require('playwright');
(async () => {
  let server, browser;
  try {
    server = http.createServer((req, res) => res.end('<title>Sandbox probe</title><body>localhost works</body>'));
    await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const response = await page.goto(`http://127.0.0.1:${server.address().port}/`);
    const result = { version: browser.version(), status: response.status(), title: await page.title(), body: await page.evaluate(() => document.body.textContent) };
    console.log(result);
    if (result.status !== 200 || result.title !== 'Sandbox probe' || result.body !== 'localhost works') process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    if (server?.listening) await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
'@ | node
```

Kết quả trong agent Bint mới, lượt `01M7A31C5XAD267PXQGCT52WF2`, lúc 2026-11-13 09:16:15 UTC: lệnh thực thi thông thường chạy Node v22.17.1 `spawnSync` có `status=0`, stdout `42`; Playwright 1.65.0 khởi chạy Chromium 158.0.8127.18 headless với cấu hình mặc định, mở server HTTP tạm tại `127.0.0.1` port 0, `page.goto` trả 200, title `Sandbox probe`, `page.evaluate` trả `localhost works`. Browser và server được đóng trong `finally`; kết quả **PASS**. Đây là kiểm tra spawn và localhost, không phải bằng chứng model hay thiết bị.

Log lượt chạy ghi `codex exec --json --sandbox workspace-write ... --model gpt-6.1-terra -c "windows.sandbox=\"elevated\""`; thông tin quyền do môi trường cấp cho phiên ghi workspace-write và approval policy never. `bint doctor` xác nhận cấu hình local hợp lệ. Phép thử không dùng sandbox lồng hoặc quyền nâng thêm. Phiên mở trước khi đổi cấu hình không nhận mode mới.

## Rollback

Xóa cặp `-c` và `windows.sandbox="elevated"` khỏi `harnesses.codex.extra_args` trong `.bint/local.yml`, giữ các thiết lập hoặc đối số khác nếu có. Nếu tệp chỉ chứa override này, có thể xóa tệp local. Khởi chạy agent Bint mới để áp dụng lại cấu hình kế thừa; agent đang chạy không đổi mode.

Nguồn: [Windows sandbox](https://learn.chatgpt.com/docs/windows/windows-sandbox), [Codex config reference](https://learn.chatgpt.com/docs/config-file/config-reference).
