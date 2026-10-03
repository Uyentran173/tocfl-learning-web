"use client";

import { useEffect, useState } from "react";
import type { Question } from "@/lib/tests";
import { preloadQuestionImages, questionImagesReady } from "@/lib/exam-image-preload";

export function useExamImagePreload(questions: Question[], index: number): boolean {
  const current = questions[index];
  const [, setAssetVersion] = useState(0);
  const ready = !current || questionImagesReady(current);

  useEffect(() => {
    let active = true;
    for (let offset = 0; offset <= 2; offset++) {
      const question = questions[index + offset];
      if (!question) break;
      void preloadQuestionImages(question).then(() => {
        if (active && offset === 0) setAssetVersion((version) => version + 1);
      });
    }
    return () => { active = false; };
  }, [questions, index]);

  return ready;
}
