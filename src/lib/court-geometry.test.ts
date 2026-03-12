import { expect, test, describe } from 'bun:test';
import {
  scale,
  isThreePointer,
  COURT_WIDTH_M,
  SVG_WIDTH,
  hoopX_svg,
  hoopY_svg,
  threePointRadius_svg,
  threePointSideLineXLeft_svg,
  threePointSideLineXRight_svg,
  threePointArcStartY_svg,
} from './court-geometry';

describe('court-geometry', () => {
  describe('scale', () => {
    test('should return 0 when input is 0', () => {
      expect(scale(0)).toBe(0);
    });

    test('should scale the full court width to SVG_WIDTH', () => {
      expect(scale(COURT_WIDTH_M)).toBe(SVG_WIDTH);
    });

    test('should scale half the court width to half of SVG_WIDTH', () => {
      expect(scale(COURT_WIDTH_M / 2)).toBe(SVG_WIDTH / 2);
    });

    test('should scale negative values correctly', () => {
      expect(scale(-COURT_WIDTH_M)).toBe(-SVG_WIDTH);
    });

    test('should scale arbitrary values correctly', () => {
      // 1.5m is 10% of 15m, so it should be 10% of 100 = 10
      expect(scale(1.5)).toBe(10);
    });

    test('should handle NaN input', () => {
      expect(scale(NaN)).toBeNaN();
    });

    test('should handle Infinity input', () => {
      expect(scale(Infinity)).toBe(Infinity);
    });

    test('should handle -Infinity input', () => {
      expect(scale(-Infinity)).toBe(-Infinity);
    });
  });

  describe('isThreePointer', () => {
    test('should return false for shots behind the backboard', () => {
      // BACKBOARD_Y_M is 1.2, scale(1.2) is 8
      expect(isThreePointer(hoopX_svg, scale(1.0))).toBe(false);
    });

    test('should return false for shots inside the vertical lines (corners 2-pointers)', () => {
      const insideVerticalX = threePointSideLineXLeft_svg + 1; // inside left line
      const cornerY = threePointArcStartY_svg - 1; // closer to baseline than the arc start
      expect(isThreePointer(insideVerticalX, cornerY)).toBe(false);

      const insideVerticalXRight = threePointSideLineXRight_svg - 1; // inside right line
      expect(isThreePointer(insideVerticalXRight, cornerY)).toBe(false);
    });

    test('should return true for shots outside the vertical lines (corners 3-pointers)', () => {
      const outsideVerticalXLeft = threePointSideLineXLeft_svg - 1; // outside left line
      const cornerY = threePointArcStartY_svg - 1; // closer to baseline than the arc start
      // Must be greater than backboard Y
      expect(isThreePointer(outsideVerticalXLeft, cornerY)).toBe(true);

      const outsideVerticalXRight = threePointSideLineXRight_svg + 1; // outside right line
      expect(isThreePointer(outsideVerticalXRight, cornerY)).toBe(true);
    });

    test('should return false for shots inside the arc', () => {
      // Shot at hoop center
      expect(isThreePointer(hoopX_svg, hoopY_svg)).toBe(false);

      // Shot just inside the arc
      const justInsideY = hoopY_svg + threePointRadius_svg - 1;
      expect(isThreePointer(hoopX_svg, justInsideY)).toBe(false);
    });

    test('should return false for shots exactly on the 3-point line (treated as 2-pointer)', () => {
      // Shot exactly on the arc (y-axis straight up)
      const exactlyOnArcY = hoopY_svg + threePointRadius_svg;
      expect(isThreePointer(hoopX_svg, exactlyOnArcY)).toBe(false);
    });

    test('should return true for shots outside the arc', () => {
      // Shot just outside the arc (y-axis straight up)
      const justOutsideY = hoopY_svg + threePointRadius_svg + 1;
      expect(isThreePointer(hoopX_svg, justOutsideY)).toBe(true);

      // Deep 3-pointer
      expect(
        isThreePointer(hoopX_svg, hoopY_svg + threePointRadius_svg + 20),
      ).toBe(true);
    });
  });
});
