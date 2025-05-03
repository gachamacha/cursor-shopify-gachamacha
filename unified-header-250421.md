# Unified Header Design — Technical Documentation

## Overview
This documentation summarizes the unified header implementation for the site, ensuring consistent design, functionality, and responsiveness across all screen sizes (mobile, tablet, desktop). The unified header is designed to provide a seamless navigation and branding experience, supporting features such as sticky behavior, localization, account access, and integration with the unified hamburger menu.

---

## 2025-04-22: Modular, Award-Winning Header Design System

### Major Enhancements
- **Header Design System:**
  - Introduced a modular, schema-driven header design system with 10 toggle-able, award-winning styles directly selectable in the Shopify theme editor.
  - All styles are visually unique, generalized for any website, and follow the site's color scheme.
  - Styles apply consistently to the header, all desktop dropdowns (mega menu), and the hamburger menu (mobile).
- **Default Theme:**
  - Set 'Monochrome Luxe' as the default header design for all users.
- **New Unique Designs:**
  - Replaced previous styles with 9 new, visually distinct designs:
    1. Solar Flare
    2. Aurora Fade
    3. Opaline Mist
    4. Emerald Circuit
    5. Sunset Glass
    6. Royal Shadow
    7. Pixel Neo
    8. Frostbyte
    9. Luminous Card
    10. Monochrome Luxe (default)
- **Modular CSS:**
  - All styles are implemented in a dedicated, modular CSS file (`assets/header-designs.css`).
  - CSS is responsive and context-aware, with no code duplication or overrides.
- **Schema & Integration:**
  - The header section schema (`sections/header.liquid`) now includes a `header_design_style` setting, making style selection accessible and safe for non-coders.
  - The selected style is dynamically applied to the header, dropdowns, and hamburger menu via a shared class.
- **No Breaking Changes:**
  - All navigation, sticky logic, localization, and account/cart features remain fully functional.
  - No impact on mobile/desktop UX or existing site behavior.

### Files Modified
- `sections/header.liquid` — Added schema for design selection, dynamic class integration, and set new default.
- `snippets/header-mega-menu.liquid` — Ensured dropdowns inherit the selected style.
- `snippets/header-drawer.liquid` — Ensured hamburger menu inherits the selected style.
- `assets/header-designs.css` — Modular CSS for all 10 header styles (9 new, 1 default).

### Testing & Expected Outcomes
- In the Shopify theme editor, users can select from 10 unique header designs.
- The selected style is immediately reflected in the header, dropdowns, and hamburger menu.
- All navigation, localization, and sticky behaviors remain unchanged and fully functional.
- The system is modular, context-aware, and safe for non-coders to use.

---

## Recent Desktop Header & Mega Menu Enhancements (2025-04-21 to 2025-04-22)

### Features Added & Bugs Fixed

- **Unified Navigation Items:**
  - Ensured all 4 main navigation items (including "Games") are always shown in the desktop header, matching the hamburger menu.
  - Refactored desktop mega menu logic to dynamically generate the "Games" dropdown using product metafields, so it always reflects available games.

- **Games Dropdown Functionality:**
  - The "Games" menu item now appears as a dropdown (using `<details>`/`<summary>`), just like other desktop dropdowns.
  - Clicking "Games" reveals a list of all available games, each linking to its collection page.
  - Each game in the dropdown displays both its logo (if available) and title, matching the hamburger menu's look and feel.
  - Dropdown overlays the page (does not push header content down), for a modern and consistent UX.

- **Styling & Visual Consistency:**
  - The "Games" dropdown width is visually balanced (400px, max 90vw, min 240px) and centered below the nav item.
  - Dropdown background uses the same semi-transparent dark gradient as the hamburger menu for consistency.
  - Game link text and hover effects in the dropdown now match the hamburger menu for a unified look.
  - The "Games" nav item color is now consistent with other nav items (no gold by default; gold only if active).
  - All navigation is visually centered in the header.

- **Modularity & Mobile Safety:**
  - All changes are modular, desktop-only, and do not affect the mobile/hamburger menu experience in any way.
  - No code duplication; desktop and mobile menus leverage the same product metafield logic for games.

### Files Modified
- `snippets/header-mega-menu.liquid` — Desktop mega menu logic for games dropdown, logo, and structure.
- `assets/base.css` — Desktop-only CSS for dropdown overlay, width, background, and game link styles.

### Testing & Expected Outcomes
- On desktop: All 4 navigation items (including "Games") are visible and functional. Clicking "Games" shows a visually balanced dropdown with game logos and titles, matching the hamburger menu style. Dropdown overlays the page and does not push header content down. Navigation is centered and all nav item colors are consistent.
- On mobile/tablet: No change; hamburger menu and mobile navigation remain as before.

---

## Relevant Files

- **sections/header.liquid**  
  Main header template. Controls header layout, branding, navigation triggers, and sticky logic.
- **snippets/header-drawer.liquid**  
  Contains markup for the hamburger menu (menu drawer), which is triggered from the header.
- **snippets/header-mega-menu.liquid**  
  Contains markup for the desktop/mega menu, rendered within the header.
- **assets/global.js**  
  Contains JavaScript logic for header behavior (e.g., sticky header, menu drawer logic).
- **assets/base.css**  
  General CSS, including variables and utility classes that affect the header.
- **assets/component-menu-drawer.css**  
  CSS for the menu drawer, including responsive and unified styles.
- **assets/component-list-menu.css**  
  Styles for navigation menus and items.
- **locales/zh-TW.json**  
  Contains translations for header/menu labels.

---

## Key Classes & Structure

- `.section-header` — Main header section wrapper
- `.header` — Main header container (branding, navigation, triggers)
- `.header__heading` — Logo/title area
- `.header__icons` — Container for header icons (cart, account, localization, etc.)
- `.header__icon--menu` — Hamburger menu trigger (visible on all devices)
- `.drawer-menu` — Header state class when drawer menu is enabled
- `.header--has-menu` — Header state class when navigation menu is present
- `.header--mobile-*` — Mobile-specific header state classes
- `.header-wrapper` — Wrapper for sticky header logic
- `.header__inline-menu` — Container for inline (desktop) navigation
- `.header__menu-item` — Individual navigation link
- `.mega-menu`, `.mega-menu__content`, `.mega-menu__link` — Mega menu structure for desktop

**Nested Structure Example:**
- `.section-header`
  - `.header.header--[variant]`
    - `.header__heading` (logo)
    - `.header__icons`
    - `.header__icon--menu` (hamburger trigger)
    - `.header__inline-menu` (desktop navigation)
    - `{% render 'header-drawer' %}` (hamburger menu for mobile/tablet)
    - `{% render 'header-mega-menu' %}` (mega menu for desktop)

---

## Technical Notes

- The header supports sticky behavior using a custom `sticky-header` web component (see `global.js`).
- State classes (`drawer-menu`, `header--has-menu`, etc.) are applied conditionally based on settings and menu presence.
- Hamburger menu and mega menu are rendered via snippets for modularity and reuse.
- CSS is organized to ensure responsive behavior and avoid duplication.
- Localization, account, and cart icons are conditionally rendered in `.header__icons`.
- All navigation and menu content is dynamically generated from Shopify settings and menu structures.

---

## Testing / Expected Outcomes
- Header remains fixed (sticky) at the top of the page on all devices.
- Hamburger menu trigger is visible and functional on all devices.
- Desktop navigation (mega menu) is visible and functional on desktop/tablet.
- All icons (cart, account, localization) work as expected.
- No visual or functional regressions in header or navigation.
- Header adapts to different screen sizes and settings without layout issues.

---

## Change Log / Audit Section
- [2025-04-21] Initial documentation created for unified header implementation.
- [2025-04-22] Redundancy and Localization Cleanup
  - **Removed Localization Selector Button:**
    - The button with classes `disclosure__button localization-form__select localization-selector link link--text caption-large` was removed from both language and country localization snippets. No impact on other header styles or functionalities.
  - **Removed Redundant 'Home' Navigation Item:**
    - The 'Home' navigation item was removed from both desktop (mega menu) and mobile (hamburger menu) navigations, as the logo already links to the homepage. All other navigation items and logic remain intact.

---

*For further details on the hamburger menu implementation, see `unified-hamburger-250421.md`.*
