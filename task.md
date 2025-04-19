# Collection Page Enhancement Tasks

## ✅ Completed

- [x] Adjust padding to ensure text readability
- [x] Adjust gradient overlay opacity to ensure text readability regardless of banner image
- [x] Add subtle animation to banner components (title, game icon) on page load
- [x] Add a collapsible button filter button that store existing filter and sort logic (all existing logic must remain exactly the same)
- [x] Fix horizontal alignment issues with Server/Sort filter pills (ensure consistent spacing)
- [x] Update mobile filter dropdown to fix color contrast issues
- [x] Ensure filter buttons have consistent width across mobile devices
- [x] Implement smooth transitions when opening/closing filter dropdown menus
- [x] There is currently a space between the collection banner and the filter UI, remove the gap

## ⏳ Pending

### Banner Section
<!-- All banner section tasks are now complete -->

### Filter UI
<!-- All filter UI tasks are now complete -->

### Product Grid (Mobile only)
- [ ] Optimise a new product card highlight effect on hover (border seems to align properly on left, top, right of the listing, but not bottom, please check)
- [ ] Add a button on the right side within the product card, a "View Details" button use appropriate existing colour scheme, ensure the position is appropriate on mobile
- [ ] Implement lazy-loading optimization for images below the fold

### Layout & Integration
- [ ] Fix container width issues (ensure consistent page-width throughout)
- [ ] Ensure proper padding around product grid on all screen sizes
- [ ] Create a smooth visual transition between banner and product grid sections
- [ ] Fix z-index issues with overlapping elements on scroll
- [ ] Ensure all text elements maintain proper contrast ratios for accessibility
- [ ] Update spacing between sections to be more visually balanced

### Performance
- [ ] Optimize image loading strategy (defer non-critical images)
- [ ] Consolidate redundant CSS classes in component-facets.css
- [ ] Refactor repetitive JavaScript code in facets.js
- [ ] Implement proper event delegation in JavaScript for better performance

## Dependencies
- "Fix container width issues" should be completed before "Adjust spacing between product cards"
- "Optimize image loading strategy" requires "Implement lazy-loading optimization"
- "Update mobile filter dropdown" should be done before "Ensure filter buttons have consistent width"

## Technical Considerations
- All CSS changes should be made in the appropriate component CSS files (component-facets.css, component-card.css, etc.)
- JavaScript optimizations should focus on the facets.js file
- Template changes will affect main-collection-banner.liquid and main-collection-product-grid.liquid
- Mobile responsiveness should be thoroughly tested across different viewport sizes 