import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { assetUrl } from "src/components/citizen-lab/citizenAssets";
import { CitizenPortrait, type CitizenColors, type CitizenLogo } from "src/components/citizen-lab/CitizenPortrait";
import { DECO, DECO_DEFAULT_COLOR } from "src/pages/citizenLabOptions";

const NO_LOGO: CitizenLogo = { style: "none", color: "#75b44b" };
const BASE_COLORS: CitizenColors = {
  body: "#75b44b",
  head: "#15ada3",
  hair: "#9fa4e8",
  deco: "#ee5da2",
  eyes: "#c892d6",
  nose: "#ffbc40",
  mouth: "#f88a30",
};

function imagesOf(markup: string, assetPath: string) {
  const hrefs = [undefined, BASE_COLORS.deco].map((color) => `href="${assetUrl(assetPath, color)}"`);
  return (markup.match(/<image [^>]*>/g) ?? []).filter((image) => hrefs.some((href) => image.includes(href)));
}

function decoFilters(decoId: number, decoColor: string) {
  const markup = renderToStaticMarkup(
    <CitizenPortrait
      portraitRef={null}
      citizenName="Test"
      selection={{ bodyId: 0, headId: 2, hairId: 0, eyeId: 0, noseId: 0, mouthId: 0, decoId }}
      colors={{ ...BASE_COLORS, deco: decoColor }}
      tag={{ text: "", fontFamily: "Hack, monospace", color: "#ffbc40" }}
      logo={NO_LOGO}
    />,
  );
  const decoImages = imagesOf(markup, `Deco/Deco${decoId}.svg`);
  return decoImages.map((image) => {
    const filterId = image.match(/filter:url\(#([^)]+)\)/)?.[1];
    return filterId?.replace(/^.*(deco-(?:fill|multiply))$/, "$1");
  });
}

describe("deco recoloring", () => {
  test("white decos are multiplied, black decos are filled", () => {
    expect(decoFilters(2, "#ee5da2")).toEqual(["deco-multiply"]);
    expect(decoFilters(4, "#ee5da2")).toEqual(["deco-multiply"]);
    expect(decoFilters(8, "#ee5da2")).toEqual(["deco-multiply"]);
    expect(decoFilters(6, "#ee5da2")).toEqual(["deco-fill"]);
    expect(decoFilters(9, "#ee5da2")).toEqual(["deco-fill"]);
  });

  test("split decos apply the filter to every cropped piece", () => {
    expect(decoFilters(10, "#ee5da2")).toEqual(["deco-multiply", "deco-multiply"]);
  });

  test("the original color leaves every deco unfiltered", () => {
    for (const { id } of DECO) {
      const filters = decoFilters(id, DECO_DEFAULT_COLOR);
      expect(filters.length, `deco ${id} is drawn`).toBeGreaterThan(0);
      expect(filters.every((filter) => filter === undefined), `deco ${id}`).toBe(true);
    }
  });

  test("multi-colored decos are never filtered", () => {
    for (const id of [0, 1, 3, 5, 7]) {
      expect(decoFilters(id, "#ee5da2").every((filter) => filter === undefined), `deco ${id}`).toBe(true);
    }
  });

  test("the referenced filter is defined with the chosen color", () => {
    const markup = renderToStaticMarkup(
      <CitizenPortrait
        portraitRef={null}
        citizenName="Test"
        selection={{ bodyId: 0, headId: 2, hairId: 0, eyeId: 0, noseId: 0, mouthId: 0, decoId: 6 }}
        colors={BASE_COLORS}
        tag={{ text: "", fontFamily: "Hack, monospace", color: "#ffbc40" }}
        logo={NO_LOGO}
      />,
    );
    const filterId = imagesOf(markup, "Deco/Deco6.svg")[0]?.match(/filter:url\(#([^)]+)\)/)?.[1];
    expect(filterId).toBeDefined();
    expect(markup).toMatch(new RegExp(`<filter id="${filterId}"><feFlood flood-color="#ee5da2"`));
  });
});

describe("40C3 logo", () => {
  function renderWithLogo(logo: CitizenLogo) {
    return renderToStaticMarkup(
      <CitizenPortrait
        portraitRef={null}
        citizenName="Test"
        selection={{ bodyId: 0, headId: 2, hairId: 0, eyeId: 0, noseId: 0, mouthId: 0, decoId: 0 }}
        colors={BASE_COLORS}
        tag={{ text: "", fontFamily: "Hack, monospace", color: "#ffbc40" }}
        logo={logo}
      />,
    );
  }

  test("no logo is drawn by default", () => {
    const markup = renderWithLogo(NO_LOGO);
    expect(imagesOf(markup, "Logos/Logo.svg")).toEqual([]);
    expect(imagesOf(markup, "Logos/LogoText.svg")).toEqual([]);
  });

  test("the chosen logo variant is drawn in the chosen color", () => {
    for (const [style, file] of [["icon", "Logo.svg"], ["text", "LogoText.svg"]] as const) {
      const markup = renderWithLogo({ style, color: "#001300" });
      const filterId = imagesOf(markup, `Logos/${file}`)[0]?.match(/filter:url\(#([^)]+)\)/)?.[1];
      expect(filterId, style).toBeDefined();
      expect(markup).toMatch(new RegExp(`<filter id="${filterId}"><feFlood flood-color="#001300"`));
    }
  });
});

describe("part green", () => {
  function hrefsFor(selection: { mouthId: number; decoId: number; eyeId?: number; noseId?: number }, deco: string) {
    const markup = renderToStaticMarkup(
      <CitizenPortrait
        portraitRef={null}
        citizenName="Test"
        selection={{ bodyId: 0, headId: 2, hairId: 0, eyeId: 0, noseId: 0, ...selection }}
        colors={{ ...BASE_COLORS, deco }}
        tag={{ text: "", fontFamily: "Hack, monospace", color: "#ffbc40" }}
        logo={NO_LOGO}
      />,
    );
    return (markup.match(/<image [^>]*>/g) ?? []).map((image) => image.match(/href="([^"]*)"/)?.[1] ?? "");
  }

  test("eyes, nose and mouth each take their own color", () => {
    const hrefs = hrefsFor({ mouthId: 2, decoId: 0, eyeId: 1, noseId: 3 }, DECO_DEFAULT_COLOR);
    expect(hrefs).toContain(assetUrl("Eyes/Eyes1.svg", BASE_COLORS.eyes));
    expect(hrefs).toContain(assetUrl("Noses/Nose3.svg", BASE_COLORS.nose));
    expect(hrefs).toContain(assetUrl("Mouths/Mouth2.svg", BASE_COLORS.mouth));
    const mouth = decodeURIComponent(assetUrl("Mouths/Mouth2.svg", BASE_COLORS.mouth));
    expect(mouth).toContain(BASE_COLORS.mouth);
    expect(mouth).not.toMatch(/#6ab143/i);
  });

  test("green decos take the deco color and keep their green by default", () => {
    expect(hrefsFor({ mouthId: 0, decoId: 0 }, BASE_COLORS.deco)).toContain(assetUrl("Deco/Deco0.svg", BASE_COLORS.deco));
    expect(hrefsFor({ mouthId: 0, decoId: 0 }, DECO_DEFAULT_COLOR)).toContain(assetUrl("Deco/Deco0.svg"));
  });

  test("parts without green keep their url", () => {
    expect(assetUrl("Mouths/Mouth6.svg", BASE_COLORS.mouth)).toBe(assetUrl("Mouths/Mouth6.svg"));
  });
});
