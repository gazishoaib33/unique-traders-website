// main.js
// Unique Traders — shared site behaviour (nav, theme, quick enquiry, small utilities).

const WHATSAPP_NUMBER = '8801865283150';

const setupMobileNav = () => {
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelectorAll('.navbar a');

  const closeMenu = () => {
    document.body.classList.remove('nav-open');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
  };

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      const isOpen = document.body.classList.toggle('nav-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  navLinks.forEach((link) => link.addEventListener('click', closeMenu));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
};

const setActiveNavigation = () => {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.navbar a');

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;

    if (href === currentPage) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
};

const enableScrollReveal = () => {
  const targets = document.querySelectorAll('section, article, .category-card, .product-card, .benefit-card');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) return;

  targets.forEach((element) => element.classList.add('interactive-reveal'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  targets.forEach((element) => observer.observe(element));
};

const enableProductCards = () => {
  const productCards = document.querySelectorAll('.product-card--detail');
  if (!productCards.length) return;

  productCards.forEach((card) => {
    card.tabIndex = 0;

    const toggleFocus = () => card.classList.toggle('is-highlighted');

    card.addEventListener('click', toggleFocus);
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleFocus();
      }
    });
  });
};

const setupThemeToggle = () => {
  const toggle = document.getElementById('theme-toggle');
  const icon = document.getElementById('theme-icon');
  if (!toggle) return;

  const applyIcon = (theme) => {
    if (!icon) return;
    icon.classList.toggle('fa-moon', theme !== 'dark');
    icon.classList.toggle('fa-sun', theme === 'dark');
  };

  applyIcon(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

  toggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const nextTheme = isDark ? 'light' : 'dark';

    if (nextTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    applyIcon(nextTheme);

    try {
      localStorage.setItem('uniqueTradersTheme', nextTheme);
    } catch (_error) {
      // Private browsing or storage disabled — theme just won't persist.
    }
  });
};

const setupBackToTop = () => {
  const button = document.getElementById('back-to-top');
  if (!button) return;

  const toggleVisibility = () => {
    button.hidden = window.scrollY < 400;
  };

  toggleVisibility();
  window.addEventListener('scroll', toggleVisibility, { passive: true });

  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
};

const setupFooterYear = () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
};

const showToast = (message) => {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.hidden = false;
  requestAnimationFrame(() => toast.classList.add('is-visible'));

  window.clearTimeout(showToast._timer);
  showToast._timer = window.setTimeout(() => {
    toast.classList.remove('is-visible');
    window.setTimeout(() => {
      toast.hidden = true;
    }, 200);
  }, 2200);
};

const copyText = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (_error) {
    // fall through to legacy method
  }

  try {
    const temp = document.createElement('textarea');
    temp.value = text;
    temp.style.position = 'fixed';
    temp.style.opacity = '0';
    document.body.appendChild(temp);
    temp.focus();
    temp.select();
    const succeeded = document.execCommand('copy');
    document.body.removeChild(temp);
    return succeeded;
  } catch (_error) {
    return false;
  }
};

const setupCopyButtons = () => {
  const buttons = document.querySelectorAll('.copy-btn[data-copy]');
  if (!buttons.length) return;

  buttons.forEach((button) => {
    button.addEventListener('click', async () => {
      const value = button.getAttribute('data-copy') || '';
      const ok = await copyText(value);
      showToast(ok ? 'কপি হয়েছে!' : 'কপি করা যায়নি, নিজে মুছে নিন।');
    });
  });
};

const setupCategoryFilter = () => {
  const input = document.getElementById('category-search');
  const cards = document.querySelectorAll('.category-grid .category-card');
  const emptyState = document.getElementById('category-empty');
  if (!input || !cards.length) return;

  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach((card) => {
      const matches = card.textContent.toLowerCase().includes(query);
      card.classList.toggle('is-hidden', !matches);
      if (matches) visibleCount += 1;
    });

    if (emptyState) emptyState.hidden = visibleCount !== 0;
  });
};

const setupQuickEnquiry = () => {
  const dialog = document.getElementById('enquiry-dialog');
  const openButtons = document.querySelectorAll('[data-open-enquiry]');
  const closeButton = dialog ? dialog.querySelector('.enquiry-close') : null;
  const form = document.getElementById('enquiry-form');
  if (!dialog || !form || !openButtons.length) return;

  const supportsDialog = typeof dialog.showModal === 'function';
  const storageKey = 'uniqueTradersEnquiryContact';

  const prefillContact = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      const nameField = form.elements.namedItem('name');
      const phoneField = form.elements.namedItem('phone');
      if (nameField && saved.name) nameField.value = saved.name;
      if (phoneField && saved.phone) phoneField.value = saved.phone;
    } catch (_error) {
      // Ignore malformed or inaccessible storage.
    }
  };

  openButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const presetCategory = button.getAttribute('data-open-enquiry');
      if (presetCategory) {
        const categoryField = form.elements.namedItem('category');
        if (categoryField) categoryField.value = presetCategory;
      }

      prefillContact();

      if (supportsDialog) {
        dialog.showModal();
      } else {
        window.open(`https://wa.me/${WHATSAPP_NUMBER}`, '_blank', 'noopener');
      }
    });
  });

  if (closeButton) {
    closeButton.addEventListener('click', () => dialog.close());
  }

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  form.addEventListener('submit', (event) => {
    const name = (form.elements.namedItem('name')?.value || '').trim();
    const phone = (form.elements.namedItem('phone')?.value || '').trim();
    const category = form.elements.namedItem('category')?.value || '';
    const type = form.elements.namedItem('type')?.value || '';
    const quantity = form.elements.namedItem('quantity')?.value || '';
    const note = (form.elements.namedItem('note')?.value || '').trim();

    const lines = [
      'আসসালামু আলাইকুম, Unique Traders — আমি নিচের বিষয়ে জানতে চাই:',
      `ক্যাটাগরি: ${category}`,
      `ধরন: ${type}`,
      `পরিমাণ: ${quantity}`,
    ];
    if (note) lines.push(`বিস্তারিত: ${note}`);
    if (name) lines.push(`নাম: ${name}`);
    if (phone) lines.push(`ফোন: ${phone}`);

    const message = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank', 'noopener');

    try {
      localStorage.setItem(storageKey, JSON.stringify({ name, phone }));
    } catch (_error) {
      // Ignore storage failures — the enquiry itself already opened.
    }
    // method="dialog" closes the dialog and resets nothing on its own;
    // clear the free-text fields so the next enquiry starts fresh.
    const noteField = form.elements.namedItem('note');
    if (noteField) noteField.value = '';
  });
};

document.addEventListener('DOMContentLoaded', () => {
  setupMobileNav();
  setActiveNavigation();
  setupThemeToggle();
  enableScrollReveal();
  enableProductCards();
  setupBackToTop();
  setupFooterYear();
  setupCopyButtons();
  setupCategoryFilter();
  setupQuickEnquiry();
});
