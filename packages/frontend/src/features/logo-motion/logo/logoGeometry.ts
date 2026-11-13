export interface Fit {
  scale: number;
  x: number;
  y: number;
}

export function fit([logoWidth, logoHeight]: [number, number], width: number, height: number, padding: number): Fit {
  const scale = Math.min((width - 2 * padding) / logoWidth, (height - 2 * padding) / logoHeight);
  return {
    scale,
    x: (width - logoWidth * scale) / 2,
    y: (height - logoHeight * scale) / 2,
  };
}
