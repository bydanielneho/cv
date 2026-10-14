# Word version

`cv-build.cjs` builds a Word (`.docx`) file for every CV in `content/`,
from the same Markdown as the HTML, so the two versions always match. Edit
the Markdown only; never the Word file.

```sh
npm run build:word
```

The files are written to `assets/` (not committed), named after the
Markdown file. The HTML page for the current CV links to its Word file as a
download automatically.
