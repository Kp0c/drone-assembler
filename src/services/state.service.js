import { Observable } from '../helpers/observable';
import { Detail } from '../models/detail';


/**
 * @type {Detail[]}
 */
const allDetails = [
  new Detail('frame', 'Mark 4 7"', 12, [7], 'assets/images/1 - frame 7 inches Mark_4.png'),
  new Detail('frame', 'Mark 4 v2 10"', 20, [10], 'assets/images/2 - frame 10 inches Mark_4-v2.png'),

  new Detail('motor', 'FlashHobby 2807 1300kv + Props HQProp 7x4x3', 55, [7], 'assets/images/3 - motor 7 inches 2807 1300kv+7x4x3.png'),
  new Detail('motor', 'EMAX 2807 1300kv + Props HQProp 7x4x3', 45, [7], 'assets/images/3 - motor 7 inches 2807 1300kv+7x4x3.png'),
  new Detail('motor', 'ReadyToSky 3115 900kv + Props HQ MacroQuad Prop 10x5x3', 70, [10], 'assets/images/4 - motor 10 inches 3115+10x5x3.png'),
  new Detail('motor', 'BrotherHobby Tornado 3115 900kv + Props HQ MacroQuad Prop 10x5x3', 110, [10], 'assets/images/4 - motor 10 inches 3115+10x5x3.png'),

  new Detail('battery', '6s2p 8000mAh', 60, [7, 10], 'assets/images/5 - battery 6s2p.png'),
  new Detail('battery', '6s3p 12000mAh', 90, [7, 10], 'assets/images/6 - battery 6s3p.png'),

  new Detail('flight-controller', 'SpeedyBee V4 55A', 50, [7, 10], 'assets/images/7 - controller.png'),
  new Detail('flight-controller', 'Mamba F405 MK2', 70, [7, 10], 'assets/images/7 - controller.png'),

  new Detail('camera', 'Caddx Ratel Pro', 30, [7, 10], 'assets/images/8 -camera.png'),
  new Detail('camera', 'Foxeer Night Cat 3', 40, [7, 10], 'assets/images/8 -camera.png'),

  new Detail('video-antenna', 'Rush Cherry 2', 10, [7, 10], 'assets/images/9 -video antenna.png'),
  new Detail('video-antenna', 'SkyZone MushRoom', 8, [7, 10], 'assets/images/9 -video antenna.png'),

  new Detail('radio-module', 'Bayck ELRS 915mhz', 10, [7, 10], 'assets/images/10 - radio module.png'),
  new Detail('radio-module', 'HappyModel RX 915mhz', 15, [7, 10], 'assets/images/10 - radio module.png'),
];

/**
 * Available frames
 *
 * @type {Observable<Detail[]>}
 */
export const frames$ = new Observable(allDetails.filter(detail => detail.isFrame()));

/**
 * All parts (not frame)
 *
 * @type {Observable<Detail[]>}
 */
export const allParts$ = new Observable(allDetails.filter(detail => !detail.isFrame()));

/**
 * Is a frame selected
 * @type {Observable<boolean>}
 */
export const selectedFrame$ = new Observable(null);

/**
 * Select a frame and trigger the allParts$ observable with the compatible details
 * @param {string} frameName
 */
export function selectFrame(frameName) {
  const frame = allDetails.find(detail => detail.isFrame() && detail.name === frameName);

  selectedFrame$.next(frame);
}