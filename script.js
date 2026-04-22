/* ============================================================
   SABKU — script.js
   Main JavaScript — Navigation, News, Gallery, Animations
   ============================================================ */

/* ── Loading Screen ── */
window.addEventListener('load', () => {
  const loader = document.getElementById('loading-screen');
  setTimeout(() => loader.classList.add('hidden'), 800);
});

/* ── Navbar: scroll state ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ── Navbar: active link on scroll ── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a, .nav-drawer ul a');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach(s => observer.observe(s));

/* ── Hamburger menu ── */
const hamburger = document.querySelector('.hamburger');
const drawer    = document.querySelector('.nav-drawer');
hamburger.addEventListener('click', () => {
  const open = hamburger.classList.toggle('open');
  drawer.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});
// Close drawer on link click
drawer.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    drawer.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ── Scroll-reveal animations ── */
const revealEls = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => revealObs.observe(el));

/* ============================================================
   NEWS SYSTEM
   ============================================================ */
let allNews = [];

// Format Thai date
function formatDate(dateStr) {
  const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${d} ${months[m-1]} ${y + 543}`;
}

// Build a card element
function buildCard(item) {
  const card = document.createElement('article');
  card.className = 'news-card reveal';
  card.innerHTML = `
    <div class="card-meta">
      <span class="card-category">${item.category}</span>
      <span class="card-date">${formatDate(item.date)}</span>
    </div>
    <h3 class="card-title">${item.title}</h3>
    <p class="card-preview">${item.preview}</p>
    <span class="card-arrow">อ่านต่อ <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>
  `;
  card.addEventListener('click', () => openModal(item));

  // Trigger reveal for dynamically added cards
  requestAnimationFrame(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in-view'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    obs.observe(card);
  });

  return card;
}

// Render cards
function renderNews(items) {
  const grid = document.getElementById('news-grid');
  grid.innerHTML = '';
  if (!items.length) {
    grid.innerHTML = `
      <div class="news-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <p>ไม่พบข่าวที่ตรงกับการค้นหา</p>
      </div>`;
    return;
  }
  items.forEach(item => grid.appendChild(buildCard(item)));
}

// Fetch news.json
async function loadNews() {
  try {
    const res  = await fetch('news.json');
    allNews    = await res.json();
    // Sort newest first
    allNews.sort((a, b) => new Date(b.date) - new Date(a.date));
    renderNews(allNews);
  } catch (err) {
    console.error('Failed to load news:', err);
    document.getElementById('news-grid').innerHTML = `
      <div class="news-empty"><p>ไม่สามารถโหลดข่าวได้ในขณะนี้</p></div>`;
  }
}

// Real-time search filter
document.getElementById('news-search').addEventListener('input', function () {
  const q = this.value.trim().toLowerCase();
  const filtered = allNews.filter(item =>
    item.title.toLowerCase().includes(q) ||
    item.preview.toLowerCase().includes(q) ||
    item.category.toLowerCase().includes(q)
  );
  renderNews(filtered);
});

/* ── News Modal ── */
const modalOverlay = document.getElementById('modal-overlay');
const modalClose   = document.querySelector('.modal-close');

function openModal(item) {
  document.getElementById('modal-category').textContent = item.category;
  document.getElementById('modal-title').textContent    = item.title;
  document.getElementById('modal-date').textContent     = formatDate(item.date);
  document.getElementById('modal-content').textContent  = item.content;
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ============================================================
   GALLERY / LIGHTBOX
   ============================================================ */
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightbox-img');
const lightboxClose = document.querySelector('.lightbox-close');

// Gallery items data
const galleryItems = [
  { label: 'กิจกรรมรับน้องใหม่ 2567', emoji: '🎓' },
  { label: 'ค่ายอาสา KU Volunteer',    emoji: '🌱' },
  { label: 'งาน Kasetsart Fair',        emoji: '🎪' },
  { label: 'กิจกรรม Green Campus',      emoji: '♻️' },
  { label: 'กีฬาสีนิสิต มก.',           emoji: '🏆' },
  { label: 'โครงการแลกเปลี่ยนต่างประเทศ', emoji: '✈️' },
];

function buildGallery() {
  const grid = document.getElementById('gallery-grid');
  galleryItems.forEach((item, i) => {
    const el = document.createElement('div');
    el.className = 'gallery-item reveal';
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', item.label);
    el.innerHTML = `
      <div class="gallery-placeholder">
        <span style="font-size:3rem">${item.emoji}</span>
        <span>${item.label}</span>
      </div>
      <div class="gallery-overlay"><span>${item.label}</span></div>
      <div class="gallery-expand">⤢</div>
    `;
    el.addEventListener('click', () => openLightbox(item, el));
    el.addEventListener('keydown', e => { if (e.key === 'Enter') openLightbox(item, el); });

    // Stagger reveal
    el.style.transitionDelay = `${i * 0.07}s`;
    grid.appendChild(el);

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('in-view'); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.1 });
    obs.observe(el);
  });
}

function openLightbox(item, sourceEl) {
  // Since we have placeholder items, show a styled placeholder inside lightbox
  lightboxImg.alt = item.label;
  lightboxImg.src = ''; // blank
  lightboxImg.style.display = 'none';

  // Show text placeholder in lightbox
  let lb_placeholder = document.getElementById('lb-placeholder');
  if (!lb_placeholder) {
    lb_placeholder = document.createElement('div');
    lb_placeholder.id = 'lb-placeholder';
    lb_placeholder.style.cssText = `
      color:#e8f5ee; text-align:center; padding:3rem;
      display:flex; flex-direction:column; gap:1rem; align-items:center;
      background:rgba(0,255,153,0.05); border:1px solid rgba(0,255,153,0.15);
      border-radius:16px; max-width:500px;
    `;
    lightbox.querySelector('.lightbox-inner').appendChild(lb_placeholder);
  }
  lb_placeholder.innerHTML = `
    <span style="font-size:5rem">${item.emoji}</span>
    <p style="font-size:1.2rem;font-weight:700;">${item.label}</p>
    <p style="font-size:0.9rem;color:#7aab92;">รูปภาพกิจกรรม SABKU</p>
  `;
  lb_placeholder.style.display = 'flex';

  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  const lbp = document.getElementById('lb-placeholder');
  if (lbp) lbp.style.display = 'none';
}
lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

/* ── CTA Hero button ── */
document.getElementById('hero-cta')?.addEventListener('click', () => {
  document.getElementById('news').scrollIntoView({ behavior: 'smooth' });
});

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  loadNews();
  buildGallery();
});
