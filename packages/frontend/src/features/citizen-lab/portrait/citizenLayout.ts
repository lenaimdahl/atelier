import { CANVAS, centeredBox, type Box } from "src/features/citizen-lab/portrait/box";
import { DECO_DEFINITIONS, type DecoLayer, type DecoPiece, type DecoTint } from "src/features/citizen-lab/portrait/decoLayout";
import { HEAD_GEOMETRY, BODY_GEOMETRY, EYE_GEOMETRY, NOSE_SIZE, DEFAULT_NOSE_SIZE, type BodyGeometry, type HeadGeometry } from "src/features/citizen-lab/portrait/geometry";

function hairBox(hairId: number, head: HeadGeometry, headWidth: number, faceHeight: number): Box {
  const widthAt25 = Math.max(head.widthAt25, 0.4) * headWidth;
  const widthAt38 = Math.max(head.widthAt38, 0.5) * headWidth;
  if (hairId === 1) {
    // Quiff: the main swoop covers 20%–95% of the asset height, the curl sits above it.
    const width = widthAt38 * 1.06;
    const top = -faceHeight * 0.06;
    const height = (faceHeight * 0.42 - top) / 0.75;
    return { x: CANVAS.centerX - width / 2, y: top - 0.2 * height, width, height };
  }
  if (hairId === 2) {
    // Spikes: the inner arc (bottom 47% of the asset, 60% of its width) hugs the head top.
    const width = (widthAt25 / 0.6) * 0.85;
    const bottom = faceHeight * 0.25;
    const height = (bottom - faceHeight * 0.02) / 0.47;
    return { x: CANVAS.centerX - width / 2, y: bottom - height, width, height };
  }
  // Bowl cut: the dome starts ~14% below the asset top, the bangs end at the hairline.
  const width = widthAt38 * head.bowlCutWidthFactor;
  const bottom = faceHeight * 0.38;
  const height = (bottom + faceHeight * 0.04) / 0.86;
  return { x: CANVAS.centerX - width / 2, y: bottom - height, width, height };
}

const LOGO_ASSETS = {
  icon: { aspectRatio: 67.65 / 88.42, height: 46 },
  text: { aspectRatio: 138.02 / 71.06, height: 42 },
};
const LOGO_OFFSET = { left: 14, bottom: 16 };

export function logoBox(style: "icon" | "text"): Box {
  const { aspectRatio, height } = LOGO_ASSETS[style];
  return { x: LOGO_OFFSET.left, y: CANVAS.height - height - LOGO_OFFSET.bottom, width: height * aspectRatio, height };
}

export type CitizenSelection = {
  bodyId: number;
  headId: number;
  hairId: number;
  eyeId: number;
  noseId: number;
  mouthId: number;
  decoId: number;
};

export type PortraitLayout = {
  body: Box & { white: boolean };
  head: Box;
  hair: Box;
  eyes: Box;
  nose: Box;
  mouth: Box;
  tag: BodyGeometry["tag"];
  deco: { layer: DecoLayer; tint: DecoTint | undefined; pieces: DecoPiece[] } | null;
};

export function computePortraitLayout(selection: CitizenSelection): PortraitLayout {
  const head = HEAD_GEOMETRY[selection.headId] ?? HEAD_GEOMETRY[0];
  const body = BODY_GEOMETRY[selection.bodyId] ?? BODY_GEOMETRY[0];
  const eye = EYE_GEOMETRY[selection.eyeId] ?? EYE_GEOMETRY[0];

  const headWidth = Math.max(185, Math.min(CANVAS.width, 242 * head.aspectRatio));
  const headHeight = Math.min(242, headWidth / head.aspectRatio);
  const faceHeight = head.faceHeightRatio === 1 ? headHeight : headHeight * head.faceHeightRatio;
  const noseSize = NOSE_SIZE[selection.noseId] ?? DEFAULT_NOSE_SIZE;
  const eyeBox = centeredBox(CANVAS.centerX, faceHeight * 0.63, headWidth * 0.83 * eye.scale, faceHeight * 0.38 * eye.scale);

  const decoDefinition = DECO_DEFINITIONS[selection.decoId];
  const deco = decoDefinition
    ? {
        layer: decoDefinition.layer,
        tint: decoDefinition.tint,
        pieces: decoDefinition.layout({ head, body, headWidth, headHeight, faceHeight, eyeId: selection.eyeId, eyeBox }),
      }
    : null;

  return {
    body: { x: 20, y: 238, width: 280, height: 100, white: body.white },
    head: { x: (CANVAS.width - headWidth) / 2, y: 0, width: headWidth, height: headHeight },
    hair: hairBox(selection.hairId, head, headWidth, faceHeight),
    eyes: eyeBox,
    nose: centeredBox(CANVAS.centerX, faceHeight * 0.72, headWidth * noseSize.width, faceHeight * noseSize.height),
    mouth: centeredBox(CANVAS.centerX, faceHeight * 0.89, headWidth * 0.3125, faceHeight * 0.215),
    tag: body.tag,
    deco,
  };
}
