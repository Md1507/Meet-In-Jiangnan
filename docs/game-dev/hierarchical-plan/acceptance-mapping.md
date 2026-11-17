# Ánh xạ 14 AC gốc sang cây mới

G-AC dưới đây luôn là AC của phiếu MVP `01M78EYZ58EHGP3R83ZKVZ0AVH`; số AC nội bộ các phiếu con độc lập. Nguyên văn hợp đồng nằm trong [phiếu tổng](tasks/ROOT.md).

| G-AC | Task mới | Kế thừa và phần còn lại |
| --- | --- | --- |
| 1 | A2–A4, B1–B5, C6, D9–D10, E3–E9, H5–H8 | WASD/E/focus và sáu cảnh có trước; campus v1 + production art là phần thay đổi. |
| 2 | B2/B5, F1/F2, E9, H5–H8 | Bảy ngày/6quest/6NPC và ending bàn phím đã có; chỉ hồi quy sau đổi campus, giữ nguồn nói/gõ. |
| 3 | B2/B5, F1/F2, H5–H8 | 4activity/4event/seed/cooldown đã có, không dựng lại. |
| 4 | A2, F1/F2, G3/G5, H5/H8 | Intent/Pinyin/ambient đã sửa; corpus model tự do là gate riêng. |
| 5 | F4, G2/G4/G6, H2/H8 | Mic từng có evidence nhưng cần packet/build và recovery thật; không điểm thanh điệu từ ASR. |
| 6 | A2, B3/B5, D10, F1/F2, H1/H8 | 10bài và UI composition đã có; thiếu smoke OS Enter rõ. |
| 7 | A2/B5, F1, H5/H8 | 20chữ/3mức/guide đã có; tái dùng. |
| 8 | B4/B5, D10, F1/F2, H5–H8 | Mentor/sổtay/1-3-7/kỹ năng riêng đã có, kiểm không hồi quy. |
| 9 | G1/G2/G5/G6, H3/H8 | Model/worker và technical capture có trước; trace bản tích hợp mới còn riêng. |
| 10 | B3, G1/G2, H3/H5/H8 | Recovery và fault harness đã có, chỉ khép khoảng thiếu và đo bản đổi liên quan. |
| 11 | C1–C7, D1–D10, E1–E9, F3/F4, H6–H8 | MVP art đã chấp nhận; production world-map/assets là hậu MVP. |
| 12 | A2/A3, B4/B5, E9, H3/H5–H8 | Save/export/backup có trước; migration campus và patch closure cần đối chiếu. |
| 13 | A4, C5, E1/E2, G1/G5/G6, H4/H5/H8 | verify/harness có trước; không dựng lại collector hoặc đổi revision FPS cũ. |
| 14 | F1–F5, G3–G6, H8 | Corpus/người rà được hoãn sau MVP; tiếp tục pending đến có dữ liệu thật. |

Ngưỡng smoke giữ nguyên plan MVP: LLM>=51/60,>=24/30đúng,<=3/30sai; ASR>=16/24đúng,<=2/8sai,0/8nhiễu; p95 sau2warm-up và>=12lượt: ASR<=18s,LLM<=14s. Ít nhất3người cho corpus40audio. Người rà>=12câu phủ12scenario và>=12output với>=80%phù hợp. Initial<=30MiB,AI<=800MiB;10NPC median>=50FPS/60s. Không diễn giải các số này là đã đo hoặc tự hạ ngưỡng.
