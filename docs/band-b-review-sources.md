# Band B answer review sources

The review panels read `review-complete-vi.json` from each `data/test-supplements/band-b-test-0X` folder. Entries are keyed by the existing question IDs. The published exam packages, answers, scoring, audio, and images are unchanged. These panels are available only after submission.

- Questions, answer keys, choice order, and text passages: `data/structured-tests/band-b-test-0X.json`.
- Listening transcripts: each test's `listening-transcripts.json`.
- Reading document text: the official passage in `displayContexts`, or transcription of the existing source image at `public/tests/band-b-test-0X/reading/assets/{traditional,simplified}/groups/`.
- Series 1 Reading keeps its previously published, manually written review in `lib/reading-review-details.ts`; its new file supplies Listening only.

The Series 3 transcript supplement places some dialogue bodies beside the following question number. The review associates the same source dialogue with questions 25–27, 28–30, 31–32, 45–47, and 48–50 respectively, while retaining each question's own evidence phrase. Gap passages show the completed Chinese passage and its Vietnamese translation on the last question in each group. The review normalizes missing printed blank markers in some source transcriptions; it does not modify the exam package.

Known source limits are recorded on the affected review entries instead of inventing evidence:

- Series 2 Reading 25: the activity notice mentions group activities and computer games but does not explicitly mention board games.
- Series 3 Reading 31: the job notice offers training, while the published answer describes prior vocational training.
- Series 5 Reading 48: the passage defines creative freedom as freedom from government interference, which does not directly support the published answer about a reasonable film censorship system.

Two existing exam choice strings (Series 2 Listening 27 D and Series 5 Listening 47 D) contain the introduction to the next audio group after the actual option. The review shows and translates the actual option only. The live exam content is left unchanged.
