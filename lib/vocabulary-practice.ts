import type { LearnedVocabularyWord, VocabularyScript } from "./learned-vocabulary";

export type LessonLine = { vocabularyId: string; chinese: string; vietnamese: string };
export type PracticeLesson = { id: string; title: string; kind: string; lines: LessonLine[]; words: LearnedVocabularyWord[]; recentCount: number; supporting: { chinese: string; vietnamese: string | null }[] };
export type PracticeQuestion = { id: string; type: "meaning" | "blank" | "context" | "ordering" | "matching" | "comprehension" | "sentence"; vocabularyId: string; prompt: string; choices: string[]; answer: string; explanation: string };

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
    { traditional: "B：這碗麵很好吃。", simplified: "B：这碗面很好吃。", vietnamese: "B: Bát mì này rất ngon." },
  ], support: [{ traditional: "一碗", simplified: "一碗", vietnamese: "một bát" }, { traditional: "麵", simplified: "面", vietnamese: "mì" }] },
  { title: "Một ngày thường", kind: "Đoạn văn", lines: [
    { traditional: "我每天七點起床，然後吃早餐。", simplified: "我每天七点起床，然后吃早餐。", vietnamese: "Ngày nào tôi cũng dậy lúc bảy giờ, sau đó ăn sáng." },
    { traditional: "吃完早餐，我去公司上班。", simplified: "吃完早餐，我去公司上班。", vietnamese: "Ăn sáng xong, tôi đến công ty làm việc." },
    { traditional: "下班以後，我回家休息。", simplified: "下班以后，我回家休息。", vietnamese: "Tan làm xong, tôi về nhà nghỉ ngơi." },
  ], support: [{ traditional: "然後", simplified: "然后", vietnamese: "sau đó" }, { traditional: "以後", simplified: "以后", vietnamese: "sau khi" }] },
  { title: "Mua một chiếc áo", kind: "Đoạn văn", lines: [
    { traditional: "我在商店看見一件衣服。", simplified: "我在商店看见一件衣服。", vietnamese: "Tôi nhìn thấy một chiếc áo trong cửa hàng." },
    { traditional: "我很喜歡，但是不知道價格。", simplified: "我很喜欢，但是不知道价格。", vietnamese: "Tôi rất thích, nhưng không biết giá." },
    { traditional: "我問店員：「這個多少錢？」店員說：「今天很便宜。」", simplified: "我问店员：“这个多少钱？”店员说：“今天很便宜。”", vietnamese: "Tôi hỏi nhân viên: “Cái này bao nhiêu tiền?” Nhân viên nói: “Hôm nay rẻ lắm.”" },
    { traditional: "我就買了。", simplified: "我就买了。", vietnamese: "Thế là tôi mua." },
  ], support: [{ traditional: "店員", simplified: "店员", vietnamese: "nhân viên cửa hàng" }, { traditional: "衣服", simplified: "衣服", vietnamese: "quần áo" }] },
  { title: "Hỏi đường đến ga", kind: "Hội thoại", lines: [
    { traditional: "A：請問，去車站怎麼走？", simplified: "A：请问，去车站怎么走？", vietnamese: "A: Xin hỏi, đi đến ga như thế nào?" },
    { traditional: "B：先往左邊走，到了路口再往右邊走。", simplified: "B：先往左边走，到了路口再往右边走。", vietnamese: "B: Đi về bên trái trước, đến ngã đường thì rẽ phải." },
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
];

const topicalSignals: { name: string; words: string[] }[] = [
  { name: "Ở quán ăn", words: ["吃", "喝", "飯", "菜", "餐", "茶", "咖啡", "麵", "餓", "好吃"] },
  { name: "Một ngày thường", words: ["起床", "早餐", "回家", "休息", "睡", "洗", "晚餐"] },
  { name: "Ở trường", words: ["學", "老師", "學生", "課", "作業", "圖書館", "考試", "同學"] },
  { name: "Ở nơi làm việc", words: ["工作", "公司", "上班", "同事", "開會", "老闆", "辦公"] },
  { name: "Mua sắm", words: ["買", "商店", "價格", "便宜", "錢", "超市", "賣"] },
  { name: "Đi lại ở Đài Loan", words: ["車", "站", "左邊", "右邊", "走", "交通", "路", "票"] },
  { name: "Gia đình", words: ["家", "爸爸", "媽媽", "孩子", "兄弟", "姐妹"] },
  { name: "Sức khỏe", words: ["醫", "病", "藥", "健康", "身體", "痛"] },
];
const readingSequence: Record<string, string[]> = {
  "Ở quán ăn": ["早餐", "菜單", "我要", "好吃", "多少錢"],
  "Một ngày thường": ["起床", "早餐", "上班", "下班", "回家", "休息"],
  "Ở trường": ["大學", "學生", "老師", "圖書館", "作業", "考試"],
  "Ở nơi làm việc": ["公司", "上班", "同事", "開會", "下班"],
  "Mua sắm": ["商店", "價格", "便宜", "買"],
  "Đi lại ở Đài Loan": ["車站", "怎麼走", "左邊", "右邊", "車票"],
};
const helperWords = [
  { traditional: "我", simplified: "我", vietnamese: "tôi" }, { traditional: "你", simplified: "你", vietnamese: "bạn" },
  { traditional: "他", simplified: "他", vietnamese: "anh ấy" }, { traditional: "她", simplified: "她", vietnamese: "cô ấy" },
  { traditional: "我們", simplified: "我们", vietnamese: "chúng tôi/chúng ta" }, { traditional: "今天", simplified: "今天", vietnamese: "hôm nay" },
  { traditional: "明天", simplified: "明天", vietnamese: "ngày mai" }, { traditional: "這個", simplified: "这个", vietnamese: "cái này" },
  { traditional: "那個", simplified: "那个", vietnamese: "cái đó" }, { traditional: "可以", simplified: "可以", vietnamese: "có thể/được" },
  { traditional: "喜歡", simplified: "喜欢", vietnamese: "thích" }, { traditional: "去", simplified: "去", vietnamese: "đi" },
  { traditional: "來", simplified: "来", vietnamese: "đến" }, { traditional: "要", simplified: "要", vietnamese: "muốn/cần" },
  { traditional: "有", simplified: "有", vietnamese: "có" }, { traditional: "在", simplified: "在", vietnamese: "ở/đang" },
  { traditional: "很", simplified: "很", vietnamese: "rất" }, { traditional: "不", simplified: "不", vietnamese: "không" },
  { traditional: "是", simplified: "是", vietnamese: "là" }, { traditional: "的", simplified: "的", vietnamese: "trợ từ sở hữu" },
  { traditional: "這", simplified: "这", vietnamese: "này" }, { traditional: "請", simplified: "请", vietnamese: "xin vui lòng" },
  { traditional: "給", simplified: "给", vietnamese: "đưa/cho" }, { traditional: "碗", simplified: "碗", vietnamese: "bát" },
  { traditional: "麵", simplified: "面", vietnamese: "mì" }, { traditional: "很好", simplified: "很好", vietnamese: "rất tốt/rất ngon" },
  { traditional: "了", simplified: "了", vietnamese: "trợ từ chỉ sự hoàn thành" }, { traditional: "嗎", simplified: "吗", vietnamese: "trợ từ nghi vấn" },
  { traditional: "吃", simplified: "吃", vietnamese: "ăn" }, { traditional: "再", simplified: "再", vietnamese: "rồi/lại" },
  { traditional: "然後", simplified: "然后", vietnamese: "sau đó" }, { traditional: "一", simplified: "一", vietnamese: "một" },
  { traditional: "個", simplified: "个", vietnamese: "lượng từ cái" }, { traditional: "和", simplified: "和", vietnamese: "và" },
];

export function wordForm(word: LearnedVocabularyWord, script: VocabularyScript): string { return script === "simplified" ? word.simplified : word.traditional; }
export function exampleForm(word: LearnedVocabularyWord, script: VocabularyScript): string { return script === "simplified" ? word.exampleSimplified : word.exampleTraditional; }
export function bandRank(word: LearnedVocabularyWord): number { return ({ novice: 0, band_a: 1, band_b: 2, band_c: 3 } as Record<string, number>)[word.band ?? ""] ?? 0; }

function supportingIn(lines: LessonLine[], pool: LearnedVocabularyWord[], script: VocabularyScript, explicit: { chinese: string; vietnamese: string }[] = []) {
  const known = pool.map((word) => wordForm(word, script));
  const definitions = new Map([...helperWords.map((item) => [script === "simplified" ? item.simplified : item.traditional, item.vietnamese] as const),
    ...explicit.map((item) => [item.chinese, item.vietnamese] as const)]);
  const segmented = [...new Intl.Segmenter("zh", { granularity: "word" }).segment(lines.map((line) => line.chinese).join(" "))];
  const tokens = segmented.map((item) => item.segment).filter((item) => /\p{Script=Han}/u.test(item));
  for (const [text] of definitions) if (lines.some((line) => line.chinese.includes(text))) tokens.push(text);
  const unique = [...new Set(tokens)];
  return unique.filter((token) => !known.some((form) => form.includes(token))
    && !unique.some((other) => other !== token && other.includes(token) && definitions.has(other)))
    .map((chinese) => ({ chinese, vietnamese: definitions.get(chinese) ?? null }));
}

export function buildLesson(pool: LearnedVocabularyWord[], script: VocabularyScript, offset = 0): PracticeLesson | null {
  const eligible = pool.filter((word) => word.meaningVi.trim() && exampleForm(word, script).trim() && word.exampleVi.trim() && exampleForm(word, script).includes(wordForm(word, script)));
  if (!eligible.length) return null;
  const recent = [...eligible].sort((a, b) => Date.parse(b.learnedAt) - Date.parse(a.learnedAt)).slice(offset * 15, offset * 15 + 15);
  const candidates = recent.length ? recent : eligible.slice(0, 15);
  const targetRank = Math.max(...candidates.map(bandRank));
  if (targetRank <= 1) {
    const matching = curatedLessons.map((template) => {
      const content = template.lines.map((line) => script === "simplified" ? line.simplified : line.traditional).join(" ");
      const words = candidates.filter((word) => content.includes(wordForm(word, script))).slice(0, 10);
      return { template, words };
    }).sort((a, b) => b.words.length - a.words.length)[offset % curatedLessons.length];
    if (matching && matching.words.length >= 3) {
      const { template, words } = matching;
      const lines = template.lines.map((line) => ({ vocabularyId: words.find((word) => (script === "simplified" ? line.simplified : line.traditional).includes(wordForm(word, script)))?.vocabularyId ?? "",
        chinese: script === "simplified" ? line.simplified : line.traditional, vietnamese: line.vietnamese }));
      const supporting = supportingIn(lines, pool, script, template.support.map((item) => ({ chinese: script === "simplified" ? item.simplified : item.traditional, vietnamese: item.vietnamese })));
      return { id: `curated:${script}:${template.title}:${words.map((word) => word.vocabularyId).join("|")}`, title: template.title, kind: template.kind, lines, words, recentCount: candidates.length, supporting };
    }
  }
  const levelFit = candidates.filter((word) => bandRank(word) <= targetRank);
  const topic = [...topicalSignals].sort((a, b) => {
    const score = (entry: typeof a) => levelFit.filter((word) => entry.words.some((token) => word.traditional.includes(token))).length;
    return score(b) - score(a);
  })[0];
  const topical = levelFit.filter((word) => topic.words.some((token) => word.traditional.includes(token)));
  const orderInTopic = (word: LearnedVocabularyWord) => {
    const sequence = readingSequence[topic.name] ?? topic.words;
    const index = sequence.findIndex((token) => word.traditional.includes(token));
    return index < 0 ? 999 : index;
  };
  const selected = [...(topical.length >= 2 ? topical : levelFit)].sort((a, b) => orderInTopic(a) - orderInTopic(b)).slice(0, 10);
  const lines = selected.map((word) => ({ vocabularyId: word.vocabularyId, chinese: exampleForm(word, script), vietnamese: word.exampleVi }));
  const supporting = supportingIn(lines, pool, script);
  return { id: `${script}:${offset}:${selected.map((word) => word.vocabularyId).join("|")}`, title: topical.length >= 2 ? topic.name : "Những tình huống gần bạn",
    kind: lines.length > 1 ? "Các tình huống ngắn" : "Câu trong tình huống", lines, words: selected, recentCount: candidates.length,
    supporting,
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
    if (type === "comprehension") { prompt = `Chọn câu trong bài khóa tương ứng với lời dịch: “${sentenceVi}”`; choices = rotated([...new Set(lesson.lines.map((line) => line.chinese))], index); answer = sentence; explanation = `Bài khóa có câu: ${sentence}`; }
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
