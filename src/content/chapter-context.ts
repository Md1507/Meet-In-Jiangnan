// Presentation data for the chapter. Progress, eligibility and rewards stay in engine.ts.
// Vietnamese editorial text is synthetic and has not been reviewed by a person.
export type ContentAction = {kind:'scenario'|'lesson'|'character'; targetId:string};
export type QuestNarrative = {
  entry:string; locked:string; active:string; error:string; cancel:string; complete:string; replay:string;
};

export const questNarratives:Record<string,QuestNarrative> = {
  arrival:{entry:'Ngày đầu đến trường: chào thầy cô, giới thiệu và làm thủ tục nhận phòng.',locked:'Hãy đợi đến ngày đầu tiên để bắt đầu.',active:'Hoàn thành từng cuộc gặp; xem mục tiêu để tìm đúng người theo buổi.',error:'Ý chưa đủ; mở gợi ý và thử lại câu đang làm.',cancel:'Cuộc gặp đã đóng. Quay lại người tương ứng để tiếp tục.',complete:'Bạn đã làm xong thủ tục ngày đầu.',replay:'Có thể luyện lại các cuộc gặp; thưởng nhiệm vụ chỉ nhận một lần.'},
  breakfast:{entry:'Đến nhà ăn và tự gọi một cốc nước nóng cho bữa sáng.',locked:'Hoàn thành ngày đầu nhập học và đợi đến ngày 2; bạn vẫn có thể luyện gọi nước.',active:'Tìm Vương a di ở nhà ăn, nói rõ một cốc nước nóng.',error:'Chưa đủ ý gọi một cốc nước nóng; xem gợi ý rồi thử lại.',cancel:'Đã đóng lời gọi. Quay lại Vương a di để thử tiếp.',complete:'Bạn đã tự gọi nước cho bữa sáng.',replay:'Luyện gọi nước lại được; không nhận lại thưởng nhiệm vụ.'},
  classroom:{entry:'Tìm thư viện và hỏi giờ bắt đầu học.',locked:'Hoàn thành bữa sáng và đợi đến ngày 3.',active:'Hỏi thầy Lâm đường đến thư viện, rồi hỏi thầy Châu giờ học; xem lịch theo buổi.',error:'Câu chưa đúng ý cần hỏi; dùng gợi ý và thử lại.',cancel:'Đã đóng cuộc hỏi. Tìm lại người của bước còn thiếu.',complete:'Bạn đã hỏi đường và giờ học.',replay:'Có thể hỏi lại để luyện, không nhận lại thưởng nhiệm vụ.'},
  shopping:{entry:'Ra phố hỏi giá rồi chọn số lượng bánh bao.',locked:'Hoàn thành việc tìm lớp và đợi đến ngày 4.',active:'Tìm A Kiệt trên phố để hỏi giá và gọi hai cái bánh bao.',error:'Chưa đủ ý hỏi giá hoặc số lượng của bước này; mở gợi ý rồi thử lại.',cancel:'Đã đóng cuộc mua đồ. Quay lại A Kiệt để tiếp tục.',complete:'Bạn đã hỏi giá và chọn số lượng.',replay:'Có thể luyện lại cuộc mua đồ; thưởng nhiệm vụ không lặp.'},
  delivery:{entry:'Tìm người giao hàng để nhận bưu kiện.',locked:'Hoàn thành việc mua đồ và đợi đến ngày 5.',active:'Tìm chú Lưu theo lịch hiện tại và báo đến lấy bưu kiện.',error:'Chưa rõ ý đến lấy bưu kiện; xem gợi ý và thử lại.',cancel:'Đã đóng cuộc nhận hàng. Tìm lại chú Lưu để tiếp tục.',complete:'Bạn đã nhận bưu kiện.',replay:'Có thể luyện lại câu nhận hàng; không nhận lại thưởng nhiệm vụ.'},
  welcome:{entry:'Mời bạn cùng ăn cơm ngày mai và chuẩn bị lời mời bằng bài viết cùng chữ 我.',locked:'Hoàn thành việc nhận hàng và đợi đến ngày 7. Có thể chuẩn bị bài viết và chữ 我 trước.',active:'Gặp Tiểu Vũ theo lịch để mời bạn; hoàn thành bài viết lời mời và tự viết chữ 我.',error:'Lời mời chưa đủ ý; xem gợi ý rồi thử lại.',cancel:'Đã đóng lời mời. Quay lại Tiểu Vũ hoặc tiếp tục chuẩn bị trong sổ tay.',complete:'Bạn đã hoàn thành lời mời và phần chuẩn bị.',replay:'Có thể ôn lời mời; không nhận lại thưởng nhiệm vụ.'},
};

// Context references point to the existing lesson/scenario or writing exercise, not new content IDs.
export const lessonContexts:Record<string,string> = {
  'lesson-1':'Giới thiệu tên khi gặp bạn cùng phòng.', 'lesson-2':'Báo đến làm thủ tục nhận phòng.',
  'lesson-3':'Báo bạn cùng phòng khi đèn hỏng.', 'lesson-4':'Tự gọi một cốc nước nóng tại nhà ăn.',
  'lesson-5':'Chọn hai chiếc bánh bao khi mua đồ.', 'lesson-6':'Hỏi giá trước khi chọn món ở cửa hàng.',
  'lesson-7':'Hỏi đường đến thư viện.', 'lesson-8':'Hỏi giờ bắt đầu học.',
  'lesson-9':'Báo người giao hàng rằng bạn đến nhận bưu kiện.', 'lesson-10':'Chuẩn bị lời mời bạn cùng ăn cơm ngày mai.'
};
export const characterContexts:Record<string,string> = {
  '你':'Dùng khi nói với người đối diện.', '好':'Gặp thầy cô và chào hỏi.', '我':'Tự giới thiệu và chuẩn bị lời mời bạn.',
  '是':'Giới thiệu bản thân.', '学':'Nói về việc học ở trường.', '生':'Nhận diện chữ trong từ học sinh.',
  '人':'Nhận diện chữ chỉ người trong đời sống.', '中':'Nhận diện chữ trong tên Trung Quốc.', '国':'Nhận diện chữ trong tên Trung Quốc.',
  '大':'Nhận diện chữ chỉ lớn khi quan sát đồ vật.', '小':'Nhận diện chữ chỉ nhỏ hoặc trong tên Tiểu Vũ.',
  '一':'Nhận diện số một khi gọi một cốc nước.', '二':'Nhận diện số hai khi nói về số lượng.', '三':'Nhận diện số ba khi đọc số lượng.',
  '口':'Nhận diện chữ trong từ liên quan đến miệng.', '水':'Nhận diện nước trong lời gọi ở nhà ăn.',
  '日':'Nhận diện chữ trong từ chỉ ngày.', '月':'Nhận diện chữ trong từ chỉ tháng.',
  '来':'Nhận diện chữ trong câu đến nhận phòng hoặc bưu kiện.', '去':'Nhận diện chữ trong câu hỏi đường và lời mời.'
};

export const daySixPreparation:{text:string;actions:ContentAction[]} = {
  text:'Sau khi nhận bưu kiện, chuẩn bị lời mời ngày mai: luyện bài viết và tự viết chữ 我. Bạn có thể chọn thứ tự hoặc quay lại sau.',
  actions:[{kind:'lesson',targetId:'lesson-10'},{kind:'character',targetId:'我'}]
};
