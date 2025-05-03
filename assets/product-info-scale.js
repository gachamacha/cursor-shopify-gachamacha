// product-info-scale.js
// Ensures product info panel width is dynamic, height is always auto to fit content (no scrollbars ever)

document.addEventListener('DOMContentLoaded', function () {
  var infoPanel = document.querySelector('.product__info-wrapper');
  if (!infoPanel) return;

  function updatePanelWidth() {
    var width = infoPanel.offsetWidth;
    infoPanel.style.setProperty('--product-info-width', width + 'px');
    // Remove forced height, let CSS/content determine height
    infoPanel.style.removeProperty('--product-info-height');
    infoPanel.style.height = 'auto';
  }

  // Initial update
  updatePanelWidth();

  // Listen for resize events (window resize or Shopify theme editor changes)
  var resizeObserver = new window.ResizeObserver(updatePanelWidth);
  resizeObserver.observe(infoPanel);

  // Also listen for section setting changes in Shopify theme editor
  if (window.Shopify && window.Shopify.designMode) {
    document.addEventListener('shopify:section:select', updatePanelWidth);
    document.addEventListener('shopify:section:deselect', updatePanelWidth);
    document.addEventListener('shopify:section:load', updatePanelWidth);
    document.addEventListener('shopify:section:unload', updatePanelWidth);
    document.addEventListener('input', function(e) {
      // If the user changes the width control, update width
      if (e.target && e.target.id && e.target.id.includes('info_panel_resize_desktop')) {
        setTimeout(updatePanelWidth, 100);
      }
    });
  }

  // Optional: update on window resize for extra safety
  window.addEventListener('resize', updatePanelWidth);
});