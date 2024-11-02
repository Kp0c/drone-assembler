import template from './parts.html?raw';
import styles from './parts.css?inline'
import { BaseComponent } from '../base-component.js';

export class Parts extends BaseComponent {
  constructor() {
    super(template, styles);
  }
}
