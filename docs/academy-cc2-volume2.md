# Contemporary Chinese · Volume 2

Volume 2 has 15 lesson identities (`cc2-v2-l01` through `cc2-v2-l15`). Lessons 01–06 are published. Lessons 07–15 remain unavailable until their text, teaching content, and audio mappings have been reviewed. Each completed lesson is released separately.

## Source and staging

The source PDFs and ZIPs stay outside Git in `Downloads`. `scripts/import_cc2_audio.py` validates the 150 textbook and 61 workbook MP3 files, extracts them to ignored `.private/academy/cc2/`, and writes `data/academy/cc2-audio-manifest.json` plus `data/academy/cc2-mapping-report.json`. Stable IDs include source and lesson, for example `cc2-textbook-l01-t01` and `cc2-workbook-l01-t01`. The two `00.mp3` files are unassigned until their purpose is verified.

The manifest records source file hashes, track hashes, printed PDF references, and mapping status. Automatic detection of a printed code is an audit aid, not proof of activity mapping. Each track must be checked against the visible PDF page before publication. The original source files are not committed.

Run the staging import with the four source paths:

```sh
python3 scripts/import_cc2_audio.py \
  --textbook-pdf '/Users/macbookpro/Downloads/當代中文課程2 – 課本 (1).pdf' \
  --workbook-pdf '/Users/macbookpro/Downloads/當代中文課程2 – 作業本.pdf' \
  --textbook-zip '/Users/macbookpro/Downloads/當代中文課程 第二冊 課本-20261112T123209Z-1-001.zip' \
  --workbook-zip '/Users/macbookpro/Downloads/當代中文課程 第二冊 作業本-20261112T123209Z-1-001.zip'
```

Use `python3 scripts/publish_cc2_lesson01_audio.py`, `python3 scripts/publish_cc2_lesson02_audio.py`, and `python3 scripts/publish_cc2_lesson_audio.py --lesson N` for N = 3, 4, 5, 6 after staging and checking the printed codes against the PDFs. They copy 13, 14, 14, 13, 13, and 13 tracks, respectively, into `public/academy/cc2/audio/`. No later lesson audio is public. Re-running the staging import resets mapping statuses, so re-run all six publication steps afterward.

## Lesson 01

`scripts/build_cc2_vocabulary.py` builds 44 vocabulary records from the reviewed TSV. Two reuse existing Volume 1 word IDs; 42 use new stable Volume 2 IDs. `scripts/build_cc2_lesson01.py` builds the lesson content, reviewed transcripts and script map. These generators should be run after editing their reviewed source files, then checked with `node --test tests/academy-cc2.test.mjs`.

The lesson contains the textbook dialogue and reading, vocabulary with reveal controls, five grammar points, four listening checks, eight practice questions and ten assessment questions. Audio track IDs are stored on the corresponding dialogue, vocabulary and grammar records. Workbook recordings remain distinct and are labeled by their verified activities; answer keys and transcripts are not shown for tracks where they were not verified.

Progress uses the existing Academy storage and account sync keys under `cc2-v2-l01` and `taiwen-academy:v1:cc2:l01`. It is separate from Volume 1 and TOCFL tests.

## Lesson 02

`scripts/build_cc2_vocabulary.py --lesson 02` builds the 46 official vocabulary records in textbook order. Records matching an earlier textbook word by Traditional spelling and Pinyin reuse that word's stable ID. `scripts/build_cc2_lesson02.py` builds the reviewed 15-turn dialogue, three-paragraph reading, six grammar lessons, four listening checks, eight practice questions, and ten assessment questions. The textbook dialogue and reading have reviewed Vietnamese translations; workbook tracks without verified transcripts or answer keys remain audio-only.

The 14 public recordings are mapped to the visible `02-01`–`02-10` textbook codes and `02-1`–`02-4` workbook codes. Two textbook codes that PDF extraction missed were checked visually on the printed pages. The dialogue, vocabulary, grammar, and listening activities reference their own track IDs; progress keys use `cc2-v2-l02` and stay separate from Lesson 01.

## Lesson 03

`scripts/build_cc2_vocabulary.py --lesson 3` builds 41 vocabulary records in the order printed on textbook pages 82 and 84–85. `scripts/build_cc2_lesson03.py` builds the 17-turn dialogue, three-paragraph reading, six grammar points, four listening checks, eight practice questions, and ten assessment questions. Traditional source lines were checked against visible pages 79–80 and 83; Simplified text and pinyin were generated from that checked Traditional text. Vietnamese translations and teaching activities are Tai Wén content.

The 14 recordings are mapped to textbook codes `03-01`–`03-10` and workbook codes `03-1`–`03-4`. The printed `03-08` code on PDF page 90 was checked visually because text extraction missed it. Workbook tracks remain distinct and are not assigned invented transcripts or answer keys. Progress keys use `cc2-v2-l03`.

## Lesson 04

`scripts/build_cc2_vocabulary.py --lesson 4` builds 45 textbook vocabulary records from the reviewed TSV. `scripts/build_cc2_lesson04.py` builds the 18-turn interview dialogue, three-paragraph reading, five grammar points, four listening checks, eight practice questions, and ten assessment questions. Traditional text was checked against the visible textbook pages 80–81 and 84; Vietnamese translations and teaching activities are Tai Wén content. The script map and Simplified variants derive from that checked Traditional text.

The 13 recordings are mapped to visible textbook codes `04-01`–`04-09` and workbook codes `04-1`–`04-4`. The PDF text extraction missed the printed `04-09` code, so page 93 was checked visually. Workbook tracks have no invented transcript or answer key. Progress keys use `cc2-v2-l04`.

## Lesson 05

`scripts/build_cc2_vocabulary.py --lesson 5` builds 44 textbook vocabulary records. `scripts/build_cc2_lesson05.py` builds the 18-turn wedding dialogue, three-paragraph reading, five grammar points, four listening checks, eight practice questions, and ten assessment questions. Traditional text was checked against visible textbook pages 106–107 and 110. The course uses separate Simplified variants, Vietnamese translations and lesson-specific assessments.

The 13 recordings follow visible textbook codes `05-01`–`05-09` and workbook codes `05-1`–`05-4`; the visually checked `05-02` and `05-07` were absent from PDF text extraction. Workbook audio remains separate and has no invented transcript or answer key. Progress keys use `cc2-v2-l05`.

## Lesson 06

`scripts/build_cc2_vocabulary.py --lesson 6` builds 48 textbook vocabulary records. `scripts/build_cc2_lesson06.py` builds the 17-turn moving-house dialogue, three-paragraph reading, five grammar points, four listening checks, eight practice questions, and ten assessment questions. Traditional source lines were checked against visible textbook pages 132–133 and 136–137. Simplified variants are stored separately; Vietnamese translations and exercises are Tai Wén content.

The 13 recordings follow visible textbook codes `06-01`–`06-09` and workbook codes `06-1`–`06-4`. The `06-02` code is visible on textbook PDF page 162, although PDF text extraction did not find it. Workbook recordings remain separate without invented transcript or answer key. Progress keys use `cc2-v2-l06`.

## Remaining work

131 tracks remain private for later lessons; this count includes two unassigned `00.mp3` files. The mapping report lists pending lesson tracks whose printed codes were not detected in extracted PDF text. Their visible pages must be reviewed before they are published. Lessons 07–15 need their own verified text, vocabulary, explanations and assessments before routes are opened.
