/*
  1. SHOPIFY FACET FILTERING SYSTEM
  - Provides a comprehensive faceting, filtering, and sorting system for product collections
  - Implements custom web components for filters, price ranges, and filter removal

  TABLE OF CONTENTS
  =================
  1. SHOPIFY FACET FILTERING SYSTEM........................Line 1
  
  2. FACET FILTERS FORM CLASS............................Line 12
     2.1 HISTORY AND NAVIGATION METHODS..................Line 38
        2.1.1 setListeners Method.......................Line 47
        2.1.2 updateURLHash Method.....................Line 68
     2.2 FACET RENDERING AND UI MANAGEMENT..............Line 78
        2.2.1 toggleActiveFacets Method................Line 84
        2.2.2 renderPage Method........................Line 94
        2.2.3 renderSectionFromFetch Method............Line 143
        2.2.4 renderSectionFromCache Method............Line 161
        2.2.5 renderProductGridContainer Method........Line 174
        2.2.6 renderProductCount Method................Line 189
        2.2.7 renderFilters Method.....................Line 212
        2.2.8 renderActiveFacets Method................Line 282
        2.2.9 renderAdditionalElements Method..........Line 302
        2.2.10 renderCounts Method.....................Line 317
        2.2.11 renderMobileCounts Method...............Line 349
     2.3 DATA AND STATE MANAGEMENT.....................Line 364
        2.3.1 getSections Method......................Line 369
        2.3.2 createSearchParams Method...............Line 382
     2.4 EVENT HANDLERS...............................Line 394
        2.4.1 onSubmitForm Method....................Line 398
        2.4.2 onSubmitHandler Method.................Line 408
        2.4.3 onActiveFilterClick Method.............Line 457
     2.5 CLASS PROPERTIES AND INITIALIZATION...........Line 473
  
  3. PRICE RANGE CLASS.................................Line 485
     3.1 EVENT HANDLERS...............................Line 499
        3.1.1 onRangeChange Method...................Line 503
        3.1.2 onKeyDown Method......................Line 513
     3.2 VALUE MANAGEMENT METHODS.....................Line 525
        3.2.1 setMinAndMaxValues Method..............Line 529
        3.2.2 adjustToValidValues Method.............Line 546
  
  4. FACET REMOVE CLASS...............................Line 566
     4.1 EVENT HANDLERS...............................Line 581
        4.1.1 closeFilter Method.....................Line 585
*/

/* 
  2. FACET FILTERS FORM CLASS
  - This is a custom element that handles filtering and sorting functionality.
  - It extends the HTMLElement class, making it a web component.
*/
class FacetFiltersForm extends HTMLElement {
  constructor() {
    super(); // Call parent constructor to initialize HTMLElement
    // Bind the `onActiveFilterClick` method to the current instance to maintain correct 'this' context
    this.onActiveFilterClick = this.onActiveFilterClick.bind(this);

    // Create a debounced version of the `onSubmitHandler` method to prevent excessive executions
    this.debouncedOnSubmit = debounce((event) => {
      this.onSubmitHandler(event);
    }, 800); // Wait 800ms between multiple rapid inputs before processing

    // Find the form inside this component and add an event listener for any input changes
    const facetForm = this.querySelector('form');
    facetForm.addEventListener('input', this.debouncedOnSubmit.bind(this));

    // Find the desktop facets wrapper and add an event listener for the escape key to close filters
    const facetWrapper = this.querySelector('#FacetsWrapperDesktop');
    if (facetWrapper) facetWrapper.addEventListener('keyup', onKeyUpEscape);

    // Add event listeners for mobile facet buttons
    this.setupMobileFacetButtons();
  }

  setupMobileFacetButtons() {
    const filterButton = this.querySelector('.mobile-facets__filter-button');
    const sortButton = this.querySelector('.mobile-facets__sort-button');
    const filterForm = this.querySelector('#FacetFiltersFormMobile');
    const sortForm = this.querySelector('#FacetSortFormMobile');

    if (filterButton && filterForm) {
      filterButton.addEventListener('click', () => {
        const isExpanded = filterButton.getAttribute('aria-expanded') === 'true';
        filterButton.setAttribute('aria-expanded', !isExpanded);
        filterForm.classList.toggle('active');
        
        // Dispatch events for header visibility
        if (!isExpanded) {
          // Filter is being opened
          document.dispatchEvent(new CustomEvent('facet:filter:open'));
        } else {
          // Filter is being closed
          document.dispatchEvent(new CustomEvent('facet:filter:close'));
        }
        
        // Ensure body scroll is not locked for mobile facets
        this.ensureBodyScrolling();
      });
    }

    if (sortButton && sortForm) {
      sortButton.addEventListener('click', () => {
        const isExpanded = sortButton.getAttribute('aria-expanded') === 'true';
        sortButton.setAttribute('aria-expanded', !isExpanded);
        sortForm.classList.toggle('active');
        
        // Dispatch events for header visibility
        if (!isExpanded) {
          // Sort is being opened
          document.dispatchEvent(new CustomEvent('facet:filter:open'));
        } else {
          // Sort is being closed
          document.dispatchEvent(new CustomEvent('facet:filter:close'));
        }
        
        // Ensure body scroll is not locked for mobile facets
        this.ensureBodyScrolling();
      });
    }
    
    // Add event listeners to details elements to ensure scrolling is maintained
    this.querySelectorAll('.mobile-facets__details').forEach(details => {
      details.addEventListener('toggle', (event) => {
        this.ensureBodyScrolling();
        
        // Dispatch events for header visibility when filter details are toggled
        if (event.target.open) {
          document.dispatchEvent(new CustomEvent('facet:filter:open'));
        } else {
          // Check if any other filter details are still open
          const anyOpen = Array.from(this.querySelectorAll('.mobile-facets__details')).some(d => d.open);
          if (!anyOpen) {
            document.dispatchEvent(new CustomEvent('facet:filter:close'));
          }
        }
      });
    });
  }

  // New method to ensure body scrolling is not locked
  ensureBodyScrolling() {
    // Remove any overflow-hidden classes that might have been applied
    document.body.classList.remove('overflow-hidden-mobile');
    document.body.classList.remove('overflow-hidden-tablet');
    document.body.classList.remove('overflow-hidden-desktop');
  }

  /* 
    2.1 HISTORY AND NAVIGATION METHODS
  */
  
  /*
    2.1.1 setListeners Method:
    - This static method sets up a listener for the browser's history changes (e.g., back/forward navigation).
    - When the history changes, it checks if the search parameters have changed and updates the page accordingly.
  */  
  static setListeners() {
    const onHistoryChange = (event) => {
      // Get the search parameters from the history state or use the initial search parameters
      const searchParams = event.state ? event.state.searchParams : FacetFiltersForm.searchParamsInitial;
      // If the search parameters haven't changed, do nothing to avoid unnecessary rerendering
      if (searchParams === FacetFiltersForm.searchParamsPrev) return;
      // Render the page with the new search parameters (updateURLHash=false since this is from history)
      FacetFiltersForm.renderPage(searchParams, null, false);
    };
    // Add the `popstate` event listener to handle browser history changes
    window.addEventListener('popstate', onHistoryChange);
  }

  /*
    2.1.2 updateURLHash Method:
    - This static method updates the URL hash with the current search parameters.
    - Uses HTML5 History API to update the URL without reloading the page.
  */  
  static updateURLHash(searchParams) {
    // Push a new state to browser history with searchParams as data and update URL
    history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
  }

  /* 
    2.2 FACET RENDERING AND UI MANAGEMENT
  */

  /*
    2.2.1 toggleActiveFacets Method:
    - This static method toggles the disabled state of all active filter remove buttons.
    - The `disable` parameter determines whether to disable or enable the buttons.
  */  
  static toggleActiveFacets(disable = true) {
    // Find all facet remove buttons and toggle their disabled state
    document.querySelectorAll('.js-facet-remove').forEach((element) => {
      element.classList.toggle('disabled', disable);
    });
  }

  /*
    2.2.2 renderPage Method:
    - This static method updates the page content based on the provided search parameters.
    - It shows loading spinners, updates the product count, and fetches or renders the updated sections.
  */  
  static renderPage(searchParams, event, updateURLHash = true) {
    // Store the current search parameters for comparison with future requests
    FacetFiltersForm.searchParamsPrev = searchParams;
    // Get the sections that need to be updated when filters change
    const sections = FacetFiltersForm.getSections();
    // Find the product count containers and loading spinners for UI updates
    const countContainer = document.getElementById('ProductCount');
    const countContainerDesktop = document.getElementById('ProductCountDesktop');
    const loadingSpinners = document.querySelectorAll(
      '.facets-container .loading__spinner, facet-filters-form .loading__spinner'
    );
    // Show the loading spinners and add the loading class to the product grid for visual feedback
    loadingSpinners.forEach((spinner) => spinner.classList.remove('hidden'));
    document.getElementById('ProductGridContainer').querySelector('.collection').classList.add('loading');
    if (countContainer) {
      countContainer.classList.add('loading');
    }
    if (countContainerDesktop) {
      countContainerDesktop.classList.add('loading');
    }

    // Loop through each section and update its content using cache or fetch
    sections.forEach((section) => {
      // Construct URL for the section with section ID and search parameters
      const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
      // Create filter function to check if this URL exists in cached data
      const filterDataUrl = (element) => element.url === url;

      // Check if data is already in cache - if so use it, otherwise fetch from server
      FacetFiltersForm.filterData.some(filterDataUrl)
        ? FacetFiltersForm.renderSectionFromCache(filterDataUrl, event)
        : FacetFiltersForm.renderSectionFromFetch(url, event);
    });

    // Update the URL hash if required to reflect current filters in the browser address bar
    if (updateURLHash) FacetFiltersForm.updateURLHash(searchParams);
  }

  /*
    2.2.3 renderSectionFromFetch Method:
    - This static method fetches new HTML content from the server and updates the page.
    - It caches the fetched data for future use to reduce server requests.
  */  
  static renderSectionFromFetch(url, event) {
    // Fetch content from server using the constructed URL
    fetch(url)
      .then((response) => response.text())
      .then((responseText) => {
        const html = responseText;
        // Cache the fetched HTML for future use (performance optimization)
        FacetFiltersForm.filterData = [...FacetFiltersForm.filterData, { html, url }];
        // Update all needed components with the new content
        FacetFiltersForm.renderFilters(html, event);
        FacetFiltersForm.renderProductGridContainer(html);
        FacetFiltersForm.renderProductCount(html);
        // Initialize scroll animations if that function exists in the theme
        if (typeof initializeScrollAnimationTrigger === 'function') initializeScrollAnimationTrigger(html.innerHTML);
      });
  }

  /*
    2.2.4 renderSectionFromCache Method:
    - This static method renders a section from cached HTML data instead of fetching from server.
    - It updates the filters, product grid, and product count from cached data.
  */  
  static renderSectionFromCache(filterDataUrl, event) {
    // Find and use the cached HTML data that matches the requested URL
    const html = FacetFiltersForm.filterData.find(filterDataUrl).html;
    // Update the page with cached content
    FacetFiltersForm.renderFilters(html, event);
    FacetFiltersForm.renderProductGridContainer(html);
    FacetFiltersForm.renderProductCount(html);
    // Initialize scroll animations if that function exists in the theme
    if (typeof initializeScrollAnimationTrigger === 'function') initializeScrollAnimationTrigger(html.innerHTML);
  }

  /*
    2.2.5 renderProductGridContainer Method:
    - This static method updates the product grid container with new HTML content.
    - It also cancels any scroll animations for the updated elements to prevent visual glitches.
  */  
  static renderProductGridContainer(html) {
    // Parse the HTML string into DOM and update the product grid with new content
    document.getElementById('ProductGridContainer').innerHTML = new DOMParser()
      .parseFromString(html, 'text/html')
      .getElementById('ProductGridContainer').innerHTML;

    // Find all scroll trigger elements and cancel their animations
    document
      .getElementById('ProductGridContainer')
      .querySelectorAll('.scroll-trigger')
      .forEach((element) => {
        element.classList.add('scroll-trigger--cancel');
      });
  }

  /*
    2.2.6 renderProductCount Method:
    - This static method updates the product count displayed on the page.
    - It removes the loading state from the product count containers when complete.
  */  
  static renderProductCount(html) {
    // Parse the HTML and extract the product count information
    const count = new DOMParser().parseFromString(html, 'text/html').getElementById('ProductCount').innerHTML;
    // Update count in mobile view
    const container = document.getElementById('ProductCount');
    container.innerHTML = count;
    container.classList.remove('loading');
    // Update count in desktop view if it exists
    const containerDesktop = document.getElementById('ProductCountDesktop');
    if (containerDesktop) {
      containerDesktop.innerHTML = count;
      containerDesktop.classList.remove('loading');
    }
    // Hide all loading spinners as content has been loaded
    const loadingSpinners = document.querySelectorAll(
      '.facets-container .loading__spinner, facet-filters-form .loading__spinner'
    );
    loadingSpinners.forEach((spinner) => spinner.classList.add('hidden'));
  }

  /*
    2.2.7 renderFilters Method:
    - This static method updates the filter options based on the new HTML content.
    - It removes outdated filters, renders new ones, and updates active facets.
  */
  static renderFilters(html, event) {
    // Parse the fetched HTML into a DOM object for manipulation
    const parsedHTML = new DOMParser().parseFromString(html, 'text/html');
    // Get all filter elements from the fetched HTML and from the current page
    const facetDetailsElementsFromFetch = parsedHTML.querySelectorAll(
      '#FacetFiltersForm .js-filter, #FacetFiltersFormMobile .js-filter, #FacetFiltersPillsForm .js-filter'
    );
    const facetDetailsElementsFromDom = document.querySelectorAll(
      '#FacetFiltersForm .js-filter, #FacetFiltersFormMobile .js-filter, #FacetFiltersPillsForm .js-filter'
    );

    // Remove facets that are no longer returned from the server (outdated filters)
    Array.from(facetDetailsElementsFromDom).forEach((currentElement) => {
      if (!Array.from(facetDetailsElementsFromFetch).some(({ id }) => currentElement.id === id)) {
        currentElement.remove();
      }
    });

    // Create function to check if an element matches the element that triggered the event
    const matchesId = (element) => {
      const jsFilter = event ? event.target.closest('.js-filter') : undefined;
      return jsFilter ? element.id === jsFilter.id : false;
    };

    // Separate elements to render from those that match the event source
    const facetsToRender = Array.from(facetDetailsElementsFromFetch).filter((element) => !matchesId(element));
    const countsToRender = Array.from(facetDetailsElementsFromFetch).find(matchesId);

    // Render each facet element from the fetched HTML
    facetsToRender.forEach((elementToRender, index) => {
      const currentElement = document.getElementById(elementToRender.id);
      // If element already exists, just update its content
      if (currentElement) {
        document.getElementById(elementToRender.id).innerHTML = elementToRender.innerHTML;
      } else {
        // Otherwise, insert it in the correct position
        if (index > 0) {
          const { className: previousElementClassName, id: previousElementId } = facetsToRender[index - 1];
          // If same type as previous element, insert after it
          if (elementToRender.className === previousElementClassName) {
            document.getElementById(previousElementId).after(elementToRender);
            return;
          }
        }
        // Insert before the first filter in its parent container
        if (elementToRender.parentElement) {
          document.querySelector(`#${elementToRender.parentElement.id} .js-filter`).before(elementToRender);
        }
      }
    });

    // Update active filters and additional UI elements
    FacetFiltersForm.renderActiveFacets(parsedHTML);
    FacetFiltersForm.renderAdditionalElements(parsedHTML);

    // Update counts for the element that triggered the update
    if (countsToRender) {
      const closestJSFilterID = event.target.closest('.js-filter').id;

      if (closestJSFilterID) {
        // Update counts in desktop and mobile views
        FacetFiltersForm.renderCounts(countsToRender, event.target.closest('.js-filter'));
        FacetFiltersForm.renderMobileCounts(countsToRender, document.getElementById(closestJSFilterID));

        // Focus the appropriate button after updating (accessibility feature)
        const newFacetDetailsElement = document.getElementById(closestJSFilterID);
        const newElementSelector = newFacetDetailsElement.classList.contains('mobile-facets__details')
          ? `.mobile-facets__close-button`
          : `.facets__summary`;
        const newElementToActivate = newFacetDetailsElement.querySelector(newElementSelector);

        // Don't focus if the triggering element is a text input
        const isTextInput = event.target.getAttribute('type') === 'text';
        if (newElementToActivate && !isTextInput) newElementToActivate.focus();
      }
    }
  }

  /*
    2.2.8 renderActiveFacets Method:
    - This static method updates the active facets (applied filters) on the page.
    - Updates both mobile and desktop active filter displays.
  */  
  static renderActiveFacets(html) {
    // Array of selectors for active facet containers in different views
    const activeFacetElementSelectors = ['.active-facets-mobile', '.active-facets-desktop'];

    // Update each active facet container with new content
    activeFacetElementSelectors.forEach((selector) => {
      const activeFacetsElement = html.querySelector(selector);
      if (!activeFacetsElement) return;
      document.querySelector(selector).innerHTML = activeFacetsElement.innerHTML;
    });

    // Re-enable the active filter buttons
    FacetFiltersForm.toggleActiveFacets(false);
  }

  /*
    2.2.9 renderAdditionalElements Method:
    - This static method updates additional elements like mobile filters button, count, and sorting dropdown.
    - Ensures the mobile drawer is properly reinitialized after updates.
  */
  static renderAdditionalElements(html) {
    const mobileElementSelectors = [
      '.mobile-facets__filter-button',
      '.mobile-facets__sort-button',
      '.mobile-facets__count',
      '.sorting'
    ];

    mobileElementSelectors.forEach((selector) => {
      if (!html.querySelector(selector)) return;
      document.querySelector(selector).innerHTML = html.querySelector(selector).innerHTML;
    });

    // Rebind events for the mobile filter drawer after updating its content
    const mobileForm = document.getElementById('FacetFiltersFormMobile');
    if (mobileForm) {
      const wasOpen = mobileForm.classList.contains('active');
      mobileForm.closest('menu-drawer').bindEvents();
      if (wasOpen) mobileForm.classList.add('active'); // Maintain open state
    }
  }

  /*
    2.2.10 renderCounts Method:
    - This static method updates the counts and summaries for filter options.
    - Preserves expanded state of "show more" sections when updating.
  */  
  static renderCounts(source, target) {
    // Update the facet summary (title and count display)
    const targetSummary = target.querySelector('.facets__summary');
    const sourceSummary = source.querySelector('.facets__summary');
    if (sourceSummary && targetSummary) {
      targetSummary.outerHTML = sourceSummary.outerHTML;
    }

    // Update the facet header (additional title information)
    const targetHeaderElement = target.querySelector('.facets__header');
    const sourceHeaderElement = source.querySelector('.facets__header');
    if (sourceHeaderElement && targetHeaderElement) {
      targetHeaderElement.outerHTML = sourceHeaderElement.outerHTML;
    }

    // Update the facet wrap (container for the actual filter options)
    const targetWrapElement = target.querySelector('.facets-wrap');
    const sourceWrapElement = source.querySelector('.facets-wrap');
    if (sourceWrapElement && targetWrapElement) {
      // Preserve "show more" expanded state when updating
      const isShowingMore = Boolean(target.querySelector('show-more-button .label-show-more.hidden'));
      if (isShowingMore) {
        // Convert hidden items to show-more-item to keep them visible if expanded
        sourceWrapElement
          .querySelectorAll('.facets__item.hidden')
          .forEach((hiddenItem) => hiddenItem.classList.replace('hidden', 'show-more-item'));
      }
      // Replace the entire wrap element with updated content
      targetWrapElement.outerHTML = sourceWrapElement.outerHTML;
    }
  }

  /*
    2.2.11 renderMobileCounts Method:
    - This static method updates the counts for mobile filter options.
    - Simpler than desktop version as mobile UI structure is different.
  */  
  static renderMobileCounts(source, target) {
    // Find the list containers for mobile facets in source and target
    const targetFacetsList = target.querySelector('.mobile-facets__list');
    const sourceFacetsList = source.querySelector('.mobile-facets__list');

    // Replace the entire list to update the content if both exist
    if (sourceFacetsList && targetFacetsList) {
      targetFacetsList.outerHTML = sourceFacetsList.outerHTML;
    }
  }

  /*
    2.3 DATA AND STATE MANAGEMENT
  */

  /*
    2.3.1 getSections Method:
    - This static method returns the sections that need to be updated when filters are applied.
    - Currently only updates the product grid section.
  */  
  static getSections() {
    return [
      {
        // Get section ID from the product grid's data attribute
        section: document.getElementById('product-grid').dataset.id,
      },
    ];
  }

  /*
    2.3.2 createSearchParams Method:
    - This method creates URL search parameters from a form's data.
    - Converts form inputs to URL-encoded string for AJAX requests.
  */  
  createSearchParams(form) {
    // Create FormData object from the form and convert to URL parameters string
    const formData = new FormData(form);
    return new URLSearchParams(formData).toString();
  }

  /*
    2.4 EVENT HANDLERS
  */

  /*
    2.4.1 onSubmitForm Method:
    - This method handles form submission and updates the page with the new search parameters.
    - Acts as a bridge between the form submission and page rendering.
  */  
  onSubmitForm(searchParams, event) {
    // Call renderPage with the search parameters to update the page content
    FacetFiltersForm.renderPage(searchParams, event);
  }

  /*
    2.4.2 onSubmitHandler Method:
    - Handles form submissions for filter/sort interactions
    - Manages both mobile and desktop filter scenarios
    - Converts form data to URL parameters for AJAX requests
  */
  onSubmitHandler(event) {
    event.preventDefault();
    const formData = new FormData(event.target.closest('form'));
    const formParams = new URLSearchParams(formData);
    const searchParams = this.createSearchParams(formParams);
    const searchParamsString = searchParams.toString();
    const section = formParams.get('section_id');

    // Dispatch filter open event
    document.dispatchEvent(new CustomEvent('facet:filter:open'));

    this.onSubmitForm(searchParamsString, event);
  }

  /*
    2.4.3 onActiveFilterClick Method:
    - This method handles clicks on active filter remove buttons.
    - Extracts search parameters from the remove button's href and updates the page.
  */  
  onActiveFilterClick(event) {
    event.preventDefault();
    FacetFiltersForm.toggleActiveFacets();
    const url = event.currentTarget.href.indexOf('?') == -1
      ? ''
      : event.currentTarget.href.slice(event.currentTarget.href.indexOf('?') + 1);
    FacetFiltersForm.renderPage(url);
    
    // Dispatch the filter close event
    document.dispatchEvent(new CustomEvent('facet:filter:close'));
  }
}

/*
  2.5 CLASS PROPERTIES AND INITIALIZATION
  - These properties store data shared across all instances of the FacetFiltersForm class.
*/
// Array to store cached filter data to reduce server requests
FacetFiltersForm.filterData = [];
// Store initial URL search parameters for comparison
FacetFiltersForm.searchParamsInitial = window.location.search.slice(1);
// Store previous search parameters to detect changes
FacetFiltersForm.searchParamsPrev = window.location.search.slice(1);
// Register the custom element with the browser
customElements.define('facet-filters-form', FacetFiltersForm);
// Initialize history state listeners
FacetFiltersForm.setListeners();

/*
  3. PRICE RANGE CLASS
  - This is a custom element that handles price range filtering.
  - Manages min/max price inputs and validates user entries.
*/
class PriceRange extends HTMLElement {
  constructor() {
    super(); // Initialize the HTMLElement
    // Add event listeners for input changes and keydown events to all inputs
    this.querySelectorAll('input').forEach((element) => {
      element.addEventListener('change', this.onRangeChange.bind(this));
      element.addEventListener('keydown', this.onKeyDown.bind(this));
    });
    // Set the initial min and max values when component is created
    this.setMinAndMaxValues();
  }

  /*
    3.1 EVENT HANDLERS
  */

  /*
    3.1.1 onRangeChange Method:
    - This method adjusts the input values to ensure they are within valid ranges.
    - Called when user changes a price range input value.
  */  
  onRangeChange(event) {
    // Ensure the changed value is within valid bounds
    this.adjustToValidValues(event.currentTarget);
    // Update min/max data attributes to maintain valid ranges
    this.setMinAndMaxValues();
  }

  /*
    3.1.2 onKeyDown Method:
    - This method prevents invalid key inputs in the price range fields.
    - Only allows numbers, punctuation, and navigation keys.
  */  
  onKeyDown(event) {
    // Allow meta key combinations (like Cmd+A, Cmd+C) to work normally
    if (event.metaKey) return;

    // Define pattern of allowed keys (numbers, separators, navigation keys)
    const pattern = /[0-9]|\.|,|'| |Tab|Backspace|Enter|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|Delete|Escape/;
    // Prevent input of any character not matching the pattern
    if (!event.key.match(pattern)) event.preventDefault();
  }

  /*
    3.2 VALUE MANAGEMENT METHODS
  */

  /*
    3.2.1 setMinAndMaxValues Method:
    - This method sets cross-references between the min and max inputs.
    - Updates data attributes to ensure the inputs maintain proper relationship.
  */  
  setMinAndMaxValues() {
    // Get references to both inputs in the price range
    const inputs = this.querySelectorAll('input');
    const minInput = inputs[0];
    const maxInput = inputs[1];
    
    // Set data-max on min input to reference max input's value
    if (maxInput.value) minInput.setAttribute('data-max', maxInput.value);
    // Set data-min on max input to reference min input's value
    if (minInput.value) maxInput.setAttribute('data-min', minInput.value);
    // If min is empty, set max's data-min to 0
    if (minInput.value === '') maxInput.setAttribute('data-min', 0);
    // If max is empty, set min's data-max to its original maximum
    if (maxInput.value === '') minInput.setAttribute('data-max', maxInput.getAttribute('data-max'));
  }

  /*
    3.2.2 adjustToValidValues Method:
    - This method ensures the input values are within their valid ranges.
    - Adjusts values that exceed min/max boundaries.
  */  
  adjustToValidValues(input) {
    // Convert input value and min/max attributes to numbers for comparison
    const value = Number(input.value);
    const min = Number(input.getAttribute('data-min'));
    const max = Number(input.getAttribute('data-max'));

    // Adjust the value if it's outside the valid range
    if (value < min) input.value = min; // Set to minimum if too low
    if (value > max) input.value = max; // Set to maximum if too high
  }
}

// Register the PriceRange custom element with the browser
customElements.define('price-range', PriceRange);


/*
  4. FACET REMOVE CLASS
  - This is a custom element that handles the removal of active filters.
  - Adds accessibility features and click handling to filter removal links.
*/
class FacetRemove extends HTMLElement {
  constructor() {
    super(); // Initialize the HTMLElement
    // Find the remove link inside this component
    const facetLink = this.querySelector('a');
    // Add button role for accessibility
    facetLink.setAttribute('role', 'button');
    // Add click event listener to handle filter removal
    facetLink.addEventListener('click', this.closeFilter.bind(this));
    // Add keyboard support for accessibility (space bar to activate)
    facetLink.addEventListener('keyup', (event) => {
      event.preventDefault();
      if (event.code.toUpperCase() === 'SPACE') this.closeFilter(event);
    });
  }

  /*
    4.1 EVENT HANDLERS
  */

  /*
    4.1.1 closeFilter Method:
    - This method handles the removal of an active filter.
    - Finds the parent form and delegates to its onActiveFilterClick handler.
  */  
  closeFilter(event) {
    // Prevent default link navigation
    event.preventDefault();
    // Find the parent facet-filters-form component
    const form = this.closest('facet-filters-form') || document.querySelector('facet-filters-form');
    // Delegate to the form's click handler to remove the filter
    form.onActiveFilterClick(event);
    
    // Dispatch filter close event
    document.dispatchEvent(new CustomEvent('facet:filter:close'));
  }
}

// Register the FacetRemove custom element with the browser
customElements.define('facet-remove', FacetRemove);