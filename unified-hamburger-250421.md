# Unified Hamburger Menu Design — Technical Documentation

## Overview
This documentation summarizes the unified hamburger (menu drawer) implementation for the site header, ensuring consistent design and functionality across all screen sizes (mobile, tablet, desktop).

---

## Relevant Files

- **sections/header.liquid**
  - Main header template, includes the hamburger menu trigger and logic.
- **snippets/header-drawer.liquid**
  - Contains markup for the hamburger menu (menu drawer).
- **assets/global.js**
  - Contains the `MenuDrawer` class and related logic for menu drawer behavior.
- **assets/component-menu-drawer.css**
  - All CSS for the menu drawer, including unified and responsive styles.
- **assets/base.css**
  - General CSS, including variables and utility classes that may affect the menu.
- **assets/component-list-menu.css**
  - Styles for menu lists and items.
- **snippets/header-mega-menu.liquid**
  - For desktop/mega menu; relevant for unified design.
- **locales/zh-TW.json**
  - Contains translations for menu labels.

---

## Key Classes & Structure

- `.header__icon--menu` — Hamburger icon trigger (visible on all devices)
- `.menu-drawer-container` — Main container for the menu drawer
- `.menu-drawer` — Drawer panel
- `.menu-drawer__inner-container` — Inner container for menu content
- `.menu-drawer__navigation-container` — Contains the navigation
- `.menu-drawer__navigation` — Navigation container
- `.menu-drawer__menu` — Main menu list
- `.menu-drawer__menu-item` — Individual menu items
- `.menu-drawer__submenu` — Submenu (nested)
- `.menu-drawer__close-button` — Close button for drawer
- `.header--has-menu`, `.drawer-menu`, `.header--mobile-*` — Header state classes

**Nested Structure Example:**
- `.header` > `.header__icon--menu` (hamburger icon)
- `.menu-drawer-container`
  - `<details>`
    - `<summary class="header__icon--menu ...">` (hamburger icon)
    - `.menu-drawer`
      - `.menu-drawer__inner-container`
        - `.menu-drawer__navigation-container`
          - `.menu-drawer__navigation`
            - `.menu-drawer__menu` (list)
              - `.menu-drawer__menu-item` (item)
                - (optional) `.menu-drawer__submenu` (nested menu)

---

## Important Code References

### 1. Template Rendering
- In `header.liquid`, the hamburger menu is rendered via:
  ```liquid
  {% render 'header-drawer' %}
  ```
- In `header-drawer.liquid`, the main structure is:
  ```html
  <details id="Details-menu-drawer-container" class="menu-drawer-container">
    <summary class="header__icon header__icon--menu ...">
      <span>
        {{ 'icon-hamburger.svg' | inline_asset_content }}
        {{ 'icon-close.svg' | inline_asset_content }}
      </span>
    </summary>
    <div class="menu-drawer">
      ...
    </div>
  </details>
  ```

### 2. JavaScript Logic
- In `global.js`, the `MenuDrawer` class manages open/close behavior, keyboard accessibility, and focus trapping.

### 3. CSS
- In `component-menu-drawer.css`, all menu drawer-related code is grouped and clearly commented.
- Responsive breakpoints ensure the drawer behaves consistently across devices.

---

## Modular Tasks & Subtasks

### Task 1: Audit and Document Hamburger Menu Structure
- **1.1** List all files and classes involved in the hamburger menu (see above).
- **1.2** Map out the nested DOM structure (see above).

### Task 2: Review and Document Menu Rendering Logic
- **2.1** Identify how/where the hamburger menu is rendered in templates.
- **2.2** Document any Liquid/JS logic controlling menu visibility and behavior.

### Task 3: Audit and Document CSS for Menu Drawer
- **3.1** Identify all CSS classes affecting the menu drawer.
- **3.2** Document responsive styles and any breakpoints.

### Task 4: Identify Opportunities for Unification
- **4.1** Compare mobile/tablet/desktop menu implementations.
- **4.2** List any inconsistencies or duplications.
- **4.3** Propose unified structure/classes if needed.

### Task 5: Define Expected Outcomes for Testing
- **5.1** Menu opens and closes smoothly on all devices.
- **5.2** Menu content and layout are consistent (mobile, tablet, desktop).
- **5.3** All navigation links work as expected.
- **5.4** No visual or functional regressions in header/menu.
- **5.5** Submenus and close button work as expected.

---

## Codebase Audit & Cleanup (2025-04-21)

### Summary of Actions

- Systematic audit completed for all files related to the unified hamburger menu:
  - `sections/header.liquid`
  - `snippets/header-drawer.liquid`
  - `assets/global.js`
  - `assets/component-menu-drawer.css`
  - `assets/base.css`
  - `assets/component-list-menu.css`
  - `snippets/header-mega-menu.liquid`
- **Redundant overlay CSS removed:**
  - In `assets/base.css`, a redundant global overlay rule for the hamburger menu was removed. Overlay styling is now only applied on mobile devices, as intended. No changes to functionality or appearance; overlay still appears on mobile and is hidden on desktop/tablet.
- All other files were found to be clean, unified, and free of redundant or legacy code related to the hamburger menu.
- No changes were made to markup or logic in other files, as they already adhered to the unified structure.

### Expected Outcome

- Hamburger menu and navigation continue to work and appear as before on all devices.
- Codebase is now cleaner, easier to maintain, and avoids unnecessary duplication.

---

## Bug Fix Log — Overlay Covers Entire Screen (2025-04-21)

**Issue:**
When opening the hamburger menu on desktop/tablet, a semi-transparent overlay was covering the entire screen, making the rest of the page unclickable and obscured. This overlay should only appear on mobile (where the menu is full width), not on desktop/tablet.

**Root Cause:**
The overlay was created by a CSS pseudo-element: `.header__icon--menu[aria-expanded="true"]::before` in `assets/base.css`. This selector applied a full-screen overlay whenever the hamburger menu was open, regardless of screen size.

**Solution:**
- Restricted the overlay pseudo-element to only apply on mobile (`max-width: 749px`).
- Explicitly hid the overlay on desktop/tablet (`min-width: 750px`).
- No changes were made to JavaScript or markup; the fix is purely CSS and does not affect other overlays, modals, or menu functionality.

**Code Reference:**
```css
@media screen and (max-width: 749px) {
  .header__icon--menu[aria-expanded="true"]::before {
    content: "";
    top: 100%;
    left: 0;
    height: calc(var(--viewport-height, 100vh) - (var(--header-bottom-position, 100%)));
    width: 100%;
    display: block;
    position: absolute;
    background: rgba(var(--color-foreground), 0.5);
  }
}

@media screen and (min-width: 750px) {
  .header__icon--menu[aria-expanded="true"]::before {
    display: none !important;
    content: none !important;
  }
}
```

**Testing/Validation:**
- On desktop/tablet: Opening the hamburger menu no longer overlays the rest of the page; only the menu area is covered.
- On mobile: Overlay remains for UX consistency.
- All other overlays and modals are unaffected.

---

## [2025-04-22] Redundancy and Localization Cleanup
- **Removed Localization Selector Button:**
  - The button with classes `disclosure__button localization-form__select localization-selector link link--text caption-large` was removed from both language and country localization snippets. No impact on hamburger menu styles or functionality.
- **Removed Redundant 'Home' Navigation Item:**
  - The 'Home' navigation item was removed from the hamburger menu navigation, as the logo already links to the homepage. All other navigation items and logic remain intact.

---

## Best Practices Reinforced
- Preserve all existing functionality and styling.
- Prefer simple, dynamic, and responsive solutions.
- Avoid code duplication; leverage existing code patterns.
- Do not introduce new patterns or overrides unless absolutely necessary.
- Ensure changes reflect in both desktop and mobile experiences.
- Avoid creating new components/functions unless absolutely necessary.

---

## How to Verify
- Open the site on mobile, tablet, and desktop.
- Click the hamburger icon; confirm the menu drawer opens and closes smoothly.
- Check that the menu looks and works the same on all devices.
- Test navigation links and submenus.
- Confirm there are no visual or functional issues in the header or menu.
