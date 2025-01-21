class CssSwipeCard extends HTMLElement {
  static get version() {
    return 'v0.9.2';
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.currentIndex = 0;
    this.resizeObserver = null;

    // Holds the interval ID for the auto-scroll feature
    this.autoScrollInterval = null;
  }

  // --- Core setup and rendering methods ---
  setConfig(config) {
    if (!config || !config.cards || !Array.isArray(config.cards)) {
      throw new Error('You need to define cards');
    }

    // Generate a random cardId if one isn't provided
    this.cardId = config.cardId || `css-swipe-card-${Math.random().toString(36).substr(2, 9)}`;

    // Merge user config with defaults
    this.config = {
      width: '100%',
      template: 'slider-horizontal',
      auto_height: false,
      card_gap: '0px',
      timer: 0,
      pagination: false,
      navigation: false,
      navigation_next: '',
      navigation_prev: '',
      custom_css: {},
      cardId: this.cardId,
      // Auto-scroll delay in seconds (0 = disabled)
      auto_scroll_delay: 0,
      ...config
    };

    this.render();
  }

  async render() {
    const styles = this.getStyles();
    const html = this.getHtml();

    this.shadowRoot.innerHTML = `<style>${styles}</style>${html}`;

    const cardContainer = this.shadowRoot.querySelector(`.${this.config.template}`);
    this._cards = [];

    // Create each slide/card
    for (const [index, cardConfig] of this.config.cards.entries()) {
      const card = await this.createCardElement(cardConfig);
      const slide = document.createElement('div');
      slide.classList.add('slide');
      slide.style.width = '100%';
      slide.dataset.index = index;
      card.classList.add('card-element');
      slide.appendChild(card);
      cardContainer.appendChild(slide);
      this._cards.push(card);
    }

    // Adjust height
    if (this.config.auto_height) {
      this.setupResizeObserver();
    } else {
      await this.setManualHeight();
    }

    // Apply any custom CSS from user config
    this.applyCustomStyles();

    // Optional pagination dots
    if (this.config.pagination) {
      this.setupPagination();
    }

    // Optional navigation buttons
    if (this.config.navigation) {
      this.setupNavigation();
    }

    // Inactivity timer (returns to first card if no interaction)
    this.setupTimer();

    // Auto-scroll (cycles slides on a defined interval)
    this.setupAutoScroll();

    // Update currentIndex/pagination on scroll
    const slider = this.shadowRoot.querySelector(`.${this.config.template}`);
    slider.addEventListener('scroll', () => {
      this.updateCurrentIndex();
      this.updatePagination();
    });
    
    // If Hass is available, handle input_number changes
    if (this._hass) {
      this.checkInputNumberState();
    }
  }

  // --- HTML and CSS generation methods ---
  getStyles() {
    return `
      :host {
        --slides-gap: ${this.config.card_gap};
        --slides-align-items: center;
        --pagination-bullet-active-background-color: var(--primary-text-color);
        --pagination-bullet-background-color: var(--primary-background-color);
        --pagination-bullet-border: 1px solid #999;
        --pagination-bullet-distance: 10px;
        --navigation-button-next-color: var(--primary-text-color);
        --navigation-button-next-background-color: var(--primary-background-color);
        --navigation-button-next-width: 40px;
        --navigation-button-next-height: 40px;
        --navigation-button-next-border-radius: 100%;
        --navigation-button-next-border: none;
        --navigation-button-prev-color: var(--primary-text-color);
        --navigation-button-prev-background-color: var(--primary-background-color);
        --navigation-button-prev-width: 40px;
        --navigation-button-prev-height: 40px;
        --navigation-button-prev-border-radius: 100%;
        --navigation-button-prev-border: none;
        --navigation-button-distance: 10px;
      }
      #${this.cardId} { 
        position: relative;
        overflow: hidden;
        
        /* Force hardware acceleration with 3D transform */
        transform: translateZ(0);
        -webkit-transform: translateZ(0);
        -moz-transform: translateZ(0);
        -ms-transform: translateZ(0);
        -o-transform: translateZ(0);

        /* Existing properties */
        backface-visibility: hidden;
        perspective: 1000;
        -webkit-backface-visibility: hidden;
        -webkit-perspective: 1000;
        -moz-backface-visibility: hidden;
        -moz-perspective: 1000;
        -ms-backface-visibility: hidden;
        -ms-perspective: 1000;
    
        will-change: transform;
        -webkit-overflow-scrolling: touch;
      }
      #${this.cardId} .slider-horizontal {
        display: flex;
        overflow-x: auto;
        overflow-y: hidden;
        scroll-snap-type: x mandatory;
        scroll-behavior: smooth;
        position: relative;
        gap: var(--slides-gap);
        padding-inline: var(--slides-gap);
      }
      #${this.cardId} .slider-vertical {
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        overflow-x: hidden;
        scroll-snap-type: y mandatory;
        scroll-behavior: smooth;
        position: relative;
        gap: var(--slides-gap);
        padding-block: var(--slides-gap);
      }
      #${this.cardId} .slider-horizontal,
      #${this.cardId} .slider-vertical {
        /* Hide scrollbars */
        &::-webkit-scrollbar {
          display: none;
        }
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      #${this.cardId} .slide {
        display: flex;
        min-width: 100%;
        align-items: var(--slides-align-items);
        justify-content: center;
        scroll-snap-align: start;
      }
      #${this.cardId} .card-element {
        width: 100% !important;
        scroll-snap-align: start;
        scroll-snap-stop: always;
      }
      #${this.cardId} .pagination-control.horizontal {
        position: absolute;
        bottom: var(--pagination-bullet-distance);
        left: 50%;
        align-items: center;
        transform: translateX(-50%);
        display: flex;
        gap: 10px;
      }
      #${this.cardId} .pagination-control.vertical {
        position: absolute;
        top: 50%;
        right: var(--pagination-bullet-distance);
        align-items: center;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      #${this.cardId} .pagination-bullet {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: var(--pagination-bullet-background-color, var(--primary-background-color));
          border: var(--pagination-bullet-border, 1px solid #999);
          cursor: pointer;
          padding: 0;
          transition: all 0.3s ease;
      }
      #${this.cardId} .pagination-bullet.active {
          background-color: var(--pagination-bullet-active-background-color, var(--primary-text-color));
          width: 12px;
          height: 12px;
      }
      #${this.cardId} .navigation-button {
        position: absolute;
        border: none;
        cursor: pointer;
        font-size: 24px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1;
        transition: transform 0.1s;
      }
      #${this.cardId} .navigation-button:active {
        animation: buttonPress 0.2s ease-out;
      }
      #${this.cardId} .navigation-button.prev-horizontal {
        width: var(--navigation-button-prev-width);
        height: var(--navigation-button-prev-height);
        left: var(--navigation-button-distance);
        top: 50%;
        margin-top: calc(-1 * var(--navigation-button-prev-height) / 2);
        color: var(--navigation-button-prev-color);
        background: var(--navigation-button-prev-background-color);
        border-radius: var(--navigation-button-prev-border-radius);
        border: var(--navigation-button-prev-border);
        transition: transform 0.1s;
      }
      #${this.cardId} .navigation-button.next-horizontal {
        width: var(--navigation-button-next-width);
        height: var(--navigation-button-next-height);
        right: var(--navigation-button-distance);
        top: 50%;
        margin-top: calc(-1 * var(--navigation-button-next-height) / 2);
        color: var(--navigation-button-next-color);
        background: var(--navigation-button-next-background-color);
        border-radius: var(--navigation-button-next-border-radius);
        border: var(--navigation-button-next-border);
        transition: transform 0.1s;
      }
      #${this.cardId} .navigation-button.prev-vertical {
        width: var(--navigation-button-prev-width);
        height: var(--navigation-button-prev-height);
        top: var(--navigation-button-distance);
        left: 50%;
        margin-left: calc(-1 * var(--navigation-button-prev-width) / 2);
        color: var(--navigation-button-prev-color);
        background: var(--navigation-button-prev-background-color);
        border-radius: var(--navigation-button-prev-border-radius);
        border: var(--navigation-button-prev-border);
        transition: transform 0.1s;
      }
      #${this.cardId} .navigation-button.next-vertical {
        width: var(--navigation-button-next-width);
        height: var(--navigation-button-next-height);
        bottom: var(--navigation-button-distance);
        left: 50%;
        margin-left: calc(-1 * var(--navigation-button-next-width) / 2);
        color: var(--navigation-button-next-color);
        background: var(--navigation-button-next-background-color);
        border-radius: var(--navigation-button-next-border-radius);
        border: var(--navigation-button-next-border);
        transition: transform 0.1s;
      }
      #${this.cardId} .navigation-button ha-icon {
        width: 80%;
        height: 80%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      #${this.cardId} .navigation-button, #${this.cardId} .pagination-control label {
        -webkit-tap-highlight-color: transparent;
        outline: none;
      }
      #${this.cardId} .navigation-button ha-icon,
      #${this.cardId} .pagination-control label {
        pointer-events: none;
      }
      @keyframes buttonPress {
        0% {
          transform: scale(1);
        }
        50% {
          transform: scale(0.9);
        }
        100% {
          transform: scale(1);
        }
      }
    `;
  }

  getHtml() {
    return `
      <div id="${this.cardId}">
        <div class="${this.config.template}"></div>
        ${
          this.config.pagination 
            ? `<div class="pagination-control ${this.config.template === 'slider-horizontal' ? 'horizontal' : 'vertical'}"></div>`
            : ''
        }
        ${
          this.config.navigation
            ? `
          <button class="navigation-button prev-${this.config.template === 'slider-horizontal' ? 'horizontal' : 'vertical'}">
            ${
              this.config.navigation_prev 
                ? `<ha-icon icon="${this.config.navigation_prev}"></ha-icon>` 
                : (this.config.template === 'slider-horizontal' ? '&lt;' : '&uarr;')
            }
          </button>
          <button class="navigation-button next-${this.config.template === 'slider-horizontal' ? 'horizontal' : 'vertical'}">
            ${
              this.config.navigation_next 
                ? `<ha-icon icon="${this.config.navigation_next}"></ha-icon>` 
                : (this.config.template === 'slider-horizontal' ? '&gt;' : '&darr;')
            }
          </button>
        `
            : ''
        }
      </div>
    `;
  }

  // --- Card creation and sizing methods ---
  async createCardElement(cardConfig) {
    const createCard = (await loadCardHelpers()).createCardElement;
    const element = createCard(cardConfig);
    element.hass = this._hass;
    return element;
  }

  async getCardSize() {
    if (!this._cards) return 0;

    let maxHeight = 0;
    for (const card of this._cards) {
      if (card.getCardSize) {
        const size = await card.getCardSize();
        maxHeight = Math.max(maxHeight, size * 50);
      } else {
        await card.updateComplete;
        const rect = card.getBoundingClientRect();
        maxHeight = Math.max(maxHeight, rect.height);
      }
    }
    return maxHeight || 140; // fallback to 140 if maxHeight is 0
  }

  async getMaxCardHeight() {
    let maxHeight = 0;
    for (const card of this._cards) {
      await card.updateComplete;  // Ensure card is fully rendered
      const rect = card.getBoundingClientRect();
      maxHeight = Math.max(maxHeight, rect.height);
    }
    return maxHeight || 140;  // Fallback height
  }

  // --- Card container height adjustment methods ---
  async adjustCardContainerHeight() {
    const cardContainer = this.shadowRoot.querySelector(`.${this.config.template}`);
    const slideContainer = this.shadowRoot.querySelector(`.slide`);
    const maxHeight = await this.getMaxCardHeight();

    if (this.config.auto_height) {
      this._cards.forEach(card => {
        card.style.height = `${maxHeight}px`;
      });
      cardContainer.style.height = `${maxHeight}px`;
      slideContainer.style.height = `${maxHeight}px`;
    } else {
      cardContainer.style.height = `${maxHeight}px`;
      slideContainer.style.height = `${maxHeight}px`;
      this._cards.forEach(card => {
        card.style.height = 'auto';
      });
    }

    // If a specific "height:" was provided in config (and not using auto_height)
    if (this.config.height && !this.config.auto_height) {
      cardContainer.style.height = this.config.height;
      slideContainer.style.height = this.config.height;
      this._cards.forEach(card => {
        card.style.height = this.config.height;
      });
    }
  }

  async setManualHeight() {
    const cardContainer = this.shadowRoot.querySelector(`.${this.config.template}`);
    const isHorizontal = this.config.template === 'slider-horizontal';

    if (isHorizontal) {
      cardContainer.style.height = this.config.height;
      cardContainer.style.overflowY = 'hidden';
    } else {
      const maxHeight = await this.getMaxCardHeight();
      cardContainer.style.height = this.config.height || `${maxHeight}px`;
      cardContainer.style.overflowY = 'auto';
    }

    this._cards.forEach(card => {
      if (isHorizontal) {
        card.style.height = this.config.height;
      } else {
        card.style.height = 'auto'; // Keep native height for vertical mode
      }
    });
  }

  // --- Resize observer setup ---
  setupResizeObserver() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.resizeObserver = new ResizeObserver(() => {
      this.adjustCardContainerHeight();
      this.updateCurrentIndex();
      this.updatePagination();
    });

    this._cards.forEach(card => {
      this.resizeObserver.observe(card);
    });
  }

  // --- Current index update method ---
  updateCurrentIndex() {
    const slider = this.shadowRoot.querySelector(`.${this.config.template}`);
    const isHorizontal = this.config.template === 'slider-horizontal';
    const scrollPosition = isHorizontal ? slider.scrollLeft : slider.scrollTop;

    let accumulatedSize = 0;
    for (let i = 0; i < this._cards.length; i++) {
      const cardSize = isHorizontal ? this._cards[i].clientWidth : this._cards[i].clientHeight;
      if (scrollPosition < accumulatedSize + cardSize / 2) {
        this.currentIndex = i;
        break;
      }
      accumulatedSize += cardSize;
    }
  }

  // --- Home Assistant integration methods ---
  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;

    // If oldHass is undefined, it's the first time we're setting hass
    if (!oldHass) {
      this.setupInputNumberListener();
      this.checkInputNumberState();
    }

    const cardContainer = this.shadowRoot.querySelector(`.${this.config.template}`);
    if (cardContainer) {
      cardContainer.childNodes.forEach((child) => {
        if (child.firstChild) {
          child.firstChild.hass = hass;
        }
      });
    }

    // If the input_number changed, respond accordingly
    const inputNumberEntity = `input_number.${this.config.cardId}`;
    if (oldHass && hass.states[inputNumberEntity] !== oldHass.states[inputNumberEntity]) {
      this.checkInputNumberState();
    }
  }

  setupInputNumberListener() {
    const inputNumberEntity = `input_number.${this.config.cardId}`;
    this._hass.connection.subscribeEvents(
      (event) => this.handleInputNumberChange(event),
      'state_changed',
      { entity_id: inputNumberEntity }
    );
  }

  checkInputNumberState() {
    const inputNumberEntity = `input_number.${this.config.cardId}`;
    const state = this._hass.states[inputNumberEntity];
    if (state) {
      const inputNumber = parseFloat(state.state);
      if (inputNumber !== 0) {
        const calcIndex = this.calcIndex(inputNumber);
        if (calcIndex >= 0) {
          requestAnimationFrame(() => {
            this.scrollToCardByIndex(calcIndex);
            setTimeout(() => {
              this.resetInputNumber();
            }, 500);
          });
        }
      }
    }
  }

  handleInputNumberChange(event) {
    if (event.data.entity_id === `input_number.${this.config.cardId}`) {
      const newState = event.data.new_state;
      if (newState && newState.state) {
        const inputNumber = parseFloat(newState.state);
        if (inputNumber !== 0) {
          const calcIndex = this.calcIndex(inputNumber);
          if (calcIndex >= 0) {
            this.scrollToCardByIndex(calcIndex).then(() => {
              this.resetInputNumber();
            });
          }
        }
      }
    }
  }

  resetInputNumber() {
    if (!this._hass) {
      return;
    }
    const inputNumberEntity = `input_number.${this.config.cardId}`;
    this._hass.callService("input_number", "set_value", {
      entity_id: inputNumberEntity,
      value: 0
    }).catch(() => {});
  }

  calcIndex(inputNumber) {
    return inputNumber - 1; // input_number "1" => index "0", etc.
  }

  // --- Pagination setup and update methods ---
  setupPagination() {
    const paginationControl = this.shadowRoot.querySelector('.pagination-control');
    if (!paginationControl) return;

    // Clear existing pagination bullets
    paginationControl.innerHTML = '';

    this._cards.forEach((_, index) => {
      const bullet = document.createElement('button');
      bullet.classList.add('pagination-bullet');
      bullet.setAttribute('aria-label', `Go to slide ${index + 1}`);
      bullet.addEventListener('click', () => this.scrollToCard(index));
      paginationControl.appendChild(bullet);
    });

    this.updatePagination();
  }

  updatePagination() {
    const paginationControl = this.shadowRoot.querySelector('.pagination-control');
    if (!paginationControl) return;

    const bullets = paginationControl.querySelectorAll('.pagination-bullet');
    bullets.forEach((bullet, index) => {
      if (index === this.currentIndex) {
        bullet.classList.add('active');
        bullet.setAttribute('aria-current', 'true');
      } else {
        bullet.classList.remove('active');
        bullet.removeAttribute('aria-current');
      }
    });
  }

  // --- Navigation setup and methods ---
  setupNavigation() {
    const prevButton = this.shadowRoot.querySelector('.navigation-button.prev-horizontal, .navigation-button.prev-vertical');
    const nextButton = this.shadowRoot.querySelector('.navigation-button.next-horizontal, .navigation-button.next-vertical');
    if (prevButton) {
      prevButton.addEventListener('click', () => this.navigate(-1));
    }
    if (nextButton) {
      nextButton.addEventListener('click', () => this.navigate(1));
    }
  }

  navigate(direction) {
    const newIndex = Math.max(0, Math.min(this.currentIndex + direction, this._cards.length - 1));
    this.scrollToCard(newIndex);
  }

  // --- Card scrolling methods ---
  scrollToCard(index) {
    const slider = this.shadowRoot.querySelector(`.${this.config.template}`);
    if (!slider) return;

    const isHorizontal = this.config.template === 'slider-horizontal';
    let scrollPosition = 0;

    for (let i = 0; i < index; i++) {
      scrollPosition += isHorizontal ? this._cards[i].clientWidth : this._cards[i].clientHeight;
    }

    slider.scrollTo({
      [isHorizontal ? 'left' : 'top']: scrollPosition,
      behavior: 'smooth'
    });

    // Update index & pagination after scroll
    this.updateCurrentIndex();
    this.updatePagination();

    // Reset the inactivity timer if present
    if (this.config.timer > 0) {
      this.resetTimer();
    }
  }

  scrollToCardByIndex(index) {
    return new Promise((resolve) => {
      const slider = this.shadowRoot.querySelector(`.${this.config.template}`);
      if (!slider) {
        resolve();
        return;
      }

      const isHorizontal = this.config.template === 'slider-horizontal';
      const maxIndex = this._cards.length - 1;
      const safeIndex = Math.max(0, Math.min(Math.round(index), maxIndex));
      const scrollPosition = safeIndex * (isHorizontal ? slider.clientWidth : slider.clientHeight);

      slider.scrollTo({
        [isHorizontal ? 'left' : 'top']: scrollPosition,
        behavior: 'smooth'
      });

      // Give it a short time to finish scrolling, then update
      setTimeout(() => {
        this.updateCurrentIndex();
        this.updatePagination();
        resolve();
      }, 400);
    });
  }

  // --- Timer setup and reset methods ---
  setupTimer() {
    if (this.config.timer > 0) {
      this.resetTimer();
      const slider = this.shadowRoot.querySelector(`.${this.config.template}`);
      slider.addEventListener('scroll', () => this.resetTimer());
      slider.addEventListener('click', () => this.resetTimer());
      slider.addEventListener('touchend', () => this.resetTimer());
    }
  }

  resetTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.timerInterval = setTimeout(() => {
      this.scrollToCard(0);
    }, this.config.timer * 1000);
  }

  // --- Auto-scroll through all slides on a set interval ---
  setupAutoScroll() {
    // If auto_scroll_delay is set (> 0) and there are multiple slides, cycle them
    if (this.config.auto_scroll_delay > 0 && this._cards.length > 1) {
      // Clear any existing auto-scroll interval
      if (this.autoScrollInterval) {
        clearInterval(this.autoScrollInterval);
      }
      this.autoScrollInterval = setInterval(() => {
        // Move to the next index, wrapping around
        this.currentIndex = (this.currentIndex + 1) % this._cards.length;
        this.scrollToCard(this.currentIndex);
      }, this.config.auto_scroll_delay * 1000);
    }
  }

  // --- Cleanup method ---
  disconnectedCallback() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
    }
  }

  // --- Custom styles application method ---
  applyCustomStyles() {
    const style = document.createElement('style');
    style.textContent = Object.entries(this.config.custom_css)
      .map(([property, value]) => `#${this.cardId} { ${property}: ${value}; }`)
      .join('\n');
    this.shadowRoot.appendChild(style);
  }
}

customElements.define('css-swipe-card', CssSwipeCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "css-swipe-card",
  name: "CSS Swipe Card",
  description: "A custom swipe card/carousel with optional auto-scroll & input_number controls"
});
