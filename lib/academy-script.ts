import { cc1Lesson01Words } from "./cc1-lesson01-vocabulary.ts";
import cc1ScriptMap from "../data/academy/cc1-script-map.json" with { type: "json" };
import cc2ScriptMap from "../data/academy/cc2-script-map.json" with { type: "json" };
import cc3ScriptMap from "../data/academy/cc3-script-map.json" with { type: "json" };

export type AcademyScript = "traditional" | "simplified";

// Explicit reviewed spellings from Lesson 01 vocabulary, plus surnames used in authored dialogue.
// This only applies to Tai Wén-authored lesson copy; imported exam content has its own variants.
const conversions = [...cc1Lesson01Words.map((word) => [word.traditional!, word.simplified!] as const), ...Object.entries(cc1ScriptMap.phrases), ["陳", "陈"] as const, ["華", "华"] as const]
  .filter(([traditional, simplified]) => traditional !== simplified)
  .sort((a, b) => b[0].length - a[0].length);

export function academyScriptText(input: string, script: AcademyScript): string {
  if (script === "traditional") return input;
  let result = "";
  for (let index = 0; index < input.length;) {
    const match = conversions.find(([traditional]) => input.startsWith(traditional, index));
    if (match) { result += match[1]; index += match[0].length; }
    else { result += cc1ScriptMap.characters[input[index] as keyof typeof cc1ScriptMap.characters] ?? cc2ScriptMap[input[index] as keyof typeof cc2ScriptMap] ?? cc3ScriptMap[input[index] as keyof typeof cc3ScriptMap] ?? input[index]; index++; }
  }
  return result;
}
