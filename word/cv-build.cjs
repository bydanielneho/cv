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
  b('Lead digital product management and continuous improvement for mcert.govt.nz, the Community Housing Regulatory Authority website (chra.hud.govt.nz) and hud.govt.nz'),
  b('Responsible for a portfolio of more than 25 government websites, including transport.govt.nz'),
  b('Leading the migration of stv.govt.nz into mcert.govt.nz, including the STV calculator'),
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
  p('I led communications for major housing announcements and provided strategic advice to the Ministry, senior leaders and Ministers’ offices. I also led key digital and communications workstreams to establish MCERT.'),

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

  h3('Establishing MCERT'),
  b('Led the MCERT website, intranet, social media and brand workstreams, delivering mcert.govt.nz and the MCERT intranet for launch on 1 July 2026'),
  b('Set up MCERT’s Facebook, X and LinkedIn channels, with a social media strategy, setup guides and a channel register'),

  h3('Digital, publications and design'),
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
  p('I led digital and communications work for the Ministry and provided strategic advice to senior leaders. I also led the digital channels needed to establish MCERT.'),

  h3('Establishing MCERT'),
  b('**Website lead: **delivered mcert.govt.nz (Silverstripe 6) for launch on 1 July 2026, including GA4 and Google Tag Manager tracking'),
  b('**Intranet lead: **delivered the MCERT intranet for launch on 1 July 2026, including the information architecture and migration across six SharePoint subsites and about 45 pages of DIA local government content'),
  b('**Social media lead: **set up MCERT’s Facebook, X and LinkedIn channels, with a social media strategy, setup guides and a channel register'),
  b('**Brand lead **for MCERT'),
  b('Introduced content ownership and automated review reminders across the intranet'),

  h3('Website delivery and digital BAU'),
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
