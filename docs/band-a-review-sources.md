# Band A answer-review sources

The published website currently has Band A tests 01 and 02. Review content is loaded only by the post-submit review route. The exam packages, answer keys, audio, time limits, and assets are not changed by this review supplement.

- Test 01: `review-complete-vi.json` supplies question-level Listening review for all 50 questions and Reading review for questions 1–30. The existing `review-vi.json` and `lib/reading-review-details.ts` supply Reading 31–50, including the completed passages and full Vietnamese translations at 35, 40, and 45.
- Test 02: `review-vi.json` supplies structured review for all 100 questions. Each entry is keyed by the published question ID and stores Vietnamese text, option descriptions or translations, an exact evidence phrase where Chinese evidence exists, and a short explanation.
- The official test 02 transcript supplement contains Traditional only. Its Simplified review transcript is converted from that source. Some Simplified OCR fields in the published test package still contain Traditional glyphs; the review supplement provides source-derived Simplified text without editing live question content.
- In test 02 Reading 50, the Traditional PDF prints `必頇`; the Simplified PDF prints `必須`. The Simplified review displays the intended word `必须`, while the live question package remains unchanged.

Some choices and contexts exist **only as pictures** in the official papers. Their review entries describe the actual choice pictures in Vietnamese. There is no Chinese option text to translate or highlight. This applies to Reading 1–15 in both tests, Listening 26–45 in both tests, and some picture-based Reading questions in 16–30. Where no Chinese passage evidence exists, the review displays the image-based explanation and names the source limitation instead of inventing Chinese evidence. In test 01 Reading 33, 36, and 39, the decisive clue is likewise in the shared illustration.

For test 01 Listening 1 and 10, and test 02 Listening 5, 7, 11, 16, 17, 20, and 23, the only usable Chinese evidence is the entire one-word spoken answer. Review shows the explanation and flags the source limitation without highlighting the full correct option.

The Band A review data test checks question IDs, answer letters, translated-option counts, both script variants, and the presence of each stored Chinese evidence phrase in its corresponding source text. Image-only exceptions must carry a source-limitation note.
