export async function downloadCitizenSvg(portrait: SVGSVGElement | null, filename: string) {
  if (!portrait) {
    return;
  }

  // Hats, hair and ears can extend past the 320x340 canvas (the page shows them via overflow: visible),
  // so grow the exported viewBox to include everything that is drawn.
  const contentBox = portrait.getBBox();
  const minX = Math.floor(Math.min(0, contentBox.x));
  const minY = Math.floor(Math.min(0, contentBox.y));
  const width = Math.ceil(Math.max(320, contentBox.x + contentBox.width) - minX);
  const height = Math.ceil(Math.max(340, contentBox.y + contentBox.height) - minY);

  const exportedPortrait = portrait.cloneNode(true) as SVGSVGElement;
  exportedPortrait.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  exportedPortrait.setAttribute("viewBox", `${minX} ${minY} ${width} ${height}`);
  exportedPortrait.setAttribute("width", String(width));
  exportedPortrait.setAttribute("height", String(height));

  await Promise.all(
    Array.from(exportedPortrait.querySelectorAll("image")).map(async (image) => {
      const source = image.getAttribute("href");
      if (!source || source.startsWith("data:")) {
        return;
      }

      const response = await fetch(new URL(source, window.location.href));
      const asset = await response.text();
      image.setAttribute("href", `data:image/svg+xml;charset=utf-8,${encodeURIComponent(asset)}`);
    }),
  );

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