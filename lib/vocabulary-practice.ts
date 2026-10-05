import type { LearnedVocabularyWord, VocabularyScript } from "./learned-vocabulary";

export type LessonLine = { vocabularyId: string; chinese: string; vietnamese: string };
export type PracticeLesson = { id: string; title: string; kind: string; lines: LessonLine[]; words: LearnedVocabularyWord[]; recentCount: number; supporting: { chinese: string; vietnamese: string | null }[]; comprehension?: PracticeQuestion | null };
export type PracticeQuestion = { id: string; type: "meaning" | "blank" | "context" | "ordering" | "matching" | "comprehension" | "sentence"; vocabularyId: string; prompt: string; choices: string[]; answer: string; explanation: string };
export type PairRound = { chinese: LearnedVocabularyWord[]; vietnamese: LearnedVocabularyWord[]; memory: { key: string; id: string; text: string; side: "zh" | "vi" }[] };

export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

export function questionArrangement(questions: readonly PracticeQuestion[]): string {
  return JSON.stringify(questions.map((question) => question.choices));
}

export function randomizeQuestions(questions: readonly PracticeQuestion[], random: () => number = Math.random, previous?: string): PracticeQuestion[] {
  let last: PracticeQuestion[] = [];
  for (let attempt = 0; attempt < 20; attempt++) {
    const round = questions.map((question) => ({ ...question, choices: shuffle(question.choices, random) }));
    if (!previous || questionArrangement(round) !== previous) return round;
    last = round;
  }
  return last.map((question) => ({ ...question, choices: [...question.choices.slice(1), question.choices[0]] }));
}

export function pairArrangement(round: PairRound, memory: boolean): string {
  return memory ? JSON.stringify(round.memory.map((card) => card.key))
    : JSON.stringify([round.chinese.map((word) => word.vocabularyId), round.vietnamese.map((word) => word.vocabularyId)]);
}

export function createPairRound(words: readonly LearnedVocabularyWord[], script: VocabularyScript, random: () => number = Math.random, previous?: string, memoryMode = false): PairRound {
  const selected = words.slice(0, 5);
  const sameOrder = (a: readonly LearnedVocabularyWord[], b: readonly LearnedVocabularyWord[]) => a.every((word, index) => word.vocabularyId === b[index].vocabularyId);
  const makeRound = () => {
    let chinese = shuffle(selected, random);
    let vietnamese = shuffle(selected, random);
    if (selected.length > 2 && sameOrder(chinese, selected)) chinese = [...chinese.slice(1), chinese[0]];
    if (selected.length > 2 && sameOrder(vietnamese, selected)) vietnamese = [...vietnamese.slice(1), vietnamese[0]];
    if (selected.length > 1 && chinese.some((word, index) => word.vocabularyId === vietnamese[index].vocabularyId)) {
      for (let attempt = 0; attempt < 20; attempt++) {
        const next = shuffle(vietnamese, random);
        if (next.every((word, index) => word.vocabularyId !== chinese[index].vocabularyId) && (selected.length === 2 || !sameOrder(next, selected))) { vietnamese = next; break; }
      }
      if (chinese.some((word, index) => word.vocabularyId === vietnamese[index].vocabularyId)) {
        vietnamese = [...chinese.slice(1), chinese[0]];
      }
    }
    const memory = shuffle([
      ...selected.map((word) => ({ key: `${word.vocabularyId}:zh`, id: word.vocabularyId, text: wordForm(word, script), side: "zh" as const })),
      ...selected.map((word) => ({ key: `${word.vocabularyId}:vi`, id: word.vocabularyId, text: word.meaningVi, side: "vi" as const })),
    ], random);
    return { chinese, vietnamese, memory };
  };
  let last: PairRound | null = null;
  for (let attempt = 0; attempt < 20; attempt++) {
    const round = makeRound();
    if (!previous || pairArrangement(round, memoryMode) !== previous) return round;
    last = round;
  }
  const round = last ?? makeRound();
  if (memoryMode) round.memory = [...round.memory.slice(1), round.memory[0]];
  else { round.chinese.reverse(); round.vietnamese.reverse(); }
  return round;
}

type CuratedLine = { traditional: string; simplified: string; vietnamese: string };
const curatedLessons: { title: string; kind: string; lines: CuratedLine[]; support: { traditional: string; simplified: string; vietnamese: string }[] }[] = [
  { title: "Một ngày đi học", kind: "Đoạn văn", lines: [
    { traditional: "我是大學的學生。", simplified: "我是大学的学生。", vietnamese: "Tôi là sinh viên đại học." },
    { traditional: "今天老師給我們中文作業。", simplified: "今天老师给我们中文作业。", vietnamese: "Hôm nay giáo viên giao bài tập tiếng Hoa cho chúng tôi." },
    { traditional: "我先去圖書館借書，再回家做作業。", simplified: "我先去图书馆借书，再回家做作业。", vietnamese: "Tôi đến thư viện mượn sách trước, rồi về nhà làm bài tập." },
  ], support: [{ traditional: "借書", simplified: "借书", vietnamese: "mượn sách" }, { traditional: "先", simplified: "先", vietnamese: "trước tiên" }] },
  { title: "Gọi món ở quán", kind: "Hội thoại", lines: [
    { traditional: "A：請給我菜單。", simplified: "A：请给我菜单。", vietnamese: "A: Cho tôi xin thực đơn." },
    { traditional: "B：好的，你要吃什麼？", simplified: "B：好的，你要吃什么？", vietnamese: "B: Được ạ, bạn muốn ăn gì?" },
    { traditional: "A：我要一碗麵。這個多少錢？", simplified: "A：我要一碗面。这个多少钱？", vietnamese: "A: Tôi muốn một bát mì. Món này bao nhiêu tiền?" },
    { traditional: "B：一碗八十元，還要喝什麼嗎？", simplified: "B：一碗八十元，还要喝什么吗？", vietnamese: "B: Một bát 80 Đài tệ. Bạn có muốn uống gì nữa không?" },
    { traditional: "A：再給我一杯茶，謝謝。", simplified: "A：再给我一杯茶，谢谢。", vietnamese: "A: Cho tôi thêm một ly trà, cảm ơn." },
    { traditional: "B：好的，請稍等。", simplified: "B：好的，请稍等。", vietnamese: "B: Vâng, xin chờ một chút." },
  ], support: [{ traditional: "一碗", simplified: "一碗", vietnamese: "một bát" }, { traditional: "麵", simplified: "面", vietnamese: "mì" }] },
  { title: "Một ngày thường", kind: "Đoạn văn", lines: [
    { traditional: "我每天七點起床，先洗澡，再吃早餐。", simplified: "我每天七点起床，先洗澡，再吃早餐。", vietnamese: "Ngày nào tôi cũng dậy lúc bảy giờ, tắm trước rồi ăn sáng." },
    { traditional: "吃完早餐，我去公司上班。", simplified: "吃完早餐，我去公司上班。", vietnamese: "Ăn sáng xong, tôi đến công ty làm việc." },
    { traditional: "下班以後，我回家休息。", simplified: "下班以后，我回家休息。", vietnamese: "Tan làm xong, tôi về nhà nghỉ ngơi." },
  ], support: [{ traditional: "然後", simplified: "然后", vietnamese: "sau đó" }, { traditional: "以後", simplified: "以后", vietnamese: "sau khi" }] },
  { title: "Mua một chiếc áo", kind: "Đoạn văn", lines: [
    { traditional: "我在商店看見一件衣服。", simplified: "我在商店看见一件衣服。", vietnamese: "Tôi nhìn thấy một chiếc áo trong cửa hàng." },
    { traditional: "我很喜歡，但是不知道價格。", simplified: "我很喜欢，但是不知道价格。", vietnamese: "Tôi rất thích, nhưng không biết giá." },
    { traditional: "我問店員：「這個多少錢？」店員說：「今天很便宜。」", simplified: "我问店员：“这个多少钱？”店员说：“今天很便宜。”", vietnamese: "Tôi hỏi nhân viên: “Cái này bao nhiêu tiền?” Nhân viên nói: “Hôm nay rẻ lắm.”" },
    { traditional: "我試了一下，大小正好，就買了。", simplified: "我试了一下，大小正好，就买了。", vietnamese: "Tôi thử áo, thấy vừa nên mua luôn." },
  ], support: [{ traditional: "店員", simplified: "店员", vietnamese: "nhân viên cửa hàng" }, { traditional: "衣服", simplified: "衣服", vietnamese: "quần áo" }] },
  { title: "Hỏi đường đến ga", kind: "Hội thoại", lines: [
    { traditional: "A：請問，去車站怎麼走？", simplified: "A：请问，去车站怎么走？", vietnamese: "A: Xin hỏi, đi đến ga như thế nào?" },
    { traditional: "B：先往左邊走，到了路口再往右邊走。", simplified: "B：先往左边走，到了路口再往右边走。", vietnamese: "B: Đi về bên trái trước, đến ngã đường thì rẽ phải." },
    { traditional: "A：走過路口就到了嗎？", simplified: "A：走过路口就到了吗？", vietnamese: "A: Qua ngã đường là đến rồi phải không?" },
    { traditional: "B：對，車站就在左邊。", simplified: "B：对，车站就在左边。", vietnamese: "B: Đúng rồi, ga ở ngay bên trái." },
    { traditional: "A：謝謝你！", simplified: "A：谢谢你！", vietnamese: "A: Cảm ơn bạn!" },
  ], support: [{ traditional: "路口", simplified: "路口", vietnamese: "ngã đường" }, { traditional: "先", simplified: "先", vietnamese: "trước tiên" }] },
  { title: "Rủ bạn đến thư viện", kind: "Tin nhắn", lines: [
    { traditional: "小安：你今天有空嗎？", simplified: "小安：你今天有空吗？", vietnamese: "Tiểu An: Hôm nay bạn rảnh không?" },
    { traditional: "小美：我下午要去圖書館。", simplified: "小美：我下午要去图书馆。", vietnamese: "Tiểu Mỹ: Chiều nay mình sẽ đến thư viện." },
    { traditional: "小安：我們先吃午餐，再一起去，好嗎？", simplified: "小安：我们先吃午餐，再一起去，好吗？", vietnamese: "Tiểu An: Chúng mình ăn trưa trước rồi cùng đi, được không?" },
    { traditional: "小美：好，我們在學校見！", simplified: "小美：好，我们在学校见！", vietnamese: "Tiểu Mỹ: Được, gặp nhau ở trường nhé!" },
  ], support: [{ traditional: "有空", simplified: "有空", vietnamese: "rảnh" }, { traditional: "一起", simplified: "一起", vietnamese: "cùng nhau" }] },
  { title: "Email về cuộc họp", kind: "Email", lines: [
    { traditional: "主旨：明天的會議", simplified: "主题：明天的会议", vietnamese: "Chủ đề: Cuộc họp ngày mai" },
    { traditional: "同事們：明天上午十點在公司開會。", simplified: "同事们：明天上午十点在公司开会。", vietnamese: "Các đồng nghiệp: Ngày mai lúc mười giờ sáng sẽ họp ở công ty." },
    { traditional: "請先看資料。如果有問題，請回信。", simplified: "请先看资料。如果有问题，请回信。", vietnamese: "Vui lòng xem tài liệu trước. Nếu có câu hỏi, hãy trả lời email." },
  ], support: [{ traditional: "主旨", simplified: "主题", vietnamese: "chủ đề email" }, { traditional: "資料", simplified: "资料", vietnamese: "tài liệu" }, { traditional: "回信", simplified: "回信", vietnamese: "trả lời thư" }] },
  { title: "Thông báo ở trạm xe", kind: "Thông báo", lines: [
    { traditional: "公告：今天公車不在車站停。", simplified: "公告：今天公车不在车站停。", vietnamese: "Thông báo: Hôm nay xe buýt không dừng ở trạm." },
    { traditional: "請到右邊的路口等車。", simplified: "请到右边的路口等车。", vietnamese: "Vui lòng đến ngã đường bên phải để đợi xe." },
    { traditional: "先買車票，再上車。謝謝大家。", simplified: "先买车票，再上车。谢谢大家。", vietnamese: "Hãy mua vé trước rồi lên xe. Cảm ơn mọi người." },
  ], support: [{ traditional: "公告", simplified: "公告", vietnamese: "thông báo" }, { traditional: "等車", simplified: "等车", vietnamese: "đợi xe" }, { traditional: "上車", simplified: "上车", vietnamese: "lên xe" }] },
  { title: "Xem phòng trọ ở Đài Bắc", kind: "Hội thoại", lines: [
    { traditional: "租客：請問這間房子一個月多少錢？", simplified: "租客：请问这间房子一个月多少钱？", vietnamese: "Người thuê: Xin hỏi căn nhà này thuê mỗi tháng bao nhiêu?" },
    { traditional: "房東：房租一萬二，押金是兩個月。", simplified: "房东：房租一万二，押金是两个月。", vietnamese: "Chủ nhà: Tiền thuê là 12.000 Đài tệ, tiền cọc bằng hai tháng." },
    { traditional: "租客：水電費包括在房租裡嗎？", simplified: "租客：水电费包括在房租里吗？", vietnamese: "Người thuê: Tiền điện nước có gồm trong tiền thuê không?" },
    { traditional: "房東：不包括，不過網路費已經包含了。", simplified: "房东：不包括，不过网络费已经包含了。", vietnamese: "Chủ nhà: Không, nhưng phí mạng đã được bao gồm." },
    { traditional: "租客：好，我想先看看合約，再決定什麼時候搬家。", simplified: "租客：好，我想先看看合同，再决定什么时候搬家。", vietnamese: "Người thuê: Vâng, tôi muốn xem hợp đồng trước rồi quyết định ngày chuyển nhà." },
  ], support: [{ traditional: "押金", simplified: "押金", vietnamese: "tiền đặt cọc" }, { traditional: "合約", simplified: "合同", vietnamese: "hợp đồng" }, { traditional: "水電費", simplified: "水电费", vietnamese: "tiền điện nước" }] },
  { title: "Đến phòng khám", kind: "Hội thoại", lines: [
    { traditional: "病人：醫生，我昨天開始發燒，今天還有點頭痛。", simplified: "病人：医生，我昨天开始发烧，今天还有点头痛。", vietnamese: "Bệnh nhân: Bác sĩ, từ hôm qua tôi bắt đầu sốt, hôm nay còn hơi đau đầu." },
    { traditional: "醫生：有沒有咳嗽？先量一下體溫吧。", simplified: "医生：有没有咳嗽？先量一下体温吧。", vietnamese: "Bác sĩ: Bạn có ho không? Để đo nhiệt độ trước nhé." },
    { traditional: "病人：有一點，可能是感冒了。", simplified: "病人：有一点，可能是感冒了。", vietnamese: "Bệnh nhân: Hơi ho, có lẽ tôi bị cảm." },
    { traditional: "醫生：我開一些藥給你。今天回家休息，多喝水。", simplified: "医生：我开一些药给你。今天回家休息，多喝水。", vietnamese: "Bác sĩ: Tôi kê cho bạn ít thuốc. Hôm nay về nhà nghỉ và uống nhiều nước." },
    { traditional: "病人：好的，謝謝醫生。", simplified: "病人：好的，谢谢医生。", vietnamese: "Bệnh nhân: Vâng, cảm ơn bác sĩ." },
  ], support: [{ traditional: "量體溫", simplified: "量体温", vietnamese: "đo nhiệt độ" }, { traditional: "咳嗽", simplified: "咳嗽", vietnamese: "ho" }] },
  { title: "Nhờ giảng viên giúp", kind: "Hội thoại", lines: [
    { traditional: "學生：老師，我有一個問題，可以請教您嗎？", simplified: "学生：老师，我有一个问题，可以请教您吗？", vietnamese: "Sinh viên: Thưa thầy cô, em có một câu hỏi, có thể nhờ thầy cô giải đáp không ạ?" },
    { traditional: "老師：當然可以。是今天的作業嗎？", simplified: "老师：当然可以。是今天的作业吗？", vietnamese: "Giảng viên: Tất nhiên. Có phải về bài tập hôm nay không?" },
    { traditional: "學生：對，我在圖書館找了資料，可是還不太明白。", simplified: "学生：对，我在图书馆找了资料，可是还不太明白。", vietnamese: "Sinh viên: Dạ đúng, em đã tìm tài liệu ở thư viện nhưng vẫn chưa hiểu lắm." },
    { traditional: "老師：我們下課後一起看。你先把不懂的地方寫下來。", simplified: "老师：我们下课后一起看。你先把不懂的地方写下来。", vietnamese: "Giảng viên: Sau giờ học ta cùng xem nhé. Em ghi lại những chỗ chưa hiểu trước đi." },
    { traditional: "學生：好，謝謝老師！", simplified: "学生：好，谢谢老师！", vietnamese: "Sinh viên: Vâng, em cảm ơn thầy cô!" },
  ], support: [{ traditional: "請教", simplified: "请教", vietnamese: "xin được chỉ dẫn" }, { traditional: "資料", simplified: "资料", vietnamese: "tài liệu" }] },
  { title: "Đổi giờ họp ở công ty", kind: "Tin nhắn", lines: [
    { traditional: "經理：明天上午的會議改到下午兩點，請通知其他同事。", simplified: "经理：明天上午的会议改到下午两点，请通知其他同事。", vietnamese: "Quản lý: Cuộc họp sáng mai chuyển sang hai giờ chiều, nhờ báo cho các đồng nghiệp khác." },
    { traditional: "小林：好的。我會把新的時間寫在工作群組裡。", simplified: "小林：好的。我会把新的时间写在工作群组里。", vietnamese: "Tiểu Lâm: Vâng. Tôi sẽ nhắn giờ mới vào nhóm làm việc." },
    { traditional: "經理：麻煩你也提醒大家先看一下資料。", simplified: "经理：麻烦你也提醒大家先看一下资料。", vietnamese: "Quản lý: Phiền bạn nhắc mọi người xem tài liệu trước nữa nhé." },
    { traditional: "小林：沒問題，我現在就發訊息。", simplified: "小林：没问题，我现在就发信息。", vietnamese: "Tiểu Lâm: Không vấn đề gì, tôi sẽ gửi tin nhắn ngay." },
  ], support: [{ traditional: "群組", simplified: "群组", vietnamese: "nhóm chat" }, { traditional: "提醒", simplified: "提醒", vietnamese: "nhắc nhở" }] },
  { title: "Chuẩn bị chuyến đi", kind: "Tin nhắn", lines: [
    { traditional: "小美：週末去台南的車票買好了嗎？", simplified: "小美：周末去台南的车票买好了吗？", vietnamese: "Tiểu Mỹ: Bạn đã mua vé xe đi Đài Nam cuối tuần này chưa?" },
    { traditional: "小安：買好了，早上八點從車站出發。", simplified: "小安：买好了，早上八点从车站出发。", vietnamese: "Tiểu An: Mua rồi, tám giờ sáng xuất phát từ ga." },
    { traditional: "小美：太好了。我先訂旅館，晚上再把地址傳給你。", simplified: "小美：太好了。我先订旅馆，晚上再把地址传给你。", vietnamese: "Tiểu Mỹ: Tốt quá. Mình sẽ đặt khách sạn trước, tối gửi địa chỉ cho bạn." },
    { traditional: "小安：謝謝！我會帶地圖和雨傘。", simplified: "小安：谢谢！我会带地图和雨伞。", vietnamese: "Tiểu An: Cảm ơn! Mình sẽ mang bản đồ và ô." },
  ], support: [{ traditional: "出發", simplified: "出发", vietnamese: "xuất phát" }, { traditional: "訂旅館", simplified: "订旅馆", vietnamese: "đặt khách sạn" }] },
  { title: "Phỏng vấn xin việc", kind: "Hội thoại", lines: [
    { traditional: "面試官：你為什麼想來我們公司工作？", simplified: "面试官：你为什么想来我们公司工作？", vietnamese: "Người phỏng vấn: Vì sao bạn muốn làm việc ở công ty chúng tôi?" },
    { traditional: "求職者：我做過兩年客服，也想學習新的技術。", simplified: "求职者：我做过两年客服，也想学习新的技术。", vietnamese: "Ứng viên: Tôi từng làm chăm sóc khách hàng hai năm và cũng muốn học công nghệ mới." },
    { traditional: "面試官：如果需要和同事一起完成工作，你覺得怎麼樣？", simplified: "面试官：如果需要和同事一起完成工作，你觉得怎么样？", vietnamese: "Người phỏng vấn: Nếu cần cùng đồng nghiệp hoàn thành công việc, bạn thấy thế nào?" },
    { traditional: "求職者：我很喜歡合作，遇到問題也會主動溝通。", simplified: "求职者：我很喜欢合作，遇到问题也会主动沟通。", vietnamese: "Ứng viên: Tôi thích hợp tác; gặp vấn đề tôi cũng sẽ chủ động trao đổi." },
    { traditional: "面試官：了解了，謝謝你今天來面試。", simplified: "面试官：了解了，谢谢你今天来面试。", vietnamese: "Người phỏng vấn: Tôi hiểu rồi, cảm ơn bạn đã đến phỏng vấn hôm nay." },
  ], support: [{ traditional: "客服", simplified: "客服", vietnamese: "chăm sóc khách hàng" }, { traditional: "合作", simplified: "合作", vietnamese: "hợp tác" }] },
  { title: "Lên kế hoạch giảm rác ở khu phố", kind: "Hội thoại", lines: [
    { traditional: "里長：最近公園的垃圾越來越多，大家有什麼建議？", simplified: "里长：最近公园的垃圾越来越多，大家有什么建议？", vietnamese: "Trưởng khu phố: Gần đây rác ở công viên ngày càng nhiều, mọi người có đề xuất gì không?" },
    { traditional: "居民：除了增加回收桶，也應該讓大家知道怎麼分類。", simplified: "居民：除了增加回收桶，也应该让大家知道怎么分类。", vietnamese: "Cư dân: Ngoài việc thêm thùng tái chế, cũng nên hướng dẫn mọi người phân loại rác." },
    { traditional: "里長：我同意。下週我們先辦一場環境講座。", simplified: "里长：我同意。下周我们先办一场环境讲座。", vietnamese: "Trưởng khu phố: Tôi đồng ý. Tuần sau chúng ta tổ chức một buổi nói chuyện về môi trường trước." },
    { traditional: "居民：我可以幫忙通知鄰居，也準備一份簡單的說明。", simplified: "居民：我可以帮忙通知邻居，也准备一份简单的说明。", vietnamese: "Cư dân: Tôi có thể báo cho hàng xóm và chuẩn bị một bản hướng dẫn ngắn." },
    { traditional: "里長：太好了。希望大家一起改善公園的環境。", simplified: "里长：太好了。希望大家一起改善公园的环境。", vietnamese: "Trưởng khu phố: Tốt quá. Mong mọi người cùng cải thiện môi trường công viên." },
  ], support: [{ traditional: "里長", simplified: "里长", vietnamese: "trưởng khu phố" }, { traditional: "分類", simplified: "分类", vietnamese: "phân loại" }, { traditional: "回收桶", simplified: "回收桶", vietnamese: "thùng tái chế" }] },
  { title: "Xử lý sự cố tài khoản", kind: "Email", lines: [
    { traditional: "主旨：請協助確認帳戶安全", simplified: "主题：请协助确认账户安全", vietnamese: "Chủ đề: Nhờ kiểm tra bảo mật tài khoản" },
    { traditional: "資訊部門您好：今天早上我收到一封要求更新密碼的電子郵件，但寄件地址看起來不太對。", simplified: "资讯部门您好：今天早上我收到一封要求更新密码的电子邮件，但寄件地址看起来不太对。", vietnamese: "Kính gửi bộ phận công nghệ thông tin: Sáng nay tôi nhận được email yêu cầu đổi mật khẩu, nhưng địa chỉ người gửi có vẻ đáng ngờ." },
    { traditional: "為了避免資料外洩，我沒有點開連結，已經把郵件轉寄給您。", simplified: "为了避免资料外泄，我没有点开链接，已经把邮件转寄给您。", vietnamese: "Để tránh rò rỉ dữ liệu, tôi không bấm vào đường dẫn và đã chuyển tiếp thư cho bộ phận." },
    { traditional: "請問接下來需要更改密碼，或採取其他措施嗎？", simplified: "请问接下来需要更改密码，或采取其他措施吗？", vietnamese: "Xin hỏi tiếp theo tôi cần đổi mật khẩu hay thực hiện biện pháp nào khác không?" },
    { traditional: "謝謝協助，期待您的回覆。", simplified: "谢谢协助，期待您的回复。", vietnamese: "Cảm ơn sự hỗ trợ và mong nhận được phản hồi." },
  ], support: [{ traditional: "資料外洩", simplified: "资料外泄", vietnamese: "rò rỉ dữ liệu" }, { traditional: "轉寄", simplified: "转寄", vietnamese: "chuyển tiếp thư" }, { traditional: "連結", simplified: "链接", vietnamese: "đường dẫn" }] },
];

const sceneTopics = [
  "school", "food", "daily", "shopping", "transport", "school", "work", "transport",
  "housing", "health", "school", "work", "travel", "work", "environment", "technology",
] as const;
const sceneRanks = [1, 1, 1, 1, 1, 1, 2, 1, 2, 2, 2, 2, 2, 2, 3, 3] as const;
const relatedTopics: Record<string, string[]> = {
  university: ["school"], greetings: ["daily", "school"], "daily-life": ["daily"],
  travel: ["travel", "transport"], transport: ["transport", "travel"],
  work: ["work"], school: ["school"], food: ["food"], shopping: ["shopping"],
  housing: ["housing"], health: ["health"], daily: ["daily"],
};
const sceneChecks = [
  { prompt: "Sau khi được giao bài tập, người học định làm gì trước?", choices: ["Đến thư viện mượn sách", "Đi mua quần áo", "Về nhà ngủ"], answer: "Đến thư viện mượn sách", line: 2 },
  { prompt: "Khách gọi thêm đồ uống gì?", choices: ["Trà", "Cà phê", "Nước trái cây"], answer: "Trà", line: 4 },
  { prompt: "Người kể làm gì sau khi tan làm?", choices: ["Về nhà nghỉ", "Đi học", "Đến cửa hàng"], answer: "Về nhà nghỉ", line: 2 },
  { prompt: "Vì sao người kể quyết định mua áo?", choices: ["Áo mặc vừa", "Áo được tặng", "Bạn bè khuyên mua"], answer: "Áo mặc vừa", line: 3 },
  { prompt: "Sau khi qua ngã đường, ga ở phía nào?", choices: ["Bên trái", "Bên phải", "Phía sau"], answer: "Bên trái", line: 3 },
  { prompt: "Hai người hẹn gặp ở đâu?", choices: ["Ở trường", "Ở nhà", "Ở nhà ga"], answer: "Ở trường", line: 3 },
  { prompt: "Cuộc họp diễn ra lúc mấy giờ?", choices: ["Mười giờ sáng", "Hai giờ chiều", "Bảy giờ tối"], answer: "Mười giờ sáng", line: 1 },
  { prompt: "Hành khách phải làm gì trước khi lên xe?", choices: ["Mua vé", "Ăn trưa", "Gửi email"], answer: "Mua vé", line: 2 },
  { prompt: "Khoản nào đã được tính trong tiền thuê nhà?", choices: ["Phí mạng", "Tiền điện", "Tiền nước"], answer: "Phí mạng", line: 3 },
  { prompt: "Bác sĩ khuyên bệnh nhân làm gì hôm nay?", choices: ["Về nhà nghỉ và uống nước", "Đến công ty làm việc", "Đi tập thể thao"], answer: "Về nhà nghỉ và uống nước", line: 3 },
  { prompt: "Giảng viên hẹn xem bài cùng sinh viên khi nào?", choices: ["Sau giờ học", "Trước khi đến trường", "Cuối tuần"], answer: "Sau giờ học", line: 3 },
  { prompt: "Cuộc họp đã chuyển sang lúc nào?", choices: ["Hai giờ chiều", "Mười giờ sáng", "Sáu giờ tối"], answer: "Hai giờ chiều", line: 0 },
  { prompt: "Hai người sẽ xuất phát đi Đài Nam lúc mấy giờ?", choices: ["Tám giờ sáng", "Hai giờ chiều", "Chín giờ tối"], answer: "Tám giờ sáng", line: 1 },
  { prompt: "Ứng viên từng làm công việc gì?", choices: ["Chăm sóc khách hàng", "Bác sĩ", "Giảng viên"], answer: "Chăm sóc khách hàng", line: 1 },
  { prompt: "Khu phố sẽ làm gì trước để cải thiện việc phân loại rác?", choices: ["Tổ chức buổi nói chuyện", "Đóng cửa công viên", "Dừng thu gom rác"], answer: "Tổ chức buổi nói chuyện", line: 2 },
  { prompt: "Người viết đã làm gì với email đáng ngờ?", choices: ["Không bấm liên kết và chuyển tiếp cho bộ phận IT", "Trả lời người gửi ngay", "Chia sẻ mật khẩu"], answer: "Không bấm liên kết và chuyển tiếp cho bộ phận IT", line: 2 },
] as const;

export function wordForm(word: LearnedVocabularyWord, script: VocabularyScript): string { return script === "simplified" ? word.simplified : word.traditional; }
export function exampleForm(word: LearnedVocabularyWord, script: VocabularyScript): string { return script === "simplified" ? word.exampleSimplified : word.exampleTraditional; }
export function bandRank(word: LearnedVocabularyWord): number { return ({ novice: 0, band_a: 1, band_b: 2, band_c: 3 } as Record<string, number>)[word.band ?? ""] ?? 0; }

export function focusWords(pool: LearnedVocabularyWord[], focus: string | null): LearnedVocabularyWord[] {
  if (!focus) return pool;
  const exact = pool.filter((word) => word.studySetIds.includes(focus));
  if (exact.length) return exact;
  if (focus.startsWith("band:")) {
    const [, band, level] = focus.split(":");
    return pool.filter((word) => word.band === band && (level === "all" || word.level === level));
  }
  return pool.filter((word) => word.topicIds.includes(focus.startsWith("context:") ? focus.split(":")[1] : focus));
}

export function buildLesson(pool: LearnedVocabularyWord[], script: VocabularyScript, offset = 0, focus: string | null = null): PracticeLesson | null {
  const available = focusWords(pool, focus).filter((word) => word.meaningVi.trim() && wordForm(word, script).trim());
  if (available.length < 2) return null;
  const candidates = [...available].sort((a, b) => Date.parse(b.learnedAt) - Date.parse(a.learnedAt)).slice(0, 25);
  const targetRank = Math.max(...candidates.map(bandRank));
  const lessonRank = Math.max(targetRank, 1);
  const requestedTopic = focus?.startsWith("context:") ? focus.split(":")[1] : focus;
  const topics = requestedTopic ? relatedTopics[requestedTopic] ?? [requestedTopic] : [];
  const matches = curatedLessons.flatMap((template, index) => {
    if (sceneRanks[index] > lessonRank) return [];
    const text = template.lines.map((line) => script === "simplified" ? line.simplified : line.traditional).join(" ");
    const words = candidates.filter((word) => text.includes(wordForm(word, script))).slice(0, 12);
    if (words.length < 2) return [];
    const topicBonus = topics.includes(sceneTopics[index]) ? 4 : 0;
    const levelBonus = sceneRanks[index] === lessonRank ? 1 : 0;
    const score = words.length * 3 + topicBonus + levelBonus;
    return [{ template, index, words, score }];
  }).sort((a, b) => b.score - a.score || b.words.length - a.words.length);
  const selected = matches[offset % matches.length];
  if (!selected) return null;
  const { template, words, index } = selected;
  const lines = template.lines.map((line) => {
    const chinese = script === "simplified" ? line.simplified : line.traditional;
    return { vocabularyId: words.find((word) => chinese.includes(wordForm(word, script)))?.vocabularyId ?? "", chinese, vietnamese: line.vietnamese };
  });
  const supporting = template.support.flatMap((item) => {
    const chinese = script === "simplified" ? item.simplified : item.traditional;
    return lines.some((line) => line.chinese.includes(chinese)) && !pool.some((word) => wordForm(word, script) === chinese)
      ? [{ chinese, vietnamese: item.vietnamese }] : [];
  });
  const check = sceneChecks[index];
  const evidenceLine = lines[check.line];
  const evidenceWord = words.find((word) => evidenceLine.chinese.includes(wordForm(word, script)));
  return {
    id: `scene:${script}:${index}:${words.map((word) => word.vocabularyId).join("|")}`,
    title: template.title, kind: template.kind, lines, words, recentCount: candidates.length, supporting,
    comprehension: { id: `scene:${index}:check`, type: "comprehension", vocabularyId: evidenceWord?.vocabularyId ?? "",
      prompt: check.prompt, choices: [...check.choices], answer: check.answer,
      explanation: `Trong bài: ${evidenceLine.chinese}` },
  };
}

function alternatives(words: LearnedVocabularyWord[], target: LearnedVocabularyWord, script: VocabularyScript, field: "meaning" | "chinese"): string[] {
  const value = (word: LearnedVocabularyWord) => field === "meaning" ? word.meaningVi : wordForm(word, script);
  return [...new Set([target, ...words.filter((word) => word.vocabularyId !== target.vocabularyId)].map(value))].slice(0, 4);
}
function rotated<T>(values: T[], index: number): T[] { return values.length ? [...values.slice(index % values.length), ...values.slice(0, index % values.length)] : []; }

export function buildPracticeQuestions(lesson: PracticeLesson, script: VocabularyScript, pool: LearnedVocabularyWord[]): PracticeQuestion[] {
  const words = lesson.words;
  if (!words.length) return [];
  const types: PracticeQuestion["type"][] = ["meaning", "blank", "context", "ordering", "matching", "comprehension", "sentence"];
  return types.flatMap((type, index) => {
    if (type === "comprehension" && lesson.comprehension?.vocabularyId) return [lesson.comprehension];
    const word = words[index % words.length];
    const chinese = wordForm(word, script);
    const lessonLine = lesson.lines.find((line) => line.chinese.includes(chinese));
    const sentence = lessonLine?.chinese ?? exampleForm(word, script);
    const sentenceVi = lessonLine?.vietnamese ?? word.exampleVi;
    const other = words.find((item) => item.vocabularyId !== word.vocabularyId && wordForm(item, script) !== chinese);
    const meanings = rotated(alternatives(pool, word, script, "meaning"), index);
    const forms = rotated(alternatives(pool, word, script, "chinese"), index);
    let prompt = ""; let choices: string[] = []; let answer = ""; let explanation = "";
    if (["blank", "context", "ordering", "sentence"].includes(type) && !sentence.includes(chinese)) return [];
    if (type === "meaning") { prompt = `${chinese} có nghĩa là gì?`; choices = meanings; answer = word.meaningVi; explanation = `${chinese}: ${word.meaningVi}.`; }
    if (type === "blank") { prompt = `Điền từ vào câu: ${sentence.replace(chinese, "＿＿")}`; choices = forms; answer = chinese; explanation = `Câu gốc: ${sentence}`; }
    if (type === "context") { prompt = `Trong ngữ cảnh “${sentenceVi}”, chọn từ đúng.`; choices = forms; answer = chinese; explanation = `Trong bài: ${sentence}`; }
    if (type === "matching") { prompt = `Ghép “${chinese}” với nghĩa phù hợp.`; choices = meanings; answer = word.meaningVi; explanation = `${chinese} ↔ ${word.meaningVi}.`; }
    if (type === "comprehension") return [];
    if (type === "sentence" && other) { prompt = `Chọn câu đúng như bài khóa (${word.meaningVi}).`; choices = rotated([sentence, sentence.replace(chinese, wordForm(other, script))], index); answer = sentence; explanation = `Bài khóa dùng ${chinese} trong câu: ${sentence}`; }
    if (type === "ordering") {
      const pieces = sentence.split(chinese);
      if (pieces.length !== 2 || !pieces[0] || !pieces[1]) return [];
      prompt = "Xếp các phần thành câu đúng như bài khóa.";
      choices = rotated([pieces[0], chinese, pieces[1]], 1);
      answer = sentence;
      explanation = `Câu gốc: ${sentence}`;
    }
    if (!choices.length || new Set(choices).size < 2) return [];
    return [{ id: `${lesson.id}:${type}:${word.vocabularyId}`, type, vocabularyId: word.vocabularyId, prompt, choices, answer, explanation }];
  });
}

export function buildGameQuestions(lesson: PracticeLesson, script: VocabularyScript, pool: LearnedVocabularyWord[], game: "quick" | "fill" | "order"): PracticeQuestion[] {
  const type = game === "quick" ? "meaning" : game === "fill" ? "blank" : "ordering";
  return lesson.words.flatMap((_, index) => {
    const shifted = { ...lesson, words: [...lesson.words.slice(index), ...lesson.words.slice(0, index)] };
    return buildPracticeQuestions(shifted, script, pool).filter((question) => question.type === type);
  }).slice(0, 10);
}
