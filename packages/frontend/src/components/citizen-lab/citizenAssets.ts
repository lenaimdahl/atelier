import { COLORS } from "src/pages/citizenLabOptions";

const RAW_ASSETS = import.meta.glob<string>("/src/assets/40c3-creator/**/*.svg", {
  query: "?raw",
  import: "default",
  eager: true,
});

const ASSET_PREFIX = "/src/assets/40c3-creator/";
const PART_GREEN = /#6ab143/gi;

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

let decoded: Promise<unknown> | null = null;

const GREEN_VARIANTS = [undefined, ...COLORS];

export function predecodeAssets() {
  const urls = new Set([...SVGS.keys()].flatMap((path) => GREEN_VARIANTS.map((color) => assetUrl(path, color))));
  decoded ??= Promise.allSettled(
    [...urls].map((url) => {
      const image = new Image();
      image.src = url;
      return image.decode();
    }),
  );
  return decoded;
}
