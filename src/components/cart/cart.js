import template from './cart.html?raw';
import styles from './cart.css?inline';
import { BaseComponent } from '../base-component.js';
import { clearAll, selectedFrame$, uninstallItem } from '../../services/state.service.js';
import { sectionTypeToName } from '../../helpers/utilities.js';

export class Cart extends BaseComponent {
  #sectionsWrapper = this.shadowRoot.getElementById('sections-wrapper');
  #partTemplate = this.shadowRoot.getElementById('part-template');
  #totalPrice = this.shadowRoot.getElementById('total-price');
  #clearAll = this.shadowRoot.getElementById('clear-all');
  #progress = this.shadowRoot.getElementById('progress');
  #exportActions = this.shadowRoot.getElementById('export-actions');
  #exportError = this.shadowRoot.getElementById('export-error');
  #exportJson = this.shadowRoot.getElementById('export-json');
  #exportCsv = this.shadowRoot.getElementById('export-csv');

  /**
   * Selected frame
   * @type {Frame}
   */
  #selectedFrame = null;

  constructor() {
    super(template, styles);

    selectedFrame$.subscribe((frame) => {
      this.#selectedFrame = frame;
      this.#renderParts();
      this.#renderPrice();
      this.#renderProgress();
    }, {
      pushLatestValue: true,
      signal: this.destroyedSignal.signal
    });

    this.#sectionsWrapper.addEventListener('click', (event) => {
      const target = event.target.closest('.part');
      const id = target?.dataset.id;

      if (id) {
        uninstallItem(parseInt(id));
      }
    }, {
      signal: this.destroyedSignal
    });

    this.#clearAll.addEventListener('click', () => {
      clearAll();
    }, {
      signal: this.destroyedSignal
    });

    this.#exportJson.addEventListener('click', () => {
      this.#exportToJson();
    }, {
      signal: this.destroyedSignal
    });

    this.#exportCsv.addEventListener('click', () => {
      this.#exportToCsv();
    }, {
      signal: this.destroyedSignal
    });
  }

  /**
   * Render the parts sections
   */
  #renderParts() {
    this.#sectionsWrapper.innerHTML = '';

    if (!this.#selectedFrame) {
      return;
    }

    let allInstalledParts = this.#selectedFrame.connectionPoints.filter((p) => p.installedPart)
      .map((p) => p.installedPart);

    allInstalledParts = [this.#selectedFrame, ...allInstalledParts];

    // group by type
    const groupedParts = allInstalledParts.reduce((acc, part) => {
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

        partElement.dataset.id = part.id;

        if (part.isFrame() && allInstalledParts.length > 1) {
          partElement.querySelector('#delete').hidden = true;
          partElement.querySelector('#error').hidden = false;
        } else {
          partElement.querySelector('#error').hidden = true;
        }

        section.appendChild(partElement);
      });

      this.#sectionsWrapper.appendChild(section);
    });
  }

  #renderPrice() {
    const price = this.#selectedFrame?.connectionPoints.reduce((acc, p) => {
      if (p.installedPart) {
        acc += p.installedPart.price;
      }

      return acc;
    }, this.#selectedFrame?.price ?? 0) ?? 0;

    this.#totalPrice.textContent = price.toString();
  }

  #renderProgress() {
    const installedParts = this.#selectedFrame?.connectionPoints.filter((p) => p.installedPart).length ?? 0;
    const totalParts = this.#selectedFrame?.connectionPoints.length ?? 0;
    const neededParts = totalParts - installedParts;

    this.#progress.innerHTML = '';
    if (installedParts > 0) {
      const doneElement = document.createElement('span');
      doneElement.id = 'done';
      doneElement.style.flex = installedParts.toString();
      doneElement.textContent = installedParts.toString();
      this.#progress.appendChild(doneElement);
    }

    if (neededParts > 0) {
      const neededElement = document.createElement('span');
      neededElement.id = 'needed';
      neededElement.style.flex = neededParts.toString();
      neededElement.textContent = neededParts.toString();
      this.#progress.appendChild(neededElement);
    }

    if (neededParts > 0 || totalParts === 0) {
      this.#exportActions.hidden = true;
      this.#exportError.hidden = false;
    } else {
      this.#exportActions.hidden = false;
      this.#exportError.hidden = true;
    }
  }

  #exportToJson() {
    const data = this.#exportData();

    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'drone.json';
    a.click();
  }

  #exportToCsv() {
    const data = this.#exportData();

    // headers
    data.unshift({
      id: 'ID',
      positionId: 'Position ID',
      type: 'Type',
      name: 'Name',
      price: 'Price',
      compatibilityInch: 'Compatibility Inch',
    });

    const csv = data.map((row) => {
      return Object.values(row).join(',');
    }).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'drone.csv';
    a.click();
  }

  #exportData() {
    const parts = [this.#selectedFrame, ...this.#selectedFrame.connectionPoints
      .filter((p) => p.installedPart)
      .map((p) => ({ ...p.installedPart, positionId: p.id }))];

    return parts.map((part) => ({
      id: part.id,
      positionId: part.positionId,
      type: sectionTypeToName[part.type],
      name: part.name,
      price: part.price,
      compatibilityInch: part.compatibilityInch.join(';'),
    }));
  }
}
