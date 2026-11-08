import { describe, expect, test } from "vitest";
import {
  BODY_GEOMETRY,
  CANVAS,
  computePortraitLayout,
  DECO_DEFINITIONS,
  EYE_GEOMETRY,
  HEAD_GEOMETRY,
  decoTint,
  logoBox,
  type CitizenSelection,
} from "src/components/citizen-lab/citizenLayout";
import { assetUrl } from "src/components/citizen-lab/citizenAssets";
import { CITIZENS, DECO, EYES, HAIR, HEADS, MOUTHS, NOSES } from "src/pages/citizenLabOptions";

function* allSelections(): Generator<CitizenSelection> {
  for (const bodyId of BODY_GEOMETRY.keys())
    for (const { id: headId } of HEADS)
      for (const { id: hairId } of HAIR)
        for (const { id: eyeId } of EYES)
          for (const { id: decoId } of DECO) {
            yield { bodyId, headId, hairId, eyeId, noseId: 0, mouthId: 0, decoId };
          }
}

describe("asset geometry", () => {
  test("every selectable option has layout data", () => {
    for (const { id } of HEADS) expect(HEAD_GEOMETRY[id], `head ${id}`).toBeDefined();
    for (const { id } of EYES) expect(EYE_GEOMETRY[id], `eyes ${id}`).toBeDefined();
    for (const { id } of DECO) expect(DECO_DEFINITIONS[id], `deco ${id}`).toBeDefined();
    for (const citizen of CITIZENS) {
      expect(BODY_GEOMETRY[citizen.bodyId], `${citizen.id} body`).toBeDefined();
      expect(HAIR.some((hair) => hair.id === citizen.hairId), `${citizen.id} hair`).toBe(true);
    }
  });

  test("every option has a bundled asset file", () => {
    const missing = [
      ...HEADS.map(({ id }) => `Heads/Head${id}.svg`),
      ...EYES.map(({ id }) => `Eyes/Eyes${id}.svg`),
      ...HAIR.map(({ id }) => `Hair/Hair${id}.svg`),
      ...DECO.map(({ id }) => `Deco/Deco${id}.svg`),
      ...BODY_GEOMETRY.map((_, id) => `Bodies/Body${id}.svg`),
      ...NOSES.map(({ id }) => `Noses/Nose${id}.svg`),
      ...MOUTHS.map(({ id }) => `Mouths/Mouth${id}.svg`),
      "Logos/Logo.svg",
      "Logos/LogoText.svg",
    ].filter((path) => !assetUrl(path).startsWith("data:image/svg+xml"));
    expect(missing).toEqual([]);
  });

  test("every deco can be recolored with the right mode", () => {
    const tints = Object.fromEntries(DECO.map(({ id }) => [id, decoTint(id)?.mode ?? null]));
    expect(tints).toEqual({ 0: "replace", 1: "replace", 2: "multiply", 3: "replace", 4: "multiply", 5: "replace", 6: "fill", 7: "replace", 8: "multiply", 9: "fill", 10: "multiply" });
  });
});

describe("portrait layout", () => {
  test("the logo stays inside the canvas, clear of the tag", () => {
    for (const style of ["icon", "text"] as const) {
      const logo = logoBox(style);
      expect(logo.x, style).toBeGreaterThanOrEqual(0);
      expect(logo.y + logo.height, style).toBeLessThanOrEqual(CANVAS.height);
      for (const body of BODY_GEOMETRY) {
        expect(logo.x + logo.width, style).toBeLessThan(body.tag.x - body.tag.maxWidth);
        const badgeLeft = body.badge.x - 15;
        const badgeBottom = body.badge.y + 15;
        expect(logo.x + logo.width <= badgeLeft || logo.y >= badgeBottom, `${style} vs badge`).toBe(true);
      }
    }
  });

  test("ears and studs stay horizontally inside the canvas", () => {
    for (const selection of allSelections()) {
      if (selection.decoId !== 0 && selection.decoId !== 10) continue;
      const { deco } = computePortraitLayout(selection);
      for (const piece of deco?.pieces ?? []) {
        expect(piece.x, JSON.stringify(selection)).toBeGreaterThanOrEqual(-1);
        expect(piece.x + piece.width, JSON.stringify(selection)).toBeLessThanOrEqual(CANVAS.width + 1);
      }
    }
  });

  test("split decos are drawn as two mirrored pieces", () => {
    for (const decoId of [0, 10]) {
      const { deco } = computePortraitLayout({ bodyId: 0, headId: 2, hairId: 0, eyeId: 0, noseId: 0, mouthId: 0, decoId });
      expect(deco?.pieces).toHaveLength(2);
      const [left, right] = deco!.pieces;
      expect(left.x + left.width / 2 + right.x + right.width / 2).toBeCloseTo(2 * CANVAS.centerX, 0);
    }
  });

  test("the eye patch covers the right eye", () => {
    for (const { id: eyeId } of EYES) {
      const layout = computePortraitLayout({ bodyId: 0, headId: 2, hairId: 0, eyeId, noseId: 0, mouthId: 0, decoId: 9 });
      const [patch] = layout.deco!.pieces;
      const eyeCenterY = layout.eyes.y + layout.eyes.height / 2;
      expect(patch.x, `eyes ${eyeId}`).toBeGreaterThan(CANVAS.centerX - patch.width / 2);
      expect(patch.y, `eyes ${eyeId}`).toBeLessThan(eyeCenterY);
      expect(patch.y + patch.height, `eyes ${eyeId}`).toBeGreaterThan(eyeCenterY);
    }
  });

  test("hair covers the top of the head", () => {
    for (const selection of allSelections()) {
      const { hair, head } = computePortraitLayout(selection);
      expect(hair.y, JSON.stringify(selection)).toBeLessThanOrEqual(head.y);
      expect(hair.width, JSON.stringify(selection)).toBeGreaterThan(head.width * 0.35);
    }
  });
});
