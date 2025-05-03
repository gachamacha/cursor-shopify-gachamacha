# Product Column Controls in Shopify Sections

## Overview
This document explains how the "Columns on desktop" (and mobile) feature is implemented in the `featured-collection.liquid` (New Arrivals) section of this Shopify theme. It covers the structure, settings, CSS, and logic that allow users to control the number of product columns via the Shopify UI.

---

## 1. Code Structure for Product Grid Columns

- **Section Structure:**
  - `.page-width`
    - `.title.title--primary` — section heading
    - `ul.collection-list.grid.grid--{columns_desktop}-col-desktop.grid--{columns_mobile}-col-tablet-down`
      - `li.collection-list__item.grid__item` (one per product)
        - `{% render 'card-product', ... %}`

- **Class Logic:**
  - The `ul` element uses dynamic class names:
    - `grid--{{ section.settings.columns_desktop }}-col-desktop`
    - `grid--{{ section.settings.columns_mobile }}-col-tablet-down`
  - These classes determine the number of columns in the grid for desktop and mobile/tablet.

---

## 2. Shopify UI: User-Controlled Settings

- **Settings Schema** (from the `{% schema %}` block):
  - Desktop columns:
    ```json
    {
      "type": "range",
      "id": "columns_desktop",
      "min": 1,
      "max": 6,
      "step": 1,
      "default": 3,
      "label": "Columns on desktop"
    }
    ```
  - Mobile columns:
    ```json
    {
      "type": "select",
      "id": "columns_mobile",
      "options": [
        { "value": "1", "label": "1" },
        { "value": "2", "label": "2" }
      ],
      "default": "2",
      "label": "Columns on mobile"
    }
    ```
- **How it works:**
  - Merchants select the desired number of columns in the Shopify theme editor (customizer).
  - The chosen value is injected into the section as `section.settings.columns_desktop` and `section.settings.columns_mobile`.
  - The grid class updates accordingly, changing the layout instantly.

---

## 3. CSS Styles Involved

- **Grid Classes:**
  - The theme uses BEM-style classes for column control:
    - `grid--1-col-desktop`, `grid--2-col-desktop`, ..., `grid--6-col-desktop`
    - `grid--1-col-tablet-down`, `grid--2-col-tablet-down`, etc.
  - These classes are defined in `assets/base.css`:
    ```css
    @media screen and (min-width: 990px) {
      .grid--6-col-desktop .grid__item { width: calc(16.66% - var(--grid-desktop-horizontal-spacing) * 5 / 6); }
      .grid--5-col-desktop .grid__item { width: calc(20% - var(--grid-desktop-horizontal-spacing) * 4 / 5); }
      .grid--4-col-desktop .grid__item { width: calc(25% - var(--grid-desktop-horizontal-spacing) * 3 / 4); }
      .grid--3-col-desktop .grid__item { width: calc(33.33% - var(--grid-desktop-horizontal-spacing) * 2 / 3); }
      .grid--2-col-desktop .grid__item { width: calc(50% - var(--grid-desktop-horizontal-spacing) / 2); }
      .grid--1-col-desktop .grid__item { width: 100%; }
    }
    @media screen and (max-width: 989px) {
      .grid--1-col-tablet-down .grid__item { width: 100%; }
      .grid--2-col-tablet-down .grid__item { width: calc(50% - var(--grid-mobile-horizontal-spacing) / 2); }
    }
    ```
  - The grid layout is fully responsive and adapts to the merchant's settings.

- **Other CSS Files:**
  - `assets/component-card.css` — for card/product styling
  - `assets/section-collection-list.css` — for collection grid styling (if present)

---

## 4. Files and Elements Involved

- **Liquid Section:**
  - `sections/featured-collection.liquid` — contains the settings, markup, and logic for the grid
- **CSS:**
  - `assets/base.css` — core grid system and responsive styles
  - `assets/component-card.css` — product card visuals
  - `assets/section-collection-list.css` — collection-specific grid tweaks
- **Key Elements/Classes:**
  - `.grid`, `.grid__item`, `.grid--X-col-desktop`, `.grid--X-col-tablet-down`, `.collection-list`, `.collection-list__item`
- **JS:**
  - No direct JS is needed for column control; it is handled by Liquid and CSS only.

---

## 5. Summary of Implementation Logic

- The number of columns is controlled by the merchant via the Shopify theme editor.
- The selected values are injected as class names into the grid container.
- CSS rules for these classes ensure the correct number of columns and full responsiveness.
- The solution is simple, dynamic, and does not require JavaScript.
- All logic is contained within the section's schema, markup, and the main CSS grid system.

---

## 6. Example Snippet

```liquid
<ul
  class="collection-list grid grid--{{ section.settings.columns_desktop }}-col-desktop grid--{{ section.settings.columns_mobile }}-col-tablet-down"
  role="list"
>
  ...
</ul>
```

---

## 7. Coding Priorities Satisfied
- No duplication or override; leverages existing grid system
- Fully responsive and dynamic
- No new patterns or unnecessary complexity
- Works for both desktop and mobile
- All logic is context-aware and contained within the section and core CSS

---

## 8. References
- `sections/featured-collection.liquid`
- `assets/base.css`
- `assets/component-card.css`
- `assets/section-collection-list.css`

---

This documentation should help any developer understand and extend the product column controls in this Shopify theme.
