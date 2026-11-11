import { readFileSync, writeFileSync } from "node:fs";

const dialogues = JSON.parse(readFileSync(new URL("../data/academy/cc1-dialogues.json", import.meta.url), "utf8"));
const reviewed = {};
for (const lesson of dialogues.lessons) {
  for (let index = 0; index < lesson.dialogues.length; index += 1) {
    const dialogue = lesson.dialogues[index];
    const id = `cc1-textbook-${lesson.lessonId.slice(-3)}-t${index === 0 ? "01" : "03"}`;
    reviewed[id] = {
      transcriptTraditional: dialogue.turns.map((turn) => `${turn.speaker}：${turn.traditional}`).join("\n"),
      transcriptSimplified: dialogue.turns.map((turn) => `${turn.speaker}：${turn.simplified}`).join("\n"),
      translationVi: dialogue.turns.map((turn) => `${turn.speaker}: ${turn.meaningVi}`).join("\n"),
    };
  }
}
writeFileSync(new URL("../data/academy/cc1-reviewed-content.json", import.meta.url), `${JSON.stringify(reviewed, null, 2)}\n`);
console.log(`Mapped reviewed dialogue transcripts to ${Object.keys(reviewed).length} verified audio tracks.`);
