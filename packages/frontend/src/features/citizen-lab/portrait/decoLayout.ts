import { PARTS, ASSET_PART_GREEN, DECO_DEFAULT_COLOR } from "src/features/citizen-lab/design/citizenLabOptions";
import { CANVAS, centeredBox, fitBox, type Box } from "src/features/citizen-lab/portrait/box";
import { EYE_GEOMETRY, type BodyGeometry, type HeadGeometry } from "src/features/citizen-lab/portrait/geometry";

export type DecoLayer = typeof PARTS.BODY | typeof PARTS.HEAD | typeof PARTS.EYES | typeof PARTS.MOUTH;

export type DecoPiece = Box & {
  crop?: { viewBox: string; assetWidth: number; assetHeight: number; preserveAspectRatio?: string };
};

type DecoContext = {
  head: HeadGeometry;
  body: BodyGeometry;
  headWidth: number;
  headHeight: number;
  faceHeight: number;
  eyeId: number;
  eyeBox: Box;
};

export type DecoTint = { mode: "multiply" | "fill" | "replace"; originalColor: string };

const WHITE_TINT: DecoTint = { mode: "multiply", originalColor: DECO_DEFAULT_COLOR };
const BLACK_TINT: DecoTint = { mode: "fill", originalColor: "#000000" };
const GREEN_TINT: DecoTint = { mode: "replace", originalColor: ASSET_PART_GREEN };

type DecoDefinition = {
  layer: DecoLayer;
  tint?: DecoTint;
  layout: (context: DecoContext) => DecoPiece[];
};

const DECO_ASPECT_RATIOS = [
  622.57 / 313.32,
  523.92 / 245.8,
  1,
  421.77 / 147.97,
  326.48 / 490.48,
  567.63 / 286.63,
  525.64 / 240.28,
  436.76 / 361.79,
  84.1 / 419.34,
  362.97 / 301.27,
  414.78 / 108.19,
];

const EAR_ASSET = { width: 622.57, height: 313.32 };
const EAR_CROP_WIDTH = 175;
const EAR_INNER_EDGE = 166;
const EAR_WEDGE_WIDTH = 164;

function earPieces({ head, headWidth, faceHeight }: DecoContext): DecoPiece[] {
  const innerOffset = head.ear.halfWidth * headWidth;
  const earWidth = Math.min(headWidth * 0.2, CANVAS.centerX - 2 - innerOffset);
  const scale = earWidth / EAR_WEDGE_WIDTH;
  const width = EAR_CROP_WIDTH * scale;
  const height = EAR_ASSET.height * scale;
  const y = faceHeight * head.ear.top;
  const rightCropX = EAR_ASSET.width - EAR_CROP_WIDTH;
  const crop = { assetWidth: EAR_ASSET.width, assetHeight: EAR_ASSET.height, preserveAspectRatio: "xMinYMin meet" };
  return [
    {
      x: CANVAS.centerX - innerOffset - EAR_INNER_EDGE * scale,
      y,
      width,
      height,
      crop: { ...crop, viewBox: `0 0 ${EAR_CROP_WIDTH} ${EAR_ASSET.height}` },
    },
    {
      x: CANVAS.centerX + innerOffset - (EAR_ASSET.width - EAR_INNER_EDGE - rightCropX) * scale,
      y,
      width,
      height,
      crop: { ...crop, viewBox: `${rightCropX} 0 ${EAR_CROP_WIDTH} ${EAR_ASSET.height}` },
    },
  ];
}

const STUD_ASSET = { width: 414.78, height: 108.19 };
const STUD_CROPS = [`0 0 108.19 108.19`, `306.59 0 108.19 108.19`];

function studPieces({ head, headWidth, faceHeight }: DecoContext): DecoPiece[] {
  const size = headWidth * 0.14;
  const y = faceHeight * head.stud.y - size / 2;
  const offset = head.stud.halfWidth * headWidth;
  const crop = { assetWidth: STUD_ASSET.width, assetHeight: STUD_ASSET.height };
  return [
    { x: CANVAS.centerX - offset - size / 2, y, width: size, height: size, crop: { ...crop, viewBox: STUD_CROPS[0] } },
    { x: CANVAS.centerX + offset - size / 2, y, width: size, height: size, crop: { ...crop, viewBox: STUD_CROPS[1] } },
  ];
}

// Center of the patch oval within the eye patch asset.
const PATCH_OVAL = { centerX: 0.539, centerY: 0.579 };

function eyePatchBox({ eyeId, eyeBox }: DecoContext): Box {
  const eye = EYE_GEOMETRY[eyeId] ?? EYE_GEOMETRY[0];
  // Eyes are drawn with "meet", so the rendered eye can be smaller than its box.
  const eyeWidth = Math.min(eyeBox.width, eyeBox.height * eye.aspectRatio);
  const eyeHeight = eyeWidth / eye.aspectRatio;
  const width = Math.max(1.72 * eyeHeight, 0.7 * eyeWidth);
  const height = width / DECO_ASPECT_RATIOS[9];
  const centerX = CANVAS.centerX - eyeWidth / 2 + eye.rightEyeCenter * eyeWidth;
  const centerY = eyeBox.y + eyeBox.height / 2;
  return { x: centerX - PATCH_OVAL.centerX * width, y: centerY - PATCH_OVAL.centerY * height, width, height };
}

const X = CANVAS.centerX;

export const DECO_DEFINITIONS: Record<number, DecoDefinition> = {
  // Ears
  0: { layer: PARTS.HEAD, tint: GREEN_TINT, layout: earPieces },
  // Cap
  1: {
    layer: PARTS.HEAD,
    tint: GREEN_TINT,
    layout: ({ headWidth, headHeight }) => [fitBox(X, -headHeight * 0.12, headWidth * 0.88, headHeight * 0.5, DECO_ASPECT_RATIOS[1])],
  },
  // Badge
  2: { layer: PARTS.BODY, tint: WHITE_TINT, layout: ({ body }) => [centeredBox(body.badge.x, body.badge.y, 30, 30)] },
  // Mustache
  3: {
    layer: PARTS.MOUTH,
    tint: GREEN_TINT,
    layout: ({ headWidth, faceHeight }) => [fitBox(X, faceHeight * 0.8, headWidth * 0.42, faceHeight * 0.14, DECO_ASPECT_RATIOS[3])],
  },
  // Fist
  4: {
    layer: PARTS.BODY,
    tint: WHITE_TINT,
    layout: () => [{ x: 316 - 76, y: 292 - 76 / DECO_ASPECT_RATIOS[4], width: 76, height: 76 / DECO_ASPECT_RATIOS[4] }],
  },
  // Green hat
  5: {
    layer: PARTS.HEAD,
    tint: GREEN_TINT,
    layout: ({ head, headWidth, headHeight }) => [
      head.compactHat
        ? fitBox(X, -headHeight * 0.12, headWidth * 0.72, headHeight * 0.42, DECO_ASPECT_RATIOS[5])
        : fitBox(X, -headHeight * 0.12, headWidth * 0.88, headHeight * 0.5, DECO_ASPECT_RATIOS[5]),
    ],
  },
  // Glasses
  6: {
    layer: PARTS.EYES,
    tint: BLACK_TINT,
   
    layout: ({ headWidth, faceHeight }) => [fitBox(X, faceHeight * 0.63, headWidth, faceHeight * 0.5, DECO_ASPECT_RATIOS[6])],
  },
  // Pointy hat
  7: {
    layer: PARTS.HEAD,
    tint: GREEN_TINT,
    layout: ({ headWidth, headHeight }) => [fitBox(X, -headHeight * 0.12, headWidth * 0.78, headHeight * 0.58, DECO_ASPECT_RATIOS[7])],
  },
  // Tie
  8: { layer: PARTS.BODY, tint: WHITE_TINT, layout: () => [centeredBox(X, 288, 16, 80)] },
  // Eye patch
  9: { layer: PARTS.EYES, tint: BLACK_TINT, layout: (context) => [eyePatchBox(context)] },
  // Diamonds
  10: { layer: PARTS.EYES, tint: WHITE_TINT, layout: studPieces },
};

export function decoTint(decoId: number): DecoTint | undefined {
  return DECO_DEFINITIONS[decoId]?.tint;
}
