/* ═══════════════════════════════════════
   Настины Сласти — main.js
   ═══════════════════════════════════════ */

// ── Telegram Bot config ──
const BOT_TOKEN = "1805801654:AAFzamsFKtlOqXB5KkFHuBa-ekxnSdaLxa0";
const CHAT_ID = "739889656";

// ── Gallery labels ──
const GALLERY_LABELS = [
  'Авторский торт', 'Цветочный декор', 'Ягодный торт',
  'Праздничный торт', 'Свадебный торт', 'Детский торт',
  'Муссовый торт', 'Торт на заказ', 'Капкейки', 'Клубника в шоколаде',
  'Пирожные', 'Моти'
];

// ── Init on DOMContentLoaded ──
document.addEventListener('DOMContentLoaded', () => {
  initImages();
  initGallery();
  initLightbox();
  initNav();
  initFadeIn();
  initChips();
  initForm();
});

// ─── Images ───────────────────────────────────────────
function initImages() {
  if (typeof CAKE_IMAGES === 'undefined' || !CAKE_IMAGES.length) return;

  const heroImg = document.getElementById('hero-img');
  if (heroImg) heroImg.src = CAKE_IMAGES[0];

  const slots = ['about-img-1', 'about-img-2', 'about-img-3'];
  slots.forEach((id, i) => {
    const el = document.getElementById(id);
    if (el && CAKE_IMAGES[i + 1]) el.src = CAKE_IMAGES[i + 1];
  });
}

// ─── Gallery ──────────────────────────────────────────
function initGallery() {
  if (typeof CAKE_IMAGES === 'undefined') return;
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;

  CAKE_IMAGES.slice(4).forEach((src, i) => {
    const label = GALLERY_LABELS[i % GALLERY_LABELS.length];
    const div = document.createElement('div');
    div.className = 'gallery-item';
    div.innerHTML = `
      <img src="${src}" alt="${label}" loading="lazy">
      <div class="gallery-overlay"><span>${label}</span></div>
    `;
    div.addEventListener('click', () => openLightbox(src));
    grid.appendChild(div);
  });
}

// ─── Lightbox ─────────────────────────────────────────
function initLightbox() {
  const box = document.getElementById('lightbox');
  const img = document.getElementById('lb-img');
  const close = document.getElementById('lb-close');
  if (!box) return;

  box.addEventListener('click', e => { if (e.target === box) closeLightbox(); });
  close.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
}

function openLightbox(src) {
  document.getElementById('lb-img').src = src;
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.getElementById('lb-img').src = '';
  document.body.style.overflow = '';
}

// ─── Nav scroll + burger ──────────────────────────────
function initNav() {
  const navbar = document.getElementById('navbar');
  const burger = document.getElementById('burger');
  const navLinks = document.querySelector('.nav-links');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  });

  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
    });
    // Close on link click
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => navLinks.classList.remove('mobile-open'));
    });
  }
}

// ─── Fade-in observer ─────────────────────────────────
function initFadeIn() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.08 });
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// ─── Dessert chips ────────────────────────────────────
function initChips() {
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => chip.classList.toggle('selected'));
  });
}

// ─── Form submit → Telegram ───────────────────────────
function initForm() {
  const btn = document.getElementById('form-submit-btn');
  if (!btn) return;
  btn.addEventListener('click', handleFormSubmit);
}

async function handleFormSubmit() {
  const btn = document.getElementById('form-submit-btn');
  const name = document.getElementById('f-name')?.value.trim();
  const contact = document.getElementById('f-contact')?.value.trim();
  const date = document.getElementById('f-date')?.value;
  const persons = document.getElementById('f-persons')?.value;
  const city = document.getElementById('f-city')?.value;
  const message = document.getElementById('f-message')?.value.trim();

  // Selected desserts
  const selected = [...document.querySelectorAll('.chip.selected')]
    .map(c => c.textContent.trim());

  if (!name || !contact) {
    shake(document.getElementById('f-name'));
    shake(document.getElementById('f-contact'));
    return;
  }

  const dessertLine = selected.length ? selected.join(', ') : '(не выбрано)';
  const cityNames = { tver: 'Тверь (доставка)', mednoye: 'с. Медное (самовывоз)', other: 'Другой' };

  const text = `
🍰 <b>Новая заявка — Настины Сласти</b> 🍰

👤 <b>Имя:</b> ${name}
📱 <b>Контакт:</b> ${contact}
🎂 <b>Десерты:</b> ${dessertLine}
📅 <b>Дата:</b> ${date || 'не указана'}
👥 <b>Порций:</b> ${persons || 'не указано'}
📍 <b>Доставка:</b> ${cityNames[city] || city || '—'}

💬 <b>Пожелания:</b>
${message || '(без пожеланий)'}
  `.trim();

  btn.disabled = true;
  btn.textContent = 'Отправляем...';

  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML' })
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.description || 'Telegram error');

    btn.textContent = '✓ Заявка отправлена!';
    btn.style.background = 'var(--green-ok)';
    resetForm();
  } catch (e) {
    console.error(e);
    btn.textContent = '✕ Ошибка — попробуйте ещё раз';
    btn.style.background = 'var(--red-err)';
  }

  setTimeout(() => {
    btn.disabled = false;
    btn.textContent = 'Отправить заявку →';
    btn.style.background = '';
  }, 3000);
}

function resetForm() {
  ['f-name', 'f-contact', 'f-date', 'f-persons', 'f-message'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const city = document.getElementById('f-city');
  if (city) city.value = '';
  document.querySelectorAll('.chip.selected').forEach(c => c.classList.remove('selected'));
}

function shake(el) {
  if (!el) return;
  el.style.animation = 'none';
  el.style.borderColor = 'var(--red-err)';
  setTimeout(() => el.style.borderColor = '', 1500);
}
