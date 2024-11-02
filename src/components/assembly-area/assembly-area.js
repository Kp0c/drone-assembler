import template from './assembly-area.html?raw';
import styles from './assembly-area.css?inline'
import { BaseComponent } from '../base-component.js';
import { Detail } from '../../models/detail.js';
import { currentDragItem$, frames$, getDetailById, importData, maxPrice$, selectedFrame$, selectFrame, selectPart, stopDrag } from '../../services/state.service.js';
import { canRedo$, canUndo$, redo, undo } from '../../services/history.service.js';

export class AssemblyArea extends BaseComponent {
  #frames = this.shadowRoot.getElementById('frames');
  #framesWrapper = this.shadowRoot.getElementById('frames-wrapper');
  #frameTemplate = this.shadowRoot.getElementById('frame-template');
  #undo = this.shadowRoot.getElementById('undo');
  #redo = this.shadowRoot.getElementById('redo');

  /**
   * @type {HTMLImageElement}
   */
  #workingArea = this.shadowRoot.getElementById('working-area');

  /**
   * @type {Frame}
   */
  #currentFrame = null;

  /**
   * @type {number | null}
   */
  #maxPrice = null;

  constructor() {
    super(template, styles);

    this.#frames.addEventListener('click', (event) => {
      if (event.target.id.startsWith('select-')) {
        const id = +event.target.id.replace('select-', '');

        selectFrame(id);
      } else if (event.target.id === 'import') {
        this.#import();
      }
    }, {
      signal: this.destroyedSignal
    });

    frames$.subscribe((frames) => this.#renderFrames(frames), {
      pushLatestValue: true,
      signal: this.destroyedSignal.signal
    });

    selectedFrame$.subscribe((frame) => {
      this.#currentFrame = frame;
      this.#renderSelectedFrame();
    }, {
      pushLatestValue: true,
      signal: this.destroyedSignal.signal
    });

    this.#workingArea.addEventListener('dragover', (event) => {
      event.preventDefault();

    }, {
      signal: this.destroyedSignal
    });

    this.#workingArea.addEventListener('drop', (event) => {
      event.preventDefault();
      const id = +event.dataTransfer.getData('text/plain');
      const detail = getDetailById(id);
      const closestPoint = this.#findClosesConnectionPoint(detail.type, event.offsetX, event.offsetY);

      selectPart(id, closestPoint);
      stopDrag();
    }, {
      signal: this.destroyedSignal
    });

    currentDragItem$.subscribe((item) => {
      if (item) {
        const availableConnectionPoints = this.#currentFrame.connectionPoints
          .filter(p => p.type === item.type && !p.installedPart);

        this.#renderConnectionPoints(availableConnectionPoints);
      } else {
        this.#clearConnectionPoints();
      }
    }, {
      pushLatestValue: true,
      signal: this.destroyedSignal.signal
    });

    canUndo$.subscribe((canUndo) => {
      this.#undo.disabled = !canUndo;
    }, {
      pushLatestValue: true,
      signal: this.destroyedSignal.signal
    });

    this.#undo.addEventListener('click', () => {
      undo();
    }, {
      signal: this.destroyedSignal
    });

    canRedo$.subscribe((canRedo) => {
      this.#redo.disabled = !canRedo;
    }, {
      pushLatestValue: true,
      signal: this.destroyedSignal.signal
    });

    this.#redo.addEventListener('click', () => {
      redo();
    }, {
      signal: this.destroyedSignal
    });

    maxPrice$.subscribe((maxPrice) => {
      this.#maxPrice = maxPrice;
      this.#renderFrames(frames$.getLatestValue());
    }, {
      pushLatestValue: true,
      signal: this.destroyedSignal
    });
  }

  #renderSelectedFrame() {
    this.#framesWrapper.hidden = !!this.#currentFrame;
    const img = this.#workingArea.querySelector('img');
    img.parentElement.hidden = !this.#currentFrame;
    img.src = this.#currentFrame?.img;

    this.#renderParts();
  }

  /**
   * Render the frames buttons
   *
   * @param {Detail[]} frames
   */
  #renderFrames(frames) {
    this.#frames.innerHTML = '';
    frames.forEach((frame) => {
      const frameElement = this.#frameTemplate.content.cloneNode(true);

      frameElement.querySelector('#frame-name').textContent = frame.name + ` ($${frame.price})`;
      frameElement.querySelector('#frame-img').src = frame.img;
      frameElement.querySelector('#frame-img').alt = frame.name;
      const frameSelect = frameElement.querySelector('#frame-select');
      frameSelect.id = `select-${frame.id}`;

      if (this.#maxPrice !== null && frame.price > this.#maxPrice) {
        frameSelect.disabled = true;
        frameElement.querySelector('#price-alert').hidden = false;
      } else {
        frameSelect.disabled = false;
        frameElement.querySelector('#price-alert').hidden = true;
      }

      this.#frames.appendChild(frameElement);
    });

    const importButton = document.createElement('button');
    importButton.textContent = 'Import';
    importButton.id = 'import';
    importButton.classList.add('primary');

    this.#frames.appendChild(importButton);
  }

  /**
   * @param {ConnectionPoint[]} availableConnectionPoints
   */
  #renderConnectionPoints(availableConnectionPoints) {
    this.#clearConnectionPoints();

    const multipliers = this.#getImageMultipliers();
    availableConnectionPoints.forEach(point => {
      const pointElement = document.createElement('div');
      pointElement.classList.add('connection-point');
      pointElement.style.left = `${point.x * multipliers.x - 10}px`;
      pointElement.style.top = `${point.y * multipliers.y - 10}px`;

      this.#workingArea.appendChild(pointElement);
    });
  }

  #clearConnectionPoints() {
    // clear the connection points
    this.#workingArea.querySelectorAll('.connection-point').forEach(point => point.remove());
  }

  /**
   * Find the closest connection point
   *
   * @param type
   * @param {number} x
   * @param {number }y
   * @returns {ConnectionPoint}
   */
  #findClosesConnectionPoint(type, x, y) {
    const multipliers = this.#getImageMultipliers();
    const points = this.#currentFrame.connectionPoints
      .filter(p => !p.installedPart && p.type === type)
      .map(point => {
        return {
          x: point.x * multipliers.x,
          y: point.y * multipliers.y,
          point
        }
      });

    return points.reduce((acc, point) => {
      const distance = Math.hypot(point.x - x, point.y - y);
      if (distance < acc.distance) {
        return {
          distance,
          point: point.point
        }
      }

      return acc;
    }, {
      distance: Number.MAX_VALUE,
      point: null
    }).point;
  }

  /**
   * Get the multipliers for the image
   * @returns {{x: number, y: number}}
   */
  #getImageMultipliers() {
    const img = this.#workingArea.querySelector('img');
    const realImageSize = {
      width: img.naturalWidth,
      height: img.naturalHeight
    };
    const currentImageSize = {
      width: img.width,
      height: img.height
    };

    return {
      x: currentImageSize.width / realImageSize.width,
      y: currentImageSize.height / realImageSize.height
    }
  }

  #renderParts() {
    this.#workingArea.querySelectorAll('.installed-part').forEach(part => part.remove());
    if (!this.#currentFrame) {
      return;
    }

    const sortedPoints = this.#currentFrame.connectionPoints.sort((a, b) => a.zIndex - b.zIndex);
    const installedParts = sortedPoints.filter(p => p.installedPart);

    const multipliers = this.#getImageMultipliers();
    installedParts.forEach((point) => {
      const partElement = document.createElement('img');
      partElement.classList.add('installed-part');
      partElement.style.left = `${point.x * multipliers.x - point.size / 2}px`;
      partElement.style.top = `${point.y * multipliers.y - point.size / 2}px`;
      partElement.width = point.size;
      partElement.height = point.size;
      partElement.src = point.installedPart.img;
      partElement.alt = point.installedPart.name;

      this.#workingArea.appendChild(partElement);
    });
  }

  /**
   * Import from CSV/Json
   */
  #import() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json,.csv';
    fileInput.onchange = () => {
      const file = fileInput.files[0];
      const reader = new FileReader();
      const extension = file.name.split('.').pop();
      reader.onload = () => {
        this.#importData(reader.result, extension);
      }

      reader.readAsText(file);
    }

    fileInput.click();
  }

  /**
   * Import the data
   * @param {string} data
   * @param {string} extension
   */
  #importData(data, extension) {
    if (extension === 'json') {
      this.#importJson(JSON.parse(data));
    } else if (extension === 'csv') {
      this.#importCsv(data);
    }
  }

  #importJson(data) {
    if (!Array.isArray(data)) {
      return;
    }

    importData(data);
  }

  #importCsv(data) {
    let rows = data.split('\n');

    // ignore header
    rows.shift();

    const importedData = rows.map(row => {
      const [id, positionId] = row.split(',');
      return {
        id: +id,
        positionId: +positionId
      }
    });

    importData(importedData);
  }
}
