// Builds a Word (.docx) version of every CV in content/, from the same
// Markdown as the HTML, so the two always match. Writes
// "<name of the Markdown file>.docx" to the current folder; `npm run
// build:word` runs it in assets/, where the HTML build picks it up.
//
// Markdown it understands (the structure the CVs use):
//   # Name            → name
//   first paragraph   → contact line
//   ## Section        → section heading (uppercase, rule underneath)
//   ### Role title    → role title; the paragraph after it is
//                       "Organisation  \n Dates" (dates in grey)
//   #### Subheading   → bold subheading
//   - item            → bullet; **bold** text is kept bold
//   other paragraphs  → body text
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, LevelFormat, AlignmentType, BorderStyle,
} = require('docx');

const FONT = 'Arial';
const ACCENT = '1F3A5F';
const GREY = '555555';

const contentDir = path.join(__dirname, '..', 'content');

// "Some **bold** text" → TextRuns
const runs = (text) =>
  text.split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((part) => {
    const bold = part.startsWith('**') && part.endsWith('**');
    return new TextRun({ text: bold ? part.slice(2, -2) : part, bold, size: 20, font: FONT });
  });

const name = (t) => new Paragraph({
  spacing: { after: 60 },
  children: [new TextRun({ text: t, bold: true, size: 40, font: FONT, color: ACCENT })],
});
const contact = (t) => new Paragraph({ spacing: { after: 200 }, children: runs(t) });
const h1 = (t) => new Paragraph({
  spacing: { before: 280, after: 120 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 2 } },
  children: [new TextRun({ text: t.toUpperCase(), bold: true, size: 22, font: FONT, color: ACCENT })],
});
const roleTitle = (t) => new Paragraph({
  spacing: { before: 220, after: 20 },
  children: [new TextRun({ text: t, bold: true, size: 21, font: FONT })],
});
const roleMeta = ([org, dates]) => new Paragraph({
  spacing: { after: 100 },
  children: [
    new TextRun({ text: org, size: 20, font: FONT }),
    ...(dates ? [new TextRun({ text: dates, size: 20, font: FONT, color: GREY, break: 1 })] : []),
  ],
});
const h3 = (t) => new Paragraph({
  spacing: { before: 140, after: 60 },
  children: [new TextRun({ text: t, bold: true, size: 20, font: FONT })],
});
const p = (t) => new Paragraph({ spacing: { after: 100, line: 276 }, children: runs(t) });
const bullet = (t) => new Paragraph({
  numbering: { reference: 'bul', level: 0 },
  spacing: { after: 60, line: 264 },
  children: runs(t),
});

const oneLine = (s) => s.replace(/\s*\n\s*/g, ' ');

// <!-- notes --> are reminders for the author, not part of the CV.
const stripComments = (s) => s.replace(/[ \t]*<!--[\s\S]*?-->/g, '');

function toParagraphs(markdown) {
  const blocks = stripComments(markdown.replace(/\r\n/g, '\n')).trim().split(/\n\s*\n/).filter((b) => b.trim());
  const out = [];
  let afterName = false;
  let afterRole = false;
  for (const block of blocks) {
    const heading = block.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      const [, hashes, text] = heading;
      afterName = hashes === '#';
      afterRole = hashes === '###';
      if (hashes === '#') out.push(name(text));
      else if (hashes === '##') out.push(h1(text));
      else if (hashes === '###') out.push(roleTitle(text));
      else out.push(h3(text));
      continue;
    }
    if (/^- /.test(block)) {
      for (const item of block.split(/\n(?=- )/)) out.push(bullet(oneLine(item.replace(/^- /, ''))));
    } else if (afterName) {
      out.push(contact(oneLine(block)));
    } else if (afterRole) {
      out.push(roleMeta(block.split('\n').map((l) => l.trim())));
    } else {
      out.push(p(oneLine(block)));
    }
    afterName = afterRole = false;
  }
  return out;
}

const make = (children) => new Document({
  numbering: { config: [{ reference: 'bul', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 260 } } } }] }] },
  styles: { default: { document: { run: { font: FONT, size: 20 } } } },
  sections: [{ properties: { page: { margin: { top: 1000, bottom: 1000, left: 1100, right: 1100 } } }, children }],
});

(async () => {
  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith('.md') && f.toLowerCase() !== 'readme.md');
  for (const file of files) {
    const markdown = fs.readFileSync(path.join(contentDir, file), 'utf8');
    const out = `${path.basename(file, '.md')}.docx`;
    fs.writeFileSync(out, await Packer.toBuffer(make(toParagraphs(markdown))));
    console.log(`Built ${out}`);
  }
})();
