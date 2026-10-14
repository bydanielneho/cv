// Runs axe-core against every built page for WCAG 2.2 A/AA, in light and dark
// mode, and checks reflow at 320 CSS px (WCAG 1.4.10).
import { chromium } from 'playwright-core';
import { AxeBuilder } from '@axe-core/playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const pages = readdirSync(dist).filter((f) => f.endsWith('.html'));
const candidates = [process.env.CHROMIUM_PATH, '/opt/pw-browsers/chromium', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome'];
const executablePath = candidates.find((p) => p && existsSync(p));

const browser = await chromium.launch(executablePath ? { executablePath } : {});
let failures = 0;

for (const file of pages) {
  const url = pathToFileURL(join(dist, file)).href;
  for (const colorScheme of ['light', 'dark']) {
    const context = await browser.newContext({ colorScheme });
    const page = await context.newPage();
    await page.goto(url);
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
      .analyze();
    for (const v of violations) {
      failures++;
      console.error(`[${file}, ${colorScheme}] ${v.id}: ${v.help}\n  ${v.helpUrl}`);
      for (const n of v.nodes) console.error(`    ${n.target.join(' ')}`);
    }
    await context.close();
  }

  const narrow = await browser.newPage({ viewport: { width: 320, height: 640 } });
  await narrow.goto(url);
  const overflow = await narrow.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 0) {
    failures++;
    console.error(`[${file}] Reflow: page scrolls horizontally by ${overflow}px at 320px wide.`);
  }
  await narrow.close();
}
await browser.close();

if (failures) {
  console.error(`\n${failures} accessibility issue(s) found.`);
  process.exit(1);
}
console.log(`Checked ${pages.length} page(s): no axe violations (WCAG 2.2 A/AA + best practice) in light or dark mode; reflows at 320px.`);
