// Parts are bundled as data URLs so switching a part never waits for the network.
const RAW_ASSETS = import.meta.glob<string>("/src/assets/40c3-creator/**/*.svg", {
  query: "?raw",
  import: "default",
  eager: true,
});

const ASSET_PREFIX = "/src/assets/40c3-creator/";

const ASSET_URLS = new Map(
  Object.entries(RAW_ASSETS).map(([path, svg]) => [
    path.slice(ASSET_PREFIX.length),
    `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
  ]),
);

export function assetUrl(path: string): string {
  return ASSET_URLS.get(path) ?? "";
}

let decoded: Promise<unknown> | null = null;

// Decoding every part once up front means a newly selected part is drawn in the same frame.
export function predecodeAssets() {
  decoded ??= Promise.allSettled(
    [...ASSET_URLS.values()].map((url) => {
      const image = new Image();
      image.src = url;
      return image.decode();
    }),
  );
  return decoded;
}
