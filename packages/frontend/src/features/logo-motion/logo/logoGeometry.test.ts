import { expect, test } from "vitest";
import { fitLogo } from "src/features/logo-motion/logo/logoGeometry";

test("fits the logo to 80 percent of the box and centers it", () => {
  expect(fitLogo({ width: 10, height: 20 }, { width: 100, height: 100 })).toEqual({ scale: 4, x: 30, y: 10 });
});
