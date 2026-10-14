# CV

A completely static, accessible (WCAG 2.2 AA) HTML version of my CV, built
from Markdown. No JavaScript is shipped to the browser.

- `content/*.md` — the CV content. Each file becomes its own page, e.g.
  `Daniel Neho CV - Principal Digital.md` → `principal-digital.html`. With
  more than one CV, `index.html` links to each version.
- `word/cv-build.cjs` — builds the Word versions into `assets/`.
- `src/template.html`, `src/styles.css` — page template and styles. Brand
  colours and fonts are the tokens at the top of `styles.css`.
- `assets/` — copied as-is into the site. A `.docx` or `.pdf` named the same
  as a Markdown file is linked from that page as a download.
- `cv.config.json` — language, author and site description.
- `NOTES.md` — working notes on the CV content.

## Commands

```sh
npm install
npm run build        # Word files, then HTML into dist/
npm run serve        # preview at http://localhost:8080
npm test             # build, validate HTML, run accessibility checks
```

## Accessibility

Built in:

- Semantic landmarks, a skip link and one `<h1>` per page; each `##`
  section becomes a `<section>` labelled by its heading.
- The build fails if a page doesn't have exactly one `#` heading, skips a
  heading level, or has an image without alt text.
- Raw HTML in Markdown is disabled, so the output stays semantic.
- Underlined links, a high-contrast focus ring, 24×24px minimum targets
  for standalone links, and no sticky content that could hide focus.
- Respects the user's text size, colour scheme (light/dark) and reduced
  motion preferences; reflows to 320px without horizontal scrolling.
- `|` separators are hidden from screen readers and read as a pause instead.
- Print stylesheet for a clean paper or PDF copy.

Checked automatically by `npm test`:

- [html-validate](https://html-validate.org/) with its accessibility rules.
- [axe-core](https://github.com/dequelabs/axe-core) for WCAG 2.0/2.1/2.2
  A and AA plus best practice, in light and dark mode, on every page.
- Reflow at 320 CSS pixels.

Automated tools catch only part of WCAG. Before publishing, also check
keyboard-only navigation, a screen reader (NVDA or VoiceOver), 200% text
zoom and the text spacing bookmarklet.
