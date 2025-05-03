// Dynamically adjust product title font size if too long
(function() {
  function adjustTitleFontSize() {
    var titleBlocks = document.querySelectorAll('.product__title');
    titleBlocks.forEach(function(titleBlock) {
      var text = titleBlock.innerText || '';
      var length = text.length;
      var baseFontSize = 2.2;
      var minFontSize = 1.05;
      var fontSize = baseFontSize;
      // Shrink font size for very long titles
      if (length > 50 && length <= 80) {
        fontSize = 1.6;
      } else if (length > 80) {
        fontSize = minFontSize;
      }
      titleBlock.style.fontSize = fontSize + 'rem';
      titleBlock.setAttribute('data-dynamic-title', '');
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', adjustTitleFontSize);
  } else {
    adjustTitleFontSize();
  }
})();
