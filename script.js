/* ===== NAV ===== */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 40));

const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(l => l.addEventListener('click', () => navLinks.classList.remove('open')));

/* ===== PROFILE PHOTO UPLOAD ===== */
const profileUpload = document.getElementById('profileUpload');
const profileImg = document.getElementById('profileImg');
const profilePlaceholder = document.getElementById('profilePlaceholder');

// Load saved profile photo
const savedPhoto = localStorage.getItem('portfolio_profile_photo');
if (savedPhoto) {
  profileImg.src = savedPhoto;
  profileImg.classList.remove('hidden');
  profilePlaceholder.style.display = 'none';
}

document.getElementById('profileImgBox').addEventListener('click', () => profileUpload.click());
profileUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    profileImg.src = ev.target.result;
    profileImg.classList.remove('hidden');
    profilePlaceholder.style.display = 'none';
    localStorage.setItem('portfolio_profile_photo', ev.target.result);
  };
  reader.readAsDataURL(file);
});

/* ===== SKILL BARS ANIMATION ===== */
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.skill__fill').forEach(bar => {
        bar.style.width = bar.dataset.width + '%';
      });
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const skillsSection = document.querySelector('.skills');
if (skillsSection) skillObserver.observe(skillsSection);

/* ===== PORTFOLIO — Cloudinary + Supabase server ===== */

// Server URL — change this after deploying server
const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3001'
  : 'https://portfolio-server-8n7g.onrender.com';

// Admin secret — change this to match your server/.env ADMIN_SECRET
const ADMIN_SECRET = localStorage.getItem('admin_secret') || '';

let portfolioItems = [];
let currentLightboxIndex = 0;
let currentFilter = 'all';

const portfolioGrid    = document.getElementById('portfolioGrid');
const portfolioEmpty   = document.getElementById('portfolioEmpty');
const portfolioFilters = document.getElementById('portfolioFilters');
const portfolioAdmin   = document.getElementById('portfolioAdmin');

/* --- Show admin panel always --- */
if (portfolioAdmin) portfolioAdmin.style.display = 'block';

/* --- Fetch images from server (visible to ALL devices) --- */
async function loadPortfolio() {
  try {
    const res = await fetch(`${API_URL}/api/portfolio`);
    if (!res.ok) throw new Error('Server error');
    portfolioItems = await res.json();

    // Map server fields to local format
    portfolioItems = portfolioItems.map(img => ({
      id: img.id,
      src: img.url,
      label: img.label || '',
      filter: img.category || 'all',
    }));
  } catch(e) {
    // Server not running — show empty state
    portfolioItems = [];
  }

  // Load profile photo from server settings
  try {
    const res = await fetch(`${API_URL}/api/settings`);
    const settings = await res.json();
    if (settings.profile_photo) {
      const img = document.getElementById('profileImg');
      const ph  = document.getElementById('profilePlaceholder');
      if (img) { img.src = settings.profile_photo; img.classList.remove('hidden'); }
      if (ph)  ph.style.display = 'none';
    }
  } catch(e) {}

  renderPortfolio();
}

/* --- Upload to Cloudinary via server --- */
const uploadZone     = document.getElementById('uploadZone');
const uploadBtn      = document.getElementById('uploadBtn');
const portfolioUpload = document.getElementById('portfolioUpload');

if (uploadBtn)      uploadBtn.addEventListener('click', (e) => { e.stopPropagation(); portfolioUpload.click(); });
if (uploadZone) {
  uploadZone.addEventListener('click', () => portfolioUpload.click());
  uploadZone.addEventListener('dragover',  (e) => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
  uploadZone.addEventListener('dragleave', ()  => uploadZone.classList.remove('drag-over'));
  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault(); uploadZone.classList.remove('drag-over');
    handleFiles(Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')));
  });
}
if (portfolioUpload) {
  portfolioUpload.addEventListener('change', (e) => { handleFiles(Array.from(e.target.files)); e.target.value = ''; });
}

async function handleFiles(files) {
  const secret = getAdminSecret();
  if (!secret) return;

  for (const file of files) {
    if (file.size > 10 * 1024 * 1024) { alert(`${file.name} too large (max 10MB)`); continue; }

    const btn = document.getElementById('uploadBtn');
    if (btn) { btn.textContent = '⏳ Uploading...'; btn.disabled = true; }

    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('label', '');
      fd.append('category', 'all');

      const res = await fetch(`${API_URL}/api/portfolio/upload`, {
        method: 'POST',
        headers: { 'x-admin-secret': secret },
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
      }

      if (btn) { btn.textContent = '✅ Uploaded!'; }
      setTimeout(() => { if (btn) { btn.textContent = 'Browse Files'; btn.disabled = false; } }, 2000);

      await loadPortfolio(); // Refresh from server
    } catch(err) {
      alert('Upload failed: ' + err.message + '\n\nMake sure server is running.');
      if (btn) { btn.textContent = 'Browse Files'; btn.disabled = false; }
    }
  }
}

/* --- Delete from server --- */
async function deleteImage(id) {
  const secret = getAdminSecret();
  if (!secret) return;
  if (!confirm('Delete this image?')) return;

  const res = await fetch(`${API_URL}/api/portfolio/${id}`, {
    method: 'DELETE',
    headers: { 'x-admin-secret': secret },
  });
  if (res.ok) await loadPortfolio();
  else alert('Delete failed');
}

/* --- Update label/category --- */
async function updateImage(id, label, category) {
  const secret = getAdminSecret();
  if (!secret) return;
  await fetch(`${API_URL}/api/portfolio/${id}`, {
    method: 'PATCH',
    headers: { 'x-admin-secret': secret, 'Content-Type': 'application/json' },
    body: JSON.stringify({ label, category }),
  });
}

/* --- Admin secret prompt --- */
function getAdminSecret() {
  let secret = localStorage.getItem('admin_secret');
  if (!secret) {
    secret = prompt('Enter admin password (set in server/.env as ADMIN_SECRET):');
    if (secret) localStorage.setItem('admin_secret', secret);
  }
  return secret;
}

/* --- Clear all button --- */
const clearAllBtn = document.getElementById('clearAllBtn');
if (clearAllBtn) {
  clearAllBtn.addEventListener('click', async () => {
    if (!confirm('Delete ALL portfolio images from server?')) return;
    const secret = getAdminSecret();
    if (!secret) return;
    for (const item of portfolioItems) {
      await fetch(`${API_URL}/api/portfolio/${item.id}`, {
        method: 'DELETE', headers: { 'x-admin-secret': secret },
      });
    }
    await loadPortfolio();
  });
}

/* --- Save to Site button — now just shows server status --- */
const saveToSiteBtn = document.getElementById('saveToSiteBtn');
if (saveToSiteBtn) {
  saveToSiteBtn.textContent = '🔄 Refresh Images';
  saveToSiteBtn.addEventListener('click', () => loadPortfolio());
}

/* --- Render grid --- */
function renderPortfolio(filter = 'all') {
  currentFilter = filter;
  const filtered = filter === 'all' ? portfolioItems : portfolioItems.filter(i => i.filter === filter);
  Array.from(portfolioGrid.querySelectorAll('.portfolio-item')).forEach(el => el.remove());

  if (portfolioItems.length === 0) {
    portfolioEmpty.style.display = 'block';
    portfolioFilters.style.display = 'none';
    return;
  }

  portfolioEmpty.style.display = 'none';
  portfolioFilters.style.display = 'flex';

  filtered.forEach((item) => {
    const realIdx = portfolioItems.indexOf(item);
    const div = document.createElement('div');
    div.className = 'portfolio-item';
    div.innerHTML = `
      <img src="${item.src}" alt="${item.label || 'Portfolio item'}" loading="lazy" />
      <div class="portfolio-item__overlay"><span>🔍 View</span></div>
      <button class="portfolio-item__delete" title="Remove">✕</button>
      <input class="portfolio-item__label-input" type="text" placeholder="Add a caption..." value="${item.label}" />
    `;

    div.querySelector('.portfolio-item__overlay').addEventListener('click', () => openLightbox(realIdx));
    div.querySelector('img').addEventListener('click', () => openLightbox(realIdx));

    div.querySelector('.portfolio-item__delete').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteImage(item.id);
    });

    const labelInput = div.querySelector('.portfolio-item__label-input');
    labelInput.addEventListener('click', e => e.stopPropagation());
    let labelTimer;
    labelInput.addEventListener('input', (e) => {
      clearTimeout(labelTimer);
      labelTimer = setTimeout(() => updateImage(item.id, e.target.value, item.filter), 800);
    });

    const catSelect = document.createElement('select');
    catSelect.className = 'portfolio-item__cat';
    catSelect.innerHTML = `
      <option value="all">Category</option>
      <option value="instagram">Web Apps</option>
      <option value="ads">APIs</option>
      <option value="analytics">Dashboards</option>
      <option value="content">Mobile</option>`;
    catSelect.value = item.filter || 'all';
    catSelect.addEventListener('click', e => e.stopPropagation());
    catSelect.addEventListener('change', (e) => {
      updateImage(item.id, item.label, e.target.value);
      portfolioItems[realIdx].filter = e.target.value;
      renderPortfolio(currentFilter);
    });
    div.appendChild(catSelect);

    portfolioGrid.appendChild(div);
  });
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderPortfolio(btn.dataset.filter);
  });
});

loadPortfolio();

/* ===== LIGHTBOX ===== */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');

function openLightbox(idx) {
  currentLightboxIndex = idx;
  lightboxImg.src = portfolioItems[idx].src;
  lightboxCaption.textContent = portfolioItems[idx].label || '';
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

document.getElementById('lightboxPrev').addEventListener('click', () => {
  currentLightboxIndex = (currentLightboxIndex - 1 + portfolioItems.length) % portfolioItems.length;
  openLightbox(currentLightboxIndex);
});

document.getElementById('lightboxNext').addEventListener('click', () => {
  currentLightboxIndex = (currentLightboxIndex + 1) % portfolioItems.length;
  openLightbox(currentLightboxIndex);
});

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') document.getElementById('lightboxPrev').click();
  if (e.key === 'ArrowRight') document.getElementById('lightboxNext').click();
});

/* ===== CONTACT FORM ===== */
const form = document.getElementById('contactForm');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = form.querySelector('[name="name"]').value.trim();
  const email = form.querySelector('[name="email"]').value.trim();
  if (!name || !email) {
    alert('Please fill in your name and email.');
    return;
  }

  const btn = form.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  btn.textContent = 'Sending...';
  btn.disabled = true;

  try {
    const res = await fetch('https://formspree.io/f/mqejdqvw', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form),
    });

    if (res.ok) {
      btn.textContent = '✓ Message Sent!';
      btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      form.reset();
      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
        btn.style.background = '';
      }, 4000);
    } else {
      throw new Error('Server error');
    }
  } catch {
    btn.textContent = '✕ Failed — try WhatsApp';
    btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
    setTimeout(() => {
      btn.textContent = originalText;
      btn.disabled = false;
      btn.style.background = '';
    }, 4000);
  }
});

/* ===== SCROLL ANIMATIONS ===== */
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.service-card, .case-card, .testi-card, .contact__link').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(28px)';
  el.style.transition = `opacity 0.5s ease ${i * 0.07}s, transform 0.5s ease ${i * 0.07}s`;
  fadeObserver.observe(el);
});

/* ===== FAQ ACCORDION ===== */
document.querySelectorAll('.faq-item__q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    // Close all
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    // Open clicked if it was closed
    if (!isOpen) item.classList.add('open');
  });
});
