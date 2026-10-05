# Unique Traders Website

Public website for Unique Traders, an authorised dealer of RFL doors in Tangail, Bangladesh.
Retail and wholesale.

## Pages

- `index.html` — home, category grid, contact
- `categories.html` — door categories, category search, and a door-measurement guide
- `product.html` — the full public product catalogue (search, categories, "ask for price" on WhatsApp)
- `about.html` — about the shop
- `contact.html` — address, phone, WhatsApp, and an embedded Google Map

Static HTML, CSS and vanilla JavaScript. Deployed to GitHub Pages
via `.github/workflows/jekyll-gh-pages.yml`.

Bangla is the primary language (`<html lang="bn">`); English appears as a secondary line
(marked `lang="en"` for screen readers).

## Public catalogue (no prices)

`product.html` lists every product from the shop's catalogue — name, size,
category, Left/Right variants, product code and photo. Prices are never
shown: each product has a **দাম জানুন** button that opens WhatsApp with a
ready-made message containing the product name, size, chosen variant and
code. A "পরামর্শ চাই" button asks for advice on size/budget.

The list comes from `catalog-data.js` (+ photos in
`images/products/catalog/`), generated from the inventory app's catalogue:

```bash
# from this repo, with gazishoaib33/unique-traders checked out next to it
node tools/build-public-catalog.js ../unique-traders
```

The generator copies **only public fields** (name, code, category, brand,
size, variant names, photo) — never cost price, selling price, stock or
barcodes — and shrinks photos to web size (needs ImageMagick). Re-run it when
the catalogue changes; products added only inside the inventory app's
browser storage are not included.

## Admin / Staff login

Every page has a **লগইন (Admin / Staff)** link in the menu that opens the
inventory app at `https://gazishoaib33.github.io/unique-traders/`. For that
link to work, GitHub Pages must be enabled for the `unique-traders` repo
(Settings → Pages → Deploy from branch → `main` / root). The public site
itself has no login and stores nothing.

## Features

- Light/dark theme toggle (persisted per browser, respects system preference on first visit)
- "Quick Enquiry" dialog — builds a formatted WhatsApp message from a small form (category,
  retail/wholesale, quantity, notes) and opens WhatsApp with it pre-filled; nothing is sent
  by the site itself, the visitor still presses send in WhatsApp
- Category search/filter on the categories page
- Door-measurement guide (`categories.html#measure-guide`)
- Copy-to-clipboard for the phone number and address on the contact page
- Embedded Google Map + directions link on the contact page, pointed at the shop's real
  Google Maps listing ("RFL Exclusive Showroom Unique Traders")
- `robots.txt` / `sitemap.xml`, canonical URLs, Open Graph tags, and JSON-LD business data for SEO

## Still to do (needs the shop owner's input — not guessed by this pass)

- Replace the placeholder SVGs in `images/` with real photographs of the shop and doors,
  and swap the SVG `og:image` for a real JPG/PNG once available
- Add the year the shop was established (`about.html`)
- Add opening hours (`contact.html`)
- Confirm the dealer wording with RFL before publishing
- Decide whether to publish MRP per product, or keep "contact for price"
- Add a shop email address in place of the personal one

## Possible future refactor

The header/nav/footer markup is duplicated across all five pages (plain static HTML, no
build step). If the page count grows, moving to Jekyll `_includes`/layouts (the repo already
builds with Jekyll for GitHub Pages) would remove that duplication — left out of this pass
since it couldn't be verified without a local Ruby/Jekyll toolchain.

---

Built by Gazi Shoaib.
