import { sectionTypeToName } from '../helpers/maps.js';

/**
 * Detail
 * @typedef {Object} ConnectionPoint
 * @property {'motor' | 'battery' | 'flight-controller' | 'camera' | 'video-antenna' | 'radio-module'} type
 * @property {number} x
 * @property {number} y
 * @property {number} size
 * @property {number} zIndex
 * @property {Detail} installedPart
 */

/**
 * Detail
 * @typedef {Object} Detail
 * @property {'frame' | 'motor' | 'battery' | 'flight-controller' | 'camera' | 'video-antenna' | 'radio-module'} type
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

  /**
   * Check if the detail is a frame
   *
   * @returns {boolean}
   */
  isFrame() {
    return false;
  }

  /**
   * Check if the detail is compatible with a frame
   *
   * @param {number} frameInch
   * @returns {boolean}
   */
  isCompatibleWith(frameInch) {
    return this.compatibilityInch.includes(frameInch);
  }

  /**
   * Check if the detail is compatible with other parts
   * @param {Detail[]} parts
   * @returns {string}
   */
  checkCompatibilityWithOtherParts(parts) {
    if (this.type === 'motor') {
      const existingMotors = parts.filter(part => part.type === 'motor');
      // ensure that all motors are the same
      const otherMotor = existingMotors.find(motor => motor.name !== this.name);
      if (otherMotor) {
        return `This motor is not compatible with ${otherMotor.name}`;
      }

      // not more than 4 motors
      if (existingMotors.length >= 4) {
        return 'You can only have 4 motors';
      }
    } else {
      const existingPart = parts.find(part => part.type === this.type);
      if (existingPart) {
        return `You can only have 1 ${ sectionTypeToName[this.type] }`;
      }
    }
  }
}

export class Frame extends Detail {
  /**
   * @param {string} name
   * @param {number} price
   * @param {number[]} compatibilityInch
   * @param {string} img
   * @param {ConnectionPoint[]} connectionPoints
   */
  constructor(name, price, compatibilityInch, img, connectionPoints) {
    super('frame', name, price, compatibilityInch, img);

    this.connectionPoints = connectionPoints;
  }

  /**
   * Check if the detail is a frame
   *
   * @returns {boolean}
   */
  isFrame() {
    return true;
  }
}