type Size = { width: number; height: number };

export function fitLogo(logo: Size, box: Size) {
  const scale = Math.min(box.width / logo.width, box.height / logo.height) * 0.8;
  return {
    scale,
    x: (box.width - logo.width * scale) / 2,
    y: (box.height - logo.height * scale) / 2,
  };
}
