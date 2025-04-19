# AI Documentation for the Codebase

## Product Card Hover-Over Effects

This documentation explains the hover-over effects and animations on product cards in the Shopify theme.

### Core Files Responsible

The following files are responsible for implementing the hover-over "lit-up" effect when users hover over product cards:

1. **`assets/base.css` (lines 1283-1439)**: Contains the primary hover effect definitions
2. **`assets/component-card.css`**: Defines the card structure and references the hover effects
3. **`snippets/card-product.liquid`**: Contains the product card template markup

### Hover Effect Implementation

#### Effect Overview

When a user hovers over a product card, several visual changes occur simultaneously:

1. The card elevates slightly (transforms upward)
2. A gold-colored glow/border appears around the card
3. The product title changes color to gold
4. The price text becomes a lighter gold
5. If there's a secondary product image, it fades in
6. Any badges change background and border colors

#### CSS Implementation Details

The hover effects are centralized in `base.css` in a section labeled "IMPORTANT: HOVER-EFFECT FOR ALL PRODUCT CARDS" to maintain consistency across the site. Here's a breakdown of the key elements:

```css
/* Base transitions for all card elements */
.card-wrapper.card-link-wrapper .card {
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease, border-radius 0.3s ease;
}

/* Card container transformation on hover */
@media (hover: hover) {
  .card-wrapper.card-link-wrapper:hover .card {
    border-color: #E0B36A;
    box-shadow: 0 0 0 2px rgba(224, 179, 106, 0.8), 0 10px 20px rgba(0, 0, 0, 0.15);
    border-radius: 12px;
    transform: translateY(-3px) scale(1.01);
    z-index: 1;
  }
  
  /* Text color changes on hover */
  .card-wrapper.card-link-wrapper:hover .card__heading {
    color: #E0B36A;
  }
  
  /* Price color changes on hover */
  .card-wrapper:hover .card-information > .price {
    color: #FFCC80; /* Lighter gold on hover */
  }
  
  /* Secondary image reveal on hover */
  .card-wrapper:hover .media.media--hover-effect > img + img {
    opacity: 1;
    transform: scale(1.03);
  }
}
```

#### Touch Device Support

For devices without hover capability (touch devices), the design implements similar effects using the `:active` state instead of `:hover`:

```css
/* Card container effects for touch devices without hover capability */
@media (hover: none) {
  .card-wrapper.card-link-wrapper:active .card {
    border-color: #E0B36A;
    box-shadow: 0 0 0 2px rgba(224, 179, 106, 0.8), 0 5px 10px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  }
  
  /* Similar color changes on active state */
  .card-wrapper.card-link-wrapper:active .card__heading {
    color: #E0B36A;
  }
}
```

### HTML Structure

The product card HTML structure in `snippets/card-product.liquid` is set up to support these hover effects:

```html
<a href="{{ product_url }}" class="card-wrapper card-link-wrapper">
  <div class="card card--{{ settings.card_style }} card--app-style">
    <div class="card__inner mobile-image-container">
      <!-- Badge container -->
      <div class="card__badge-container">...</div>
      
      <!-- Media container with potential second image for hover effect -->
      <div class="card__media">
        <div class="media media--transparent media--hover-effect">
          <img src="..."> <!-- Primary image -->
          <img src="..."> <!-- Secondary image (shown on hover) -->
        </div>
      </div>
    </div>
    
    <!-- Product information -->
    <div class="card__content">
      <div class="card__information">
        <h3 class="card__heading">...</h3>
        <div class="card__price-container">...</div>
      </div>
    </div>
  </div>
</a>
```

### Key CSS Classes

- **`card-wrapper`**: Wraps the entire card component
- **`card-link-wrapper`**: Makes the entire card clickable
- **`card--app-style`**: Applies the application-specific styling
- **`media--hover-effect`**: Enables the image swap effect on hover
- **`card__heading`**: The product title that changes color on hover
- **`card__price-container`**: Contains the price that changes color on hover

### Color Values

The hover effect uses a gold color scheme:
- Border/highlight color: `#E0B36A` (gold)
- Hover price color: `#FFCC80` (lighter gold)
- Box shadow: `rgba(224, 179, 106, 0.8)` (semi-transparent gold)

### Animation Timing

All hover animations use CSS transitions for smooth effects:
- Transform transition: 0.3s ease
- Box-shadow transition: 0.3s ease
- Color transitions: 0.3s ease
- Opacity transitions: 0.5s ease

## Product Grid System

The product grid system is responsible for displaying collections of product cards in a responsive layout.

### Core Files Responsible

1. **`sections/main-collection-product-grid.liquid`**: Main container for the product grid
2. **`assets/template-collection.css`**: Styles for the collection grid layout
3. **`assets/base.css`**: Contains grid system definitions

### Grid Structure

The product grid uses Shopify's grid system with custom modifications for responsive layouts:

```html
<div id="product-grid" 
     class="grid product-grid grid--{{ section.settings.columns_mobile }}-col-tablet-down
            grid--{{ section.settings.columns_desktop }}-col-desktop">
  {% for product in collection.products %}
    <div class="grid__item">
      {% render 'card-product', card_product: product %}
    </div>
  {% endfor %}
</div>
```

### Responsive Grid Configuration

The grid system dynamically adjusts based on viewport size:

#### Desktop Layout
- Default: 4 columns
- Configurable through theme settings (`columns_desktop`)
- Defined in `base.css` using `.grid--4-col-desktop`

#### Tablet Layout
- Default: 3 columns (screens between 750px and 990px)
- Uses `.grid--3-col-tablet`

#### Mobile Layout
- Default: 2 columns (screens below 750px)
- Configurable through theme settings (`columns_mobile`)
- Uses `.grid--2-col-tablet-down`
- Special mobile-optimized card layout

### Mobile-Specific Grid Optimizations

The codebase includes special optimizations for mobile layouts:

```css
@media screen and (max-width: 749px) {
  /* Mobile 2-column grid styles */
  .grid--2-col-tablet-down {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    column-gap: 0.5rem;
  }

  /* Enhanced image sizing for mobile grid */
  .grid--2-col-tablet-down .mobile-image-container {
    position: relative;
    width: 100%;
    min-width: 43vw; /* Ensure minimum width based on viewport */
    padding-bottom: 100%; /* 1:1 Aspect Ratio */
    overflow: hidden;
  }
}
```

## Card Component Architecture

The card component system follows a modular architecture to support various card types and layouts.

### Card Component Hierarchy

1. **`card-wrapper`**: Outer container, handles link behavior
2. **`card`**: Main card container with styling variants
3. **`card__inner`**: Contains the media section
4. **`card__media`**: Image container
5. **`card__content`**: Contains product information
6. **`card__information`**: Text content (title, price, attributes)

### Card Style Variants

The system supports multiple card style variants:

1. **`card--standard`**: Default card style
2. **`card--media`**: Card with prominent media
3. **`card--text`**: Text-focused card with minimal media
4. **`card--app-style`**: Custom style with enhanced hover effects

### Card Component Features

1. **Badge System**: Product badges (sale, sold out) positioned at top-right
2. **Secondary Image**: Support for revealing a second image on hover
3. **Aspect Ratio Control**: Dynamic sizing based on image aspect ratio
4. **Game Title Display**: Special handling for game-related metadata

### Card-Related JavaScript

While the hover effects are primarily CSS-based, there are JavaScript components that enhance card functionality:

1. **`quick-add.js`**: Handles quick add to cart functionality
2. **`magnify.js`**: Provides image zoom on hover (used on product detail, not cards)
3. **`product-form.js`**: Manages product form submissions

## Mobile Responsiveness

The theme uses a comprehensive approach to mobile responsiveness for product cards and grids.

### Mobile-First Design Principles

1. **Viewport-Based Sizing**: Card dimensions adapt based on viewport width
2. **Touch-Optimized Interactions**: Active states replace hover states
3. **Simplified Information Display**: Content adapts for smaller screens

### Mobile Layout Features

```css
@media screen and (max-width: 749px) {
  /* Standardized approach for card content padding across all mobile sizes */
  .card__content {
    padding: 0.75rem !important;
    box-sizing: border-box !important;
    width: calc(100% - 1.5rem) !important;
    margin: 0 auto !important;
    min-width: 0 !important;
    overflow: hidden !important;
  }
  
  /* Ensure card fits within available space */
  .product-card-wrapper .card {
    overflow: hidden !important;
    width: 100% !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
  }
}
```

### Responsive Image Loading

The theme uses responsive image loading with the `srcset` attribute to optimize for different screen sizes:

```html
<img srcset="{{ card_product.featured_media | image_url: width: 165 }} 165w,
           {{ card_product.featured_media | image_url: width: 360 }} 360w,
           {{ card_product.featured_media | image_url: width: 533 }} 533w,
           {{ card_product.featured_media | image_url: width: 720 }} 720w,
           {{ card_product.featured_media | image_url: width: 940 }} 940w,
           {{ card_product.featured_media | image_url: width: 1066 }} 1066w"
     sizes="(min-width: 990px) calc((100vw - 130px) / 4), 
            (min-width: 750px) calc((100vw - 120px) / 3), 
            calc((100vw - 35px) / 2)"
     loading="lazy">
```

### Breakpoint System

The theme uses a consistent breakpoint system:
- Mobile: < 750px
- Tablet: 750px - 989px
- Desktop: ≥ 990px 