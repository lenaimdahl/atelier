import type { CitizenColors, CitizenLogo, CitizenTag } from "src/components/citizen-lab/CitizenPortrait";
import {
  CITIZENS,
  COLORS,
  DECO_COLORS,
  DECO_DEFAULT_COLOR,
  FEATURES,
  HAIR,
  LOGO_COLORS,
  LOGO_STYLES,
  TAG_COLORS,
  TAG_FONTS,
  type CitizenId,
  type Feature,
} from "src/components/citizen-lab/citizenLabOptions";

export const TAG_MAX_LENGTH = 30;

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
  colors: {
    body: COLORS[0],
    head: COLORS[0],
    hair: COLORS[0],
    deco: DECO_DEFAULT_COLOR,
    eyes: COLORS[0],
    nose: COLORS[0],
    mouth: COLORS[0],
  },
  tag: { text: "", fontFamily: TAG_FONTS[0].value, color: COLORS[7] },
  logo: { style: "none", color: LOGO_COLORS[0] },
  hardToClassify: false,
};

// Every shared link depends on this order and these sizes. Never change them, add a new version instead.
const CODE_VERSION = "1";
const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

type Field = {
  size: number;
  read: (design: CitizenDesign) => number;
  write: (design: CitizenDesign, value: number) => void;
};

function featureField(key: Feature, size: number): Field {
  const options = FEATURES.find((feature) => feature.key === key)?.options ?? [];
  return {
    size,
    read: (design) => options[design.features[key]].id,
    write: (design, value) => {
      const position = options.findIndex(({ id }) => id === value);
      if (position >= 0) {
        design.features[key] = position;
      }
    },
  };
}

function listField<T>(list: readonly T[], read: (design: CitizenDesign) => T, write: (design: CitizenDesign, item: T) => void): Field {
  return {
    size: list.length,
    read: (design) => Math.max(0, list.indexOf(read(design))),
    write: (design, value) => write(design, list[value]),
  };
}

function colorField(part: keyof CitizenColors, list: readonly string[]): Field {
  return listField(list, (design) => design.colors[part], (design, color) => (design.colors[part] = color));
}

const FIELDS: Field[] = [
  listField(CITIZENS.map(({ id }) => id), (design) => design.citizenId, (design, id) => (design.citizenId = id)),
  featureField("hair", 3),
  featureField("head", 8),
  featureField("eyes", 12),
  featureField("nose", 5),
  featureField("mouth", 11),
  featureField("deco", 11),
  colorField("body", COLORS),
  colorField("head", COLORS),
  colorField("hair", COLORS),
  colorField("eyes", COLORS),
  colorField("nose", COLORS),
  colorField("mouth", COLORS),
  colorField("deco", DECO_COLORS),
  listField(TAG_FONTS.map(({ value }) => value), (design) => design.tag.fontFamily, (design, font) => (design.tag.fontFamily = font)),
  listField(TAG_COLORS, (design) => design.tag.color, (design, color) => (design.tag.color = color)),
  listField(LOGO_STYLES, (design) => design.logo.style, (design, style) => (design.logo.style = style)),
  listField(LOGO_COLORS, (design) => design.logo.color, (design, color) => (design.logo.color = color)),
  listField([false, true], (design) => design.hardToClassify, (design, odd) => (design.hardToClassify = odd)),
];

export const FIELD_SIZES = FIELDS.map(({ size }) => size);
const CODE_LIMIT = FIELDS.reduce((limit, { size }) => limit * BigInt(size), 1n);

function toBase64Url(text: string) {
  const binary = String.fromCharCode(...new TextEncoder().encode(text));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  const binary = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
}

export function encodeDesign(design: CitizenDesign): string {
  let number = 0n;
  for (const field of FIELDS) {
    number = number * BigInt(field.size) + BigInt(field.read(design));
  }
  let digits = "";
  do {
    digits = BASE62[Number(number % 62n)] + digits;
    number /= 62n;
  } while (number > 0n);
  const tag = design.tag.text.trim();
  return CODE_VERSION + digits + (tag ? `.${toBase64Url(tag)}` : "");
}

export function decodeDesign(code: string): CitizenDesign | null {
  const [digits = "", tag = ""] = code.split(".");
  if (!digits.startsWith(CODE_VERSION) || digits.length === CODE_VERSION.length) {
    return null;
  }
  let number = 0n;
  for (const char of digits.slice(CODE_VERSION.length)) {
    const digit = BASE62.indexOf(char);
    if (digit < 0) {
      return null;
    }
    number = number * 62n + BigInt(digit);
  }
  if (number >= CODE_LIMIT) {
    return null;
  }

  const design = structuredClone(DEFAULT_DESIGN);
  for (const field of [...FIELDS].reverse()) {
    field.write(design, Number(number % BigInt(field.size)));
    number /= BigInt(field.size);
  }
  try {
    design.tag.text = tag ? fromBase64Url(tag).slice(0, TAG_MAX_LENGTH) : "";
  } catch {
    design.tag.text = "";
  }
  return design;
}
