import template from './assembly-area.html?raw';
import styles from './assembly-area.css?inline'
import { BaseComponent } from '../base-component.js';
import { Detail } from '../../models/detail.js';
import { frames$, selectedFrame$, selectFrame, selectPart } from '../../services/state.service.js';

export class AssemblyArea extends BaseComponent {
  #frames = this.shadowRoot.getElementById('frames');
  #framesWrapper = this.shadowRoot.getElementById('frames-wrapper');
  #frameTemplate = this.shadowRoot.getElementById('frame-template');

  /**
   *
   * @type {HTMLImageElement}
   */
  #workingArea = this.shadowRoot.getElementById('working-area');

  constructor() {
    super(template, styles);

    this.#frames.addEventListener('click', (event) => {
      if (event.target.id.startsWith('select-')) {
        const frameName = event.target.id.replace('select-', '');

        selectFrame(frameName);
      }
    }, {
      signal: this.destroyedSignal
    });

    frames$.subscribe((frames) => this.#renderFrames(frames), {
      pushLatestValue: true,
      signal: this.destroyedSignal.signal
    });

    selectedFrame$.subscribe((frame) => {
      this.#framesWrapper.hidden = !!frame;
      this.#workingArea.parentElement.hidden = !frame;
      this.#workingArea.src = frame?.img;
    }, {
      pushLatestValue: true,
      signal: this.destroyedSignal.signal
    });

    this.#workingArea.addEventListener('dragover', (event) => {
      event.preventDefault();
    });

    this.#workingArea.addEventListener('drop', (event) => {
      event.preventDefault();
      const name = event.dataTransfer.getData('text/plain');

      selectPart(name);
    });
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
      frameElement.querySelector('#frame-select').id = `select-${frame.name}`;

      this.#frames.appendChild(frameElement);
    });
  }
}
