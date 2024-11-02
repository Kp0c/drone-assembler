import { describe, it, expect, beforeEach } from 'vitest';
import { History } from './history.js';

describe('History', () => {
  let historyInstance;

  beforeEach(() => {
    historyInstance = new History();
  });

  it('should undo the last change', () => {
    const frame1 = { id: 1 };
    const frame2 = { id: 2 };
    historyInstance.newChange(frame1);
    historyInstance.newChange(frame2);

    expect(historyInstance.undo()).toEqual(frame1);
  });

  it('should redo the last change', () => {
    const frame1 = { id: 1 };
    const frame2 = { id: 2 };
    historyInstance.newChange(frame1);
    historyInstance.newChange(frame2);
    historyInstance.undo();

    expect(historyInstance.redo()).toEqual(frame2);
  });

  it('should check if can undo positive', () => {
    expect(historyInstance.canUndo()).toBe(false);

    const frame = { id: 1 };
    historyInstance.newChange(frame);

    expect(historyInstance.canUndo()).toBe(true);
  });

  it('should check if can undo negative', () => {
    expect(historyInstance.canUndo()).toBe(false);
  });

  it('should check if can redo positive', () => {
    const frame = { id: 1 };
    historyInstance.newChange(frame);
    historyInstance.undo();

    expect(historyInstance.canRedo()).toBe(true);
  });

  it('should check if can redo negative', () => {
    expect(historyInstance.canRedo()).toBe(false);
  });

  it('should reset redo history when new change is made', () => {
    const frame1 = { id: 1 };
    const frame2 = { id: 2 };
    historyInstance.newChange(frame1);
    historyInstance.undo();
    historyInstance.newChange(frame2);

    expect(historyInstance.canRedo()).toBe(false);
  });
});