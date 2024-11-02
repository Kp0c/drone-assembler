import { describe, it, expect, beforeEach } from 'vitest';
import { Detail, Frame } from './detail.js';

describe('Detail', () => {
  describe('isFrame', () => {
    it('should return false', () => {
      const detailInstance = new Detail(1, 'motor', 'test', 100, [1, 2, 3], 'test.jpg');
      expect(detailInstance.isFrame()).toBe(false);
    });
  })

  describe('isCompatibleWith', () => {
    it('should return true when compatible', () => {
      const detailInstance = new Detail(1, 'motor', 'test', 100, [7, 10], 'test.jpg');
      expect(detailInstance.isCompatibleWith(7)).toBe(true);
    });

    it('should return false when not compatible', () => {
      const detailInstance = new Detail(1, 'motor', 'test', 100, [7], 'test.jpg');
      expect(detailInstance.isCompatibleWith(10)).toBe(false);
    });
  });

  describe('checkCompatibilityWithOtherParts', () => {
    describe('motor', () => {
      it('can accept only one type of motors', () => {
        const detailInstance = new Detail(1, 'motor', 'test', 100, [7, 10], 'test.jpg');
        const parts = [
          new Detail(2, 'motor', 'test2', 100, [7, 10], 'test.jpg'),
        ];

        expect(detailInstance.checkCompatibilityWithOtherParts(parts)).not.toBeNull();
      });

      it('can accept only 4 motors', () => {
        const detailInstance = new Detail(1, 'motor', 'test', 100, [7, 10], 'test.jpg');
        const parts = [
          new Detail(2, 'motor', 'test', 100, [7, 10], 'test.jpg'),
          new Detail(3, 'motor', 'test', 100, [7, 10], 'test.jpg'),
          new Detail(4, 'motor', 'test', 100, [7, 10], 'test.jpg'),
          new Detail(5, 'motor', 'test', 100, [7, 10], 'test.jpg'),
        ];

        expect(detailInstance.checkCompatibilityWithOtherParts(parts)).not.toBeNull();
      });
    });

    describe('other parts', () => {
      it('can accept only one type of part', () => {
        const detailInstance = new Detail(1, 'camera', 'test', 100, [7, 10], 'test.jpg');
        const parts = [
          new Detail(2, 'camera', 'test2', 100, [7, 10], 'test.jpg'),
        ];

        expect(detailInstance.checkCompatibilityWithOtherParts(parts)).not.toBeNull();
      });
    });

    it('returns null when compatible', () => {
      const detailInstance = new Detail(1, 'camera', 'test', 100, [7, 10], 'test.jpg');
      const parts = [];

      expect(detailInstance.checkCompatibilityWithOtherParts(parts)).toBeNull();
    });
  });

  describe('copy', () => {
    it('should return a new instance', () => {
      const detailInstance = new Detail(1, 'camera', 'test', 100, [7, 10], 'test.jpg');
      const copiedInstance = detailInstance.copy();

      expect(copiedInstance).not.toBe(detailInstance);
      expect(copiedInstance).toEqual(detailInstance);
    });
  });
});

describe('Frame', () => {
  it('should be a frame', () => {
    const frameInstance = new Frame(1, 'test', 100, [7, 10], 'test.jpg', []);
    expect(frameInstance.isFrame()).toBe(true);
  });

  describe('copy', () => {
    it('should return a new instance', () => {
      const frameInstance = new Frame(1, 'test', 100, [7, 10], 'test.jpg', []);
      const copiedInstance = frameInstance.copy();

      expect(copiedInstance).not.toBe(frameInstance);
      expect(copiedInstance).toEqual(frameInstance);
    });

    it('should perform a deep copy', () => {
      const frameInstance = new Frame(1, 'test', 100, [7, 10], 'test.jpg', []);
      const copiedInstance = frameInstance.copy();

      expect(copiedInstance.connectionPoints).not.toBe(frameInstance.connectionPoints);
      expect(copiedInstance.connectionPoints).toEqual(frameInstance.connectionPoints);
    });
  });
});