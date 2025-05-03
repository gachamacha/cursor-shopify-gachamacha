# Quantity Input Documentation

## Overview
The quantity input component allows users to adjust the quantity of a product before adding it to the cart. This component is designed for seamless integration with the Shopify cart system and is styled to match the luxe, premium brand aesthetic. It supports both desktop and mobile interactions and enforces product-specific quantity rules.

---

## 1. Code Structure

### Liquid Snippet: `snippets/quantity-input.liquid`
- **Purpose:** Renders the quantity input UI for a given product variant.
- **Key Elements:**
  - `<quantity-input>` custom element as the root.
  - Two buttons (`minus`, `plus`) for decrementing/incrementing quantity.
  - `<input type="number">` for direct quantity entry, with min/max/step attributes.
  - Inline SVGs for button icons.
  - Progress bar rendered below the input.
- **Usage Example:**
  ```liquid
  {% render 'quantity-input' variant: variant %}
  ```
- **Accessibility:**
  - Uses visually hidden text for screen readers.
  - ARIA labels for input.

---

## 2. JavaScript Behavior

### `QuantityInput` Class (`assets/global.js`)
- **Registration:** Registered as a custom element (`customElements.define('quantity-input', QuantityInput)`).
- **Key Methods:**
  - Handles click events on plus/minus buttons and input changes.
  - Validates against min/max/increment rules from product data.
  - Dispatches change events to update the cart in real time.
  - Provides feedback for invalid entries (e.g., disables buttons, highlights errors).
- **Integration:**
  - Works with the `ProductInfo` class in `product-info.js` to update quantity rules dynamically based on selected variant.

---

## 3. Styling

### CSS (`assets/base.css`)
- **Root Class:** `.quantity`
  - Flex container for layout.
  - Custom border, background, and shadow for premium feel.
  - Responsive width and min-height.
- **Input:** `.quantity__input`
  - Inherits font and color styles.
  - Min/max/step styling for accessibility and clarity.
- **Buttons:** `.quantity__button`
  - Styled for touch and mouse interaction.
  - Inline SVG icons for plus/minus.
- **Focus & Feedback:**
  - Uses CSS transitions for smooth focus/hover effects.
  - Error states visually indicated.

### Popover & Volume Pricing (`assets/quantity-popover.css`)
- **Popover:**
  - `.quantity-popover__info` for contextual quantity rules or volume pricing.
  - Responsive and accessible, with close button and keyboard/focus support.

---

## 4. Interactive Behavior

- **Increment/Decrement:**
  - Buttons adjust the value within allowed range.
  - Input field allows direct entry, validated on change.
- **Dynamic Rules:**
  - Min/max/step pulled from product variant data and updated dynamically.
  - Progress bar and popover update accordingly.
- **Accessibility:**
  - ARIA labels, keyboard navigation, and visually hidden text ensure usability for all users.

---

## 5. Relevant Files

### 1. Markup & Structure
- **snippets/quantity-input.liquid**  
  Renders the quantity input UI for a given product variant. Includes the custom element, plus/minus buttons, input, and progress bar.

### 2. Styling
- **assets/base.css**  
  Core styles for the quantity input, including layout, borders, background, and transitions.
- **assets/quantity-popover.css**  
  Styles for the quantity popover, including volume pricing and info popups.

### 3. Interactive Behavior (JavaScript)
- **assets/global.js**  
  Defines the `QuantityInput` custom element, handling increment/decrement, validation, and event dispatching.
- **assets/product-info.js**  
  Handles variant changes and updates quantity rules, integrating with the quantity input.
- **assets/quantity-popover.js**  
  Defines the popover behavior for displaying contextual info or volume pricing.

### 4. Brand & Design Reference
- **brand-colour.md**  
  Documents brand color usage, including gold accents and core brand colors for consistency across interactive elements.

---

## 6. Design & Brand Consistency

- Uses CSS variables for color, border, and transition timing to maintain brand consistency.
- Animations and focus states match those of the variant picker and other interactive elements.
- Designed for a luxe, premium look with gold accents and smooth transitions where appropriate.

---

## 7. Accessibility & UX

- Focus outlines, ARIA roles/labels, and screen reader text included.
- Touch target sizes and keyboard navigation tested for usability.
- Error and feedback states clearly indicated visually and via ARIA attributes.

---

## 8. Example Markup
```liquid
<quantity-input class="quantity cart-quantity">
  <button class="quantity__button" name="minus" type="button">...</button>
  <input class="quantity__input" ... />
  <button class="quantity__button" name="plus" type="button">...</button>
  {%- render 'progress-bar' -%}
</quantity-input>
```

---

## 9. References
- [Variant Picker Documentation](./variant-picker.md)
- [Brand Hover Effect](./brand-hover-over.md)
- [Brand Colors](./brand-colour.md)

---

## 10. Future Improvements
- Consider adding animated feedback for invalid input.
- Explore additional volume pricing UI enhancements.
- Continue to align with evolving brand and accessibility standards.

---

_Last updated: {{DATE}}_
