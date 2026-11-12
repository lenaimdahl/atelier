import "src/features/logo-motion/VariantCard.css";
import { useTranslation } from "react-i18next";


export interface VariantCardProps {
    variant: "ledWall" | "assembly" | "glitch";
}

export const VariantCard = ({ variant }: VariantCardProps) => {
     const { t } = useTranslation();
    return (
        <li key={variant} className="logo-motion-card">
          <div className="logo-motion-stage" />
            <div className="logo-motion-card-text">
              <h2>{t(`pages.logoMotion.variants.${variant}.title`)}</h2>
              <p>{t(`pages.logoMotion.variants.${variant}.description`)}</p>
            </div>
        </li>
    )
}