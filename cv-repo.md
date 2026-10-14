# CV website – complete project

Everything needed to recreate the accessible HTML CV project in a new
GitHub repository. It holds every source file; the build output
(`dist/`), `node_modules/` and the generated Word files are left out
because they're rebuilt from these.

Your phone number and email are not in any of these files.

## Contents

1. [Set up the new repository](#set-up-the-new-repository)
2. [Unpack script](#unpack-script)
3. [Files](#files)

## Set up the new repository

You need [Node.js](https://nodejs.org/) 20 or later and Git.

1. Create a new, empty repository on your new GitHub account. Don't add a
   README, licence or .gitignore.
2. Make an empty folder on your computer. Save this file in it as
   `cv-repo.md`.
3. Save the [unpack script](#unpack-script) below in the same folder as
   `unpack-cv.mjs`, then run:

   ```sh
   node unpack-cv.mjs cv-repo.md
   ```

   It recreates every file in the [Files](#files) section, with its folder.
   It should report 20 files.
4. Delete `cv-repo.md` and `unpack-cv.mjs`, then install, build and test:

   ```sh
   npm install
   npm test
   ```

   `npm test` builds the Word files and the HTML into `dist/`, then runs
   the HTML and accessibility checks. To preview: `npm run serve`, then
   open http://localhost:8080.
5. Commit and push, replacing the URL with your new repository's:

   ```sh
   git init -b main
   git add .
   git commit -m "Accessible HTML CV"
   git remote add origin https://github.com/YOUR-ACCOUNT/YOUR-REPO.git
   git push -u origin main
   ```

6. Optional — publish with GitHub Pages: Settings → Pages → Source:
   **GitHub Actions**. Then push to `main` (or run the "Deploy static
   content to Pages" workflow from the Actions tab). It builds the site,
   runs the accessibility tests and publishes only the built HTML, never
   the source files such as `NOTES.md`. The site is public once deployed,
   so check the content first.

If you'd rather not run the script, you can create each file by hand: the
heading above each block is the file's path, and the block is its exact
contents.

## Unpack script

Save as `unpack-cv.mjs`.

```js
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const fence = '`'.repeat(5);
const md = readFileSync(process.argv[2] ?? 'cv-repo.md', 'utf8').replace(/\r\n/g, '\n');
const re = new RegExp('^### File: `([^`]+)`\n\n' + fence + '[^\n]*\n([\\s\\S]*?)\n?' + fence + '$', 'gm');
let count = 0;
for (const [, path, body] of md.matchAll(re)) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, body ? `${body}\n` : '');
  console.log(`  ${path}`);
  count++;
}
console.log(`Wrote ${count} files.`);
```

## Files

### File: `.github/workflows/site.yml`

`````yaml
# Builds and tests on every push and pull request. Deployment to GitHub
# Pages is in static.yml.
name: Build and test

on:
  push:
  pull_request:
  workflow_dispatch:

permissions:
  contents: read

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      # Accessibility tests use the Chrome preinstalled on GitHub runners.
      - run: npm test
`````

### File: `.github/workflows/static.yml`

`````yaml
# Builds the CV and deploys the static HTML (dist/) to GitHub Pages.
# Only the built site is published, never the repository's source files.
name: Deploy static content to Pages

on:
  # Runs on pushes targeting the default branch
  push:
    branches: ["main"]

  # Allows you to run this workflow manually from the Actions tab
  workflow_dispatch:

# Sets permissions of the GITHUB_TOKEN to allow deployment to GitHub Pages
permissions:
  contents: read
  pages: write
  id-token: write

# Allow only one concurrent deployment, skipping runs queued between the run in-progress and latest queued.
# However, do NOT cancel in-progress runs as we want to allow these production deployments to complete.
concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  # Build, test, then deploy. Nothing is published if the accessibility
  # checks fail.
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - name: Install
        run: npm ci
      # Builds the Word files and HTML into dist/, then runs the HTML and
      # accessibility checks (using the Chrome preinstalled on the runner).
      - name: Build and test
        run: npm test
      - name: Setup Pages
        uses: actions/configure-pages@v5
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          # Only the built site
          path: dist
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v5
`````

### File: `.gitignore`

`````
node_modules/
dist/
*.log
.DS_Store
# Word files are generated by `npm run build:word`
assets/*.docx
`````

### File: `.htmlvalidate.json`

`````json
{
  "extends": ["html-validate:recommended", "html-validate:a11y"]
}
`````

### File: `NOTES.md`

`````markdown
# Daniel Neho – CV working files

Last updated: 14 October 2026

## Files

| File | What it is |
|---|---|
| `content/Daniel Neho CV - Principal Advisor Communications.md` | CV aimed at Principal Advisor roles in external communications |
| `content/Daniel Neho CV - Principal Digital.md` | CV aimed at Principal Digital roles |
| `word/cv-build.cjs` | Node script (`docx` package) that builds both Word files. Run `npm run build:word` to regenerate them into `assets/`. Generated .docx files are not committed |

## Structure of both CVs

1. Profile
2. Key strengths
3. Current role: Senior Advisor Communications, MCERT (1 July 2026 to current)
4. Previous roles: HUD Senior Advisor Communications (November 2024 to June 2026), then Office of the Ombudsman, Kāinga Ora and MSD
5. Other roles, certifications and referees

The two CVs share the same roles. They differ in the profile, the key strengths and the order of sections within the MCERT and HUD roles.

## Still to confirm

- The MCERT job title ("Senior Advisor Communications" is a placeholder)
- Bullets worded as "contributed to" that Daniel may have led, including media monitoring discovery
- Whether Daniel was the de facto digital channels lead during establishment
- Detail and outcomes for local government work and the boat ramp permit project
- The Ministers' names for the ministerial drafting bullet
- Length: about 4 pages for communications and 5 for digital, so they need trimming

## Where this is going

The goal is a digital-first CV: an HTML version built from these Markdown files. The Markdown files are the content source for that.
`````

### File: `README.md`

`````markdown
# CV

A completely static, accessible (WCAG 2.2 AA) HTML version of my CV, built
from Markdown. No JavaScript is shipped to the browser.

- `content/*.md` — the CV content. Each file becomes its own page, e.g.
  `Daniel Neho CV - Principal Digital.md` → `principal-digital.html`. With
  more than one CV, `index.html` links to each version.
- `word/cv-build.cjs` — builds the Word versions into `assets/`.
- `src/template.html`, `src/styles.css` — page template and styles. Type
  sizes are the tokens at the top of `styles.css`.
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
`````

### File: `assets/.gitkeep`

`````
`````

### File: `content/Daniel Neho CV - Principal Advisor Communications.md`

`````markdown
# Daniel Neho

Wellington, NZ

## Profile

I’m a senior communications advisor with more than seven years in the New Zealand public sector. I lead communications for high-profile, politically sensitive announcements – from Budget to legislative change – and work directly with Ministers’ offices, journalists, senior leaders and subject matter experts.

I regularly step up as media lead, managing live and reactive media alongside proactive announcements. I lead across agencies, manage reputational risk calmly and at pace, and bring a strong digital background, so my communications plans are delivered end to end across every channel.

I’m ready to take on a principal role: owning the strategy, advising senior leaders and Ministers’ offices, and developing the people around me.

## Key strengths

- Strategic communications planning for major and sensitive announcements
- Media management, including live enquiries and proactive and reactive lines
- Advising senior leaders and Ministers’ offices
- Reputational risk and issues management
- Cross-agency communications leadership
- Writing for Ministers: speeches, Q&As, talking points and key messages
- Digital, social media and publications
- Coaching and developing others

## Current role

### Senior Advisor Communications

Ministry for Cities, Environment, Regions and Transport (MCERT)  
1 July 2026 to current

My role at HUD transitioned into MCERT when the Ministry was established on 1 July 2026.

I provide communications and digital advice across the Ministry’s portfolio, with a focus on local government, digital product management for mcert.govt.nz and brand development.

#### Local government

- **Digital lead** for the ongoing migration of DIA local government website content into MCERT’s new local government function
- Communications and digital support for local government work, including city and regional deals, the Local Government Commission and other local government policy

#### Communications operations

- Contributed to discovery for consolidating media monitoring services inherited from four legacy agencies – gathering requirements and reviewing supplier contracts, licensing and renewals to inform procurement
- Designed a media enquiries management system in SharePoint and Power Automate
- Contributed to communications programme planning and dashboard reporting, and to transition communications during establishment

#### Lake Taupō Harbourmaster Team

- **Product owner and project lead** for a new boat ramp permit solution – leading requirements design, procurement and delivery (ongoing)
- Designing the redesigned boat ramp permit
- Ongoing brand development for the team, including the logo lockup and brand guidance

#### Digital channels strategy and governance

- Co-authored a proposal to establish a Digital Channels Transition Project to assess, govern and rationalise MCERT’s digital channel portfolio
- Developing a transitional digital channels approach for MCERT, with a decision framework and indicative investment options
- Provided strategic advice on the future direction of MCERT’s digital channels, including websites, intranets, social media, consultation platforms, newsletters and digital services
- Contributed to digital governance, ownership and publishing frameworks, channel inventories and a future-state digital operating model
- Contributed to the intranet work programme, including governance, information architecture, migration from legacy intranets and recommendations to retire legacy platforms
- Designed an interim release management process to protect the quarterly vendor support retainer

#### Digital product management and delivery

- Lead digital product management and continuous improvement for mcert.govt.nz
- Responsible for a portfolio of more than 25 government websites, including transport.govt.nz
- Launching the new Community Housing Regulatory Authority (CHRA) register on 21 October 2026, rebuilding a static register of about 95 providers into individual provider pages
- Leading the migration of stv.govt.nz into mcert.govt.nz, including the STV calculator
- Leading the decommission of ata.govt.nz
- Leading user acceptance testing for the transport.govt.nz Silverstripe 6.2 upgrade
- Contributed to business cases, Statements of Work, risk assessments and delivery planning for website and digital service initiatives

#### Publishing and accessibility

- Provided urgent publishing support so statutory and Cabinet-related material was published within required timeframes
- Publish and manage content across housing, transport, environment and regional development websites, and advise business groups on publishing, document structure and accessibility
- Tracking accessibility across MCERT’s websites using CWAC scan data, working toward sites with no issues
- Preparing MCERT’s websites for the secondary legislation publication requirements starting on 2 November 2026

## Previous roles

### Senior Advisor Communications – Communications and Government Services

Te Tūāpapa Kura Kāinga – Ministry of Housing and Urban Development (HUD)  
November 2024 to June 2026

I led communications for major housing announcements and provided strategic advice to the Ministry, senior leaders and Ministers’ offices. Through a secondment to the Integration Management Office, I also led key digital and communications workstreams to establish MCERT.

#### Media and ministerial communications

- **Media lead:** regularly acted as media lead in the communications manager’s absence, managing the day’s media enquiries – live enquiries and proactive and reactive lines – working directly with journalists, subject matter experts and Ministers’ offices
- Developed and led operational and Minister’s office communications plans for key housing announcements, including the Government Policy Statement on Housing and Urban Development (GPS-HUD), the Housing Investment Plan, pet bonds, Going for Housing Growth, regulation of residential property managers, the Retirement Villages Act, methamphetamine contamination and Budget 2025
- **Budget 2026:** communications and digital lead, supporting housing announcements including pre-Budget announcements
- Drafted speeches, reactive Q&As and media responses for Ministers in the Housing portfolio and the Ministry

#### Strategic and cross-agency leadership

- Led the cross-agency communications approach for Auckland city centre initiatives
- Led communications for move-on orders
- Designed and led the short-term actions factsheet
- Led internal communications while the role was vacant, and led communications for the Microsoft Copilot rollout

#### Establishing MCERT (Integration Management Office secondment)

- Led the MCERT website, intranet, social media and brand workstreams, delivering mcert.govt.nz and the MCERT intranet for launch on 1 July 2026
- Set up MCERT’s Facebook, X and LinkedIn channels, with a social media strategy, setup guides and a channel register

#### Digital, publications and design

- Led the redevelopment of the CHRA website
- Managed production of the annual report, and designed the GPS-HUD and Housing Investment Plan publications
- Led the redevelopment of the secondary legislation section of hud.govt.nz, and completed accessibility improvements in April 2026

#### Developing others

- Coached and trained a colleague across communications, digital, and internal and external communications

### Communications Advisor

Office of the Ombudsman  
October 2022 to October 2024

Provided strategic and generalist communications support to the Chief Ombudsman and the Office.

- Led strategic communications and media management for the Chief Ombudsman, including high-risk announcements
- Advised the Chief Ombudsman and senior management on risk, relationships and external stakeholder management
- Wrote and delivered speeches, talking points, Q&As, media releases, web content, social media, newsletters and presentations
- Wrote and delivered strategic communications and engagement plans
- Provided on-the-ground media and social media support at the Chief Ombudsman’s external engagements
- Championed plain language and web content best practice across teams in Auckland and Wellington

### Analyst – Intranet Content

Kāinga Ora – Homes and Communities  
June 2022 to October 2022

Promoted from Communications Advisor (April to June 2022) after advising on a better content design process, including content strategy and governance.

- Redesigned the SharePoint document library and knowledge base, and planned the migration of existing content
- Managed, planned and published all intranet content in SharePoint, and managed content requests from business units
- Trained staff across the business in SharePoint, plain language and the NZ Government Web Standards
- Managed QMS review cycles and version control, and reported on usage through dashboards with recommendations for improvement
- Mentored technical writers and led a community of practice on content design, plain language and WCAG

### Internal Communications Advisor (secondment)

Ministry of Social Development  
July 2021 to September 2021

- Coordinated internal communications for MSD’s COVID-19 Welfare response, including the COVID-19 Protection Framework
- Delivered a twice-daily e-newsletter to all of MSD during the August 2021 lockdown
- Planned and developed communications for a business group-wide reorganisation
- Ran a weekly live online forum with the Acting Deputy Chief Executive, and content for four internal digital channels

### Online Content Advisor

Ministry of Social Development  
March 2021 to April 2022

- Helped create and implement the content strategy for a new knowledge base, including training, processes, content plans and audits
- Turned complex technical information into clear, findable content, working with subject matter experts
- Published content in TeamSite and Confluence, and created Google Data Studio reports
- Trained advisors in TeamSite, Confluence and Google Analytics, and contributed to the Knowledge Management style guide

### Web Content Coordinator

Ministry of Social Development  
June 2019 to March 2021

- Subject matter expert for the redesign of the SuperGold website and mobile app
- Wrote, managed and published content for the SuperGold website and the team’s knowledge base
- Planned and ran a one-day event launching the new SuperGold website and app
- Processed SuperGold and Community Services Card applications, and wage subsidy applications during the COVID-19 response

## Other roles

Website Content Manager and Consultant – New Zealand Uniforms, Wellington | November 2018 to June 2019

Assistant Manager – The Brand Outlet, New Zealand-wide | June 2017 to September 2018

Retail Assistant – The Brand Outlet, Wellington | May 2017

## Certifications

- Change Management Foundation – APMG
- Yellow Belt, Lean Six Sigma – Kāinga Ora
- Web Content Writing – Contented
- The Fundamentals of Digital Marketing – Google
- Graphic Design and Web Design packages – Yoobee
- Automotive Engineering – Whitirea Polytechnic

## Referees

Available on request.
`````

### File: `content/Daniel Neho CV - Principal Digital.md`

`````markdown
# Daniel Neho

Wellington, NZ

## Profile

I’m a senior digital and communications advisor with more than seven years in the New Zealand public sector, spanning web, intranet, content design, accessibility and communications.

I led the website, intranet, social media and brand workstreams that delivered MCERT’s digital channels for launch on 1 July 2026, and I’m responsible for a portfolio of more than 25 government websites. I combine hands-on delivery – CMS, analytics, accessibility and vendor management – with digital strategy, governance and the communications skills to bring senior leaders and teams with me.

I’m ready to take on a principal role: setting digital direction, owning governance and standards, and developing the people around me.

## Key strengths

- Digital channel strategy and governance
- Website and intranet delivery (Silverstripe, SharePoint)
- Accessibility, WCAG and the NZ Government Web Standards
- Content design and plain language
- Vendor, release and change management
- Analytics and dashboards (GA4, Google Tag Manager, Power BI)
- Strategic communications and stakeholder management
- Coaching and developing others

## Current role

### Senior Advisor Communications

Ministry for Cities, Environment, Regions and Transport (MCERT)  
1 July 2026 to current

My role at HUD transitioned into MCERT when the Ministry was established on 1 July 2026.

I lead digital product management and continuous improvement for mcert.govt.nz and a portfolio of more than 25 websites, and provide communications and digital support across the Ministry, including local government work.

#### Digital channels strategy and governance

- Co-authored a proposal to establish a Digital Channels Transition Project to assess, govern and rationalise MCERT’s digital channel portfolio
- Developing a transitional digital channels approach for MCERT, with a decision framework and indicative investment options
- Provided strategic advice on the future direction of MCERT’s digital channels, including websites, intranets, social media, consultation platforms, newsletters and digital services
- Contributed to digital governance, ownership and publishing frameworks, channel inventories and a future-state digital operating model
- Contributed to the intranet work programme, including governance, information architecture, migration from legacy intranets and recommendations to retire legacy platforms
- Designed an interim release management process to protect the quarterly vendor support retainer

#### Digital product management and delivery

- Lead digital product management and continuous improvement for mcert.govt.nz
- Responsible for a portfolio of more than 25 government websites, including transport.govt.nz
- Launching the new Community Housing Regulatory Authority (CHRA) register on 21 October 2026, rebuilding a static register of about 95 providers into individual provider pages
- Leading the migration of stv.govt.nz into mcert.govt.nz, including the STV calculator
- Leading the decommission of ata.govt.nz
- Leading user acceptance testing for the transport.govt.nz Silverstripe 6.2 upgrade
- Contributed to business cases, Statements of Work, risk assessments and delivery planning for website and digital service initiatives

#### Publishing and accessibility

- Provided urgent publishing support so statutory and Cabinet-related material was published within required timeframes
- Publish and manage content across housing, transport, environment and regional development websites, and advise business groups on publishing, document structure and accessibility
- Tracking accessibility across MCERT’s websites using CWAC scan data, working toward sites with no issues
- Preparing MCERT’s websites for the secondary legislation publication requirements starting on 2 November 2026

#### Lake Taupō Harbourmaster Team

- **Product owner and project lead** for a new boat ramp permit solution – leading requirements design, procurement and delivery (ongoing)
- Designing the redesigned boat ramp permit
- Ongoing brand development for the team, including the logo lockup and brand guidance

#### Local government

- **Digital lead** for the ongoing migration of DIA local government website content into MCERT’s new local government function
- Communications and digital support for local government work, including city and regional deals, the Local Government Commission and other local government policy

#### Communications operations

- Contributed to discovery for consolidating media monitoring services inherited from four legacy agencies – gathering requirements and reviewing supplier contracts, licensing and renewals to inform procurement
- Designed a media enquiries management system in SharePoint and Power Automate
- Contributed to communications programme planning and dashboard reporting, and to transition communications during establishment

## Previous roles

### Senior Advisor Communications – Communications and Government Services

Te Tūāpapa Kura Kāinga – Ministry of Housing and Urban Development (HUD)  
November 2024 to June 2026

I led digital and communications work for the Ministry and provided strategic advice to senior leaders. Through a secondment to the Integration Management Office, I led the digital channels needed to establish MCERT.

#### Establishing MCERT (Integration Management Office secondment)

- **Website lead:** delivered mcert.govt.nz (Silverstripe 6) for launch on 1 July 2026, including GA4 and Google Tag Manager tracking
- **Intranet lead:** delivered the MCERT intranet for launch on 1 July 2026, including the information architecture and migration across six SharePoint subsites and about 45 pages of DIA local government content
- **Social media lead:** set up MCERT’s Facebook, X and LinkedIn channels, with a social media strategy, setup guides and a channel register
- **Brand lead** for MCERT
- Planned the hud.govt.nz decommission and migration, including moving analytics to GA4
- Introduced content ownership and automated review reminders across the intranet

#### Website delivery and digital BAU

- Led the redevelopment of the CHRA website
- Led the redevelopment of the secondary legislation section of hud.govt.nz
- Managed digital BAU, including the housing dashboards, the delivery dashboard and the homelessness insights report
- Contributed to digital processes and strategy

#### Accessibility

- Completed accessibility improvements in April 2026, and raised accessibility awareness across HUD
- Made a formal submission to the NZ Government Digital Accessibility Standard consultation

#### Communications

- **Budget 2026:** communications and digital lead, supporting housing announcements including pre-Budget announcements
- Regularly acted as media lead in the communications manager’s absence, working directly with journalists, subject matter experts and Ministers’ offices
- Developed and led communications plans for key housing announcements, including GPS-HUD, the Housing Investment Plan and Going for Housing Growth, and led the cross-agency communications approach for Auckland city centre initiatives
- Led internal communications while the role was vacant, and led communications for the Microsoft Copilot rollout

#### Publications, design and people

- Managed production of the annual report, and designed the GPS-HUD and Housing Investment Plan publications
- Coached and trained a colleague across communications, digital, and internal and external communications

### Communications Advisor

Office of the Ombudsman  
October 2022 to October 2024

Provided strategic and generalist communications support to the Chief Ombudsman and the Office.

- Led strategic communications and media management for the Chief Ombudsman, including high-risk announcements
- Advised the Chief Ombudsman and senior management on risk, relationships and external stakeholder management
- Wrote and delivered speeches, talking points, Q&As, media releases, web content, social media, newsletters and presentations
- Wrote and delivered strategic communications and engagement plans
- Provided on-the-ground media and social media support at the Chief Ombudsman’s external engagements
- Championed plain language and web content best practice across teams in Auckland and Wellington

### Analyst – Intranet Content

Kāinga Ora – Homes and Communities  
June 2022 to October 2022

Promoted from Communications Advisor (April to June 2022) after advising on a better content design process, including content strategy and governance.

- Redesigned the SharePoint document library and knowledge base, and planned the migration of existing content
- Managed, planned and published all intranet content in SharePoint, and managed content requests from business units
- Trained staff across the business in SharePoint, plain language and the NZ Government Web Standards
- Managed QMS review cycles and version control, and reported on usage through dashboards with recommendations for improvement
- Mentored technical writers and led a community of practice on content design, plain language and WCAG

### Internal Communications Advisor (secondment)

Ministry of Social Development  
July 2021 to September 2021

- Coordinated internal communications for MSD’s COVID-19 Welfare response, including the COVID-19 Protection Framework
- Delivered a twice-daily e-newsletter to all of MSD during the August 2021 lockdown
- Planned and developed communications for a business group-wide reorganisation
- Ran a weekly live online forum with the Acting Deputy Chief Executive, and content for four internal digital channels

### Online Content Advisor

Ministry of Social Development  
March 2021 to April 2022

- Helped create and implement the content strategy for a new knowledge base, including training, processes, content plans and audits
- Turned complex technical information into clear, findable content, working with subject matter experts
- Published content in TeamSite and Confluence, and created Google Data Studio reports
- Trained advisors in TeamSite, Confluence and Google Analytics, and contributed to the Knowledge Management style guide

### Web Content Coordinator

Ministry of Social Development  
June 2019 to March 2021

- Subject matter expert for the redesign of the SuperGold website and mobile app
- Wrote, managed and published content for the SuperGold website and the team’s knowledge base
- Planned and ran a one-day event launching the new SuperGold website and app
- Processed SuperGold and Community Services Card applications, and wage subsidy applications during the COVID-19 response

## Other roles

Website Content Manager and Consultant – New Zealand Uniforms, Wellington | November 2018 to June 2019

Assistant Manager – The Brand Outlet, New Zealand-wide | June 2017 to September 2018

Retail Assistant – The Brand Outlet, Wellington | May 2017

## Certifications

- Change Management Foundation – APMG
- Yellow Belt, Lean Six Sigma – Kāinga Ora
- Web Content Writing – Contented
- The Fundamentals of Digital Marketing – Google
- Graphic Design and Web Design packages – Yoobee
- Automotive Engineering – Whitirea Polytechnic

## Referees

Available on request.
`````

### File: `content/README.md`

`````markdown
# Content

Put your CV Markdown files here. Every `*.md` file in this folder (except this
README) is rendered, in filename order, into a single page. Prefix files with
numbers to control the order, e.g. `01-profile.md`, `02-experience.md`.

Structure rules (these keep the page accessible):

- Use exactly one `#` heading for the whole CV — your name.
- Use `##` for each section (Experience, Education, …). Each becomes a
  labelled `<section>`.
- Use `###` for items within a section; don't skip heading levels.
- Give every image meaningful alt text: `![Description](path.png)`. Put images
  in `assets/`.
- Write descriptive link text — not "click here".
- Raw HTML is disabled so the output stays semantic and valid.
`````

### File: `cv.config.json`

`````json
{
  "lang": "en-NZ",
  "author": "Daniel Neho",
  "title": "CV",
  "description": "CV of Daniel Neho, senior digital and communications advisor in the New Zealand public sector."
}
`````

### File: `package.json`

`````json
{
  "name": "cv",
  "version": "1.0.0",
  "private": true,
  "description": "Static, accessible (WCAG 2.2 AA) HTML version of my CV, built from Markdown.",
  "type": "module",
  "scripts": {
    "build": "npm run build:word && npm run build:html",
    "build:html": "node scripts/build.mjs --strict",
    "build:word": "node -e \"process.chdir('assets');require('./word/cv-build.cjs')\"",
    "serve": "node scripts/serve.mjs",
    "test:html": "html-validate \"dist/**/*.html\"",
    "test:a11y": "node tests/a11y.mjs",
    "test": "npm run build && npm run test:html && npm run test:a11y"
  },
  "engines": {
    "node": ">=20"
  },
  "devDependencies": {
    "@axe-core/playwright": "^4.13.0",
    "axe-core": "^4.13.0",
    "docx": "^9.11.0",
    "html-validate": "^11.16.2",
    "markdown-it": "^15.0.2",
    "playwright-core": "^1.64.0"
  }
}
`````

### File: `scripts/build.mjs`

`````js
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
      toc: tocHtml(content),
      layoutClass: 'layout has-toc',
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
      toc: '',
      layoutClass: 'layout',
      downloads: '',
    }));
    console.log('Built dist/index.html (list of versions)');
  }

  await cp(join(root, 'src', 'styles.css'), join(distDir, 'styles.css'));
  if (existsSync(assetsDir)) {
    await cp(assetsDir, distDir, { recursive: true, filter: (p) => !p.endsWith('.gitkeep') });
  }

  if (failed && process.argv.includes('--strict')) process.exit(1);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
`````

### File: `scripts/serve.mjs`

`````js
// Minimal static server for previewing dist/ locally: npm run serve
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const port = Number(process.env.PORT) || 8080;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };

createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  const file = join(dist, path.endsWith('/') ? `${path}index.html` : path);
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end('Not found');
  }
}).listen(port, () => console.log(`Serving dist/ at http://localhost:${port}`));
`````

### File: `src/styles.css`

`````css
/*
 * CV styles: black text on white in Arial, a font already installed on
 * almost every device so nothing has to download.
 *
 * Sizes are in rem so they scale with the reader's browser text size and
 * zoom (WCAG 1.4.4). Spacing is in em/unitless so it grows with the text and
 * survives user text-spacing overrides (WCAG 1.4.12).
 */

:root {
  --color-bg: #ffffff;
  --color-text: #000000;

  /* Arial, then metric-compatible equivalents where Arial isn't installed */
  --font-body: Arial, 'Helvetica Neue', Helvetica, 'Liberation Sans', Arimo, sans-serif;

  /* Type scale. 1.125rem = 18px at the browser default. */
  --text-base: 1.125rem;
  --text-small: 1rem;
  --text-h1: 2.25rem;
  --text-h2: 1.625rem;
  --text-h3: 1.3125rem;
  --text-h4: 1.125rem;

  --measure: 42rem;            /* about 70 characters per line */
  --toc-width: 13rem;
  --space: 1.25rem;
  --line-height: 1.6;
}

*, *::before, *::after { box-sizing: border-box; }

html {
  font-size: 100%;             /* respect the reader's text size setting */
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

body {
  margin: 0;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: 400;
  line-height: var(--line-height);
  overflow-wrap: break-word;
  font-kerning: normal;
}

main, .site-footer, .toc {
  max-width: var(--measure);
  margin-inline: auto;
  padding-inline: var(--space);
}

/* Contents: above the CV on narrow screens and when zoomed in, in a
   column on the left on wide screens. Breakpoint is in em so zooming in
   switches to the single-column layout. */
.toc { padding-top: calc(var(--space) * 2); font-size: var(--text-small); }
.toc-title { font-weight: 700; margin-bottom: 0.5em; }
.toc ul { list-style: none; padding: 0; margin: 0; border-left: 2px solid var(--color-text); }
.toc li + li { margin-top: 0; }
/* Each link is at least 24px tall (WCAG 2.5.8) */
.toc a { display: block; min-height: 24px; padding: 0.3em 0 0.3em 0.9em; text-decoration-thickness: 0.06em; }

@media (min-width: 64em) {
  .layout.has-toc {
    display: grid;
    grid-template-columns: var(--toc-width) minmax(0, var(--measure));
    column-gap: calc(var(--space) * 2);
    justify-content: center;
    align-items: start;
    padding-inline: var(--space);
  }
  .has-toc > main, .has-toc > .site-footer, .has-toc > .toc {
    max-width: none;
    margin-inline: 0;
    padding-inline: 0;
  }
  .has-toc > .toc {
    grid-row: 1 / span 2;
    /* Stays in view while scrolling; it never overlaps the CV text, so it
       can't hide focused content (WCAG 2.4.11). */
    position: sticky;
    top: 0;
    max-height: 100vh;
    overflow-y: auto;
  }
  .has-toc > main, .has-toc > .site-footer { grid-column: 2; }
}

main { padding-block: calc(var(--space) * 2) var(--space); }
main:focus { outline: none; }

h1, h2, h3, h4 {
  font-weight: 700;
  line-height: 1.25;
  margin-block: 1.75em 0.5em;
}
h1 { font-size: var(--text-h1); margin-top: 0; }
h2 {
  font-size: var(--text-h2);
  scroll-margin-top: var(--space);   /* breathing room when jumped to from Contents */
  padding-bottom: 0.25em;
  border-bottom: 2px solid var(--color-text);
}
h3 { font-size: var(--text-h3); margin-top: 1.5em; }
h4 { font-size: var(--text-h4); margin-block: 1.5em 0.4em; }

p, ul, ol, dl { margin-block: 0 1em; }
ul, ol { padding-inline-start: 1.5em; }
li + li { margin-top: 0.4em; }
li::marker { font-size: 1em; }

strong { font-weight: 700; }

hr { border: 0; border-top: 1px solid var(--color-text); margin-block: 2em; }

img { max-width: 100%; height: auto; }

table { border-collapse: collapse; width: 100%; margin-block: 0 1em; }
th, td { text-align: start; padding: 0.4em 0.6em; border-bottom: 1px solid var(--color-text); }

/* Links are black like the text, so they're marked by an underline rather
   than colour (WCAG 1.4.1). Hover thickens the underline. */
a {
  color: var(--color-text);
  text-decoration: underline;
  text-underline-offset: 0.18em;
  text-decoration-thickness: 0.08em;
}
a:hover { text-decoration-thickness: 0.18em; }

/* Focus: thick black outline with a white gap, visible on any background
   (WCAG 2.4.7, 2.4.13). */
:focus-visible {
  outline: 3px solid var(--color-text);
  outline-offset: 3px;
  box-shadow: 0 0 0 3px var(--color-bg);
  border-radius: 2px;
}

.skip-link {
  position: absolute;
  left: var(--space);
  top: var(--space);
  z-index: 1;
  padding: 0.75em 1em;
  background: var(--color-bg);
  color: var(--color-text);
  border: 2px solid var(--color-text);
  font-weight: 700;
  transform: translateY(-200%);
}
.skip-link:focus { transform: none; }

.visually-hidden {
  position: absolute !important;
  width: 1px; height: 1px;
  margin: -1px; padding: 0; border: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.intro { margin-bottom: 1.5em; }
.intro h1 { margin-bottom: 0.3em; }

.contact { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 0.25em 1.5em; }
.contact li + li { margin-top: 0; }
/* Standalone links meet the 24×24px target size (WCAG 2.5.8) */
.contact a { display: inline-block; min-height: 24px; }

/* Organisation and dates beneath a role title */
.role-meta { margin-top: -0.25em; }

.versions { list-style: none; padding: 0; }
.versions h2 { border: 0; margin-bottom: 0.25em; }
.versions li + li { margin-top: 1.5em; }

.site-footer {
  padding-block: var(--space) calc(var(--space) * 2);
  font-size: var(--text-small);
  border-top: 1px solid var(--color-text);
}
.downloads { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 0.75em 1.5em; }
.downloads li + li { margin-top: 0; }
.downloads a { display: inline-block; min-height: 24px; padding-block: 0.25em; }
.file-meta { white-space: nowrap; }

@media print {
  body { font-size: 11pt; line-height: 1.45; }
  h1 { font-size: 20pt; }
  h2 { font-size: 14pt; }
  h3 { font-size: 12pt; }
  h4 { font-size: 11pt; }
  main, .site-footer { padding: 0; max-width: none; }
  .skip-link, .downloads, .toc { display: none; }
  .layout.has-toc { display: block; padding: 0; }
  .site-footer { border: 0; padding: 0; }
  h2, h3, h4 { break-after: avoid; }
  li { break-inside: avoid; }
}
`````

### File: `src/template.html`

`````html
<!DOCTYPE html>
<html lang="{{lang}}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{title}}</title>
  <meta name="description" content="{{description}}">
  {{authorMeta}}
  <meta name="color-scheme" content="light">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <a class="skip-link" href="#main">Skip to main content</a>
  <div class="{{layoutClass}}">
{{toc}}
    <main id="main" tabindex="-1">
{{content}}
    </main>
    <footer class="site-footer">
{{downloads}}
      <p>Last updated <time datetime="{{updatedIso}}">{{updated}}</time>.</p>
    </footer>
  </div>
</body>
</html>
`````

### File: `tests/a11y.mjs`

`````js
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
`````

### File: `word/README.md`

`````markdown
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
`````

### File: `word/cv-build.cjs`

`````js
const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, LevelFormat, AlignmentType, BorderStyle,
} = require('docx');

const FONT = 'Arial';
const ACCENT = '1F3A5F';

const name = () => new Paragraph({
  spacing: { after: 60 },
  children: [new TextRun({ text: 'Daniel Neho', bold: true, size: 40, font: FONT, color: ACCENT })],
});
const contact = () => new Paragraph({
  spacing: { after: 200 },
  children: [new TextRun({ text: 'Wellington, NZ', size: 20, font: FONT })],
});
const h1 = (t) => new Paragraph({
  spacing: { before: 280, after: 120 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 2 } },
  children: [new TextRun({ text: t.toUpperCase(), bold: true, size: 22, font: FONT, color: ACCENT })],
});
const h3 = (t) => new Paragraph({
  spacing: { before: 140, after: 60 },
  children: [new TextRun({ text: t, bold: true, size: 20, font: FONT })],
});
const p = (t, opts = {}) => new Paragraph({
  spacing: { after: 100, line: 276 },
  children: [new TextRun({ text: t, size: 20, font: FONT, ...opts })],
});
const b = (t) => {
  // support "Lead: rest" bolding
  const m = t.match(/^\*\*(.+?)\*\*(.*)$/);
  const runs = m
    ? [new TextRun({ text: m[1], bold: true, size: 20, font: FONT }), new TextRun({ text: m[2], size: 20, font: FONT })]
    : [new TextRun({ text: t, size: 20, font: FONT })];
  return new Paragraph({ numbering: { reference: 'bul', level: 0 }, spacing: { after: 60, line: 264 }, children: runs });
};
const role = (title, org, dates) => [
  new Paragraph({
    spacing: { before: 220, after: 20 },
    children: [new TextRun({ text: title, bold: true, size: 21, font: FONT })],
  }),
  new Paragraph({
    spacing: { after: 100 },
    children: [
      new TextRun({ text: org, size: 20, font: FONT }),
      new TextRun({ text: dates, size: 20, font: FONT, color: '555555', break: 1 }),
    ],
  }),
];

// ---------- shared current-role header ----------
const mcertHeader = () => [
  ...role(
    'Senior Advisor Communications',
    'Ministry for Cities, Environment, Regions and Transport (MCERT)',
    '1 July 2026 to current'
  ),
  p('My role at HUD transitioned into MCERT when the Ministry was established on 1 July 2026.', { color: '555555' }),
];
const hudHeader = () => [
  ...role(
    'Senior Advisor Communications – Communications and Government Services',
    'Te Tūāpapa Kura Kāinga – Ministry of Housing and Urban Development (HUD)',
    'November 2024 to June 2026'
  ),
];

// MCERT role sections
const mcertDigital = () => [
  h3('Digital channels strategy and governance'),
  b('Co-authored a proposal to establish a Digital Channels Transition Project to assess, govern and rationalise MCERT’s digital channel portfolio'),
  b('Developing a transitional digital channels approach for MCERT, with a decision framework and indicative investment options'),
  b('Provided strategic advice on the future direction of MCERT’s digital channels, including websites, intranets, social media, consultation platforms, newsletters and digital services'),
  b('Contributed to digital governance, ownership and publishing frameworks, channel inventories and a future-state digital operating model'),
  b('Contributed to the intranet work programme, including governance, information architecture, migration from legacy intranets and recommendations to retire legacy platforms'),
  b('Designed an interim release management process to protect the quarterly vendor support retainer'),

  h3('Digital product management and delivery'),
  b('Lead digital product management and continuous improvement for mcert.govt.nz'),
  b('Responsible for a portfolio of more than 25 government websites, including transport.govt.nz'),
  b('Launching the new Community Housing Regulatory Authority (CHRA) register on 21 October 2026, rebuilding a static register of about 95 providers into individual provider pages'),
  b('Leading the migration of stv.govt.nz into mcert.govt.nz, including the STV calculator'),
  b('Leading the decommission of ata.govt.nz'),
  b('Leading user acceptance testing for the transport.govt.nz Silverstripe 6.2 upgrade'),
  b('Contributed to business cases, Statements of Work, risk assessments and delivery planning for website and digital service initiatives'),

  h3('Publishing and accessibility'),
  b('Provided urgent publishing support so statutory and Cabinet-related material was published within required timeframes'),
  b('Publish and manage content across housing, transport, environment and regional development websites, and advise business groups on publishing, document structure and accessibility'),
  b('Tracking accessibility across MCERT’s websites using CWAC scan data, working toward sites with no issues'),
  b('Preparing MCERT’s websites for the secondary legislation publication requirements starting on 2 November 2026'),
];
const mcertHarbourmaster = () => [
  h3('Lake Taupō Harbourmaster Team'),
  b('**Product owner and project lead **for a new boat ramp permit solution – leading requirements design, procurement and delivery (ongoing)'),
  b('Designing the redesigned boat ramp permit'),
  b('Ongoing brand development for the team, including the logo lockup and brand guidance'),
];
const mcertLocalGov = () => [
  h3('Local government'),
  b('**Digital lead **for the ongoing migration of DIA local government website content into MCERT’s new local government function'),
  b('Communications and digital support for local government work, including city and regional deals, the Local Government Commission and other local government policy'),
];
const mcertComms = () => [
  h3('Communications operations'),
  b('Contributed to discovery for consolidating media monitoring services inherited from four legacy agencies – gathering requirements and reviewing supplier contracts, licensing and renewals to inform procurement'),
  b('Designed a media enquiries management system in SharePoint and Power Automate'),
  b('Contributed to communications programme planning and dashboard reporting, and to transition communications during establishment'),
];

// ---------- shared previous roles ----------
const previousRoles = () => [
  ...role('Communications Advisor', 'Office of the Ombudsman', 'October 2022 to October 2024'),
  p('Provided strategic and generalist communications support to the Chief Ombudsman and the Office.'),
  b('Led strategic communications and media management for the Chief Ombudsman, including high-risk announcements'),
  b('Advised the Chief Ombudsman and senior management on risk, relationships and external stakeholder management'),
  b('Wrote and delivered speeches, talking points, Q&As, media releases, web content, social media, newsletters and presentations'),
  b('Wrote and delivered strategic communications and engagement plans'),
  b('Provided on-the-ground media and social media support at the Chief Ombudsman’s external engagements'),
  b('Championed plain language and web content best practice across teams in Auckland and Wellington'),

  ...role('Analyst – Intranet Content', 'Kāinga Ora – Homes and Communities', 'June 2022 to October 2022'),
  p('Promoted from Communications Advisor (April to June 2022) after advising on a better content design process, including content strategy and governance.'),
  b('Redesigned the SharePoint document library and knowledge base, and planned the migration of existing content'),
  b('Managed, planned and published all intranet content in SharePoint, and managed content requests from business units'),
  b('Trained staff across the business in SharePoint, plain language and the NZ Government Web Standards'),
  b('Managed QMS review cycles and version control, and reported on usage through dashboards with recommendations for improvement'),
  b('Mentored technical writers and led a community of practice on content design, plain language and WCAG'),

  ...role('Internal Communications Advisor (secondment)', 'Ministry of Social Development', 'July 2021 to September 2021'),
  b('Coordinated internal communications for MSD’s COVID-19 Welfare response, including the COVID-19 Protection Framework'),
  b('Delivered a twice-daily e-newsletter to all of MSD during the August 2021 lockdown'),
  b('Planned and developed communications for a business group-wide reorganisation'),
  b('Ran a weekly live online forum with the Acting Deputy Chief Executive, and content for four internal digital channels'),

  ...role('Online Content Advisor', 'Ministry of Social Development', 'March 2021 to April 2022'),
  b('Helped create and implement the content strategy for a new knowledge base, including training, processes, content plans and audits'),
  b('Turned complex technical information into clear, findable content, working with subject matter experts'),
  b('Published content in TeamSite and Confluence, and created Google Data Studio reports'),
  b('Trained advisors in TeamSite, Confluence and Google Analytics, and contributed to the Knowledge Management style guide'),

  ...role('Web Content Coordinator', 'Ministry of Social Development', 'June 2019 to March 2021'),
  b('Subject matter expert for the redesign of the SuperGold website and mobile app'),
  b('Wrote, managed and published content for the SuperGold website and the team’s knowledge base'),
  b('Planned and ran a one-day event launching the new SuperGold website and app'),
  b('Processed SuperGold and Community Services Card applications, and wage subsidy applications during the COVID-19 response'),

  h1('Other roles'),
  p('Website Content Manager and Consultant – New Zealand Uniforms, Wellington  |  November 2018 to June 2019'),
  p('Assistant Manager – The Brand Outlet, New Zealand-wide  |  June 2017 to September 2018'),
  p('Retail Assistant – The Brand Outlet, Wellington  |  May 2017'),

  h1('Certifications'),
  b('Change Management Foundation – APMG'),
  b('Yellow Belt, Lean Six Sigma – Kāinga Ora'),
  b('Web Content Writing – Contented'),
  b('The Fundamentals of Digital Marketing – Google'),
  b('Graphic Design and Web Design packages – Yoobee'),
  b('Automotive Engineering – Whitirea Polytechnic'),

  h1('Referees'),
  p('Available on request.'),
];

const skillsLine = (items) => items.map(b);

// ================= CV 1: Principal Advisor – external comms =================
const comms = [
  name(), contact(),
  h1('Profile'),
  p('I’m a senior communications advisor with more than seven years in the New Zealand public sector. I lead communications for high-profile, politically sensitive announcements – from Budget to legislative change – and work directly with Ministers’ offices, journalists, senior leaders and subject matter experts.'),
  p('I regularly step up as media lead, managing live and reactive media alongside proactive announcements. I lead across agencies, manage reputational risk calmly and at pace, and bring a strong digital background, so my communications plans are delivered end to end across every channel.'),
  p('I’m ready to take on a principal role: owning the strategy, advising senior leaders and Ministers’ offices, and developing the people around me.'),

  h1('Key strengths'),
  ...skillsLine([
    'Strategic communications planning for major and sensitive announcements',
    'Media management, including live enquiries and proactive and reactive lines',
    'Advising senior leaders and Ministers’ offices',
    'Reputational risk and issues management',
    'Cross-agency communications leadership',
    'Writing for Ministers: speeches, Q&As, talking points and key messages',
    'Digital, social media and publications',
    'Coaching and developing others',
  ]),

  h1('Current role'),
  ...mcertHeader(),
  p('I provide communications and digital advice across the Ministry’s portfolio, with a focus on local government, digital product management for mcert.govt.nz and brand development.'),
  ...mcertLocalGov(),
  ...mcertComms(),
  ...mcertHarbourmaster(),
  ...mcertDigital(),

  h1('Previous roles'),
  ...hudHeader(),
  p('I led communications for major housing announcements and provided strategic advice to the Ministry, senior leaders and Ministers’ offices. Through a secondment to the Integration Management Office, I also led key digital and communications workstreams to establish MCERT.'),

  h3('Media and ministerial communications'),
  b('**Media lead: **regularly acted as media lead in the communications manager’s absence, managing the day’s media enquiries – live enquiries and proactive and reactive lines – working directly with journalists, subject matter experts and Ministers’ offices'),
  b('Developed and led operational and Minister’s office communications plans for key housing announcements, including the Government Policy Statement on Housing and Urban Development (GPS-HUD), the Housing Investment Plan, pet bonds, Going for Housing Growth, regulation of residential property managers, the Retirement Villages Act, methamphetamine contamination and Budget 2025'),
  b('**Budget 2026: **communications and digital lead, supporting housing announcements including pre-Budget announcements'),
  b('Drafted speeches, reactive Q&As and media responses for Ministers in the Housing portfolio and the Ministry'),

  h3('Strategic and cross-agency leadership'),
  b('Led the cross-agency communications approach for Auckland city centre initiatives'),
  b('Led communications for move-on orders'),
  b('Designed and led the short-term actions factsheet'),
  b('Led internal communications while the role was vacant, and led communications for the Microsoft Copilot rollout'),

  h3('Establishing MCERT (Integration Management Office secondment)'),
  b('Led the MCERT website, intranet, social media and brand workstreams, delivering mcert.govt.nz and the MCERT intranet for launch on 1 July 2026'),
  b('Set up MCERT’s Facebook, X and LinkedIn channels, with a social media strategy, setup guides and a channel register'),

  h3('Digital, publications and design'),
  b('Led the redevelopment of the CHRA website'),
  b('Managed production of the annual report, and designed the GPS-HUD and Housing Investment Plan publications'),
  b('Led the redevelopment of the secondary legislation section of hud.govt.nz, and completed accessibility improvements in April 2026'),

  h3('Developing others'),
  b('Coached and trained a colleague across communications, digital, and internal and external communications'),

  ...previousRoles(),
];

// ================= CV 2: Principal Digital =================
const digital = [
  name(), contact(),
  h1('Profile'),
  p('I’m a senior digital and communications advisor with more than seven years in the New Zealand public sector, spanning web, intranet, content design, accessibility and communications.'),
  p('I led the website, intranet, social media and brand workstreams that delivered MCERT’s digital channels for launch on 1 July 2026, and I’m responsible for a portfolio of more than 25 government websites. I combine hands-on delivery – CMS, analytics, accessibility and vendor management – with digital strategy, governance and the communications skills to bring senior leaders and teams with me.'),
  p('I’m ready to take on a principal role: setting digital direction, owning governance and standards, and developing the people around me.'),

  h1('Key strengths'),
  ...skillsLine([
    'Digital channel strategy and governance',
    'Website and intranet delivery (Silverstripe, SharePoint)',
    'Accessibility, WCAG and the NZ Government Web Standards',
    'Content design and plain language',
    'Vendor, release and change management',
    'Analytics and dashboards (GA4, Google Tag Manager, Power BI)',
    'Strategic communications and stakeholder management',
    'Coaching and developing others',
  ]),

  h1('Current role'),
  ...mcertHeader(),
  p('I lead digital product management and continuous improvement for mcert.govt.nz and a portfolio of more than 25 websites, and provide communications and digital support across the Ministry, including local government work.'),
  ...mcertDigital(),
  ...mcertHarbourmaster(),
  ...mcertLocalGov(),
  ...mcertComms(),

  h1('Previous roles'),
  ...hudHeader(),
  p('I led digital and communications work for the Ministry and provided strategic advice to senior leaders. Through a secondment to the Integration Management Office, I led the digital channels needed to establish MCERT.'),

  h3('Establishing MCERT (Integration Management Office secondment)'),
  b('**Website lead: **delivered mcert.govt.nz (Silverstripe 6) for launch on 1 July 2026, including GA4 and Google Tag Manager tracking'),
  b('**Intranet lead: **delivered the MCERT intranet for launch on 1 July 2026, including the information architecture and migration across six SharePoint subsites and about 45 pages of DIA local government content'),
  b('**Social media lead: **set up MCERT’s Facebook, X and LinkedIn channels, with a social media strategy, setup guides and a channel register'),
  b('**Brand lead **for MCERT'),
  b('Planned the hud.govt.nz decommission and migration, including moving analytics to GA4'),
  b('Introduced content ownership and automated review reminders across the intranet'),

  h3('Website delivery and digital BAU'),
  b('Led the redevelopment of the CHRA website'),
  b('Led the redevelopment of the secondary legislation section of hud.govt.nz'),
  b('Managed digital BAU, including the housing dashboards, the delivery dashboard and the homelessness insights report'),
  b('Contributed to digital processes and strategy'),

  h3('Accessibility'),
  b('Completed accessibility improvements in April 2026, and raised accessibility awareness across HUD'),
  b('Made a formal submission to the NZ Government Digital Accessibility Standard consultation'),

  h3('Communications'),
  b('**Budget 2026: **communications and digital lead, supporting housing announcements including pre-Budget announcements'),
  b('Regularly acted as media lead in the communications manager’s absence, working directly with journalists, subject matter experts and Ministers’ offices'),
  b('Developed and led communications plans for key housing announcements, including GPS-HUD, the Housing Investment Plan and Going for Housing Growth, and led the cross-agency communications approach for Auckland city centre initiatives'),
  b('Led internal communications while the role was vacant, and led communications for the Microsoft Copilot rollout'),

  h3('Publications, design and people'),
  b('Managed production of the annual report, and designed the GPS-HUD and Housing Investment Plan publications'),
  b('Coached and trained a colleague across communications, digital, and internal and external communications'),

  ...previousRoles(),
];

const make = (children) => new Document({
  numbering: { config: [{ reference: 'bul', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 260 } } } }] }] },
  styles: { default: { document: { run: { font: FONT, size: 20 } } } },
  sections: [{ properties: { page: { margin: { top: 1000, bottom: 1000, left: 1100, right: 1100 } } }, children }],
});

(async () => {
  fs.writeFileSync('./Daniel Neho CV - Principal Advisor Communications.docx', await Packer.toBuffer(make(comms)));
  fs.writeFileSync('./Daniel Neho CV - Principal Digital.docx', await Packer.toBuffer(make(digital)));
})();
`````

### File: `package-lock.json`

`````json
{
  "name": "cv",
  "version": "1.0.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "cv",
      "version": "1.0.0",
      "devDependencies": {
        "@axe-core/playwright": "^4.13.0",
        "axe-core": "^4.13.0",
        "docx": "^9.11.0",
        "html-validate": "^11.16.2",
        "markdown-it": "^15.0.2",
        "playwright-core": "^1.64.0"
      },
      "engines": {
        "node": ">=20"
      }
    },
    "node_modules/@axe-core/playwright": {
      "version": "4.13.0",
      "resolved": "https://registry.npmjs.org/@axe-core/playwright/-/playwright-4.13.0.tgz",
      "integrity": "sha512-6YLx+kxXu5GJceG4ozFg+33a2EMTdjYwWGloJ3sb9Kta5pp+ZNS53uxGVog5JetIY8s++P5UrtX+cri+u0VAVg==",
      "dev": true,
      "license": "MPL-2.0",
      "dependencies": {
        "axe-core": "~4.13.0"
      },
      "peerDependencies": {
        "playwright-core": ">= 1.0.0"
      }
    },
    "node_modules/@html-validate/stylish": {
      "version": "6.1.0",
      "resolved": "https://registry.npmjs.org/@html-validate/stylish/-/stylish-6.1.0.tgz",
      "integrity": "sha512-ceNvF6/5hgvw/OrxXtdl2KurRVLN/Q/OkD/qminRRY/IIERmVaqJOpDF1nhRZMrOG/vyKKW0+Nxw6lSoHUP4Ow==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "^22.16.0 || >= 24.0.0"
      }
    },
    "node_modules/@sidvind/better-ajv-errors": {
      "version": "7.0.0",
      "resolved": "https://registry.npmjs.org/@sidvind/better-ajv-errors/-/better-ajv-errors-7.0.0.tgz",
      "integrity": "sha512-imVsp5D3KxJ8+uUmu2dsLKnFg3qdX952v/L1gZoCa0NO2ivhQWHMpYM2KmpFrRXHWFjlqkNZ/935nxiTqXEi1A==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": "^22.12 || >= 24.0"
      },
      "peerDependencies": {
        "ajv": "^8.0.0"
      }
    },
    "node_modules/@types/node": {
      "version": "26.6.5",
      "resolved": "https://registry.npmjs.org/@types/node/-/node-26.6.5.tgz",
      "integrity": "sha512-uMzsv9stDdofIZBx4UGh4Z9ZgXnGC9seRDscilBcTHAeOFk67MZg/k9bWVfO+bk4qZmG+l52hRnLwUiH2LnJTg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "undici-types": "~8.9.0"
      }
    },
    "node_modules/ajv": {
      "version": "8.20.0",
      "resolved": "https://registry.npmjs.org/ajv/-/ajv-8.20.0.tgz",
      "integrity": "sha512-Thbli+OlOj+iMPYFBVBfJ3OmCAnaSyNn4M1vz9T6Gka5Jt9ba/HIR56joy65tY6kx/FCF5VXNB819Y7/GUrBGA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "fast-deep-equal": "^3.1.3",
        "fast-uri": "^3.0.1",
        "json-schema-traverse": "^1.0.0",
        "require-from-string": "^2.0.2"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/epoberezkin"
      }
    },
    "node_modules/argparse": {
      "version": "3.0.2",
      "resolved": "https://registry.npmjs.org/argparse/-/argparse-3.0.2.tgz",
      "integrity": "sha512-mFdDM6WqWKraGLsVb+C9CahPnzTXOefAOLq3jYcca2YZ8bEWpr++Tzj+zSaKW9+X9L5uSxcm1AZ3Y6aZJ09OhQ==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/puzrin"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/nodeca"
        }
      ],
      "license": "PSF-2.0"
    },
    "node_modules/axe-core": {
      "version": "4.13.0",
      "resolved": "https://registry.npmjs.org/axe-core/-/axe-core-4.13.0.tgz",
      "integrity": "sha512-UzGt8zg7Ny8djbYMhxl2zuEevVa7r2gJjYY5Lwr1xM7+XU2nd6CkIWFTVcCIbAP63vSz71NaVyyuSk9lHKcy0A==",
      "dev": true,
      "license": "MPL-2.0",
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/core-util-is": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/core-util-is/-/core-util-is-1.0.3.tgz",
      "integrity": "sha512-ZQBvi1DcpJ4GDqanjucZ2Hj3wEO5pZDS89BWbkcrvdxksJorwUDDZamX9ldFkp9aw2lmBDLgkObEA4DWNJ9FYQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/docx": {
      "version": "9.11.0",
      "resolved": "https://registry.npmjs.org/docx/-/docx-9.11.0.tgz",
      "integrity": "sha512-vQLEYi45vlN/auiMHgx4oC95wbP5qPaD7Vanfixcd3wtTl5gLUPWqUpwbw6yVN0/U6o3p3EX4P5puAeYPXvcSQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/node": "^26.6.2",
        "hash.js": "^1.1.7",
        "jszip": "^3.10.1",
        "nanoid": "^6.0.1",
        "xml": "^1.0.1",
        "xml-js": "^1.6.8"
      },
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/entities": {
      "version": "8.1.0",
      "resolved": "https://registry.npmjs.org/entities/-/entities-8.1.0.tgz",
      "integrity": "sha512-kxL7msIffSuh9aaFAMD7rxAIuTRMAHMeBtgHW2yUdWw732ZNh4MehkF2gdjvtdmikkaIP9bFDDJOPlsvm7avrA==",
      "dev": true,
      "license": "BSD-2-Clause",
      "engines": {
        "node": ">=20.19.0"
      },
      "funding": {
        "url": "https://github.com/fb55/entities?sponsor=1"
      }
    },
    "node_modules/fast-deep-equal": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/fast-deep-equal/-/fast-deep-equal-3.1.3.tgz",
      "integrity": "sha512-f3qQ9oQy9j2AhBe/H9VC91wLmKBCCU/gDOnKNAYG5hswO7BLKj09Hc5HYNz9cGI++xlpDCIgDaitVs03ATR84Q==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/fast-uri": {
      "version": "3.1.8",
      "resolved": "https://registry.npmjs.org/fast-uri/-/fast-uri-3.1.8.tgz",
      "integrity": "sha512-GZMtZUTNRpOVIECoXwLNZS5xUGE+mVNbTB8h/7Rwh2TFWcBQiPzTgyZi05BF9UMZKkLJv8XBRJTlU7zg8+ZfMg==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/fastify"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/fastify"
        }
      ],
      "license": "BSD-3-Clause"
    },
    "node_modules/hash.js": {
      "version": "1.1.7",
      "resolved": "https://registry.npmjs.org/hash.js/-/hash.js-1.1.7.tgz",
      "integrity": "sha512-taOaskGt4z4SOANNseOviYDvjEJinIkRgmp7LbKP2YTTmVxWBl87s/uzK9r+44BclBSp2X7K1hqeNfz9JbBeXA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "inherits": "^2.0.3",
        "minimalistic-assert": "^1.0.1"
      }
    },
    "node_modules/html-validate": {
      "version": "11.16.2",
      "resolved": "https://registry.npmjs.org/html-validate/-/html-validate-11.16.2.tgz",
      "integrity": "sha512-oci8F4t1AQdAwkOK895hOOrMTSY0zZ6fk4p2LCvGKQDjL/CYDTGyIoVTzZWII0DfwA7gpq7+qJxAKubUofgo1Q==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/html-validate"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "@html-validate/stylish": "^6.0.0",
        "@sidvind/better-ajv-errors": "7.0.0",
        "ajv": "^8.0.0",
        "kleur": "^4.1.0",
        "prompts": "^2.0.0",
        "semver": "^7.0.0"
      },
      "bin": {
        "html-validate": "bin/html-validate.mjs"
      },
      "engines": {
        "node": "^22.22.0 || >= 24.8.0"
      },
      "peerDependencies": {
        "@jest/globals": "^29.0.3 || ^30.0.0",
        "@vitest/expect": "^3.2.0 || ^4.0.1 || ^5.0.0",
        "jest": "^29.0.3 || ^30.0.0",
        "jest-snapshot": "^29.0.3 || ^30.0.0",
        "vitest": "^3.2.0 || ^4.0.1 || ^5.0.0"
      },
      "peerDependenciesMeta": {
        "@jest/globals": {
          "optional": true
        },
        "@vitest/expect": {
          "optional": true
        },
        "jest": {
          "optional": true
        },
        "jest-snapshot": {
          "optional": true
        },
        "vitest": {
          "optional": true
        }
      }
    },
    "node_modules/immediate": {
      "version": "3.0.6",
      "resolved": "https://registry.npmjs.org/immediate/-/immediate-3.0.6.tgz",
      "integrity": "sha512-XXOFtyqDjNDAQxVfYxuF7g9Il/IbWmmlQg2MYKOH8ExIT1qg6xc4zyS3HaEEATgs1btfzxq15ciUiY7gjSXRGQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/inherits": {
      "version": "2.0.4",
      "resolved": "https://registry.npmjs.org/inherits/-/inherits-2.0.4.tgz",
      "integrity": "sha512-k/vGaX4/Yla3WzyMCvTQOXYeIHvqOKtnqBduzTHpzpQZzAskKMhZ2K+EnBiSM9zGSoIFeMpXKxa4dYeZIQqewQ==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/isarray": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/isarray/-/isarray-1.0.0.tgz",
      "integrity": "sha512-VLghIWNM6ELQzo7zwmcg0NmTVyWKYjvIeM83yjp0wRDTmUnrM678fQbcKBo6n2CJEF0szoG//ytg+TKla89ALQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/json-schema-traverse": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/json-schema-traverse/-/json-schema-traverse-1.0.0.tgz",
      "integrity": "sha512-NM8/P9n3XjXhIZn1lLhkFaACTOURQXjWhV4BA/RnOv8xvgqtqpAX9IO4mRQxSx1Rlo4tqzeqb0sOlruaOy3dug==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/jszip": {
      "version": "3.10.2",
      "resolved": "https://registry.npmjs.org/jszip/-/jszip-3.10.2.tgz",
      "integrity": "sha512-3l+rb15IOWtUhU0H5MFqES/T6Kh7abYwjosBey/vD6hDt8zoEffkSC5Ws5SGtgVw3gBx2NEbhTeSW1+kWkpyTQ==",
      "dev": true,
      "license": "(MIT OR GPL-3.0-or-later)",
      "dependencies": {
        "lie": "~3.3.0",
        "pako": "~1.0.2",
        "readable-stream": "~2.3.6",
        "setimmediate": "^1.0.5"
      }
    },
    "node_modules/kleur": {
      "version": "4.1.5",
      "resolved": "https://registry.npmjs.org/kleur/-/kleur-4.1.5.tgz",
      "integrity": "sha512-o+NO+8WrRiQEE4/7nwRJhN1HWpVmJm511pBHUxPLtp0BUISzlBplORYSmTclCnJvQq2tKu/sgl3xVpkc7ZWuQQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/lie": {
      "version": "3.3.0",
      "resolved": "https://registry.npmjs.org/lie/-/lie-3.3.0.tgz",
      "integrity": "sha512-UaiMJzeWRlEujzAuw5LokY1L5ecNQYZKfmyZ9L7wDHb/p5etKaxXhohBcrw0EYby+G/NA52vRSN4N39dxHAIwQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "immediate": "~3.0.5"
      }
    },
    "node_modules/linkify-it": {
      "version": "6.1.0",
      "resolved": "https://registry.npmjs.org/linkify-it/-/linkify-it-6.1.0.tgz",
      "integrity": "sha512-wJ/TwpSDTLepCrQoYWYIExIKg5Zchex2Nn5yk2mFnB+6PtdkHtyLx742md9csRjjOnGkKIS/RrbY7l8D6gT9Vw==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/puzrin"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/markdown-it"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "uc.micro": "^3.0.0"
      }
    },
    "node_modules/markdown-it": {
      "version": "15.0.2",
      "resolved": "https://registry.npmjs.org/markdown-it/-/markdown-it-15.0.2.tgz",
      "integrity": "sha512-q4IGxMv56jCqT4OCRCADBoDP3LO4MhmTXjFbphHPXs4g3j9Xg5RDnxqN8IF/3vIWEU+VCnUq+7JUg/cfy2E6Qw==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/puzrin"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/markdown-it"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "argparse": "^3.0.0",
        "entities": "^8.0.0",
        "linkify-it": "^6.0.0",
        "mdurl": "^2.1.0",
        "punycode.js": "^2.3.1",
        "uc.micro": "^3.0.0"
      },
      "bin": {
        "markdown-it": "bin/markdown-it.mjs"
      }
    },
    "node_modules/mdurl": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/mdurl/-/mdurl-2.1.0.tgz",
      "integrity": "sha512-1+HBaOx0zi/dQWht8rNv9MYf9qqpqL/kxI0hXImU6Y547zM6Sni8BQibt7ifgMcYtQg41ao3Ivd6cnSM86inpg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/minimalistic-assert": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/minimalistic-assert/-/minimalistic-assert-1.0.1.tgz",
      "integrity": "sha512-UtJcAD4yEaGtjPezWuO9wC4nwUnVH/8/Im3yEHQP4b67cXlD/Qr9hdITCU1xDbSEXg2XKNaP8jsReV7vQd00/A==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/nanoid": {
      "version": "6.0.2",
      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-6.0.2.tgz",
      "integrity": "sha512-hIvVOb9Qr1p/9CNNLOe0OlWvgx/ziTsVwKN/GDSsuArN2K0wDiafP3s0SWmsm7o2BdnyS8Z9Z64NFBUbn6ziBg==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "bin": {
        "nanoid": "bin/nanoid.js"
      },
      "engines": {
        "node": "^22 || ^24 || >=26"
      }
    },
    "node_modules/pako": {
      "version": "1.0.11",
      "resolved": "https://registry.npmjs.org/pako/-/pako-1.0.11.tgz",
      "integrity": "sha512-4hLB8Py4zZce5s4yd9XzopqwVv/yGNhV1Bl8NTmCq1763HeK2+EwVTv+leGeL13Dnh2wfbqowVPXCIO0z4taYw==",
      "dev": true,
      "license": "(MIT AND Zlib)"
    },
    "node_modules/playwright-core": {
      "version": "1.64.0",
      "resolved": "https://registry.npmjs.org/playwright-core/-/playwright-core-1.64.0.tgz",
      "integrity": "sha512-T9r+MZkTECl2+oUcZ26YgZzTrYidTsIhYYkJix+6iDOymOb1FB2RLLSOxRGnZGv5DStt+aduIVbt+E8WygXYpg==",
      "dev": true,
      "license": "Apache-2.0",
      "bin": {
        "playwright-core": "cli.js"
      },
      "engines": {
        "node": ">=20"
      }
    },
    "node_modules/process-nextick-args": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/process-nextick-args/-/process-nextick-args-2.0.1.tgz",
      "integrity": "sha512-3ouUOpQhtgrbOa17J7+uxOTpITYWaGP7/AhoR3+A+/1e9skrzelGi/dXzEYyvbxubEF6Wn2ypscTKiKJFFn1ag==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/prompts": {
      "version": "2.4.2",
      "resolved": "https://registry.npmjs.org/prompts/-/prompts-2.4.2.tgz",
      "integrity": "sha512-NxNv/kLguCA7p3jE8oL2aEBsrJWgAakBpgmgK6lpPWV+WuOmY6r2/zbAVnP+T8bQlA0nzHXSJSJW0Hq7ylaD2Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "kleur": "^3.0.3",
        "sisteransi": "^1.0.5"
      },
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/prompts/node_modules/kleur": {
      "version": "3.0.3",
      "resolved": "https://registry.npmjs.org/kleur/-/kleur-3.0.3.tgz",
      "integrity": "sha512-eTIzlVOSUR+JxdDFepEYcBMtZ9Qqdef+rnzWdRZuMbOywu5tO2w2N7rqjoANZ5k9vywhL6Br1VRjUIgTQx4E8w==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/punycode.js": {
      "version": "2.3.1",
      "resolved": "https://registry.npmjs.org/punycode.js/-/punycode.js-2.3.1.tgz",
      "integrity": "sha512-uxFIHU0YlHYhDQtV4R9J6a52SLx28BCjT+4ieh7IGbgwVJWO+km431c4yRlREUAsAmt/uMjQUyQHNEPf0M39CA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/readable-stream": {
      "version": "2.3.8",
      "resolved": "https://registry.npmjs.org/readable-stream/-/readable-stream-2.3.8.tgz",
      "integrity": "sha512-8p0AUk4XODgIewSi0l8Epjs+EVnWiK7NoDIEGU0HhE7+ZyY8D1IMY7odu5lRrFXGg71L15KG8QrPmum45RTtdA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "core-util-is": "~1.0.0",
        "inherits": "~2.0.3",
        "isarray": "~1.0.0",
        "process-nextick-args": "~2.0.0",
        "safe-buffer": "~5.1.1",
        "string_decoder": "~1.1.1",
        "util-deprecate": "~1.0.1"
      }
    },
    "node_modules/require-from-string": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/require-from-string/-/require-from-string-2.0.2.tgz",
      "integrity": "sha512-Xf0nWe6RseziFMu+Ap9biiUbmplq6S9/p+7w7YXP/JBHhrUDDUhwa+vANyubuqfZWTveU//DYVGsDG7RKL/vEw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/safe-buffer": {
      "version": "5.1.2",
      "resolved": "https://registry.npmjs.org/safe-buffer/-/safe-buffer-5.1.2.tgz",
      "integrity": "sha512-Gd2UZBJDkXlY7GbJxfsE8/nvKkUEU1G38c1siN6QP6a9PT9MmHB8GnpscSmMJSoF8LOIrt8ud/wPtojys4G6+g==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/sax": {
      "version": "1.6.1",
      "resolved": "https://registry.npmjs.org/sax/-/sax-1.6.1.tgz",
      "integrity": "sha512-42tBVwLWnaQvW5zc4HbZrTuWccECCZfBi92FDuwtqxasH+JbPB3/FOKb1m222K42R4WxuxzzMsTswfzgtSu64Q==",
      "dev": true,
      "license": "BlueOak-1.0.0",
      "engines": {
        "node": ">=11.0.0"
      }
    },
    "node_modules/semver": {
      "version": "7.8.5",
      "resolved": "https://registry.npmjs.org/semver/-/semver-7.8.5.tgz",
      "integrity": "sha512-Y7/KDsb8LjooZpwaqGyulO6DQlksgCncchHGk+sZIY4SBvUocMBEFH5Ur1fI4dV+Jvl0w6cjvucaIi40puRioA==",
      "dev": true,
      "license": "ISC",
      "bin": {
        "semver": "bin/semver.js"
      },
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/setimmediate": {
      "version": "1.0.5",
      "resolved": "https://registry.npmjs.org/setimmediate/-/setimmediate-1.0.5.tgz",
      "integrity": "sha512-MATJdZp8sLqDl/68LfQmbP8zKPLQNV6BIZoIgrscFDQ+RsvK/BxeDQOgyxKKoh0y/8h3BqVFnCqQ/gd+reiIXA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/sisteransi": {
      "version": "1.0.5",
      "resolved": "https://registry.npmjs.org/sisteransi/-/sisteransi-1.0.5.tgz",
      "integrity": "sha512-bLGGlR1QxBcynn2d5YmDX4MGjlZvy2MRBDRNHLJ8VI6l6+9FUiyTFNJ0IveOSP0bcXgVDPRcfGqA0pjaqUpfVg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/string_decoder": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/string_decoder/-/string_decoder-1.1.1.tgz",
      "integrity": "sha512-n/ShnvDi6FHbbVfviro+WojiFzv+s8MPMHBczVePfUpDJLwoLT0ht1l4YwBCbi8pJAveEEdnkHyPyTP/mzRfwg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "safe-buffer": "~5.1.0"
      }
    },
    "node_modules/uc.micro": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/uc.micro/-/uc.micro-3.0.0.tgz",
      "integrity": "sha512-U3PppEkleoTnIfi8BozMx3yju3qc/L6SwqWo2Sw+54PX+PX0q9I+r1Um5HCmqD7n9VDX5/v3vQH/AjA6deDdtw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/undici-types": {
      "version": "8.9.0",
      "resolved": "https://registry.npmjs.org/undici-types/-/undici-types-8.9.0.tgz",
      "integrity": "sha512-KTDyRTYX8sWmKXAikPHHSyc63CRPETMctyjKFupcC6OBLXT3xsN0e9aF7m+mIXutFWpUXuedtowG7iLOzp0kQg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/util-deprecate": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/util-deprecate/-/util-deprecate-1.0.2.tgz",
      "integrity": "sha512-EPD5q1uXyFxJpCrLnCc1nHnq3gOa6DZBocAIiI2TaSCA7VCJ1UJDMagCzIkXNsUYfD1daK//LTEQ8xiIbrHtcw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/xml": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/xml/-/xml-1.0.1.tgz",
      "integrity": "sha512-huCv9IH9Tcf95zuYCsQraZtWnJvBtLVE0QHMOs8bWyZAFZNDcYjsPq1nEx8jKA9y+Beo9v+7OBPRisQTjinQMw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/xml-js": {
      "version": "1.6.11",
      "resolved": "https://registry.npmjs.org/xml-js/-/xml-js-1.6.11.tgz",
      "integrity": "sha512-7rVi2KMfwfWFl+GpPg6m80IVMWXLRjO+PxTq7V2CDhoGak0wzYzFgUY2m4XJ47OGdXd8eLE8EmwfAmdjw7lC1g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "sax": "^1.2.4"
      },
      "bin": {
        "xml-js": "bin/cli.js"
      }
    }
  }
}
`````
