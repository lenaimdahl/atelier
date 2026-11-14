import { expect, test } from "vitest";
import { fitLogo, parseLogo } from "src/features/logo-motion/logo";

test("reads the size and every path", () => {
  const svg = `<svg viewBox="0 0 10 20">
    <path d="M0,0h1"/>
    <path class="cls-1"
      d="M1,1v2"/>
  </svg>`;

  expect(parseLogo(svg)).toEqual({ width: 10, height: 20, paths: ["M0,0h1", "M1,1v2"] });
});

test("fits the logo to 80 percent of the box and centers it", () => {
  expect(fitLogo({ width: 10, height: 20 }, { width: 100, height: 100 })).toEqual({ scale: 4, x: 30, y: 10 });
});
