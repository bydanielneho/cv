# Content

Each `*.md` file here (except this README) is one version of the CV. Only
the versions listed under `pages` in `cv.config.json` are published; the
rest are kept here, ready to switch to. `npm run build:all` builds every version
for previewing locally.

Structure rules (these keep the page accessible):

- Use exactly one `#` heading for the whole CV — your name.
- Use `##` for each section (Experience, Education, …). Each becomes a
  labelled `<section>`.
- Use `###` for items within a section; don't skip heading levels.
- Give every image meaningful alt text: `![Description](path.png)`. Put images
  in `assets/`.
- Write descriptive link text — not "click here".
- Raw HTML is disabled so the output stays semantic and valid.
