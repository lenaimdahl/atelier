export type HeadGeometry = {
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

export type BodyGeometry = {
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

export const NOSE_SIZE: Record<number, { width: number; height: number }> = {
  2: { width: 0.125, height: 0.24 },
};
export const DEFAULT_NOSE_SIZE = { width: 0.1, height: 0.2 };
