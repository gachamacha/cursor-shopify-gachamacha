# section-main-product.css, product-media.css & product-info-panel-gold-luxe.css Documentation

## Overview
This document provides a concise overview of the main product section stylesheet (`assets/section-main-product.css`), its modularised mobile/responsive counterpart (`assets/product-media.css`), and the newly modularised Gold Luxe info panel design (`assets/product-info-panel-gold-luxe.css`) for the Shopify theme.

---

## assets/section-main-product.css

### Purpose
- The primary stylesheet for the product section, responsible for the layout, appearance, and desktop/tablet styling of all product-related components on the product page.

### Key Responsibilities
- **Product Layout:** Grid, spacing, and alignment for product media and info panels.
- **Product Info Panel:** Styles for `.product__info-wrapper`, `.product__info-container`, and themed variants.
- **Product Forms & Buttons:** Styles for add-to-cart, payment buttons, and their states.
- **Product Badges & Price:** Custom styles for price and promotional badges.
- **Image & Gallery:** Product image, magnification, and gallery layout styles.
- **Quantity, Variants, and Selectors:** Styling for selectors and input fields.
- **Accessibility:** Focus and outline states for interactive elements.
- **Miscellaneous:** Utility classes and critical overrides for layout precision.

### Modularisation
- All mobile/tablet responsive CSS (e.g., `@media (max-width: 989px)`, `@media (max-width: 749px)`, `@media (max-width: 600px)`) has been migrated to `assets/product-media.css` for better maintainability and clarity.
- **NEW:** All Gold Luxe info panel design styles (`.info-panel--gold-luxe-outline.product__info-wrapper` and descendants) have been migrated to `assets/product-info-panel-gold-luxe.css` for improved modularity and easier maintenance of design variants.

---

## assets/product-media.css

### Purpose
- Contains all mobile and tablet responsive styles previously in `section-main-product.css`.
- Ensures product sections are visually optimised for smaller screens and touch devices.

### Key Responsibilities
- **Responsive Layout:** Adjusts product grid, panels, and containers for mobile/tablet widths.
- **Button & Form Responsiveness:** Ensures buttons and forms are centered, full-width, and touch-friendly.
- **Typography & Spacing:** Scales font sizes and padding for readability and usability on small screens.
- **Price Badge Responsiveness:** Adjusts badge and price styles for mobile devices.
- **Component Adaptation:** Ensures all product components adapt smoothly to mobile/tablet breakpoints.

### Usage
- `product-media.css` must be referenced in your Liquid section/layout files alongside `section-main-product.css`:
  ```liquid
  {{ 'section-main-product.css' | asset_url | stylesheet_tag }}
  {{ 'product-media.css' | asset_url | stylesheet_tag }}
  ```
- Place `product-media.css` after `section-main-product.css` to ensure responsive overrides are applied correctly.

---

## assets/product-info-panel-gold-luxe.css

### Purpose
- Contains all styles for the Gold Luxe info panel design variant, previously in `section-main-product.css`.
- Allows for isolated, maintainable updates to the Gold Luxe design without affecting other product info panel styles.

### Key Responsibilities
- **Panel Container:** Layout, border, background, and shadow for `.info-panel--gold-luxe-outline.product__info-wrapper`.
- **Typography:** Title and text styling for Gold Luxe panels.
- **Dividers:** Custom divider and sale divider styles.
- **Buttons:** Add-to-cart and payment button customisation, including hover/focus effects.
- **Design-specific overrides:** Any Gold Luxe-specific tweaks and enhancements.

### Usage
- Reference this file in your Liquid section/layout files **after** `section-main-product.css` and `product-media.css` when the Gold Luxe design is needed:
  ```liquid
  {{ 'section-main-product.css' | asset_url | stylesheet_tag }}
  {{ 'product-media.css' | asset_url | stylesheet_tag }}
  {{ 'product-info-panel-gold-luxe.css' | asset_url | stylesheet_tag }}
  ```
- Only include this file if the Gold Luxe panel is required for the product/page.

---

## assets/product-info-panel-plum-glass.css

### Purpose
- Contains all styles for the Plum Glass Minimal info panel design variant, previously in `section-main-product.css`.
- Allows for isolated, maintainable updates to the Plum Glass design without affecting other product info panel styles.

### Key Responsibilities
- **Panel Container:** Layout, border, background, shadow, and blur for `.info-panel--plum-glass-minimal.product__info-wrapper`.
- **Typography:** Title and text styling for Plum Glass panels.
- **Dividers:** Custom divider styles.
- **Buttons:** Add-to-cart and payment button customisation, including hover/focus/ripple effects.
- **Keyframes:** Ripple animation for button click feedback.
- **Design-specific overrides:** Any Plum Glass-specific tweaks and enhancements.

### Usage
- Reference this file in your Liquid section/layout files **after** `section-main-product.css` and `product-media.css` when the Plum Glass design is needed:
  ```liquid
  {{ 'section-main-product.css' | asset_url | stylesheet_tag }}
  {{ 'product-media.css' | asset_url | stylesheet_tag }}
  {{ 'product-info-panel-plum-glass.css' | asset_url | stylesheet_tag }}
  ```
- Only include this file if the Plum Glass panel is required for the product/page.

---

## assets/product-media-modal.css

### Purpose
- Contains all modularised styles for the Product Media Modal, previously in `section-main-product.css`.
- Ensures modal overlay, dialog, content, and toggle controls are visually isolated and fully responsive.

### Key Responsibilities
- **Modal Container:** Layout, positioning, and visibility for `.product-media-modal` and its open/close states.
- **Dialog & Content:** Responsive centering, scroll, and full-viewport display for modal content.
- **Toggle & Controls:** Styles for modal openers, toggles, and close buttons, including accessibility and hover/focus states.
- **No Media State:** Special cases for products with no media.

### Usage
- Reference this file in your Liquid section/layout files **after** `section-main-product.css` and `product-media.css`:
  ```liquid
  {{ 'section-main-product.css' | asset_url | stylesheet_tag }}
  {{ 'product-media.css' | asset_url | stylesheet_tag }}
  {{ 'product-media-modal.css' | asset_url | stylesheet_tag }}
  ```
- Ensures all modal-related UI is styled consistently and responsively.

---

## Main Product Info Panel: HTML & Component Structure

### Overview
This section documents the structure and behavior of the main product info panel as rendered in the Shopify theme. It covers the key HTML elements, their purpose, dynamic behaviors, accessibility considerations, and references to relevant CSS and JS modules.

---

### 1. Code Structure

#### Main Container
- `<div class="product__info-scale-wrapper">` — Outer wrapper for the product info section.
- `<section class="product__info-container product__column-sticky">` — Main info panel container, sticky on desktop.

#### Product Title and Metafields
- `.product__metafields` — Displays product tags or extra info (e.g., "Wuthering Waves • NA").
- `.product__title` — Contains the main product title (`<h1>`) and optionally a linked variant title (`<h2>`).

#### Price & Badges
- `.price-badge--champagne-card` — Wrapper for price and promotional/sale badges.
- `.price` — Regular and sale price display, including visually hidden labels for accessibility.
- `.badge.price__badge-sale` / `.badge.price__badge-sold-out` — Sale and sold-out badges.

#### Product Form
- `<form ... id="product-form-installment-...">` — Hidden form for installment/payment integrations.
- `<form ... id="product-form-...">` — Main add-to-cart form, with hidden inputs for product/variant IDs.

#### Variant Picker
- `<variant-selects ...>` — Custom element wrapping variant dropdowns.
- `.product-form__input--combo-dropdown` — Combo/variant selector with `<select>` and options.
- `<script type="application/json" data-selected-variant>...</script>` — Holds the selected variant data for dynamic updates.
- JS updates the selected variant based on dropdown changes.

#### Quantity Input
- `.product-form__quantity` — Quantity input field, using the `<quantity-input>` custom element (see: [main-product-quantity-input.md]).
- Plus/minus buttons and direct input, with live cart quantity feedback.

#### Add to Cart & Payment
- `.product-form__buttons` — Contains the main add-to-cart button and payment options (Shopify payment button, buy-it-now, etc.).
- Error message wrapper for form validation feedback.

#### Pickup Availability
- `<pickup-availability ...>` — Shows pickup location and status, with refresh button and dynamic content.

#### Product Description
- `.product__description.rte` — Rich text product description, supports HTML and line breaks.

#### Ratings
- `.rating-wrapper` — Contains the star rating, rating value, and review count.

#### View Details Link
- `.product__view-details` — Link to the full product details page.

---

### 2. JavaScript Behavior
- **Variant Selection:** JS updates the selected variant and price when the user changes the dropdown. The selected variant data is stored in a `<script type="application/json">` tag and updated dynamically.
- **Quantity Input:** The `<quantity-input>` web component handles increment/decrement, validation, and dispatches events to update the cart. (See: [main-product-quantity-input.md])
- **Pickup Availability:** JS fetches and displays pickup info dynamically, with error handling and refresh support.
- **Add to Cart:** Handles form submission, error display, and payment integration.

---

### 3. Accessibility
- Uses visually hidden text for screen readers on price and button elements.
- ARIA roles and labels for ratings, price, and modal dialogs.
- All interactive elements (buttons, inputs, selects) are keyboard accessible and follow focus/outline standards.

---

### 4. Styling & Modularisation
- **Desktop/Tablet:** `assets/section-main-product.css` — Layout, spacing, and main panel styling.
- **Responsive/Mobile:** `assets/product-media.css` — All responsive overrides.
- **Gold Luxe/Plum Glass Panels:** `assets/product-info-panel-gold-luxe.css`, `assets/product-info-panel-plum-glass.css` — Themed panel variants.
- **Quantity Input:** See [main-product-quantity-input.md] for detailed styling and behavior.

---

### 5. Usage Example
```liquid
<section id="ProductInfo-..." class="product__info-container ...">
  <div class="product__title">...</div>
  <div id="price-..." class="price-badge--champagne-card">...</div>
  <form id="product-form-...">...</form>
  <variant-selects ...>...</variant-selects>
  <div class="product-form__quantity">...</div>
  <div class="product-form__buttons">...</div>
  <pickup-availability ...></pickup-availability>
  <div class="product__description rte">...</div>
  <div class="rating-wrapper">...</div>
  <a class="product__view-details">...</a>
</section>
```

---

### 6. Related Files & References
- `assets/section-main-product.css`, `assets/product-media.css`, `assets/product-info-panel-gold-luxe.css`, `assets/product-info-panel-plum-glass.css`
- `snippets/quantity-input.liquid` (see: [main-product-quantity-input.md])
- `snippets/product-media-modal.liquid`, `snippets/product-media.liquid`
- `sections/main-product.liquid`
- [main-product-quantity-input.md]

---

This documentation now reflects the actual HTML/component structure and JS behaviors present in the main product info section, and follows the style of [main-product-quantity-input.md].

---

## snippets/product-media-modal.liquid

### Purpose
- Renders the Product Media Modal and its contents for full-screen product media viewing.
- Ensures only the selected media is visible in the modal, with all others hidden.

### Key Responsibilities
- **Modal Structure:** Provides the modal container, dialog, close button, and content area.
- **Active Media Logic:** Dynamically determines which media should be visible based on user interaction or context.
- **Accessibility:** Implements ARIA roles and labels for screen reader support.

### Usage
- Included in the main product section via:
  ```liquid
  {% render 'product-media-modal', product: product, variant_images: variant_images %}
  ```
- Should be paired with the modal opener logic in `product-thumbnail.liquid` and `product-media-gallery.liquid`.

---

## snippets/product-media.liquid

### Purpose
- Renders a single product media item (image, video, 3D model, etc.) inside the modal or gallery.
- Ensures all modal images and media are fully responsive to viewport size.

### Key Responsibilities
- **Responsive Images:** Uses `sizes="100vw"` and `max-width:100vw` for modal images and previews.
- **Media Type Handling:** Handles images, videos, external videos, and 3D models.
- **Accessibility:** Provides appropriate `alt` text and ARIA attributes.

### Usage
- Called by `product-media-modal.liquid` for each media item:
  ```liquid
  {% render 'product-media', media: media %}
  ```

---

## Related Files
- `assets/product-media-modal.css`: All modal styles.
- `snippets/product-media-modal.liquid`: Modal structure and logic.
- `snippets/product-media.liquid`: Responsive media rendering.
- `snippets/product-media-gallery.liquid` and `snippets/product-thumbnail.liquid`: Modal opener logic and gallery integration.
- `sections/main-product.liquid` and `sections/featured-product.liquid`: Section files that include and reference the modal and its styles.

---

## Maintenance Notes
- After verifying the migration and modularisation, ensure that all modal-related code is removed from `section-main-product.css`.
- Always reference `product-media-modal.css` in any section or template that uses the modal.
- Test modal functionality and responsiveness across devices after any update.