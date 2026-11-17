# Kế hoạch toàn game — cây task cha con

Lập ngày16/11/2026 theo yêu cầu lập đầy đủ plan trước, thực hiện từng task nhỏ. Phiếu tổng: **01M7JF6C7ESFJSP30JNK5QM01B**. Có **8nhóm,54tasklá,63phiếu** gồm ROOT; tất cả đang planned tại thời điểm xuất. Đây là kế hoạch phát triển tiếp từ MVP đã được người dùng chấp nhận, chưa là báo cáo triển khai.

Giữ game desktop PixiJS/HTML trong bối cảnh đại học Giang Nam2026, chương7ngày/6quest/6NPC; luyện nói, gõ và nét với AI local. Không thêm mobile/multiplayer/cloud/combat/OCR tự do hoặc chấm thanh điệu. Giữ nguyên14AC gốc trong ROOT, bổ sung đích campus/art production và quản lý cây; mọi ngưỡng smoke đã chốt giữ nguyên.

## Tài liệu để dùng

- [Thứ tự và cách chạy từng task](execution.md).
- [Ánh xạ14AC và kết quả kế thừa](acceptance-mapping.md).
- [Phiếu tổng đầy đủ](tasks/ROOT.md).
- [Danh mục máy đọc: ID, cha, dependencies, scope, criteria, verify](tasks.json).
- [Snapshot phiếu nguồn và hash tài liệu lịch sử](source-snapshot.json).
- [Kết quả lint/cycle và thứ tự topo lúc lập](validation.json).

Bint giữ artifact requirement/plan/tasks của từng phiếu làm nguồn thực thi; tasks/*.md là bản xuất để review trong Git. Metadata `planned` ở đây là snapshot, live status/approval đọc từ task show.

## Tám nhóm

| Nhóm | Phiếu cha của task lá | Số task | Mục đích |
| --- | --- | --- | --- |
| [A — Khép baseline và các thay đổi đang có](tasks/A.md) | 01M7JGEDRBMFT0FV3YJPNC85MV | 4 | Giữ thành quả đã có, khép dependency của patch trước khi làm tiếp trên một baseline tự đủ. |
| [B — Hoàn thiện runtime campus v1](tasks/B.md) | 01M7JGEDZ4BW4S4D20X09NF483 | 5 | Tái sử dụng runtime trong phiếu campus; khép coverage cổng, input, collision và save trước art. |
| [C — Terrain, Dual-Grid và hợp đồng không gian](tasks/C.md) | 01M7JGEE67FZHK5A1W7E6TSJ6J | 7 | Dữ liệu sáu map trước; display terrain và full actor clearance trước final art. |
| [D — Sản xuất bộ asset dùng chung và từng khu](tasks/D.md) | 01M7JGEECZDCXCNSJ2VJXFHJ7T | 10 | Asset tách rời từ phố trước, tái sử dụng thư viện chung cho năm khu còn lại và actor/UI. |
| [E — Renderer, ghép từng map và tích hợp](tasks/E.md) | 01M7JGEEKZ2K6QGTG2NP555EFR | 9 | Render từ JSON, manifest và asset thật; ghép từng khu trong một phiếu nhỏ trước khi nối runtime. |
| [F — Nội dung học, font và audio](tasks/F.md) | 01M7JGEEV1G7GFSKSCFM1TT8KB | 5 | Giữ chương đã chơi được; chỉ sửa thiếu sót có audit và giữ người rà ngôn ngữ riêng. |
| [G — AI cục bộ và bộ kiểm chứng](tasks/G.md) | 01M7JGEF24Y6W9R7M982M8PVTC | 6 | Tái dùng manager/worker/harness đã có; kiểm tính toàn vẹn, recovery và corpus độc lập. |
| [H — Kiểm bản tích hợp và nghiệm thu](tasks/H.md) | 01M7JGEF8Y9M6M2FQN9MW59X1E | 8 | Đo đúng build mới; tách thiết bị thật, privacy, hiệu năng, playtest campus và đóng gate đầy đủ. |

## Toàn bộ task lá

| Task | Phiếu Bint | Dependency | Đầu ra | G-AC gốc |
| --- | --- | --- | --- | --- |
| [A1](tasks/A1.md) | 01M7JGEFFSXVZM0R97HS8B159C | Bắt đầu | Kiểm kê baseline, phiếu cũ và bằng chứng kế thừa | 1, 2, 3, 4, 7, 8, 10, 11, 12, 13, 14 |
| [A2](tasks/A2.md) | 01M7JGEFPMHWCA61PXYPKP11NC | A1, OLD_PINYIN | Đối chiếu và tích hợp phần Pinyin/viết tay đã hoàn tất | 4, 6, 7, 8, 12 |
| [A3](tasks/A3.md) | 01M7JGEFXK81Z6FWAD17YZB3SE | A2 | Khép gói patch campus và dependency của nó | 1, 2, 12, 13 |
| [A4](tasks/A4.md) | 01M7JGEG4NZ01DYAHWMWBCJGSG | A3 | Chốt baseline tích hợp và sổ đối chiếu phiếu cũ | 1, 2, 4, 6, 7, 12, 13 |
| [B1](tasks/B1.md) | 01M7JGEGBN0ZC6PB1C5J21VAT1 | A4 | Đối chiếu SceneDefinition, loader và camera campus v1 | 1, 11 |
| [B2](tasks/B2.md) | 01M7JGEGJQ2RC84TD1931P8MWF | B1 | Khép kiểm 40 warp, collider, cầu và NPC ba buổi | 1, 2, 3 |
| [B3](tasks/B3.md) | 01M7JGEGT29WJZBKKZ2BRZ5F1T | B1, B2 | Bổ sung giữ phím qua warp và blur trong runner chính | 1, 6, 10 |
| [B4](tasks/B4.md) | 01M7JGEH11SK7VZ3BDFBES8Y8M | B1, B2 | Kiểm migration save, import và thưởng trên layout v1 | 8, 12 |
| [B5](tasks/B5.md) | 01M7JGEH7TYRQQE5RYYN99PSZS | B2, B3, B4 | Khép hồi quy chapter và packet runtime semantic | 1, 2, 3, 4, 6, 7, 8, 12 |
| [C1](tasks/C1.md) | 01M7JGEHEY5Y1MB253HBZSW5NH | A1 | Đưa baseline parser và terrain sáu map vào gói tự đủ | 1, 11 |
| [C2](tasks/C2.md) | 01M7JGEHP0ARF9FZM5RJ9KKM82 | C1 | Triển khai corner mask và dirty update Dual-Grid | 11 |
| [C3](tasks/C3.md) | 01M7JGEHWWVBN1YHAQ4EA5H92Z | C2 | Xử lý biên, halo, nhiều vật liệu và cầu Dual-Grid | 1, 11 |
| [C4](tasks/C4.md) | 01M7JGEJ3QZ9KY8998VP1QWE2V | C3 | Tạo biến thể terrain ổn định và kiểm seam | 11 |
| [C5](tasks/C5.md) | 01M7JGEJAPKMBMPT65MZD09PKG | C4 | Xuất debug terrain của cả sáu map có provenance | 11, 13 |
| [C6](tasks/C6.md) | 01M7JGEJHJ3AH22K3384TP7DGW | B1, C1, C5 | Chốt conversion art↔world và full actor clearance | 1, 11 |
| [C7](tasks/C7.md) | 01M7JGEJRKKR7TMBKF5HN658D0 | C6 | Chốt schema asset, placement và nhu cầu dùng chung | 11 |
| [D1](tasks/D1.md) | 01M7JGEJZE661T4SF5EMD5WYXS | C7 | Hoàn thiện bộ asset phố và sửa clearance theo contract | 11 |
| [D2](tasks/D2.md) | 01M7JGEK6J09C3ST6A55GCQVVH | C7, C3, C4 | Sản xuất atlas terrain Dual-Grid dùng chung | 11 |
| [D3](tasks/D3.md) | 01M7JGEKDQYNJ34915JZQC9NKS | C7 | Sản xuất vegetation và props dùng chung | 11 |
| [D4](tasks/D4.md) | 01M7JGEKMYNVVH3EM7KPEVKK4S | D1, D2, D3 | Sản xuất bộ công trình Ký túc xá | 11 |
| [D5](tasks/D5.md) | 01M7JGEKW1CCBB7SYHNM6KCXXZ | D1, D2, D3 | Sản xuất bộ công trình Cổng trường | 11 |
| [D6](tasks/D6.md) | 01M7JGEM2ZFXYF39R8NG3N8CJG | D1, D2, D3 | Sản xuất bộ công trình Thư viện | 11 |
| [D7](tasks/D7.md) | 01M7JGEM9V3KNNR9X93QJP3TKG | D1, D2, D3 | Sản xuất bộ công trình Nhà ăn | 11 |
| [D8](tasks/D8.md) | 01M7JGEMH46E3C0EX73140XVQ8 | D1, D2, D3 | Sản xuất bộ công trình Vườn/kênh | 11 |
| [D9](tasks/D9.md) | 01M7JGEMR2W40MBMTP3HJW87DT | B5, C6 | Rà và polish player cùng sáu NPC theo tỷ lệ đã chốt | 1, 11 |
| [D10](tasks/D10.md) | 01M7JGEMYT5EKFZFNMANFHTXWR | B5 | Polish UI học tập, focus và dấu hiệu tương tác | 1, 6, 7, 8, 11 |
| [E1](tasks/E1.md) | 01M7JGEN60AFS7BX0MGZW6Z46G | C7, D1, D2, D3 | Triển khai loader và validator asset manifest | 11, 13 |
| [E2](tasks/E2.md) | 01M7JGENCSCQPQZFXBG61FT5ER | E1 | Triển khai Map Renderer từ JSON và asset thật | 11, 13 |
| [E3](tasks/E3.md) | 01M7JGENKNAFEX8T13MDDZNEZK | E2, D1 | Ghép và kiểm riêng map street | 1, 11 |
| [E4](tasks/E4.md) | 01M7JGENTM7YS6FKJEMRQ711Q1 | E2, D4 | Ghép và kiểm riêng map dorm | 1, 11 |
| [E5](tasks/E5.md) | 01M7JGEP1DYX2ZAE9JJRDZDXA8 | E2, D5 | Ghép và kiểm riêng map gate | 1, 11 |
| [E6](tasks/E6.md) | 01M7JGEP8DBGXME0Y2NA2C6CKA | E2, D6 | Ghép và kiểm riêng map library | 1, 11 |
| [E7](tasks/E7.md) | 01M7JGEPFDN5M065BK9ECQVX1R | E2, D7 | Ghép và kiểm riêng map canteen | 1, 11 |
| [E8](tasks/E8.md) | 01M7JGEPPTS7EFJ4HXFSCSWW4P | E2, D8 | Ghép và kiểm riêng map garden | 1, 11 |
| [E9](tasks/E9.md) | 01M7JGEPXW0BTSNBZ5QZB7TCRF | E3, E4, E5, E6, E7, E8, B5, D9, D10 | Nối sáu map production vào runtime campus | 1, 2, 3, 11, 12 |
| [F1](tasks/F1.md) | 01M7JGEQ4VAHK66HYW9W9V94N5 | A4 | Audit chương, bài học và nhánh hội thoại hiện có | 2, 3, 4, 6, 7, 8, 14 |
| [F2](tasks/F2.md) | 01M7JGEQBPV1KD3S4VTD67N8W2 | F1, B5 | Sửa đúng khoảng thiếu nội dung và phản hồi theo cảnh | 2, 3, 4, 6, 8, 14 |
| [F3](tasks/F3.md) | 01M7JGEQJNSRJRQ408GAS5YK3S | F2 | Đồng bộ glyph font đóng gói với mọi JSON nội dung | 11, 14 |
| [F4](tasks/F4.md) | 01M7JGEQSS9MTD1FPX2N2E1CG8 | F2 | Đồng bộ đúng WAV đổi lời và bảng audio provenance | 5, 11, 14 |
| [F5](tasks/F5.md) | 01M7JGER0FZRQA5HEFPCT7RSPY | F3, F4, G3, G4, G5, G6 | Rà ngôn ngữ và audio bằng người có năng lực tiếng Trung | 14 |
| [G1](tasks/G1.md) | 01M7JGER76FXAPJD2G5EZN5MFD | A4 | Rà tính toàn vẹn weights, runtime và cache trên baseline | 9, 10, 13 |
| [G2](tasks/G2.md) | 01M7JGEREDT3WRNV6FDBCDYV64 | G1, B5 | Khép recovery và session của AI/recorder | 5, 9, 10, 12 |
| [G3](tasks/G3.md) | 01M7JGERPDYM0FW72W38WCT85C | F2 | Chốt corpus 60 câu intent độc lập có nhãn | 4, 14 |
| [G4](tasks/G4.md) | 01M7JGERXCM19ZC6NHKYXZ2RV0 | F2 | Chuẩn bị corpus 40 đoạn audio có nhãn và quyền | 5, 14 |
| [G5](tasks/G5.md) | 01M7JGES444Q9XVXYMSQQ17Q1X | G1, G2, G3 | Đo LLM intent thật bằng corpus đã chốt | 9, 13, 14 |
| [G6](tasks/G6.md) | 01M7JGESAXGHK7KHGZXTYVD938 | G1, G2, G4 | Đo ASR thật bằng corpus audio đã chốt | 5, 9, 13, 14 |
| [H1](tasks/H1.md) | 01M7JGESHRC4ZBZK82F584K3S9 | E9, F3 | Bổ sung smoke Pinyin IME hệ điều hành thật | 6 |
| [H2](tasks/H2.md) | 01M7JGESRGVCKQN0M7G9TM2AZD | E9, G2 | Bổ sung smoke mic thật và ca phục hồi trên chapter | 5 |
| [H3](tasks/H3.md) | 01M7JGESZ64C9GRGX3132RYA6Q | E9, F4, G2 | Kiểm HTTPS privacy, offline và fault trên bản tích hợp | 9, 10, 12 |
| [H4](tasks/H4.md) | 01M7JGET6844HC8ECTCA5WZ7CG | E9, F4, G5, G6 | Đo FPS cùng inference và ngân sách gói thực | 13 |
| [H5](tasks/H5.md) | 01M7JGETD8H9PZYWQFRT8PDWSS | E9, F3, F4, H3 | Chạy hồi quy tổng và kiểm provenance của build ứng viên | 1, 2, 3, 4, 6, 7, 8, 10, 11, 12, 13 |
| [H6](tasks/H6.md) | 01M7JGETM6CNG6ARBYFP7D6RNZ | H5 | Chuẩn bị packet và playtest riêng campus/art mới | 1, 2, 3, 8, 11, 12 |
| [H7](tasks/H7.md) | 01M7JGETVHS2XGEA8Z9DK360F6 | H6 | Sửa lỗi playtest của bản campus/art và chốt ứng viên | 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13 |
| [H8](tasks/H8.md) | 01M7JGEV2F0FH7F9H54810WDAS | A, B, C, D, E, F, G, H1, H2, H3, H4, H5, H7 | Đối chiếu 14 AC và đóng kế hoạch tổng khi đủ bằng chứng | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14 |

## Kế thừa và giới hạn

MVP TSK-29 đã được chấp nhận. Pinyin/viết tay `01M7ENBWCPTCW9G8VJXNCFNDV8`, M4 `01M7C38XW37C4G9BP5073EG01M`, spike và công cụ kỹ thuật đã done; kiểm source trước khi nhận phần thiếu, không dựng lại. Campus `01M7DFRHC8PKN728NQKSS64J82` còn closure/import coverage/input/packet; pipeline `01M7DE19CK6RBTTHB1TWVQY2ZS` đã có data nhưng thiếu production assets/renderer; Dual-Grid `01M7FYN3NA9M6SGQCXF917ZD10` là plan; street `01M7G4A8J4DQ4K797CFQ1MFR3D` có5asset nhưng finding.12 còn clearance. Phiếu hậuMVP nhàăn cũ và smoke flow giữ lịch sử, không resume cả workflow cũ để làm thay cây mới.

Cổng street32px so với collider38px là lỗi đơn vị/clearance cần giải quyết ở C6, không thu collider để hợp asset. Runtime48world-unit và display16px không phải cùng đơn vị. Các giá trị expansion2/scale1.5 chỉ được chốt sau packet/fullbounds và duyệt thay đổi thật.

14phiếu nguồn được kiểm kê trong snapshot; chúng không đổi parent/workflow/status/approval hoặc artifact lịch sử trong lần lập kế hoạch. Bản guide người dùng untracked giữ nguyên. Không chạy product tests, browser, inference, benchmark, phát hành, land hoặc phê duyệt trong lượt này. Gate thiết bị/ngườirà/corpus vẫn pending/deferred đúng phạm vi.

## Knowledge

Áp dụng [k:01M7FD5MSA8DHMHTYVMNVCGVBN] cho khép dependency; [k:01M7DE8V43RRQF5CG91ESM8A48] cho provenance; [k:01M7DE9PW92SQPTK2C258X2H1E] cho kế thừa MVP/gate; [k:01M7DE9NXV29H337BAG6GCG5SE] cho AI; [k:01M7DE9PM7AGR97AHC45J63GNW] cho layout trước art. Không thêm knowledge: không có phát hiện mới đủ căn cứ ngoài các mục đã tồn tại; không tạo candidate trùng.
