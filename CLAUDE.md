# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

This is a static HTML/CSS family recipe cookbook site ("Grey's Cook Book"), deployed via GitHub Pages to `greycooks.com` (see `CNAME`). There is no build step, package manager, framework, or test suite — every page is a hand-written, self-contained HTML file with inline `<style>` blocks and inline `<script>` blocks. Editing means directly editing the HTML files and previewing by opening them in a browser (or serving the folder with any static file server).

## Site structure

- `index.html` — homepage (hero, foreword, category quick-links).
- `book/index.html` — table of contents linking to each category chapter.
- `recipeindex/index.html` — alphabetical index of all individual recipes.
- One folder per recipe category (`appetizers/`, `breads/`, `breakfast/`, `dessert/`, `fish/`, `meats/`, `sides/`), each containing a single `index.html` that lists every recipe in that category as a `.recipe-card`.
- `print.html` — a separate, standalone "print edition" (marked `noindex, nofollow`). It has no static recipe content of its own: on load, client-side JS (`buildBook()`) fetches each category page listed in `CATEGORY_PAGES`, parses out every `.recipe-card` (title, `.ingredients-list li`, `.instructions p`, `.note-box`/`.variation-box`), and rebuilds a printable book from them. Adding a recipe to a category page's `.recipe-card` markup is automatically picked up here — no manual sync needed.
- `style.css` — the single shared stylesheet for all pages (nav bar, recipe cards, category banners, buttons, etc.), built around CSS custom properties defined in `:root` (`--cream`, `--warm-brown`, `--rust`, `--gold`, `--dark-ink`, etc.). Reuse these variables rather than hardcoding colors.
- `images/` — category banner photos and the homepage cover image, referenced with absolute paths (`/images/...`).
- `sitemap.xml` / `robots.txt` — kept in sync manually with the page list; update `sitemap.xml` when adding or removing a page.

## Recipe card pattern

Each recipe within a category page follows this structure (see any file in `meats/index.html` for the fullest example):

```html
<div class="recipe-card" id="kebab-case-recipe-name">
  <div class="recipe-card-header">
    <h3>Recipe Name</h3>
    <button class="print-btn" onclick="printRecipe(this)">Print</button>
  </div>
  <div class="recipe-body">
    <h4>Ingredients</h4>
    <ul class="ingredients-list">...</ul>
    <h4>Instructions</h4>
    <div class="instructions">...</div>
    <!-- optional -->
    <div class="variation-box"><strong>Variation:</strong> ...</div>
    <div class="note-box"><strong>Note:</strong> ...</div>
  </div>
</div>
```

Adding a recipe to a category page requires updating three places in that same file:
1. The `.jump-links` list near the top (anchor link to the new card's `id`).
2. The recipe count shown in the category's `<meta name="description">`/`og:description` and in the homepage's `.cat-count` pill (`index.html`).
3. `recipeindex/index.html`, which lists the recipe again in the global alphabetical index.

## Per-page print function

Each category page (and `print.html`) defines its **own inline copy** of a `printRecipe(btn)` JavaScript function near the bottom of the file — it is not shared via an external `.js` file. It opens a new window, injects a hardcoded print stylesheet, and writes out the clicked recipe card's HTML. When changing print styling or behavior, the change must be repeated in every category page's inline copy (currently: `appetizers`, `breads`, `breakfast`, `dessert`, `fish`, `meats`, `sides`).

## SEO / structured data

Each page includes Open Graph tags and a canonical URL pointing at `https://greycooks.com/...`. Category pages also include a `application/ld+json` `Recipe` schema block in `<head>` — note that on multi-recipe category pages (e.g. `meats/index.html`), this JSON-LD currently only describes a single representative recipe for the page rather than every recipe card, so don't assume it enumerates all recipes on the page.
