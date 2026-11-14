import iconSvg from "src/assets/40c3-creator/Logos/Logo.svg?raw";

export function parseLogo(svg: string) {
  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1];
  if (!viewBox) {
    throw new Error("Logo SVG has no viewBox");
  }
  const [, , width, height] = viewBox.split(" ").map(Number);
  const paths = Array.from(svg.matchAll(/\sd="([^"]+)"/g), (match) => match[1]);
  return { width, height, paths };
}

export const LOGO_ICON = parseLogo(iconSvg);
