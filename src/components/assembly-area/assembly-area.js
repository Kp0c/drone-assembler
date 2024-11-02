import template from './assembly-area.html?raw';
import styles from './assembly-area.css?inline'
import { BaseComponent } from '../base-component.js';
import { Detail } from '../../models/detail.js';
import { currentDragItem$, frames$, getDetailById, selectedFrame$, selectFrame, selectPart, stopDrag } from '../../services/state.service.js';
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

  constructor() {
    super(template, styles);

    this.#frames.addEventListener('click', (event) => {
      if (event.target.id.startsWith('select-')) {
        const id = +event.target.id.replace('select-', '');

        selectFrame(id);
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
      frameElement.querySelector('#frame-select').id = `select-${frame.id}`;

      this.#frames.appendChild(frameElement);
    });
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
}
