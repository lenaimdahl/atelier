import { CANVAS } from "src/components/citizen-lab/citizenLayout";
import { TAG_FONTS } from "src/components/citizen-lab/citizenLabOptions";

const SVG_NS = "http://www.w3.org/2000/svg";
const PNG_SCALE = 4;

function exportPortrait(portrait: SVGSVGElement) {
  // Hats and hair extend past the canvas, so grow the viewBox to include everything drawn.
  const contentBox = portrait.getBBox();
  const minX = Math.floor(Math.min(0, contentBox.x));
  const minY = Math.floor(Math.min(0, contentBox.y));
  const width = Math.ceil(Math.max(CANVAS.width, contentBox.x + contentBox.width) - minX);
  const height = Math.ceil(Math.max(CANVAS.height, contentBox.y + contentBox.height) - minY);

  const svg = portrait.cloneNode(true) as SVGSVGElement;
  svg.setAttribute("xmlns", SVG_NS);
  svg.setAttribute("viewBox", `${minX} ${minY} ${width} ${height}`);
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));
  return { svg, width, height };
}

function saveBlob(blob: Blob, filename: string) {
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
}

function readAsDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

// An SVG drawn as an image cannot use the page's web fonts, so the tag font is embedded.
async function embedTagFont(svg: SVGSVGElement, fontFamily: string) {
  const font = TAG_FONTS.find(({ value }) => value === fontFamily);
  if (!svg.querySelector("text") || !font || !("file" in font)) {
    return;
  }
  const fontUrl = await readAsDataUrl(await (await fetch(font.file)).blob());
  const style = document.createElementNS(SVG_NS, "style");
  style.textContent = `@font-face { font-family: "${font.label}"; font-weight: ${font.weight}; src: url(${fontUrl}); }`;
  svg.prepend(style);
}

export function downloadCitizenSvg(portrait: SVGSVGElement | null, filename: string) {
  if (!portrait) {
    return;
  }
  const { svg } = exportPortrait(portrait);
  saveBlob(new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml;charset=utf-8" }), filename);
}

export async function downloadCitizenPng(portrait: SVGSVGElement | null, filename: string, tagFontFamily: string) {
  if (!portrait) {
    return;
  }
  const { svg, width, height } = exportPortrait(portrait);
  await embedTagFont(svg, tagFontFamily);

  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;
  await image.decode();

  const canvas = document.createElement("canvas");
  canvas.width = width * PNG_SCALE;
  canvas.height = height * PNG_SCALE;
  canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (blob) {
    saveBlob(blob, filename);
  }
}
