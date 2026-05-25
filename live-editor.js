/* live-editor.js — receives config from editor.html and updates DOM live */

window.addEventListener('message', (e) => {
  if (!e.data || e.data.type !== 'EDITOR_UPDATE') return;
  applyConfig(e.data.config);
});

function applyConfig(c) {
  const s = (sel) => document.querySelector(sel);
  const sa = (sel) => document.querySelectorAll(sel);
  const set = (sel, val) => { const el = s(sel); if (el) el.textContent = val; };
  const setHTML = (sel, val) => { const el = s(sel); if (el) el.innerHTML = val; };
  const setAttr = (sel, attr, val) => { const el = s(sel); if (el) el.setAttribute(attr, val); };
  const show = (sel, visible) => { const el = s(sel); if (el) el.style.display = visible ? '' : 'none'; };

  // Page meta
  document.title = c.pageTitle || document.title;
  const metaEl = document.querySelector('meta[name="description"]');
  if (metaEl) metaEl.content = c.metaDesc || '';

  // CSS variables (design)
  const root = document.documentElement.style;
  if (c.colorAccent) root.setProperty('--accent', c.colorAccent);
  if (c.colorAccent2) root.setProperty('--accent2', c.colorAccent2);
  if (c.colorBg) root.setProperty('--bg', c.colorBg);
  if (c.colorSurface) root.setProperty('--surface', c.colorSurface);
  if (c.colorText) root.setProperty('--text', c.colorText);
  if (c.colorMuted) root.setProperty('--muted', c.colorMuted);
  if (c.borderRadius) { root.setProperty('--r', c.borderRadius + 'px'); root.setProperty('--r-lg', (c.borderRadius + 4) + 'px'); root.setProperty('--r-xl', (c.borderRadius + 8) + 'px'); }

  // Fonts — inject Google Fonts link if changed
  if (c.fontBody || c.fontDisplay) {
    const fonts = [c.fontBody, c.fontDisplay].filter(Boolean).map(f => f.replace(/ /g, '+')).join('&family=');
    let link = document.getElementById('editor-fonts');
    if (!link) { link = document.createElement('link'); link.id = 'editor-fonts'; link.rel = 'stylesheet'; document.head.appendChild(link); }
    link.href = `https://fonts.googleapis.com/css2?family=${fonts}:wght@400;500;600;700;800&display=swap`;
    if (c.fontBody) root.setProperty('--font', `'${c.fontBody}', sans-serif`);
    if (c.fontDisplay) root.setProperty('--font-display', `'${c.fontDisplay}', sans-serif`);
  }

  // NAV
  const navLogo = s('.nav__logo');
  if (navLogo) navLogo.innerHTML = (c.logoText || 'SM') + '<span>.</span>';

  if (c.navItems) {
    const navList = s('.nav__links');
    if (navList) {
      // Keep last item (CTA button) and rebuild
      const ctaItem = navList.querySelector('li:last-child');
      navList.innerHTML = '';
      c.navItems.filter(n => n.visible !== false).forEach(n => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="${n.href}">${n.label}</a>`;
        navList.appendChild(li);
      });
      if (ctaItem) navList.appendChild(ctaItem);
    }
  }

  // HERO
  const h1 = s('.hero__text h1');
  if (h1) h1.innerHTML = `${c.heroLine1 || ''} <br/><span class="gradient-text">${c.heroLine2 || ''}</span>`;
  set('.hero__sub', c.heroSub);

  const cta1 = s('.hero__cta .btn--primary');
  if (cta1) cta1.textContent = c.heroCta1 || 'Book a Free Call →';
  const cta2 = s('.hero__cta .btn--ghost');
  if (cta2) cta2.textContent = c.heroCta2 || 'See My Work';

  // Stats
  const stats = sa('.stat');
  if (stats[0]) { stats[0].querySelector('strong').textContent = c.stat1val || ''; stats[0].querySelector('span').textContent = c.stat1label || ''; }
  if (stats[1]) { stats[1].querySelector('strong').textContent = c.stat2val || ''; stats[1].querySelector('span').textContent = c.stat2label || ''; }
  if (stats[2]) { stats[2].querySelector('strong').textContent = c.stat3val || ''; stats[2].querySelector('span').textContent = c.stat3label || ''; }

  // Hero card
  set('.card__name', c.cardHandle);
  set('.card__handle', c.cardPlatform);
  const metrics = sa('.metric');
  if (metrics[0]) { metrics[0].querySelector('.metric__val').textContent = c.m1val || ''; metrics[0].querySelector('.metric__label').textContent = c.m1label || ''; }
  if (metrics[1]) { metrics[1].querySelector('.metric__val').textContent = c.m2val || ''; metrics[1].querySelector('.metric__label').textContent = c.m2label || ''; }
  if (metrics[2]) { metrics[2].querySelector('.metric__val').textContent = c.m3val || ''; metrics[2].querySelector('.metric__label').textContent = c.m3label || ''; }
  const barFill = s('.bar__fill');
  if (barFill) barFill.style.width = (c.cardProgress || 78) + '%';
  set('.card__note', c.cardNote);

  // Badge
  const badge = s('.badge');
  if (badge) badge.innerHTML = `<span class="badge__dot"></span>${c.badgeText || 'Available for Projects'}`;

  // ABOUT
  set('.about .section__label', c.aboutLabel);
  const aboutH2 = s('.about__content h2');
  if (aboutH2) aboutH2.innerHTML = `${c.aboutH2a || ''} <span class="gradient-text">${c.aboutH2b || ''}</span>`;

  const aboutPs = sa('.about__content > p');
  if (aboutPs[0]) aboutPs[0].textContent = c.aboutP1 || '';
  if (aboutPs[1]) aboutPs[1].textContent = c.aboutP2 || '';

  // Skills
  const skillsWrap = s('.skills');
  if (skillsWrap && c.skills) {
    show('.skills', c.showSkills !== false);
    const inner = skillsWrap.querySelector('.skills__title');
    const existing = skillsWrap.querySelectorAll('.skill');
    existing.forEach(el => el.remove());
    c.skills.forEach(sk => {
      const div = document.createElement('div');
      div.className = 'skill';
      div.innerHTML = `<div class="skill__info"><span>${sk.name}</span><span>${sk.pct}%</span></div><div class="skill__bar"><div class="skill__fill" data-width="${sk.pct}" style="width:${sk.pct}%"></div></div>`;
      skillsWrap.appendChild(div);
    });
  }

  // Tools
  const toolsList = s('.tools-list');
  if (toolsList && c.tools) {
    toolsList.innerHTML = c.tools.split(',').map(t => `<span class="tool-tag">${t.trim()}</span>`).join('');
  }

  // About badges
  const badges = sa('.about__badge');
  if (badges[0]) { badges[0].querySelector('strong').textContent = c.badge1title || ''; badges[0].querySelector('span').textContent = c.badge1sub || ''; }
  if (badges[1]) { badges[1].querySelector('strong').textContent = c.badge2title || ''; badges[1].querySelector('span').textContent = c.badge2sub || ''; }

  // SERVICES
  const svcGrid = s('.services__grid');
  if (svcGrid && c.services) {
    svcGrid.innerHTML = c.services.map(svc => `
      <div class="service-card ${svc.featured ? 'service-card--featured' : ''}">
        ${svc.featured ? '<div class="service-card__badge">Most Popular</div>' : ''}
        <div class="service-card__icon">${svc.icon}</div>
        <h3>${svc.title}</h3>
        <p>${svc.desc}</p>
        <p class="service-card__price">${svc.price}</p>
      </div>`).join('');
  }

  // PORTFOLIO section visibility
  show('#portfolio', c.showPortfolio !== false);

  // CASE STUDIES
  show('#work', c.showCases !== false);
  const workGrid = s('.work__grid');
  if (workGrid && c.cases) {
    workGrid.innerHTML = c.cases.map(cs => `
      <div class="case-card">
        <div class="case-card__tag">${cs.tag}</div>
        <h3>${cs.title}</h3>
        <p>${cs.desc}</p>
        <div class="case-card__results">
          <div class="result"><strong>${cs.r1val}</strong><span>${cs.r1label}</span></div>
          <div class="result"><strong>${cs.r2val}</strong><span>${cs.r2label}</span></div>
          <div class="result"><strong>${cs.r3val}</strong><span>${cs.r3label}</span></div>
        </div>
      </div>`).join('');
  }

  // TESTIMONIALS
  show('#testimonials', c.showTesti !== false);
  const testiGrid = s('.testimonials__grid');
  if (testiGrid && c.testimonials) {
    const avColors = ['av1','av2','av3','av1','av2'];
    testiGrid.innerHTML = c.testimonials.map((t, i) => `
      <div class="testi-card">
        <div class="testi-card__stars">${'★'.repeat(Math.min(5, t.stars || 5))}${'☆'.repeat(5 - Math.min(5, t.stars || 5))}</div>
        <p>${t.text}</p>
        <div class="testi-card__author">
          <div class="testi-avatar ${avColors[i % avColors.length]}"></div>
          <div><strong>${t.name}</strong><span>${t.role}</span></div>
        </div>
      </div>`).join('');
  }

  // CONTACT
  set('.contact .section__label', c.contactLabel);
  const contactH2 = s('.contact__text h2');
  if (contactH2) contactH2.innerHTML = `${c.contactH2a || ''} <span class="gradient-text">${c.contactH2b || ''}</span>`;
  const contactP = s('.contact__text > p');
  if (contactP) contactP.textContent = c.contactDesc || '';

  const emailLink = s('.contact__link[href^="mailto"]');
  if (emailLink && c.contactEmail) {
    emailLink.href = 'mailto:' + c.contactEmail;
    const span = emailLink.querySelector('span:last-child');
    if (span) span.textContent = c.contactEmail;
  }
  const waLink = s('.contact__link[href*="wa.me"]');
  if (waLink && c.contactWA) {
    waLink.href = 'https://wa.me/' + c.contactWA;
    const span = waLink.querySelector('span:last-child');
    if (span) span.textContent = '+' + c.contactWA;
  }
  const liLink = s('.contact__link[href*="linkedin"]');
  if (liLink && c.contactLinkedIn) liLink.href = c.contactLinkedIn;

  const formBtn = s('#contactForm button[type="submit"]');
  if (formBtn) formBtn.textContent = c.formBtnText || 'Send Message →';
  set('.form__note', c.formNote);

  // Service dropdown options
  const svcSelect = s('#service');
  if (svcSelect && c.serviceOptions) {
    const opts = c.serviceOptions.split('\n').filter(Boolean);
    svcSelect.innerHTML = '<option value="">Select a service...</option>' + opts.map(o => `<option>${o.trim()}</option>`).join('');
  }

  // FOOTER
  const footerBrandP = s('.footer__brand p');
  if (footerBrandP) footerBrandP.textContent = c.footerTagline || '';
  const footerBottom = s('.footer__bottom p');
  if (footerBottom) footerBottom.textContent = `© ${c.copyrightYear || '2026'} · ${c.name || 'Your Name'} · ${c.footerTagline || 'Full Stack Developer · India'}`;

  // Grid bg
  const grid = s('.hero__bg-grid');
  if (grid) grid.style.display = c.showGrid !== false ? '' : 'none';

  // PROCESS
  show('#process', c.showProcess !== false);
  set('.process .section__label', c.processLabel);
  const processH2 = s('.process h2');
  if (processH2) processH2.innerHTML = `${c.processH2a || ''} <span class="gradient-text">${c.processH2b || ''}</span>`;
  const processGrid = s('.process__grid');
  if (processGrid && c.processSteps) {
    processGrid.innerHTML = c.processSteps.map((step, i) => `
      <div class="process-step">
        <div class="process-step__num">${step.num}</div>
        <div class="process-step__icon">${step.icon}</div>
        <h3>${step.title}</h3>
        <p>${step.desc}</p>
      </div>
      ${i < c.processSteps.length - 1 ? '<div class="process-step__arrow">→</div>' : ''}`).join('');
  }

  // TECH STACK
  show('#techstack', c.showTechStack !== false);
  set('.techstack .section__label', c.techLabel);
  const techH2 = s('.techstack h2');
  if (techH2) techH2.innerHTML = `${c.techH2a || ''} <span class="gradient-text">${c.techH2b || ''}</span>`;
  const techGrid = s('.techstack__grid');
  if (techGrid && c.techGroups) {
    techGrid.innerHTML = c.techGroups.map(grp => `
      <div class="tech-group">
        <p class="tech-group__label">${grp.label}</p>
        <div class="tech-tags">${grp.tags.split(',').map(t => `<span class="tech-tag">${t.trim()}</span>`).join('')}</div>
      </div>`).join('');
  }

  // FAQ
  show('#faq', c.showFaq !== false);
  set('.faq .section__label', c.faqLabel);
  const faqH2 = s('.faq h2');
  if (faqH2) faqH2.innerHTML = `${c.faqH2a || ''} <span class="gradient-text">${c.faqH2b || ''}</span>`;
  const faqList = s('.faq__list');
  if (faqList && c.faqs) {
    faqList.innerHTML = c.faqs.map(faq => `
      <div class="faq-item">
        <button class="faq-item__q">${faq.q} <span class="faq-item__icon">+</span></button>
        <div class="faq-item__a"><p>${faq.a}</p></div>
      </div>`).join('');
    // Re-bind accordion
    faqList.querySelectorAll('.faq-item__q').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const isOpen = item.classList.contains('open');
        faqList.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    });
  }
}
