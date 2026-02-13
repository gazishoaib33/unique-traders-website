// main.js

const setupMobileNav = () => {
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelectorAll('nav a, .navbar a');

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      document.body.classList.toggle('nav-open');
      const isExpanded = document.body.classList.contains('nav-open');
      menuToggle.setAttribute('aria-expanded', String(isExpanded));
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      document.body.classList.remove('nav-open');
      if (menuToggle) {
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });
};

const setActiveNavigation = () => {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('nav a, .navbar a');

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;

    if (href === currentPage) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
};

const enableScrollReveal = () => {
  const targets = document.querySelectorAll('section, article, .category, .product, .benefit-card');
  if (!targets.length) return;

  targets.forEach((element) => {
    element.classList.add('interactive-reveal');
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
    }
  );

  targets.forEach((element) => observer.observe(element));
};

const enableCategorySelection = () => {
  const categories = document.querySelectorAll('.category-grid .category');
  const title = document.querySelector('main h1');
  if (!categories.length) return;

  categories.forEach((category) => {
    category.tabIndex = 0;

    const activateCategory = () => {
      categories.forEach((item) => item.classList.remove('selected'));
      category.classList.add('selected');
      if (title) {
        const label = category.querySelector('h3')?.textContent?.trim();
        title.textContent = label ? `${label} Collection` : 'Product Categories';
      }
    };

    category.addEventListener('click', activateCategory);
    category.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activateCategory();
      }
    });
  });
};

const enableProductCards = () => {
  const productCards = document.querySelectorAll('.product-card--detail');
  if (!productCards.length) return;

  productCards.forEach((card) => {
    card.tabIndex = 0;

    const toggleFocus = () => {
      card.classList.toggle('is-highlighted');
    };

    card.addEventListener('click', toggleFocus);
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleFocus();
      }
    });
  });
};

const enableAboutExpansion = () => {
  const aboutHeading = document.querySelector('main h1');
  const aboutParagraph = document.querySelector('main p');
  if (!aboutHeading || !aboutParagraph || !/about/i.test(aboutHeading.textContent || '')) return;

  const fullText = aboutParagraph.textContent || '';
  if (fullText.length < 150) return;

  const shortText = `${fullText.slice(0, 140).trim()}...`;
  aboutParagraph.textContent = shortText;

  const toggleButton = document.createElement('button');
  toggleButton.type = 'button';
  toggleButton.className = 'btn btn-primary btn-inline-toggle';
  toggleButton.textContent = 'Read more';

  let expanded = false;

  toggleButton.addEventListener('click', () => {
    expanded = !expanded;
    aboutParagraph.textContent = expanded ? fullText : shortText;
    toggleButton.textContent = expanded ? 'Show less' : 'Read more';
  });

  aboutParagraph.insertAdjacentElement('afterend', toggleButton);
};

const enableContactFormEnhancements = () => {
  const form = document.querySelector('form');
  if (!form) return;

  const heading = document.querySelector('main h1')?.textContent || '';
  if (!/contact/i.test(heading)) return;

  const inputs = form.querySelectorAll('input, textarea');
  const storageKey = 'uniqueTradersContactDraft';

  try {
    const savedDraft = localStorage.getItem(storageKey);
    if (savedDraft) {
      const data = JSON.parse(savedDraft);
      inputs.forEach((field) => {
        if (field.name && data[field.name]) {
          field.value = data[field.name];
        }
      });
    }
  } catch (_error) {
    // Ignore localStorage parsing issues silently.
  }

  inputs.forEach((field) => {
    field.addEventListener('input', () => {
      const draft = {};
      inputs.forEach((item) => {
        if (item.name) {
          draft[item.name] = item.value;
        }
      });
      localStorage.setItem(storageKey, JSON.stringify(draft));
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
    }

    setTimeout(() => {
      const confirmation = document.createElement('p');
      confirmation.className = 'form-confirmation';
      confirmation.textContent = '✅ Thanks! Your message has been prepared. Our team will contact you shortly.';

      const existing = form.querySelector('.form-confirmation');
      if (existing) existing.remove();
      form.appendChild(confirmation);

      form.reset();
      localStorage.removeItem(storageKey);

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Send';
      }
    }, 700);
  });
};

document.addEventListener('DOMContentLoaded', () => {
  setupMobileNav();
  setActiveNavigation();
  enableScrollReveal();
  enableCategorySelection();
  enableProductCards();
  enableAboutExpansion();
  enableContactFormEnhancements();
});
