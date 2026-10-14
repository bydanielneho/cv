# CV

A completely static, accessible (WCAG 2.2 AA) HTML version of my CV, built
from Markdown. No JavaScript is shipped to the browser.

- `content/*.md` — the CV versions. Only one is published at a time: the
  one named by `current` in `cv.config.json`, which becomes `index.html`.
  The others stay in `content/`, unpublished, ready to switch to.
- `word/cv-build.cjs` — builds the Word versions into `assets/`.
- `src/template.html`, `src/styles.css` — page template and styles. Type
  sizes are the tokens at the top of `styles.css`.
- `assets/` — copied as-is into the site. A `.docx` or `.pdf` named the same
  as a Markdown file is linked from that page as a download.
- `cv.config.json` — which CV version is `current`, plus language, author
  and site description.
- `NOTES.md` — working notes on the CV content.

## Commands

```sh
npm install
npm run build        # Word files, then the current CV as HTML into dist/
npm run build:all    # every version, for previewing locally (don't publish)
npm run serve        # preview at http://localhost:8080
npm test             # build, validate HTML, run accessibility checks
```

## Switching CV version

Change `current` in `cv.config.json` to the file name of another version
in `content/`, e.g.

```json
"current": "Daniel Neho CV - Principal Advisor Communications.md"
```

To start a new version, copy an existing file in `content/`, give it a new
name, edit it, and point `current` at it. Only the current version — and
its Word file — is published.

## Publishing

`.github/workflows/static.yml` publishes to GitHub Pages on every push to
`main`: it installs, builds and runs all the tests, then uploads only the
built `dist/` folder. Nothing is published if a test fails, and source
files such as `NOTES.md` are never published.

To turn it on: Settings → Pages → Source: **GitHub Actions**.

## Accessibility

Built in:

- Semantic landmarks, a skip link and one `<h1>` per page; each `##`
  section becomes a `<section>` labelled by its heading.
- A Contents list of the `##` sections in a `<nav>`: in a column on the
  left on wide screens (sticky, never overlapping the CV), above the CV on
  narrow screens and when zoomed in. It comes before `<main>` in the source
  so reading and tab order match what's on screen; the skip link jumps past
  it. Hidden when printed.
- The build fails if a page doesn't have exactly one `#` heading, skips a
  heading level, or has an image without alt text.
- Raw HTML in Markdown is disabled, so the output stays semantic.
- Black text on white (21:1 contrast), no brand colours. Links are black and
  underlined; focus is a thick black outline.
- Arial, which is already installed on almost every device, so no font
  has to download. Falls back to metric-compatible Helvetica, Liberation
  Sans or Arimo where Arial isn't available.
- 18px body text with a 1.6 line height, about 70 characters per line, all
  in rem/em so it scales with the reader's text size and zoom.
- 24×24px minimum targets for standalone links, and no sticky content that
  could hide focus.
- No animation; reflows to 320px (400% zoom) without horizontal
  scrolling and survives the WCAG 1.4.12 text-spacing overrides.
- `|` separators are hidden from screen readers and read as a pause instead.
- Print stylesheet for a clean paper or PDF copy.

Checked automatically by `npm test` on every page, at 1440, 1024, 768 and
320px wide (320px = 400% zoom):

- [html-validate](https://html-validate.org/) with its accessibility rules.
- [axe-core](https://github.com/dequelabs/axe-core): every rule, including
  best practice and experimental rules, covering WCAG 2.0/2.1/2.2 A and AA.
  The build fails on any violation and reports anything axe can't decide.
- Keyboard: tabbing reaches every link, and each focused link is on screen,
  not covered by other content, outlined and at least 24px tall.
- No horizontal scrolling, including with WCAG text-spacing overrides.
- Skip link and Contents links all point at real targets.

Automated tools catch only part of WCAG. Before publishing, also check
keyboard-only navigation, a screen reader (NVDA or VoiceOver), 200% text
zoom and the text spacing bookmarklet.
