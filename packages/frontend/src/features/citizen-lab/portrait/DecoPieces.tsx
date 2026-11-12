import { PortraitImage } from "src/features/citizen-lab/portrait/PortraitImage";
import type { DecoPiece } from "src/features/citizen-lab/portrait/decoLayout";

interface DecoPiecesProps {
  href: string;
  pieces: DecoPiece[];
  filter: string | undefined;
}

export function DecoPieces({ href, pieces, filter }: DecoPiecesProps) {
  return pieces.map(({ crop, ...box }) =>
    crop ? (
      <svg key={crop.viewBox} {...box} viewBox={crop.viewBox} preserveAspectRatio={crop.preserveAspectRatio}>
        <image
          href={href}
          x="0"
          y="0"
          width={crop.assetWidth}
          height={crop.assetHeight}
          style={filter ? { filter } : undefined}
        />
      </svg>
    ) : (
      <PortraitImage key={`${box.x},${box.y}`} href={href} box={box} filter={filter} />
    ),
  );
}
