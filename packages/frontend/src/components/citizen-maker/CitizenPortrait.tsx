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
  citizenName: string;
  bodyColor: string;
  headColor: string;
  hairColor: string;
  bodyIndex: number;
  hairIndex: number;
  headIndex: number;
  eyeIndex: number;
  noseIndex: number;
  mouthIndex: number;
  decoIndex: number;
};

export function CitizenPortrait({
  citizenName,
  bodyColor,
  headColor,
  hairColor,
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
  const eyeScale = eyeIndex === 11 ? 0.85 : 1;
  const eyeBox = centeredBox(160, faceHeight * 0.63, headWidth * 0.83 * eyeScale, faceHeight * 0.38 * eyeScale);
  const noseBox = noseIndex === 2
    ? centeredBox(160, faceHeight * 0.72, headWidth * 0.125, faceHeight * 0.24)
    : centeredBox(160, faceHeight * 0.72, headWidth * 0.1, faceHeight * 0.2);
  const mouthBox = centeredBox(160, faceHeight * 0.89, headWidth * 0.3125, faceHeight * 0.215);
  const hairBox = centeredBox(160, faceHeight * 0.2, headWidth * 0.54, faceHeight * 0.35);
  const decoLayouts = [
    fitBox(160, faceHeight * 0.82, headWidth * 1.25, faceHeight * 0.62, DECO_ASPECT_RATIOS[0]),
    fitBox(160, -headHeight * 0.12, headWidth * 0.88, headHeight * 0.5, DECO_ASPECT_RATIOS[1]),
    fitBox(160 + headWidth * 0.38, faceHeight * 0.35, headWidth * 0.32, faceHeight * 0.32, DECO_ASPECT_RATIOS[2]),
    fitBox(160, faceHeight * 0.8, headWidth * 0.6, faceHeight * 0.19, DECO_ASPECT_RATIOS[3]),
    fitBox(160, -headHeight * 0.12, headWidth * 0.88, headHeight * 0.5, DECO_ASPECT_RATIOS[4]),
    fitBox(160, -headHeight * 0.12, headWidth * 0.88, headHeight * 0.5, DECO_ASPECT_RATIOS[5]),
    fitBox(160, faceHeight * 0.63, headWidth, faceHeight * 0.5, DECO_ASPECT_RATIOS[6]),
    fitBox(160, -headHeight * 0.12, headWidth * 0.78, headHeight * 0.58, DECO_ASPECT_RATIOS[7]),
    fitBox(160 + headWidth * 0.38, faceHeight * 0.55, headWidth * 0.24, faceHeight * 0.66, DECO_ASPECT_RATIOS[8]),
    fitBox(160 + headWidth * 0.243, faceHeight * 0.63, headWidth * 0.5, faceHeight * 0.52, DECO_ASPECT_RATIOS[9]),
    fitBox(160, faceHeight * 0.43, headWidth * 1.28, faceHeight * 0.42, DECO_ASPECT_RATIOS[10]),
  ];
  const tieDeco = decoIndex === 8;
  const decoBox = tieDeco
    ? centeredBox(160, 288, 16, 80)
    : decoIndex === 0 && headIndex === 4
    ? fitBox(160, faceHeight * 0.82, headWidth * 1.1, faceHeight * 0.62, DECO_ASPECT_RATIOS[0])
    : decoIndex === 0 && headIndex === 5
    ? fitBox(160, faceHeight * 0.82, headWidth * 1.25, faceHeight * 0.54, DECO_ASPECT_RATIOS[0])
    : decoIndex === 5 && (headIndex === 3 || headIndex === 4)
    ? fitBox(160, -headHeight * 0.12, headWidth * 0.72, headHeight * 0.42, DECO_ASPECT_RATIOS[5])
    : decoLayouts[decoIndex] ?? decoLayouts[0];
  const mustacheDeco = decoIndex === 3;
  const eyeLayerDeco = decoIndex === 0 || decoIndex === 4 || decoIndex === 6 || decoIndex === 9;

  return (
    <svg className="citizen-portrait" viewBox="0 0 320 340" aria-labelledby="citizen-portrait-title">
      <title id="citizen-portrait-title">{citizenName} citizen portrait</title>
      <defs>
        <filter id="head-color">
          <feFlood floodColor={headColor} result="tint" />
          <feComposite in="tint" in2="SourceAlpha" operator="in" />
        </filter>
        <filter id="hair-color">
          <feFlood floodColor={hairColor} result="tint" />
          <feComposite in="tint" in2="SourceAlpha" operator="in" />
        </filter>
      </defs>
      <image href={`/40c3-creator/Bodies/Body${bodyIndex}.svg`} x="20" y="238" width="280" height="100" preserveAspectRatio="xMidYMid meet" style={{ filter: `hue-rotate(${COLOR_HUES[bodyColor]}deg)` }} />
      <image href={`/40c3-creator/Heads/Head${headIndex}.svg`} x={headX} y="0" width={headWidth} height={headHeight} preserveAspectRatio="none" style={{ filter: "url(#head-color)" }} />
      {tieDeco && <image href={`/40c3-creator/Deco/Deco${decoIndex}.svg`} {...decoBox} preserveAspectRatio="xMidYMid meet" />}
      <image href={`/40c3-creator/Hair/Hair${hairIndex}.svg`} {...hairBox} preserveAspectRatio="xMidYMid meet" style={{ filter: "url(#hair-color)" }} />
      {!eyeLayerDeco && !tieDeco && !mustacheDeco && <image href={`/40c3-creator/Deco/Deco${decoIndex}.svg`} {...decoBox} preserveAspectRatio="xMidYMid meet" />}
      <image href={`/40c3-creator/Eyes/Eyes${eyeIndex}.svg`} {...eyeBox} preserveAspectRatio="xMidYMid meet" />
      {eyeLayerDeco && <image href={`/40c3-creator/Deco/Deco${decoIndex}.svg`} {...decoBox} preserveAspectRatio="xMidYMid meet" />}
      <image href={`/40c3-creator/Noses/Nose${noseIndex}.svg`} {...noseBox} preserveAspectRatio="xMidYMid meet" />
      <image href={`/40c3-creator/Mouths/Mouth${mouthIndex}.svg`} {...mouthBox} preserveAspectRatio="xMidYMid meet" />
      {mustacheDeco && <image href={`/40c3-creator/Deco/Deco${decoIndex}.svg`} {...decoBox} preserveAspectRatio="xMidYMid meet" />}
    </svg>
  );
}