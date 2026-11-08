import { describe, expect, test } from "vitest";
import {
  DEFAULT_DESIGN,
  decodeDesign,
  encodeDesign,
  FIELD_SIZES,
  TAG_MAX_LENGTH,
  type CitizenDesign,
} from "src/components/citizen-lab/citizenShareState";
import {
  CITIZENS,
  COLORS,
  DECO_DEFAULT_COLOR,
  FEATURES,
  LOGO_COLORS,
  LOGO_STYLES,
  TAG_COLORS,
  TAG_FONTS,
} from "src/components/citizen-lab/citizenLabOptions";

const roundTrip = (design: CitizenDesign) => decodeDesign(encodeDesign(design));

const FULL_DESIGN: CitizenDesign = {
  citizenId: "adam",
  features: { head: 3, eyes: 5, nose: 1, hair: 2, mouth: 7, deco: 4 },
  colors: { body: COLORS[4], head: COLORS[1], hair: COLORS[7], deco: COLORS[2], eyes: COLORS[5], nose: COLORS[6], mouth: COLORS[3] },
  tag: { text: "#chaos & co?", fontFamily: TAG_FONTS[1].value, color: TAG_COLORS[8] },
  logo: { style: "text", color: LOGO_COLORS[9] },
  hardToClassify: true,
};

describe("citizen share codes", () => {
  test("the code is short and URL-safe", () => {
    const withoutTag = encodeDesign({ ...FULL_DESIGN, tag: { ...FULL_DESIGN.tag, text: "" } });
    expect(withoutTag).toMatch(/^1[0-9A-Za-z]{1,9}$/);
    expect(encodeDesign({ ...FULL_DESIGN, tag: { ...FULL_DESIGN.tag, text: "#chaos" } })).toBe(`${withoutTag}.I2NoYW9z`);
  });

  test("every feature option survives a round trip", () => {
    for (const { key, options } of FEATURES) {
      for (let position = 0; position < options.length; position++) {
        const design = { ...DEFAULT_DESIGN, features: { ...DEFAULT_DESIGN.features, [key]: position } };
        expect(roundTrip(design), `${key} ${position}`).toEqual(design);
      }
    }
  });

  test("citizens, colors, tag, logo and toggle survive a round trip", () => {
    for (const citizen of CITIZENS) {
      const design = { ...FULL_DESIGN, citizenId: citizen.id };
      expect(roundTrip(design), citizen.id).toEqual(design);
    }
    const originalDeco = { ...DEFAULT_DESIGN, colors: { ...DEFAULT_DESIGN.colors, deco: DECO_DEFAULT_COLOR } };
    expect(roundTrip(originalDeco)).toEqual(originalDeco);
  });

  test("every logo style and color survives a round trip", () => {
    for (const style of LOGO_STYLES) {
      for (const color of LOGO_COLORS) {
        const design = { ...DEFAULT_DESIGN, logo: { style, color } };
        expect(roundTrip(design), `${style} ${color}`).toEqual(design);
      }
    }
  });

  test("tags with any characters survive a round trip", () => {
    for (const text of ["#chaos & co?", "Grüße aus Hamburg", "🐝 hack the planet", "a.b/c?d#e"]) {
      const design = { ...DEFAULT_DESIGN, tag: { ...DEFAULT_DESIGN.tag, text } };
      expect(roundTrip(design), text).toEqual(design);
    }
  });

  test("invalid codes are rejected", () => {
    for (const code of ["", "1", "2abc", "1ab!c", "1zzzzzzzzzzzz"]) {
      expect(decodeDesign(code), code).toBeNull();
    }
  });

  test("an overlong or broken tag is cut or dropped", () => {
    const code = encodeDesign(DEFAULT_DESIGN);
    const longTag = btoa("x".repeat(TAG_MAX_LENGTH + 20)).replace(/=+$/, "");
    expect(decodeDesign(`${code}.${longTag}`)?.tag.text).toHaveLength(TAG_MAX_LENGTH);
    expect(decodeDesign(`${code}.!!!`)?.tag.text).toBe("");
  });

  test("every option fits its field, so new parts need a new code version", () => {
    const [, hair, head, eyes, nose, mouth, deco] = FIELD_SIZES;
    const sizes = { hair, head, eyes, nose, mouth, deco };
    for (const { key, options } of FEATURES) {
      expect(Math.max(...options.map(({ id }) => id)), key).toBeLessThan(sizes[key]);
    }
  });
});
