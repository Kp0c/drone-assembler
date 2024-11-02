import template from './parts.html?raw';
import styles from './parts.css?inline'
import { BaseComponent } from '../base-component.js';
import { allParts$, dragStart, selectedFrame$, selectedParts$, stopDrag } from '../../services/state.service.js';
import { sectionTypeToName } from '../../helpers/maps.js';

export class Parts extends BaseComponent {
  #sectionsWrapper = this.shadowRoot.getElementById('sections-wrapper');
  #partTemplate = this.shadowRoot.getElementById('part-template');

  /**
   * @type {Detail[]}
   */
  #parts = [];

  /**
   * Selected frame
   * @type {Detail}
   */
  #selectedFrame = null;

  /**
   * Selected parts
   * @type {Detail[]}
   */
  #selectedParts = [];

  constructor() {
    super(template, styles);

    allParts$.subscribe((parts) => {
      this.#parts = parts;
      this.#renderParts();
    }, {
      pushLatestValue: true,
      signal: this.destroyedSignal.signal
    });

    selectedFrame$.subscribe((frame) => {
      this.#selectedFrame = frame;
      this.#renderParts();
    }, {
      pushLatestValue: true,
      signal: this.destroyedSignal.signal
    });

    selectedParts$.subscribe((parts) => {
      this.#selectedParts = parts;
      this.#renderParts();
    }, {
      pushLatestValue: true,
      signal: this.destroyedSignal.signal
    });

    this.#sectionsWrapper.addEventListener('dragstart', (event) => {
      const target = event.target.closest('.part');
      const name = target?.dataset.name;

      if (!name) {
        console.error('No name found');
      }

      event.dataTransfer.setData('text/plain', name);

      dragStart(name);
    }, {
      signal: this.destroyedSignal
    });

    this.#sectionsWrapper.addEventListener('dragend', (event) => {
      event.preventDefault();

      stopDrag();
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

        let error = part.checkCompatibilityWithOtherParts(this.#selectedParts);

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

        partElement.dataset.name = part.name;

        section.appendChild(partElement);
      });

      this.#sectionsWrapper.appendChild(section);
    });
  }
}
