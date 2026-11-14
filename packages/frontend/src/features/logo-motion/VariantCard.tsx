import "src/features/logo-motion/VariantCard.css";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useP5Sketch, type Sketch } from "src/features/logo-motion/logo";
import { drawAssembly, drawOutline } from "src/features/logo-motion/sketches";

export interface VariantCardProps {
    variant: "ledWall" | "assembly" | "glitch";
}

const SKETCHES: Record<VariantCardProps["variant"], Sketch> = {
  ledWall: drawOutline,
  assembly: drawAssembly,
  glitch: drawOutline,
};

export const VariantCard = ({ variant }: VariantCardProps) => {
     const { t } = useTranslation();
     const stageRef = useRef<HTMLDivElement>(null);
     useP5Sketch(stageRef, SKETCHES[variant]);
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
