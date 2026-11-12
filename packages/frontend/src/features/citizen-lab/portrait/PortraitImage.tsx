import type { Box } from "src/features/citizen-lab/portrait/box";

interface PortraitImageProps {
  href: string;
  box: Box;
  fit?: "none" | "xMidYMid meet";
  filter?: string;
}

export function PortraitImage({
  href,
  box,
  fit = "xMidYMid meet",
  filter,
}: PortraitImageProps) {
  return (
    <image
      href={href}
      x={box.x}
      y={box.y}
      width={box.width}
      height={box.height}
      preserveAspectRatio={fit}
      style={filter ? { filter } : undefined}
    />
  );
}
