import template from './parts.html?raw';
import styles from './parts.css?inline'
import { BaseComponent } from '../base-component.js';
import { allParts$, selectedFrame$ } from '../../services/state.service.js';

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

  #sectionTypeToName = {
    'motor': 'Motors',
    'battery': 'Batteries',
    'flight-controller': 'Flight Controllers',
    'camera': 'Cameras',
    'video-antenna': 'Video Antennas',
    'radio-module': 'Radio Modules'
  }

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
      title.textContent = this.#sectionTypeToName[type];
      section.appendChild(title);

      parts.forEach((part) => {
        const partElement = this.#partTemplate.content.cloneNode(true);

        partElement.querySelector('#name').textContent = part.name + ` ($${part.price})`;
        partElement.querySelector('#img').src = part.img;
        partElement.querySelector('#img').alt = part.name;

        if (part.isCompatibleWith(this.#selectedFrame.compatibilityInch[0])) {
          partElement.querySelector('#error').hidden = true;
        } else {
          partElement.querySelector('#error').hidden = false
          partElement.querySelector('#error').textContent = `Not compatible with ${this.#selectedFrame.name}`;
        }

        section.appendChild(partElement);
      });

      this.#sectionsWrapper.appendChild(section);
    });
  }
}
