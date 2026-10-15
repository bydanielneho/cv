// Builds static, accessible HTML pages from the Markdown in content/.
// The CVs listed under "pages" in cv.config.json are built, each as
// <page name>.html (served at /<page name>), plus a generic index.html
// that doesn't link to any of them, so each CV is reachable only through
// its own link; the other versions in content/ are kept but not published. With
// --all, every version is built, for previewing locally.
import { readFile, writeFile, readdir, mkdir, rm, cp, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import MarkdownIt from 'markdown-it';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = join(root, 'content');
const assetsDir = join(root, 'assets');
const distDir = join(root, 'dist');
let warnings = [];

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const slugify = (s) =>
  s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'section';

const stripTags = (html) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

// Raw HTML is disabled so authors can't introduce non-semantic markup.
// Fuzzy links are off so mentions like "mcert.govt.nz" stay plain text;
// email addresses are still linked.
const md = new MarkdownIt({ html: false, linkify: true, typographer: true });
md.linkify.set({ fuzzyLink: false });

md.core.ruler.push('cv_structure', (state) => {
  const used = new Set();
  let prevLevel = 0;
  let h1Count = 0;
  const tokens = state.tokens;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.type !== 'heading_open') continue;
    const level = Number(t.tag.slice(1));
    const text = tokens[i + 1].content;

    // Check the heading outline (WCAG 1.3.1).
    if (level === 1) h1Count++;
    if (prevLevel && level > prevLevel + 1) {
      warnings.push(`Heading "${text}" jumps from h${prevLevel} to h${level}.`);
    }
    prevLevel = level;

    // Unique ids for headings so sections can be labelled and linked to.
    let id = slugify(text);
    for (let n = 2; used.has(id); n++) id = `${slugify(text)}-${n}`;
    used.add(id);
    t.attrSet('id', id);

    // The paragraph straight after a role heading holds organisation and dates.
    const next = tokens[i + 3];
    if (level === 3 && next?.type === 'paragraph_open') next.attrJoin('class', 'role-meta');
  }
  if (h1Count !== 1) warnings.push(`Expected exactly one "#" heading (your name), found ${h1Count}.`);
});

// Images without alt text are flagged (WCAG 1.1.1).
const defaultImage = md.renderer.rules.image;
md.renderer.rules.image = (tokens, idx, options, env, self) => {
  const t = tokens[idx];
  if (!t.content.trim()) warnings.push(`Image "${t.attrGet('src')}" has no alt text.`);
  return defaultImage(tokens, idx, options, env, self);
};

// "a | b | c" separators: shown visually, but read as a pause by screen readers
// rather than "vertical line".
const separator = '<span class="sep" aria-hidden="true"> | </span><span class="visually-hidden">, </span>';

// The first paragraph after the name is the contact line: render it as a list
// with tappable phone and email links.
function contactList(html) {
  return html.replace(/(<\/h1>\s*)<p>(.*?)<\/p>/s, (match, h1End, inner) => {
    const items = inner.split(/\s+\|\s+/);
    if (items.length < 2) return match;
    const li = items.map((item) => {
      const phone = item.match(/^\+?[\d\s()-]{7,}$/);
      if (phone) return `<li><a href="tel:${item.replace(/[^\d+]/g, '')}">${item.replace(/ /g, '&nbsp;')}</a></li>`;
      return `<li>${item}</li>`;
    });
    return `${h1End}<ul class="contact" aria-label="Contact details">\n${li.join('\n')}\n</ul>`;
  });
}

// Wrap each h2 and its following content in a labelled <section>.
function wrapSections(html) {
  const parts = html.split(/(?=<h2 id=")/);
  const intro = parts[0].startsWith('<h2') ? '' : parts.shift();
  const sections = parts.map((p) => {
    const id = p.match(/^<h2 id="([^"]+)"/)[1];
    return `<section aria-labelledby="${id}">\n${p.trim()}\n</section>`;
  });
  const introHtml = intro.trim() ? `<header class="intro">\n${intro.trim()}\n</header>\n` : '';
  return introHtml + sections.join('\n');
}

// <!-- notes --> are reminders for the author. Raw HTML is disabled, so
// they'd otherwise show as text; remove them before rendering.
const stripComments = (s) => s.replace(/[ \t]*<!--[\s\S]*?-->/g, '');

function renderCv(source) {
  let html = contactList(md.render(stripComments(source)));
  html = html.replace(/ \| /g, separator);
  return wrapSections(html);
}

const formatSize = (bytes) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`);

// Word/PDF files in assets/ named like the Markdown file are offered for download.
async function findDownloads(stem) {
  const kinds = [['docx', 'Word'], ['pdf', 'PDF']];
  const found = [];
  for (const [ext, label] of kinds) {
    const file = join(assetsDir, `${stem}.${ext}`);
    if (!existsSync(file)) continue;
    const { size } = await stat(file);
    found.push({ href: encodeURIComponent(`${stem}.${ext}`), label: `Download this CV as a ${label} document`, meta: `${ext.toUpperCase()}, ${formatSize(size)}` });
  }
  return found;
}

// Contents list linking to each "##" section. It sits before <main> so the
// reading and tab order match the visual order (contents on the left).
function tocHtml(content) {
  const links = [...content.matchAll(/<h2 id="([^"]+)">(.*?)<\/h2>/g)]
    .map(([, id, text]) => `        <li><a href="#${id}">${text}</a></li>`);
  if (links.length < 2) return '';
  return `    <nav class="toc" aria-labelledby="toc-heading">
      <p id="toc-heading" class="toc-title">Contents</p>
      <ul>
${links.join('\n')}
      </ul>
    </nav>`;
}

function downloadsHtml(downloads) {
  if (!downloads.length) return '';
  const items = downloads
    .map((d) => `      <li><a href="${d.href}" download>${escapeHtml(d.label)} <span class="file-meta">(${escapeHtml(d.meta)})</span></a></li>`)
    .join('\n');
  return `    <ul class="downloads">\n${items}\n    </ul>`;
}

async function main() {
  const config = JSON.parse(await readFile(join(root, 'cv.config.json'), 'utf8'));
  const lang = config.lang ?? 'en';
  const template = await readFile(join(root, 'src', 'template.html'), 'utf8');
  const now = new Date();
  const fill = (values) =>
    template
      .replace(/\{\{(\w+)\}\}/g, (_, k) => values[k] ?? '')
      .replace(/^\s*\n/gm, '');
  const common = {
    lang,
    updatedIso: now.toISOString().slice(0, 10),
    updated: now.toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' }),
    authorMeta: config.author ? `<meta name="author" content="${escapeHtml(config.author)}">` : '',
  };

  const versions = (await readdir(contentDir))
    .filter((f) => f.endsWith('.md') && f.toLowerCase() !== 'readme.md')
    .sort();
  if (!versions.length) throw new Error('No Markdown files found in content/.');

  // Page name → Markdown file. With --all, every version gets a page.
  let published;
  if (process.argv.includes('--all') || !config.pages) {
    published = Object.fromEntries(versions.map((f) => {
      const stem = basename(f, '.md');
      return [slugify(stem.includes(' - ') ? stem.split(' - ').pop() : stem), f];
    }));
  } else {
    published = config.pages;
    for (const [name, file] of Object.entries(published)) {
      if (!/^[a-z0-9-]+$/.test(name) || name === 'index') {
        throw new Error(`Page name "${name}" in cv.config.json must be lower-case letters, numbers and hyphens, and not "index".`);
      }
      if (!versions.includes(file)) {
        throw new Error(`Page "${name}" in cv.config.json is "${file}", but there's no such file in content/. Versions: ${versions.join(', ')}`);
      }
    }
    const others = versions.filter((v) => !Object.values(published).includes(v));
    if (others.length) console.log(`Not published (kept in content/): ${others.join(', ')}`);
  }
  const files = Object.values(published);
  const builtStems = new Set(files.map((f) => basename(f, '.md')));

  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });

  let failed = false;
  for (const [name, file] of Object.entries(published)) {
    warnings = [];
    const stem = basename(file, '.md');
    const source = await readFile(join(contentDir, file), 'utf8');
    const content = renderCv(source);
    // "Daniel Neho CV - October 2026" → title "Daniel Neho CV – October 2026".
    const href = `${name}.html`;
    const title = stem.replace(/ - /g, ' – ');
    const profile = content.match(/<h2 id="profile">[\s\S]*?<p>([\s\S]*?)<\/p>/)?.[1];
    const description = profile ? stripTags(profile) : config.description ?? '';

    const page = fill({
      ...common,
      title: escapeHtml(title),
      description: escapeHtml(description),
      content,
      toc: tocHtml(content),
      layoutClass: 'layout has-toc',
      downloads: downloadsHtml(await findDownloads(stem)),
    });
    await writeFile(join(distDir, href), page);

    for (const w of warnings) console.warn(`warning: ${file}: ${w}`);
    if (warnings.length) failed = true;
    console.log(`Built dist/${href} from ${file}`);
  }

  const author = config.author || 'CV';
  const content = `<header class="intro">\n<h1>${escapeHtml(author)}</h1>\n<p>If you've been sent a link to my CV, please use that link to view it.</p>\n</header>`;
  await writeFile(join(distDir, 'index.html'), fill({
    ...common,
    title: escapeHtml(`${author} – ${config.title}`),
    description: escapeHtml(config.description ?? ''),
    content,
    toc: '',
    layoutClass: 'layout',
    downloads: '',
  }));
  console.log('Built dist/index.html (generic landing page)');

  await cp(join(root, 'src', 'styles.css'), join(distDir, 'styles.css'));
  if (existsSync(assetsDir)) {
    // Word/PDF versions of CVs that aren't built stay unpublished too.
    const isOtherVersion = (p) => /\.(docx|pdf)$/i.test(p) && !builtStems.has(basename(p).replace(/\.(docx|pdf)$/i, ''));
    await cp(assetsDir, distDir, { recursive: true, filter: (p) => !p.endsWith('.gitkeep') && !isOtherVersion(p) });
  }

  if (failed && process.argv.includes('--strict')) process.exit(1);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
