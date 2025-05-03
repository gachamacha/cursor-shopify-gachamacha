// Adds .is-focused to .select--combo when its <select> is focused, for custom focus outline
// Refactored to use event delegation for robustness

document.addEventListener('focus', function(event) {
  const select = event.target;
  if (
    select.matches &&
    select.matches('.select--combo select')
  ) {
    const combo = select.closest('.select--combo');
    if (combo) {
      combo.classList.add('is-focused');
    }
  }
}, true); // useCapture: true for focus events

document.addEventListener('blur', function(event) {
  const select = event.target;
  if (
    select.matches &&
    select.matches('.select--combo select')
  ) {
    const combo = select.closest('.select--combo');
    if (combo) {
      combo.classList.remove('is-focused');
    }
  }
}, true); // useCapture: true for blur events
