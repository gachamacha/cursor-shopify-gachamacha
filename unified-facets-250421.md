# Unified Facets/Filter Design — Technical Documentation

## Overview
This documentation summarizes the unified facets (filter/sort) implementation for the main-collection page, ensuring consistent design and functionality across all screen sizes (mobile, tablet, desktop).

---

## Relevant Files

- **sections/main-collection-product-grid.liquid**
  - Main template for the collection page.
  - Renders the filter/sort UI and product grid.
- **snippets/facets.liquid**
  - Contains all markup and logic for the unified filter/sort UI (mobile-facets design).
- **assets/component-facets.css**
  - All CSS for the facets/filter UI, including unified design and responsive behavior.
- **assets/base.css**
  - General CSS, including variables and utility classes that may affect facets.

---

## Key Classes & Structure

- `.facets-container` — Main container for all facet/filter UI.
- `.mobile-facets.gradient.facets-unified` — Main filter/sort UI, used everywhere (not just mobile).
- `.mobile-facets__main.facets-unified__main` — Main content area for filter/sort UI.
- `.mobile-facets__submenu.gradient.facets-unified__submenu` — Overlay/drawer for filter/sort options (retains dark background).
- `.mobile-facets__filter-item`, `.mobile-facets__sort-item` — Individual filter and sort controls.

---

## Important Code References

### 1. Template Rendering
- In `main-collection-product-grid.liquid`, only the unified mobile-facets filter is rendered for all screen sizes:
  ```liquid
  {% render 'facets',
    results: collection,
    enable_filtering: section.settings.enable_filtering,
    enable_sorting: section.settings.enable_sorting,
    filter_type: 'drawer',
    paginate: paginate
  %}
  ```

### 2. Facet Markup
- In `facets.liquid`, all markup for the unified filter/sort UI is contained within:
  ```html
  <form id="FacetFiltersFormUnified" class="mobile-facets gradient facets-unified">
    <div id="FacetsWrapperUnified" class="mobile-facets__main facets-unified__main">
      ...
    </div>
  </form>
  ```

### 3. Facet CSS
- In `component-facets.css`, all facet-related code is grouped and clearly commented.
- Overlay/drawer retains a dark background via `.mobile-facets__submenu.gradient`.
- Always-visible filter UI is forced transparent via:
  ```css
  .mobile-facets,
  .facets-unified,
  .mobile-facets__main,
  .facets-unified__main {
    background: none !important;
    background-color: transparent !important;
  }
  ```

---

## [2025-04-21] Review & Refactor: assets/component-facets.css

- The facets/filter design CSS has been fully consolidated into the `assets/component-facets.css` file.
- All `.mobile-facets`-related rules are now organized inside the unified section, making maintenance and updates easier.
- There are no more relevant facet/filter styles outside this unified section.

**Action:**
- If you make any changes to the filter/facet UI, always update the unified section in `component-facets.css`.

---

## [2025-04-21] Review & Refactor: snippets/facets.liquid

- **What was done:**
  - Added clear, visually distinctive in-line comment dividers to `snippets/facets.liquid` to mark the start/end of major facets-related sections (main facets logic, JavaScript, styles).
  - No changes were made to any logic, UI, or functionality—only comments were added for clarity.
- **Why:**
  - To improve code maintainability and readability for future developers and reviewers.
  - Dividers make it easy to identify facet-related code blocks and understand the file’s structure at a glance.
- **Best practices reinforced:**
  - Always use non-intrusive, in-line comments for separation when refactoring for clarity.
  - Avoid any code, UI, or logic changes unless required by the task.
- **How to verify:**
  - Open `snippets/facets.liquid` and confirm that new in-line comment dividers are present.
  - All site functionality and styles should remain unchanged.
- **Other notes:**
  - This approach matches the divider/comment style used in `assets/component-facets.css` for consistency across the codebase.

---

## [2025-04-21] Review & Refactor: sections/main-collection-product-grid.liquid

- **What was done:**
  - Added clear, visually distinctive in-line comment dividers to `sections/main-collection-product-grid.liquid` to mark the start/end of major code blocks (stylesheet/script includes, inline styles, main section container, JavaScript, additional inline styles, section schema).
  - No changes were made to any logic, UI, or functionality—only comments were added for clarity and maintainability.
- **Why:**
  - To improve code maintainability and readability for future developers and reviewers.
  - Dividers make it easy to identify code blocks and understand the file’s structure at a glance.
- **Best practices reinforced:**
  - Always use non-intrusive, in-line comments for separation when refactoring for clarity.
  - Avoid any code, UI, or logic changes unless required by the task.
- **How to verify:**
  - Open `sections/main-collection-product-grid.liquid` and confirm that new in-line comment dividers are present.
  - All site functionality and styles should remain unchanged.
- **Other notes:**
  - This approach matches the divider/comment style used in other facets-related files for consistency across the codebase.

---

## Checklist: Other Files to Review

- [X] `sections/main-collection-product-grid.liquid` — Main template for the collection page, renders the filter/sort UI and product grid.
- [X] `snippets/facets.liquid` — Contains markup and logic for the unified filter/sort UI.
- [ ] `assets/base.css` — General CSS, variables, and utility classes that may affect facets.

**Tip:**
- Review these files when updating or troubleshooting the facets/filter system to ensure consistency across markup, logic, and style.

---

## Maintenance Tips
- To update the filter/sort UI, edit `snippets/facets.liquid` for markup and `assets/component-facets.css` for styling.
- If you see a dark background on the always-visible filter UI, check for global background variables in `base.css` and ensure the transparency fix is present in `component-facets.css`.
- For additional filter/sort logic, leverage existing patterns in `facets.liquid` and avoid duplicating code.
- Test changes on both desktop and mobile to ensure consistency.

---

## [2025-04-21] Cleanup: Removal of Unused Facet CSS

- **What was done:**
  - Removed all unused CSS rules for `.mobile-facets__highlight` and `.mobile-facets__footer` (including related descendant selectors) from `assets/component-facets.css`.
- **Why:**
  - These selectors were not referenced in any markup, JavaScript, or other files in the codebase, and are confirmed to be legacy/dead code.
  - Removing them improves code maintainability and cleanliness with no risk to UI or functionality.
- **How to verify:**
  - The filter/facet UI should look and function exactly the same on all pages and devices. There should be no visible change. If any difference is noticed in the filter/facet area, please review and report.

---

## Contact
For further questions or to onboard new maintainers, direct them to this documentation and the listed files above.
