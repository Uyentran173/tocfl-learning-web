# Tai Wén UI inventory and design system

## User-facing routes

| Area | Routes | Layout purpose |
| --- | --- | --- |
| Discovery | `/`, `/exam-guide` | Editorial sections and clear entry points |
| Academy | `/academy`, `/academy/contemporary-chinese/cc1-v1`, `/academy/cc1/lesson/01` | Bookshelf, learning journey, focused lesson workspace |
| Vocabulary | `/vocabulary`, `/vocabulary/topic`, `/vocabulary/textbook`, `/vocabulary/band`, `/vocabulary/practice` | Path choice, word recall, exercises and progress |
| TOCFL | `/tocfl`, `/tocfl/[testId]/instructions`, `/tocfl/[testId]/exam`, `/tocfl/[testId]/result`, `/tocfl/[testId]/review` | Library, setup, distraction-free test, result and review |
| Account | `/login`, `/account`, `/auth/callback` | Authentication and personal learning progress |

The shared shell is `app/layout.tsx` with `SiteHeader`, `SiteFooter`, `PreferencesProvider` and `AuthProvider`. `app/globals.css` contains reusable component classes and route-specific composition. `app/design-tokens.css` owns semantic light and dark values. The existing Be Vietnam Pro files use `font-display: swap`; Chinese content uses the script-aware fallback stack.

## Shared visual primitives

- `paper`, `report-surface`: standard reading surfaces.
- `button-primary`, `button-secondary`, `button-quiet`: actions and text links.
- `ui-input`, `site-select`: input controls.
- `ui-tab`, `academy-script-toggle`: segmented choices.
- `ui-alert`, `ui-empty`, `ui-skeleton`: feedback and loading.
- `ui-modal`, `ui-modal-stat`: dialogs and their summary blocks.
- `study-progress`, `academy-progress-bar`: learning progress.
- `Breadcrumbs`: accessible, localized Academy path navigation.

Use semantic tokens (`--page`, `--surface`, `--text`, `--muted`, `--border`, `--brand`, `--brand-fill`, and status tokens) in product UI. `app/design-refresh.css` applies category surfaces and page compositions across the existing routes. Academy uses periwinkle and lavender; vocabulary uses mint and sage; grammar uses lilac; listening uses sky; reading uses peach; the mock-test library keeps brand blue with band-specific accents. Illustration palettes are allowed to keep their own colors; source exam images use `--source-paper` in both themes so the original document remains readable.

The homepage has an editorial sequence from the Learning World hero through feature discovery, vocabulary and exam previews, learning paths, story and CTA. Product pages adapt this palette to their task: books and journey in Academy, quick scanning in word lists, restrained controls in live exams, clear evidence in review, and compact progress in accounts. Use the existing component classes rather than adding one-off Tailwind color values.

## Interaction rules

- Links and buttons expose hover, active and visible keyboard focus states. Disabled controls do not look actionable.
- Cards with one destination make the card the link. Cards with multiple independent actions retain separate controls.
- Exam controls use short, immediate feedback. Decorative motion stays in discovery and learning sections, outside question transitions.
- A mode, UI locale, theme and Chinese exam script remain separate settings. The locale catalog lives in `lib/i18n*.ts`; source exam and textbook material is not automatically translated.
- Use the existing `prefers-reduced-motion` rules for all decorative transitions.

## Responsive checks

Review at 1440, 1280, 768 and 390 pixels in light and dark mode. The header moves controls into the mobile menu; Academy route cards become a horizontal journey; the lesson workspace becomes a compact activity strip; vocabulary and test cards stack without horizontal page overflow.
