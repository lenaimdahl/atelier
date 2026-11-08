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

const firstIds = (count: number) => Array.from({ length: count }, (_, id) => id);
const toOptions = (ids: readonly number[]) => ids.map((id) => ({ id, number: id + 1 }));

export const HEADS = toOptions(firstIds(8));
export const EYES = toOptions([0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11]);
export const NOSES = toOptions(firstIds(5));
export const HAIR = toOptions(firstIds(3));
export const MOUTHS = toOptions(firstIds(11));
export const DECO = toOptions(firstIds(11));

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

export const DECO_DEFAULT_COLOR = "#fffbff";

export const ASSET_PART_GREEN = "#6ab143";

export const DECO_COLORS: readonly string[] = [DECO_DEFAULT_COLOR, ...COLORS];

export const LOGO_STYLES = ["none", "icon", "text"] as const;
export type LogoStyle = (typeof LOGO_STYLES)[number];
export const LOGO_COLORS = [...COLORS, "#ebedf0", "#001300"] as const;
export const TAG_COLORS = [...COLORS, "#ebedf0"] as const;
