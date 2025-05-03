# Brand Hover-Over Gold Effect — Technical Implementation Guide

## Purpose
This document provides a detailed, technical reference for implementing the signature "hover-over gold" interactive effect used in the variant picker. The goal is to enable senior developers to apply this effect consistently across other interactive UI components throughout the website, maintaining a luxe, brand-consistent user experience.

---

## Brand Gold Accent
- **Primary Gold:** `#f0d080` (CSS variable: `--brand-accent`)
- **Gold Glow:** `rgba(240,208,128,0.16)` (CSS variable: `--brand-accent-glow`)
- **White (default border/caret):** `#fff` (CSS variable: `--brand-outline`)

These are defined in `:root` in `assets/component-product-variant-picker.css` and referenced throughout the codebase for consistency.

---

## CSS Implementation (Reference: `assets/component-product-variant-picker.css`)

### 1. Base State (Default)
- **Border:**
  ```css
  .select--combo {
    border: 1.5px solid var(--brand-outline, #fff); // Default border is white
    /* ... */
  }
  /*
    For quantity input and other luxe interactive controls, the default border should also be white:
    .quantity {
      border: 2px solid var(--brand-outline, #fff); // Default border is white
    }
  */
  ```
- **Caret (SVG Arrow):**
  ```css
  .product-form__input--combo-dropdown .svg-wrapper svg {
    color: var(--brand-outline, #fff) !important;
    fill: var(--brand-outline, #fff) !important;
    stroke: var(--brand-outline, #fff) !important;
  }
  ```
- **Picker Value:**
  ```css
  .select__select--combo {
    color: #fff;
    font-weight: 600;
    text-shadow: none;
  }
  ```
- **Label:**
  ```css
  .product-form__input--combo-dropdown .form__label {
    color: #fff;
    font-weight: 700;
  }
  ```

### 2. Hover/Focus State (Gold Effect)
- **Border & Box-Shadow:**
  ```css
  .product-form__input--combo-dropdown:hover .select--combo,
  .product-form__input--combo-dropdown:focus-within .select--combo {
    border-color: var(--brand-accent, #f0d080);
    box-shadow: 0 0 0 2px var(--brand-accent), 0 0 8px 2px var(--brand-accent-glow);
    border-radius: 16px;
    background-color: rgba(240,208,128,0.06);
    /* No transformation or scaling should be applied. */
    transform: none !important;
  }
  .select--combo::after {
    /* No transform/scale effect */
    transform: none !important;
  }
  ```
- **Caret (SVG Arrow) on Hover/Focus:**
  ```css
  .product-form__input--combo-dropdown:hover .svg-wrapper svg,
  .product-form__input--combo-dropdown:focus-within .svg-wrapper svg {
    color: var(--brand-accent) !important;
    fill: var(--brand-accent) !important;
    stroke: var(--brand-accent) !important;
    /* No transform/scale effect. */
  }
  ```
- **Picker Value:**
  ```css
  .product-form__input--combo-dropdown:hover .select__select--combo,
  .product-form__input--combo-dropdown:focus-within .select__select--combo {
    color: var(--brand-accent);
    text-shadow: 0 0 2px var(--brand-accent-glow);
  }
  ```
- **Label (Subtle Glow):**
  ```css
  .product-form__input--combo-dropdown:hover .form__label,
  .product-form__input--combo-dropdown:focus-within .form__label {
    font-weight: 600;
    text-shadow: 0 0 2px var(--brand-accent-glow);
  }
  ```

### 3. Animated Effects
- **Pulse and Glow:**
  - Uses `::before` and `::after` pseudo-elements on `.select--combo` for a radial gold glow and pulse effect.
  - Example:
    ```css
    .select--combo::before { /* pulse effect */ }
    .select--combo::after { /* gold glow */ }
    .product-form__input--combo-dropdown:hover .select--combo::before,
    .product-form__input--combo-dropdown:focus-within .select--combo::before {
      opacity: 1;
      animation: pickerPulse 0.7s cubic-bezier(0.4,0,0.2,1);
    }
    ```

---

## Implementation Notes for Future LLM/AI Developers

- The hover-over gold effect is implemented using only border color, box-shadow, and background-color transitions. No transform or scaling is used for any part of the interactive control.
- For `.select--combo`, `.quantity`, and similar luxe controls, the border and glow are managed either directly or via pseudo-elements (`::after`).
- Child elements (such as buttons or SVG icons) must **not** have their own border, outline, or transform on hover/focus.
- The effect is implemented in `assets/component-product-variant-picker.css` and `assets/component-product-quantity-input.css`.
- For any new section or button, follow this pattern:
  - Use a single border (preferably via `::after` for flexibility).
  - Animate only border color, box-shadow, and background-color.
  - Do not use transform/scale/rotate for hover/focus effects.

**Note:**
> As a best practice for the brand, we do **not** wish for any transformation or scaling effects (e.g., `scale`, `rotate`, or `transform`-based animations) to be applied to borders, containers, or SVG elements on hover/focus for luxe interactive controls. Only border color, box-shadow, and background-color should animate.

---

## ⚠️ Warning for Persistent Opaque White Borders

If you encounter a persistent opaque white border (especially on the quantity input or similar UI elements) that does not go away after editing border properties in component CSS, **check for box-shadow rules in `base.css`**. Some box-shadow properties in `base.css` (often applied via pseudo-elements or input wrappers) can create the appearance of an extra border, even if border-color is set to transparent or removed. Disabling or modifying these box-shadow styles in `base.css` can resolve the issue.

> **Tip:** Use browser DevTools to inspect computed styles and locate any unexpected box-shadow properties that may be causing the border effect.

---

## Example: Applying the Brand Hover-Over Gold Effect to Another Component

Suppose you want to apply the same effect to a custom button or card:

```css
.button--brand-hover {
  border: 2px solid var(--brand-outline, #fff);
  background: rgb(var(--color-background));
  color: #fff;
  transition: border-color 0.22s cubic-bezier(0.4,0,0.2,1), box-shadow 0.22s cubic-bezier(0.4,0,0.2,1);
}
.button--brand-hover:hover,
.button--brand-hover:focus {
  border-color: var(--brand-accent, #f0d080);
  box-shadow: 0 0 0 2px var(--brand-accent-glow, rgba(240,208,128,0.16));
  background-color: rgba(240,208,128,0.06);
  /* No transform or scale here! */
  transform: none !important;
}
```

---

## JavaScript Integration (Reference: `assets/picker-focus.js`)
- Uses event delegation to listen for `focus` and `blur` on `<select>` elements within `.select--combo`.
- Adds/removes `.is-focused` class on the container to trigger custom focus outline and gold effect.
- Example:
  ```js
  document.addEventListener('focus', function(event) {
    if (event.target.matches('.select--combo select')) {
      event.target.closest('.select--combo').classList.add('is-focused');
    }
  }, true);
  document.addEventListener('blur', function(event) {
    if (event.target.matches('.select--combo select')) {
      event.target.closest('.select--combo').classList.remove('is-focused');
    }
  }, true);
  ```

---

## Usage Guidelines
- **Always define gold and white as CSS variables in `:root` for consistency.**
- **Apply the hover/focus gold effect to both border and caret for a unified look.**
- **Use event delegation in JS for robust focus management, especially when DOM is dynamic.**
- **Use pseudo-elements for layered glow and pulse effects, keeping markup clean.**
- **For accessibility:**
  - Ensure the gold outline appears on the container, not just the native `<select>`, for clarity and compliance.
  - Use sufficient border-radius and contrast for visual clarity.

---

## References
- `assets/component-product-variant-picker.css`
- `assets/picker-focus.js`
- `snippets/product-variant-picker.liquid`
- `brand-colour.md`

For questions or further implementation support, consult the codebase or reach out to the frontend team.
