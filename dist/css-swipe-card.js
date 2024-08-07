class CssSwipeCard extends HTMLElement {
  static get version() {
    return 'v0.7.7';
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._boundHandleEvent = this.handleEvent.bind(this);
  }

  setConfig(config) {
    if (!config || !config.cards || !Array.isArray(config.cards)) {
      throw new Error('You need to define cards');
    }

    // Use user-defined cardId if provided, otherwise generate one
    this.cardId = config.cardId || `css-swipe-card-${Math.random().toString(36).substr(2, 9)}`;
    console.log(`Card ID set to: ${this.cardId}`);

    this.config = {
      width: '100%',
      height: '100%',
      template: 'slider-horizontal',
      auto_height: false,
      card_gap: '0px',
      timer: 0,
      pagination: false,
      navigation: false,
      navigation_next: '',
      navigation_prev: '',
      custom_css: {},
      cardId: this.cardId, // Include cardId in the config
      ...config
    };

    // Remove the window event listener
    if (this._boundHandleEvent) {
      window.removeEventListener('css-swipe-card-scroll', this._boundHandleEvent);
    }

    this._config = config;
    
    this.render();
  }

  handleEvent(event) {
    console.log('handleEvent called with event:', event);
    if (event.event_type === 'css-swipe-card-scroll' && event.data) {
      console.log(`Received cardId: ${event.data.cardId}, This card's ID: ${this.cardId}`);
      if (event.data.cardId === this.cardId) {
        console.log('Card ID matched. Scrolling to index:', event.data.index);
        this.scrollToCardByIndex(event.data.index);
      } else {
        console.log('Card ID did not match');
      }
    } else {
      console.log('Event type not recognized or data is undefined');
    }
  }
  
  async render() {
    const styles = `
      :host {
        --slides-gap: ${this.config.card_gap};
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
        /* Hide scrollbars for Webkit browsers (Chrome, Safari, newer versions of Opera) */
        &::-webkit-scrollbar {
          display: none;
        }

        /* Hide scrollbars for Firefox */
        scrollbar-width: none;

        /* Hide scrollbars for IE and Edge */
        -ms-overflow-style: none;
      }
      #${this.cardId} .slide {
        flex: 0 0 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        scroll-snap-align: start;
        scroll-snap-stop: always;
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
      #${this.cardId} .pagination-control label {
        display: block;
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background-color: var(--pagination-bullet-background-color);
        border: var(--pagination-bullet-border);
        cursor: pointer;
      }
      #${this.cardId} .pagination-control label.active {
        background-color: var(--pagination-bullet-active-background-color);
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
      #${this.cardId} .navigation-button:focus, #${this.cardId} .pagination-control label:focus {
        outline: none;
      }
      @keyframes buttonPress {
        0% { transform: scale(1); }
        50% { transform: scale(0.8); }
        100% { transform: scale(1); }
      }
    `;

    const html = `
            <div id="${this.cardId}">
        <div class="${this.config.template}"></div>
        ${this.config.pagination ? `<div class="pagination-control ${this.config.template === 'slider-horizontal' ? 'horizontal' : 'vertical'}"></div>` : ''}
        ${this.config.navigation ? `
          <button class="navigation-button prev-${this.config.template === 'slider-horizontal' ? 'horizontal' : 'vertical'}">
            ${this.config.navigation_prev ? `<ha-icon icon="${this.config.navigation_prev}"></ha-icon>` : (this.config.template === 'slider-horizontal' ? '&lt;' : '&uarr;')}
          </button>
          <button class="navigation-button next-${this.config.template === 'slider-horizontal' ? 'horizontal' : 'vertical'}">
            ${this.config.navigation_next ? `<ha-icon icon="${this.config.navigation_next}"></ha-icon>` : (this.config.template === 'slider-horizontal' ? '&gt;' : '&darr;')}
          </button>
        ` : ''}
      </div>
    `;

    this.shadowRoot.innerHTML = `<style>${styles}</style>${html}`;

    const cardContainer = this.shadowRoot.querySelector(`.${this.config.template}`);
    this._cards = [];

    for (const cardConfig of this.config.cards) {
      const card = await this.createCardElement(cardConfig);
      const slide = document.createElement('div');
      slide.classList.add('slide');
      card.classList.add('card-element');
      slide.appendChild(card);
      cardContainer.appendChild(slide);
      this._cards.push(card);
    }

    if (this.config.auto_height) {
      // Wait for the next frame to ensure all cards are rendered
      requestAnimationFrame(() => {
        this.adjustCardContainerHeight();
      });
    } else {
      this.setManualHeight();
    }

    this.applyCustomStyles();

    if (this.config.pagination) {
      this.setupPagination();
    }

    if (this.config.navigation) {
      this.setupNavigation();
    }

    this.setupTimer();

    const slider = this.shadowRoot.querySelector(`.${this.config.template}`);
    slider.addEventListener('scroll', () => this.updatePagination());
  }

  applyCustomStyles() {
    const style = document.createElement('style');
    style.textContent = Object.entries(this.config.custom_css)
      .map(([property, value]) => `#${this.cardId} { ${property}: ${value}; }`)
      .join('\n');
    this.shadowRoot.appendChild(style);
  }

  async createCardElement(cardConfig) {
    const createCard = (await loadCardHelpers()).createCardElement;
    const element = createCard(cardConfig);
    element.hass = this._hass;
    return element;
  }

  async adjustCardContainerHeight() {
    const maxHeight = await this.getCardSize();
    const cardContainer = this.shadowRoot.querySelector(`.${this.config.template}`);
    cardContainer.style.height = `${maxHeight}px`;

    this._cards.forEach(card => {
      card.style.height = `${maxHeight}px`;
    });
  }

  async getCardSize() {
    if (!this._cards) {
      return 0;
    }

    const heights = await Promise.all(this._cards.map(async (card) => {
      await card.updateComplete;
      return card.offsetHeight;
    }));

    return Math.max(...heights);
  }

  setManualHeight() {
    const cardContainer = this.shadowRoot.querySelector(`.${this.config.template}`);
    cardContainer.style.height = this.config.height;

    this._cards.forEach(card => {
      card.style.height = this.config.height;
    });
  }

  set hass(hass) {
    if (!this._hass) {
      console.log(`Setting up event listener for card: ${this.cardId}`);
      hass.connection.subscribeEvents((event) => {
        console.log('Received event:', event);
        if (event.event_type === 'css-swipe-card-scroll') {
          this.handleEvent(event);
        }
      }, 'css-swipe-card-scroll');
    }

    this._hass = hass;
    const cardContainer = this.shadowRoot.querySelector(`.${this.config.template}`);
    if (cardContainer) {
      cardContainer.childNodes.forEach((child) => {
        if (child.firstChild) {
         child.firstChild.hass = hass;
        }
      });
    }
  }

  setupPagination() {
    const paginationControl = this.shadowRoot.querySelector('.pagination-control');
    this._cards.forEach((card, index) => {
      const label = document.createElement('label');
      label.classList.add(`pagination-bullet-${index + 1}`);
      label.addEventListener('click', () => this.scrollToCard(index));
      paginationControl.appendChild(label);
    });

    this.updatePagination();
  }

  scrollToCard(index) {
    const slider = this.shadowRoot.querySelector(`.${this.config.template}`);
    const isHorizontal = this.config.template === 'slider-horizontal';
    slider.scrollTo({
      [isHorizontal ? 'left' : 'top']: index * (isHorizontal ? slider.clientWidth : slider.clientHeight),
      behavior: 'smooth'
    });
    if (this.config.timer > 0) {
      this.resetTimer(); // Reset the timer after scrolling
    }
  }

  scrollToCardByIndex(index) {
    const slider = this.shadowRoot.querySelector(`.${this.config.template}`);
    if (!slider) {
      return;
    }
    const isHorizontal = this.config.template === 'slider-horizontal';
    const scrollPosition = index * (isHorizontal ? slider.clientWidth : slider.clientHeight);
    slider.scrollTo({
      [isHorizontal ? 'left' : 'top']: scrollPosition,
      behavior: 'smooth'
    });
  }

  updatePagination() {
    const paginationControl = this.shadowRoot.querySelector('.pagination-control');
    if (!paginationControl) return;
    const bullets = paginationControl.querySelectorAll('label');
    const slider = this.shadowRoot.querySelector(`.${this.config.template}`);
    const isHorizontal = this.config.template === 'slider-horizontal';
    const scrollPosition = isHorizontal ? slider.scrollLeft / slider.clientWidth : slider.scrollTop / slider.clientHeight;
    bullets.forEach((bullet, index) => {
      bullet.classList.toggle('active', Math.round(scrollPosition) === index);
    });
  }

  setupNavigation() {
    const prevButton = this.shadowRoot.querySelector('.navigation-button.prev-horizontal, .navigation-button.prev-vertical');
    const nextButton = this.shadowRoot.querySelector('.navigation-button.next-horizontal, .navigation-button.next-vertical');
    if (prevButton) prevButton.addEventListener('click', () => this.navigate(-1));
    if (nextButton) nextButton.addEventListener('click', () => this.navigate(1));
  }

  navigate(direction) {
    const slider = this.shadowRoot.querySelector(`.${this.config.template}`);
    const isHorizontal = this.config.template === 'slider-horizontal';
    const scrollAmount = isHorizontal ? slider.clientWidth : slider.clientHeight;
    slider.scrollBy({
      [isHorizontal ? 'left' : 'top']: direction * scrollAmount,
      behavior: 'smooth'
    });
  }

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
      const slider = this.shadowRoot.querySelector(`.${this.config.template}`);
      this.scrollToCard(0); // Always scroll to the first card (index 0)
    }, this.config.timer * 1000);
  }

  disconnectedCallback() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}
customElements.define('css-swipe-card', CssSwipeCard);
