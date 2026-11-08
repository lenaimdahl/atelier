import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { CitizenPortrait, type CitizenColors, type CitizenLogo } from "src/components/citizen-maker/CitizenPortrait";
import { DECO, DECO_DEFAULT_COLOR } from "src/pages/citizenMakerOptions";

const NO_LOGO: CitizenLogo = { style: "none", color: "#75b44b" };
const BASE_COLORS: CitizenColors = { body: "#75b44b", head: "#15ada3", hair: "#9fa4e8", deco: "#ee5da2" };

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
  const decoImages = markup.match(new RegExp(`<image href="[^"]*/Deco${decoId}\\.svg"[^>]*>`, "g")) ?? [];
  return decoImages.map((image) => {
    const filterId = image.match(/filter:url\(#([^)]+)\)/)?.[1];
    // Filter ids carry a useId prefix; only the suffix identifies the filter type.
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
    const filterId = markup.match(/Deco6\.svg"[^>]*filter:url\(#([^)]+)\)/)?.[1];
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
    expect(renderWithLogo(NO_LOGO)).not.toContain("/Logos/");
  });

  test("the chosen logo variant is drawn in the chosen color", () => {
    for (const [style, file] of [["icon", "Logo.svg"], ["text", "LogoText.svg"]] as const) {
      const markup = renderWithLogo({ style, color: "#001300" });
      const filterId = markup.match(new RegExp(`/Logos/${file}"[^>]*filter:url\\(#([^)]+)\\)`))?.[1];
      expect(filterId, style).toBeDefined();
      expect(markup).toMatch(new RegExp(`<filter id="${filterId}"><feFlood flood-color="#001300"`));
    }
  });
});
