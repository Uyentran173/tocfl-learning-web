import type { TocflVocabularyRecord } from "./tocfl-vocabulary-types";
import type { VocabularySet, VocabularyTextbook } from "./vocabulary";

export const contextTopics = [
  { id: "daily", label: "Đời sống hằng ngày", aliases: ["sinh hoạt"], contexts: ["日常生活"], terms: "生活 日常 起床 睡覺 洗澡 休息 早餐 午餐 晚餐 家務 打掃 整理 出門 回家 習慣 洗衣 散步 睡眠 鬧鐘 梳洗", stems: ["生活", "日常", "起床", "睡覺", "洗澡", "休息", "早餐", "午餐", "晚餐", "家務", "打掃", "整理", "出門", "回家", "習慣", "洗衣", "散步", "睡眠"] },
  { id: "food", label: "Ăn uống", aliases: ["đồ ăn", "ẩm thực"], contexts: ["飲食"], terms: "吃 喝 飯 菜 湯 肉 魚 水果 麵 包子 餐廳 飯店 菜單 飲料 咖啡 茶 食物 食品 點心 甜點 早餐 午餐 晚餐 廚房 廚師 筷子 碗 盤子 餓 飽 好吃", stems: ["餐", "飲", "食", "飯", "菜", "湯", "水果", "咖啡", "廚", "烤", "煮", "味道", "點心", "甜點", "筷", "饅頭", "餃子", "豆腐", "牛奶", "雞蛋"] },
  { id: "travel", label: "Du lịch", aliases: ["đi chơi"], contexts: ["旅行"], terms: "旅行 旅遊 遊客 旅客 旅館 飯店 護照 簽證 行李 機票 機場 景點 觀光 出國 地圖 導遊 住宿 假期 度假 訂房 飛機 火車 車票 巴士 地鐵 捷運 車站 班機 左邊 右邊 怎麼走", stems: ["旅", "觀光", "護照", "簽證", "行李", "機票", "機場", "景點", "導遊", "住宿", "度假", "訂房", "航班", "登機", "出國", "車票", "車站", "火車", "飛機"] },
  { id: "school", label: "Trường học", aliases: ["học tập", "giáo dục"], contexts: ["教育"], terms: "學生 老師 學校 大學 教室 課本 課程 作業 考試 成績 畢業 論文 教授 同學 圖書館 筆記 學習 教育 學期 獎學金 留學", stems: ["學校", "大學", "教室", "課程", "作業", "考試", "成績", "畢業", "論文", "教授", "同學", "圖書館", "筆記", "學習", "教育", "學期", "獎學金", "留學", "教材", "講座"] },
  { id: "work", label: "Công việc", aliases: ["nghề nghiệp", "việc làm"], contexts: ["工作"], terms: "工作 公司 同事 老闆 上班 下班 加班 職業 職位 薪水 工資 會議 經理 面試 履歷 求職 辦公室 員工 客戶 商業 企業", stems: ["工作", "公司", "同事", "老闆", "上班", "下班", "加班", "職業", "職位", "薪", "工資", "會議", "經理", "面試", "履歷", "求職", "辦公", "員工", "客戶", "企業", "招聘"] },
  { id: "shopping", label: "Mua sắm", aliases: ["mua hàng"], contexts: ["購物"], terms: "買 賣 商店 超市 商品 價格 價錢 便宜 貴 折扣 打折 付款 收銀 購物 退貨 顧客 市場 逛街 發票 付款方式", stems: ["購物", "商店", "超市", "商品", "價格", "價錢", "便宜", "折扣", "打折", "付款", "收銀", "退貨", "顧客", "市場", "逛街", "發票", "訂購", "消費"] },
  { id: "housing", label: "Nhà ở", aliases: ["nhà cửa"], contexts: ["房屋與家庭、環境"], terms: "家 房子 房屋 公寓 房間 廚房 客廳 臥室 浴室 家具 租房 租金 房東 搬家 鄰居 門 窗 樓 房租", stems: ["房子", "房屋", "公寓", "房間", "廚房", "客廳", "臥室", "浴室", "家具", "租房", "租金", "房東", "搬家", "鄰居", "房租", "屋頂", "陽台", "水電"] },
  { id: "transport", label: "Giao thông", aliases: ["đi lại", "phương tiện"], contexts: [], terms: "車 汽車 公車 火車 捷運 地鐵 車站 交通 路口 司機 飛機 船 計程車 巴士 停車 轉車 搭車 開車 騎車 車票 馬路 電車 車禍 卡車 鐵路 紅綠燈 迷路 左邊 右邊 怎麼走", stems: ["汽車", "公車", "火車", "捷運", "地鐵", "車站", "交通", "路口", "司機", "飛機", "計程車", "巴士", "停車", "轉車", "搭車", "開車", "騎車", "車票", "馬路", "自行車", "機車", "電車", "車禍", "卡車", "鐵路", "紅綠燈"] },
  { id: "health", label: "Y tế", aliases: ["sức khỏe"], contexts: ["健康及身體照護"], terms: "醫生 醫院 護士 病人 看病 感冒 發燒 頭痛 藥 健康 身體 治療 手術 症狀 牙醫 病床", stems: ["醫", "病", "護士", "感冒", "發燒", "頭痛", "藥", "健康", "身體", "治療", "手術", "症狀", "保健", "疼痛", "診所", "急診"] },
  { id: "technology", label: "Công nghệ", aliases: ["kỹ thuật số"], contexts: [], terms: "電腦 手機 網路 網站 軟體 硬體 程式 數位 電池 鍵盤 滑鼠 螢幕 資訊 科技 技術 機器 資料 簡訊 上網 密碼 電子郵件", stems: ["電腦", "手機", "網路", "網站", "軟體", "硬體", "程式", "數位", "電池", "鍵盤", "滑鼠", "螢幕", "資訊", "科技", "技術", "機器", "資料", "簡訊", "上網", "密碼", "電子"] },
  { id: "family", label: "Gia đình", aliases: ["người thân", "họ hàng"], contexts: ["與他人的關係"], terms: "家人 家庭 爸爸 媽媽 父親 母親 兒子 女兒 兄弟 姐妹 爺爺 奶奶 夫妻 結婚 孩子 親戚", stems: ["家人", "家庭", "爸爸", "媽媽", "父親", "母親", "兒子", "女兒", "兄弟", "姐妹", "爺爺", "奶奶", "夫妻", "結婚", "孩子", "親戚", "祖父", "祖母"] },
  { id: "entertainment", label: "Giải trí", aliases: ["sở thích"], contexts: ["閒暇時間、娛樂"], terms: "電影 音樂 唱歌 跳舞 遊戲 電視 電影院 演唱會 樂器 小說 閱讀 旅行 興趣 娛樂", stems: ["電影", "音樂", "唱歌", "跳舞", "遊戲", "電視", "演唱", "樂器", "小說", "閱讀", "興趣", "娛樂", "表演", "劇院"] },
  { id: "sports", label: "Thể thao", aliases: ["vận động"], contexts: [], terms: "運動 體育 足球 籃球 游泳 跑步 比賽 球員 教練 健身 網球 棒球 羽毛球", stems: ["運動", "體育", "足球", "籃球", "游泳", "跑步", "比賽", "球員", "教練", "健身", "網球", "棒球", "羽毛球", "體操"] },
  { id: "money", label: "Tiền bạc", aliases: ["tài chính"], contexts: [], terms: "錢 銀行 帳戶 存款 貸款 利息 收入 支出 預算 現金 信用卡 投資 金融 付錢", stems: ["銀行", "帳戶", "存款", "貸款", "利息", "收入", "支出", "預算", "現金", "信用卡", "投資", "金融", "付款", "經濟"] },
  { id: "environment", label: "Môi trường", aliases: ["thiên nhiên", "bảo vệ môi trường"], contexts: [], terms: "環境 自然 氣候 污染 回收 垃圾 地球 森林 海洋 空氣 節能 保護 生態", stems: ["環境", "自然", "氣候", "污染", "回收", "垃圾", "地球", "森林", "海洋", "空氣", "節能", "生態", "環保", "能源"] },
] as const;

export const contextPurposes = [
  { id: "daily", label: "Giao tiếp hằng ngày", topics: ["daily", "family", "food", "shopping"] },
  { id: "study", label: "Du học Đài Loan", topics: ["school", "housing", "transport", "food"] },
  { id: "tocfl", label: "Luyện TOCFL", topics: [] },
  { id: "work", label: "Công việc", topics: ["work", "technology", "money"] },
  { id: "travel", label: "Du lịch", topics: ["travel", "transport", "food", "shopping"] },
  { id: "reading", label: "Đọc hiểu", topics: ["school", "technology", "environment"] },
  { id: "writing", label: "Viết", topics: ["school", "work", "environment"] },
] as const;

export const contextDifficulties = [
  { id: "basic", label: "Cơ bản" },
  { id: "intermediate", label: "Trung cấp" },
  { id: "advanced", label: "Nâng cao" },
] as const;

export const contextSources = [
  { id: "auto", label: "Tự động · ưu tiên TOCFL" },
  { id: "tocfl", label: "Từ vựng TOCFL chính thức" },
  { id: "textbook", label: "Từ vựng từ giáo trình" },
  { id: "website", label: "Kho từ vựng của website" },
] as const;

export type ContextSource = "tocfl" | "textbook" | "website";
export type ContextRequest = { topicId: string; customTopic?: string; purpose: string; difficulty: string; script: "traditional" | "simplified"; count: 10 | 20 | 30; source: "auto" | ContextSource };
export type ContextWord = {
  id: string; source: ContextSource; traditional: string; simplified: string; pinyin: string;
  meaningVi: string; wordClass: string | null; exampleTraditional: string; exampleSimplified: string;
  exampleVi: string; band: string | null; level: string | null; context: string | null;
  topics: string[]; exampleSource?: { kind: "tatoeba"; id: string; author: string };
};

const manualTopics: Record<string, string[]> = {
  greetings: ["daily"],
};

// These phrases classify existing Vietnamese meanings; they never create vocabulary content.
// Whole-word matching avoids accidental matches such as "xe" in "xem" or "nhà" in "nhà văn".
const meaningPhrases: Record<string, string[]> = {
  daily: ["cuộc sống", "sinh hoạt", "thói quen", "thức dậy", "ngủ", "giặt", "dọn dẹp", "nghỉ ngơi", "đồng hồ báo thức", "vệ sinh", "tắm", "quần áo", "chăn", "gối", "bàn chải", "kem đánh răng"],
  food: ["món ăn", "đồ ăn", "thức ăn", "rau", "cơm", "thịt", "cá", "bánh", "nấu", "nhà hàng", "bữa ăn", "đồ uống", "đầu bếp", "trái cây", "tráng miệng", "gia vị", "ăn sáng", "ăn trưa", "ăn tối"],
  travel: ["du lịch", "du khách", "hộ chiếu", "khách sạn", "tham quan", "chuyến bay", "vé máy bay", "hành lý", "điểm đến", "thắng cảnh", "nghỉ mát", "đi du lịch", "lữ hành"],
  school: ["giáo viên", "học sinh", "sinh viên", "trường học", "bài tập", "bài học", "thi cử", "khóa học", "giảng viên", "đại học", "giáo dục", "học bổng", "thư viện", "môn học", "luận văn", "tốt nghiệp", "bảng điểm"],
  work: ["công việc", "nhân viên", "công ty", "nghề nghiệp", "văn phòng", "làm thêm giờ", "đi làm", "hội nghị", "doanh nghiệp", "tiền lương", "quản lý", "khách hàng", "xin việc", "phỏng vấn", "đồng nghiệp", "chủ doanh nghiệp"],
  shopping: ["cửa hàng", "mua sắm", "giá cả", "giảm giá", "sản phẩm", "hàng hóa", "người mua", "đặt hàng", "trả tiền", "hóa đơn", "siêu thị", "khách hàng", "bán hàng", "mua hàng"],
  housing: ["nhà ở", "phòng ngủ", "phòng khách", "phòng tắm", "căn hộ", "thuê nhà", "nội thất", "cửa sổ", "hàng xóm", "chuyển nhà", "chủ nhà", "tiền thuê", "tầng nhà", "ngôi nhà", "căn phòng"],
  transport: ["xe buýt", "xe tải", "xe điện", "tàu điện", "tàu hỏa", "đường sắt", "giao thông", "lái xe", "đỗ xe", "vé xe", "trạm xe", "xe máy", "xe đạp", "máy bay", "con đường", "lộ trình", "tắc đường"],
  health: ["bệnh", "sức khỏe", "thuốc", "bác sĩ", "y tá", "cơn đau", "đau đầu", "đau bụng", "sốt", "triệu chứng", "điều trị", "bệnh viện", "khám bệnh", "phẫu thuật", "cấp cứu", "chăm sóc sức khỏe"],
  technology: ["công nghệ", "máy tính", "điện thoại", "mạng internet", "phần mềm", "thiết bị điện tử", "điện tử", "dữ liệu", "internet", "kỹ thuật", "máy móc", "trang web", "ứng dụng", "thông tin liên lạc"],
  family: ["gia đình", "người thân", "cha mẹ", "con cái", "anh chị em", "bố", "mẹ", "ông nội", "bà nội", "ông ngoại", "bà ngoại", "họ hàng", "vợ", "chồng", "con trai", "con gái"],
  entertainment: ["phim", "âm nhạc", "bài hát", "ca hát", "nhảy múa", "trò chơi", "giải trí", "sở thích", "biểu diễn", "tiểu thuyết", "đọc sách", "nhạc cụ", "buổi hòa nhạc"],
  sports: ["thể thao", "bóng đá", "bóng rổ", "bóng chuyền", "bóng bàn", "bơi lội", "chạy bộ", "vận động viên", "huấn luyện viên", "trận đấu", "tập thể dục", "đội bóng"],
  money: ["tiền bạc", "ngân hàng", "tài chính", "tiền lương", "tiền gửi", "khoản vay", "lãi suất", "thu nhập", "chi tiêu", "tiền mặt", "đầu tư", "tiết kiệm tiền", "chuyển khoản", "tài khoản", "tiền cọc"],
  environment: ["môi trường", "thiên nhiên", "khí hậu", "ô nhiễm", "tái chế", "rác thải", "trái đất", "rừng", "đại dương", "không khí", "năng lượng", "sinh thái", "bảo vệ môi trường"],
};

const topicExclusions: Record<string, string[]> = {
  work: ["百貨公司"], health: ["毛病", "抽", "壞處"],
  family: ["母語"], entertainment: ["書房", "念書/唸書"],
};

const customSubtopics: Record<string, string[]> = {
  "am nhac": ["音樂", "歌曲", "唱歌", "歌手", "樂器", "演唱", "旋律", "吉他", "鋼琴"],
  "phim anh": ["電影", "電影院", "影片", "演員", "導演", "劇情", "電視劇"],
  "nau an": ["煮", "炒", "烤", "廚", "菜", "食譜", "調味"],
  "bong da": ["足球", "球員", "球隊", "球場", "比賽", "教練"],
  "khach san": ["旅館", "飯店", "住宿", "客房", "訂房", "櫃檯"],
  "may tinh": ["電腦", "鍵盤", "滑鼠", "螢幕", "軟體", "程式", "網路"],
};

function containsMeaningPhrase(meaning: string, phrase: string): boolean {
  const clean = (text: string) => text.normalize("NFC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  return ` ${clean(meaning)} `.includes(` ${clean(phrase)} `);
}

const manualWordClasses: Record<string, string> = {
  你好: "Câu chào", 謝謝: "Thán từ", 再見: "Câu chào", 名字: "Danh từ", 菜單: "Danh từ", 好吃: "Tính từ", 我要: "Cụm từ", 多少錢: "Cụm hỏi",
  車站: "Danh từ", 左邊: "Danh từ chỉ vị trí", 右邊: "Danh từ chỉ vị trí", 怎麼走: "Cụm hỏi", 大學: "Danh từ", 老師: "Danh từ", 圖書館: "Danh từ", 作業: "Danh từ",
  上班: "Động từ", 公司: "Danh từ", 同事: "Danh từ", 開會: "Động từ", 起床: "Động từ", 早餐: "Danh từ", 回家: "Động từ", 休息: "Động từ",
  商店: "Danh từ", 買: "Động từ", 便宜: "Tính từ", 價格: "Danh từ", 我: "Đại từ", 你: "Đại từ", 叫: "Động từ", 學生: "Danh từ",
  家: "Danh từ", 爸爸: "Danh từ", 媽媽: "Danh từ", 有: "Động từ", 喜歡: "Động từ", 一個: "Cụm số lượng",
};

// The small, existing website/textbook sets use these verified character forms. The official
// dataset already supplies its own Simplified fields and never passes through this map.
const manualScriptPairs = ["興兴", "認认", "識识", "謝谢", "幫帮", "見见", "麼么", "單单", "給给", "這这", "麵面", "錢钱", "車车", "裡里", "銀银", "邊边", "請请", "圖图", "書书", "館馆", "學学", "師师", "課课", "業业", "親亲", "會会", "歡欢", "週周", "價价", "個个", "蘋苹", "買买", "點点", "後后", "們们", "開开", "長长", "還还", "覺觉", "兒儿", "樣样", "嗎吗", "媽妈"];
const manualScriptMap = new Map(manualScriptPairs.map((pair) => [pair[0], pair[1]]));
export function simplifyManualText(text: string): string {
  return Array.from(text, (character) => manualScriptMap.get(character) ?? character).join("");
}

export function createContextCandidates(
  official: TocflVocabularyRecord[],
  enrichment: Record<string, Pick<TocflVocabularyRecord, "meaningVi" | "exampleTraditional" | "exampleSimplified" | "exampleVi" | "exampleSource">>,
  websiteSets: VocabularySet[],
  textbookCatalog: VocabularyTextbook[],
): ContextWord[] {
  const words: ContextWord[] = [];
  for (const record of official) {
    const extra = enrichment[record.id];
    if (!record.traditional || !record.simplified || !record.pinyin || !extra?.meaningVi || !extra.exampleTraditional || !extra.exampleSimplified || !extra.exampleVi) continue;
    words.push({ id: record.id, source: "tocfl", traditional: record.traditional, simplified: record.simplified, pinyin: record.pinyin,
      meaningVi: extra.meaningVi, wordClass: record.partOfSpeech.raw, exampleTraditional: extra.exampleTraditional,
      exampleSimplified: extra.exampleSimplified, exampleVi: extra.exampleVi, band: record.band, level: record.levelId,
      context: record.context, topics: [], exampleSource: extra.exampleSource ?? undefined });
  }
  const addManual = (sets: VocabularySet[], source: "website" | "textbook") => {
    for (const set of sets) for (const [index, word] of set.words.entries()) {
      words.push({ id: `${source}:${set.id}:${index}`, source, traditional: word.hanzi,
        simplified: simplifyManualText(word.hanzi), pinyin: word.pinyin, meaningVi: word.meaning,
        wordClass: manualWordClasses[word.hanzi] ?? null, exampleTraditional: word.example,
        exampleSimplified: simplifyManualText(word.example), exampleVi: word.translation,
        band: null, level: null, context: null, topics: manualTopics[set.id] ?? [] });
    }
  };
  addManual(websiteSets, "website");
  addManual(textbookCatalog.flatMap((book) => book.chapters.flatMap((chapter) => chapter.lessons)), "textbook");
  return words;
}

function normalize(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").toLowerCase().trim().replace(/\s+/g, " ");
}

export function parseContextRequest(value: unknown): ContextRequest | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  if (typeof input.topicId !== "string" || !(input.topicId === "custom" || contextTopics.some((item) => item.id === input.topicId))) return null;
  if (input.topicId === "custom" && (typeof input.customTopic !== "string" || input.customTopic.trim().length < 2 || input.customTopic.trim().length > 60)) return null;
  if (typeof input.purpose !== "string" || !contextPurposes.some((item) => item.id === input.purpose)) return null;
  if (typeof input.difficulty !== "string" || !contextDifficulties.some((item) => item.id === input.difficulty)) return null;
  if (input.script !== "traditional" && input.script !== "simplified") return null;
  if (input.count !== 10 && input.count !== 20 && input.count !== 30) return null;
  if (typeof input.source !== "string" || !contextSources.some((item) => item.id === input.source)) return null;
  return { topicId: input.topicId, ...(input.topicId === "custom" ? { customTopic: (input.customTopic as string).trim() } : {}),
    purpose: input.purpose, difficulty: input.difficulty, script: input.script, count: input.count, source: input.source as ContextRequest["source"] };
}

function topicFor(request: ContextRequest) {
  if (request.topicId !== "custom") return contextTopics.find((item) => item.id === request.topicId);
  const query = normalize(request.customTopic ?? "");
  return contextTopics.find((item) => [item.label, ...item.aliases].some((alias) => normalize(alias) === query));
}

function difficultyMatches(word: ContextWord, difficulty: string): boolean {
  if (word.source !== "tocfl") return difficulty === "basic"; // Existing manually entered sets are introductory; no certified level.
  if (difficulty === "basic") return ["novice_1", "novice_2", "level_1", "level_2"].includes(word.level ?? "");
  if (difficulty === "intermediate") return ["level_2", "level_3"].includes(word.level ?? "");
  return word.level === "level_4"; // Band C currently has no reviewed meanings/examples.
}

function purposeRelevance(word: ContextWord, request: ContextRequest, topicId?: string): number {
  let score = 0;
  const purpose = contextPurposes.find((item) => item.id === request.purpose);
  const forms = `${word.traditional} ${word.simplified}`;
  if (topicId && (purpose?.topics as readonly string[] | undefined)?.includes(topicId)) score += 8;
  if (purpose && purpose.topics.some((id) => id !== topicId && contextTopics.find((item) => item.id === id)?.stems.some((stem) => forms.includes(stem)))) score += 6;
  if (request.purpose === "daily" && /^(V|Động từ)/.test(word.wordClass ?? "")) score += 5;
  if (request.purpose === "daily" && ["novice_1", "novice_2", "level_1"].includes(word.level ?? "")) score += 3;
  if (request.purpose === "reading" && /^(N|Danh từ)/.test(word.wordClass ?? "")) score += 6;
  if (request.purpose === "writing" && /^(Conj|V|Động từ)/.test(word.wordClass ?? "")) score += 6;
  if (["reading", "writing"].includes(request.purpose) && Array.from(word.traditional).length >= 2) score += 2;
  return score;
}

function relevance(word: ContextWord, request: ContextRequest): number {
  const topic = topicFor(request);
  if (!topic) {
    const query = normalize(request.customTopic ?? "");
    if (!query || query.length < 2) return 0;
    const chinese = request.customTopic ?? "";
    if (/\p{Script=Han}/u.test(chinese) && (word.traditional.includes(chinese) || word.simplified.includes(chinese))) return 100 + purposeRelevance(word, request);
    if (customSubtopics[query]?.some((term) => word.traditional.includes(term) || word.simplified.includes(term))) return 90 + purposeRelevance(word, request);
    if (containsMeaningPhrase(word.meaningVi, request.customTopic ?? "")) return 80 + purposeRelevance(word, request);
    return 0;
  }
  const forms = `${word.traditional} ${word.simplified}`;
  if (word.wordClass === "M") return 0;
  if (topicExclusions[topic.id]?.includes(word.traditional)) return 0;
  const terms = topic.terms.split(" ");
  const exact = terms.includes(word.traditional) || terms.includes(word.simplified);
  const stem = topic.stems.some((item) => forms.includes(item));
  const tagged = word.topics.includes(topic.id);
  const context = topic.contexts.some((item) => word.context === item);
  const meaning = meaningPhrases[topic.id]?.some((phrase) => containsMeaningPhrase(word.meaningVi, phrase));
  if (!exact && !stem && !tagged && !meaning) return 0;
  let score = exact ? 100 : stem ? 80 : tagged ? 70 : 60;
  if (tagged) score += 10;
  if (context) score += 5;
  if (request.source === "auto" && word.source === "tocfl") score += 15;
  score += purposeRelevance(word, request, topic.id);
  return score;
}

export function selectContextVocabulary(words: ContextWord[], request: ContextRequest) {
  const eligible = words.filter((word) => difficultyMatches(word, request.difficulty)
    && (request.source === "auto" ? request.purpose !== "tocfl" || word.source === "tocfl" : word.source === request.source)
    && (request.script === "traditional" ? word.traditional && word.exampleTraditional : word.simplified && word.exampleSimplified));
  const scored = eligible.map((word) => ({ word, score: relevance(word, request) })).filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score
      || (left.word.source === "tocfl" ? -1 : 0) - (right.word.source === "tocfl" ? -1 : 0)
      || left.word.id.localeCompare(right.word.id));
  const unique = new Map<string, ContextWord>();
  for (const item of scored) {
    const key = item.word.traditional.split(/[\/／]/)[0].replace(/\([^)]*\)/g, "").replace(/\s/g, "").trim();
    if (!unique.has(key)) unique.set(key, item.word);
  }
  const selected = [...unique.values()].slice(0, request.count);
  return { words: selected, available: unique.size, topicLabel: request.topicId === "custom" ? request.customTopic?.trim() ?? "" : topicFor(request)?.label ?? "" };
}
