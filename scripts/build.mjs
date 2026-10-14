// Builds static, accessible HTML pages from the Markdown in content/.
// Each content/*.md file becomes its own page; with more than one CV an
// index.html links to each version.
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

function renderCv(source) {
  let html = contactList(md.render(source));
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

  const files = (await readdir(contentDir))
    .filter((f) => f.endsWith('.md') && f.toLowerCase() !== 'readme.md')
    .sort();
  if (!files.length) throw new Error('No Markdown files found in content/.');

  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });

  const pages = [];
  let failed = false;
  for (const file of files) {
    warnings = [];
    const stem = basename(file, '.md');
    const source = await readFile(join(contentDir, file), 'utf8');
    const content = renderCv(source);
    // "Daniel Neho CV - Principal Digital" → title "Daniel Neho CV – Principal Digital",
    // version "Principal Digital", page "principal-digital.html".
    const version = stem.includes(' - ') ? stem.split(' - ').pop() : stem;
    const href = files.length > 1 ? `${slugify(version)}.html` : 'index.html';
    const title = stem.replace(/ - /g, ' – ');
    const profile = content.match(/<h2 id="profile">[\s\S]*?<p>([\s\S]*?)<\/p>/)?.[1];
    const description = profile ? stripTags(profile) : config.description ?? '';

    const page = fill({
      ...common,
      title: escapeHtml(title),
      description: escapeHtml(description),
      content,
      downloads: downloadsHtml(await findDownloads(stem)),
    });
    await writeFile(join(distDir, href), page);
    pages.push({ href, version, description });

    for (const w of warnings) console.warn(`warning: ${file}: ${w}`);
    if (warnings.length) failed = true;
    console.log(`Built dist/${href} from ${file}`);
  }

  if (files.length > 1) {
    const name = config.author || 'CV';
    const list = pages
      .map((p) => `<li>\n<h2><a href="${p.href}">${escapeHtml(p.version)}</a></h2>\n<p>${escapeHtml(p.description)}</p>\n</li>`)
      .join('\n');
    const content = `<header class="intro">\n<h1>${escapeHtml(name)}</h1>\n<p>Choose a version of my CV.</p>\n</header>\n<ul class="versions">\n${list}\n</ul>`;
    await writeFile(join(distDir, 'index.html'), fill({
      ...common,
      title: escapeHtml(`${name} – ${config.title}`),
      description: escapeHtml(config.description ?? ''),
      content,
      downloads: '',
    }));
    console.log('Built dist/index.html (list of versions)');
  }

  await cp(join(root, 'src', 'styles.css'), join(distDir, 'styles.css'));
  await cp(join(root, 'src', 'fonts'), join(distDir, 'fonts'), { recursive: true });
  if (existsSync(assetsDir)) {
    await cp(assetsDir, distDir, { recursive: true, filter: (p) => !p.endsWith('.gitkeep') });
  }

  if (failed && process.argv.includes('--strict')) process.exit(1);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
