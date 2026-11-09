interface TintFilterProps {
  id: string;
  color: string;
  mode: "fill" | "multiply";
}

export function TintFilter({ id, color, mode }: TintFilterProps) {
  if (mode === "fill") {
    return (
      <filter id={id}>
        <feFlood floodColor={color} result="tint" />
        <feComposite in="tint" in2="SourceAlpha" operator="in" />
      </filter>
    );
  }
  return (
    <filter id={id} colorInterpolationFilters="sRGB">
      <feFlood floodColor={color} result="tint" />
      <feBlend in="SourceGraphic" in2="tint" mode="multiply" result="tinted" />
      <feComposite in="tinted" in2="SourceAlpha" operator="in" />
    </filter>
  );
}
