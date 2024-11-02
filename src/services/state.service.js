import { Observable } from '../helpers/observable';
import { Detail, Frame } from '../models/detail';


/**
 * @type {Detail[]}
 */
const allDetails = [
  new Frame('Mark 4 7"', 12, [7], 'assets/images/1 - frame 7 inches Mark_4.png', [
    { type: 'motor', x: 219, y: 329, size: 250, zIndex: 1 },
    { type: 'motor', x: 1824, y: 329, size: 250, zIndex: 1 },
    { type: 'motor', x: 219, y: 1706, size: 250, zIndex: 1 },
    { type: 'motor', x: 1824, y: 1706, size: 250, zIndex: 1 },
    { type: 'flight-controller', x: 1024, y: 1024, size: 150, zIndex: 1 },
    { type: 'battery', x: 1024, y: 900, size: 500, zIndex: 2 },
    { type: 'camera', x: 1020, y: 1500, size: 200, zIndex: 1 },
    { type: 'video-antenna', x: 1024, y: 300, size: 300, zIndex: 1 },
    { type: 'radio-module', x: 1024, y: 500, size: 300, zIndex: 1 },
  ]),
  new Frame('Mark 4 v2 10"', 20, [10], 'assets/images/2 - frame 10 inches Mark_4-v2.png', [
    { type: 'motor', x: 149, y: 308, size: 250, zIndex: 1 },
    { type: 'motor', x: 1882, y: 308, size: 250, zIndex: 1 },
    { type: 'motor', x: 149, y: 1768, size: 250, zIndex: 1 },
    { type: 'motor', x: 1882, y: 1768, size: 250, zIndex: 1 },
    { type: 'battery', x: 1024, y: 1024, size: 500, zIndex: 2 },
    { type: 'flight-controller', x: 1024, y: 1024, size: 150, zIndex: 1 },
    { type: 'camera', x: 1024, y: 1500, size: 200, zIndex: 1 },
    { type: 'video-antenna', x: 1024, y: 400, size: 300, zIndex: 1 },
    { type: 'radio-module', x: 1024, y: 400, size: 300, zIndex: 1 },
  ]),

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
 * @type {Observable<Frame[]>}
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
 * @type {Observable<Frame>}
 */
export const selectedFrame$ = new Observable(null);

/**
 * Current drag item
 * @type {Observable<Detail>}
 */
export const currentDragItem$ = new Observable(null);

/**
 * Select a frame and trigger the allParts$ observable with the compatible details
 * @param {number} id
 */
export function selectFrame(id) {
  const frame = getDetailById(id);

  selectedFrame$.next(frame);
}

/**
 * Select a part
 * @param {number} id
 * @param {ConnectionPoint} connectionPoint
 */
export function selectPart(id, connectionPoint) {
  connectionPoint.installedPart = getDetailById(id);

  selectedFrame$.reemit();
}

export function getDetailById(id) {
  return allDetails.find(detail => detail.id === id);
}

export function dragStart(id) {
  currentDragItem$.next(getDetailById(id));
}

export function stopDrag() {
  currentDragItem$.next(null);
}

/**
 * Uninstall a part
 * @param {number} id
 */
export function uninstallItem(id) {
  const frame = selectedFrame$.getLatestValue();

  if (frame.id === id) {
    selectedFrame$.next(null);
  } else {
    const connectionPoint = frame.connectionPoints.find(p => p.installedPart?.id === id);
    connectionPoint.installedPart = null;

    selectedFrame$.reemit();
  }

}

/**
 * Clear all parts
 */
export function clearAll() {
  const frame = selectedFrame$.getLatestValue();
  frame.connectionPoints.forEach(p => p.installedPart = null);

  selectedFrame$.next(null);
}

/**
 *
 * @type {Frame}
 */
const frame = allDetails.filter(detail => detail.isFrame())[1];
frame.connectionPoints.forEach((p) => {
  switch (p.type) {
    case 'motor':
      p.installedPart = allDetails.find(detail => detail.type === 'motor' && detail.compatibilityInch.includes(frame.compatibilityInch[0]));
      break;
    case 'battery':
      p.installedPart = allDetails.find(detail => detail.type === 'battery' && detail.compatibilityInch.includes(frame.compatibilityInch[0]));
      break;
    case 'flight-controller':
      p.installedPart = allDetails.find(detail => detail.type === 'flight-controller' && detail.compatibilityInch.includes(frame.compatibilityInch[0]));
      break;
    case 'camera':
      p.installedPart = allDetails.find(detail => detail.type === 'camera' && detail.compatibilityInch.includes(frame.compatibilityInch[0]));
      break;
    case 'video-antenna':
      p.installedPart = allDetails.find(detail => detail.type === 'video-antenna' && detail.compatibilityInch.includes(frame.compatibilityInch[0]));
      break;
    case 'radio-module':
      p.installedPart = allDetails.find(detail => detail.type === 'radio-module' && detail.compatibilityInch.includes(frame.compatibilityInch[0]));
      break;
  }
});

selectedFrame$.next(frame);
setTimeout(() => {
  selectedFrame$.next(frame);
}, 50);
allParts$.next(allDetails.filter(detail => !detail.isFrame()));

