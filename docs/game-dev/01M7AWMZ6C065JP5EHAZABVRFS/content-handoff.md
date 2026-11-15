# Bàn giao content — TSK-6, TSK-7, TSK-8

## Bổ sung kiểm UI sau review 5

Lượt content giữ nguyên dữ liệu học, audio, ID và luật tiến trình; không có nội dung hay asset mới. `scripts/game-dev-fixtures.mjs` sinh thêm các bản lưu từng nhánh và từng bước bằng API engine, được `validChapter` kiểm. `tests/game-dev-flow.mjs` nhập qua UI, di chuyển bàn phím đến NPC theo lịch và dùng E: kiểm chưa mở (trừ arrival luôn mở từ lúc bắt đầu), đang làm, sai, hủy, thành công, tải lại và luyện lại từng quest; các bước còn lại cũng được gửi qua UI từ fixture hợp lệ. Kiểm mục tiêu từng ngày qua fixture, chuyển bảy ngày bằng nút kết thúc buổi, ngày 6 gửi lesson-10 và mở/tô/thử/hủy bài nét 我, ngày 7 hoàn thành welcome và hiển thị kết thúc bàn phím. Fixture hoàn tất nét dùng engine; kiểm này không giả nhận đã tự viết nét bằng thiết bị. Kết quả và snapshot cuối cần polish đối chiếu qua runner của Bint.

Nguồn dữ liệu, giấy phép và trạng thái rà theo bảng bên dưới không đổi; `bint context` cho tests/chapter/content không trả mục áp dụng. Checklist playtest bên dưới vẫn pending-user; không có kết quả người chơi hoặc người rà ngôn ngữ mới.

Kết quả content: run `content-01M7B1QJE4PJ670XXXSV8RP12V`, `node tests/game-dev-flow.mjs` exit 0, Chromium 158, cả 1280×720 và 1920×1080; `node --experimental-strip-types tests/game-dev-content.test.mjs` exit 0. Đây là kiểm cục bộ trong worktree; polish chạy lại runner để gắn manifest với snapshot cuối. Test không tạo bằng chứng thiết bị thật hoặc playtest người dùng.

## Rà lại content sau review 4

Lượt content này no-op: giữ nguyên metadata, câu học, audio và ID. `src/chapter/app.ts` hiện đã nhập metadata quest, bài và chữ, đồng thời nối lựa chọn chuẩn bị ngày 6; `tests/game-dev-content.test.mjs` kiểm tham chiếu và các mốc fixture. Các finding .8–.10 giao sửa runner, kiểm tích hợp và packet cho gameplay/polish, không chỉ ra thiếu dữ liệu content cần viết lại. Các nhận định bên dưới về việc chưa tích hợp hoặc chưa xác nhận verify là trạng thái lịch sử lúc bàn giao ban đầu; Core đã ghi verify-5 exit 0, nhưng snapshot bàn giao cuối vẫn cần polish đối chiếu. Không chạy lại verify trong bước content này. Playtest người dùng và rà ngôn ngữ/audio vẫn pending; kiểm cấu trúc không thay được các việc đó. Truy xuất `bint context` cho `src/chapter,src/content` không trả mục tri thức áp dụng.

Phiếu 01M7AWMZ6C065JP5EHAZABVRFS. Nội dung trình bày mới do Codex biên soạn, `pending-human`; chưa được người rà ngôn ngữ hay người chơi nghiệm thu. `bint context` cho chapter/content trả không có mục tri thức áp dụng. Không đổi quest, ngày, điều kiện, thưởng, seed, cooldown hay save.

## Dữ liệu giao cho polish

`src/content/chapter-context.ts` xuất `questNarratives` theo quest ID, mỗi mục có `entry`, `locked`, `active`, `error`, `cancel`, `complete`, `replay`; `lessonContexts` theo lesson ID; `characterContexts` theo ID chữ; `daySixPreparation` có text và action `lesson:lesson-10`, `character:我`. Đây là metadata trình bày, chưa được helper/UI nhập; polish nối theo `contract.md`, giữ điều kiện từ engine và tra NPC theo `scenario.npc` cùng `schedule[period]`. Cần giữ nút trở lại mục tiêu sau bài học và mở lại đủ ba hint từ `scenario.hints`. Không dùng text để cấp tiến trình.

| ID | Nơi dùng / hành động | Asset và rà |
| --- | --- | --- |
| arrival | greeting → introduction → checkin; mentor, roommate, officer theo lịch | Câu/audio hiện hành theo scenario; pending-human |
| breakfast | order_water / seller tại canteen; nhầm ý thử lại, hủy rồi mở lại | WAV tổng hợp hiện hành; pending-human |
| classroom | directions / mentor → schedule / officer theo lịch | Câu/audio hiện hành; pending-human |
| shopping | price → quantity / shopkeeper tại street | Câu/audio hiện hành; pending-human |
| delivery | parcel / courier theo lịch | Câu/audio hiện hành; pending-human |
| welcome | invitation / roommate theo lịch; lesson-10 và quiz 我 | Câu/audio và dữ liệu nét hiện hành; pending-human |
| lesson-1…lesson-10 | Bối cảnh trong danh sách bài/câu; bài mở scenario tương ứng | Audio theo utterance hiện hành; pending-human |
| 你 好 我 是 学 生 人 中 国 大 小 一 二 三 口 水 日 月 来 去 | Bối cảnh trong bài viết tay; mỗi ID mở đúng chữ | `public/hanzi/<chữ>.json`, `public/licenses/ARPHICPL.txt`; văn cảnh pending-human |
| daySixPreparation | Khi delivery xong từ ngày 6, chưa welcome: mở lesson-10 hoặc quiz 我, quay lại mục tiêu | Không thêm audio; pending-human |

Mỗi nhánh vào/chưa mở/đang làm/sai/hủy/xong/luyện lại có lời riêng trong metadata. Mở sớm scenario vẫn là luyện tập theo engine; chỉ quest active mới tiến triển. Engine ngăn thưởng quest lặp; UI cần phân biệt quest với hoạt động `eat` và sự kiện `soldout`. Đã có ba gợi ý của từng scenario, không tạo câu mẫu hoặc audio mới. Không khẳng định text đã nối vào luồng chơi cho tới khi polish thực hiện.

## Mục tiêu và đường tiếp tục bảy ngày

| Ngày | Việc, phản hồi và tiếp tục |
| --- | --- |
| 1 | arrival: chào, giới thiệu, nhận phòng; sai dùng hint, hủy quay lại; bước còn thiếu tiếp tục ngày sau. |
| 2 | breakfast: gọi một cốc nước nóng; sai thử lại, đúng hoàn thành một lần; `eat`/`soldout` tùy chọn. |
| 3 | classroom: hỏi đường rồi hỏi giờ; theo lịch NPC, tiếp tục quest cũ nếu chưa xong. |
| 4 | shopping: hỏi giá và chọn hai bánh bao; lesson-5/6 là luyện tập bổ trợ. |
| 5 | delivery: tìm người giao hàng theo buổi, nói đến lấy hàng; có thể tiếp tục sau. |
| 6 | Nếu delivery xong, chuẩn bị lesson-10 và quiz 我 theo thứ tự tùy chọn; nếu chưa thì hoàn tất quest cũ trước. Không có quest mới. |
| 7 | welcome: lời mời cùng lesson-10 và quiz 我; có thể làm phần thiếu, sau đó tiếp tục ôn. Không yêu cầu đủ 20 chữ. |

## Kiểm tra và giới hạn

Đối chiếu tĩnh bằng Node: metadata có đúng 6 quest, 10 lesson, 20 chữ; mọi nhánh và hai action có đích; 12 scenario có ít nhất 3 positive, 1 negative, ba hint và tham chiếu utterance tồn tại; 72 utterance có text/pinyin/nghĩa/ngữ cảnh, `synthetic-espeak-ng`, `pending-human`, file audio/license và SHA-256 khớp. Kết quả không chứng minh phát âm, chất lượng dịch, khả năng tiếp cận hoặc trải nghiệm. Tất cả WAV và giấy phép tham chiếu `mvp.json`, audio tổng hợp eSpeak-NG; nguồn/quyền của bộ chapter xem `public/licenses/chapter-original.txt` và `public/licenses/chapter-sources.json`. Không thay file media, hash hay provenance. TSK-8 chưa thể coi hoàn tất nghiệm thu khi chưa có rà người.

Kiểm chứng Bint `node scripts/game-dev-verify.mjs` chưa được xác nhận và chưa chạy. Bước polish cần tích hợp metadata, tạo và chạy kiểm chứng khi Bint cho phép; AC-5/6 vẫn cần bằng chứng UI và rà người. Không thay thế gate MVP nguồn.

## Checklist playtest — pending-user

- Dùng profile riêng và save hợp lệ do polish bàn giao; xuất bản lưu thật trước khi thử. Từ game mới đi theo chỉ dẫn tới NPC theo buổi.
- Nhà ăn: trước khi mở quest, đang làm, câu sai, ba hint, hủy rồi mở lại, câu đúng, thử lại sau hoàn thành; phân biệt quest/eat/soldout và không nhận lại thưởng quest.
- Thực hiện từng quest, để sót một bước qua ngày và tìm lại NPC sau đổi buổi; kiểm nhánh chưa mở và đã hoàn thành.
- Sau delivery ngày 6 mở lesson-10 và quiz 我 theo cả hai thứ tự, quay về mục tiêu; ngày 7 mời bạn và hoàn thành bằng điều kiện hiện hành.
- Tải lại sau sai/hủy/đúng, xác nhận tiến trình và nguồn nhập; tiếp tục đến kết thúc và ôn tập. Chưa có phản hồi người chơi, không ghi kết quả giả.
