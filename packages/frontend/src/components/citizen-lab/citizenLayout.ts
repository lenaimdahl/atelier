import { ASSET_PART_GREEN, DECO_DEFAULT_COLOR } from "src/components/citizen-lab/citizenLabOptions";

export const CANVAS = { width: 320, height: 340, centerX: 160 } as const;

export type Box = { x: number; y: number; width: number; height: number };

export function centeredBox(centerX: number, centerY: number, width: number, height: number): Box {
  return {
    x: centerX - width / 2,
    y: centerY - height / 2,
    width,
    height,
  };
}

export function fitBox(centerX: number, centerY: number, maxWidth: number, maxHeight: number, aspectRatio: number): Box {
  const width = Math.min(maxWidth, maxHeight * aspectRatio);
  return centeredBox(centerX, centerY, width, width / aspectRatio);
}

type HeadGeometry = {
  aspectRatio: number;
  faceHeightRatio: number;
  /** Silhouette width (fraction of headWidth) at 25% / 38% of the face height. */
  widthAt25: number;
  widthAt38: number;
  bowlCutWidthFactor: number;
  ear: { halfWidth: number; top: number };
  stud: { halfWidth: number; y: number };
  compactHat: boolean;
};

export const HEAD_GEOMETRY: HeadGeometry[] = [
  { aspectRatio: 582.96 / 434.06, faceHeightRatio: 1, widthAt25: 0.72, widthAt38: 0.8, bowlCutWidthFactor: 1.04, ear: { halfWidth: 0.36, top: 0.42 }, stud: { halfWidth: 0.42, y: 0.62 }, compactHat: false },
  { aspectRatio: 408.18 / 345.52, faceHeightRatio: 1, widthAt25: 0.76, widthAt38: 0.82, bowlCutWidthFactor: 1.04, ear: { halfWidth: 0.4, top: 0.5 }, stud: { halfWidth: 0.39, y: 0.76 }, compactHat: false },
  { aspectRatio: 326.99 / 367.18, faceHeightRatio: 1, widthAt25: 0.99, widthAt38: 1, bowlCutWidthFactor: 1.12, ear: { halfWidth: 0.48, top: 0.5 }, stud: { halfWidth: 0.5, y: 0.7 }, compactHat: false },
  { aspectRatio: 372.24 / 375.56, faceHeightRatio: 1, widthAt25: 0.77, widthAt38: 0.92, bowlCutWidthFactor: 1.04, ear: { halfWidth: 0.48, top: 0.5 }, stud: { halfWidth: 0.49, y: 0.7 }, compactHat: true },
  { aspectRatio: 419 / 362.86, faceHeightRatio: 1, widthAt25: 0.25, widthAt38: 0.39, bowlCutWidthFactor: 1.04, ear: { halfWidth: 0.39, top: 0.8 }, stud: { halfWidth: 0.41, y: 0.84 }, compactHat: true },
  { aspectRatio: 342.55 / 636.54, faceHeightRatio: 1, widthAt25: 0.95, widthAt38: 0.99, bowlCutWidthFactor: 1.04, ear: { halfWidth: 0.44, top: 0.5 }, stud: { halfWidth: 0.37, y: 0.8 }, compactHat: false },
  { aspectRatio: 352.7 / 395.89, faceHeightRatio: 1, widthAt25: 0.85, widthAt38: 0.95, bowlCutWidthFactor: 1.04, ear: { halfWidth: 0.47, top: 0.5 }, stud: { halfWidth: 0.46, y: 0.72 }, compactHat: false },
  { aspectRatio: 401.88 / 556.63, faceHeightRatio: 415 / 556.63, widthAt25: 0.87, widthAt38: 0.96, bowlCutWidthFactor: 1.04, ear: { halfWidth: 0.47, top: 0.5 }, stud: { halfWidth: 0.43, y: 0.8 }, compactHat: false },
];

type BodyGeometry = {
  badge: { x: number; y: number };
  tag: { x: number; y: number; maxWidth: number };
  /** White bodies have no green to replace, so they are tinted instead. */
  white: boolean;
};

const DEFAULT_TAG = { x: 292, y: 322, maxWidth: 116 };

export const BODY_GEOMETRY: BodyGeometry[] = [
  { badge: { x: 120, y: 292 }, tag: DEFAULT_TAG, white: false },
  { badge: { x: 122, y: 300 }, tag: DEFAULT_TAG, white: false },
  { badge: { x: 118, y: 306 }, tag: { x: 248, y: 320, maxWidth: 72 }, white: false },
  { badge: { x: 150, y: 296 }, tag: DEFAULT_TAG, white: true },
];

type EyeGeometry = {
  aspectRatio: number;
  rightEyeCenter: number;
  scale: number;
};

export const EYE_GEOMETRY: Record<number, EyeGeometry> = {
  0: { aspectRatio: 500.22 / 207.35, rightEyeCenter: 0.79, scale: 0.8 },
  1: { aspectRatio: 503.3 / 86.71, rightEyeCenter: 0.79, scale: 1 },
  2: { aspectRatio: 221.51 / 78.64, rightEyeCenter: 0.82, scale: 1 },
  4: { aspectRatio: 520.84 / 146.39, rightEyeCenter: 0.78, scale: 1 },
  5: { aspectRatio: 503.41 / 129.82, rightEyeCenter: 0.79, scale: 1 },
  6: { aspectRatio: 575.21 / 128.31, rightEyeCenter: 0.75, scale: 1 },
  7: { aspectRatio: 623.93 / 244.69, rightEyeCenter: 0.75, scale: 1 },
  8: { aspectRatio: 451.03 / 160.85, rightEyeCenter: 0.79, scale: 1 },
  9: { aspectRatio: 473.98 / 169.68, rightEyeCenter: 0.8, scale: 1 },
  10: { aspectRatio: 361.42 / 141.61, rightEyeCenter: 0.81, scale: 1 },
  11: { aspectRatio: 395.96 / 163.58, rightEyeCenter: 0.75, scale: 0.85 },
};

const NOSE_SIZE: Record<number, { width: number; height: number }> = {
  2: { width: 0.125, height: 0.24 },
};
const DEFAULT_NOSE_SIZE = { width: 0.1, height: 0.2 };

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

export type DecoLayer = "body" | "head" | "eyes" | "mouth";

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
  0: { layer: "head", tint: GREEN_TINT, layout: earPieces },
  // Cap
  1: {
    layer: "head",
    tint: GREEN_TINT,
    layout: ({ headWidth, headHeight }) => [fitBox(X, -headHeight * 0.12, headWidth * 0.88, headHeight * 0.5, DECO_ASPECT_RATIOS[1])],
  },
  // Badge
  2: { layer: "body", tint: WHITE_TINT, layout: ({ body }) => [centeredBox(body.badge.x, body.badge.y, 30, 30)] },
  // Mustache
  3: {
    layer: "mouth",
    tint: GREEN_TINT,
    layout: ({ headWidth, faceHeight }) => [fitBox(X, faceHeight * 0.8, headWidth * 0.42, faceHeight * 0.14, DECO_ASPECT_RATIOS[3])],
  },
  // Fist
  4: {
    layer: "body",
    tint: WHITE_TINT,
    layout: () => [{ x: 316 - 76, y: 292 - 76 / DECO_ASPECT_RATIOS[4], width: 76, height: 76 / DECO_ASPECT_RATIOS[4] }],
  },
  // Green hat
  5: {
    layer: "head",
    tint: GREEN_TINT,
    layout: ({ head, headWidth, headHeight }) => [
      head.compactHat
        ? fitBox(X, -headHeight * 0.12, headWidth * 0.72, headHeight * 0.42, DECO_ASPECT_RATIOS[5])
        : fitBox(X, -headHeight * 0.12, headWidth * 0.88, headHeight * 0.5, DECO_ASPECT_RATIOS[5]),
    ],
  },
  // Glasses
  6: {
    layer: "eyes",
    tint: BLACK_TINT,
   
    layout: ({ headWidth, faceHeight }) => [fitBox(X, faceHeight * 0.63, headWidth, faceHeight * 0.5, DECO_ASPECT_RATIOS[6])],
  },
  // Pointy hat
  7: {
    layer: "head",
    tint: GREEN_TINT,
    layout: ({ headWidth, headHeight }) => [fitBox(X, -headHeight * 0.12, headWidth * 0.78, headHeight * 0.58, DECO_ASPECT_RATIOS[7])],
  },
  // Tie
  8: { layer: "body", tint: WHITE_TINT, layout: () => [centeredBox(X, 288, 16, 80)] },
  // Eye patch
  9: { layer: "eyes", tint: BLACK_TINT, layout: (context) => [eyePatchBox(context)] },
  // Diamonds
  10: { layer: "eyes", tint: WHITE_TINT, layout: studPieces },
};

export function decoTint(decoId: number): DecoTint | undefined {
  return DECO_DEFINITIONS[decoId]?.tint;
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
  const eyeBox = centeredBox(X, faceHeight * 0.63, headWidth * 0.83 * eye.scale, faceHeight * 0.38 * eye.scale);

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
    nose: centeredBox(X, faceHeight * 0.72, headWidth * noseSize.width, faceHeight * noseSize.height),
    mouth: centeredBox(X, faceHeight * 0.89, headWidth * 0.3125, faceHeight * 0.215),
    tag: body.tag,
    deco,
  };
}
