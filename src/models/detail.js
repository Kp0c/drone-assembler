/**
 * Detail
 * @typedef {Object} Detail
 * @property {'frame' | 'motor' | 'battery' | 'fligh-controller' | 'camera' | 'video-antenna' | 'radio-module'} type
 * @property {string} name
 * @property {number} price
 * @property {number[]} compatibilityInch
 * @property {string} img
 */
export class Detail {
  constructor(type, name, price, compatibilityInch, img) {
    this.type = type;
    this.name = name;
    this.price = price;
    this.compatibilityInch = compatibilityInch;
    this.img = img;
  }
}
