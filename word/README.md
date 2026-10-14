# Word version

Place the JavaScript used to generate the Word (`.docx`) version of the CV
here. It should read the same Markdown in `content/` so both versions stay in
sync.

To offer the generated files for download from the HTML page, add them to
`downloads` in `cv.config.json`, e.g.:

```json
"downloads": [
  { "label": "Download CV (Word, 40 KB)", "href": "cv.docx" }
]
```

Files listed there are expected in `assets/` and are copied to `dist/`.
