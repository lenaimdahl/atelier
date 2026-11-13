import { describe, expect, test } from "vitest";
import { LOGO_ICON, parseLogo } from "src/features/logo-motion/logo/logoPath";

describe("parseLogo", () => {
  test("reads the viewBox size and every path", () => {
    const svg = `<svg id="Ebene_2" viewBox="0 0 10 20">
      <path d="M0,0h1"/>
      <path class="cls-1"
        d="M1,1v2"/>
    </svg>`;

    expect(parseLogo(svg)).toEqual({ viewBox: [10, 20], paths: ["M0,0h1", "M1,1v2"] });
  });

  test("fails without a viewBox", () => {
    expect(() => parseLogo('<svg><path d="M0,0h1"/></svg>')).toThrow("Logo SVG has no viewBox");
  });
});

describe("LOGO_ICON", () => {
  test("has the size of Logo.svg", () => {
    expect(LOGO_ICON.viewBox).toEqual([67.65, 88.42]);
  });

  test("has all five complete shapes", () => {
    expect(LOGO_ICON.paths).toEqual(Array(5).fill(expect.stringMatching(/^M.*Z$/)));
  });
});
