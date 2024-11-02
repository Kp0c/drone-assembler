import template from './assembly-area.html?raw';
import styles from './assembly-area.css?inline'
import { BaseComponent } from '../base-component.js';
import { Detail } from '../../models/detail.js';
import { frames$, isFrameSelected$, selectFrame } from '../../services/state.service.js';

export class AssemblyArea extends BaseComponent {
  #frames = this.shadowRoot.getElementById('frames');
  #framesWrapper = this.shadowRoot.getElementById('frames-wrapper');
  #frameTemplate = this.shadowRoot.getElementById('frame-template');

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

    isFrameSelected$.subscribe((isFrameSelected) => {
      this.#framesWrapper.hidden = isFrameSelected;
    }, {
      pushLatestValue: true,
      signal: this.destroyedSignal.signal
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

      frameElement.querySelector('#frame-name').textContent = frame.name;
      frameElement.querySelector('#frame-img').src = frame.img;
      frameElement.querySelector('#frame-img').alt = frame.name;
      frameElement.querySelector('#frame-select').id = `select-${frame.name}`;

      this.#frames.appendChild(frameElement);
    });
  }
}
