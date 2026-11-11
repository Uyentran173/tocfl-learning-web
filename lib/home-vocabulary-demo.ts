// A small, reviewed snapshot of real Band A entries. Keep the homepage bundle
// independent of the full 7,517-entry vocabulary catalog.
export const homeDemoWords = [
  {
    id: "tocfl-20240923-level-1-0223", band: "band_a", traditional: "旅行", simplified: "旅行",
    pinyin: "lǚxíng", meaningVi: "cuộc hành trình",
    exampleTraditional: "你的旅行是怎麼開始的？", exampleSimplified: "你的旅行是怎么开始的？",
    exampleVi: "Cuộc hành trình của anh bắt đầu như thế nào?",
  },
  {
    id: "tocfl-20240923-level-1-0004", band: "band_a", traditional: "家庭", simplified: "家庭",
    pinyin: "jiātíng", meaningVi: "gia đình",
    exampleTraditional: "我的家庭有四個人。", exampleSimplified: "我的家庭有四个人。",
    exampleVi: "Gia đình tôi có bốn người.",
  },
  {
    id: "tocfl-20240923-level-1-0062", band: "band_a", traditional: "上學", simplified: "上学",
    pinyin: "shàngxué", meaningVi: "đi học",
    exampleTraditional: "我每天八點上學。", exampleSimplified: "我每天八点上学。",
    exampleVi: "Ngày nào tôi cũng đi học lúc tám giờ.",
  },
] as const;

export function shuffledDemoChoices(correctId: string, random = Math.random): string[] {
  const ids: string[] = homeDemoWords.map((word) => word.id);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  // This is a local demo; keep the right answer in the choices even if data changes.
  if (!ids.includes(correctId)) throw new Error("Demo word is missing from answer choices");
  return ids;
}
