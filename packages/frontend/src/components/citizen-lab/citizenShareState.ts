import type { CitizenColors, CitizenLogo, CitizenTag } from "src/components/citizen-lab/CitizenPortrait";
import {
  CITIZENS,
  COLORS,
  DECO_DEFAULT_COLOR,
  FEATURES,
  HAIR,
  LOGO_COLORS,
  LOGO_STYLES,
  TAG_FONTS,
  type CitizenId,
  type Feature,
} from "src/pages/citizenLabOptions";

export const TAG_MAX_LENGTH = 20;

export type CitizenDesign = {
  citizenId: CitizenId;
  features: Record<Feature, number>;
  colors: CitizenColors;
  tag: CitizenTag;
  logo: CitizenLogo;
  hardToClassify: boolean;
};

type Citizen = (typeof CITIZENS)[number];

export function hairPositionFor(citizen: Citizen) {
  return Math.max(0, HAIR.findIndex((hair) => hair.id === citizen.hairId));
}

export const DEFAULT_DESIGN: CitizenDesign = {
  citizenId: CITIZENS[0].id,
  features: { head: 0, eyes: 0, nose: 4, hair: hairPositionFor(CITIZENS[0]), mouth: 1, deco: 0 },
  colors: { body: COLORS[0], head: COLORS[0], hair: COLORS[0], deco: DECO_DEFAULT_COLOR },
  tag: { text: "", fontFamily: TAG_FONTS[0].value, color: "#ffbc40" },
  logo: { style: "none", color: LOGO_COLORS[0] },
  hardToClassify: false,
};

const COLOR_PARAMS = { body: "bodyColor", head: "headColor", hair: "hairColor", deco: "decoColor" } as const;
const DECO_COLORS: readonly string[] = [DECO_DEFAULT_COLOR, ...COLORS];

// "#" would start the URL fragment, so colors are stored without it.
const toParamColor = (color: string) => color.replace(/^#/, "");
const fromParamColor = (value: string | null, allowed: readonly string[]) => {
  const color = value ? `#${value.toLowerCase()}` : null;
  return color && allowed.includes(color) ? color : null;
};

export function designToSearchParams(design: CitizenDesign): URLSearchParams {
  const params = new URLSearchParams();
  const setIfChanged = (key: string, value: string, defaultValue: string) => {
    if (value !== defaultValue) params.set(key, value);
  };

  const citizen = CITIZENS.find(({ id }) => id === design.citizenId) ?? CITIZENS[0];
  setIfChanged("citizen", design.citizenId, DEFAULT_DESIGN.citizenId);
  for (const { key, options } of FEATURES) {
    const defaultPosition = key === "hair" ? hairPositionFor(citizen) : DEFAULT_DESIGN.features[key];
    // Asset ids, not positions, so links survive reordering of the option lists.
    setIfChanged(key, String(options[design.features[key]].id), String(options[defaultPosition].id));
  }
  for (const part of Object.keys(COLOR_PARAMS) as (keyof CitizenColors)[]) {
    setIfChanged(COLOR_PARAMS[part], toParamColor(design.colors[part]), toParamColor(DEFAULT_DESIGN.colors[part]));
  }
  setIfChanged("tag", design.tag.text, DEFAULT_DESIGN.tag.text);
  setIfChanged("font", String(TAG_FONTS.findIndex(({ value }) => value === design.tag.fontFamily)), "0");
  setIfChanged("tagColor", toParamColor(design.tag.color), toParamColor(DEFAULT_DESIGN.tag.color));
  setIfChanged("logo", design.logo.style, DEFAULT_DESIGN.logo.style);
  setIfChanged("logoColor", toParamColor(design.logo.color), toParamColor(DEFAULT_DESIGN.logo.color));
  if (design.hardToClassify) params.set("odd", "1");
  return params;
}

export function designFromSearchParams(params: URLSearchParams): CitizenDesign {
  const citizen = CITIZENS.find(({ id }) => id === params.get("citizen")) ?? CITIZENS[0];

  const features = { ...DEFAULT_DESIGN.features, hair: hairPositionFor(citizen) };
  for (const { key, options } of FEATURES) {
    const value = params.get(key);
    const position = value === null ? -1 : options.findIndex(({ id }) => String(id) === value);
    if (position >= 0) features[key] = position;
  }

  const colors = { ...DEFAULT_DESIGN.colors };
  for (const part of Object.keys(COLOR_PARAMS) as (keyof CitizenColors)[]) {
    colors[part] = fromParamColor(params.get(COLOR_PARAMS[part]), part === "deco" ? DECO_COLORS : COLORS) ?? colors[part];
  }

  const font = TAG_FONTS[Number(params.get("font") ?? 0)] ?? TAG_FONTS[0];
  return {
    citizenId: citizen.id,
    features,
    colors,
    tag: {
      text: (params.get("tag") ?? "").slice(0, TAG_MAX_LENGTH),
      fontFamily: font.value,
      color: fromParamColor(params.get("tagColor"), COLORS) ?? DEFAULT_DESIGN.tag.color,
    },
    logo: {
      style: LOGO_STYLES.find((style) => style === params.get("logo")) ?? DEFAULT_DESIGN.logo.style,
      color: fromParamColor(params.get("logoColor"), LOGO_COLORS) ?? DEFAULT_DESIGN.logo.color,
    },
    hardToClassify: params.get("odd") === "1",
  };
}
