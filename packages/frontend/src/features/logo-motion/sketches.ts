import { COLORS } from "src/features/40c3/palette";
import { fitLogo, LOGO_ICON, type Sketch } from "src/features/logo-motion/logo";

export const drawOutline: Sketch = (p, container) => {
  p.setup = () => {
    p.createCanvas(container.clientWidth, container.clientHeight);
    const { scale, x, y } = fitLogo(LOGO_ICON, p);
    p.translate(x, y);
    p.scale(scale);

    const context = p.drawingContext as CanvasRenderingContext2D;
    context.strokeStyle = COLORS[0];
    for (const path of LOGO_ICON.paths) {
      context.stroke(new Path2D(path));
    }
  };
};

export const drawAssembly: Sketch = (p, container) => {
  const pieces = LOGO_ICON.paths.map((path) => new Path2D(path));

  p.setup = () => {
    p.createCanvas(container.clientWidth, container.clientHeight);
  };

  p.draw = () => {
    p.clear();
    const { scale, x, y } = fitLogo(LOGO_ICON, p);
    p.translate(x, y);
    p.scale(scale);
    const context = p.drawingContext as CanvasRenderingContext2D;

    context.strokeStyle = "#333333";
    context.lineWidth = 1 / scale;
    for (const piece of pieces) {
      context.stroke(piece);
    }

    const progress = Math.min(p.millis() / 1000, 1);
    const offset = (1 - progress) * -40;

    context.save();
    context.translate(offset, offset);
    context.globalAlpha = progress;
    context.fillStyle = COLORS[0];
    context.fill(pieces[0]);
    context.restore();
  };
};
