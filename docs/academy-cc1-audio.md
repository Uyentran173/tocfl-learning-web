# Tai Wén Academy · Contemporary Chinese 1 audio

## Current scope

- The two source ZIP archives contain **141 textbook** and **81 workbook** MP3 files. Their filenames, bytes, SHA-256 hashes, source, lesson and track numbers are in `data/academy/cc1-audio-manifest.json`.
- All 15 lessons are represented. Textbook and workbook have separate stable IDs: `cc1-textbook-l01-t01` and `cc1-workbook-l01-t01`.
- Lesson 01 has **nine verified PDF activity references**: textbook 01-1 to 01-4 (PDF pages 29, 30, 31, 33; printed pages 2, 3, 4, 6), workbook 01-1 to 01-5 (PDF pages 3, 3, 4, 4, 8; printed pages 1, 1, 2, 2, 6). The learner UI uses printed page numbers. The textbook ZIP uses padded names (`01-01.mp3`), while the printed code is `01-1`; the workbook keeps `01-1.mp3`.
- Textbook `01-05.mp3` through `01-10.mp3` do not have matching Lesson 01 activity codes in the inspected PDF pages. They remain **pending**, as do all tracks for Lessons 02–15. The two `00.mp3` files have distinct IDs and no assigned lesson or purpose. `data/academy/cc1-mapping-report.json` lists every pending ID.
- No transcript, Vietnamese translation, or answer key has been added. `data/academy/cc1-reviewed-content.json` is a separate, initially empty store for content that is later verified and approved for use.

## Import and private staging

Run from the repository root, with the four local files supplied explicitly:

```sh
pnpm academy:import-audio \
  --textbook-pdf "$HOME/Downloads/當代中文課程1 – 課本.pdf" \
  --workbook-pdf "$HOME/Downloads/當代中文課程1 – 作業本.pdf" \
  --textbook-zip "$HOME/Downloads/當代中文課程 第一冊 課本-20261106T150852Z-1-001.zip" \
  --workbook-zip "$HOME/Downloads/當代中文課程 第一冊 作業本-20261106T150850Z-1-001.zip"
```

Use `--dry-run` to inspect the report without writing files. The importer checks the verified PDF editions, archive counts, all 15 lesson prefixes, track-number gaps, duplicate IDs, non-empty MP3 payloads, and the nine Lesson 01 references. When `afinfo` or `ffprobe` is installed, it also checks decoder metadata for every staged file. It stages audio under `.private/academy/cc1/`, which is ignored by Git. Re-running replaces a changed track by hash and does not create duplicate IDs.

Only metadata manifests and code are committed. The PDFs, ZIPs, and MP3s must stay outside Git and `public/`. The audio route works only in local development on `localhost`/`127.0.0.1`, and only for the nine verified Lesson 01 tracks. Production always returns 404 for these MP3s. This remains the policy until distribution rights are confirmed.

## Lesson 01 prototype

Open `/academy/cc1/lesson/01` from the textbook learning page. In local development, the verified tracks can be played, paused, replayed and slowed/speeded up. Playback is never automatic. Workbook activities are identified by their PDF codes and pages; learners complete them in their own copy of the book and can record private notes. There is no automatic grading because no verified answer key was provided.

The workbook prototype provides one answer field per printed item, using only the item counts verified in the workbook. It does not reproduce the copyrighted question text or invent an answer key. The user's selected track, listening/completion flags, and answers/notes use the existing account-aware progress storage. Guest data stays local; signed-in data uses the existing Supabase progress synchronization. When guest and account notes differ, both copies are retained for the learner to review. Original source files are never written to user-progress records.

For Lessons 02–15, inspect each PDF reference and add a reviewed mapping before exposing a track as a lesson activity. Do not assign meanings to the remaining filenames by pattern alone. After rights clearance, verified transcript/translation fields can be added to the separate reviewed-content file, which enables the transcript toggle in the lesson UI.
