export type VocabularyWord = {
  hanzi: string;
  pinyin: string;
  meaning: string;
  example: string;
  translation: string;
};
export type VocabularySet = {
  id: string;
  title: string;
  subtitle: string;
  words: VocabularyWord[];
};
export type VocabularyChapter = { id: string; title: string; lessons: VocabularySet[] };
export type VocabularyTextbook = { id: string; title: string; chapters: VocabularyChapter[] };

export const topicSets: VocabularySet[] = [
  {
    id: "greetings", title: "Gặp gỡ và chào hỏi", subtitle: "Mở đầu cuộc trò chuyện",
    words: [
      { hanzi: "你好", pinyin: "nǐ hǎo", meaning: "Xin chào", example: "你好！很高興認識你。", translation: "Xin chào! Rất vui được gặp bạn." },
      { hanzi: "謝謝", pinyin: "xièxie", meaning: "Cảm ơn", example: "謝謝你的幫忙。", translation: "Cảm ơn bạn đã giúp đỡ." },
      { hanzi: "再見", pinyin: "zàijiàn", meaning: "Tạm biệt", example: "明天見，再見！", translation: "Hẹn gặp ngày mai, tạm biệt!" },
      { hanzi: "名字", pinyin: "míngzi", meaning: "Tên", example: "你的名字是什麼？", translation: "Tên của bạn là gì?" },
    ],
  },
  {
    id: "food", title: "Ăn uống", subtitle: "Từ vựng khi gọi món",
    words: [
      { hanzi: "菜單", pinyin: "càidān", meaning: "Thực đơn", example: "請給我菜單。", translation: "Cho tôi xin thực đơn." },
      { hanzi: "好吃", pinyin: "hǎochī", meaning: "Ngon", example: "這碗麵很好吃。", translation: "Bát mì này rất ngon." },
      { hanzi: "我要", pinyin: "wǒ yào", meaning: "Tôi muốn", example: "我要一杯茶。", translation: "Tôi muốn một cốc trà." },
      { hanzi: "多少錢", pinyin: "duōshǎo qián", meaning: "Bao nhiêu tiền", example: "這個多少錢？", translation: "Cái này bao nhiêu tiền?" },
    ],
  },
  {
    id: "travel", title: "Đi lại và hỏi đường", subtitle: "Từ vựng khi di chuyển",
    words: [
      { hanzi: "車站", pinyin: "chēzhàn", meaning: "Nhà ga, bến xe", example: "車站在哪裡？", translation: "Nhà ga ở đâu?" },
      { hanzi: "左邊", pinyin: "zuǒbiān", meaning: "Bên trái", example: "銀行在左邊。", translation: "Ngân hàng ở bên trái." },
      { hanzi: "右邊", pinyin: "yòubiān", meaning: "Bên phải", example: "請往右邊走。", translation: "Vui lòng đi về bên phải." },
      { hanzi: "怎麼走", pinyin: "zěnme zǒu", meaning: "Đi đường nào", example: "去圖書館怎麼走？", translation: "Đi đến thư viện bằng đường nào?" },
    ],
  },
  {
    id: "university", title: "Đại học", subtitle: "Lớp học và thư viện",
    words: [
      { hanzi: "大學", pinyin: "dàxué", meaning: "Đại học", example: "我在大學學中文。", translation: "Tôi học tiếng Hoa ở trường đại học." },
      { hanzi: "老師", pinyin: "lǎoshī", meaning: "Giáo viên", example: "老師今天上課。", translation: "Hôm nay giáo viên lên lớp." },
      { hanzi: "圖書館", pinyin: "túshūguǎn", meaning: "Thư viện", example: "我去圖書館借書。", translation: "Tôi đến thư viện mượn sách." },
      { hanzi: "作業", pinyin: "zuòyè", meaning: "Bài tập", example: "今天有中文作業。", translation: "Hôm nay có bài tập tiếng Hoa." },
    ],
  },
  {
    id: "work", title: "Công việc", subtitle: "Giao tiếp nơi làm việc",
    words: [
      { hanzi: "上班", pinyin: "shàngbān", meaning: "Đi làm", example: "我八點上班。", translation: "Tôi đi làm lúc tám giờ." },
      { hanzi: "公司", pinyin: "gōngsī", meaning: "Công ty", example: "他在這家公司工作。", translation: "Anh ấy làm việc ở công ty này." },
      { hanzi: "同事", pinyin: "tóngshì", meaning: "Đồng nghiệp", example: "我的同事很親切。", translation: "Đồng nghiệp của tôi rất thân thiện." },
      { hanzi: "開會", pinyin: "kāihuì", meaning: "Họp", example: "我們下午要開會。", translation: "Chiều nay chúng tôi phải họp." },
    ],
  },
  {
    id: "daily-life", title: "Đời sống hằng ngày", subtitle: "Những việc thường làm",
    words: [
      { hanzi: "起床", pinyin: "qǐchuáng", meaning: "Thức dậy", example: "我每天七點起床。", translation: "Ngày nào tôi cũng dậy lúc bảy giờ." },
      { hanzi: "早餐", pinyin: "zǎocān", meaning: "Bữa sáng", example: "你吃早餐了嗎？", translation: "Bạn đã ăn sáng chưa?" },
      { hanzi: "回家", pinyin: "huíjiā", meaning: "Về nhà", example: "下班以後我就回家。", translation: "Tan làm xong tôi về nhà." },
      { hanzi: "休息", pinyin: "xiūxi", meaning: "Nghỉ ngơi", example: "週末我想在家休息。", translation: "Cuối tuần tôi muốn nghỉ ngơi ở nhà." },
    ],
  },
  {
    id: "shopping", title: "Mua sắm", subtitle: "Hỏi giá và chọn đồ",
    words: [
      { hanzi: "商店", pinyin: "shāngdiàn", meaning: "Cửa hàng", example: "這家商店很大。", translation: "Cửa hàng này rất lớn." },
      { hanzi: "買", pinyin: "mǎi", meaning: "Mua", example: "我想買一本書。", translation: "Tôi muốn mua một quyển sách." },
      { hanzi: "便宜", pinyin: "piányi", meaning: "Rẻ", example: "這件衣服很便宜。", translation: "Chiếc áo này rất rẻ." },
      { hanzi: "價格", pinyin: "jiàgé", meaning: "Giá cả", example: "這個價格可以嗎？", translation: "Mức giá này có được không?" },
    ],
  },
];

export const textbookSets: VocabularySet[] = [
  {
    id: "lesson-1", title: "Bài 1 · Làm quen", subtitle: "Đại từ và giới thiệu bản thân",
    words: [
      { hanzi: "我", pinyin: "wǒ", meaning: "Tôi", example: "我是學生。", translation: "Tôi là học sinh." },
      { hanzi: "你", pinyin: "nǐ", meaning: "Bạn", example: "你是老師嗎？", translation: "Bạn là giáo viên à?" },
      { hanzi: "叫", pinyin: "jiào", meaning: "Gọi là, tên là", example: "我叫小安。", translation: "Tôi tên là Tiểu An." },
      { hanzi: "學生", pinyin: "xuéshēng", meaning: "Học sinh", example: "他也是學生。", translation: "Anh ấy cũng là học sinh." },
    ],
  },
  {
    id: "lesson-2", title: "Bài 2 · Gia đình", subtitle: "Người thân và câu đơn giản",
    words: [
      { hanzi: "家", pinyin: "jiā", meaning: "Nhà, gia đình", example: "我家有四個人。", translation: "Gia đình tôi có bốn người." },
      { hanzi: "爸爸", pinyin: "bàba", meaning: "Bố", example: "爸爸在家。", translation: "Bố đang ở nhà." },
      { hanzi: "媽媽", pinyin: "māma", meaning: "Mẹ", example: "媽媽喜歡喝茶。", translation: "Mẹ thích uống trà." },
      { hanzi: "有", pinyin: "yǒu", meaning: "Có", example: "我有一個妹妹。", translation: "Tôi có một em gái." },
    ],
  },
  {
    id: "lesson-3", title: "Bài 3 · Mua sắm", subtitle: "Hỏi giá và lựa chọn",
    words: [
      { hanzi: "買", pinyin: "mǎi", meaning: "Mua", example: "我想買一本書。", translation: "Tôi muốn mua một quyển sách." },
      { hanzi: "喜歡", pinyin: "xǐhuan", meaning: "Thích", example: "我喜歡這件衣服。", translation: "Tôi thích chiếc áo này." },
      { hanzi: "一個", pinyin: "yí ge", meaning: "Một cái", example: "我要一個蘋果。", translation: "Tôi muốn một quả táo." },
      { hanzi: "便宜", pinyin: "piányi", meaning: "Rẻ", example: "這個很便宜。", translation: "Cái này rất rẻ." },
    ],
  },
];

// Keep course > chapter > lesson nesting so later textbook imports need no UI changes.
export const textbooks: VocabularyTextbook[] = [
  { id: "nhap-mon", title: "Giáo trình nhập môn", chapters: [
    { id: "nen-tang", title: "Nền tảng", lessons: textbookSets.slice(0, 2) },
    { id: "ung-dung", title: "Ứng dụng", lessons: textbookSets.slice(2) },
  ] },
];
