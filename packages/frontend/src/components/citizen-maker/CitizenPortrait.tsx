import type { Ref } from "react";
import { COLOR_HUES } from "src/pages/citizenMakerOptions";

const HEAD_ASPECT_RATIOS = [
  582.96 / 434.06,
  408.18 / 345.52,
  326.99 / 367.18,
  372.24 / 375.56,
  419 / 362.86,
  342.55 / 636.54,
  352.7 / 395.89,
  401.88 / 556.63,
];
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

// Deco0 (ears with earrings) is drawn as two cropped halves so each ear can be
// attached to the side of the head independently of the head's width.
const EAR_DECO_VIEWBOX = { width: 622.57, height: 313.32 };
const EAR_DECO_CROP_WIDTH = 175; // each half: ear wedge + earring
const EAR_DECO_INNER_EDGE = 166; // ear's inner edge, measured from the left of the asset
const EAR_DECO_EAR_WIDTH = 164; // width of the ear wedge itself
// Per head: half-width of the head silhouette (fraction of headWidth) where the ear attaches,
// and the y position of the ear's top edge (fraction of faceHeight).
const EAR_ATTACHMENT = [
  { halfWidth: 0.36, top: 0.42 },
  { halfWidth: 0.4, top: 0.5 },
  { halfWidth: 0.48, top: 0.5 },
  { halfWidth: 0.48, top: 0.5 },
  { halfWidth: 0.39, top: 0.8 },
  { halfWidth: 0.44, top: 0.5 },
  { halfWidth: 0.47, top: 0.5 },
  { halfWidth: 0.47, top: 0.5 },
];

function earDecoBoxes(headIndex: number, headWidth: number, faceHeight: number) {
  const attachment = EAR_ATTACHMENT[headIndex] ?? EAR_ATTACHMENT[0];
  const innerOffset = attachment.halfWidth * headWidth;
  // Ear is ~20% of the head width, but never pushed past the edge of the 320px canvas.
  const earWidth = Math.min(headWidth * 0.2, 158 - innerOffset);
  const scale = earWidth / EAR_DECO_EAR_WIDTH;
  const width = EAR_DECO_CROP_WIDTH * scale;
  const height = EAR_DECO_VIEWBOX.height * scale;
  const y = faceHeight * attachment.top;
  const rightCropX = EAR_DECO_VIEWBOX.width - EAR_DECO_CROP_WIDTH;
  return {
    left: { x: 160 - innerOffset - EAR_DECO_INNER_EDGE * scale, y, width, height, viewBox: `0 0 ${EAR_DECO_CROP_WIDTH} ${EAR_DECO_VIEWBOX.height}` },
    right: {
      x: 160 + innerOffset - (EAR_DECO_VIEWBOX.width - EAR_DECO_INNER_EDGE - rightCropX) * scale,
      y,
      width,
      height,
      viewBox: `${rightCropX} 0 ${EAR_DECO_CROP_WIDTH} ${EAR_DECO_VIEWBOX.height}`,
    },
  };
}

// Deco10 (diamond studs) is also split: each diamond sits on the side of the head at ear-lobe height.
const STUD_DECO_VIEWBOX = { width: 414.78, height: 108.19 };
const STUD_DECO_CROPS = [`0 0 108.19 108.19`, `306.59 0 108.19 108.19`];
// Per head: half-width of the head silhouette (fraction of headWidth) and stud center y (fraction of faceHeight).
const STUD_ATTACHMENT = [
  { halfWidth: 0.42, y: 0.62 },
  { halfWidth: 0.39, y: 0.76 },
  { halfWidth: 0.5, y: 0.7 },
  { halfWidth: 0.49, y: 0.7 },
  { halfWidth: 0.41, y: 0.84 },
  { halfWidth: 0.37, y: 0.8 },
  { halfWidth: 0.46, y: 0.72 },
  { halfWidth: 0.43, y: 0.8 },
];

function studDecoBoxes(headIndex: number, headWidth: number, faceHeight: number) {
  const attachment = STUD_ATTACHMENT[headIndex] ?? STUD_ATTACHMENT[0];
  const size = headWidth * 0.14;
  const y = faceHeight * attachment.y - size / 2;
  const offset = attachment.halfWidth * headWidth;
  return [
    { x: 160 - offset - size / 2, y, width: size, height: size, viewBox: STUD_DECO_CROPS[0] },
    { x: 160 + offset - size / 2, y, width: size, height: size, viewBox: STUD_DECO_CROPS[1] },
  ];
}

// Eye assets: aspect ratio and the right eye's center as a fraction of the asset width.
const EYE_LAYOUT: Record<number, { aspectRatio: number; rightEyeCenter: number }> = {
  0: { aspectRatio: 500.22 / 207.35, rightEyeCenter: 0.79 },
  1: { aspectRatio: 503.3 / 86.71, rightEyeCenter: 0.79 },
  2: { aspectRatio: 221.51 / 78.64, rightEyeCenter: 0.82 },
  4: { aspectRatio: 520.84 / 146.39, rightEyeCenter: 0.78 },
  5: { aspectRatio: 503.41 / 129.82, rightEyeCenter: 0.79 },
  6: { aspectRatio: 575.21 / 128.31, rightEyeCenter: 0.75 },
  7: { aspectRatio: 623.93 / 244.69, rightEyeCenter: 0.75 },
  8: { aspectRatio: 451.03 / 160.85, rightEyeCenter: 0.79 },
  9: { aspectRatio: 473.98 / 169.68, rightEyeCenter: 0.8 },
  10: { aspectRatio: 361.42 / 141.61, rightEyeCenter: 0.81 },
  11: { aspectRatio: 395.96 / 163.58, rightEyeCenter: 0.75 },
};

// Deco9 (eye patch): the patch oval's center and size within the asset, as fractions.
const PATCH_OVAL = { centerX: 0.539, centerY: 0.579 };

function eyePatchBox(eyeIndex: number, eyeBox: { x: number; y: number; width: number; height: number }) {
  const layout = EYE_LAYOUT[eyeIndex] ?? EYE_LAYOUT[0];
  // The eye image is drawn with "meet", so compute the actually rendered eye size.
  const eyeWidth = Math.min(eyeBox.width, eyeBox.height * layout.aspectRatio);
  const eyeHeight = eyeWidth / layout.aspectRatio;
  const width = Math.max(1.72 * eyeHeight, 0.7 * eyeWidth);
  const height = width / DECO_ASPECT_RATIOS[9];
  const centerX = 160 - eyeWidth / 2 + layout.rightEyeCenter * eyeWidth;
  const centerY = eyeBox.y + eyeBox.height / 2;
  return { x: centerX - PATCH_OVAL.centerX * width, y: centerY - PATCH_OVAL.centerY * height, width, height };
}

// Head silhouette width (fraction of headWidth) at 25% and 38% of the face height, used to fit the hair.
const HEAD_WIDTH_AT_25 = [0.72, 0.76, 0.99, 0.77, 0.25, 0.95, 0.85, 0.87];
const HEAD_WIDTH_AT_38 = [0.8, 0.82, 1, 0.92, 0.39, 0.99, 0.95, 0.96];

// Hair is stretched over the top of the head (preserveAspectRatio="none") so it follows each head's shape.
function hairBoxFor(hairIndex: number, headIndex: number, headWidth: number, faceHeight: number) {
  const widthAt25 = Math.max(HEAD_WIDTH_AT_25[headIndex] ?? 0.8, 0.4) * headWidth;
  const widthAt38 = Math.max(HEAD_WIDTH_AT_38[headIndex] ?? 0.9, 0.5) * headWidth;
  if (hairIndex === 1) {
    // Quiff: the main swoop covers 20%–95% of the asset height, the curl sits above it.
    const width = widthAt38 * 1.06;
    const top = -faceHeight * 0.06;
    const height = (faceHeight * 0.42 - top) / 0.75;
    return { x: 160 - width / 2, y: top - 0.2 * height, width, height };
  }
  if (hairIndex === 2) {
    // Spikes: the inner arc (bottom 47% of the asset, 60% of its width) hugs the head top.
    const width = (widthAt25 / 0.6) * 0.85;
    const bottom = faceHeight * 0.25;
    const height = (bottom - faceHeight * 0.02) / 0.47;
    return { x: 160 - width / 2, y: bottom - height, width, height };
  }
  // Bowl cut: the dome starts ~14% below the asset top, the bangs end at the hairline.
  const width = widthAt38 * (headIndex === 2 ? 1.12 : 1.04);
  const bottom = faceHeight * 0.38;
  const height = (bottom + faceHeight * 0.04) / 0.86;
  return { x: 160 - width / 2, y: bottom - height, width, height };
}

// Chest spot for the round badge deco (Deco2) on each body, in portrait coordinates.
const BADGE_POSITIONS = [
  { x: 108, y: 292 },
  { x: 122, y: 300 },
  { x: 118, y: 306 },
  { x: 150, y: 296 },
];

function centeredBox(centerX: number, centerY: number, width: number, height: number) {
  return {
    x: centerX - width / 2,
    y: centerY - height / 2,
    width,
    height,
  };
}

function fitBox(centerX: number, centerY: number, maxWidth: number, maxHeight: number, aspectRatio: number) {
  const width = Math.min(maxWidth, maxHeight * aspectRatio);
  return centeredBox(centerX, centerY, width, width / aspectRatio);
}

type CitizenPortraitProps = {
  portraitRef: Ref<SVGSVGElement>;
  citizenName: string;
  bodyColor: string;
  headColor: string;
  hairColor: string;
  decoColor: string;
  tagText: string;
  tagFontFamily: string;
  tagColor: string;
  bodyIndex: number;
  hairIndex: number;
  headIndex: number;
  eyeIndex: number;
  noseIndex: number;
  mouthIndex: number;
  decoIndex: number;
};

export function CitizenPortrait({
  portraitRef,
  citizenName,
  bodyColor,
  headColor,
  hairColor,
  decoColor,
  tagText,
  tagFontFamily,
  tagColor,
  bodyIndex,
  hairIndex,
  headIndex,
  eyeIndex,
  noseIndex,
  mouthIndex,
  decoIndex,
}: CitizenPortraitProps) {
  const headAspectRatio = HEAD_ASPECT_RATIOS[headIndex] ?? HEAD_ASPECT_RATIOS[0];
  const headWidth = Math.max(185, Math.min(320, 242 * headAspectRatio));
  const headHeight = Math.min(242, headWidth / headAspectRatio);
  const faceHeight = headIndex === 7 ? headHeight * (415 / 556.63) : headHeight;
  const headX = (320 - headWidth) / 2;
  const tagPosition = bodyIndex === 2
    ? { x: 248, y: 320, maxWidth: 72 }
    : { x: 292, y: 322, maxWidth: 116 };
  const tagTextWidth = Math.min(tagText.trim().length * 6.5, tagPosition.maxWidth);
  const eyeScale = eyeIndex === 11 ? 0.85 : 1;
  const eyeBox = centeredBox(160, faceHeight * 0.63, headWidth * 0.83 * eyeScale, faceHeight * 0.38 * eyeScale);
  const noseBox = noseIndex === 2
    ? centeredBox(160, faceHeight * 0.72, headWidth * 0.125, faceHeight * 0.24)
    : centeredBox(160, faceHeight * 0.72, headWidth * 0.1, faceHeight * 0.2);
  const mouthBox = centeredBox(160, faceHeight * 0.89, headWidth * 0.3125, faceHeight * 0.215);
  const hairBox = hairBoxFor(hairIndex, headIndex, headWidth, faceHeight);
  const decoLayouts = [
    fitBox(160, faceHeight * 0.82, headWidth * 1.25, faceHeight * 0.62, DECO_ASPECT_RATIOS[0]),
    fitBox(160, -headHeight * 0.12, headWidth * 0.88, headHeight * 0.5, DECO_ASPECT_RATIOS[1]),
    // Round badge pinned on the chest; the spot depends on the body shape.
    centeredBox(BADGE_POSITIONS[bodyIndex]?.x ?? 108, BADGE_POSITIONS[bodyIndex]?.y ?? 292, 30, 30),
    fitBox(160, faceHeight * 0.8, headWidth * 0.42, faceHeight * 0.14, DECO_ASPECT_RATIOS[3]),
    // Raised fist: rises from the right shoulder next to the head, sleeve tucked into the body.
    { x: 316 - 76, y: 292 - 76 / DECO_ASPECT_RATIOS[4], width: 76, height: 76 / DECO_ASPECT_RATIOS[4] },
    fitBox(160, -headHeight * 0.12, headWidth * 0.88, headHeight * 0.5, DECO_ASPECT_RATIOS[5]),
    fitBox(160, faceHeight * 0.63, headWidth, faceHeight * 0.5, DECO_ASPECT_RATIOS[6]),
    fitBox(160, -headHeight * 0.12, headWidth * 0.78, headHeight * 0.58, DECO_ASPECT_RATIOS[7]),
    fitBox(160 + headWidth * 0.38, faceHeight * 0.55, headWidth * 0.24, faceHeight * 0.66, DECO_ASPECT_RATIOS[8]),
    eyePatchBox(eyeIndex, eyeBox),
    centeredBox(160, 0, 0, 0), // studs are positioned via studDecoBoxes
  ];
  const tieDeco = decoIndex === 8;
  const decoBox = tieDeco
    ? centeredBox(160, 288, 16, 80)
    : decoIndex === 5 && (headIndex === 3 || headIndex === 4)
    ? fitBox(160, -headHeight * 0.12, headWidth * 0.72, headHeight * 0.42, DECO_ASPECT_RATIOS[5])
    : decoLayouts[decoIndex] ?? decoLayouts[0];
  const earDeco = decoIndex === 0;
  const earBoxes = earDeco ? earDecoBoxes(headIndex, headWidth, faceHeight) : null;
  const studDeco = decoIndex === 10;
  const studBoxes = studDeco ? studDecoBoxes(headIndex, headWidth, faceHeight) : null;
  const fistDeco = decoIndex === 4;
  const badgeDeco = decoIndex === 2;
  // The mustache sits over the mouth but under the nose.
  const mouthLayerDeco = decoIndex === 3;
  // Body-level decos are drawn over the body and head, below the face.
  const bodyLayerDeco = tieDeco || fistDeco || badgeDeco;
  const tintedDeco = fistDeco || badgeDeco;
  const eyeLayerDeco = decoIndex === 6 || decoIndex === 9;

  return (
    <svg ref={portraitRef} className="citizen-portrait" viewBox="0 0 320 340" aria-labelledby="citizen-portrait-title">
      <title id="citizen-portrait-title">{citizenName} citizen portrait</title>
      <defs>
        <filter id="head-color">
          <feFlood floodColor={headColor} result="tint" />
          <feComposite in="tint" in2="SourceAlpha" operator="in" />
        </filter>
        {/* Multiply tints the white parts while keeping outlines and shading lines. */}
        <filter id="deco-color" colorInterpolationFilters="sRGB">
          <feFlood floodColor={decoColor} result="tint" />
          <feBlend in="SourceGraphic" in2="tint" mode="multiply" result="tinted" />
          <feComposite in="tinted" in2="SourceAlpha" operator="in" />
        </filter>
        <filter id="hair-color">
          <feFlood floodColor={hairColor} result="tint" />
          <feComposite in="tint" in2="SourceAlpha" operator="in" />
        </filter>
      </defs>
      <image href={`/40c3-creator/Bodies/Body${bodyIndex}.svg`} x="20" y="238" width="280" height="100" preserveAspectRatio="xMidYMid meet" style={{ filter: `hue-rotate(${COLOR_HUES[bodyColor]}deg)` }} />
      <image href={`/40c3-creator/Heads/Head${headIndex}.svg`} x={headX} y="0" width={headWidth} height={headHeight} preserveAspectRatio="none" style={{ filter: "url(#head-color)" }} />
      {bodyLayerDeco && <image href={`/40c3-creator/Deco/Deco${decoIndex}.svg`} {...decoBox} preserveAspectRatio="xMidYMid meet" style={tintedDeco ? { filter: "url(#deco-color)" } : undefined} />}
      <image href={`/40c3-creator/Hair/Hair${hairIndex}.svg`} {...hairBox} preserveAspectRatio="none" style={{ filter: "url(#hair-color)" }} />
      {earBoxes && [earBoxes.left, earBoxes.right].map(({ viewBox, ...box }) => (
        <svg key={viewBox} {...box} viewBox={viewBox} preserveAspectRatio="xMinYMin meet">
          <image href={`/40c3-creator/Deco/Deco${decoIndex}.svg`} x="0" y="0" width={EAR_DECO_VIEWBOX.width} height={EAR_DECO_VIEWBOX.height} />
        </svg>
      ))}
      {!earDeco && !studDeco && !eyeLayerDeco && !bodyLayerDeco && !mouthLayerDeco && <image href={`/40c3-creator/Deco/Deco${decoIndex}.svg`} {...decoBox} preserveAspectRatio="xMidYMid meet" />}
      <image href={`/40c3-creator/Eyes/Eyes${eyeIndex}.svg`} {...eyeBox} preserveAspectRatio="xMidYMid meet" />
      {eyeLayerDeco && <image href={`/40c3-creator/Deco/Deco${decoIndex}.svg`} {...decoBox} preserveAspectRatio="xMidYMid meet" />}
      {studBoxes?.map(({ viewBox, ...box }) => (
        <svg key={viewBox} {...box} viewBox={viewBox}>
          <image href={`/40c3-creator/Deco/Deco${decoIndex}.svg`} x="0" y="0" width={STUD_DECO_VIEWBOX.width} height={STUD_DECO_VIEWBOX.height} />
        </svg>
      ))}
      <image href={`/40c3-creator/Mouths/Mouth${mouthIndex}.svg`} {...mouthBox} preserveAspectRatio="xMidYMid meet" />
      {mouthLayerDeco && <image href={`/40c3-creator/Deco/Deco${decoIndex}.svg`} {...decoBox} preserveAspectRatio="xMidYMid meet" />}
      <image href={`/40c3-creator/Noses/Nose${noseIndex}.svg`} {...noseBox} preserveAspectRatio="xMidYMid meet" />
      {tagText.trim() && (
        <text
          x={tagPosition.x}
          y={tagPosition.y}
          textAnchor="end"
          fill={tagColor}
          fontFamily={tagFontFamily}
          fontSize="11"
          textLength={tagTextWidth}
          lengthAdjust="spacingAndGlyphs"
          fontWeight="bold"
        >
          {tagText.trim()}
        </text>
      )}
    </svg>
  );
}