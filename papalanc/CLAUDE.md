# CLAUDE.md

Family cookbook: a static site served by nginx at https://papalanccooks.papalanc.com from this folder (nginx conf: `~/papalanccooks.conf`). No build step, no framework, no JS dependencies.

## Layout
- `index.html` - home page. Recipes are grouped in sections by id (sauces, desserts, ...). Each section heading `<h2>` shows a `(N)` count, the Contents list repeats it, and the intro has a "N recipes" total.
- `files/<slug>.html` - one page per recipe, slug is lowercase-hyphenated.
- `Recipies/` - original source documents (Word etc.), spelled that way on purpose. Leave as is.

## Adding a recipe
1. Copy the head/CSS and structure from an existing page (e.g. `files/pantry-bbq-sauce.html`). Every page has a Print button next to the back link.
2. Add it to the right section in `index.html`.
3. Update **all three** counts: the section `<h2>` count, the Contents entry, and the total in the intro.
4. `chmod o+r files/<slug>.html`. The directory's default ACL creates files with no "other" read, and nginx then returns 403.
5. Rebuild the search index: `python3 build_search.py` (writes `search.json`; the home-page search box reads it). Do this after adding OR editing any recipe, then `chmod o+r search.json`.
6. Check the page loads from the live URL, and that the new recipe shows up in the search box.

## Notes
- Family-facing site; keep wording and recipes as the family wrote them. Fix typos only if asked.
- Not a git repo. Make a copy before large edits.
