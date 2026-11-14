import "src/features/logo-motion/VariantCard.css";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { fitLogo } from "src/features/logo-motion/logo/logoGeometry";
import { LOGO_ICON } from "src/features/logo-motion/logo/logoPath";
import { useP5Sketch, type Sketch } from "src/features/logo-motion/useP5Sketch";
import { COLORS } from "src/features/40c3/palette";

const drawLogo: Sketch = (p, container) => {
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

export interface VariantCardProps {
    variant: "ledWall" | "assembly" | "glitch";
}

export const VariantCard = ({ variant }: VariantCardProps) => {
     const { t } = useTranslation();
     const stageRef = useRef<HTMLDivElement>(null);
     useP5Sketch(stageRef, drawLogo);
    return (
        <li key={variant} className="logo-motion-card">
          <div ref={stageRef} className="logo-motion-stage" />
            <div className="logo-motion-card-text">
              <h2>{t(`pages.logoMotion.variants.${variant}.title`)}</h2>
              <p>{t(`pages.logoMotion.variants.${variant}.description`)}</p>
            </div>
        </li>
    )
}
