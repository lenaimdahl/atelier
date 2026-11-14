import { expect, test } from "vitest";
import { parseLogo } from "src/features/logo-motion/logo/logoPath";

test("reads the size and every path", () => {
  const svg = `<svg viewBox="0 0 10 20">
    <path d="M0,0h1"/>
    <path class="cls-1"
      d="M1,1v2"/>
  </svg>`;

  expect(parseLogo(svg)).toEqual({ width: 10, height: 20, paths: ["M0,0h1", "M1,1v2"] });
});
