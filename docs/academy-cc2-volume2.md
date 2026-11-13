# Contemporary Chinese · Volume 2

Volume 2 has 15 lesson identities (`cc2-v2-l01` through `cc2-v2-l15`). Lessons 01–04 are published. Lessons 05–15 remain unavailable until their text, teaching content, and audio mappings have been reviewed. Each completed lesson is released separately.

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

Use `python3 scripts/publish_cc2_lesson01_audio.py`, `python3 scripts/publish_cc2_lesson02_audio.py`, `python3 scripts/publish_cc2_lesson_audio.py --lesson 3`, and `python3 scripts/publish_cc2_lesson_audio.py --lesson 4` after staging and checking the printed codes against the PDFs. They copy 13, 14, 14, and 13 tracks, respectively, into `public/academy/cc2/audio/`. No later lesson audio is public. Re-running the staging import resets mapping statuses, so re-run all four publication steps afterward.

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

## Remaining work

157 tracks remain private for later lessons; this count includes two unassigned `00.mp3` files. The mapping report lists pending lesson tracks whose printed codes were not detected in extracted PDF text. Their visible pages must be reviewed before they are published. Lessons 05–15 need their own verified text, vocabulary, explanations and assessments before routes are opened.
