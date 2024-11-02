import { sectionTypeToName } from '../helpers/utilities.js';

/**
 * Detail
 * @typedef {Object} ConnectionPoint
 * @property {number} id
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
 * @property {number} id
 * @property {'frame' | 'motor' | 'battery' | 'flight-controller' | 'camera' | 'video-antenna' | 'radio-module'} type
 * @property {string} name
 * @property {number} price
 * @property {number[]} compatibilityInch
 * @property {string} img
 */
export class Detail {
  constructor(id, type, name, price, compatibilityInch, img) {
    this.id = id;
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
   * @returns {string | null} error message or null when compatible
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

    return null;
  }

  /**
   * 'Copy' the detail
   * @returns {Detail}
   */
  copy() {
    return new Detail(this.id, this.type, this.name, this.price, this.compatibilityInch, this.img);
  }
}

export class Frame extends Detail {
  /**
   * @param {number} id
   * @param {string} name
   * @param {number} price
   * @param {number[]} compatibilityInch
   * @param {string} img
   * @param {ConnectionPoint[]} connectionPoints
   */
  constructor(id, name, price, compatibilityInch, img, connectionPoints) {
    super(id, 'frame', name, price, compatibilityInch, img);

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

  /**
   * 'Copy' the frame
   * @returns {Frame}
   */
  copy() {
    return new Frame(this.id, this.name, this.price, this.compatibilityInch, this.img, this.connectionPoints.map(point => {
      return {
        ...point,
        installedPart: point.installedPart ? point.installedPart.copy() : null
      };
    }));
  }
}