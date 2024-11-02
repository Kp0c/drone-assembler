import template from './parts.html?raw';
import styles from './parts.css?inline'
import { BaseComponent } from '../base-component.js';
import { allParts$, dragStart, maxPrice$, selectedFrame$, setMaxPrice, stopDrag } from '../../services/state.service.js';
import { sectionTypeToName } from '../../helpers/utilities.js';

export class Parts extends BaseComponent {
  #sectionsWrapper = this.shadowRoot.getElementById('sections-wrapper');
  #partTemplate = this.shadowRoot.getElementById('part-template');
  #maxPriceEl = this.shadowRoot.getElementById('max-price');

  /**
   * @type {Detail[]}
   */
  #parts = [];

  /**
   * Selected frame
   * @type {Frame}
   */
  #selectedFrame = null;

  /**
   *
   * @type {number | null}
   */
  #maxPrice = null;

  constructor() {
    super(template, styles);

    allParts$.subscribe((parts) => {
      this.#parts = parts;
      this.#renderParts();
    }, {
      pushLatestValue: true,
      signal: this.destroyedSignal
    });

    selectedFrame$.subscribe((frame) => {
      this.#selectedFrame = frame;
      this.#renderParts();
    }, {
      pushLatestValue: true,
      signal: this.destroyedSignal
    });

    this.#sectionsWrapper.addEventListener('dragstart', (event) => {
      const target = event.target.closest('.part');
      const id = target?.dataset.id;

      if (!id) {
        console.error('No id found');
      }

      event.dataTransfer.setData('text/plain', id);

      dragStart(+id);
    }, {
      signal: this.destroyedSignal
    });

    this.#sectionsWrapper.addEventListener('dragend', (event) => {
      event.preventDefault();

      stopDrag();
    }, {
      signal: this.destroyedSignal
    });

    this.#maxPriceEl.addEventListener('input', (event) => {
      const value = event.target.value;

      if (value) {
        setMaxPrice(+value);
      } else {
        setMaxPrice(null);
      }
    }, {
      signal: this.destroyedSignal
    });

    maxPrice$.subscribe((price) => {
      this.#maxPrice = price;
      this.#maxPriceEl.value = price;

      this.#renderParts();
    }, {
      pushLatestValue: true,
      signal: this.destroyedSignal
    });
  }

  /**
   * Render the parts sections
   */
  #renderParts() {
    if (!this.#selectedFrame || !this.#parts.length) {
      return;
    }

    this.#sectionsWrapper.innerHTML = '';

    // group by type
    const groupedParts = this.#parts.reduce((acc, part) => {
      if (!acc[part.type]) {
        acc[part.type] = [];
      }

      acc[part.type].push(part);

      return acc;
    }, {});

    const installedParts = this.#selectedFrame.connectionPoints.filter((p) => p.installedPart).map((p) => p.installedPart);

    const currentPrice = installedParts.reduce((acc, part) => acc + part.price, this.#selectedFrame.price);

    Object.entries(groupedParts).forEach(([type, parts]) => {
      const section = document.createElement('section');
      section.classList.add('section-items');

      const title = document.createElement('h3');
      title.textContent = sectionTypeToName[type];
      section.appendChild(title);

      parts.forEach((part) => {
        const partElementClone = this.#partTemplate.content.cloneNode(true);
        const partElement = partElementClone.querySelector('.part');

        partElement.querySelector('#name').textContent = part.name + ` ($${part.price})`;
        partElement.querySelector('#img').src = part.img;
        partElement.querySelector('#img').alt = part.name;

        let error = null;

        if (this.#maxPrice !== null && currentPrice + part.price > this.#maxPrice) {
          error = `You cannot add this part as the new total price will exceed the maximum price of $${this.#maxPrice}`;
        }

        const compatibilityError = part.checkCompatibilityWithOtherParts(installedParts);
        if (compatibilityError) {
          error = compatibilityError;
        }

        if (!part.isCompatibleWith(this.#selectedFrame.compatibilityInch[0])) {
          error = `Not compatible with ${this.#selectedFrame.name} frame`;
        }

        if (error) {
          partElement.querySelector('#error').hidden = false
          partElement.querySelector('#error').textContent = error;

          partElement.draggable = false;
        } else {
          partElement.querySelector('#error').hidden = true;
        }

        partElement.dataset.id = part.id;

        section.appendChild(partElement);
      });

      this.#sectionsWrapper.appendChild(section);
    });
  }
}
