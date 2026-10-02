# Importing official TOCFL mock tests

The importer reads the [official TOCFL paper mock-test page](https://tocfl.edu.tw/tocfl/index.php/exam/test/page/1?pressBtn=(MockText)), discovers the requested series and Band, downloads the official PDFs and individual online MP3 tracks, extracts structured questions and document images, then validates a new logical test before adding it to the library.

## Commands

Install the Python dependencies once:

```bash
python3 -m pip install -r scripts/tocfl_import/requirements.txt
pnpm install --frozen-lockfile
```

Inspect the official files and track labels without changing the repository:

```bash
pnpm tocfl:import --series 5 --band B --type all --dry-run
```

Import a complete test:

```bash
pnpm tocfl:import --series 5 --band B --type all
```

`--band` accepts `Novice`, `A`, `B`, or `C`. `--series` is the official collection number. The CLI assigns the next unused ID for that Band, such as `band-b-test-02`; it never replaces an existing test. Traditional and Simplified remain one logical test. For Novice and A, discovery selects the Chinese–Vietnamese row when it is available.

`--type listening` and `--type reading` can be used with `--dry-run` to inspect one component. Publication requires `--type all` because the current website schema requires both Listening and Reading in one logical test. The importer fails rather than creating an incomplete public card.

The importer saves structured data in `data/structured-tests/<test-id>.json`, official audio and question images in `public/tests/<test-id>/`, and the official Listening script in `data/test-supplements/<test-id>/listening-transcripts.json`. The original PDFs are temporary import inputs, not public exam UI assets. Vietnamese translations and explanations are not generated or invented by this command. If the official script has only Traditional text, the importer leaves the Simplified transcript empty.

It checks question and answer counts, numbering, all four text choices, Traditional/Simplified alignment, score coverage, passage groups, document images, transcript coverage, every audio file, and the grouped playback order. It then runs `pnpm lint`, `pnpm typecheck`, `pnpm test:import`, `pnpm test:logical`, `pnpm test:timing`, `pnpm test:transcripts`, and `pnpm build`. A failed check removes the newly generated test files. Existing tests remain untouched.

Official PDF layouts vary. The text-question parser supports the text choice format used by Band B/C and keeps embedded document images with their reading groups. Image-only answer choices or a new PDF layout that cannot be mapped unambiguously cause a clear failure; inspect and extend the parser before publishing that edition. This is intentional: a guessed answer, missing image, or wrong shared-audio mapping must not reach learners.

## GitHub Action

Run **Import TOCFL Test** from the repository's Actions tab and choose Series, Band, and component. A complete import creates an `tocfl-import/...` branch and pull request. Review the generated questions, document images, audio groups, and score table in that PR before merging to `main`; the existing Vercel integration deploys after merge. For a single component, the Action runs discovery only and records the source list in the job log.
