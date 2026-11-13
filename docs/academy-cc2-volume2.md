# Contemporary Chinese · Volume 2

Volume 2 has 15 lesson identities (`cc2-v2-l01` through `cc2-v2-l15`). Lesson 01 is published. Lessons 02–15 remain unavailable until their text, teaching content, and audio mappings have been reviewed. This follows the release decision to publish each completed lesson separately.

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

Use `python3 scripts/publish_cc2_lesson01_audio.py` only after staging and checking Lesson 01 against the PDFs. It copies 13 verified tracks into `public/academy/cc2/audio/`. No other lesson audio is currently public. Re-running the staging import resets mapping statuses, so re-run the verified publication step afterward.

## Lesson 01

`scripts/build_cc2_vocabulary.py` builds 44 vocabulary records from the reviewed TSV. Two reuse existing Volume 1 word IDs; 42 use new stable Volume 2 IDs. `scripts/build_cc2_lesson01.py` builds the lesson content, reviewed transcripts and script map. These generators should be run after editing their reviewed source files, then checked with `node --test tests/academy-cc2.test.mjs`.

The lesson contains the textbook dialogue and reading, vocabulary with reveal controls, five grammar points, four listening checks, eight practice questions and ten assessment questions. Audio track IDs are stored on the corresponding dialogue, vocabulary and grammar records. Workbook recordings remain distinct and are labeled by their verified activities; answer keys and transcripts are not shown for tracks where they were not verified.

Progress uses the existing Academy storage and account sync keys under `cc2-v2-l01` and `taiwen-academy:v1:cc2:l01`. It is separate from Volume 1 and TOCFL tests.

## Remaining work

198 tracks remain private for later lessons; this count includes two unassigned `00.mp3` files. The mapping report lists 26 lesson tracks whose printed codes were not detected in extracted PDF text. Their visible pages must be reviewed before they are published. Lessons 02–15 need their own verified text, vocabulary, explanations and assessments before routes are opened. Do not copy Lesson 01 content into them.
