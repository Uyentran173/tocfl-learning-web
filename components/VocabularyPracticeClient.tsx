"use client";

import { useSearchParams } from "next/navigation";
import VocabularyPractice from "./VocabularyPractice";

export default function VocabularyPracticeClient() {
  const searchParams = useSearchParams();
  const rawFocus = searchParams.get("focus");
  const focus = rawFocus && rawFocus.length <= 300 ? rawFocus : null;
  return <VocabularyPractice focus={focus} />;
}
