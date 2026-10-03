# Importing official TOCFL mock tests

The importer reads the [official TOCFL paper mock-test page](https://tocfl.edu.tw/tocfl/index.php/exam/test/page/1?pressBtn=(MockText)), discovers the requested series and Band, downloads the official PDFs and individual online MP3 tracks, extracts structured questions and document images, then validates a new logical test before adding it to the library.

## Commands

Install the Python dependencies once:

```bash
python3 -m pip install -r scripts/tocfl_import/requirements.txt
pnpm install --frozen-lockfile
```

Inspect and parse a complete official test without changing the repository:

```bash
pnpm tocfl:import --series 5 --band B --type all --dry-run
```

Import a complete test:

```bash
pnpm tocfl:import --series 5 --band B --type all

# Replace this official Series in its existing stable test ID:
pnpm tocfl:import --series 5 --band B --type all --update
```

`--band` accepts `Novice`, `A`, `B`, or `C`. `--series` is the official collection number. The first import assigns an unused display ID, such as `band-b-test-02`, and records the stable official Band + Series identity. Later runs find that ID and do nothing unless `--update` is passed. Older manually imported tests without source metadata are checked against the complete official answer keys and score tables before creating a new ID; an exact match reuses the legacy ID. An update replaces only that imported test and restores it if validation or checks fail. Traditional and Simplified remain one logical test. For Novice and A, discovery selects the Chinese–Vietnamese row when it is available.

`--type listening` and `--type reading` can be used with `--dry-run` to inspect one component. Publication requires `--type all` because the current website schema requires both Listening and Reading in one logical test. The importer fails rather than creating an incomplete public card.

The importer saves structured data in `data/structured-tests/<test-id>.json`, official audio and question images in `public/tests/<test-id>/`, the official Listening script in `data/test-supplements/<test-id>/listening-transcripts.json`, and source URLs, import time, source identity, and SHA-256 hashes in `data/import-manifests/<test-id>.json`. The original PDFs are temporary import inputs, not public exam UI assets. Vietnamese translations and explanations are not generated or invented by this command. If the official script has only Traditional text, the importer leaves the Simplified transcript empty.

It checks question and answer counts, numbering, A/B/C/D (or the official A–F pool), Traditional/Simplified alignment, score coverage, passage groups, document and choice images, transcript coverage, every downloaded audio file, and the grouped playback order. It then runs `pnpm lint`, `pnpm typecheck`, `pnpm test:import`, `pnpm test:logical`, `pnpm test:timing`, `pnpm test:transcripts`, and `pnpm build`. A failed check removes the generated test or restores the earlier imported version. A full dry-run validates PDFs, images, answers, and transcripts in a temporary directory; MP3 content is verified during an actual import.

Official PDF layouts vary. The text-question parser supports Band B/C passages and documents. A boxed document drawn with PDF vectors is rendered as an image when its counterpart is embedded as a raster, preserving the original document layout in both scripts. A position-aware parser handles Novice/A image choices, picture prompts, shared scene images, and a shared six-choice gap passage; images are copied from the PDF rather than OCRed. A page with one rasterized question layout can be reused with per-question crop coordinates when printed question anchors are extractable. Unsupported or ambiguous layouts fail with a diagnostic rather than publishing guessed content.

Some older official series provide only a large audio archive rather than an online page of labeled individual tracks. The importer currently stops with the archive URL because those long recordings do not provide a reliable question-to-track mapping. For the one unambiguous printed-label typo A/B/C/C, the fourth option is mapped by position to D; the unchanged Chinese option text and an explicit source warning are retained in the generated data and manifest. Other ambiguous choice sequences stop the import.

## GitHub Action

Run **Import TOCFL Test** from the repository's Actions tab and choose Series, Band, and component. Select **update** only when intentionally replacing a previously imported edition. A complete import creates an `tocfl-import/...` branch and pull request. Review the generated questions, images, audio groups, answers, score table, and manifest in that PR before merging to `main`; the existing Vercel integration deploys after merge. For a single component, the Action runs discovery only and records the source list in the job log.
