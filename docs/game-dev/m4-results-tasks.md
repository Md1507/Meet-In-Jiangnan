# Công việc M4 — technical preparation

Nguồn ánh xạ: TSK-18,19,20,21,22,23,24,29,30 của phiếu
01M78EYZ58EHGP3R83ZKVZ0AVH; TSK-25..28 của lát cắt
01M7AWMZ6C065JP5EHAZABVRFS đã landed và chỉ tái sử dụng. Mỗi TSK có một
bước chịu trách nhiệm chính. Chưa có TSK nào được coi là hoàn thành chỉ vì
evidence lịch sử tồn tại.

## Gameplay

- [x] TSK-1 [AC-1]: (gameplay; nguồn TSK-30/TSK-23) tạo scripts/verify-m4-technical-prep.mjs làm facade cho runner hiện có, quét conflict marker và kiểm source/build/manifest revision — xong khi: fixture độc lập chứng minh status prepared/pending/blocked, exit code đúng, JSON có hash/provenance và không gọi verify:mvp.
- [x] TSK-2 [AC-2]: (gameplay; nguồn TSK-19/TSK-30) nối adapter capture HTTPS để giữ raw URL/header/body cho audio, text, strokes, ASR và LLM — xong khi: contract test bắt upload/ngoài origin/hub/CDN/ASR, thiếu tuyến là pending và attempted/exercised được phân biệt.
- [x] TSK-3 [AC-3]: (gameplay; nguồn TSK-18) tích hợp fault adapter cho GPU device lost, WASM unavailable, mất mạng giữa tải và sai hash model/runtime/WASM — xong khi: mỗi ca ghi injection, lỗi quan sát, retry/fallback, state giữ nguyên và not-run/inconclusive không thành passed.
- [x] TSK-4 [AC-4]: (gameplay; nguồn TSK-18/TSK-23) chuẩn bị runner offline quest, save/export/import và corrupt-save rollback cùng snapshot — xong khi: quest offline hoàn tất, import sai schema bị từ chối, backup hợp lệ khôi phục state và xóa model không xóa save.

## Art

- [x] TSK-5 [AC-8]: (art; no-op theo M4, nguồn TSK-27) rà read-only asset inventory sáu cảnh/NPC/UI và license của lát cắt đã landed — xong khi: bảng ID/path/size/frame/pivot/hitbox/license/nơi dùng có revision, hoặc ghi finding cụ thể; không tạo asset mới khi không có lỗi đọc được.

## Content

- [x] TSK-6 [AC-7]: (content; nguồn TSK-20/TSK-24) chuẩn hóa collector corpus 60 câu/40 audio với speaker ID ẩn danh, nhãn, quyền dùng, phân bố và độc lập prompt — xong khi: validator từ chối thiếu trường hoặc TTS/FLEURS, worksheet giữ pending và không ghi audio riêng tư vào repo/evidence.
- [x] TSK-7 [AC-7]: (content; nguồn TSK-20/TSK-21) tạo worksheet rà nội dung và thao tác OS Pinyin IME/mic thật, gồm composition/Enter, thu/nghe/chép/sửa/thu lại, denied/unplug/codec — xong khi: checklist có browser/IME/mic/build/save/expected/actual/evidence và chưa có người thì status pending.

## Polish

- [x] TSK-8 [AC-5]: (polish; nguồn TSK-22/TSK-24) chuẩn hóa benchmark report cho 10 NPC/60s/FPS, play bundle <=30 MiB, AI <=800 MiB, cold load/init, 2 warm-up + 12 mẫu, p95 và peak memory — xong khi: schema bắt buộc machine/browser/driver/dtype/provenance, thiếu sampler hoặc snapshot chưa đổi ghi pending và không lặp benchmark nặng.
- [x] TSK-9 [AC-6]: (polish; nguồn TSK-30/TSK-23) sinh evidence inventory phiên mới liên kết path/SHA-256/build/source revision/manifest/command/machine — xong khi: stale/mismatch bị phát hiện, report lịch sử được hash read-only và không tệp archive bị sửa.
- [x] TSK-10 [AC-8]: (polish; nguồn TSK-30) lập readiness matrix tách technical preparation, năm gate nguồn còn thiếu và MVP tổng — xong khi: mỗi gate có evidence path/revision hoặc pending reason, giữ nguyên smoke 24/30, FP<=3/30, 51/60, audio16/24/sai<=2/8/nhiễu0/8, p95 18/14s và bundle 30/800 MiB.
- [x] TSK-11 [AC-2]: (polish; nguồn TSK-19) chạy trace HTTPS trên chapter cuối sau merge và liên kết provenance năm tuyến — xong khi: report cùng source/build revision, không upload/ngoài origin/hub/CDN/ASR và thiếu audio/ASR/LLM bị pending.
- [x] TSK-12 [AC-3]: (polish; nguồn TSK-18) đóng gói fault matrix snapshot cuối và liên kết fallback với tiến độ — xong khi: bốn ca bắt buộc có row mới hoặc lý do not-run hành động được, không dùng kết quả dependency cũ thay revision mới.
- [x] TSK-13 [AC-4]: (polish; nguồn TSK-18/TSK-23) tích hợp offline/save evidence vào packet M4 — xong khi: packet có fixture điểm vào, state trước/sau, hash log và đường tiếp tục khi fault; không sửa sản phẩm ngoài scope.
- [x] TSK-14 [AC-7]: (polish; nguồn TSK-20/TSK-21/TSK-24/TSK-29) bàn giao manual collector và playtest packet cho người dùng với build/revision/save/checklist phục hồi — xong khi: evidence cần cung cấp được liệt kê, kết quả chưa thực hiện giữ pending và không tự điền PASS.
- [x] TSK-15 [AC-8]: (polish; nguồn TSK-30) tổng hợp technical-preparation handoff, giới hạn và việc cần người dùng xác nhận — xong khi: tài liệu tách rõ verify hẹp với verify:mvp, không approve/land/đóng gate và mọi pending có owner/next action.

## Review và Bint finalize

Review đối chiếu mọi AC/TSK và scope; Bint Core chạy verify hẹp sau khi người
dùng xác nhận lệnh, rồi review/finalize/land theo trạng thái. Không chạy
verify:mvp, không tự approve hoặc nghiệm thu MVP tổng.


## Bàn giao sau verify-3 — 14/11/2026

TSK được đánh dấu xong ở phạm vi technical preparation/collector/harness. Các thao tác người thật và nghiệm thu MVP tổng vẫn pending; không đánh dấu người rà, playtest, mic/IME hoặc corpus đã thực hiện.

Phụ lục này là trạng thái mới nhất sau docs/game-dev/m4-polish-handoff.md (bản trong tree đã verify ghi trạng thái trước lượt capture cuối). Chỉ cập nhật artifact qua Bint; không sửa tree đã verify hoặc report lịch sử, không chép revision cũ sang snapshot mới.

{
  "recordedAt": "2026-11-14T07:04:43.550Z",
  "kind": "m4-technical-preparation-handoff-not-mvp-acceptance",
  "integration": {
    "path": "docs/evidence/task-01M7C38XW37C4G9BP5073EG01M/1794639513182-47a2f986-6667-4d76-b9a6-cc5bdd87c27f.json",
    "sha256": "e4c3877facb7dde78f195ed32943298d5c244a37fe0ae61b5f761ceb05c365be",
    "revision": "102dcb0a8891449a3f4a206bedbdc202a4d4f820c9799a5f7967d1eda00f3417",
    "exitCode": 0,
    "sourceStable": true,
    "requests": 73,
    "privacy": "prepared",
    "bundles": {
      "playBytes": 7547614,
      "aiBytes": 682947939,
      "playLimitBytes": 31457280,
      "aiLimitBytes": 838860800,
      "withinLimits": true,
      "offlineManifestSha256": "1a9fd935ac76957b48a1f7970bf00270e29e012bef01f7752e315c91198a7d5f",
      "method": "Product offline manifest with verified files plus manifest bytes; pinned AI assets and production worker/WASM. Diagnostic helper assets excluded; limits unchanged."
    },
    "memory": {
      "status": "measured",
      "peakBytes": 6054891520
    },
    "currentLatencyStatus": "cold smoke only; zero warmups/samples in this run, no new p95 claimed"
  },
  "faultAndSave": {
    "path": "docs/evidence/task-01M7C38XW37C4G9BP5073EG01M/1794638623212-0a2d5d7d-954a-41ae-b189-825e3dcad1dd.json",
    "sha256": "dcb4feb324bf73175772c474061e5360a0e8b938ff7ec2e41ea7af29afcb86a1",
    "revision": "2f769d7fe288a664e1ddbcc98502722f331db2dc0811413fd90ad2ef34c157fe",
    "requiredFaults": [
      {
        "id": "gpu-device-lost",
        "status": "passed"
      },
      {
        "id": "wasm-unavailable",
        "status": "passed"
      },
      {
        "id": "download-interrupted",
        "status": "passed"
      },
      {
        "id": "model-hash-mismatch",
        "status": "passed"
      },
      {
        "id": "runtime-hash-mismatch",
        "status": "passed"
      },
      {
        "id": "wasm-hash-mismatch",
        "status": "passed"
      }
    ],
    "offlineSave": [
      {
        "id": "offline-quest",
        "status": "passed"
      },
      {
        "id": "save-import-export",
        "status": "passed"
      },
      {
        "id": "corrupt-save-rollback",
        "status": "passed"
      },
      {
        "id": "clear-model-cache",
        "status": "passed"
      }
    ],
    "sameFaultRunner": true
  },
  "benchmarkReuse": {
    "status": "pending-new-measurement; reuse unchanged AI snapshot for technical preparation",
    "historicalReport": {
      "path": "docs/evidence/task-01M7A5E5VAK7KM5VWYPMF6T3GC/review4-focused/benchmark-fault-audio-final.json",
      "sha256": "9149aa354c3cea5ae93979ef72dffbb168351681e4b3b2756be73b8d4b7fd2e9",
      "revision": "70ddeb78f07a38868841c596c7471e145fccd9996f2561cf00ad72230c8d6c94"
    },
    "checkedAiInputs": [
      "package-lock.json",
      "package.json",
      "src/ai/ModelManager.ts",
      "src/ai/model-manifest.json",
      "src/ai/model.worker.ts",
      "src/audio/pcm.ts",
      "src/audio/recorder.ts"
    ],
    "changedAiInputs": [],
    "sameWorker": true,
    "sameManifest": true,
    "sameCpuRamOsBrowserAndGpuCapabilities": true,
    "sameFixture": true,
    "historicalDriverStatus": "Driver version not recorded in historical report; do not infer it",
    "currentDriver": {
      "Name": "AMD Radeon(TM) Graphics",
      "DriverVersion": "32.0.21043.1005"
    },
    "latency": {
      "asr": {
        "warmups": 3,
        "samples": 20,
        "p95Ms": 3695.390000000596,
        "limitMs": 18000,
        "measuredRevision": "70ddeb78f07a38868841c596c7471e145fccd9996f2561cf00ad72230c8d6c94"
      },
      "llm": {
        "warmups": 3,
        "samples": 20,
        "p95Ms": 6105.6500000003725,
        "limitMs": 14000,
        "measuredRevision": "70ddeb78f07a38868841c596c7471e145fccd9996f2561cf00ad72230c8d6c94"
      }
    },
    "note": "3+20 historical diagnostic measurements exceed the 2+12 minimum; do not relabel them as a new benchmark. Model, dtype, prompt, fixture unchanged. Fresh 2+12 harness profile covered by verify tests; heavy benchmark not repeated."
  },
  "fps": {
    "reference": "docs/evidence/task-01M7C38XW37C4G9BP5073EG01M/fps-inherited-reference.json",
    "source": {
      "path": "docs/evidence/chapter-built-diagnostic.json",
      "sha256": "a3b8b6b2cdd2d8f673aad174c920a2ba40c814921d48c7208d648821154a34de",
      "measuredRevision": "be31d2e65e03a1be196af6b656c2f499daa5cbc902cc019632ac16b83c6c9bef",
      "recordedAt": "2026-11-14T03:36:35.29Z"
    },
    "measurements": {
      "medianFps": 60.006000600056865,
      "durationMs": 60014.26500000001,
      "frameCount": 3521,
      "npcCount": 10,
      "browser": "chromium",
      "browserVersion": "158.0.8127.18",
      "webgl": {
        "vendor": "Google Inc. (AMD)",
        "renderer": "ANGLE (AMD, AMD Radeon(TM) Graphics (0x00001681) Direct3D11 vs_5_0 ps_5_0, D3D11)"
      },
      "machine": {
        "cpu": "AMD Ryzen 7 6800HS Creator Edition",
        "ramGiB": 13.692329406738281,
        "os": "win32 10.0.26300",
        "gpuDrivers": {
          "Name": "AMD Radeon(TM) Graphics",
          "DriverVersion": "32.0.21043.1005"
        }
      }
    },
    "noNewMeasurement": true
  },
  "verification": {
    "at": "2026-11-14T07:00:21Z",
    "command": "node scripts/verify-m4-technical-prep.mjs",
    "log": "C:/Users/LENOVO/AppData/Local/bint/state/Game-fd2129962cbf/runtime/tasks/01M7C38XW37C4G9BP5073EG01M/logs/verify-3.log",
    "logSha256": "44c833acb453b00307b67ad9c3445a8b7dd17e3da3a61b52a5084618860447f1",
    "tree": "c185a7a8f412491f7f335dc817270ab9ada5d6bd",
    "exitCode": 0,
    "passed": 57,
    "failed": 0,
    "skipped": 0
  },
  "parentGatesPending": [
    "corpus60Text40Audio",
    "referenceMachine",
    "realImeAndMic",
    "humanReview",
    "m4"
  ],
  "limits": "Technical preparation complete with bounded historical performance references; no parent gate changed, no verify:mvp, no human/mic/IME/corpus acceptance."
}


## Đồng bộ với phiếu game — 14/11/2026

Theo yêu cầu người dùng, đã đối chiếu kết quả với phiếu 01M78EYZ58EHGP3R83ZKVZ0AVH.
Phiếu kỹ thuật này vẫn done; 8 AC met thuộc phạm vi technical preparation và
Core verify-3 57/57 PASS giữ nguyên. Không sửa lịch sử report hoặc chạy lại model/FPS.

Ánh xạ: T-AC1 sang G-AC13; T-AC2 sang G-AC9; T-AC3 sang G-AC10;
T-AC4 sang G-AC9/12; T-AC5 sang G-AC13/14; T-AC6 sang G-TSK23/30;
T-AC7 sang G-AC5/6/14 và TSK29; T-AC8 sang G-TSK30.
Không đồng nhất số AC giữa hai phiếu.

Phản hồi từ phiếu game: người dùng đã chơi checklist TSK-29 và xác nhận ổn
ở mức MVP; TSK-29 hoàn tất, visual/UI polish để giai đoạn sau. Không còn chờ
playtest chung; không suy ra từng ca mic/IME hoặc người rà tiếng Trung đã đạt.
Bằng chứng: docs/evidence/tsk29-user-playtest.md trên cây gốc.

Bảng liên kết chung: docs/evidence/cross-ticket-sync-01M7C38XW37C4G9BP5073EG01M.md.
Chỉ mục hash/provenance: docs/evidence/cross-ticket-sync.json.
Phiếu game đã đo lại M2/M3 thành công trên revision
335ab90d35dfe7a6f922fd4f86e9c6abf8935d4f69101cc4140414b8dc7a4b3e
do scripts landed làm thay đổi digest. Trace/fault/save
của T đã chạy và có kết quả; gate tổng của G giữ riêng vì revision sản phẩm khác.
Các pending còn lại thuộc gate mic/IME, referenceMachine, corpus/người rà và M4;
không mở lại phần collector/harness của T đã hoàn tất, không yêu cầu playtest lại.
