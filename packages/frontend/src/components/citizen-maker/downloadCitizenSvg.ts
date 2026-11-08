import { CANVAS } from "src/components/citizen-maker/citizenLayout";

export function downloadCitizenSvg(portrait: SVGSVGElement | null, filename: string) {
  if (!portrait) {
    return;
  }

  // Hats and hair extend past the canvas, so grow the viewBox to include everything drawn.
  const contentBox = portrait.getBBox();
  const minX = Math.floor(Math.min(0, contentBox.x));
  const minY = Math.floor(Math.min(0, contentBox.y));
  const width = Math.ceil(Math.max(CANVAS.width, contentBox.x + contentBox.width) - minX);
  const height = Math.ceil(Math.max(CANVAS.height, contentBox.y + contentBox.height) - minY);

  const exportedPortrait = portrait.cloneNode(true) as SVGSVGElement;
  exportedPortrait.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  exportedPortrait.setAttribute("viewBox", `${minX} ${minY} ${width} ${height}`);
  exportedPortrait.setAttribute("width", String(width));
  exportedPortrait.setAttribute("height", String(height));

  const blob = new Blob([new XMLSerializer().serializeToString(exportedPortrait)], {
    type: "image/svg+xml;charset=utf-8",
  });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
}