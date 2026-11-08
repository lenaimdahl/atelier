export const CITIZENS = [
  { id: "mona", name: "Mona", typeKey: "pages.citizenMaker.figureTypes.unicorn", bodyId: 0, hairId: 0 },
  { id: "barbara", name: "Barbara", typeKey: "pages.citizenMaker.figureTypes.shapeShifter", bodyId: 1, hairId: 1 },
  { id: "bip", name: "bip", typeKey: "pages.citizenMaker.figureTypes.minimalist", bodyId: 2, hairId: 2 },
  { id: "adam", name: "Adam", typeKey: "pages.citizenMaker.figureTypes.freeSpirit", bodyId: 3, hairId: 0 },
] as const;

export type CitizenId = (typeof CITIZENS)[number]["id"];

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

export const COLOR_HUES: Record<string, number> = {
  "#75b44b": -4,
  "#15ada3": 82,
  "#9fa4e8": 143,
  "#c892d6": -165,
  "#ee5da2": -125,
  "#ea6f82": -108,
  "#f88a30": -72,
  "#ffbc40": -59,
};