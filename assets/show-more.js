// Check if the custom element 'show-more-button' is not already defined
if (!customElements.get('show-more-button')) {
  // Define the custom element 'show-more-button'
  customElements.define(
    'show-more-button',
    // Create a class for the custom element that extends HTMLElement
    class ShowMoreButton extends HTMLElement {
      constructor() {
        super(); // Call the constructor of the parent class (HTMLElement)

        // Find the button element inside this custom element
        const button = this.querySelector('button');
        // Add an event listener to the button for the 'click' event
        button.addEventListener('click', (event) => {
          // When the button is clicked, call the 'expandShowMore' method
          this.expandShowMore(event);

          // Find the next element to focus on after expanding
          const nextElementToFocus = event.target.closest('.parent-display').querySelector('.show-more-item');
          // If the next element exists, is not hidden, and contains an input element, focus on that input
          if (nextElementToFocus && !nextElementToFocus.classList.contains('hidden') && nextElementToFocus.querySelector('input')) {
            nextElementToFocus.querySelector('input').focus();
          }
        });
      }

      // Method to handle the expansion of the 'show more' section
      expandShowMore(event) {
        // Find the closest parent element with an ID starting with 'Show-More-' and the closest '.parent-display' element
        const parentDisplay = event.target.closest('[id^="Show-More-"]').closest('.parent-display');
        // Find the '.parent-wrap' element inside the parent display
        const parentWrap = parentDisplay.querySelector('.parent-wrap');

        // Toggle the 'hidden' class on all elements with the class 'label-text' inside this custom element
        this.querySelectorAll('.label-text').forEach((element) => element.classList.toggle('hidden'));

        // Toggle the 'hidden' class on all elements with the class 'show-more-item' inside the parent display
        parentDisplay.querySelectorAll('.show-more-item').forEach((item) => item.classList.toggle('hidden'));

        // If there is no element with the class 'label-show-less', hide this custom element
        if (!this.querySelector('.label-show-less')) {
          this.classList.add('hidden');
        }
      }
    }
  );
}