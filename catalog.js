// Unique Traders — public product catalogue (product.html).
// Shows every product from catalog-data.js with its size, variants and photo.
// No prices are shown: each product has a button that opens WhatsApp with a
// ready-made message asking for the price, including the product code.
(() => {
  const data = window.UT_CATALOG;
  const grid = document.getElementById('catalog-grid');
  if (!data || !grid) return;

  const PAGE_SIZE = 24;
  const searchInput = document.getElementById('catalog-search');
  const categorySelect = document.getElementById('catalog-category');
  const countEl = document.getElementById('catalog-count');
  const moreButton = document.getElementById('catalog-more');
  const adviceLink = document.getElementById('catalog-advice');
  const number = typeof WHATSAPP_NUMBER !== 'undefined' ? WHATSAPP_NUMBER : '8801865283150';

  const categories = Object.fromEntries(data.categories.map((c) => [c.id, c]));
  let limit = PAGE_SIZE;

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[ch]));

  // "7 x 3.5", "7×3.5" and "7X3.5" all become "7x3.5".
  const normalize = (text) => String(text ?? '')
    .toLowerCase()
    .replace(/[×*]/g, 'x')
    .replace(/(\d)\s*x\s*(?=\d)/g, '$1x')
    .replace(/\s+/g, ' ')
    .trim();

  const searchText = (product) => {
    const category = categories[product.category] || {};
    return normalize([product.name, product.sku, product.size, product.brand, category.name, category.nameBn,
      ...product.variants.map((v) => `${v.name} ${v.sku}`)].join(' '));
  };
  data.products.forEach((p) => { p._search = searchText(p); });

  const whatsappLink = (text) => `https://wa.me/${number}?text=${encodeURIComponent(text)}`;

  const priceMessage = (product, variant) => [
    'আসসালামু আলাইকুম। এই পণ্যটির দাম জানতে চাই:',
    `${product.name}${variant ? ` — ${variant.name}` : ''}`,
    product.size ? `মাপ/বিবরণ: ${product.size}` : '',
    `কোড: ${variant ? variant.sku : product.sku}`,
  ].filter(Boolean).join('\n');

  // Category dropdown, with product counts.
  const counts = {};
  data.products.forEach((p) => { counts[p.category] = (counts[p.category] || 0) + 1; });
  data.categories
    .filter((c) => counts[c.id])
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((c) => {
      const option = document.createElement('option');
      option.value = c.id;
      option.textContent = `${c.nameBn} (${c.name}) — ${counts[c.id]}`;
      categorySelect.appendChild(option);
    });

  // Allow links like product.html?q=cosmic or product.html?category=cat_frame
  const params = new URLSearchParams(window.location.search);
  if (params.get('q')) searchInput.value = params.get('q');
  if (params.get('category') && categories[params.get('category')]) categorySelect.value = params.get('category');

  const cardHtml = (product) => {
    const category = categories[product.category] || {};
    const image = product.image
      ? `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" width="320" height="240">`
      : '<span class="catalog-card__placeholder" aria-hidden="true"><i class="fas fa-door-closed"></i></span>';
    const variantPicker = product.variants.length > 1
      ? `<label class="catalog-card__variant">
           <span>কোন পাশ / ধরন?</span>
           <select data-variant>
             <option value="">এখনো ঠিক করিনি</option>
             ${product.variants.map((v, i) => `<option value="${i}">${escapeHtml(v.name)}</option>`).join('')}
           </select>
         </label>`
      : '';
    return `
      <article class="catalog-card" data-sku="${escapeHtml(product.sku)}">
        <div class="catalog-card__image">${image}</div>
        <div class="catalog-card__body">
          <p class="catalog-card__category">${escapeHtml(category.nameBn || '')}${product.brand ? ` · ${escapeHtml(product.brand)}` : ''}</p>
          <h3>${escapeHtml(product.name)}</h3>
          ${product.size ? `<p class="catalog-card__size">${escapeHtml(product.size)}</p>` : ''}
          ${product.variants.length > 1 ? `<p class="catalog-card__variants">${product.variants.map((v) => `<span>${escapeHtml(v.name)}</span>`).join('')}</p>` : ''}
          <p class="catalog-card__code">কোড: ${escapeHtml(product.sku)}</p>
          ${variantPicker}
          <a class="btn btn-primary catalog-card__ask" href="${whatsappLink(priceMessage(product))}" target="_blank" rel="noopener">
            <i class="fab fa-whatsapp" aria-hidden="true"></i> দাম জানুন
          </a>
        </div>
      </article>`;
  };

  const render = () => {
    const query = normalize(searchInput.value);
    const words = query.split(' ').filter(Boolean);
    const category = categorySelect.value;
    const matches = data.products.filter((p) =>
      (!category || p.category === category) && words.every((w) => p._search.includes(w)));

    countEl.textContent = matches.length
      ? `${matches.length}টি পণ্য পাওয়া গেছে`
      : '';
    if (!matches.length) {
      grid.innerHTML = `<div class="catalog-empty">
        <p>এই খোঁজে কোনো পণ্য পাওয়া যায়নি।</p>
        <a class="btn btn-primary" href="${whatsappLink(`আসসালামু আলাইকুম। আমি এই পণ্যটি খুঁজছি: ${searchInput.value.trim()}`)}" target="_blank" rel="noopener"><i class="fab fa-whatsapp" aria-hidden="true"></i> আমাদের জিজ্ঞাসা করুন</a>
      </div>`;
      moreButton.hidden = true;
      return;
    }
    grid.innerHTML = matches.slice(0, limit).map(cardHtml).join('');
    moreButton.hidden = matches.length <= limit;
    moreButton.textContent = `আরও দেখুন (${matches.length - limit}টি বাকি)`;
  };

  // Choosing Left/Right puts that exact variant and its code in the message.
  grid.addEventListener('change', (event) => {
    const select = event.target.closest('[data-variant]');
    if (!select) return;
    const card = select.closest('.catalog-card');
    const product = data.products.find((p) => p.sku === card.dataset.sku);
    const variant = select.value === '' ? null : product.variants[Number(select.value)];
    card.querySelector('.catalog-card__ask').href = whatsappLink(priceMessage(product, variant));
  });

  let timer;
  searchInput.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => { limit = PAGE_SIZE; render(); }, 150);
  });
  categorySelect.addEventListener('change', () => { limit = PAGE_SIZE; render(); });
  moreButton.addEventListener('click', () => { limit += PAGE_SIZE; render(); });

  if (adviceLink) {
    adviceLink.href = whatsappLink('আসসালামু আলাইকুম। দরজা কেনার ব্যাপারে পরামর্শ চাই।\nমাপ: \nকোথায় লাগাবো: \nবাজেট: ');
  }

  render();
})();
