# Importing official TOCFL mock tests

The importer reads the [official TOCFL paper mock-test page](https://tocfl.edu.tw/tocfl/index.php/exam/test/page/1?pressBtn=(MockText)), discovers the requested series and Band, downloads the official PDFs and either individual online MP3 tracks or a numbered legacy audio archive, extracts structured questions and document images, then validates a new logical test before adding it to the library.

## Commands

Install the Python dependencies once. Real RAR archives also need `bsdtar` (`libarchive-tools` on Ubuntu; built into macOS). ZIP files are handled by Python even when an official download has a `.rar` suffix:

```bash
python3 -m pip install -r scripts/tocfl_import/requirements.txt
pnpm install --frozen-lockfile
```

Inspect and parse a complete official test without changing the repository:

```bash
pnpm tocfl:import --series 5 --band B --type all --dry-run
```

Audit every Band and Series currently listed on the official page without publishing any package:

```bash
pnpm tocfl:audit
```

The audit prints `PASS` or `UNSUPPORTED` and an exact reason for every discovered Listening + Reading pair; one failure does not stop the remaining checks. It inspects both writing variants, answer and score PDFs, transcript grouping, the actual archive format and members, online audio labels, generated assets, and the website's structured-test loader. It verifies online MP3 bytes by default. Use `--skip-online-bytes` for a faster mapping-only check; those rows report `audioBytesVerified: false` in `--json <path>` output. `--cache-dir <path>` reuses previously downloaded official PDFs and archives for development; omit it for a fresh source audit. Archive-only tests always verify their MP3 bytes. The audit writes temporary assets outside the repository and never publishes a test.

On 2026-10-03, the official page listed 15 tests: Novice Series 1, Bands A/B Series 1–5, and Band C Series 1–4. All 15 passed full temporary package and website-loader validation with their available official audio source. Novice Series 1 and Bands B/C Series 4 and B Series 5 also offer downloadable archives whose `001.mp3` style names do not independently identify the questions. Their labeled online players are the verified import source; if those players disappear, the unlabeled archives remain unsupported without official cues. Band B Series 3's ZIP includes harmless `desktop.ini`; Band B/C Series 3 use transcript-verified sequential shared audio tracks.

Import a complete test:

```bash
pnpm tocfl:import --series 5 --band B --type all

# Replace this official Series in its existing stable test ID:
pnpm tocfl:import --series 5 --band B --type all --update
```

`--band` accepts `Novice`, `A`, `B`, or `C`. `--series` is the official collection number. The first import assigns an unused display ID, such as `band-b-test-02`, and records the stable official Band + Series identity. Later runs find that ID and do nothing unless `--update` is passed. Older manually imported tests without source metadata are checked against the complete official answer keys and score tables before creating a new ID; an exact match reuses the legacy ID. An update replaces only that imported test and restores it if validation or checks fail. Traditional and Simplified remain one logical test. For Novice and A, discovery selects the Chinese–Vietnamese row when it is available.

`--type listening` and `--type reading` can be used with `--dry-run` to inspect one component. Publication requires `--type all` because the current website schema requires both Listening and Reading in one logical test. The importer fails rather than creating an incomplete public card.

The importer saves structured data in `data/structured-tests/<test-id>.json`, official audio and question images in `public/tests/<test-id>/`, the official Listening script in `data/test-supplements/<test-id>/listening-transcripts.json`, and source URLs, import time, source identity, and SHA-256 hashes in `data/import-manifests/<test-id>.json`. The original PDFs are temporary import inputs, not public exam UI assets. Vietnamese translations and explanations are not generated or invented by this command. If the official script has only Traditional text, the importer leaves the Simplified transcript empty.

It checks question and answer counts, numbering, A/B/C/D (or the official A–F pool), Traditional/Simplified alignment, score coverage, passage groups, document and choice images, transcript coverage, every downloaded audio file, and the grouped playback order. It then runs `pnpm lint`, `pnpm typecheck`, `pnpm test:import`, `pnpm test:logical`, `pnpm test:timing`, `pnpm test:transcripts`, and `pnpm build`. A failed check removes the generated test or restores the earlier imported version. A full dry-run validates PDFs, images, answers, and transcripts in a temporary directory; archive MP3s are inspected in the dry-run, while online MP3 bytes are verified during an actual import.

Official PDF layouts vary. The text-question parser supports Band B/C passages and documents. A boxed document drawn with PDF vectors is rendered as an image when its counterpart is embedded as a raster, preserving the original document layout in both scripts. A position-aware parser handles Novice/A image choices, picture prompts, shared scene images, and a shared six-choice gap passage; images are copied from the PDF rather than OCRed. A page with one rasterized question layout can be reused with per-question crop coordinates when printed question anchors are extractable. Unsupported or ambiguous layouts fail with a diagnostic rather than publishing guessed content.

Older official series may provide a ZIP or RAR audio archive instead of an online player. The importer determines the format from the bytes, decodes legacy ZIP names with CP950/Big5 when the UTF-8 flag is absent, accepts safe directory entries and numbered MP3s at the archive root or inside wrapper/nested directories, and writes normalized MP3 names under the test's audio directory. It recognizes numbered part introductions and `-0` shared-audio / `-1` question-audio pairs. For sequential track numbers such as Band B/C Series 3, it maps exactly one shared track before each multi-question group declared in the official transcript, then validates the total track count, every number, question order, and part boundaries. A mismatch stops the import. Known OS folder metadata (`desktop.ini`, `Thumbs.db`, `.DS_Store`, AppleDouble `._*`) is ignored only after path and member-type validation; arbitrary non-audio files still fail. The importer records the archive URL, hash, original member names, sizes, and hashes in the import manifest. Absolute paths, Windows drive paths, traversal, links, special members, and files escaping the extraction directory are rejected. Interrupted official archive downloads resume only when the server confirms the exact byte range and unchanged total size. Archives containing only unlabeled recordings remain unusable without official track labels or cues; the importer uses the separately labeled official online player when available.

The official Band A Series 1–3 Listening answer keys print `44` between `33` and `35`; Series 4 prints `4` there. Only a complete 50-row key with every other row in order is corrected by position to Q34, retaining the printed answer letter and recording a source warning. Band A Series 3–4 Reading puts two separate five-gap passages (Q36–40 and Q41–45), each with its own six-choice pool, on one PDF page; the importer derives those section boundaries from the actual PDF groups. Band B/C Series 3 transcripts repeat some question lists around the dialogue; the parser compares both lists before keeping one copy and the complete passage. Band C transcripts may print shared passages before or after a question list, or print a self-contained passage for a single question. Each shared transcript group is checked against its audio group. For the one unambiguous printed-label typo A/B/C/C, the fourth option is mapped by position to D; the unchanged Chinese option text and an explicit source warning are retained in the generated data and manifest. Other ambiguous answer keys, transcript groups, or choice sequences stop the import.

## GitHub Action

Run **Import TOCFL Test** from the repository's Actions tab and choose Series, Band, and component. Select **update** only when intentionally replacing a previously imported edition. A complete import creates an `tocfl-import/...` branch and pull request. Review the generated questions, images, audio groups, answers, score table, and manifest in that PR before merging to `main`; the existing Vercel integration deploys after merge. For a single component, the Action runs discovery only and records the source list in the job log.
