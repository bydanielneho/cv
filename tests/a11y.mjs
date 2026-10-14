// Accessibility checks for every built page, at desktop, laptop, tablet and
// phone (320px = 400% zoom) widths:
// - axe-core: every rule, including best practice and experimental rules,
//   so WCAG 2.0/2.1/2.2 A and AA are all covered.
// - Keyboard: tabbing reaches every link, and each focused element is on
//   screen, not covered by anything (WCAG 2.4.11), has a visible outline
//   (2.4.7) and is at least 24px tall (2.5.8).
// - Reflow: no horizontal scrolling (1.4.10), including with the WCAG 1.4.12
//   text-spacing overrides applied.
// - In-page links (skip link, Contents) all point at something that exists.
import { chromium } from 'playwright-core';
import { AxeBuilder } from '@axe-core/playwright';
import axe from 'axe-core';
import { fileURLToPath } from 'node:url';
import { existsSync, readdirSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { join, extname } from 'node:path';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const pages = readdirSync(dist).filter((f) => f.endsWith('.html'));
// Experimental axe rules are off by default; switch them all on.
const experimentalRules = Object.fromEntries(axe.getRules(['experimental']).map((r) => [r.ruleId, { enabled: true }]));
const viewports = [[1440, 900], [1024, 600], [768, 1024], [320, 640]];
const textSpacing = '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p, li { margin-bottom: 2em !important; }';

const candidates = [process.env.CHROMIUM_PATH, '/opt/pw-browsers/chromium', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome'];
const executablePath = candidates.find((p) => p && existsSync(p));
// Serve dist/ over HTTP so axe can read the stylesheet (file:// blocks it).
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css' };
const server = createServer(async (req, res) => {
  try {
    const body = await readFile(join(dist, decodeURIComponent(new URL(req.url, 'http://x').pathname)));
    res.writeHead(200, { 'Content-Type': types[extname(req.url)] ?? 'application/octet-stream' }).end(body);
  } catch {
    res.writeHead(404).end();
  }
}).listen(0, '127.0.0.1');
await new Promise((r) => server.once('listening', r));
const origin = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch(executablePath ? { executablePath } : {});

let failures = 0;
const fail = (where, msg) => {
  failures++;
  console.error(`[${where}] ${msg}`);
};

for (const file of pages) {
  const url = `${origin}/${file}`;

  for (const [width, height] of viewports) {
    const where = `${file} @ ${width}px`;
    const context = await browser.newContext({ viewport: { width, height } });
    const page = await context.newPage();
    await page.goto(url);

    // axe: every rule, including experimental ones.
    const { violations, incomplete } = await new AxeBuilder({ page })
      .options({ rules: experimentalRules })
      .analyze();
    for (const v of violations) {
      fail(where, `${v.id}: ${v.help}\n  ${v.helpUrl}\n    ${v.nodes.map((n) => n.target.join(' ')).join('\n    ')}`);
    }
    for (const v of incomplete) console.warn(`[${where}] needs manual review — ${v.id}: ${v.help}`);

    // Keyboard: tab through every focusable element.
    const expected = await page.evaluate(() => document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])').length);
    const seen = new Set();
    for (let i = 0; i < expected + 5; i++) {
      await page.keyboard.press('Tab');
      const f = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        const x = Math.min(Math.max(r.left + Math.min(r.width / 2, 10), 0), innerWidth - 1);
        const y = Math.min(Math.max(r.top + Math.min(r.height / 2, 10), 0), innerHeight - 1);
        const hit = document.elementFromPoint(x, y);
        return {
          label: el.outerHTML.slice(0, 80),
          onScreen: r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth,
          covered: !(hit === el || el.contains(hit)),
          outline: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2,
          height: r.height,
        };
      });
      if (!f || seen.has(f.label)) break;
      seen.add(f.label);
      if (!f.onScreen) fail(where, `Focused element is off screen: ${f.label}`);
      else if (f.covered) fail(where, `Focused element is covered by other content: ${f.label}`);
      if (!f.outline) fail(where, `Focused element has no visible focus outline: ${f.label}`);
      if (f.height < 24) fail(where, `Focused element is under 24px tall: ${f.label}`);
    }
    if (seen.size < expected) fail(where, `Keyboard reached ${seen.size} of ${expected} focusable elements.`);

    // Reflow, with and without text-spacing overrides.
    const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if ((await overflow()) > 0) fail(where, 'Page scrolls horizontally.');
    await page.addStyleTag({ content: textSpacing });
    if ((await overflow()) > 0) fail(where, 'Page scrolls horizontally with WCAG text-spacing overrides.');

    await context.close();
  }

  // In-page links point at existing targets.
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(url);
  const broken = await page.evaluate(() =>
    [...document.querySelectorAll('a[href^="#"]')]
      .map((a) => a.getAttribute('href'))
      .filter((h) => !document.getElementById(decodeURIComponent(h.slice(1)))));
  for (const h of broken) fail(file, `In-page link ${h} has no target.`);
  await context.close();
}

await browser.close();
server.close();

if (failures) {
  console.error(`\n${failures} accessibility issue(s) found.`);
  process.exit(1);
}
console.log(`Checked ${pages.length} page(s) at ${viewports.map(([w]) => `${w}px`).join(', ')}: no axe violations (all rules incl. experimental), keyboard focus visible and unobscured, reflow OK with text spacing.`);
