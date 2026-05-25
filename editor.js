/* ============================================================
   PORTFOLIO EDITOR — editor.js
   Reads/writes localStorage, injects changes into iframe live
   ============================================================ */

const STORAGE_KEY = 'portfolio_config';

/* ---- DEFAULT CONFIG ---- */
const DEFAULTS = {
  // General
  name: 'Your Name',
  logoText: 'Bh.prdp',
  pageTitle: 'Your Name | Full Stack Developer & IT Freelancer',
  metaDesc: 'Freelance Full Stack Developer from India — building fast, scalable web apps, APIs, and cloud solutions for startups and businesses.',
  location: 'India',
  badgeText: 'Open to Freelance Projects',
  responseTime: '4 hours on weekdays',
  footerTagline: 'Full Stack Developer · Freelancer · India',
  copyrightYear: '2026',
  // Hero
  heroLine1: 'I Build Software That',
  heroLine2: 'Actually Ships',
  heroSub: 'Freelance Full Stack Developer from India — I turn your ideas into production-ready web apps, REST APIs, and cloud-deployed products. Fast, clean, and scalable.',
  heroCta1: 'Hire Me →',
  heroCta2: 'View Projects',
  stat1val: '35+', stat1label: 'Projects Delivered',
  stat2val: '99.9%', stat2label: 'Uptime SLA',
  stat3val: '4 Yrs', stat3label: 'Experience',
  cardHandle: 'ecommerce-api-v2',
  cardPlatform: 'Node.js · AWS · Last Deploy',
  m1val: '2.1M', m1label: 'API Calls/day',
  m2val: '98ms', m2label: 'Avg Response',
  m3val: '99.97%', m3label: 'Uptime',
  cardProgress: 92,
  cardNote: 'Sprint 4 complete — 92% of milestones shipped',
  // About
  aboutLabel: 'About Me',
  aboutH2a: 'I write code that',
  aboutH2b: 'solves real problems',
  aboutP1: "I'm a Full Stack Developer with 4+ years of experience building production-grade web applications, REST APIs, and cloud infrastructure. I've worked with startups, agencies, and product companies across India and internationally.",
  aboutP2: 'I care about clean architecture, readable code, and shipping on time. Whether it\'s a React frontend, a Node.js backend, or a full AWS deployment — I own the entire stack end to end.',
  tools: 'React, Node.js, TypeScript, PostgreSQL, MongoDB, Docker, AWS, Git, Figma, Postman',
  badge1title: '📍 India', badge1sub: 'Remote-first, Worldwide',
  badge2title: '⚡ 4hr Response', badge2sub: 'Weekdays',
  // Contact
  contactLabel: 'Get In Touch',
  contactH2a: 'Got a project?',
  contactH2b: "Let's build it.",
  contactDesc: "Share your idea and I'll get back with a technical breakdown, timeline, and quote — usually within a few hours. No fluff, just clarity.",
  contactEmail: 'prajanpradeep6@gmail.com',
  contactWA: '919682046956',
  contactLinkedIn: 'https://www.linkedin.com/in/pradeep-kumar-64204937b/',
  contactGithub: 'https://github.com/pradeepbhajan',
  formBtnText: 'Send Project Brief →',
  formNote: '⚡ I typically respond within 4 hours on weekdays.',
  serviceOptions: 'Full Stack Web App\nREST API Development\nFrontend (React / Next.js)\nBackend (Node.js / Python)\nDatabase Design\nCloud Deployment (AWS / GCP)\nCode Review & Audit\nOther',
  // Design
  colorAccent: '#7c5cfc',
  colorAccent2: '#a78bfa',
  colorBg: '#07070f',
  colorSurface: '#0f0f1a',
  colorText: '#e2e2f0',
  colorMuted: '#7878a0',
  fontBody: 'Inter',
  fontDisplay: 'Syne',
  borderRadius: 20,
  showPortfolio: true,
  showCases: true,
  showTesti: true,
  showSkills: true,
  showGrid: true,
  // Nav items
  navItems: [
    { label: 'About', href: '#about', visible: true },
    { label: 'Services', href: '#services', visible: true },
    { label: 'Projects', href: '#portfolio', visible: true },
    { label: 'Results', href: '#work', visible: true },
    { label: 'Reviews', href: '#testimonials', visible: true },
  ],
  // Skills
  skills: [
    { name: 'React / Next.js', pct: 92 },
    { name: 'Node.js / Express', pct: 90 },
    { name: 'TypeScript', pct: 88 },
    { name: 'PostgreSQL / MongoDB', pct: 85 },
    { name: 'AWS / Docker / CI-CD', pct: 80 },
    { name: 'System Design', pct: 78 },
  ],
  // Services
  services: [
    { icon: '🖥️', title: 'Full Stack Web App', desc: 'End-to-end development — React/Next.js frontend, Node.js or Python backend, database design, and cloud deployment. You get a production-ready product, not a prototype.', price: 'Starting ₹40,000', featured: false },
    { icon: '⚡', title: 'REST API Development', desc: 'Scalable, well-documented APIs built with Node.js or Python (FastAPI/Django). Auth, rate limiting, error handling, and Swagger docs included.', price: 'Starting ₹25,000', featured: true },
    { icon: '⚛️', title: 'Frontend (React / Next.js)', desc: 'Pixel-perfect, performant UIs from Figma or wireframes. SSR, SEO optimization, and smooth animations. Lighthouse score 90+ guaranteed.', price: 'Starting ₹20,000', featured: false },
    { icon: '🗄️', title: 'Database Design & Optimization', desc: 'Schema design, query optimization, indexing strategy, and migrations for PostgreSQL, MySQL, or MongoDB. Slow queries fixed fast.', price: 'Starting ₹12,000', featured: false },
    { icon: '☁️', title: 'Cloud Deployment & DevOps', desc: 'Docker containerization, AWS/GCP setup, CI/CD pipelines with GitHub Actions, SSL, domain config, and monitoring. Your app, always up.', price: 'Starting ₹18,000', featured: false },
    { icon: '🔍', title: 'Code Review & Tech Audit', desc: 'Deep review of your existing codebase — security vulnerabilities, performance bottlenecks, architecture issues, and a prioritized fix list.', price: 'Starting ₹8,000', featured: false },
  ],
  // Cases
  cases: [
    { tag: 'E-commerce · SaaS · Mumbai', title: 'ShopFlow Platform', desc: 'Built a multi-vendor e-commerce platform from scratch — React frontend, Node.js microservices, PostgreSQL, and AWS deployment. Handles 50K+ daily active users.', r1val: '50K+', r1label: 'Daily Users', r2val: '98ms', r2label: 'API Response', r3val: '0', r3label: 'Downtime Days' },
    { tag: 'Fintech · Startup · Bangalore', title: 'PayTrack Dashboard', desc: 'Real-time financial analytics dashboard with WebSocket updates, complex SQL aggregations, and role-based access control. Reduced reporting time by 80%.', r1val: '-80%', r1label: 'Report Time', r2val: '2M+', r2label: 'Txns Processed', r3val: '100%', r3label: 'Audit Pass' },
    { tag: 'EdTech · Pan-India', title: 'LearnPath LMS', desc: 'Full LMS with video streaming, quiz engine, progress tracking, and Razorpay payment integration. Scaled from 0 to 12,000 students in 6 months.', r1val: '12K+', r1label: 'Students', r2val: '6 mo', r2label: 'Time to Scale', r3val: '4.9★', r3label: 'App Rating' },
  ],
  // Testimonials
  testimonials: [
    { stars: 5, text: '"Delivered the entire backend API in 3 weeks — clean code, great documentation, and zero bugs in production. Will definitely hire again for our next sprint."', name: 'Arjun Kapoor', role: 'CTO, ShopFlow' },
    { stars: 5, text: '"We had a legacy PHP codebase that was a nightmare. He migrated it to Node.js + React in 6 weeks with zero data loss. The performance improvement was night and day."', name: 'Divya Nair', role: 'Founder, PayTrack' },
    { stars: 5, text: '"Best freelancer I\'ve worked with. He asked the right questions upfront, flagged potential issues early, and shipped exactly what we discussed. Rare to find."', name: 'Rohan Verma', role: 'Product Manager, LearnPath' },
  ],
  // Process
  processLabel: 'My Process',
  processH2a: 'How I turn your idea into a',
  processH2b: 'shipped product',
  processSteps: [
    { num: '01', icon: '🎯', title: 'Discovery Call', desc: 'We talk through your requirements, tech stack preferences, timeline, and budget. I ask the hard questions upfront so there are no surprises later.' },
    { num: '02', icon: '📐', title: 'Scope & Proposal', desc: 'I send a detailed technical proposal — architecture diagram, milestones, deliverables, and a fixed-price quote. No hourly billing surprises.' },
    { num: '03', icon: '⚙️', title: 'Build & Review', desc: 'I build in sprints with weekly demos. You get a staging URL from day one. Feedback loops are short — no waiting weeks to see progress.' },
    { num: '04', icon: '🚀', title: 'Deploy & Handoff', desc: 'Production deployment, documentation, code walkthrough, and 30 days of free bug fixes. You own everything — code, infra, and docs.' },
  ],
  // Tech Stack
  techLabel: 'Tech Stack',
  techH2a: 'Tools I use to',
  techH2b: 'build production systems',
  techGroups: [
    { label: 'Frontend', tags: '⚛️ React, ▲ Next.js, 🔷 TypeScript, 🎨 Tailwind CSS, ⚡ Vite' },
    { label: 'Backend', tags: '🟢 Node.js, 🐍 Python, 🚂 Express, ⚡ FastAPI, 🔐 JWT / OAuth' },
    { label: 'Database', tags: '🐘 PostgreSQL, 🍃 MongoDB, 🔴 Redis, 🗃️ MySQL, 📊 Prisma ORM' },
    { label: 'Cloud & DevOps', tags: '☁️ AWS, 🐳 Docker, ⚙️ GitHub Actions, 🌐 Nginx, 📈 Grafana' },
  ],
  // FAQ
  faqLabel: 'FAQ',
  faqH2a: 'Questions clients',
  faqH2b: 'always ask',
  faqs: [
    { q: 'How long does a typical project take?', a: 'A simple REST API or landing page takes 1–2 weeks. A full-stack web app with auth, database, and deployment typically takes 4–8 weeks. I\'ll give you a precise timeline in the proposal after our discovery call.' },
    { q: 'Do you work on fixed price or hourly?', a: 'Fixed price for well-defined projects — you know exactly what you\'re paying upfront. For ongoing work or projects with evolving scope, I offer a monthly retainer. No surprise invoices.' },
    { q: 'What happens after the project is delivered?', a: 'You get 30 days of free bug fixes after delivery. After that, I offer maintenance retainers starting at ₹8,000/month. You also get full source code, documentation, and a handoff call.' },
    { q: 'Do you sign NDAs or contracts?', a: 'Yes, always. Every project starts with a signed contract covering scope, payment terms, IP ownership, and confidentiality. Your idea is safe.' },
    { q: 'Can you work with my existing codebase?', a: 'Absolutely. I do legacy code migrations, feature additions, and performance audits on existing projects. I\'ll do a free 30-minute code review before committing to any existing codebase work.' },
    { q: 'What\'s your payment structure?', a: '50% upfront, 50% on delivery for projects under ₹50,000. For larger projects, we split into 3 milestones: 40% start, 30% mid, 30% delivery. UPI, bank transfer, and Razorpay accepted.' },
  ],
};

/* ---- STATE ---- */
let config = JSON.parse(JSON.stringify(DEFAULTS));

function loadConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) config = { ...JSON.parse(JSON.stringify(DEFAULTS)), ...JSON.parse(saved) };
  } catch(e) {}
}

function saveConfig() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  const badge = document.getElementById('savedBadge');
  badge.classList.add('show');
  clearTimeout(badge._t);
  badge._t = setTimeout(() => badge.classList.remove('show'), 2000);
}

/* ---- TABS ---- */
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
  });
});

/* ---- BIND SIMPLE FIELDS ---- */
function bindFields() {
  document.querySelectorAll('[data-key]').forEach(el => {
    const key = el.dataset.key;
    // Set value
    if (el.type === 'checkbox') el.checked = config[key] !== false;
    else if (el.type === 'color') el.value = config[key] || el.value;
    else if (el.type === 'range') { el.value = config[key] || el.value; updateRangeDisplay(key, el.value); }
    else el.value = config[key] || '';

    // Listen
    el.addEventListener('input', () => {
      if (el.type === 'checkbox') config[key] = el.checked;
      else if (el.type === 'range') { config[key] = parseInt(el.value); updateRangeDisplay(key, el.value); }
      else config[key] = el.value;
      saveConfig();
      applyToPreview();
    });
  });
}

function updateRangeDisplay(key, val) {
  if (key === 'cardProgress') { const el = document.getElementById('progressVal'); if(el) el.textContent = val + '%'; }
  if (key === 'borderRadius') { const el = document.getElementById('radiusVal'); if(el) el.textContent = val + 'px'; }
}

/* ---- NAV ITEMS ---- */
function renderNavList() {
  const list = document.getElementById('navList');
  list.innerHTML = '';
  config.navItems.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div class="item-card__header">
        <span class="drag-handle">⠿</span>
        <span class="item-card__title">${item.label}</span>
        <div class="item-card__actions">
          <label class="toggle" title="Show/Hide"><input type="checkbox" ${item.visible ? 'checked' : ''} /><span class="toggle__slider"></span></label>
          <button class="btn btn--danger btn--icon btn--sm" data-del="${i}">✕</button>
          <span class="item-card__toggle">▼</span>
        </div>
      </div>
      <div class="item-card__body">
        <div class="field"><label>Label</label><input type="text" value="${item.label}" data-nav-label="${i}" /></div>
        <div class="field"><label>Link (href)</label><input type="text" value="${item.href}" data-nav-href="${i}" /></div>
      </div>`;
    card.querySelector('.item-card__header').addEventListener('click', (e) => {
      if (e.target.closest('button') || e.target.closest('.toggle')) return;
      card.classList.toggle('open');
    });
    card.querySelector('input[type=checkbox]').addEventListener('change', (e) => {
      config.navItems[i].visible = e.target.checked; saveConfig(); applyToPreview();
    });
    card.querySelector(`[data-del="${i}"]`).addEventListener('click', () => {
      config.navItems.splice(i, 1); saveConfig(); renderNavList(); applyToPreview();
    });
    card.querySelector(`[data-nav-label="${i}"]`).addEventListener('input', (e) => {
      config.navItems[i].label = e.target.value;
      card.querySelector('.item-card__title').textContent = e.target.value;
      saveConfig(); applyToPreview();
    });
    card.querySelector(`[data-nav-href="${i}"]`).addEventListener('input', (e) => {
      config.navItems[i].href = e.target.value; saveConfig(); applyToPreview();
    });
    list.appendChild(card);
  });
}

document.getElementById('addNavItem').addEventListener('click', () => {
  config.navItems.push({ label: 'New Link', href: '#section', visible: true });
  saveConfig(); renderNavList(); applyToPreview();
});

/* ---- SKILLS ---- */
function renderSkillList() {
  const list = document.getElementById('skillList');
  list.innerHTML = '';
  config.skills.forEach((skill, i) => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div class="item-card__header">
        <span class="item-card__title">${skill.name} — ${skill.pct}%</span>
        <div class="item-card__actions">
          <button class="btn btn--danger btn--icon btn--sm" data-del="${i}">✕</button>
          <span class="item-card__toggle">▼</span>
        </div>
      </div>
      <div class="item-card__body">
        <div class="field"><label>Skill Name</label><input type="text" value="${skill.name}" data-skill-name="${i}" /></div>
        <div class="field"><label>Percentage</label>
          <div class="range-row"><input type="range" min="0" max="100" value="${skill.pct}" data-skill-pct="${i}" /><span class="range-val">${skill.pct}%</span></div>
        </div>
      </div>`;
    card.querySelector('.item-card__header').addEventListener('click', (e) => {
      if (e.target.closest('button')) return; card.classList.toggle('open');
    });
    card.querySelector(`[data-del="${i}"]`).addEventListener('click', () => {
      config.skills.splice(i, 1); saveConfig(); renderSkillList(); applyToPreview();
    });
    card.querySelector(`[data-skill-name="${i}"]`).addEventListener('input', (e) => {
      config.skills[i].name = e.target.value;
      card.querySelector('.item-card__title').textContent = `${e.target.value} — ${config.skills[i].pct}%`;
      saveConfig(); applyToPreview();
    });
    const pctInput = card.querySelector(`[data-skill-pct="${i}"]`);
    const pctVal = pctInput.nextElementSibling;
    pctInput.addEventListener('input', (e) => {
      config.skills[i].pct = parseInt(e.target.value);
      pctVal.textContent = e.target.value + '%';
      card.querySelector('.item-card__title').textContent = `${config.skills[i].name} — ${e.target.value}%`;
      saveConfig(); applyToPreview();
    });
    list.appendChild(card);
  });
}

document.getElementById('addSkill').addEventListener('click', () => {
  config.skills.push({ name: 'New Skill', pct: 80 });
  saveConfig(); renderSkillList(); applyToPreview();
});

/* ---- SERVICES ---- */
function renderServiceList() {
  const list = document.getElementById('serviceList');
  list.innerHTML = '';
  config.services.forEach((svc, i) => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div class="item-card__header">
        <span style="font-size:1.1rem">${svc.icon}</span>
        <span class="item-card__title">${svc.title}</span>
        <div class="item-card__actions">
          <button class="btn btn--danger btn--icon btn--sm" data-del="${i}">✕</button>
          <span class="item-card__toggle">▼</span>
        </div>
      </div>
      <div class="item-card__body">
        <div class="field"><label>Icon (emoji)</label><input type="text" value="${svc.icon}" data-svc-icon="${i}" /></div>
        <div class="field"><label>Title</label><input type="text" value="${svc.title}" data-svc-title="${i}" /></div>
        <div class="field"><label>Description</label><textarea rows="3" data-svc-desc="${i}">${svc.desc}</textarea></div>
        <div class="field"><label>Price</label><input type="text" value="${svc.price}" data-svc-price="${i}" /></div>
        <div class="toggle-row"><label>Featured (highlighted)</label><label class="toggle"><input type="checkbox" ${svc.featured ? 'checked' : ''} data-svc-feat="${i}" /><span class="toggle__slider"></span></label></div>
      </div>`;
    card.querySelector('.item-card__header').addEventListener('click', (e) => {
      if (e.target.closest('button')) return; card.classList.toggle('open');
    });
    card.querySelector(`[data-del="${i}"]`).addEventListener('click', () => {
      config.services.splice(i, 1); saveConfig(); renderServiceList(); applyToPreview();
    });
    ['icon','title','desc','price'].forEach(f => {
      card.querySelector(`[data-svc-${f}="${i}"]`).addEventListener('input', (e) => {
        config.services[i][f === 'icon' ? 'icon' : f === 'title' ? 'title' : f === 'desc' ? 'desc' : 'price'] = e.target.value;
        if (f === 'title') card.querySelector('.item-card__title').textContent = e.target.value;
        saveConfig(); applyToPreview();
      });
    });
    card.querySelector(`[data-svc-feat="${i}"]`).addEventListener('change', (e) => {
      config.services[i].featured = e.target.checked; saveConfig(); applyToPreview();
    });
    list.appendChild(card);
  });
}

document.getElementById('addService').addEventListener('click', () => {
  config.services.push({ icon: '⭐', title: 'New Service', desc: 'Describe this service...', price: '₹0/mo', featured: false });
  saveConfig(); renderServiceList(); applyToPreview();
});

/* ---- CASES ---- */
function renderCaseList() {
  const list = document.getElementById('caseList');
  list.innerHTML = '';
  config.cases.forEach((c, i) => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div class="item-card__header">
        <span class="item-card__title">${c.title}</span>
        <div class="item-card__actions">
          <button class="btn btn--danger btn--icon btn--sm" data-del="${i}">✕</button>
          <span class="item-card__toggle">▼</span>
        </div>
      </div>
      <div class="item-card__body">
        <div class="field"><label>Tag (category · location)</label><input type="text" value="${c.tag}" data-case-tag="${i}" /></div>
        <div class="field"><label>Brand Name</label><input type="text" value="${c.title}" data-case-title="${i}" /></div>
        <div class="field"><label>Description</label><textarea rows="3" data-case-desc="${i}">${c.desc}</textarea></div>
        <div class="stat-grid">
          <div class="field"><label>Result 1 Value</label><input type="text" value="${c.r1val}" data-case-r1val="${i}" /></div>
          <div class="field"><label>Result 1 Label</label><input type="text" value="${c.r1label}" data-case-r1label="${i}" /></div>
          <div class="field"><label>Result 2 Value</label><input type="text" value="${c.r2val}" data-case-r2val="${i}" /></div>
          <div class="field"><label>Result 2 Label</label><input type="text" value="${c.r2label}" data-case-r2label="${i}" /></div>
          <div class="field"><label>Result 3 Value</label><input type="text" value="${c.r3val}" data-case-r3val="${i}" /></div>
          <div class="field"><label>Result 3 Label</label><input type="text" value="${c.r3label}" data-case-r3label="${i}" /></div>
        </div>
      </div>`;
    card.querySelector('.item-card__header').addEventListener('click', (e) => {
      if (e.target.closest('button')) return; card.classList.toggle('open');
    });
    card.querySelector(`[data-del="${i}"]`).addEventListener('click', () => {
      config.cases.splice(i, 1); saveConfig(); renderCaseList(); applyToPreview();
    });
    ['tag','title','desc','r1val','r1label','r2val','r2label','r3val','r3label'].forEach(f => {
      card.querySelector(`[data-case-${f}="${i}"]`).addEventListener('input', (e) => {
        config.cases[i][f] = e.target.value;
        if (f === 'title') card.querySelector('.item-card__title').textContent = e.target.value;
        saveConfig(); applyToPreview();
      });
    });
    list.appendChild(card);
  });
}

document.getElementById('addCase').addEventListener('click', () => {
  config.cases.push({ tag: 'Industry · City', title: 'Brand Name', desc: 'Describe the result...', r1val: '0x', r1label: 'Metric 1', r2val: '0', r2label: 'Metric 2', r3val: '0%', r3label: 'Metric 3' });
  saveConfig(); renderCaseList(); applyToPreview();
});

/* ---- TESTIMONIALS ---- */
function renderTestiList() {
  const list = document.getElementById('testiList');
  list.innerHTML = '';
  config.testimonials.forEach((t, i) => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div class="item-card__header">
        <span class="item-card__title">${t.name}</span>
        <div class="item-card__actions">
          <button class="btn btn--danger btn--icon btn--sm" data-del="${i}">✕</button>
          <span class="item-card__toggle">▼</span>
        </div>
      </div>
      <div class="item-card__body">
        <div class="field"><label>Stars (1-5)</label><input type="number" min="1" max="5" value="${t.stars}" data-testi-stars="${i}" /></div>
        <div class="field"><label>Quote</label><textarea rows="4" data-testi-text="${i}">${t.text}</textarea></div>
        <div class="field"><label>Client Name</label><input type="text" value="${t.name}" data-testi-name="${i}" /></div>
        <div class="field"><label>Role / Company</label><input type="text" value="${t.role}" data-testi-role="${i}" /></div>
      </div>`;
    card.querySelector('.item-card__header').addEventListener('click', (e) => {
      if (e.target.closest('button')) return; card.classList.toggle('open');
    });
    card.querySelector(`[data-del="${i}"]`).addEventListener('click', () => {
      config.testimonials.splice(i, 1); saveConfig(); renderTestiList(); applyToPreview();
    });
    ['stars','text','name','role'].forEach(f => {
      card.querySelector(`[data-testi-${f}="${i}"]`).addEventListener('input', (e) => {
        config.testimonials[i][f] = f === 'stars' ? parseInt(e.target.value) : e.target.value;
        if (f === 'name') card.querySelector('.item-card__title').textContent = e.target.value;
        saveConfig(); applyToPreview();
      });
    });
    list.appendChild(card);
  });
}

document.getElementById('addTesti').addEventListener('click', () => {
  config.testimonials.push({ stars: 5, text: '"Add your client quote here..."', name: 'Client Name', role: 'Role, Company' });
  saveConfig(); renderTestiList(); applyToPreview();
});

/* ---- PROCESS STEPS ---- */
function renderProcessList() {
  const list = document.getElementById('processList');
  list.innerHTML = '';
  (config.processSteps || []).forEach((step, i) => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div class="item-card__header">
        <span style="font-size:1.1rem">${step.icon}</span>
        <span class="item-card__title">${step.title}</span>
        <div class="item-card__actions">
          <button class="btn btn--danger btn--icon btn--sm" data-del="${i}">✕</button>
          <span class="item-card__toggle">▼</span>
        </div>
      </div>
      <div class="item-card__body">
        <div class="field"><label>Step Number</label><input type="text" value="${step.num}" data-ps-num="${i}" /></div>
        <div class="field"><label>Icon (emoji)</label><input type="text" value="${step.icon}" data-ps-icon="${i}" /></div>
        <div class="field"><label>Title</label><input type="text" value="${step.title}" data-ps-title="${i}" /></div>
        <div class="field"><label>Description</label><textarea rows="3" data-ps-desc="${i}">${step.desc}</textarea></div>
      </div>`;
    card.querySelector('.item-card__header').addEventListener('click', (e) => {
      if (e.target.closest('button')) return; card.classList.toggle('open');
    });
    card.querySelector(`[data-del="${i}"]`).addEventListener('click', () => {
      config.processSteps.splice(i, 1); saveConfig(); renderProcessList(); applyToPreview();
    });
    ['num','icon','title','desc'].forEach(f => {
      card.querySelector(`[data-ps-${f}="${i}"]`).addEventListener('input', (e) => {
        config.processSteps[i][f] = e.target.value;
        if (f === 'title') card.querySelector('.item-card__title').textContent = e.target.value;
        if (f === 'icon') card.querySelector('span:first-child').textContent = e.target.value;
        saveConfig(); applyToPreview();
      });
    });
    list.appendChild(card);
  });
}
document.getElementById('addProcessStep').addEventListener('click', () => {
  if (!config.processSteps) config.processSteps = [];
  config.processSteps.push({ num: '0' + (config.processSteps.length + 1), icon: '⭐', title: 'New Step', desc: 'Describe this step...' });
  saveConfig(); renderProcessList(); applyToPreview();
});

/* ---- TECH GROUPS ---- */
function renderTechGroupList() {
  const list = document.getElementById('techGroupList');
  list.innerHTML = '';
  (config.techGroups || []).forEach((grp, i) => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div class="item-card__header">
        <span class="item-card__title">${grp.label}</span>
        <div class="item-card__actions">
          <button class="btn btn--danger btn--icon btn--sm" data-del="${i}">✕</button>
          <span class="item-card__toggle">▼</span>
        </div>
      </div>
      <div class="item-card__body">
        <div class="field"><label>Group Label</label><input type="text" value="${grp.label}" data-tg-label="${i}" /></div>
        <div class="field"><label>Tags (comma separated)</label><input type="text" value="${grp.tags}" data-tg-tags="${i}" /></div>
      </div>`;
    card.querySelector('.item-card__header').addEventListener('click', (e) => {
      if (e.target.closest('button')) return; card.classList.toggle('open');
    });
    card.querySelector(`[data-del="${i}"]`).addEventListener('click', () => {
      config.techGroups.splice(i, 1); saveConfig(); renderTechGroupList(); applyToPreview();
    });
    ['label','tags'].forEach(f => {
      card.querySelector(`[data-tg-${f}="${i}"]`).addEventListener('input', (e) => {
        config.techGroups[i][f] = e.target.value;
        if (f === 'label') card.querySelector('.item-card__title').textContent = e.target.value;
        saveConfig(); applyToPreview();
      });
    });
    list.appendChild(card);
  });
}
document.getElementById('addTechGroup').addEventListener('click', () => {
  if (!config.techGroups) config.techGroups = [];
  config.techGroups.push({ label: 'New Group', tags: 'Tag 1, Tag 2, Tag 3' });
  saveConfig(); renderTechGroupList(); applyToPreview();
});

/* ---- FAQ ---- */
function renderFaqList() {
  const list = document.getElementById('faqList');
  list.innerHTML = '';
  (config.faqs || []).forEach((faq, i) => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div class="item-card__header">
        <span class="item-card__title">${faq.q}</span>
        <div class="item-card__actions">
          <button class="btn btn--danger btn--icon btn--sm" data-del="${i}">✕</button>
          <span class="item-card__toggle">▼</span>
        </div>
      </div>
      <div class="item-card__body">
        <div class="field"><label>Question</label><input type="text" value="${faq.q}" data-faq-q="${i}" /></div>
        <div class="field"><label>Answer</label><textarea rows="4" data-faq-a="${i}">${faq.a}</textarea></div>
      </div>`;
    card.querySelector('.item-card__header').addEventListener('click', (e) => {
      if (e.target.closest('button')) return; card.classList.toggle('open');
    });
    card.querySelector(`[data-del="${i}"]`).addEventListener('click', () => {
      config.faqs.splice(i, 1); saveConfig(); renderFaqList(); applyToPreview();
    });
    ['q','a'].forEach(f => {
      card.querySelector(`[data-faq-${f}="${i}"]`).addEventListener('input', (e) => {
        config.faqs[i][f] = e.target.value;
        if (f === 'q') card.querySelector('.item-card__title').textContent = e.target.value;
        saveConfig(); applyToPreview();
      });
    });
    list.appendChild(card);
  });
}
document.getElementById('addFaq').addEventListener('click', () => {
  if (!config.faqs) config.faqs = [];
  config.faqs.push({ q: 'New Question?', a: 'Your answer here...' });
  saveConfig(); renderFaqList(); applyToPreview();
});

/* ---- APPLY TO PREVIEW (inject via postMessage) ---- */
function applyToPreview() {
  const frame = document.getElementById('previewFrame');
  try { frame.contentWindow.postMessage({ type: 'EDITOR_UPDATE', config }, '*'); } catch(e) {}
}

/* ---- PREVIEW CONTROLS ---- */
const frame = document.getElementById('previewFrame');
document.getElementById('viewDesktop').addEventListener('click', function() {
  frame.style.width = '100%'; frame.style.transform = 'none';
  this.classList.add('active'); document.getElementById('viewMobile').classList.remove('active');
});
document.getElementById('viewMobile').addEventListener('click', function() {
  frame.style.width = '390px'; frame.style.transform = 'none';
  this.classList.add('active'); document.getElementById('viewDesktop').classList.remove('active');
});
document.getElementById('refreshPreview').addEventListener('click', () => {
  frame.src = frame.src;
  frame.onload = () => applyToPreview();
});
document.getElementById('previewNewTab').addEventListener('click', () => window.open('index.html', '_blank'));

/* ---- EXPORT HTML ---- */
document.getElementById('exportBtn').addEventListener('click', () => {
  const frame = document.getElementById('previewFrame');
  try {
    const html = frame.contentDocument.documentElement.outerHTML;
    const blob = new Blob(['<!DOCTYPE html>\n' + html], { type: 'text/html' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'portfolio.html'; a.click();
  } catch(e) { alert('Export failed — try opening in same origin or use the site directly.'); }
});

/* ---- RESET ---- */
document.getElementById('resetBtn').addEventListener('click', () => {
  if (!confirm('Reset all changes to defaults?')) return;
  config = JSON.parse(JSON.stringify(DEFAULTS));
  saveConfig(); init();
});

/* ---- INIT ---- */
function init() {
  loadConfig();
  bindFields();
  renderNavList();
  renderSkillList();
  renderServiceList();
  renderCaseList();
  renderTestiList();
  renderProcessList();
  renderTechGroupList();
  renderFaqList();
  const pr = document.querySelector('[data-key="cardProgress"]');
  if (pr) { pr.value = config.cardProgress; updateRangeDisplay('cardProgress', config.cardProgress); }
  const br = document.querySelector('[data-key="borderRadius"]');
  if (br) { br.value = config.borderRadius; updateRangeDisplay('borderRadius', config.borderRadius); }
}

init();

/* ---- SEND CONFIG WHEN IFRAME LOADS ---- */
frame.addEventListener('load', () => {
  setTimeout(() => applyToPreview(), 300);
});
