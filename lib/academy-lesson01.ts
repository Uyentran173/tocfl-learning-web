import type { AcademyLessonContent, AcademyQuestion } from "./academy-catalog";
import { cc1Lesson01Words } from "./cc1-lesson01-vocabulary.ts";

const option = (a: string, b: string, c: string, d?: string) => [a, b, c, ...(d ? [d] : [])].map((text, index) => ({ id: "abcd"[index], text }));
const question = (number: number, prompt: string, choices: string[], correct: string, feedback: string, skill: string, extra: Partial<AcademyQuestion> = {}): AcademyQuestion => ({
  id: `cc1-v1-l01-practice-${String(number).padStart(2, "0")}`, prompt, options: option(choices[0], choices[1], choices[2], choices[3]), correctOptionId: correct, feedback, skill, ...extra,
});
const assessment = (number: number, prompt: string, choices: string[], correct: string, feedback: string, skill: string): AcademyQuestion => ({
  id: `cc1-v1-l01-assessment-${String(number).padStart(2, "0")}`, prompt, options: option(choices[0], choices[1], choices[2], choices[3]), correctOptionId: correct, feedback, skill,
});

export const academyLesson01: AcademyLessonContent = {
  contentVersion: 2,
  id: "cc1-v1-l01",
  title: "歡迎你來臺灣！",
  titleVi: "Chào mừng bạn đến Đài Loan!",
  description: "Chào hỏi, giới thiệu bản thân và trò chuyện về đồ uống trong những lần gặp đầu tiên.",
  objectives: ["Chào hỏi, hỏi họ tên và giới thiệu người khác", "Hỏi và trả lời về quốc tịch, sở thích uống trà hoặc cà phê", "Dùng đúng 嗎, mẫu A 不 A, 很 và 呢 trong hội thoại ngắn"],
  estimatedMinutes: null,
  lecture: {
    introduction: "Khi mới gặp một người ở Đài Loan, bạn thường bắt đầu bằng lời chào, hỏi họ tên, rồi nói vài câu đơn giản về mình. Bài này đưa bạn từ một cuộc gặp gỡ đến lời mời uống trà, để bạn dùng ngay những mẫu câu đầu tiên.",
    sections: [
      { id: "meeting", title: "Bắt đầu một cuộc gặp", body: "Dùng 你好 để chào. Muốn hỏi lịch sự, mở đầu bằng 請問. Khi giới thiệu tên, dùng 我姓 + họ hoặc 我叫 + tên. 姓 chỉ đi với họ, còn 叫 có thể đi với tên đầy đủ.", chinese: "請問，你姓什麼？我姓陳。", simplified: "请问，你姓什么？我姓陈。", pinyin: "Qǐngwèn, nǐ xìng shénme? Wǒ xìng Chén.", meaningVi: "Xin hỏi, bạn họ gì? Tôi họ Trần." },
      { id: "nationality", title: "Giới thiệu quê quán", body: "Ghép tên nước với 人 để nói quốc tịch: 臺灣人, 日本人, 美國人. Hỏi người đối diện bằng 你是哪國人？ và trả lời bằng 我是…人。", chinese: "我是臺灣人。你呢？", simplified: "我是台湾人。你呢？", pinyin: "Wǒ shì Táiwān rén. Nǐ ne?", meaningVi: "Tôi là người Đài Loan. Còn bạn?" },
      { id: "tea", title: "Mời uống và hỏi sở thích", body: "請 + động từ là cách mời lịch sự: 請喝茶. Dùng 喜歡 + danh từ hoặc động từ để nói điều mình thích. Trả lời lời cảm ơn bằng 不客氣.", chinese: "請喝茶。謝謝！不客氣。", simplified: "请喝茶。谢谢！不客气。", pinyin: "Qǐng hē chá. Xièxie! Bú kèqì.", meaningVi: "Mời uống trà. Cảm ơn! Không có gì." },
    ],
    dialogues: [
      { id: "meeting", title: "Buổi giao lưu tiếng Hoa", context: "An và Mỹ làm quen trong một buổi giao lưu ở Đài Loan.", turns: [
        { speaker: "An", chinese: "你好！請問，你姓什麼？", simplified: "你好！请问，你姓什么？", pinyin: "Nǐ hǎo! Qǐngwèn, nǐ xìng shénme?", meaningVi: "Chào bạn! Xin hỏi, bạn họ gì?" },
        { speaker: "Mỹ", chinese: "我姓陳，叫陳美。你呢？", simplified: "我姓陈，叫陈美。你呢？", pinyin: "Wǒ xìng Chén, jiào Chén Měi. Nǐ ne?", meaningVi: "Tôi họ Trần, tên Trần Mỹ. Còn bạn?" },
        { speaker: "An", chinese: "我姓林，叫林安。我是美國人。", simplified: "我姓林，叫林安。我是美国人。", pinyin: "Wǒ xìng Lín, jiào Lín Ān. Wǒ shì Měiguó rén.", meaningVi: "Tôi họ Lâm, tên Lâm An. Tôi là người Mỹ." },
        { speaker: "Mỹ", chinese: "我是臺灣人。歡迎你來臺灣！", simplified: "我是台湾人。欢迎你来台湾！", pinyin: "Wǒ shì Táiwān rén. Huānyíng nǐ lái Táiwān!", meaningVi: "Tôi là người Đài Loan. Chào mừng bạn đến Đài Loan!" },
        { speaker: "An", chinese: "謝謝！", simplified: "谢谢！", pinyin: "Xièxie!", meaningVi: "Cảm ơn!" },
      ] },
      { id: "tea-shop", title: "Một lời mời uống trà", context: "Hai người làm quen tại quán trà và hỏi về đồ uống mình thích.", turns: [
        { speaker: "An", chinese: "你好！你是哪國人？", simplified: "你好！你是哪国人？", pinyin: "Nǐ hǎo! Nǐ shì nǎ guó rén?", meaningVi: "Chào bạn! Bạn là người nước nào?" },
        { speaker: "Văn", chinese: "我是美國人。你呢？", simplified: "我是美国人。你呢？", pinyin: "Wǒ shì Měiguó rén. Nǐ ne?", meaningVi: "Tôi là người Mỹ. Còn bạn?" },
        { speaker: "An", chinese: "我是臺灣人。請喝烏龍茶。", simplified: "我是台湾人。请喝乌龙茶。", pinyin: "Wǒ shì Táiwān rén. Qǐng hē Wūlóng chá.", meaningVi: "Tôi là người Đài Loan. Mời bạn uống trà ô long." },
        { speaker: "Văn", chinese: "謝謝！這茶很好喝。你喜歡喝茶嗎？", simplified: "谢谢！这茶很好喝。你喜欢喝茶吗？", pinyin: "Xièxie! Zhè chá hěn hǎohē. Nǐ xǐhuan hē chá ma?", meaningVi: "Cảm ơn! Trà này ngon lắm. Bạn thích uống trà không?" },
        { speaker: "An", chinese: "喜歡。我不喜歡喝咖啡。", simplified: "喜欢。我不喜欢喝咖啡。", pinyin: "Xǐhuan. Wǒ bù xǐhuan hē kāfēi.", meaningVi: "Có. Tôi không thích uống cà phê." },
      ] },
    ],
    checks: [
      { id: "cc1-v1-l01-check-01", prompt: "Muốn hỏi lịch sự “Bạn họ gì?”, bạn chọn câu nào?", options: option("請問，你姓什麼？", "請問，你叫什麼國？", "你是喝什麼？"), correctOptionId: "a", feedback: "姓 hỏi về họ; 請問 giúp câu hỏi lịch sự hơn.", skill: "Chào hỏi" },
      { id: "cc1-v1-l01-check-02", prompt: "Sau khi được mời trà và nói “謝謝”, người mời đáp thế nào?", options: option("不客氣。", "對不起。", "請問。"), correctOptionId: "a", feedback: "不客氣 là câu đáp thông dụng khi người khác cảm ơn.", skill: "Giao tiếp" },
    ],
    pronunciation: [
      { id: "third-tone", title: "Hai thanh ba đứng cạnh nhau", explanation: "Khi hai âm tiết thanh ba đứng liền nhau, âm đầu thường đổi cách đọc thành thanh hai. Pinyin vẫn ghi dấu thanh ba ở từ gốc. Vì vậy 你好 viết nǐ hǎo nhưng thường đọc gần như ní hǎo.", chinese: "你好", simplified: "你好", pinyin: "nǐ hǎo → [ní hǎo]", meaningVi: "xin chào" },
      { id: "bu-tone", title: "Biến điệu của 不", explanation: "不 thường đọc bù; trước âm tiết thanh bốn, nó đọc bú. Ví dụ 不客氣 có 客 thanh bốn nên đọc bú kèqì. Khi phủ định 喝 (thanh một), vẫn đọc bù hē.", chinese: "不客氣 / 不喝", simplified: "不客气 / 不喝", pinyin: "bú kèqì / bù hē", meaningVi: "không có gì / không uống" },
    ],
    culture: [
      { id: "tea", title: "Mời trà ở Đài Loan", body: "Trà là một đồ uống quen thuộc trong đời sống Đài Loan. Khi được mời, bạn có thể nói 謝謝; nếu muốn mời lại, dùng 請喝茶. 烏龍茶 là một loại trà phổ biến. Trong hội thoại, hãy chú ý lời mời lịch sự hơn là cố dịch từng chữ." },
      { id: "address", title: "Cách xưng hô khi mới gặp", body: "Với người chưa quen, họ + 先生 hoặc họ + 小姐 là cách gọi dễ hiểu trong bối cảnh bài học. Sau khi người đối diện tự giới thiệu, bạn có thể gọi theo cách họ mong muốn. Tên thân mật chỉ nên dùng khi hai người đã đồng ý." },
    ],
  },
  vocabulary: { introduction: "43 mục từ của Vocabulary I và II, giữ đúng thứ tự trong bài. Chạm vào một thẻ để tự kiểm tra trước khi xem nghĩa và ví dụ.", wordIds: cc1Lesson01Words.map((word) => word.id!) },
  grammar: [
    { id: "cc1-v1-l01-grammar-a-not-a", title: "Câu hỏi A 不 A", explanation: "Lặp lại động từ hoặc tính từ, chen 不 vào giữa để hỏi có hay không. Người nghe có thể đáp ngắn bằng chính động từ đó.", structure: "Chủ ngữ + A 不 A + …？", examples: [
      { chinese: "你是不是臺灣人？", simplified: "你是不是台湾人？", pinyin: "Nǐ shì bú shì Táiwān rén?", meaningVi: "Bạn có phải người Đài Loan không?" },
      { chinese: "你喜歡不喜歡喝茶？", simplified: "你喜欢不喜欢喝茶？", pinyin: "Nǐ xǐhuan bù xǐhuan hē chá?", meaningVi: "Bạn có thích uống trà không?" },
      { chinese: "你要不要咖啡？", simplified: "你要不要咖啡？", pinyin: "Nǐ yào bú yào kāfēi?", meaningVi: "Bạn có muốn cà phê không?" },
    ], commonMistake: "Không thêm 嗎 vào cuối câu A 不 A: 你是不是臺灣人嗎？ là dư hai cách hỏi.", check: { id: "cc1-v1-l01-grammar-check-01", prompt: "Câu nào dùng đúng mẫu A 不 A?", options: option("你是不是臺灣人？", "你是不是臺灣人嗎？", "你是臺灣人不嗎？"), correctOptionId: "a", feedback: "A 不 A tự tạo câu hỏi; không cần 嗎.", skill: "A 不 A" } },
    { id: "cc1-v1-l01-grammar-ma", title: "Câu hỏi với 嗎", explanation: "Giữ nguyên trật tự câu trần thuật và thêm 嗎 ở cuối để hỏi có/không. Không đảo chủ ngữ và động từ như trong một số câu hỏi tiếng Việt.", structure: "Câu trần thuật + 嗎？", examples: [
      { chinese: "你是陳小姐嗎？", simplified: "你是陈小姐吗？", pinyin: "Nǐ shì Chén xiǎojiě ma?", meaningVi: "Chị là cô Trần phải không?" },
      { chinese: "你喜歡喝茶嗎？", simplified: "你喜欢喝茶吗？", pinyin: "Nǐ xǐhuan hē chá ma?", meaningVi: "Bạn thích uống trà không?" },
      { chinese: "這是咖啡嗎？", simplified: "这是咖啡吗？", pinyin: "Zhè shì kāfēi ma?", meaningVi: "Đây là cà phê à?" },
    ], commonMistake: "Đặt 嗎 ở cuối, không chen vào giữa câu: 你嗎喜歡喝茶？ không đúng.", check: { id: "cc1-v1-l01-grammar-check-02", prompt: "Hỏi “Đây là trà ô long à?” theo mẫu 嗎:", options: option("這是烏龍茶嗎？", "這嗎是烏龍茶？", "這是不是烏龍茶嗎？"), correctOptionId: "a", feedback: "Thêm 嗎 vào cuối câu 這是烏龍茶。", skill: "Câu hỏi 嗎" } },
    { id: "cc1-v1-l01-grammar-negation", title: "Trả lời khẳng định và phủ định", explanation: "Với câu hỏi có/không, có thể nhắc lại động từ chính. Phủ định bằng 不 trước động từ: 不是, 不喝, 不喜歡. Khi phủ định họ hoặc tên, nói 不姓 hoặc 不叫.", structure: "是／喜歡／喝… hoặc 不 + động từ", examples: [
      { chinese: "你是日本人嗎？不是，我是臺灣人。", simplified: "你是日本人吗？不是，我是台湾人。", pinyin: "Nǐ shì Rìběn rén ma? Bú shì, wǒ shì Táiwān rén.", meaningVi: "Bạn là người Nhật à? Không, tôi là người Đài Loan." },
      { chinese: "你喝咖啡嗎？不喝，我喝茶。", simplified: "你喝咖啡吗？不喝，我喝茶。", pinyin: "Nǐ hē kāfēi ma? Bù hē, wǒ hē chá.", meaningVi: "Bạn uống cà phê không? Không, tôi uống trà." },
      { chinese: "我不姓王，我姓李。", simplified: "我不姓王，我姓李。", pinyin: "Wǒ bú xìng Wáng, wǒ xìng Lǐ.", meaningVi: "Tôi không họ Vương, tôi họ Lý." },
    ], commonMistake: "Đừng chỉ trả lời 不 khi muốn phủ định một câu; hãy nói 不 + động từ, chẳng hạn 不是 hoặc 不喝.", check: { id: "cc1-v1-l01-grammar-check-03", prompt: "Bạn không uống cà phê. Trả lời “你喝咖啡嗎？” thế nào?", options: option("不喝，我喝茶。", "不，我茶。", "不是喝咖啡。"), correctOptionId: "a", feedback: "Phủ định 喝 bằng 不喝, rồi nói đồ uống bạn chọn.", skill: "Phủ định" } },
    { id: "cc1-v1-l01-grammar-hen", title: "很 trước tính từ trạng thái", explanation: "Khi nói tính chất của người hoặc vật, 很 thường đứng trước tính từ như 好、好喝. Trong câu bình thường, 很 đôi khi chỉ nối chủ ngữ với tính từ, không nhất thiết nhấn mạnh “rất”.", structure: "Chủ ngữ + 很 + tính từ", examples: [
      { chinese: "這茶很好喝。", simplified: "这茶很好喝。", pinyin: "Zhè chá hěn hǎohē.", meaningVi: "Trà này ngon." },
      { chinese: "烏龍茶很好喝。", simplified: "乌龙茶很好喝。", pinyin: "Wūlóng chá hěn hǎohē.", meaningVi: "Trà ô long rất ngon." },
      { chinese: "他很好。", simplified: "他很好。", pinyin: "Tā hěn hǎo.", meaningVi: "Anh ấy vẫn ổn." },
    ], commonMistake: "Không dùng 是 trước tính từ theo kiểu dịch từng chữ “là ngon”: 這茶是好喝 không phải mẫu cơ bản đang học.", check: { id: "cc1-v1-l01-grammar-check-04", prompt: "Chọn câu tự nhiên để nói “Trà này ngon.”", options: option("這茶很好喝。", "這茶是好喝。", "這茶很喝。"), correctOptionId: "a", feedback: "很 đứng trước tính từ 好喝; 喝 là động từ nên không ghép thành 很喝.", skill: "很 + tính từ" } },
    { id: "cc1-v1-l01-grammar-ne", title: "Hỏi lại bằng 呢", explanation: "Sau khi nói về mình, dùng 你呢？ để hỏi người đối diện “còn bạn?”. Bạn cũng có thể hỏi lại về một người thứ ba bằng 他呢？ khi chủ đề đã rõ.", structure: "Câu về A，B + 呢？", examples: [
      { chinese: "我喝茶，你呢？", simplified: "我喝茶，你呢？", pinyin: "Wǒ hē chá, nǐ ne?", meaningVi: "Tôi uống trà, còn bạn?" },
      { chinese: "我是臺灣人，你呢？", simplified: "我是台湾人，你呢？", pinyin: "Wǒ shì Táiwān rén, nǐ ne?", meaningVi: "Tôi là người Đài Loan, còn bạn?" },
      { chinese: "我喜歡咖啡，他呢？", simplified: "我喜欢咖啡，他呢？", pinyin: "Wǒ xǐhuan kāfēi, tā ne?", meaningVi: "Tôi thích cà phê, còn anh ấy?" },
    ], commonMistake: "呢 không thay cho 嗎 trong một câu hỏi có/không mới; nó hỏi tiếp điều đã được nhắc tới.", check: { id: "cc1-v1-l01-grammar-check-05", prompt: "Bạn nói “Tôi uống trà, còn bạn?” — chọn câu đúng.", options: option("我喝茶，你呢？", "我喝茶，你嗎？", "我喝茶，呢你？"), correctOptionId: "a", feedback: "呢 đứng sau người được hỏi tiếp: 你呢？", skill: "呢" } },
  ],
  practice: [
    question(1, "“請問” thường dùng khi nào?", ["Khi mở đầu một câu hỏi lịch sự", "Khi đáp lời cảm ơn", "Khi nói tên đồ uống"], "a", "請問 nghĩa là “xin hỏi”.", "Từ vựng"),
    question(2, "Chọn nghĩa của “不客氣”.", ["Xin lỗi", "Không có gì", "Xin hỏi"], "b", "不客氣 là câu đáp sau khi được cảm ơn.", "Từ vựng"),
    question(3, "Điền vào chỗ trống: 你是臺灣人___？", ["呢", "嗎", "很"], "b", "Câu hỏi có/không kết thúc bằng 嗎.", "Câu hỏi 嗎", { kind: "fill", passage: "你是臺灣人___？" }),
    question(4, "Chọn mẫu A 不 A đúng.", ["你是不是美國人？", "你是不美國人是？", "你是不是美國人嗎？"], "a", "是不是 đã là dạng câu hỏi A 不 A, không thêm 嗎.", "A 不 A"),
    question(5, "Sắp xếp thành câu hỏi lịch sự: 你 / 姓 / 什麼 / 請問", ["請問，你姓什麼？", "你請問姓什麼？", "姓你什麼請問？"], "a", "請問 mở đầu, sau đó là 你姓什麼？", "Trật tự câu", { kind: "order" }),
    question(6, "Hoàn thành hội thoại: A: 謝謝！ B: ___", ["你好！", "不客氣。", "對不起。"], "b", "Đáp lại lời cảm ơn bằng 不客氣。", "Giao tiếp", { kind: "dialogue" }),
    question(7, "Bạn không thích cà phê. Câu nào đúng?", ["我不喜歡咖啡。", "我喜歡不咖啡。", "我不是喜歡咖啡。"], "a", "不 đặt trước 喜歡.", "Phủ định"),
    question(8, "Đọc: “小林是日本人。他喜歡喝烏龍茶。” Tiểu Lâm thích uống gì?", ["Cà phê", "Trà ô long", "Nước lọc"], "b", "烏龍茶 nghĩa là trà ô long.", "Đọc hiểu", { kind: "reading", passage: "小林是日本人。他喜歡喝烏龍茶。" }),
    question(9, "Điền vào chỗ trống: 這茶___好喝。", ["是", "很", "嗎"], "b", "很 đứng trước tính từ 好喝.", "很 + tính từ", { kind: "fill", passage: "這茶___好喝。" }),
    question(10, "Hoàn thành: 我喝茶，___？", ["你呢", "你嗎", "你很"], "a", "你呢 hỏi lại “còn bạn?”.", "呢", { kind: "dialogue" }),
    question(11, "Nếu hai âm thanh ba đứng cạnh nhau trong “你好”, âm đầu thường được đọc thế nào?", ["Gần như thanh hai", "Giữ nguyên thanh ba trong mọi hoàn cảnh", "Thành thanh bốn"], "a", "你好 viết nǐ hǎo nhưng âm đầu thường đọc gần như ní.", "Phát âm"),
    question(12, "Tự giới thiệu: chọn câu nói họ và tên phù hợp.", ["我姓陳，叫月美。", "我叫陳，姓月美。", "我姓喝茶，叫臺灣。"], "a", "姓 đi với họ, 叫 đi với tên.", "Giới thiệu", { kind: "self-introduction" }),
  ],
  assessment: [
    assessment(1, "“歡迎你來臺灣！” nghĩa là gì?", ["Chào mừng bạn đến Đài Loan!", "Bạn đi đâu ở Đài Loan?", "Bạn là người Đài Loan à?"], "a", "歡迎 là chào mừng, 來 là đến.", "Từ vựng"),
    assessment(2, "Chọn cách hỏi “Bạn họ gì?”", ["你叫什麼國？", "你姓什麼？", "你是喝什麼？"], "b", "姓 dùng để hỏi họ.", "Chào hỏi"),
    assessment(3, "“我來接你。” có nghĩa là gì?", ["Tôi đến đón bạn.", "Tôi đến uống trà.", "Bạn đến đón tôi."], "a", "接 trong ngữ cảnh này là đón.", "Từ vựng"),
    assessment(4, "Chọn câu hỏi có/không với 嗎.", ["你喝茶嗎？", "你喝嗎茶？", "你是不是喝茶嗎？"], "a", "Đặt 嗎 cuối câu trần thuật.", "Câu hỏi 嗎"),
    assessment(5, "Chọn câu hỏi A 不 A đúng.", ["你是不是日本人？", "你是不是日本人嗎？", "你是不日本人是？"], "a", "是不是 là A 不 A; không thêm 嗎.", "A 不 A"),
    assessment(6, "Đáp lại “你要咖啡嗎？” nếu bạn không muốn cà phê.", ["不要，謝謝。", "不客氣嗎？", "是不咖啡。"], "a", "不要 phủ định 要; 謝謝 giữ câu trả lời lịch sự.", "Phủ định"),
    assessment(7, "“我姓李，叫明華。” cho biết điều gì?", ["Người nói họ Lý, tên Minh Hoa.", "Người nói họ Minh, tên Lý Hoa.", "Người nói đến đón Minh Hoa."], "a", "姓 giới thiệu họ; 叫 giới thiệu tên.", "Giới thiệu"),
    assessment(8, "Chọn câu “Trà ô long ngon.”", ["烏龍茶很好喝。", "烏龍茶是很喝。", "烏龍茶喝很。"], "a", "很 + tính từ 好喝.", "很 + tính từ"),
    assessment(9, "Bạn nói “Tôi là người Mỹ, còn bạn?”", ["我是美國人，你呢？", "我是美國人，你嗎？", "我是美國人，呢你？"], "a", "你呢 hỏi tiếp cùng chủ đề.", "呢"),
    assessment(10, "Đọc: “小王不喝茶。他要咖啡。” Tiểu Vương muốn gì?", ["Trà", "Cà phê", "Trà ô long"], "b", "他要咖啡 nghĩa là anh ấy muốn cà phê.", "Đọc hiểu"),
    assessment(11, "Trước thanh bốn trong “不客氣”, 不 thường đọc ra sao?", ["bú", "bù", "bǔ"], "a", "不 đổi thành bú trước 客 (thanh bốn).", "Phát âm"),
    assessment(12, "Người khác nói “謝謝”, bạn nên đáp gì?", ["不客氣。", "請問。", "你呢？"], "a", "不客氣 là “không có gì”.", "Giao tiếp"),
  ],
};
