import { describe, expect, test } from "vitest";
import { fit } from "src/features/logo-motion/logo/logoGeometry";

describe("fit", () => {
  test("scales a tall logo to the height and centers it horizontally", () => {
    expect(fit([10, 20], 100, 100, 0)).toEqual({ scale: 5, x: 25, y: 0 });
  });

  test("scales a wide logo to the width and centers it vertically", () => {
    expect(fit([20, 10], 100, 100, 0)).toEqual({ scale: 5, x: 0, y: 25 });
  });

  test("keeps the padding free on the tighter side", () => {
    expect(fit([10, 20], 100, 100, 10)).toEqual({ scale: 4, x: 30, y: 10 });
  });
});
