import iconSvg from "src/assets/40c3-creator/Logos/Logo.svg?raw";

export interface LogoShape {
  viewBox: [number, number];
  paths: string[];
}

export function parseLogo(svg: string): LogoShape {
  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1];
  if (!viewBox) {
    throw new Error("Logo SVG has no viewBox");
  }
  const [, , width, height] = viewBox.split(/\s+/).map(Number);
  const paths = Array.from(svg.matchAll(/\sd="([^"]+)"/g), ([, d]) => d);
  return { viewBox: [width, height], paths };
}

export const LOGO_ICON = parseLogo(iconSvg);
