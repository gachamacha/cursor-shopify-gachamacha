// Adds a visual feedback effect to the variant picker when a selection is made
// Ensures selection feedback animation always plays, even on repeated selection changes
// Also animates the label for a seamless effect

// Use event delegation for robustness

document.addEventListener('change', function(event) {
  const select = event.target;
  if (
    select.matches &&
    select.matches('.product-form__input--combo-dropdown select')
  ) {
    const combo = select.closest('.select--combo');
    const label = select.closest('.product-form__input--combo-dropdown')?.querySelector('.form__label');
    if (combo) {
      console.log('Selection changed!', { combo, select });
      combo.classList.remove('selection-feedback');
      void combo.offsetWidth; // Force reflow
      combo.classList.add('selection-feedback');
    }
    if (label) {
      label.classList.remove('selection-feedback-label');
      void label.offsetWidth;
      label.classList.add('selection-feedback-label');
    }
  }
});

document.addEventListener('animationend', function(event) {
  const combo = event.target;
  if (
    combo.classList &&
    combo.classList.contains('select--combo') &&
    event.animationName === 'selectionFeedbackBg'
  ) {
    combo.classList.remove('selection-feedback');
  }
  // Remove label feedback class after animation
  if (
    combo.classList &&
    combo.classList.contains('form__label') &&
    event.animationName === 'selectionFeedbackLabel'
  ) {
    combo.classList.remove('selection-feedback-label');
  }
});
