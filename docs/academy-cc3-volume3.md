# Contemporary Chinese · Volume 3

Volume 3 contains 12 lessons. Lesson 01 (`cc3-v3-l01`, 開學了) is published with its full dialogue and reading, 56 numbered vocabulary entries, seven grammar points, listening checks, practice and assessment. Lessons 02–12 appear in the learning journey as unavailable until their content and audio mappings are reviewed. No empty lesson page is published.

## Source and audio mapping

The textbook and workbook PDFs and ZIP files supplied by the site owner stay in `Downloads`; extracted tracks stay in ignored `.private/academy/cc3/`. The owner confirmed permission to publish the textbook text and audio. `scripts/import_cc3_audio.py` validates and stages 135 textbook and 25 workbook MP3 files, records SHA-256 hashes, and writes `data/academy/cc3-audio-manifest.json` and `data/academy/cc3-mapping-report.json`. Track IDs include source and lesson, for example `cc3-textbook-l01-t01` and `cc3-workbook-l01-t01`.

The eleven textbook and two workbook tracks for Lesson 01 were matched with visible PDF reference codes. `01-01` is the dialogue, `01-02` its vocabulary, `01-03` the reading, `01-04` its vocabulary, `01-05`–`01-11` the seven grammar points, and workbook `01-1`/`01-2` are listening activities A/B. The workbook recordings are available for listening, with no invented transcript or answer key. The two `00.mp3` files remain unassigned. Lesson 12's archive includes `12-10.mp3` but not `12-09.mp3`; the original numbering is preserved and must be checked before Lesson 12 is published.

Run the staging import with the four source paths:

```sh
python3 scripts/import_cc3_audio.py \
  --textbook-pdf '/Users/macbookpro/Downloads/當代中文課程3 – 課本.pdf' \
  --workbook-pdf '/Users/macbookpro/Downloads/當代中文課程3 – 作業本.pdf' \
  --textbook-zip '/Users/macbookpro/Downloads/當代中文課程 第三冊 課本-20261114T053453Z-1-001.zip' \
  --workbook-zip '/Users/macbookpro/Downloads/當代中文課程 第三冊 作業本-20261114T053453Z-1-001.zip'
```

`python3 scripts/build_cc3_lesson01.py` regenerates the reviewed lesson content, vocabulary, transcripts and script map. `python3 scripts/publish_cc3_lesson01_audio.py` verifies staged hashes and copies only the thirteen checked Lesson 01 tracks to `public/academy/cc3/audio/`. Do not publish tracks for later lessons until their printed references and activity relationships have been checked.

The `cc3-v3-l01` lesson ID, question IDs and audio IDs are separate from Volumes 1 and 2. Vocabulary records matching an earlier word by Traditional spelling and pinyin reuse the earlier stable word ID. Academy progress is stored under the lesson ID and audio progress uses `taiwen-academy:v1:cc3:l01`.
