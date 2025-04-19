function hideProductModal() {
  const productModal = document.querySelectorAll('product-modal[open]');
  productModal && productModal.forEach((modal) => modal.hide());
}

document.addEventListener('shopify:block:select', function (event) {
  hideProductModal();
  const blockSelectedIsSlide = event.target.classList.contains('slideshow__slide');
  if (!blockSelectedIsSlide) return;

  const parentSlideshowComponent = event.target.closest('slideshow-component');
  parentSlideshowComponent.pause();

  setTimeout(function () {
    parentSlideshowComponent.slider.scrollTo({
      left: event.target.offsetLeft,
    });
  }, 200);
});

document.addEventListener('shopify:block:deselect', function (event) {
  const blockDeselectedIsSlide = event.target.classList.contains('slideshow__slide');
  if (!blockDeselectedIsSlide) return;
  const parentSlideshowComponent = event.target.closest('slideshow-component');
  if (parentSlideshowComponent.autoplayButtonIsSetToPlay) parentSlideshowComponent.play();
});

document.addEventListener('shopify:section:load', () => {
  hideProductModal();
  const zoomOnHoverScript = document.querySelector('[id^=EnableZoomOnHover]');
  if (!zoomOnHoverScript) return;
  if (zoomOnHoverScript) {
    const newScriptTag = document.createElement('script');
    newScriptTag.src = zoomOnHoverScript.src;
    zoomOnHoverScript.parentNode.replaceChild(newScriptTag, zoomOnHoverScript);
  }
});

document.addEventListener('shopify:section:unload', (event) => {
  document.querySelectorAll(`[data-section="${event.detail.sectionId}"]`).forEach((element) => {
    element.remove();
    document.body.classList.remove('overflow-hidden');
  });
});

document.addEventListener('shopify:section:reorder', () => hideProductModal());

document.addEventListener('shopify:section:select', () => hideProductModal());

document.addEventListener('shopify:section:deselect', () => hideProductModal());

document.addEventListener('shopify:inspector:activate', () => hideProductModal());

document.addEventListener('shopify:inspector:deactivate', () => hideProductModal());

// Add the dynamic dropdown code here
document.addEventListener('DOMContentLoaded', function () {
  const gameInput = document.querySelector('[name="product[metafields][product.game]"]');

  if (gameInput) {
    // Fetch the list of games from the select-game section
    const gameList = Array.from(document.querySelectorAll('.select-game-title')).map(el => el.textContent.trim());

    // Create a datalist element
    const datalist = document.createElement('datalist');
    datalist.id = 'game-list';
    gameInput.setAttribute('list', 'game-list');

    // Populate the datalist with game options
    gameList.forEach(game => {
      const option = document.createElement('option');
      option.value = game;
      datalist.appendChild(option);
    });

    // Append the datalist to the input field
    gameInput.parentNode.appendChild(datalist);
  }
});