import { readFileSync, writeFileSync } from "node:fs";

const read = (name) => JSON.parse(readFileSync(new URL(`../data/academy/${name}.json`, import.meta.url), "utf8"));
const source = read("cc1-source-content");
const dialogues = read("cc1-dialogues");
const vocabulary = read("cc1-vocabulary");
const grammar = read("cc1-grammar");

// These introductions are original teaching text, based on each lesson's verified dialogue.
const situations = {
  2: "Ghé thăm nhà bạn, giới thiệu người thân và hỏi về gia đình.",
  3: "Rủ bạn đi chơi cuối tuần, nói về sở thích và hẹn xem phim.",
  4: "Gọi món, hỏi giá và lựa chọn món hàng khi mua sắm.",
  5: "Nói về món ăn Đài Loan, khẩu vị và bữa ăn ở nhà hàng.",
  6: "Hỏi đường đến trường, mô tả vị trí và khoảng cách.",
  7: "Hẹn giờ gặp bạn, sắp xếp việc học và hoạt động trong ngày.",
  8: "Lên kế hoạch đi Đài Nam và hỏi cách di chuyển bằng phương tiện công cộng.",
  9: "Lên kế hoạch cho kỳ nghỉ và giới thiệu địa điểm đi chơi.",
  10: "Chọn trái cây, kể chuyến đi và chia sẻ ảnh với bạn bè.",
  11: "Xem nhà thuê, trao đổi với chủ nhà và hỏi về tiền thuê.",
  12: "Nói về thời gian học tiếng Hoa, công việc và kế hoạch ở Đài Loan.",
  13: "Gọi điện hẹn gặp, chúc mừng sinh nhật và tặng quà.",
  14: "Nói về thời tiết, so sánh nhiệt độ và chuẩn bị khi trời mưa.",
  15: "Mô tả triệu chứng, đi khám và hỏi cách chăm sóc sức khỏe.",
};

function shuffle(values, seed) {
  const result = [...values];
  let state = [...seed].reduce((n, ch) => (n * 33 + ch.charCodeAt(0)) >>> 0, 5381);
  for (let i = result.length - 1; i > 0; i--) {
    state = (1664525 * state + 1013904223) >>> 0;
    const j = state % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function question(id, prompt, correct, alternatives, feedback, skill, extra = {}) {
  const texts = [correct, ...alternatives.filter((item) => item !== correct)].filter((text, index, all) => all.indexOf(text) === index).slice(0, 4);
  if (texts.length < 3) throw new Error(`Insufficient distinct options: ${id}`);
  const options = shuffle(texts, id).map((text, index) => ({ id: "abcd"[index], text }));
  return { id, prompt, options, correctOptionId: options.find((option) => option.text === correct).id, feedback, skill, ...extra };
}

function selectTurns(dialogue, count, offset = 0) {
  const eligible = dialogue.turns.filter((turn) => turn.traditional.length >= 12 && turn.meaningVi.length >= 22);
  const pool = eligible.length >= count ? eligible : dialogue.turns.filter((turn) => turn.meaningVi.length >= 14);
  if (pool.length < count) throw new Error(`Dialogue ${dialogue.id} lacks ${count} useful turns`);
  return Array.from({ length: count }, (_, index) => pool[(index + offset) % pool.length]);
}

const lessons = source.lessons.map((lesson, index) => {
  const matchingDialogues = dialogues.lessons[index];
  const matchingVocabulary = vocabulary.lessons[index];
  const matchingGrammar = grammar.lessons[index];
  if (matchingDialogues.lessonId !== lesson.id || matchingVocabulary.lessonId !== lesson.id || matchingGrammar.lessonId !== lesson.id) throw new Error(`Source order mismatch at ${lesson.id}`);
  const terms = matchingVocabulary.records.filter((word) => word.meaningVi && word.traditional.length <= 6 && !word.meaningVi.includes("(tên người)"));
  if (terms.length < 12) throw new Error(`Not enough reviewed terms in ${lesson.id}`);
  const chosenTerms = shuffle(terms, lesson.id).filter((word, i, all) => all.findIndex((candidate) => candidate.meaningVi === word.meaningVi) === i).slice(0, 12);
  if (chosenTerms.length !== 12) throw new Error(`Not enough distinct reviewed meanings in ${lesson.id}`);
  const grammarPoints = matchingGrammar.points;
  const selectedGrammar = grammarPoints.slice(0, 4);
  const dialogueTurns = matchingDialogues.dialogues.flatMap((dialogue) => selectTurns(dialogue, 4, 0));
  const otherMeanings = (value, termIndex) => shuffle(terms.filter((word) => word.id !== value.id && word.meaningVi !== value.meaningVi && word.meaningVi.length >= 3).map((word) => word.meaningVi), `${lesson.id}-${termIndex}`).slice(0, 3);
  const vocabularyQuestions = chosenTerms.map((word, termIndex) => question(`${lesson.id}-vocab-question-${String(termIndex + 1).padStart(2, "0")}`, `“${word.traditional}” có nghĩa là gì?`, word.meaningVi, otherMeanings(word, termIndex), `“${word.traditional}” nghĩa là “${word.meaningVi}”.`, "Từ vựng"));
  const readingQuestions = dialogueTurns.map((turn, turnIndex) => question(`${lesson.id}-reading-question-${String(turnIndex + 1).padStart(2, "0")}`, "Đọc câu trong hội thoại và chọn bản dịch sát nghĩa.", turn.meaningVi, shuffle(matchingDialogues.dialogues.flatMap((dialogue) => dialogue.turns).filter((item) => item.traditional !== turn.traditional && item.meaningVi !== turn.meaningVi && item.meaningVi.length >= 14).map((item) => item.meaningVi), `${lesson.id}-reading-${turnIndex}`).slice(0, 3), `“${turn.traditional}” nghĩa là “${turn.meaningVi}”.`, "Đọc hiểu", { kind: "reading", passage: turn.traditional }));
  const grammarChecks = selectedGrammar.map((point) => ({ ...point.check, id: `${point.id}-practice` }));
  const practice = shuffle([...vocabularyQuestions.slice(0, 6), ...readingQuestions.slice(0, 4), ...grammarChecks.slice(0, 2)], `${lesson.id}-practice`);
  const assessment = shuffle([...vocabularyQuestions.slice(6, 12), ...readingQuestions.slice(4, 8), ...grammarChecks.slice(2, 4)], `${lesson.id}-assessment`)
    .map((item, itemIndex) => ({ ...item, id: `${lesson.id}-assessment-${String(itemIndex + 1).padStart(2, "0")}` }));
  const listening = matchingDialogues.dialogues.flatMap((dialogue, dialogueIndex) => {
    const trackId = `cc1-textbook-l${String(lesson.number).padStart(2, "0")}-t${dialogueIndex === 0 ? "01" : "03"}`;
    if (!lesson.verifiedAudioTrackIds.includes(trackId)) throw new Error(`Missing verified dialogue audio: ${trackId}`);
    const inDialogue = selectTurns(dialogue, 2, 1);
    return inDialogue.map((turn, questionIndex) => question(`${lesson.id}-listening-${dialogueIndex + 1}-${questionIndex + 1}`, `Nghe hội thoại ${dialogueIndex + 1}. Người nói có nhắc đến ý nào sau đây?`, turn.meaningVi, shuffle(matchingDialogues.dialogues.flatMap((other) => other.turns).filter((item) => item.meaningVi !== turn.meaningVi && !dialogue.turns.some((spoken) => spoken.meaningVi === item.meaningVi) && item.meaningVi.length >= 14).map((item) => item.meaningVi), `${lesson.id}-listening-${questionIndex}`).slice(0, 3), `Trong hội thoại, “${turn.traditional}” có nghĩa là “${turn.meaningVi}”.`, "Nghe hiểu", { audioTrackId: trackId, kind: "dialogue" }));
  });
  const content = {
    contentVersion: 2,
    id: lesson.id,
    title: lesson.traditionalTitle,
    titleVi: lesson.titleVi,
    description: situations[lesson.number],
    objectives: [
      `Hiểu hai hội thoại về chủ đề ${lesson.titleVi.toLowerCase()}.`,
      `Nhận biết và sử dụng ${matchingVocabulary.records.length} mục từ trong ngữ cảnh bài học.`,
      `Vận dụng ${grammarPoints.length} điểm ngữ pháp của bài để nói và đọc câu đơn giản.`,
    ],
    estimatedMinutes: null,
    lecture: {
      introduction: `Trong bài này, bạn sẽ nghe và đọc hai hội thoại về ${lesson.titleVi.toLowerCase()}. Hãy đọc chữ Hoa trước, sau đó mở phiên âm và bản dịch khi cần.`,
      sections: grammarPoints.slice(0, 2).map((point) => ({ id: `${point.id}-intro`, title: point.title, body: point.explanation, ...point.examples[0] })),
      dialogues: matchingDialogues.dialogues.map((dialogue, dialogueIndex) => ({ id: dialogue.id, title: `Hội thoại ${dialogueIndex + 1}`, context: situations[lesson.number], turns: dialogue.turns.map((turn) => ({ speaker: turn.speaker, chinese: turn.traditional, simplified: turn.simplified, pinyin: turn.pinyin, meaningVi: turn.meaningVi })) })),
      checks: grammarPoints.slice(0, 2).map((point) => ({ ...point.check, id: `${point.id}-lecture` })),
      pronunciation: [],
      culture: [],
    },
    vocabulary: { introduction: `Từ trong hai hội thoại và danh sách từ của Bài ${String(lesson.number).padStart(2, "0")}, giữ nguyên thứ tự theo giáo trình. Chạm để tự kiểm tra trước khi xem nghĩa và ví dụ.`, wordIds: matchingVocabulary.records.map((word) => word.id) },
    grammar: grammarPoints.map(({ id, title, explanation, structure, examples, commonMistake, check }) => ({ id, title, explanation, structure, examples, commonMistake, check })),
    listening,
    practice,
    assessment,
    writingTask: { id: `${lesson.id}-writing`, title: "Viết theo tình huống", prompt: `Viết 2–3 câu tiếng Hoa về tình huống trong bài: ${situations[lesson.number]} Bài viết được lưu để bạn tự ôn; hệ thống chưa chấm tự động.` },
  };
  if (content.practice.length !== 12 || content.assessment.length !== 12 || content.listening.length !== 4) throw new Error(`Incomplete exercise set for ${lesson.id}`);
  return content;
});

writeFileSync(new URL("../data/academy/cc1-lessons.json", import.meta.url), `${JSON.stringify({ schemaVersion: 1, source: "cc1-source-content", lessons }, null, 2)}\n`);
console.log(`Built ${lessons.length} lessons, ${lessons.reduce((sum, lesson) => sum + lesson.practice.length + lesson.assessment.length + lesson.listening.length, 0)} activity questions.`);
