export const CITIZENS = [
  { id: "mona", name: "Mona", typeKey: "pages.citizenLab.figureTypes.unicorn", bodyId: 0, hairId: 0 },
  { id: "barbara", name: "Barbara", typeKey: "pages.citizenLab.figureTypes.abCollective", bodyId: 1, hairId: 1 },
  { id: "bip", name: "bip", typeKey: "pages.citizenLab.figureTypes.minimalist", bodyId: 2, hairId: 2 },
  { id: "adam", name: "Adam", typeKey: "pages.citizenLab.figureTypes.abCollective", bodyId: 3, hairId: 0 },
] as const;

export type CitizenId = (typeof CITIZENS)[number]["id"];

export const TAG_FONTS = [
  { value: "Hack, monospace", label: "Hack", file: "/fonts/Hack-Bold.ttf", weight: 700 },
  { value: "\"Jersey 10\", monospace", label: "Jersey 10", file: "/fonts/jersey-10-latin-400-normal.woff2", weight: 400 },
  { value: "Georgia, serif", label: "Georgia" },
] as const;

export const COLORS = [
  "#75b44b",
  "#15ada3",
  "#9fa4e8",
  "#c892d6",
  "#ee5da2",
  "#ea6f82",
  "#f88a30",
  "#ffbc40",
];

export const HEADS = Array.from({ length: 8 }, (_, assetIndex) => ({
  id: assetIndex,
  number: assetIndex + 1,
}));

export const EYES = [0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11].map((assetIndex) => ({
  id: assetIndex,
  number: assetIndex + 1,
}));

export const NOSES = Array.from({ length: 5 }, (_, assetIndex) => ({
  id: assetIndex,
  number: assetIndex + 1,
}));

export const HAIR = Array.from({ length: 3 }, (_, assetIndex) => ({
  id: assetIndex,
  number: assetIndex + 1,
}));

export const MOUTHS = Array.from({ length: 11 }, (_, assetIndex) => ({
  id: assetIndex,
  number: assetIndex + 1,
}));

export const DECO = Array.from({ length: 11 }, (_, assetIndex) => ({
  id: assetIndex,
  number: assetIndex + 1,
}));

export const FEATURES = [
  { key: "hair", options: HAIR },
  { key: "head", options: HEADS },
  { key: "eyes", options: EYES },
  { key: "nose", options: NOSES },
  { key: "mouth", options: MOUTHS },
  { key: "deco", options: DECO },
] as const;

export type Feature = (typeof FEATURES)[number]["key"];

export function featureOptionId(feature: Feature, position: number): number {
  const options = FEATURES.find(({ key }) => key === feature)?.options ?? FEATURES[0].options;
  return (options[position] ?? options[0]).id;
}

// Deco color value meaning "keep the asset's original color".
export const DECO_DEFAULT_COLOR = "#fffbff";

export const LOGO_STYLES = ["none", "icon", "text"] as const;
export type LogoStyle = (typeof LOGO_STYLES)[number];
export const LOGO_COLORS = [...COLORS, "#ebedf0", "#001300"] as const;
export const TAG_COLORS = [...COLORS, "#ebedf0"] as const;
