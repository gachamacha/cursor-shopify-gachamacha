# Variant Picker — Technical Documentation

## Overview
This documentation provides a comprehensive reference for the Variant Picker feature, which enables users to select product variants (such as size, color, or combo options) on the product page. The implementation ensures a seamless, accessible, and brand-consistent experience, with advanced focus styles, selection feedback, and modular integration with Shopify's theme system.

---

## Relevant Files

### 1. Markup & Structure
- **snippets/product-variant-picker.liquid**
  - Renders the variant picker UI and injects supporting scripts. Handles both swatch and combo dropdowns, and includes the caret SVG inline.

### 2. Styling
- **assets/component-product-variant-picker.css**
  - Styles for the variant picker container, dropdown, focus-visible state, and responsive adjustments.
  - **Default border and caret color is white**; on hover/focus, both become luxe gold (`#f0d080`).
  - Label is bold and white by default; picker value is white by default and gold on hover/focus.
  - Includes advanced interactive feedback: gold glow, pulse, and selection feedback animations.
- **assets/base.css**
  - Contains global input and label styles, including hover and focus rules that may affect the picker.

### 3. Interactive Behavior (JavaScript)
- **assets/picker-focus.js**
  - Handles focus/blur events to apply custom focus-visible outline to the picker container.
  - Uses event delegation for focus and blur events, ensuring the focus outline logic works even if pickers are dynamically replaced or re-rendered in the DOM. This makes the focus styling robust, accessible, and reliable in all scenarios.
- **assets/picker-selection-feedback.js**
  - Handles selection feedback animation when a user changes the variant.
  - Uses event delegation for change and animationend events, making the animation logic robust to dynamic DOM updates.

### 4. Brand & Design Reference
- **brand-colour.md**
  - Documents the luxe-gold accent color (`#f0d080`) and brand color guidance. Also specifies white (`#fff`) as a core brand color for text, borders, and backgrounds.

---

## Feature Highlights

- **Accessible Focus Styles:**
  - **Default border and caret are white** for clarity and contrast. On hover/focus, a luxe-gold (`#f0d080`) outline/glow appears around the picker container and caret, matching the border-radius and brand guidelines.
  - JavaScript ensures the outline appears on the container, not just the native `<select>`, for full accessibility and cross-browser consistency.

- **Selection Feedback Animation:**
  - When a user selects a new variant, the picker container briefly flashes with a luxe-gold background color for clear, immediate feedback. The label also animates with a gold glow and bold font-weight.

- **Label and Value Styling:**
  - The label is bold and white by default, with a gold glow on hover/focus.
  - The picker value is white by default, turning luxe gold on hover/focus for a premium, interactive effect.
  - The caret (dropdown arrow) matches the border color: white by default, gold on hover/focus.

- **Robust and Modular:**
  - All interactive behavior uses event delegation for resilience to dynamic DOM changes.
  - CSS custom properties (`--brand-accent`, `--brand-outline`, `--picker-transition`) allow easy theme adjustments.

---

## Recent Changes (as of May 2025)
- Default border and caret color changed from gold to white; gold now appears only on hover/focus.
- Combo label is now bold and white by default.
- Picker value is white by default, gold on hover/focus.
- All interactive feedback and transitions are preserved for a luxe, accessible experience.

---

## Notes
- Update this documentation if you further change the color schemes, focus logic, or interactive feedback behaviors.
- Refer to `brand-colour.md` for the latest brand palette and usage guidance.

---

## Implementation Details

### 1. Liquid Snippet
**File:** `snippets/product-variant-picker.liquid`
- Renders the variant picker markup and label.
- Injects `picker-focus.js` and `picker-selection-feedback.js` scripts for interactive features.

### 2. Picker Container Styling
**File:** `assets/component-product-variant-picker.css`
- `.select--combo` defines the main picker container, with border-radius and no default border.
- `.select--combo.is-focused` and related rules apply the luxe-gold outline (via box-shadow) on focus/hover.
- `.select--combo.selection-feedback` triggers the background color animation on selection.
- Responsive adjustments for mobile via media queries.

### 3. Focus Management Script
**File:** `assets/picker-focus.js`
- Listens for focus/blur on `<select>` elements inside `.select--combo`.
- Adds/removes `.is-focused` class on the container to trigger custom focus outline.

### 4. Selection Feedback Script
**File:** `assets/picker-selection-feedback.js`
- Listens for `change` events on variant `<select>`.
- Toggles `.selection-feedback` class on `.select--combo` to trigger CSS animation.
- Uses `animationend` event to remove the class, ensuring the animation can replay on every selection.

### 5. Global Styles
**File:** `assets/base.css`
- Contains global rules for input hover/focus, label highlighting, and color variables.
- Ensures no conflicts with variant picker’s modular styles.

### 6. Brand Color Reference
**File:** `brand-colour.md`
- Documents the luxe-gold (`#f0d080`) accent color and its usage across the theme.

---

## Known Issues & Implementation Notes

### CSS Animation Repeatability Issue
- **Issue:**
  - There were persistent challenges ensuring that the CSS-based background color feedback animation (`.selection-feedback`) reliably replayed every time the user changed the variant selection.
  - This was due to browser behavior: removing and re-adding a class does not always restart a CSS animation if the animation property does not change or if the animation is still running.

- **Fix Implemented (2025-04-30):**
  - The JavaScript logic has been refactored to use **event delegation** for both `change` and `animationend` events.
  - Instead of attaching event listeners directly to each picker at page load, listeners are now attached at the document level. This ensures that the animation logic always works, even if the picker is dynamically replaced or re-rendered (e.g., via AJAX, Shopify dynamic sections, or JavaScript frameworks).
  - On every variant selection change, the script removes and re-adds the `.selection-feedback` class (with a forced reflow) to reliably trigger the CSS animation. The class is removed again on `animationend` so the animation can replay on subsequent changes.
  - Debug logging is included for troubleshooting.

- **Why this works:**
  - Event delegation ensures that all current and future variant pickers are covered by the animation logic, regardless of how or when they are added to the DOM. This resolves issues where the animation would stop working after dynamic updates.

- **Caveats:**
  - If the animation still does not repeat, check for CSS specificity conflicts or if the `.select--combo` structure is changed.
  - The current solution is modular, maintainable, and robust against browser quirks and dynamic content updates.

- **Status:**
  - _Resolved as of 2025-04-30. The feedback animation now works reliably, including after dynamic DOM updates._

---

## Accessibility & UX Considerations
- Focus styles are visible and high-contrast for keyboard users.
- Feedback animation provides immediate confirmation of selection.
- All effects are tested for responsiveness and cross-browser compatibility.

---

## [UPDATED: 2025-04-30] Hierarchical Structure & Technical Reference for Variant Picker
- Modular, extensible, and easily maintainable for future enhancements.
- All changes are documented and follow the brand’s design and accessibility guidelines.

---

## Future Improvements
- Support for additional picker types (e.g., swatch, radio).
- Customizable animation duration and color via CSS variables.
- Enhanced accessibility features for screen readers.

---

*For further details or to extend this component, refer to the source files listed above or contact the theme maintainers.*
