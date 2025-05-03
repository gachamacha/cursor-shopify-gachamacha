// Ensures .product__info-wrapper matches the height of .product__media-wrapper on desktop
function syncProductInfoHeight() {
  var product = document.querySelector('.product');
  var media = document.querySelector('.product__media-wrapper');
  var info = document.querySelector('.product__info-wrapper');
  if (!product || !media || !info) return;

  // Only apply on desktop (match your CSS breakpoint)
  if (window.innerWidth > 990) {
    var mediaHeight = media.offsetHeight;
    // info.style.height = mediaHeight + 'px';
    info.style.overflow = 'auto';
  } else {
    info.style.height = '';
    info.style.overflow = '';
  }
}

window.addEventListener('DOMContentLoaded', syncProductInfoHeight);
window.addEventListener('resize', syncProductInfoHeight);
