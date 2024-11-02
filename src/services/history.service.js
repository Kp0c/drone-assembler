import { Observable } from '../helpers/observable.js';
import { History } from '../models/history.js';
import { selectedFrame$ } from './state.service.js';

const history = new History();

/**
 * Can undo?
 *
 * @type {Observable<boolean>}
 */
export const canUndo$ = new Observable(false);

/**
 * Can redo?
 *
 * @type {Observable<boolean>}
 */
export const canRedo$ = new Observable(false);

let isSelfPushed = false;
selectedFrame$.subscribe((frame) => {
  if (isSelfPushed) {
    isSelfPushed = false;
  } else {
    history.newChange(frame);
  }

  canUndo$.next(history.canUndo());
  canRedo$.next(history.canRedo());
});

/**
 * Undo the last change
 */
export function undo() {
  const frame = history.undo();

  pushChange(frame);
}

/**
 * Redo the last change
 */
export function redo() {
  const frame = history.redo();

  pushChange(frame);
}

function pushChange(frame) {
  isSelfPushed = true;
  selectedFrame$.next(frame);
}