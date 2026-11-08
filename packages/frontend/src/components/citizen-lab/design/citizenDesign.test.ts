import { describe, expect, test } from "vitest";
import { citizenOf, cycleOption, randomParts, selectionOf } from "src/components/citizen-lab/design/citizenDesign";
import { CITIZENS, COLORS, FEATURES } from "src/components/citizen-lab/design/citizenLabOptions";
import { DEFAULT_DESIGN } from "src/components/citizen-lab/design/citizenShareState";

describe("cycleOption", () => {
  test("moves one step in either direction", () => {
    expect(cycleOption(2, 5, 1)).toBe(3);
    expect(cycleOption(2, 5, -1)).toBe(1);
  });

  test("wraps around at both ends", () => {
    expect(cycleOption(4, 5, 1)).toBe(0);
    expect(cycleOption(0, 5, -1)).toBe(4);
  });
});

describe("citizenOf", () => {
  test("finds the citizen of a design", () => {
    expect(citizenOf({ ...DEFAULT_DESIGN, citizenId: "adam" }).id).toBe("adam");
  });

  test("falls back to the first citizen for an unknown id", () => {
    expect(citizenOf({ ...DEFAULT_DESIGN, citizenId: "unknown" as never })).toBe(CITIZENS[0]);
  });
});

describe("selectionOf", () => {
  test("takes the body from the citizen and the other ids from the feature options", () => {
    const selection = selectionOf({ ...DEFAULT_DESIGN, citizenId: "adam" });
    expect(selection.bodyId).toBe(CITIZENS[3].bodyId);
    expect(selection.eyeId).toBe(FEATURES.find(({ key }) => key === "eyes")?.options[DEFAULT_DESIGN.features.eyes].id);
  });
});

describe("randomParts", () => {
  test("never picks the current citizen", () => {
    for (let run = 0; run < 50; run += 1) {
      expect(randomParts("mona").citizenId).not.toBe("mona");
    }
  });

  test("only uses palette colors and keeps eyes, nose and mouth apart from the head", () => {
    for (let run = 0; run < 50; run += 1) {
      const { colors } = randomParts();
      expect(Object.values(colors).every((color) => COLORS.includes(color))).toBe(true);
      expect([colors.eyes, colors.nose, colors.mouth]).not.toContain(colors.head);
    }
  });

  test("picks a valid option position for every feature", () => {
    const { features } = randomParts();
    for (const { key, options } of FEATURES) {
      expect(features[key]).toBeGreaterThanOrEqual(0);
      expect(features[key]).toBeLessThan(options.length);
    }
  });
});
