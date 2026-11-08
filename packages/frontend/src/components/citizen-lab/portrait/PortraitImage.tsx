import type { Box } from "src/components/citizen-lab/portrait/box";

export function PortraitImage({
  href,
  box,
  fit = "xMidYMid meet",
  filter,
}: {
  href: string;
  box: Box;
  fit?: "none" | "xMidYMid meet";
  filter?: string;
}) {
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
