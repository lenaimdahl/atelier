import { describe, expect, test } from "vitest";
import {
  DEFAULT_DESIGN,
  designFromSearchParams,
  designToSearchParams,
  hairPositionFor,
  type CitizenDesign,
} from "src/components/citizen-maker/citizenShareState";
import { CITIZENS, COLORS, DECO_DEFAULT_COLOR, FEATURES, TAG_FONTS } from "src/pages/citizenMakerOptions";

const roundTrip = (design: CitizenDesign) =>
  designFromSearchParams(new URLSearchParams(designToSearchParams(design).toString()));

describe("citizen share links", () => {
  test("the default design produces a clean URL", () => {
    expect(designToSearchParams(DEFAULT_DESIGN).toString()).toBe("");
    expect(designFromSearchParams(new URLSearchParams())).toEqual(DEFAULT_DESIGN);
  });

  test("every feature option survives a round trip", () => {
    for (const { key, options } of FEATURES) {
      for (let position = 0; position < options.length; position++) {
        const design = { ...DEFAULT_DESIGN, features: { ...DEFAULT_DESIGN.features, [key]: position } };
        expect(roundTrip(design), `${key} ${position}`).toEqual(design);
      }
    }
  });

  test("citizens, colors, tag and toggle survive a round trip", () => {
    for (const citizen of CITIZENS) {
      const design: CitizenDesign = {
        citizenId: citizen.id,
        features: { head: 3, eyes: 5, nose: 1, hair: 2, mouth: 7, deco: 4 },
        colors: { body: COLORS[4], head: COLORS[1], hair: COLORS[7], deco: COLORS[2] },
        tag: { text: "#chaos & co?", fontFamily: TAG_FONTS[1].value, color: COLORS[3] },
        hardToClassify: true,
      };
      expect(roundTrip(design), citizen.id).toEqual(design);
    }
    const whiteDeco = { ...DEFAULT_DESIGN, features: { ...DEFAULT_DESIGN.features, deco: 4 }, colors: { ...DEFAULT_DESIGN.colors, deco: DECO_DEFAULT_COLOR } };
    expect(roundTrip(whiteDeco)).toEqual(whiteDeco);
  });

  test("a citizen's own hair counts as default and is omitted", () => {
    for (const citizen of CITIZENS) {
      const design = { ...DEFAULT_DESIGN, citizenId: citizen.id, features: { ...DEFAULT_DESIGN.features, hair: hairPositionFor(citizen) } };
      expect(designToSearchParams(design).has("hair"), citizen.id).toBe(false);
      expect(roundTrip(design), citizen.id).toEqual(design);
    }
  });

  test("invalid or tampered values fall back to defaults", () => {
    const design = designFromSearchParams(
      new URLSearchParams("citizen=nobody&head=99&eyes=3&deco=abc&bodyColor=123456&decoColor=zzz&font=7&tagColor=fffbff&odd=yes&tag=" + "x".repeat(50)),
    );
    expect(design.citizenId).toBe(DEFAULT_DESIGN.citizenId);
    // Eyes asset 3 does not exist, so it is rejected too.
    expect(design.features).toEqual(DEFAULT_DESIGN.features);
    expect(design.colors).toEqual(DEFAULT_DESIGN.colors);
    expect(design.tag.fontFamily).toBe(TAG_FONTS[0].value);
    // White is only allowed for decos, not for the tag.
    expect(design.tag.color).toBe(DEFAULT_DESIGN.tag.color);
    expect(design.tag.text).toHaveLength(20);
    expect(design.hardToClassify).toBe(false);
  });

  test("colors are case-insensitive and stored without #", () => {
    const params = designToSearchParams({ ...DEFAULT_DESIGN, colors: { ...DEFAULT_DESIGN.colors, body: "#ee5da2" } });
    expect(params.get("bodyColor")).toBe("ee5da2");
    expect(designFromSearchParams(new URLSearchParams("bodyColor=EE5DA2")).colors.body).toBe("#ee5da2");
  });
});
