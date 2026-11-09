import type { CitizenColors, CitizenLogo } from "src/components/citizen-lab/design/citizenTypes";
import { computePortraitLayout, type CitizenSelection } from "src/components/citizen-lab/portrait/citizenLayout";
import { ASSET_PART_GREEN, COLORS, DECO_DEFAULT_COLOR } from "src/components/citizen-lab/design/citizenLabOptions";

const RAW_ASSETS = import.meta.glob<string>("/src/assets/40c3-creator/**/*.svg", {
  query: "?raw",
  import: "default",
  eager: true,
});

const ASSET_PREFIX = "/src/assets/40c3-creator/";
const PART_GREEN = new RegExp(ASSET_PART_GREEN, "gi");

const SVGS = new Map(Object.entries(RAW_ASSETS).map(([path, svg]) => [path.slice(ASSET_PREFIX.length), svg]));
const URLS = new Map<string, string>();

const toDataUrl = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

export function hasPartGreen(path: string): boolean {
  return (SVGS.get(path) ?? "").search(PART_GREEN) >= 0;
}

export function assetUrl(path: string, greenReplacement?: string): string {
  const svg = SVGS.get(path);
  if (svg === undefined) {
    return "";
  }
  const recolor = greenReplacement !== undefined && hasPartGreen(path);
  const key = recolor ? `${path}|${greenReplacement}` : path;
  let url = URLS.get(key);
  if (url === undefined) {
    url = toDataUrl(recolor ? svg.replace(PART_GREEN, greenReplacement) : svg);
    URLS.set(key, url);
  }
  return url;
}

const IMAGES = new Map<string, HTMLImageElement>();

export function decodeAsset(url: string): Promise<void> {
  let image = IMAGES.get(url);
  if (image === undefined) {
    image = new Image();
    image.src = url;
    IMAGES.set(url, image);
  }
  return image.decode().catch(() => undefined);
}

export function predecodeAssets() {
  return Promise.all([...SVGS.keys()].map((path) => decodeAsset(assetUrl(path))));
}

export function portraitUrls(selection: CitizenSelection, colors: CitizenColors, logo: CitizenLogo) {
  const layout = computePortraitLayout(selection);
  // The picker hides COLORS[0] for green decos, so it is drawn as the original green.
  const decoReplace =
    layout.deco?.tint?.mode === "replace" && colors.deco !== DECO_DEFAULT_COLOR && colors.deco !== COLORS[0];
  return {
    body: assetUrl(`Bodies/Body${selection.bodyId}.svg`, layout.body.white ? undefined : colors.body),
    head: assetUrl(`Heads/Head${selection.headId}.svg`),
    hair: assetUrl(`Hair/Hair${selection.hairId}.svg`),
    eyes: assetUrl(`Eyes/Eyes${selection.eyeId}.svg`, colors.eyes),
    mouth: assetUrl(`Mouths/Mouth${selection.mouthId}.svg`, colors.mouth),
    nose: assetUrl(`Noses/Nose${selection.noseId}.svg`, colors.nose),
    deco: assetUrl(`Deco/Deco${selection.decoId}.svg`, decoReplace ? colors.deco : undefined),
    logo: logo.style === "none" ? null : assetUrl(`Logos/${logo.style === "text" ? "LogoText" : "Logo"}.svg`),
  };
}
