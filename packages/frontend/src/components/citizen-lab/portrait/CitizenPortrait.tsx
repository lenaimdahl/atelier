import { useId, type Ref } from "react";
import { DecoPieces } from "src/components/citizen-lab/portrait/DecoPieces";
import { PortraitImage } from "src/components/citizen-lab/portrait/PortraitImage";
import { TintFilter } from "src/components/citizen-lab/portrait/TintFilter";
import { portraitUrls } from "src/components/citizen-lab/portrait/citizenAssets";
import { DECO_DEFAULT_COLOR } from "src/components/citizen-lab/design/citizenLabOptions";
import { CANVAS } from "src/components/citizen-lab/portrait/box";
import type { DecoLayer } from "src/components/citizen-lab/portrait/decoLayout";
import { computePortraitLayout, logoBox, type CitizenSelection } from "src/components/citizen-lab/portrait/citizenLayout";
import type { CitizenColors, CitizenLogo, CitizenTag } from "src/components/citizen-lab/design/citizenTypes";

type CitizenPortraitProps = {
  portraitRef: Ref<SVGSVGElement>;
  citizenName: string;
  selection: CitizenSelection;
  colors: CitizenColors;
  tag: CitizenTag;
  logo: CitizenLogo;
  tilted: boolean;
};

const TILT = `translate(${CANVAS.centerX} ${CANVAS.height / 2}) rotate(-4) scale(1.05) translate(${-CANVAS.centerX} ${-CANVAS.height / 2})`;

const filterUrl = (id: string) => `url(#${id})`;

export function CitizenPortrait({ portraitRef, citizenName, selection, colors, tag, logo, tilted }: CitizenPortraitProps) {
  const layout = computePortraitLayout(selection);
  const urls = portraitUrls(selection, colors, logo);
  const filterPrefix = useId();
  const filterIds = {
    head: `${filterPrefix}head-color`,
    hair: `${filterPrefix}hair-color`,
    decoMultiply: `${filterPrefix}deco-multiply`,
    decoFill: `${filterPrefix}deco-fill`,
    body: `${filterPrefix}body-color`,
    logo: `${filterPrefix}logo-color`,
  };
  const tagText = tag.text.trim();
  const tagNaturalWidth = tagText.length * 6.5;
  const tagScale = Math.min(1, layout.tag.maxWidth / tagNaturalWidth);

  const decoTint = layout.deco?.tint;
  const decoFilter =
    decoTint && decoTint.mode !== "replace" && colors.deco !== DECO_DEFAULT_COLOR
      ? filterUrl(decoTint.mode === "fill" ? filterIds.decoFill : filterIds.decoMultiply)
      : undefined;
  const decoInLayer = (layer: DecoLayer) =>
    layout.deco?.layer === layer ? (
      <DecoPieces
        href={urls.deco}
        pieces={layout.deco.pieces}
        filter={decoFilter}
      />
    ) : null;

  return (
    <svg
      ref={portraitRef}
      className="citizen-portrait"
      viewBox={`0 0 ${CANVAS.width} ${CANVAS.height}`}
      aria-labelledby="citizen-portrait-title"
    >
      <title id="citizen-portrait-title">{citizenName} citizen portrait</title>
      <defs>
        <TintFilter id={filterIds.head} color={colors.head} mode="fill" />
        <TintFilter id={filterIds.hair} color={colors.hair} mode="fill" />
        <TintFilter id={filterIds.decoMultiply} color={colors.deco} mode="multiply" />
        <TintFilter id={filterIds.decoFill} color={colors.deco} mode="fill" />
        <TintFilter id={filterIds.logo} color={logo.color} mode="fill" />
        {layout.body.white && <TintFilter id={filterIds.body} color={colors.body} mode="multiply" />}
      </defs>
      <g transform={tilted ? TILT : undefined}>
        <PortraitImage
          href={urls.body}
          box={layout.body}
          filter={layout.body.white ? filterUrl(filterIds.body) : undefined}
        />
        <PortraitImage href={urls.head} box={layout.head} fit="none" filter={filterUrl(filterIds.head)} />
        {decoInLayer("body")}
        <PortraitImage href={urls.hair} box={layout.hair} fit="none" filter={filterUrl(filterIds.hair)} />
        {decoInLayer("head")}
        <PortraitImage href={urls.eyes} box={layout.eyes} />
        {decoInLayer("eyes")}
        <PortraitImage href={urls.mouth} box={layout.mouth} />
        {decoInLayer("mouth")}
        <PortraitImage href={urls.nose} box={layout.nose} />
        {tagText && (
          <text
            x={layout.tag.x}
            y={layout.tag.y}
            textAnchor="end"
            fill={tag.color}
            fontFamily={tag.fontFamily}
            fontSize={11 * tagScale}
            textLength={tagNaturalWidth * tagScale}
            lengthAdjust="spacingAndGlyphs"
            fontWeight="bold"
          >
            {tagText}
          </text>
        )}
        {logo.style !== "none" && urls.logo && (
          <PortraitImage href={urls.logo} box={logoBox(logo.style)} filter={filterUrl(filterIds.logo)} />
        )}
      </g>
    </svg>
  );
}
