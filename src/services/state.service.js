import { Observable } from '../helpers/observable';
import { Detail, Frame } from '../models/detail';

/**
 * @type {Detail[]}
 */
const allDetails = [
  new Frame(1, 'Mark 4 7"', 12, [7], '/images/1 - frame 7 inches Mark_4.png', [
    { id: 1, type: 'motor', x: 219, y: 329, size: 250, zIndex: 1 },
    { id: 2, type: 'motor', x: 1824, y: 329, size: 250, zIndex: 1 },
    { id: 3, type: 'motor', x: 219, y: 1706, size: 250, zIndex: 1 },
    { id: 4, type: 'motor', x: 1824, y: 1706, size: 250, zIndex: 1 },
    { id: 5, type: 'flight-controller', x: 1024, y: 1024, size: 150, zIndex: 1 },
    { id: 6, type: 'battery', x: 1024, y: 900, size: 500, zIndex: 2 },
    { id: 7, type: 'camera', x: 1020, y: 1500, size: 200, zIndex: 1 },
    { id: 8, type: 'video-antenna', x: 1024, y: 300, size: 300, zIndex: 1 },
    { id: 9, type: 'radio-module', x: 1024, y: 500, size: 300, zIndex: 1 },
  ]),
  new Frame(2, 'Mark 4 v2 10"', 20, [10], '/images/2 - frame 10 inches Mark_4-v2.png', [
    { id: 1, type: 'motor', x: 149, y: 308, size: 250, zIndex: 1 },
    { id: 2, type: 'motor', x: 1882, y: 308, size: 250, zIndex: 1 },
    { id: 3, type: 'motor', x: 149, y: 1768, size: 250, zIndex: 1 },
    { id: 4, type: 'motor', x: 1882, y: 1768, size: 250, zIndex: 1 },
    { id: 5, type: 'battery', x: 1024, y: 1024, size: 500, zIndex: 2 },
    { id: 6, type: 'flight-controller', x: 1024, y: 1024, size: 150, zIndex: 1 },
    { id: 7, type: 'camera', x: 1024, y: 1500, size: 200, zIndex: 1 },
    { id: 8, type: 'video-antenna', x: 1024, y: 400, size: 300, zIndex: 1 },
    { id: 9, type: 'radio-module', x: 1024, y: 400, size: 300, zIndex: 1 },
  ]),

  new Detail(3, 'motor', 'FlashHobby 2807 1300kv + Props HQProp 7x4x3', 55, [7], '/images/3 - motor 7 inches 2807 1300kv+7x4x3.png'),
  new Detail(4, 'motor', 'EMAX 2807 1300kv + Props HQProp 7x4x3', 45, [7], '/images/3 - motor 7 inches 2807 1300kv+7x4x3.png'),
  new Detail(5, 'motor', 'ReadyToSky 3115 900kv + Props HQ MacroQuad Prop 10x5x3', 70, [10], '/images/4 - motor 10 inches 3115+10x5x3.png'),
  new Detail(6, 'motor', 'BrotherHobby Tornado 3115 900kv + Props HQ MacroQuad Prop 10x5x3', 110, [10], '/images/4 - motor 10 inches 3115+10x5x3.png'),

  new Detail(7, 'battery', '6s2p 8000mAh', 60, [7, 10], '/images/5 - battery 6s2p.png'),
  new Detail(8, 'battery', '6s3p 12000mAh', 90, [7, 10], '/images/6 - battery 6s3p.png'),

  new Detail(9, 'flight-controller', 'SpeedyBee V4 55A', 50, [7, 10], '/images/7 - controller.png'),
  new Detail(10, 'flight-controller', 'Mamba F405 MK2', 70, [7, 10], '/images/7 - controller.png'),

  new Detail(11, 'camera', 'Caddx Ratel Pro', 30, [7, 10], '/images/8 -camera.png'),
  new Detail(12, 'camera', 'Foxeer Night Cat 3', 40, [7, 10], '/images/8 -camera.png'),

  new Detail(13, 'video-antenna', 'Rush Cherry 2', 10, [7, 10], '/images/9 -video antenna.png'),
  new Detail(14, 'video-antenna', 'SkyZone MushRoom', 8, [7, 10], '/images/9 -video antenna.png'),

  new Detail(15, 'radio-module', 'Bayck ELRS 915mhz', 10, [7, 10], '/images/10 - radio module.png'),
  new Detail(16, 'radio-module', 'HappyModel RX 915mhz', 15, [7, 10], '/images/10 - radio module.png'),
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
 * Current price
 * @type {Observable<number>}
 */
export const currentPrice$ = new Observable(0);

/**
 * Max price
 * @type {Observable<number | null>}
 */
export const maxPrice$ = new Observable(null);

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
  const frame = selectedFrame$.getLatestValue().copy();

  const newConnectionPoint = frame.connectionPoints.find(p => p.id === connectionPoint.id);
  newConnectionPoint.installedPart = getDetailById(id);

  selectedFrame$.next(frame);
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
    const frameCopy = frame.copy();
    const connectionPoint = frameCopy.connectionPoints.find(p => p.installedPart?.id === id);
    connectionPoint.installedPart = null;

    selectedFrame$.next(frameCopy);
  }
}

/**
 * Clear all parts
 */
export function clearAll() {
  const frame = selectedFrame$.getLatestValue()?.copy();

  if (!frame) {
    return;
  }

  frame.connectionPoints.forEach(p => p.installedPart = null);

  selectedFrame$.next(null);
}

/**
 * @typedef {Object} ImportedData
 * @property {number} id
 * @property {number} positionId
 */

/**
 *
 * @param {ImportedData[]} data
 */
export function importData(data) {
  const frameRaw = data.find(d => !d.positionId);

  if (frameRaw) {
    /**
     * @type {Frame}
     */
    const frame = getDetailById(frameRaw.id).copy();
    frame.connectionPoints.forEach(p => {
      const detailRaw = data.find(d => d.positionId === p.id);
      if (detailRaw) {
        p.installedPart = getDetailById(detailRaw.id).copy();
      }
    });

    selectedFrame$.next(frame);
  }
}

export function setMaxPrice(price) {
  maxPrice$.next(price);
}

selectedFrame$.subscribe((frame) => {
  if (!frame) {
    currentPrice$.next(0);
    return;
  }

  const price = frame.connectionPoints.reduce((acc, p) => {
    if (p.installedPart) {
      acc += p.installedPart.price;
    }
    return acc;
  }, frame.price);

  currentPrice$.next(price);
});
