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
